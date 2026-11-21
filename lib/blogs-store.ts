import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { uniqueSlug } from "./slug";

export type StoredBlogPost = {
  slug: string;
  title: string;
  body: string;
  publishedAt: string;
};

const blogsPath = path.join(process.cwd(), "data", "blogs.json");

export function readBlogPosts(): StoredBlogPost[] {
  if (!existsSync(blogsPath)) {
    return [];
  }
  const parsed = JSON.parse(readFileSync(blogsPath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error("Blog file is malformed.");
  }
  return parsed;
}

export function getBlogBySlug(slug: string): StoredBlogPost | undefined {
  return readBlogPosts().find((post) => post.slug === slug);
}

export function saveBlogPost(title: string, body: string): StoredBlogPost {
  const posts = readBlogPosts();
  const post: StoredBlogPost = {
    slug: uniqueSlug(
      title,
      posts.map((item) => item.slug),
    ),
    title,
    body,
    publishedAt: new Date().toISOString(),
  };
  posts.push(post);
  writeFileSync(blogsPath, JSON.stringify(posts, null, 2) + "\n", "utf8");
  return post;
}

export function updateBlogPost(
  slug: string,
  changes: Partial<{ title: string; body: string }>,
): StoredBlogPost | undefined {
  const posts = readBlogPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) {
    return undefined;
  }
  const updated: StoredBlogPost = { ...post, ...changes };
  const next = posts.map((item) => (item.slug === slug ? updated : item));
  writeFileSync(blogsPath, JSON.stringify(next, null, 2) + "\n", "utf8");
  return updated;
}

export function deleteBlogPost(slug: string): boolean {
  const posts = readBlogPosts();
  const next = posts.filter((item) => item.slug !== slug);
  if (next.length === posts.length) {
    return false;
  }
  writeFileSync(blogsPath, JSON.stringify(next, null, 2) + "\n", "utf8");
  return true;
}
