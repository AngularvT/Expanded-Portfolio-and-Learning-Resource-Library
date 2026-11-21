import type { Metadata } from "next";
import Link from "next/link";
import ProjectManager from "./project-manager";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Projects admin — Lanboer Zhao",
};

export default function ProjectsAdminPage() {
  return (
    <div className={styles.page}>
      <h1>Manage projects</h1>
      <p>
        Add, edit, or delete the projects shown on the website. Every change
        goes through the projects API and is saved to the server&apos;s JSON
        file. The public portfolio section lives at{" "}
        <Link href="/projects" className={styles.link}>
          /projects
        </Link>
        .
      </p>
      <ProjectManager />
    </div>
  );
}
