import { isLocalDemoRequest } from "./admin-access";
import { isContactManagementEnabled } from "./contact-admin-config";
import {
  deleteSubmission,
  readSubmissions,
  saveSubmission,
  updateSubmission,
  type StoredSubmission,
} from "./submissions-store";
import {
  validateContactFields,
  validateContactInput,
  type ContactFieldErrors,
} from "./contact-validation";

export type ContactApiResponse =
  | { status: "success"; message: string }
  | {
      status: "validation-error";
      message: string;
      fieldErrors: ContactFieldErrors;
    }
  | { status: "request-error"; message: string }
  | { status: "save-error"; message: string };

export type ContactAdminApiResponse =
  | {
      status: "success";
      message: string;
      submission?: { id: string; name: string; email: string };
    }
  | {
      status: "validation-error";
      message: string;
      fieldErrors: ContactFieldErrors;
    }
  | { status: "request-error"; message: string }
  | { status: "save-error"; message: string }
  | { status: "forbidden"; message: string }
  | { status: "not-found"; message: string };

type IdContext = { params: Promise<{ id: string }> };

function forbidden(message: string): Response {
  return Response.json(
    {
      status: "forbidden",
      message,
    } satisfies ContactAdminApiResponse,
    { status: 403 },
  );
}

function managementGate(request: Request): Response | null {
  if (!isContactManagementEnabled()) {
    return forbidden(
      "Contact management is turned off on this server. Enable it with CONTACT_ADMIN_ENABLED=true for a local demo.",
    );
  }
  if (!isLocalDemoRequest(request)) {
    return forbidden(
      "Contact submissions are only available in the local demo.",
    );
  }
  return null;
}

export async function handleContactPost(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        status: "request-error",
        message: "The request body must be valid JSON.",
      } satisfies ContactApiResponse,
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json(
      {
        status: "request-error",
        message:
          "The request body must be a JSON object with name, email, and message fields.",
      } satisfies ContactApiResponse,
      { status: 400 },
    );
  }

  const record = body as Record<string, unknown>;
  const { name, email, message } = record;
  const fieldErrors: ContactFieldErrors = {};

  if (typeof name !== "string") {
    fieldErrors.name =
      name === undefined ? "Name is required." : "Name must be text.";
  }
  if (typeof email !== "string") {
    fieldErrors.email =
      email === undefined ? "Email is required." : "Email must be text.";
  }
  if (typeof message !== "string") {
    fieldErrors.message =
      message === undefined ? "Message is required." : "Message must be text.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return Response.json(
      {
        status: "validation-error",
        message: "Please fix the errors and try again.",
        fieldErrors,
      } satisfies ContactApiResponse,
      { status: 400 },
    );
  }

  const result = validateContactInput({
    name: name as string,
    email: email as string,
    message: message as string,
  });

  if (!result.ok) {
    return Response.json(
      {
        status: "validation-error",
        message: "Please fix the errors and try again.",
        fieldErrors: result.errors,
      } satisfies ContactApiResponse,
      { status: 400 },
    );
  }

  try {
    const submission = saveSubmission({
      name: result.name,
      email: result.email,
      message: result.message,
    });
    return Response.json(
      {
        status: "success",
        message: `Thanks, ${submission.name}! Your message has been received.`,
      } satisfies ContactApiResponse,
      { status: 201 },
    );
  } catch {
    return Response.json(
      {
        status: "save-error",
        message:
          "Sorry — your message could not be saved. Please try again in a moment.",
      } satisfies ContactApiResponse,
      { status: 500 },
    );
  }
}

export async function handleContactsGet(request: Request): Promise<Response> {
  const deniedResponse = managementGate(request);
  if (deniedResponse) {
    return deniedResponse;
  }
  let submissions: StoredSubmission[];
  try {
    submissions = readSubmissions();
  } catch {
    return Response.json(
      {
        status: "save-error",
        message: "Submissions could not be loaded.",
      } satisfies ContactAdminApiResponse,
      { status: 500 },
    );
  }
  return Response.json({ submissions });
}

export async function handleContactPatch(
  request: Request,
  context: IdContext,
): Promise<Response> {
  const deniedResponse = managementGate(request);
  if (deniedResponse) {
    return deniedResponse;
  }
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        status: "request-error",
        message: "The request body must be valid JSON.",
      } satisfies ContactAdminApiResponse,
      { status: 400 },
    );
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json(
      {
        status: "request-error",
        message:
          "The request body must be a JSON object with any of the submission fields.",
      } satisfies ContactAdminApiResponse,
      { status: 400 },
    );
  }

  const record = body as Record<string, unknown>;
  const fieldErrors: ContactFieldErrors = {};
  const present: Partial<{ name: string; email: string; message: string }> = {};

  for (const key of ["name", "email", "message"] as const) {
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
  if (Object.keys(fieldErrors).length > 0) {
    return Response.json(
      {
        status: "validation-error",
        message: "Please fix the errors and try again.",
        fieldErrors,
      } satisfies ContactAdminApiResponse,
      { status: 400 },
    );
  }

  const result = validateContactFields(present);
  if (!result.ok) {
    if (Object.keys(result.errors).length === 0) {
      return Response.json(
        {
          status: "request-error",
          message: "Provide at least one submission field to update.",
        } satisfies ContactAdminApiResponse,
        { status: 400 },
      );
    }
    return Response.json(
      {
        status: "validation-error",
        message: "Please fix the errors and try again.",
        fieldErrors: result.errors,
      } satisfies ContactAdminApiResponse,
      { status: 400 },
    );
  }

  try {
    const updated = updateSubmission(id, result.changes);
    if (!updated) {
      return Response.json(
        {
          status: "not-found",
          message: "Submission not found.",
        } satisfies ContactAdminApiResponse,
        { status: 404 },
      );
    }
    return Response.json(
      {
        status: "success",
        message: `Submission from ${updated.name} updated.`,
        submission: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
        },
      } satisfies ContactAdminApiResponse,
      { status: 200 },
    );
  } catch {
    return Response.json(
      {
        status: "save-error",
        message:
          "Sorry — the submission could not be saved. Please try again in a moment.",
      } satisfies ContactAdminApiResponse,
      { status: 500 },
    );
  }
}

export async function handleContactDelete(
  request: Request,
  context: IdContext,
): Promise<Response> {
  const deniedResponse = managementGate(request);
  if (deniedResponse) {
    return deniedResponse;
  }
  const { id } = await context.params;

  try {
    const deleted = deleteSubmission(id);
    if (!deleted) {
      return Response.json(
        {
          status: "not-found",
          message: "Submission not found.",
        } satisfies ContactAdminApiResponse,
        { status: 404 },
      );
    }
    return Response.json(
      {
        status: "success",
        message: "Submission deleted.",
      } satisfies ContactAdminApiResponse,
      { status: 200 },
    );
  } catch {
    return Response.json(
      {
        status: "save-error",
        message:
          "Sorry — the submission could not be deleted. Please try again in a moment.",
      } satisfies ContactAdminApiResponse,
      { status: 500 },
    );
  }
}
