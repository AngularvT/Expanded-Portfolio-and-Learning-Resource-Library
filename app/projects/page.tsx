import type { Metadata } from "next";
import ProjectList from "./project-list";
import styles from "./projects.module.css";

export const metadata: Metadata = {
  title: "Projects — Lanboer Zhao",
};

export default function ProjectsPage() {
  return (
    <div className={styles.page}>
      <h1>Projects</h1>
      <p className={styles.intro}>
        A collection of things I have built. Select a project to read the full
        write-up.
      </p>
      <ProjectList />
    </div>
  );
}
