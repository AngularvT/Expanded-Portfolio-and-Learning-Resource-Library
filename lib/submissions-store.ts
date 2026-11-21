import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type StoredSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
};

const submissionsPath = path.join(process.cwd(), "data", "submissions.json");

function normalizeSubmission(record: unknown): StoredSubmission {
  const value = record as Record<string, unknown>;
  return {
    id:
      typeof value.id === "string" && value.id.length > 0
        ? value.id
        : crypto.randomUUID(),
    name: typeof value.name === "string" ? value.name : "",
    email: typeof value.email === "string" ? value.email : "",
    message: typeof value.message === "string" ? value.message : "",
    submittedAt:
      typeof value.submittedAt === "string" && value.submittedAt.length > 0
        ? value.submittedAt
        : new Date().toISOString(),
  };
}

export function readSubmissions(): StoredSubmission[] {
  if (!existsSync(submissionsPath)) {
    return [];
  }
  const parsed: unknown = JSON.parse(readFileSync(submissionsPath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error("Submissions file is malformed.");
  }
  const records = parsed.map(normalizeSubmission);
  const migrated = parsed.some(
    (record) =>
      typeof (record as Record<string, unknown>).id !== "string" ||
      (record as Record<string, unknown>).id === "",
  );
  if (migrated) {
    writeFileSync(
      submissionsPath,
      JSON.stringify(records, null, 2) + "\n",
      "utf8",
    );
  }
  return records;
}

export function saveSubmission(input: {
  name: string;
  email: string;
  message: string;
}): StoredSubmission {
  const submissions = readSubmissions();
  const submission: StoredSubmission = {
    id: crypto.randomUUID(),
    ...input,
    submittedAt: new Date().toISOString(),
  };
  submissions.push(submission);
  writeFileSync(
    submissionsPath,
    JSON.stringify(submissions, null, 2) + "\n",
    "utf8",
  );
  return submission;
}

export function updateSubmission(
  id: string,
  changes: Partial<{ name: string; email: string; message: string }>,
): StoredSubmission | undefined {
  const submissions = readSubmissions();
  const submission = submissions.find((item) => item.id === id);
  if (!submission) {
    return undefined;
  }
  const updated: StoredSubmission = { ...submission, ...changes };
  const next = submissions.map((item) => (item.id === id ? updated : item));
  writeFileSync(
    submissionsPath,
    JSON.stringify(next, null, 2) + "\n",
    "utf8",
  );
  return updated;
}

export function deleteSubmission(id: string): boolean {
  const submissions = readSubmissions();
  const next = submissions.filter((item) => item.id !== id);
  if (next.length === submissions.length) {
    return false;
  }
  writeFileSync(
    submissionsPath,
    JSON.stringify(next, null, 2) + "\n",
    "utf8",
  );
  return true;
}
