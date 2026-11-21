"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import type { ContactAdminApiResponse } from "@/lib/contact-request";
import type { ContactFieldErrors } from "@/lib/contact-validation";
import type { StoredSubmission } from "@/lib/submissions-store";
import { isLocalHostname } from "@/lib/admin-access";
import { formatDateTime } from "@/lib/format";
import AdminRow from "@/app/components/admin-row";
import FormField from "@/app/components/form-field";
import StatusBanner from "@/app/components/status-banner";
import styles from "../admin.module.css";

type ManagerState = {
  status:
    | "idle"
    | "success"
    | "validation-error"
    | "request-error"
    | "save-error"
    | "not-found"
    | "forbidden";
  message: string;
  fieldErrors: ContactFieldErrors;
};

const idleState: ManagerState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

function subscribeToNothing() {
  return () => {};
}

function getLocalAccessSnapshot(): boolean {
  return isLocalHostname(window.location.hostname);
}

function getLocalAccessServerSnapshot(): boolean {
  return false;
}

function newestFirst(a: StoredSubmission, b: StoredSubmission): number {
  return b.submittedAt.localeCompare(a.submittedAt);
}

export default function SubmissionManager() {
  const localAccess = useSyncExternalStore(
    subscribeToNothing,
    getLocalAccessSnapshot,
    getLocalAccessServerSnapshot,
  );

  const [submissions, setSubmissions] = useState<StoredSubmission[] | null>(
    null,
  );
  const [loadFailed, setLoadFailed] = useState(false);
  const [denied, setDenied] = useState(false);
  const [editing, setEditing] = useState<StoredSubmission | null>(null);
  const [state, setState] = useState<ManagerState>(idleState);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(() => {
    return fetch("/api/contacts")
      .then((response) => {
        if (response.status === 403) {
          setDenied(true);
          setSubmissions(null);
          return undefined;
        }
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { submissions?: StoredSubmission[] } | undefined) => {
        if (data !== undefined) {
          setDenied(false);
          setLoadFailed(false);
          setSubmissions(data.submissions ?? []);
        }
      })
      .catch(() => {
        setLoadFailed(true);
      });
  }, []);

  useEffect(() => {
    if (!localAccess) {
      return;
    }
    refresh();
  }, [localAccess, refresh]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) {
      return;
    }
    const form = event.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setState(idleState);

    try {
      const response = await fetch(`/api/contacts/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });
      const result = (await response.json()) as ContactAdminApiResponse;

      if (response.ok && result.status === "success") {
        setState({
          status: "success",
          message: result.message,
          fieldErrors: {},
        });
        setEditing(null);
        await refresh();
      } else if (result.status === "validation-error") {
        setState({
          status: "validation-error",
          message: result.message,
          fieldErrors: result.fieldErrors,
        });
      } else {
        setState({
          status: result.status,
          message: result.message,
          fieldErrors: {},
        });
        if (result.status !== "not-found") {
          await refresh();
        }
      }
    } catch {
      setState({
        status: "request-error",
        message:
          "Sorry — we could not reach the server. Please check your connection and try again.",
        fieldErrors: {},
      });
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(submission: StoredSubmission) {
    if (
      !window.confirm(
        `Delete the submission from "${submission.name}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setPending(true);
    setState(idleState);
    try {
      const response = await fetch(`/api/contacts/${submission.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as ContactAdminApiResponse;
      if (response.ok && result.status === "success") {
        setState({
          status: "success",
          message: result.message,
          fieldErrors: {},
        });
        if (editing?.id === submission.id) {
          setEditing(null);
        }
      } else {
        setState({
          status: result.status,
          message: result.message,
          fieldErrors: {},
        });
      }
      await refresh();
    } catch {
      setState({
        status: "request-error",
        message:
          "Sorry — we could not reach the server. Please check your connection and try again.",
        fieldErrors: {},
      });
    } finally {
      setPending(false);
    }
  }

  function cancelEdit() {
    setEditing(null);
    setState(idleState);
  }

  if (!localAccess) {
    return (
      <div role="alert" className={styles.denied}>
        <h2>Not available here</h2>
        <p>
          Viewing, editing, and deleting contact submissions is limited to the
          local demo. Open{" "}
          <code>http://localhost:3000/admin/contacts</code> while running the
          site on your own machine.
        </p>
      </div>
    );
  }

  const sorted =
    submissions === null
      ? null
      : [...submissions].sort(newestFirst);

  return (
    <div className={styles.manager}>
      {denied && (
        <StatusBanner tone="warning">
          The server refused access to submissions. Make sure contact
          management is enabled and you are using the local demo.
        </StatusBanner>
      )}
      {state.status === "success" && (
        <StatusBanner tone="success">{state.message}</StatusBanner>
      )}
      {(state.status === "save-error" ||
        state.status === "request-error" ||
        state.status === "not-found" ||
        state.status === "forbidden") && (
        <StatusBanner tone="warning">{state.message}</StatusBanner>
      )}
      {state.status === "validation-error" && (
        <StatusBanner tone="error">{state.message}</StatusBanner>
      )}

      {editing && (
        <form
          key={editing.id}
          onSubmit={handleSave}
          className={styles.form}
        >
          <h2 className={styles.formTitle}>
            Edit submission{" "}
            <span className={styles.formDate}>
              {formatDateTime(editing.submittedAt)}
            </span>
          </h2>

          <FormField
            id="submission-name"
            label="Name"
            error={state.fieldErrors.name}
          >
            <input
              id="submission-name"
              name="name"
              type="text"
              required
              defaultValue={editing.name}
              aria-invalid={state.fieldErrors.name ? true : undefined}
              aria-describedby={
                state.fieldErrors.name ? "submission-name-error" : undefined
              }
            />
          </FormField>

          <FormField
            id="submission-email"
            label="Email"
            error={state.fieldErrors.email}
          >
            <input
              id="submission-email"
              name="email"
              type="text"
              required
              defaultValue={editing.email}
              aria-invalid={state.fieldErrors.email ? true : undefined}
              aria-describedby={
                state.fieldErrors.email ? "submission-email-error" : undefined
              }
            />
          </FormField>

          <FormField
            id="submission-message"
            label="Message"
            error={state.fieldErrors.message}
          >
            <textarea
              id="submission-message"
              name="message"
              rows={5}
              required
              defaultValue={editing.message}
              aria-invalid={state.fieldErrors.message ? true : undefined}
              aria-describedby={
                state.fieldErrors.message
                  ? "submission-message-error"
                  : undefined
              }
            />
          </FormField>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submit}
              disabled={pending}
            >
              {pending ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              className={styles.cancel}
              onClick={cancelEdit}
              disabled={pending}
            >
              Cancel edit
            </button>
          </div>
        </form>
      )}

      <section className={styles.listSection}>
        <h2>Current submissions</h2>
        {loadFailed && (
          <p role="alert" className={styles.loadError}>
            Submissions could not be loaded. Refresh the page to try again.
          </p>
        )}
        {!loadFailed && sorted === null && !denied && (
          <p className={styles.loading}>Loading submissions...</p>
        )}
        {sorted !== null && sorted.length === 0 && (
          <p className={styles.empty}>
            No submissions yet. Messages sent through either contact form will
            appear here.
          </p>
        )}
        {sorted !== null && sorted.length > 0 && (
          <ul className={styles.list}>
            {sorted.map((submission) => (
              <AdminRow
                key={submission.id}
                pending={pending}
                onEdit={() => {
                  setEditing(submission);
                  setState(idleState);
                }}
                onDelete={() => handleDelete(submission)}
                title={submission.name}
                meta={
                  <>
                    <a href={`mailto:${submission.email}`}>
                      {submission.email}
                    </a>{" "}
                    · {formatDateTime(submission.submittedAt)}
                  </>
                }
                detail={
                  <p className={styles.cardMessage}>{submission.message}</p>
                }
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
