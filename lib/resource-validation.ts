export type ResourceInput = {
  title: string;
  link: string;
  category: string;
};

export type ResourceFieldErrors = {
  title?: string;
  link?: string;
  category?: string;
};

export type ResourceValidationResult =
  | { ok: true; title: string; link: string; category: string }
  | { ok: false; errors: ResourceFieldErrors };

export function isValidLink(link: string): boolean {
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateResourceInput(
  input: ResourceInput,
): ResourceValidationResult {
  const errors: ResourceFieldErrors = {};

  const title = input.title.trim();
  if (title.length === 0) {
    errors.title = "Title is required.";
  }

  const link = input.link.trim();
  if (link.length === 0) {
    errors.link = "Link is required.";
  } else if (!isValidLink(link)) {
    errors.link =
      "Enter a valid link, starting with https:// (e.g. https://example.com/tutorial).";
  }

  const category = input.category.trim();
  if (category.length === 0) {
    errors.category = "Category is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, title, link, category };
}

export function validateResourceFields(
  fields: Partial<ResourceInput>,
): { ok: true; changes: Partial<ResourceInput> } | {
  ok: false;
  errors: ResourceFieldErrors;
} {
  const errors: ResourceFieldErrors = {};
  const changes: Partial<ResourceInput> = {};

  if (fields.title !== undefined) {
    const title = fields.title.trim();
    if (title.length === 0) {
      errors.title = "Title is required.";
    } else {
      changes.title = title;
    }
  }
  if (fields.link !== undefined) {
    const link = fields.link.trim();
    if (link.length === 0) {
      errors.link = "Link is required.";
    } else if (!isValidLink(link)) {
      errors.link =
        "Enter a valid link, starting with https:// (e.g. https://example.com/tutorial).";
    } else {
      changes.link = link;
    }
  }
  if (fields.category !== undefined) {
    const category = fields.category.trim();
    if (category.length === 0) {
      errors.category = "Category is required.";
    } else {
      changes.category = category;
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
