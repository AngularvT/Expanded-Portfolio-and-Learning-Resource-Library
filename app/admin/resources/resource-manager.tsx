"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { ResourceApiResponse } from "@/lib/resources-request";
import type { ResourceFieldErrors } from "@/lib/resource-validation";
import type { StoredResource } from "@/lib/resources-store";
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
  fieldErrors: ResourceFieldErrors;
};

const idleState: ManagerState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export default function ResourceManager() {
  const [resources, setResources] = useState<StoredResource[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState<StoredResource | null>(null);
  const [state, setState] = useState<ManagerState>(idleState);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(() => {
    return fetch("/api/resources")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { resources?: StoredResource[] }) => {
        setResources(data.resources ?? []);
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
      link: formData.get("link"),
      category: formData.get("category"),
    };

    setPending(true);
    setState(idleState);

    try {
      const response = await fetch(
        editing ? `/api/resources/${editing.id}` : "/api/resources",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as ResourceApiResponse;

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

  async function handleDelete(resource: StoredResource) {
    if (
      !window.confirm(`Delete "${resource.title}"? This cannot be undone.`)
    ) {
      return;
    }
    setPending(true);
    setState(idleState);
    try {
      const response = await fetch(`/api/resources/${resource.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as ResourceApiResponse;
      if (response.ok && result.status === "success") {
        setState({
          status: "success",
          message: result.message,
          fieldErrors: {},
        });
        if (editing?.id === resource.id) {
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

  function startEdit(resource: StoredResource) {
    setEditing(resource);
    setState(idleState);
  }

  function cancelEdit() {
    setEditing(null);
    setState(idleState);
  }

  return (
    <div className={styles.manager}>
      <form
        key={editing?.id ?? "new"}
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
          id="resource-title"
          label="Title"
          error={state.fieldErrors.title}
        >
          <input
            id="resource-title"
            name="title"
            type="text"
            required
            defaultValue={editing?.title ?? ""}
            aria-invalid={state.fieldErrors.title ? true : undefined}
            aria-describedby={
              state.fieldErrors.title ? "resource-title-error" : undefined
            }
          />
        </FormField>

        <FormField
          id="resource-link"
          label="Link"
          error={state.fieldErrors.link}
        >
          <input
            id="resource-link"
            name="link"
            type="url"
            required
            placeholder="https://example.com/tutorial"
            defaultValue={editing?.link ?? ""}
            aria-invalid={state.fieldErrors.link ? true : undefined}
            aria-describedby={
              state.fieldErrors.link ? "resource-link-error" : undefined
            }
          />
        </FormField>

        <FormField
          id="resource-category"
          label="Category"
          error={state.fieldErrors.category}
        >
          <input
            id="resource-category"
            name="category"
            type="text"
            required
            placeholder="e.g. Game Development"
            defaultValue={editing?.category ?? ""}
            aria-invalid={state.fieldErrors.category ? true : undefined}
            aria-describedby={
              state.fieldErrors.category
                ? "resource-category-error"
                : undefined
            }
          />
        </FormField>

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={pending}>
            {pending
              ? "Saving..."
              : editing
                ? "Save changes"
                : "Add resource"}
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
        <h2>Current resources</h2>
        {loadFailed && (
          <p role="alert" className={styles.loadError}>
            Resources could not be loaded. Refresh the page to try again.
          </p>
        )}
        {!loadFailed && resources === null && (
          <p className={styles.loading}>Loading resources...</p>
        )}
        {resources !== null && resources.length === 0 && (
          <p className={styles.empty}>
            No resources yet. Add the first one with the form above.
          </p>
        )}
        {resources !== null && resources.length > 0 && (
          <ul className={styles.list}>
            {resources.map((resource) => (
              <AdminRow
                key={resource.id}
                pending={pending}
                onEdit={() => startEdit(resource)}
                onDelete={() => handleDelete(resource)}
                title={resource.title}
                meta={`${resource.category} · ${resource.link}`}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
