import "./globals.css";

import React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { cn } from "lib/utils";

const title = "FAQ Generator";
const description =
  "The FAQ Generator uses OpenAI's GPT models to create FAQs from Markdown files on GitHub.";
const url = "https://faq-generator-alpha.vercel.app";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(url),
  openGraph: {
    title,
    description,
    url,
    siteName: title,
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
    site: "@upstash",
  },
  icons: {
    icon: "/favicon-32x32.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <body
        className={cn(
          GeistSans.variable,
          "antialiased bg-white text-sm md:text-base text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200",
        )}
      >
        {children}
      </body>
    </html>
  );
}
