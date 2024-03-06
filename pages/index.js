import React, { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputHandler = async () => {
    try {
      setLoading(true);
      setError("");
      setFaq([]);

      const urls = url.split("\n").filter((link) => link.trim() !== "");
      const response = await fetch("/api/generate-faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls: urls }), // Send the urls array as part of a JSON object
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setFaq(data.faq);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        "An error occurred while fetching FAQs. Please check the URLs and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const convertToMarkdown = (faq) => {
    let markdown = "";
    faq.forEach((item, index) => {
      if (item[0].match(/[0-9]/)) {
        markdown += `### ${item}\n\n`;
      } else {
        markdown += `${item}\n\n`;
      }
    });
    return markdown;
  };

  const handleCopyToClipboard = () => {
    const markdown = convertToMarkdown(faq);
    navigator.clipboard.writeText(markdown);
  };

  return (
    <main className="">
      <h1>FAQ GENERATOR</h1>

      <div className="search">
        <textarea
          id="outlined-basic"
          onChange={(e) => setUrl(e.target.value)}
          rows={5}
          title="Insert GitHub file links (one per line) and press the button to generate FAQ"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={inputHandler}>Generate</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {faq.length > 0 && (
        <>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleCopyToClipboard}
            style={{ marginTop: "10px" }}
          >
            Copy to Clipboard
          </Button>

          <ul>
            {faq.map((item, index) => (
              <li
                key={index}
                style={{
                  marginBottom: item[0].match(/[0-9]/) ? "0px" : "30px",
                  fontWeight: item[0].match(/[0-9]/) ? "bold" : "normal",
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
