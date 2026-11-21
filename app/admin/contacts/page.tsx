import { Suspense } from "react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import SubmissionManager from "./submission-manager";
import { isContactManagementEnabled } from "@/lib/contact-admin-config";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Contacts admin — Lanboer Zhao",
};

async function ContactAdminPanel() {
  await headers();

  if (!isContactManagementEnabled()) {
    return (
      <div role="alert" className={styles.denied}>
        <h2>Management unavailable</h2>
        <p>
          Contact management is turned off on this server, so submissions
          cannot be viewed, edited, or deleted here. This is the default. The
          public contact forms keep working.
        </p>
        <p>
          To enable it for a local demo, set{" "}
          <code>CONTACT_ADMIN_ENABLED=true</code> in{" "}
          <code>.env.local</code> (or prefix the start command with the
          variable) and restart the server. Management then stays limited to
          requests from your own machine.
        </p>
      </div>
    );
  }

  return <SubmissionManager />;
}

export default function ContactsAdminPage() {
  return (
    <div className={styles.page}>
      <h1>Manage contact submissions</h1>
      <p>
        Review, edit, or delete the messages people sent through the contact
        forms. Management is opt-in for the local demo and the same rule is
        enforced by the admin API routes. The submissions file is never
        committed to Git.
      </p>
      <p>
        The public forms live at{" "}
        <Link href="/contact-me-server-form" className={styles.link}>
          /contact-me-server-form
        </Link>{" "}
        and{" "}
        <Link href="/contact-me" className={styles.link}>
          /contact-me
        </Link>
        .
      </p>
      <Suspense
        fallback={<p className={styles.loading}>Checking settings…</p>}
      >
        <ContactAdminPanel />
      </Suspense>
    </div>
  );
}
