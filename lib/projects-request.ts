import { revalidatePath } from "next/cache";
import {
  deleteProject,
  readProjects,
  saveProject,
  updateProject,
  type StoredProject,
} from "./projects-store";
import {
  validateProjectFields,
  validateProjectInput,
  type ProjectFieldErrors,
} from "./project-validation";

export type ProjectApiResponse =
  | {
      status: "success";
      message: string;
      project?: { slug: string; title: string };
    }
  | {
      status: "validation-error";
      message: string;
      fieldErrors: ProjectFieldErrors;
    }
  | { status: "request-error"; message: string }
  | { status: "save-error"; message: string }
  | { status: "not-found"; message: string };

type SlugContext = { params: Promise<{ slug: string }> };

function requestError(message: string): Response {
  return Response.json(
    { status: "request-error", message } satisfies ProjectApiResponse,
    { status: 400 },
  );
}

function validationError(fieldErrors: ProjectFieldErrors): Response {
  return Response.json(
    {
      status: "validation-error",
      message: "Please fix the errors and try again.",
      fieldErrors,
    } satisfies ProjectApiResponse,
    { status: 400 },
  );
}

function saveError(): Response {
  return Response.json(
    {
      status: "save-error",
      message:
        "Sorry — the project could not be saved. Please try again in a moment.",
    } satisfies ProjectApiResponse,
    { status: 500 },
  );
}

function notFound(): Response {
  return Response.json(
    {
      status: "not-found",
      message: "Project not found.",
    } satisfies ProjectApiResponse,
    { status: 404 },
  );
}

async function parseJsonRecord(
  request: Request,
): Promise<{ ok: true; record: Record<string, unknown> } | { ok: false }> {
  try {
    const payload: unknown = await request.json();
    if (
      typeof payload !== "object" ||
      payload === null ||
      Array.isArray(payload)
    ) {
      return { ok: false };
    }
    return { ok: true, record: payload as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
}

function revalidateProjects(slug?: string): void {
  revalidatePath("/projects");
  if (slug) {
    revalidatePath(`/projects/${slug}`);
  }
}

export async function handleProjectsGet(): Promise<Response> {
  let projects: StoredProject[];
  try {
    projects = readProjects();
  } catch {
    return Response.json(
      {
        status: "request-error",
        message: "Projects could not be loaded.",
      } satisfies ProjectApiResponse,
      { status: 500 },
    );
  }
  return Response.json({ projects });
}

export async function handleProjectsPost(request: Request): Promise<Response> {
  const parsed = await parseJsonRecord(request);
  if (!parsed.ok) {
    return requestError(
      "The request body must be a JSON object with title, summary, description, contribution, and tools.",
    );
  }

  const record = parsed.record;
  const fieldErrors: ProjectFieldErrors = {};
  const present: Record<string, unknown> = {};

  for (const key of ["title", "summary", "description", "contribution"] as const) {
    const value = record[key];
    if (value === undefined) {
      fieldErrors[key] =
        key.charAt(0).toUpperCase() +
        key.slice(1) +
        " is required.";
    } else if (typeof value !== "string") {
      fieldErrors[key] =
        key.charAt(0).toUpperCase() + key.slice(1) + " must be text.";
    } else {
      present[key] = value;
    }
  }

  const tools = record.tools;
  if (tools === undefined) {
    fieldErrors.tools = "At least one tool is required.";
  } else if (Array.isArray(tools)) {
    present.tools = tools;
  } else {
    fieldErrors.tools = "Tools must be a list.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return validationError(fieldErrors);
  }

  const result = validateProjectInput(present as unknown as {
    title: string;
    summary: string;
    description: string;
    contribution: string;
    tools: string[];
  });
  if (!result.ok) {
    return validationError(result.errors);
  }

  try {
    const project = saveProject(result.value);
    revalidateProjects(project.slug);
    return Response.json(
      {
        status: "success",
        message: `Project "${project.title}" saved.`,
        project: { slug: project.slug, title: project.title },
      } satisfies ProjectApiResponse,
      { status: 201 },
    );
  } catch {
    return saveError();
  }
}

export async function handleProjectPatch(
  request: Request,
  context: SlugContext,
): Promise<Response> {
  const { slug } = await context.params;

  const parsed = await parseJsonRecord(request);
  if (!parsed.ok) {
    return requestError(
      "The request body must be a JSON object with any of the project fields.",
    );
  }

  const record = parsed.record;
  const fieldErrors: ProjectFieldErrors = {};
  const present: Record<string, unknown> = {};

  for (const key of ["title", "summary", "description", "contribution"] as const) {
    const value = record[key];
    if (value === undefined) {
      continue;
    }
    if (typeof value !== "string") {
      fieldErrors[key] =
        key.charAt(0).toUpperCase() + key.slice(1) + " must be text.";
    } else {
      present[key] = value;
    }
  }

  const tools = record.tools;
  if (tools !== undefined) {
    if (Array.isArray(tools)) {
      present.tools = tools;
    } else {
      fieldErrors.tools = "Tools must be a list.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return validationError(fieldErrors);
  }

  const result = validateProjectFields(
    present as Partial<{
      title: string;
      summary: string;
      description: string;
      contribution: string;
      tools: string[];
    }>,
  );
  if (!result.ok) {
    if (Object.keys(result.errors).length === 0) {
      return requestError("Provide at least one project field to update.");
    }
    return validationError(result.errors);
  }

  try {
    const updated = updateProject(slug, result.changes);
    if (!updated) {
      return notFound();
    }
    revalidateProjects(slug);
    return Response.json(
      {
        status: "success",
        message: `Project "${updated.title}" updated.`,
        project: { slug: updated.slug, title: updated.title },
      } satisfies ProjectApiResponse,
      { status: 200 },
    );
  } catch {
    return saveError();
  }
}

export async function handleProjectDelete(
  _request: Request,
  context: SlugContext,
): Promise<Response> {
  const { slug } = await context.params;

  try {
    const deleted = deleteProject(slug);
    if (!deleted) {
      return notFound();
    }
    revalidateProjects(slug);
    return Response.json(
      {
        status: "success",
        message: "Project deleted.",
      } satisfies ProjectApiResponse,
      { status: 200 },
    );
  } catch {
    return saveError();
  }
}
