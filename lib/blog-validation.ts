export type BlogInput = {
  title: string;
  body: string;
};

export type BlogFieldErrors = {
  title?: string;
  body?: string;
};

export type BlogValidationResult =
  | { ok: true; title: string; body: string }
  | { ok: false; errors: BlogFieldErrors };

export function validateBlogInput(input: BlogInput): BlogValidationResult {
  const errors: BlogFieldErrors = {};

  const title = input.title.trim();
  if (title.length === 0) {
    errors.title = "Title is required.";
  }

  const body = input.body.trim();
  if (body.length === 0) {
    errors.body = "Body is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, title, body };
}

export function validateBlogFields(
  fields: Partial<BlogInput>,
): { ok: true; changes: Partial<BlogInput> } | {
  ok: false;
  errors: BlogFieldErrors;
} {
  const errors: BlogFieldErrors = {};
  const changes: Partial<BlogInput> = {};

  if (fields.title !== undefined) {
    const title = fields.title.trim();
    if (title.length === 0) {
      errors.title = "Title is required.";
    } else {
      changes.title = title;
    }
  }
  if (fields.body !== undefined) {
    const body = fields.body.trim();
    if (body.length === 0) {
      errors.body = "Body is required.";
    } else {
      changes.body = body;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  if (Object.keys(changes).length === 0) {
    return { ok: false, errors: {} };
  }
  return { ok: true, changes };
}
