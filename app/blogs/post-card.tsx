import Link from "next/link";
import type { StoredBlogPost } from "@/lib/blogs-store";
import { formatDate } from "@/lib/format";
import styles from "./blogs.module.css";

export default function PostCard({ post }: { post: StoredBlogPost }) {
  return (
    <li className={styles.card}>
      <h2>
        <Link href={`/blogs/${post.slug}`} className={styles.postLink}>
          {post.title}
        </Link>
      </h2>
      <time className={styles.date} dateTime={post.publishedAt}>
        {formatDate(post.publishedAt)}
      </time>
    </li>
  );
}
