import type { Metadata } from "next";
import Link from "next/link";
import ResourceList from "./resource-list";
import styles from "./resources.module.css";

export const metadata: Metadata = {
  title: "Learning Resources — Lanboer Zhao",
};

export default function ResourcesPage() {
  return (
    <div className={styles.page}>
      <h1>Learning Resource Library</h1>
      <p className={styles.intro}>
        A curated list of tutorials, documentation, and references I use for
        coursework and game projects. Links open in a new tab. Save any
        resource to your personal learning list below — it is stored in this
        browser and survives a refresh. Resources are managed from{" "}
        <Link href="/admin/resources" className={styles.adminLink}>
          /admin/resources
        </Link>{" "}
        and load from the resources API every time you open or refresh this
        page.
      </p>
      <ResourceList />
    </div>
  );
}
