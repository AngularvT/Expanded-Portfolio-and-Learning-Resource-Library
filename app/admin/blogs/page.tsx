import type { Metadata } from "next";
import Link from "next/link";
import BlogManager from "./blog-manager";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Blog admin — Lanboer Zhao",
};

export default function BlogAdminPage() {
  return (
    <div className={styles.page}>
      <h1>Manage blog posts</h1>
      <p>
        Publish a new post, or edit and delete existing ones below. Every
        change goes through the blog API and is saved to the server&apos;s
        JSON file. The public blog lives at{" "}
        <Link href="/blogs" className={styles.link}>
          /blogs
        </Link>
        .
      </p>
      <BlogManager />
    </div>
  );
}
