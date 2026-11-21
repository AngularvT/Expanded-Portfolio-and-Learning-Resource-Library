import { revalidatePath } from "next/cache";
import {
  deleteBlogPost,
  readBlogPosts,
  saveBlogPost,
  updateBlogPost,
  type StoredBlogPost,
} from "./blogs-store";
import {
  validateBlogFields,
  validateBlogInput,
  type BlogFieldErrors,
} from "./blog-validation";

export type { BlogFieldErrors };

export type BlogApiResponse =
  | {
      status: "success";
      message: string;
      post?: { slug: string; title: string };
    }
  | { status: "validation-error"; message: string; fieldErrors: BlogFieldErrors }
  | { status: "request-error"; message: string }
  | { status: "save-error"; message: string }
  | { status: "not-found"; message: string };

type SlugContext = { params: Promise<{ slug: string }> };

function requestError(message: string): Response {
  return Response.json(
    { status: "request-error", message } satisfies BlogApiResponse,
    { status: 400 },
  );
}

function validationError(fieldErrors: BlogFieldErrors): Response {
  return Response.json(
    {
      status: "validation-error",
      message: "Please fix the errors and try again.",
      fieldErrors,
    } satisfies BlogApiResponse,
    { status: 400 },
  );
}

function saveError(): Response {
  return Response.json(
    {
      status: "save-error",
      message:
        "Sorry — the post could not be saved. Please try again in a moment.",
    } satisfies BlogApiResponse,
    { status: 500 },
  );
}

function notFound(): Response {
  return Response.json(
    { status: "not-found", message: "Post not found." } satisfies BlogApiResponse,
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

function revalidateBlog(slug?: string): void {
  revalidatePath("/blogs");
  if (slug) {
    revalidatePath(`/blogs/${slug}`);
  }
}

export async function handleBlogsGet(): Promise<Response> {
  let posts: StoredBlogPost[];
  try {
    posts = readBlogPosts();
  } catch {
    return Response.json(
      {
        status: "request-error",
        message: "Blog posts could not be loaded.",
      } satisfies BlogApiResponse,
      { status: 500 },
    );
  }
  return Response.json({ posts });
}

export async function handleBlogsPost(request: Request): Promise<Response> {
  const parsed = await parseJsonRecord(request);
  if (!parsed.ok) {
    return requestError(
      "The request body must be a JSON object with title and body fields.",
    );
  }

  const { title, body: postBody } = parsed.record;
  const fieldErrors: BlogFieldErrors = {};
  if (typeof title !== "string") {
    fieldErrors.title =
      title === undefined ? "Title is required." : "Title must be text.";
  }
  if (typeof postBody !== "string") {
    fieldErrors.body =
      postBody === undefined ? "Body is required." : "Body must be text.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return validationError(fieldErrors);
  }

  const result = validateBlogInput({
    title: title as string,
    body: postBody as string,
  });
  if (!result.ok) {
    return validationError(result.errors);
  }

  try {
    const post = saveBlogPost(result.title, result.body);
    revalidateBlog(post.slug);
    return Response.json(
      {
        status: "success",
        message: `Post "${post.title}" saved.`,
        post: { slug: post.slug, title: post.title },
      } satisfies BlogApiResponse,
      { status: 201 },
    );
  } catch {
    return saveError();
  }
}

export async function handleBlogPatch(
  request: Request,
  context: SlugContext,
): Promise<Response> {
  const { slug } = await context.params;

  const parsed = await parseJsonRecord(request);
  if (!parsed.ok) {
    return requestError(
      "The request body must be a JSON object with title and/or body.",
    );
  }

  const { title, body: postBody } = parsed.record;
  const present: { title?: string; body?: string } = {};
  const fieldErrors: BlogFieldErrors = {};

  if (title !== undefined) {
    if (typeof title !== "string") {
      fieldErrors.title = "Title must be text.";
    } else {
      present.title = title;
    }
  }
  if (postBody !== undefined) {
    if (typeof postBody !== "string") {
      fieldErrors.body = "Body must be text.";
    } else {
      present.body = postBody;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return validationError(fieldErrors);
  }

  const result = validateBlogFields(present);
  if (!result.ok) {
    return validationError(result.errors);
  }
  if (Object.keys(result.changes).length === 0) {
    return requestError("Provide a title and/or body to update.");
  }

  try {
    const updated = updateBlogPost(slug, result.changes);
    if (!updated) {
      return notFound();
    }
    revalidateBlog(slug);
    return Response.json(
      {
        status: "success",
        message: `Post "${updated.title}" updated.`,
        post: { slug: updated.slug, title: updated.title },
      } satisfies BlogApiResponse,
      { status: 200 },
    );
  } catch {
    return saveError();
  }
}

export async function handleBlogDelete(
  _request: Request,
  context: SlugContext,
): Promise<Response> {
  const { slug } = await context.params;

  try {
    const deleted = deleteBlogPost(slug);
    if (!deleted) {
      return notFound();
    }
    revalidateBlog(slug);
    return Response.json(
      { status: "success", message: "Post deleted." } satisfies BlogApiResponse,
      { status: 200 },
    );
  } catch {
    return saveError();
  }
}
