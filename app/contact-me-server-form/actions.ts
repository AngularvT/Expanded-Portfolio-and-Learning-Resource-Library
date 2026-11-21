"use server";

import { saveSubmission } from "@/lib/submissions-store";
import { validateContactInput } from "@/lib/contact-validation";
import type { ContactFormState } from "./contact-form-state";
import { initialContactFormState } from "./contact-form-state";

export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values = {
    name: formValue(formData, "name"),
    email: formValue(formData, "email"),
    message: formValue(formData, "message"),
  };

  const result = validateContactInput(values);

  if (!result.ok) {
    return {
      status: "validation-error",
      message: "Please fix the errors below and try again.",
      fieldErrors: result.errors,
      values,
    };
  }

  try {
    const submission = saveSubmission({
      name: result.name,
      email: result.email,
      message: result.message,
    });
    return {
      status: "success",
      message: `Thanks, ${submission.name}! Your message has been received.`,
      fieldErrors: {},
      values: initialContactFormState.values,
    };
  } catch {
    return {
      status: "save-error",
      message:
        "Sorry — your message could not be saved. Please try again in a moment.",
      fieldErrors: {},
      values,
    };
  }
}

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
