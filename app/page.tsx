"use client";

import React from "react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Alert, AlertTitle } from "components/ui/alert";
import copy from "copy-to-clipboard";
import { cn, convertToMarkdown } from "lib/utils";
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
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
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>();
  const [faq, setFaq] = React.useState<string[][]>([]);
  const [hasCopy, setHasCopy] = React.useState<boolean>(false);

  const { control, register, handleSubmit } = useForm<Schema>({
    resolver: zodResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  React.useEffect(() => {
    if (fields.length > 0) return;
    append({ url: "" });
  }, []);

  const onReset = () => {
    setError("");
    setFaq([]);
  };

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

      const json: {
        faq: string[][];
        error?: string;
      } = await response.json();

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
    setHasCopy(true);
    setTimeout(() => {
      setHasCopy(false);
    }, 1000);
  };

  return (
    <main className="py-10 px-4 md:px-6 max-w-screen-md mx-auto">
      <header>
        <h1 className="text-3xl font-semibold md:text-4xl">FAQ Generator</h1>
        <p className="mt-2">
          The FAQ Generator uses OpenAI's GPT models to create FAQs from
          Markdown files on GitHub.
        </p>
      </header>

      {faq.length === 0 && (
        <form
          className="mt-10 grid gap-2 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* links */}
          {fields.map((item, index) => {
            return (
              <div key={item.id}>
                <div className="flex items-center gap-2">
                  <Input
                    type="url"
                    className="text-base"
                    {...register(`links.${index}.url`)}
                    placeholder={`https://github.com/user/repo/file-${index + 1}.md`}
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
            type="button"
            variant="outline"
            className="gap-2 justify-start"
            onClick={() => {
              append({ url: "" });
            }}
          >
            <Plus className="size-4" />
            Add URL
          </Button>

          {/* submit */}
          <Button className="mt-4 gap-2" type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Generate
          </Button>
        </form>
      )}

      {error && (
        <div className="mt-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        </div>
      )}

      {faq.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2">
            <Button
              className={cn(
                "gap-2 transition-colors",
                hasCopy && "!bg-emerald-500 !text-white",
              )}
              onClick={handleCopyToClipboard}
            >
              {hasCopy ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              Copy to Clipboard
            </Button>

            <Button className="gap-2" onClick={onReset} variant="secondary">
              <RefreshCw className="size-4" />
              Regenerate
            </Button>
          </div>

          <div className="mt-10 space-y-6">
            {faq.map(([q, a]) => (
              <article key={q} className="">
                <h2 className="text-base md:text-lg font-semibold">{q}</h2>
                <p className="mt-2 opacity-80">{a}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      <footer className="border-t text-center border-t-zinc-100 dark:border-t-zinc-900 pt-10 mt-10">
        <p>
          Built using{" "}
          <a href="https://openai.com" target="_blank">
            OpenAI
          </a>
          ,{" "}
          <a href="http://upstash.com" target="_blank">
            Upstash Redis
          </a>{" "}
          and{" "}
          <a href="http://vercel.com/" target="_blank">
            Vercel
          </a>
          .
        </p>

        <p className="mt-6">
          <a
            className="inline-flex hover:bg-transparent"
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Ffaq-generator&env=UPSTASH_ENDPOINT,UPSTASH_PASSWORD,UPSTASH_PORT,OPENAI_API_KEY,GITHUB_ACCESS_TOKEN&demo-title=FAQ%20Generator&demo-description=The%20FAQ%20Generator%20uses%20OpenAI's%20GPT%20models%20to%20create%20FAQs%20from%20Markdown%20files%20on%20GitHub.&demo-url=https%3A%2F%2Ffaq-gen.vercel.app"
          >
            <img src="https://vercel.com/button" alt="Deploy with Vercel" />
          </a>
        </p>

        <p className="mt-6">
          <a
            href="https://github.com/upstash/faq-generator"
            target="_blank"
            className="inline-flex hover:bg-transparent text-inherit hover:text-emerald-500"
          >
            <svg
              height="24"
              width="24"
              aria-hidden="true"
              viewBox="0 0 16 16"
              version="1.1"
              fill="currentColor"
            >
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </a>
        </p>
      </footer>
    </main>
  );
}
