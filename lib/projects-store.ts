import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { uniqueSlug } from "./slug";

export type StoredProject = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  contribution: string;
  tools: string[];
};

const projectsPath = path.join(process.cwd(), "data", "projects.json");

export function readProjects(): StoredProject[] {
  if (!existsSync(projectsPath)) {
    return [];
  }
  const parsed = JSON.parse(readFileSync(projectsPath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error("Projects file is malformed.");
  }
  return parsed;
}

export function getProjectBySlug(slug: string): StoredProject | undefined {
  return readProjects().find((project) => project.slug === slug);
}

export function saveProject(value: {
  title: string;
  summary: string;
  description: string;
  contribution: string;
  tools: string[];
}): StoredProject {
  const projects = readProjects();
  const project: StoredProject = {
    slug: uniqueSlug(
      value.title,
      projects.map((item) => item.slug),
    ),
    ...value,
  };
  projects.push(project);
  writeFileSync(
    projectsPath,
    JSON.stringify(projects, null, 2) + "\n",
    "utf8",
  );
  return project;
}

export function updateProject(
  slug: string,
  changes: Partial<{
    title: string;
    summary: string;
    description: string;
    contribution: string;
    tools: string[];
  }>,
): StoredProject | undefined {
  const projects = readProjects();
  const project = projects.find((item) => item.slug === slug);
  if (!project) {
    return undefined;
  }
  const updated: StoredProject = { ...project, ...changes };
  const next = projects.map((item) => (item.slug === slug ? updated : item));
  writeFileSync(
    projectsPath,
    JSON.stringify(next, null, 2) + "\n",
    "utf8",
  );
  return updated;
}

export function deleteProject(slug: string): boolean {
  const projects = readProjects();
  const next = projects.filter((item) => item.slug !== slug);
  if (next.length === projects.length) {
    return false;
  }
  writeFileSync(
    projectsPath,
    JSON.stringify(next, null, 2) + "\n",
    "utf8",
  );
  return true;
}
