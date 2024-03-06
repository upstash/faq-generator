import React from "react";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { useToast } from "components/ui/use-toast";
import useData from "hooks/use-data";
import copy from "copy-to-clipboard";
import { convertToMarkdown } from "lib/utils";

export default function Home() {
  const { setUrl, faq, loading, error, inputHandler } = useData();
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    const markdown = convertToMarkdown(faq);
    copy(markdown);
    toast({
      title: "Copied to clipboard.",
    });
  };

  return (
    <main className="p-6">
      <h1>FAQ GENERATOR</h1>

      <div className="search">
        <Textarea
          onChange={(e) => setUrl(e.target.value)}
          rows={5}
          title="Insert GitHub file links (one per line) and press the button to generate FAQ"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button onClick={inputHandler}>Generate</Button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {faq.length > 0 && (
        <>
          <Button onClick={handleCopyToClipboard}>Copy to Clipboard</Button>

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
