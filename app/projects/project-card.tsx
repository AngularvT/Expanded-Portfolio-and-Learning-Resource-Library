import Link from "next/link";
import type { StoredProject } from "@/lib/projects-store";
import styles from "./projects.module.css";

export default function ProjectCard({ project }: { project: StoredProject }) {
  return (
    <li className={styles.card}>
      <h2>
        <Link href={`/projects/${project.slug}`} className={styles.cardTitle}>
          {project.title}
        </Link>
      </h2>
      <p>{project.summary}</p>
      <p className={styles.tools}>{project.tools.join(" · ")}</p>
      <Link href={`/projects/${project.slug}`} className={styles.cardLink}>
        Read project details →
      </Link>
    </li>
  );
}
