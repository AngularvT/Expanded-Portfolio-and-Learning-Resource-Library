export type ProjectFieldErrors = {
  title?: string;
  summary?: string;
  description?: string;
  contribution?: string;
  tools?: string;
};

export type ProjectInput = {
  title: string;
  summary: string;
  description: string;
  contribution: string;
  tools: string[];
};

export type ProjectValidationResult =
  | { ok: true; value: ProjectInput }
  | { ok: false; errors: ProjectFieldErrors };

function normalizeTools(tools: string[]): string[] {
  return tools
    .map((tool) => tool.trim())
    .filter((tool) => tool.length > 0);
}

export function validateProjectInput(
  input: ProjectInput,
): ProjectValidationResult {
  const errors: ProjectFieldErrors = {};

  const title = input.title.trim();
  if (title.length === 0) {
    errors.title = "Title is required.";
  }

  const summary = input.summary.trim();
  if (summary.length === 0) {
    errors.summary = "Summary is required.";
  }

  const description = input.description.trim();
  if (description.length === 0) {
    errors.description = "Description is required.";
  }

  const contribution = input.contribution.trim();
  if (contribution.length === 0) {
    errors.contribution = "Contribution is required.";
  }

  let tools: string[] = [];
  if (!Array.isArray(input.tools)) {
    errors.tools = "Tools must be a list.";
  } else {
    tools = normalizeTools(input.tools);
    if (tools.length === 0) {
      errors.tools = "At least one tool is required.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { title, summary, description, contribution, tools },
  };
}

export function validateProjectFields(
  fields: Partial<ProjectInput>,
): { ok: true; changes: Partial<ProjectInput> } | {
  ok: false;
  errors: ProjectFieldErrors;
} {
  const errors: ProjectFieldErrors = {};
  const changes: Partial<ProjectInput> = {};

  if (fields.title !== undefined) {
    const title = fields.title.trim();
    if (title.length === 0) {
      errors.title = "Title is required.";
    } else {
      changes.title = title;
    }
  }
  if (fields.summary !== undefined) {
    const summary = fields.summary.trim();
    if (summary.length === 0) {
      errors.summary = "Summary is required.";
    } else {
      changes.summary = summary;
    }
  }
  if (fields.description !== undefined) {
    const description = fields.description.trim();
    if (description.length === 0) {
      errors.description = "Description is required.";
    } else {
      changes.description = description;
    }
  }
  if (fields.contribution !== undefined) {
    const contribution = fields.contribution.trim();
    if (contribution.length === 0) {
      errors.contribution = "Contribution is required.";
    } else {
      changes.contribution = contribution;
    }
  }
  if (fields.tools !== undefined) {
    if (!Array.isArray(fields.tools)) {
      errors.tools = "Tools must be a list.";
    } else {
      const tools = normalizeTools(fields.tools);
      if (tools.length === 0) {
        errors.tools = "At least one tool is required.";
      } else {
        changes.tools = tools;
      }
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
