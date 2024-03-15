# Table of Contents
- [Table of Contents](#table-of-contents)
- [FAQ Generator](#faq-generator)
  - [Features](#features)
  - [Installation](#installation)
  - [How to use the FAQ Generator?](#how-to-use-the-faq-generator)
  - [OpenAI Integration](#openai-integration)
  - [Caching](#caching)
  - [Deployment](#deployment)
  - [Conclusion](#conclusion)


# FAQ Generator

The FAQ Generator is a tool designed to generate frequently asked questions (FAQs) from Markdown files stored in GitHub repositories. It leverages the power of OpenAI's GPT models to analyze the content of Markdown files and automatically generate questions and answers based on that content. The tool aims to reduce the workload of developers and make life easier for them.

<a class="inline-flex hover:bg-transparent" href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Ffaq-generator&amp;env=UPSTASH_ENDPOINT,UPSTASH_PASSWORD,UPSTASH_PORT,OPENAI_API_KEY,GITHUB_ACCESS_TOKEN&amp;demo-title=FAQ%20Generator&amp;demo-description=The%20FAQ%20Generator%20uses%20OpenAI's%20GPT%20models%20to%20create%20FAQs%20from%20Markdown%20files%20on%20GitHub.&amp;demo-url=https%3A%2F%2Ffaq-gen.vercel.app"><img src="https://vercel.com/button" alt="Deploy with Vercel"></a>

[The Demo App](https://faq-gen.vercel.app)

https://github.com/upstash/faq-generator/assets/234086/c7359e19-6d17-433b-902c-f1a2eaa09090

## Features

- Automatically generates FAQs from Markdown files.
- Supports multiple Markdown files from different GitHub repositories.
- Utilizes multithreading for efficient processing.
- Implements rate limiting to prevent abuse of API resources.
- Provides a user-friendly web interface for input and output.

## Installation

If you want to examine the source code or change some things according to your needs, you can install it by following these steps:

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/upstash/faq-generator 
   ```

2. Navigate to the project folder:
   ```bash
   cd faq-generator
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Now you need to set up environment variables by creating a .env file in the project root directory and adding the following variables:
  
  - GITHUB_ACCESS_TOKEN
  - UPSTASH_ENDPOINT
  - UPSTASH_PORT
  - UPSTASH_PASSWORD 
  - OPENAI_API_KEY
  
   
   To set these variables, you need to have an account on [Upstash](https://console.upstash.com/login) and [OpenAI](https://auth0.openai.com/u/login/identifier?state=hKFo2SBJY3lhbWZGVmg1QU8zc0xYTi1TWEtKa1dWaTkwNUFGT6Fur3VuaXZlcnNhbC1sb2dpbqN0aWTZIEZhcUp2V0hkTUZlRm15aEZIX0lCNVV6NmdvaDZ3UXNio2NpZNkgRFJpdnNubTJNdTQyVDNLT3BxZHR3QjNOWXZpSFl6d0Q). After signing in to Upstash, you need to create a database. You should enable TLS while creating your database, other than that you can proceed with default settings, they are perfectly fine for our purposes. We will use this database to store generated FAQs.

  Then, you need to log in to your OpenAI account and create an API key. The use of API isn't free, but OpenAI lets you use the API until you reach a certain amount (For today, the limit is 5 dollars. But I suggest you check it for possible changes). Once you have your API key, the only remaining variable is the GitHub token. You can generate one by navigating through developer settings. The token must access all fields related to repository actions, so don't forget the give necessary permissions while generating your token.


5. As the last step, you can run the program on your local machine by entering this command into your console:
   ```bash
   npm run dev
   ```
   You can access the interface by navigating to http://localhost:3000 in your web browser.

## How to use the FAQ Generator?

The tool has a very simple interface. It has a search bar where the user enters the URLs and a generate button that initiates the backend process. Once the FAQs are generated, they will be displayed on the page. The user can copy the FAQs to the clipboard, in a markdown format.

## OpenAI Integration
The main logic behind the idea of this tool and why developers would use it revolves around automating the process of generating FAQs from Markdown files hosted on GitHub repositories. To automate this process, we will use OpenAI's API.

The OpenAI API provides a chat-based interface, allowing developers to interact with language models to generate human-like responses. In this project, we provide the contents of Markdown files as input, and the API processes them. At first, it understands the content, then tries to detect the parts where users may struggle to understand the content and require assistance. Based on them, the API generates five FAQs for every single file.

When a user provides multiple URLs as a single input, the application processes each URL concurrently, leveraging multithreading. This means that instead of handling each URL sequentially, where one URL is processed after the other, the application initiates the processing of multiple URLs simultaneously. As a result of parallel processing, the overall time required to process all the URLs is significantly reduced.

## Caching

The generated FAQs, along with their associated metadata (such as the latest commit ID), are cached in Upstash. This caching mechanism enables quick retrieval of previously generated FAQs for specific URLs without the need to regenerate them every time. By storing FAQs in Upstash, the application reduces the overhead of repetitive computations and improves response times when users request FAQs for URLs that have been previously processed.

Upstash is also used to implement rate-limiting functionality, which restricts the number of requests a user can make within a specified time window. By storing rate-limiting information in Upstash, the application can efficiently track the number of requests made by each user and enforce rate limits accordingly. This helps prevent abuse or excessive usage of the application's resources, ensuring fair access for all users and maintaining system stability.

## Deployment

We hosted our application on Vercel. It can be hosted anywhere that supports Next.js frontend and Flask backend. If you also want to use [Vercel](https://vercel.com/login), you'll need to create an account and follow these steps:

1. Install the Vercel Command Line Interface (CLI) tool globally on your machine using npm or yarn. This CLI tool allows you to deploy projects directly from your terminal.
   ```bash
   npm install -g vercel
   # or
   yarn global add vercel
   ```

2. Once the CLI is installed, log in to your Vercel account from the terminal using the following command:
   ```bash
   vercel login
   ```
3. Then, you can initialize your project. Navigate to your project directory and use the following command:
   ```bash
   vercel init
   ```
   This command will prompt you to link your project directory to a Vercel project. Follow the prompts to select your project and configure deployment settings.

4. Once the project is initialized, you can deploy it to Vercel. This command will start the deployment process and upload your project files to Vercel's servers. Once the deployment is complete, Vercel will provide you with a unique URL where your application is hosted.
   ```bash
   vercel --prod
   ```

As you can see, hosting your website on Vercel is a straightforward process. Even though Vercel originally offers frontend hosting servers,  its support for serverless functions enables you to effortlessly host your backend as well. Additionally, Vercel offers templates that serve as excellent starting points for your projects. In this project, I used [nextjs&flask template](https://vercel.com/templates/next.js/nextjs-flask-starter). You can find other templates on the resources page of the Vercel site.

## Conclusion

In conclusion, the FAQ Generator tool provides a seamless solution for automatically generating frequently asked questions from markdown files. With its ability to process multiple URLs in parallel, integrate with Upstash for data storage, and deploy effortlessly on Vercel, the FAQ Generator simplifies the process of FAQ generation and enhances developer productivity. Additionally, this project is open to contributions from the community. If you have ideas for improvements, additional features, or bug fixes, feel free to contribute to the GitHub repository. Your contributions are valuable and can help make the FAQ Generator even more robust and useful for developers.
