import type { ReactNode } from "react";
import styles from "../admin/admin.module.css";

export default function StatusBanner({
  tone,
  children,
}: {
  tone: "success" | "error" | "warning";
  children: ReactNode;
}) {
  const className =
    tone === "success"
      ? styles.success
      : tone === "error"
        ? styles.formError
        : styles.saveError;
  return (
    <p role={tone === "success" ? "status" : "alert"} className={className}>
      {children}
    </p>
  );
}
