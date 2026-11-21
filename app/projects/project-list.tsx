"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StoredProject } from "@/lib/projects-store";
import ProjectCard from "./project-card";
import styles from "./projects.module.css";

export default function ProjectList() {
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

  if (failed) {
    return (
      <p role="alert" className={styles.loadError}>
        Projects could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  if (projects === null) {
    return <p className={styles.loading}>Loading projects...</p>;
  }

  if (projects.length === 0) {
    return (
      <p className={styles.empty}>
        No projects yet. Add some from{" "}
        <Link href="/admin/projects" className={styles.adminLink}>
          the admin page
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </ul>
  );
}
