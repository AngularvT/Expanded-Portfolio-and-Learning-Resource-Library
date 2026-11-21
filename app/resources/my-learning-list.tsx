"use client";

import { useState } from "react";
import type { SavedResource } from "@/lib/my-learning";
import styles from "./resources.module.css";

export default function MyLearningList({
  items,
  onRemove,
  onSaveNote,
}: {
  items: SavedResource[];
  onRemove: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
}) {
  const [editing, setEditing] = useState<{ id: string; draft: string } | null>(
    null,
  );

  if (items.length === 0) {
    return (
      <p className={styles.learningEmpty}>
        Your learning list is empty. Use the Save button on any resource above
        to build your own list.
      </p>
    );
  }

  return (
    <ul className={styles.learningList}>
      {items.map((item) => (
        <li key={item.id} className={styles.learningCard}>
          <div className={styles.learningHead}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.learningTitle}
            >
              {item.title}
            </a>
            <span className={styles.learningMeta}>
              {item.category}
              {item.savedAt.length > 0 &&
                ` · saved ${new Date(item.savedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}`}
            </span>
          </div>

          {editing?.id === item.id ? (
            <div className={styles.noteEditor}>
              <textarea
                aria-label={`Note for ${item.title}`}
                value={editing.draft}
                maxLength={300}
                rows={3}
                onChange={(event) =>
                  setEditing({ id: item.id, draft: event.target.value })
                }
                className={styles.noteTextarea}
              />
              <div className={styles.noteActions}>
                <button
                  type="button"
                  className={styles.noteSave}
                  onClick={() => {
                    onSaveNote(item.id, editing.draft);
                    setEditing(null);
                  }}
                >
                  Save note
                </button>
                <button
                  type="button"
                  className={styles.noteCancel}
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.noteDisplay}>
              <p className={styles.noteText}>
                {item.note.length > 0 ? item.note : "No note yet."}
              </p>
              <div className={styles.noteActions}>
                <button
                  type="button"
                  className={styles.noteButton}
                  onClick={() =>
                    setEditing({ id: item.id, draft: item.note })
                  }
                >
                  {item.note.length > 0 ? "Edit note" : "Add note"}
                </button>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => onRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
