import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";

export default function App() {
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
      setFaq(data.faq);
    } catch (error) {
      console.error("Error:", error);
      setError(
        "An error occurred while fetching FAQs. Please check the URLs and try again."
      );
    } finally {
      setLoading(false);
    }
  };  
  return (
    <div className="main">
      <h1>FAQ GENERATOR</h1>
      <div className="search">
        <TextField
          id="outlined-basic"
          multiline
          onChange={(e) => setUrl(e.target.value)}
          variant="filled"
          fullWidth
          label="Insert GitHub file links (one per line) and press the button to generate FAQ"
        />
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={inputHandler}
        style={{ marginLeft: "465px", marginTop: "-20px" }}
      >
        Generate
      </Button>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
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
    </div>
  );
}
