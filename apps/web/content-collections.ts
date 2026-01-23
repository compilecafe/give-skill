import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypeSlug from "rehype-slug";
import { z } from "zod";

interface Heading {
  level: number;
  text: string;
  slug: string;
}

function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ level, text, slug });
  }

  return headings;
}

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    author: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [rehypeSlug],
    });
    const headings = extractHeadings(document.content);
    return {
      ...document,
      mdx,
      headings,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
