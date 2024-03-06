import React, { useEffect, useState } from "react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useToast } from "components/ui/use-toast";
import copy from "copy-to-clipboard";
import { convertToMarkdown } from "lib/utils";
import { Plus, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  links: z.array(
    z.object({
      url: z.string().url(),
    }),
  ),
});

type Schema = z.infer<typeof schema>;

export default function Home() {
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [faq, setFaq] = useState<string[]>([]);

  const { control, register, handleSubmit } = useForm<Schema>({
    resolver: zodResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  useEffect(() => {
    append({ url: "" });
  }, []);

  const onSubmit = async (data: Schema) => {
    try {
      setLoading(true);
      setError("");
      setFaq([]);

      const urls = data.links.map((item) => item.url);

      const response = await fetch("/api/generate-faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        throw new Error(
          "An error occurred while fetching FAQs. Please check the URLs and try again.",
        );
      }

      const json = await response.json();

      if (json.error) {
        throw new Error(json.error);
      }

      setFaq(json.faq);
    } catch (e: any) {
      console.error("Error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    const markdown = convertToMarkdown(faq);
    copy(markdown);
    toast({
      title: "Copied to clipboard.",
    });
  };

  return (
    <main className="py-10 px-6 max-w-screen-md mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold md:text-4xl">FAQ GENERATOR</h1>
        <p className="mt-2 opacity-80">
          The FAQ Generator uses OpenAI's GPT models to create FAQs from
          Markdown files on GitHub.
        </p>
      </header>

      <form
        className="grid gap-2 border p-4 rounded-xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* links */}
        {fields.map((item, index) => {
          return (
            <div key={item.id}>
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  {...register(`links.${index}.url`)}
                  placeholder="https://github.com/user/repo/file.md"
                />
                {fields.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* add row */}
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => {
            append({ url: "" });
          }}
        >
          <Plus className="size-4" />
          <span className="">Add URL</span>
        </Button>

        {/* submit */}
        <Button type="submit">Generate</Button>
      </form>

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
