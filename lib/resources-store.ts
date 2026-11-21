import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type StoredResource = {
  id: string;
  title: string;
  link: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

const resourcesPath = path.join(process.cwd(), "data", "resources.json");

export function readResources(): StoredResource[] {
  if (!existsSync(resourcesPath)) {
    return [];
  }
  const parsed = JSON.parse(readFileSync(resourcesPath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error("Resources file is malformed.");
  }
  return parsed;
}

export function getResourceById(id: string): StoredResource | undefined {
  return readResources().find((resource) => resource.id === id);
}

export function addResource(fields: {
  title: string;
  link: string;
  category: string;
}): StoredResource {
  const resources = readResources();
  const now = new Date().toISOString();
  const resource: StoredResource = {
    id: crypto.randomUUID(),
    title: fields.title,
    link: fields.link,
    category: fields.category,
    createdAt: now,
    updatedAt: now,
  };
  resources.push(resource);
  writeFileSync(
    resourcesPath,
    JSON.stringify(resources, null, 2) + "\n",
    "utf8",
  );
  return resource;
}

export function updateResource(
  id: string,
  changes: Partial<{ title: string; link: string; category: string }>,
): StoredResource | undefined {
  const resources = readResources();
  const resource = resources.find((item) => item.id === id);
  if (!resource) {
    return undefined;
  }
  const updated: StoredResource = {
    ...resource,
    ...changes,
    updatedAt: new Date().toISOString(),
  };
  const next = resources.map((item) => (item.id === id ? updated : item));
  writeFileSync(
    resourcesPath,
    JSON.stringify(next, null, 2) + "\n",
    "utf8",
  );
  return updated;
}

export function deleteResource(id: string): boolean {
  const resources = readResources();
  const next = resources.filter((item) => item.id !== id);
  if (next.length === resources.length) {
    return false;
  }
  writeFileSync(
    resourcesPath,
    JSON.stringify(next, null, 2) + "\n",
    "utf8",
  );
  return true;
}
