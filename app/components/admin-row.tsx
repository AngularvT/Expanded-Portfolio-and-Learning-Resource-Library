import type { ReactNode } from "react";
import styles from "../admin/admin.module.css";

export default function AdminRow({
  title,
  meta,
  detail,
  onEdit,
  onDelete,
  pending,
}: {
  title: ReactNode;
  meta?: ReactNode;
  detail?: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  pending: boolean;
}) {
  return (
    <li className={styles.card}>
      <div className={styles.cardText}>
        <div className={styles.cardTitle}>{title}</div>
        {meta && <span className={styles.cardMeta}>{meta}</span>}
        {detail}
      </div>
      <div className={styles.cardActions}>
        <button
          type="button"
          className={styles.editButton}
          onClick={onEdit}
          disabled={pending}
        >
          Edit
        </button>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={onDelete}
          disabled={pending}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
