import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToMarkdown(faq: string[]) {
  let markdown = "";
  faq.forEach((item, index) => {
    if (item[0].match(/[0-9]/)) {
      markdown += `### ${item}\n\n`;
    } else {
      markdown += `${item}\n\n`;
    }
  });
  return markdown;
}
