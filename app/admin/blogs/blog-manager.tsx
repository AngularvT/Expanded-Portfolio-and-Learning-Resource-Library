"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { BlogApiResponse, BlogFieldErrors } from "@/lib/blogs-request";
import type { StoredBlogPost } from "@/lib/blogs-store";
import { formatDate } from "@/lib/format";
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
  fieldErrors: BlogFieldErrors;
};

const idleState: ManagerState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export default function BlogManager() {
  const [posts, setPosts] = useState<StoredBlogPost[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState<StoredBlogPost | null>(null);
  const [state, setState] = useState<ManagerState>(idleState);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(() => {
    return fetch("/api/blogs")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { posts?: StoredBlogPost[] }) => {
        setPosts(data.posts ?? []);
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
      body: formData.get("body"),
    };

    setPending(true);
    setState(idleState);

    try {
      const response = await fetch(
        editing ? `/api/blogs/${editing.slug}` : "/api/blogs",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as BlogApiResponse;

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

  async function handleDelete(post: StoredBlogPost) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }
    setPending(true);
    setState(idleState);
    try {
      const response = await fetch(`/api/blogs/${post.slug}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as BlogApiResponse;
      if (response.ok && result.status === "success") {
        setState({
          status: "success",
          message: result.message,
          fieldErrors: {},
        });
        if (editing?.slug === post.slug) {
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

  function startEdit(post: StoredBlogPost) {
    setEditing(post);
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
          <StatusBanner tone="success">
            {state.message}{" "}
            {editing === null && posts !== null && posts.length > 0 && (
              <Link href="/blogs" className={styles.link}>
                See all posts
              </Link>
            )}
          </StatusBanner>
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
          id="blog-title"
          label="Title"
          error={state.fieldErrors.title}
        >
          <input
            id="blog-title"
            name="title"
            type="text"
            required
            defaultValue={editing?.title ?? ""}
            aria-invalid={state.fieldErrors.title ? true : undefined}
            aria-describedby={
              state.fieldErrors.title ? "blog-title-error" : undefined
            }
          />
        </FormField>

        <FormField id="blog-body" label="Post" error={state.fieldErrors.body}>
          <textarea
            id="blog-body"
            name="body"
            rows={12}
            required
            defaultValue={editing?.body ?? ""}
            aria-invalid={state.fieldErrors.body ? true : undefined}
            aria-describedby={
              state.fieldErrors.body ? "blog-body-error" : undefined
            }
          />
        </FormField>

        {editing && (
          <p className={styles.slugNote}>
            The web address{" "}
            <code>
              /blogs/{editing.slug}
            </code>{" "}
            stays the same when you edit a post.
          </p>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={pending}>
            {pending
              ? "Saving..."
              : editing
                ? "Save changes"
                : "Publish"}
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
        <h2>Current posts</h2>
        {loadFailed && (
          <p role="alert" className={styles.loadError}>
            Posts could not be loaded. Refresh the page to try again.
          </p>
        )}
        {!loadFailed && posts === null && <p className={styles.loading}>Loading posts...</p>}
        {posts !== null && posts.length === 0 && (
          <p className={styles.empty}>
            No posts yet. Publish the first one with the form above.
          </p>
        )}
        {posts !== null && posts.length > 0 && (
          <ul className={styles.list}>
            {posts.map((post) => (
              <AdminRow
                key={post.slug}
                pending={pending}
                onEdit={() => startEdit(post)}
                onDelete={() => handleDelete(post)}
                title={<Link href={`/blogs/${post.slug}`}>{post.title}</Link>}
                meta={`/blogs/${post.slug} · ${formatDate(post.publishedAt)}`}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
