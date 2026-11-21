import type { StoredResource } from "@/lib/resources-store";
import styles from "./resource-card.module.css";

export default function ResourceCard({
  resource,
  onSave,
  saved = false,
}: {
  resource: StoredResource;
  onSave?: (resource: StoredResource) => void;
  saved?: boolean;
}) {
  return (
    <article className={styles.card}>
      <span className={styles.category}>{resource.category}</span>
      <a
        href={resource.link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.titleLink}
      >
        {resource.title}
      </a>
      <span className={styles.url}>{resource.link}</span>
      {onSave && (
        <button
          type="button"
          className={styles.saveButton}
          onClick={() => onSave(resource)}
          disabled={saved}
        >
          {saved ? "Saved to My Learning List" : "Save to My Learning List"}
        </button>
      )}
    </article>
  );
}
