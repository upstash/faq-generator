import { useState } from "react";

export default function useData() {
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

  return {
    setUrl,
    faq,
    loading,
    error,
    inputHandler,
  };
}
