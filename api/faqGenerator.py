import json
import os
import re
import redis
import ssl
import requests
from openai import OpenAI
from github import Github
from urllib.parse import urlparse
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor

load_dotenv()  # load environment variables

client = OpenAI()  # initiliaze openai api
 
# initialize github api
GITHUB_ACCESS_TOKEN = os.getenv("GITHUB_ACCESS_TOKEN") 
GITHUB = Github(GITHUB_ACCESS_TOKEN)
GITHUB_API_BASE = "https://api.github.com/repos/"

# initialize database variables
UPSTASH_ENDPOINT = os.getenv("UPSTASH_ENDPOINT")  
UPSTASH_PORT = int(os.getenv("UPSTASH_PORT"))
UPSTASH_PASSWORD = os.getenv("UPSTASH_PASSWORD")

# initiliaze upstash connection
upstash = redis.Redis(
    host=UPSTASH_ENDPOINT,
    port=UPSTASH_PORT,
    password=UPSTASH_PASSWORD,
    ssl=True,
    ssl_cert_reqs=ssl.CERT_NONE
)

# initialize rate limiting variables
RATE_LIMIT_WINDOW = 60  # Time window in seconds
RATE_LIMIT_MAX_REQUESTS = 10  # Maximum number of requests allowed per window


def main(urls):    
    contents = get_contents(urls,GITHUB_ACCESS_TOKEN)
    if contents == -1:
        return -1
    
    return generate_faq_multithreaded(contents)

# parse the repo link into username and repo name parts
# then create repo identifier and file path
def parse_github_url(repository_url):
    parsed_url = urlparse(repository_url)
    path_components = parsed_url.path.strip('/').split('/')    
    blob_index = path_components.index('blob') if 'blob' in path_components else -1
    
    if blob_index != -1:
        repo_identifier = f"{path_components[0]}/{path_components[1]}"
        file_path = '/'.join(path_components[blob_index + 2:])
        return repo_identifier, file_path
    
    else:
        return None, None  # 'blob' not found in URL, return None
   
# get the latest commit id of the file    
def get_latest_commit_id(url):
    repo_identifier, file_path = parse_github_url(url)
    repo = GITHUB.get_repo(repo_identifier)
    commits = repo.get_commits(path=file_path)[0]
    return commits.sha

# check if the user has exceeded the predetermined rate limit
def rate_limit_exceeded(user_id):
    rate_limit_key = f"rate_limit:{user_id}"
    request_count = upstash.get(rate_limit_key)
    
    if request_count is None:
        upstash.set(rate_limit_key, 1, ex = RATE_LIMIT_WINDOW)
        return False
    
    elif int(request_count) < RATE_LIMIT_MAX_REQUESTS:
        upstash.incr(rate_limit_key)        
        return False
    
    else:
        return True

# get the contents of the markdown files
# and return them as a list
def get_contents(url_list, github_token = GITHUB_ACCESS_TOKEN):
    contents = []
    content_info = []
    headers = {"Authorization": f"token {github_token}"}
    
    for url in url_list:
        content_info.append(url)
        current_content = get_markdown_content(url, headers)
        if current_content == -1:
            return -1
        
        content_info.append(current_content)
        contents.append(content_info)
        content_info = []
          
    return contents

# helper function to extract the info from json responses
def get_markdown_content(file_url, headers):
    try:
        response = requests.get(file_url, headers)
        response.raise_for_status()

        if response.status_code == 200:

            if file_url.endswith('.md'):
                response_text = response.text
                data = json.loads(response_text)
                rich_text = data['payload']['blob']['richText']
                return rich_text
                            
            elif file_url.endswith('.mdx'):
                json_data = response.json()
                raw_lines = json_data["payload"]["blob"]["rawLines"]
                text = "\n".join(raw_lines)
                return text
    
            else:
                return -1
        
    except requests.exceptions.RequestException as e:
        return -1

# function to chat with the openai api
def chat(prompt,questions=""):
    message_history = []
    
    if questions != "":
        
        message_history.append({"role": "assistant", "content": "Generated FAQ and their answers are :\n"})
        message_history.append({"role": "assistant", "content": questions})
    
    message_history.append({"role": "user", "content": prompt})
    
    response = client.chat.completions.create(
        model = "gpt-3.5-turbo-0125",
        messages = message_history
    )
    return response

# function to generate FAQ for a single file
def process_file(file,index):
    faqs = []
    url = file[0]
    content = file[1]
    number_of_questions = 5
    
    if content is None:
        return []   
    
    # if file is in database and up to date, return directly stored faq
    # enumaration is done here, in order to keep it consistent
    if is_up_to_date(url):
        stored_faq = get_faq(url)        
        for i,faq in enumerate(stored_faq):
            question_number = faq[0].split('.')[0]
            updated_question = faq[0].replace(question_number, f"Q{index}")
            stored_faq[i][0] = updated_question
            index += 1
        
        return stored_faq
    
    prompt = (
        f"Generate {number_of_questions} frequently asked questions (FAQ) for the following content."        
        f"First, read the content and choose a question that you think users may ask frequently, consider the parts where users may struggle to understand the content and require assistance. Detect the most complex and complicated sections."
        f"Then, rewrite the question you've chosen first as a title and after writing the question as a title, under that title, provide the answer to the question."
        f"Afterwards, repeat the same process for all generated questions one by one, rewriting the question first then answering the question under the question."
        f"I want these question and answer paragraphs enumerated, starting from {index} to {index + number_of_questions - 1}"
        f"Questions must start with Q letter"
        f"For example:\n"
        f"Q{index}. How to write prompts?\n"
        f"In order to write prompts, you need to ....\n"
        f"{index + 4}. How to edit a written prompt?\n"
        f"Editing a prompt is easy, you need to.....\n"
        f"Content :\n{content}"
    )
    response = chat(prompt)
    faq = response.choices[0].message.content
    string_to_list(faq, faqs)
    store_faq(url, faq)
    return faqs

# function to generate FAQ for multiple files by using multithreading
def generate_faq_multithreaded(md_files):
    faqs = []
    index = 1
    number_of_questions = 5

    with ThreadPoolExecutor() as executor:
        futures = []
        for file in md_files:
            future = executor.submit(process_file, file, index)
            futures.append(future)
            index += number_of_questions
            
        for future in futures:
            faqs.extend(future.result())
    return faqs

# stores the chosen faq in database
def store_faq(url,chosen_faq):
    last_commit = get_latest_commit_id(url)
    value = (chosen_faq,last_commit)
    json_value = json.dumps(value)
    upstash.set(url, json_value)

# checks if the file is in database
def is_file_in_database(url):
    return upstash.exists(url)

# compares latest commit id and checks if the repo is updated
def is_up_to_date(url):
    if not is_file_in_database(url):
        return False
    
    json_value = upstash.get(url)
    _, stored_last_commit = json.loads(json_value)
    current_commit = get_latest_commit_id(url)
    return current_commit == stored_last_commit

# returns stored faq from the database
def get_faq(url):
    json_value = upstash.get(url)
    stored_faq, _ = json.loads(json_value)
    return string_to_list(stored_faq,[])

# function to convert string to list
# used for formatting the chatgpt response
def string_to_list(faq,list):
    faq_items = faq.split("\n")

    for item in faq_items:
        if re.match(r'^Q\d', item):  # Check if item starts with a digit
            break
        faq_items.remove(item)
    
    for index in range(len(faq_items)):
        item = faq_items[index]
        temp = []
        
        if (not (item.isspace() or item == "")) and re.match(r'^Q\d', item):
            temp.append(item)
            answer = []
            
            while index < len(faq_items) - 1 and not re.match(r'^Q\d', faq_items[index + 1]):
                answer.append(faq_items[index + 1])
                index += 1
                
            answer = " ".join(answer)
            temp.append(answer)
            list.append(temp)
    
    return list