"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StoredBlogPost } from "@/lib/blogs-store";
import PostCard from "./post-card";
import styles from "./blogs.module.css";

export default function BlogList() {
  const [posts, setPosts] = useState<StoredBlogPost[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/blogs")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { posts?: StoredBlogPost[] }) => {
        if (!cancelled) {
          setPosts(data.posts ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <p role="alert" className={styles.loadError}>
        Posts could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  if (posts === null) {
    return <p className={styles.loading}>Loading posts...</p>;
  }

  if (posts.length === 0) {
    return (
      <p className={styles.empty}>
        No posts yet. Publish one from{" "}
        <Link href="/admin/blogs" className={styles.adminLink}>
          the blog admin page
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </ul>
  );
}
