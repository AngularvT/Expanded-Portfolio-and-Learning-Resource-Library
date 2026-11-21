"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StoredProject } from "@/lib/projects-store";
import styles from "./page.module.css";

export default function ProjectLinks() {
  const [projects, setProjects] = useState<StoredProject[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { projects?: StoredProject[] }) => {
        if (!cancelled) {
          setProjects(data.projects ?? []);
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

  if (failed || (projects !== null && projects.length === 0)) {
    return (
      <p className={styles.projectListNote}>
        No projects to show yet.
      </p>
    );
  }

  if (projects === null) {
    return <p className={styles.projectListNote}>Loading projects...</p>;
  }

  return (
    <ul className={styles.projectList}>
      {projects.map((project) => (
        <li key={project.slug}>
          <Link href={`/projects/${project.slug}`} className={styles.projectLink}>
            {project.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
