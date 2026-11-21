"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { ProjectApiResponse } from "@/lib/projects-request";
import type { ProjectFieldErrors } from "@/lib/project-validation";
import type { StoredProject } from "@/lib/projects-store";
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
    | "not-found";
  message: string;
  fieldErrors: ProjectFieldErrors;
};

const idleState: ManagerState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

function parseToolsInput(raw: string): string[] {
  return raw
    .split(",")
    .map((tool) => tool.trim())
    .filter((tool) => tool.length > 0);
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<StoredProject[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState<StoredProject | null>(null);
  const [state, setState] = useState<ManagerState>(idleState);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(() => {
    return fetch("/api/projects")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { projects?: StoredProject[] }) => {
        setProjects(data.projects ?? []);
        setLoadFailed(false);
      })
      .catch(() => {
        setLoadFailed(true);
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: formData.get("title"),
      summary: formData.get("summary"),
      description: formData.get("description"),
      contribution: formData.get("contribution"),
      tools: parseToolsInput(String(formData.get("tools") ?? "")),
    };

    setPending(true);
    setState(idleState);

    try {
      const response = await fetch(
        editing ? `/api/projects/${editing.slug}` : "/api/projects",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as ProjectApiResponse;

      if (response.ok && result.status === "success") {
        setState({
          status: "success",
          message: result.message,
          fieldErrors: {},
        });
        if (!editing) {
          form.reset();
        }
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
          status:
            result.status === "not-found"
              ? "not-found"
              : result.status === "request-error"
                ? "request-error"
                : "save-error",
          message: result.message,
          fieldErrors: {},
        });
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

  async function handleDelete(project: StoredProject) {
    if (
      !window.confirm(`Delete "${project.title}"? This cannot be undone.`)
    ) {
      return;
    }
    setPending(true);
    setState(idleState);
    try {
      const response = await fetch(`/api/projects/${project.slug}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as ProjectApiResponse;
      if (response.ok && result.status === "success") {
        setState({
          status: "success",
          message: result.message,
          fieldErrors: {},
        });
        if (editing?.slug === project.slug) {
          setEditing(null);
        }
      } else {
        setState({
          status: result.status === "not-found" ? "not-found" : "save-error",
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

  function startEdit(project: StoredProject) {
    setEditing(project);
    setState(idleState);
  }

  function cancelEdit() {
    setEditing(null);
    setState(idleState);
  }

  return (
    <div className={styles.manager}>
      <form
        key={editing?.slug ?? "new"}
        onSubmit={handleSubmit}
        className={styles.form}
      >
        {state.status === "success" && (
          <StatusBanner tone="success">{state.message}</StatusBanner>
        )}
        {(state.status === "save-error" ||
          state.status === "request-error" ||
          state.status === "not-found") && (
          <StatusBanner tone="warning">{state.message}</StatusBanner>
        )}
        {state.status === "validation-error" && (
          <StatusBanner tone="error">{state.message}</StatusBanner>
        )}

        <FormField
          id="project-title"
          label="Title"
          error={state.fieldErrors.title}
        >
          <input
            id="project-title"
            name="title"
            type="text"
            required
            defaultValue={editing?.title ?? ""}
            aria-invalid={state.fieldErrors.title ? true : undefined}
            aria-describedby={
              state.fieldErrors.title ? "project-title-error" : undefined
            }
          />
        </FormField>

        <FormField
          id="project-summary"
          label="Summary"
          error={state.fieldErrors.summary}
        >
          <input
            id="project-summary"
            name="summary"
            type="text"
            required
            defaultValue={editing?.summary ?? ""}
            aria-invalid={state.fieldErrors.summary ? true : undefined}
            aria-describedby={
              state.fieldErrors.summary ? "project-summary-error" : undefined
            }
          />
        </FormField>

        <FormField
          id="project-description"
          label="What it does"
          error={state.fieldErrors.description}
        >
          <textarea
            id="project-description"
            name="description"
            rows={4}
            required
            defaultValue={editing?.description ?? ""}
            aria-invalid={state.fieldErrors.description ? true : undefined}
            aria-describedby={
              state.fieldErrors.description
                ? "project-description-error"
                : undefined
            }
          />
        </FormField>

        <FormField
          id="project-contribution"
          label="What I contributed"
          error={state.fieldErrors.contribution}
        >
          <textarea
            id="project-contribution"
            name="contribution"
            rows={4}
            required
            defaultValue={editing?.contribution ?? ""}
            aria-invalid={state.fieldErrors.contribution ? true : undefined}
            aria-describedby={
              state.fieldErrors.contribution
                ? "project-contribution-error"
                : undefined
            }
          />
        </FormField>

        <FormField
          id="project-tools"
          label="Tools (comma-separated)"
          error={state.fieldErrors.tools}
        >
          <input
            id="project-tools"
            name="tools"
            type="text"
            required
            placeholder="e.g. Unity, C#"
            defaultValue={editing?.tools.join(", ") ?? ""}
            aria-invalid={state.fieldErrors.tools ? true : undefined}
            aria-describedby={
              state.fieldErrors.tools ? "project-tools-error" : undefined
            }
          />
        </FormField>

        {editing && (
          <p className={styles.slugNote}>
            The web address{" "}
            <code>/projects/{editing.slug}</code> stays the same when you edit
            a project.
          </p>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={pending}>
            {pending
              ? "Saving..."
              : editing
                ? "Save changes"
                : "Add project"}
          </button>
          {editing && (
            <button
              type="button"
              className={styles.cancel}
              onClick={cancelEdit}
              disabled={pending}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <section className={styles.listSection}>
        <h2>Current projects</h2>
        {loadFailed && (
          <p role="alert" className={styles.loadError}>
            Projects could not be loaded. Refresh the page to try again.
          </p>
        )}
        {!loadFailed && projects === null && (
          <p className={styles.loading}>Loading projects...</p>
        )}
        {projects !== null && projects.length === 0 && (
          <p className={styles.empty}>
            No projects yet. Add the first one with the form above.
          </p>
        )}
        {projects !== null && projects.length > 0 && (
          <ul className={styles.list}>
            {projects.map((project) => (
              <AdminRow
                key={project.slug}
                pending={pending}
                onEdit={() => startEdit(project)}
                onDelete={() => handleDelete(project)}
                title={
                  <Link href={`/projects/${project.slug}`}>
                    {project.title}
                  </Link>
                }
                meta={`/projects/${project.slug}`}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
