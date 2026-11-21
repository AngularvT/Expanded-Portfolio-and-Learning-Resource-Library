import {
  addResource,
  deleteResource,
  readResources,
  updateResource,
  type StoredResource,
} from "./resources-store";
import {
  validateResourceFields,
  validateResourceInput,
  type ResourceFieldErrors,
} from "./resource-validation";

export type ResourceApiResponse =
  | {
      status: "success";
      message: string;
      resource?: Omit<StoredResource, "createdAt" | "updatedAt">;
    }
  | {
      status: "validation-error";
      message: string;
      fieldErrors: ResourceFieldErrors;
    }
  | { status: "request-error"; message: string }
  | { status: "save-error"; message: string }
  | { status: "not-found"; message: string };

type IdContext = { params: Promise<{ id: string }> };

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

function requestError(message: string): Response {
  return Response.json(
    { status: "request-error", message } satisfies ResourceApiResponse,
    { status: 400 },
  );
}

function validationError(
  fieldErrors: ResourceFieldErrors,
): Response {
  return Response.json(
    {
      status: "validation-error",
      message: "Please fix the errors and try again.",
      fieldErrors,
    } satisfies ResourceApiResponse,
    { status: 400 },
  );
}

function saveError(): Response {
  return Response.json(
    {
      status: "save-error",
      message:
        "Sorry — the resource could not be saved. Please try again in a moment.",
    } satisfies ResourceApiResponse,
    { status: 500 },
  );
}

export async function handleResourcesGet(): Promise<Response> {
  let resources: StoredResource[];
  try {
    resources = readResources();
  } catch {
    return Response.json(
      {
        status: "request-error",
        message: "Resources could not be loaded.",
      } satisfies ResourceApiResponse,
      { status: 500 },
    );
  }
  return Response.json({ resources });
}

export async function handleResourcesPost(
  request: Request,
): Promise<Response> {
  const parsed = await parseJsonRecord(request);
  if (!parsed.ok) {
    return requestError(
      "The request body must be a JSON object with title, link, and category fields.",
    );
  }

  const { title, link, category } = parsed.record;
  const fieldErrors: ResourceFieldErrors = {};
  if (typeof title !== "string") {
    fieldErrors.title =
      title === undefined ? "Title is required." : "Title must be text.";
  }
  if (typeof link !== "string") {
    fieldErrors.link =
      link === undefined ? "Link is required." : "Link must be text.";
  }
  if (typeof category !== "string") {
    fieldErrors.category =
      category === undefined
        ? "Category is required."
        : "Category must be text.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return validationError(fieldErrors);
  }

  const result = validateResourceInput({
    title: title as string,
    link: link as string,
    category: category as string,
  });
  if (!result.ok) {
    return validationError(result.errors);
  }

  try {
    const resource = addResource({
      title: result.title,
      link: result.link,
      category: result.category,
    });
    return Response.json(
      {
        status: "success",
        message: `Resource "${resource.title}" saved.`,
        resource: {
          id: resource.id,
          title: resource.title,
          link: resource.link,
          category: resource.category,
        },
      } satisfies ResourceApiResponse,
      { status: 201 },
    );
  } catch {
    return saveError();
  }
}

export async function handleResourcePatch(
  request: Request,
  context: IdContext,
): Promise<Response> {
  const { id } = await context.params;

  const parsed = await parseJsonRecord(request);
  if (!parsed.ok) {
    return requestError(
      "The request body must be a JSON object with any of title, link, or category.",
    );
  }

  const { title, link, category } = parsed.record;
  const present: { title?: string; link?: string; category?: string } = {};
  const fieldErrors: ResourceFieldErrors = {};

  if (title !== undefined) {
    if (typeof title !== "string") {
      fieldErrors.title = "Title must be text.";
    } else {
      present.title = title;
    }
  }
  if (link !== undefined) {
    if (typeof link !== "string") {
      fieldErrors.link = "Link must be text.";
    } else {
      present.link = link;
    }
  }
  if (category !== undefined) {
    if (typeof category !== "string") {
      fieldErrors.category = "Category must be text.";
    } else {
      present.category = category;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return validationError(fieldErrors);
  }
  if (Object.keys(present).length === 0) {
    return requestError("Provide at least one of title, link, or category.");
  }

  const result = validateResourceFields(present);
  if (!result.ok) {
    return validationError(result.errors);
  }

  try {
    const updated = updateResource(id, result.changes);
    if (!updated) {
      return Response.json(
        {
          status: "not-found",
          message: "Resource not found.",
        } satisfies ResourceApiResponse,
        { status: 404 },
      );
    }
    return Response.json(
      {
        status: "success",
        message: `Resource "${updated.title}" updated.`,
        resource: {
          id: updated.id,
          title: updated.title,
          link: updated.link,
          category: updated.category,
        },
      } satisfies ResourceApiResponse,
      { status: 200 },
    );
  } catch {
    return saveError();
  }
}

export async function handleResourceDelete(
  _request: Request,
  context: IdContext,
): Promise<Response> {
  const { id } = await context.params;

  try {
    const deleted = deleteResource(id);
    if (!deleted) {
      return Response.json(
        {
          status: "not-found",
          message: "Resource not found.",
        } satisfies ResourceApiResponse,
        { status: 404 },
      );
    }
    return Response.json(
      { status: "success", message: "Resource deleted." } satisfies ResourceApiResponse,
      { status: 200 },
    );
  } catch {
    return saveError();
  }
}
