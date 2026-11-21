import type { Metadata } from "next";
import Link from "next/link";
import ResourceManager from "./resource-manager";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Resources admin — Lanboer Zhao",
};

export default function ResourcesAdminPage() {
  return (
    <div className={styles.page}>
      <h1>Manage learning resources</h1>
      <p>
        Add, edit, or delete entries in the learning resource library. Every
        change goes through the resources API and is saved to the server&apos;s
        JSON file. The public library lives at{" "}
        <Link href="/resources" className={styles.link}>
          /resources
        </Link>
        .
      </p>
      <ResourceManager />
    </div>
  );
}
