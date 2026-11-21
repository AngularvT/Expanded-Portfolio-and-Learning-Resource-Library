"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { StoredResource } from "@/lib/resources-store";
import {
  addToLearningList,
  getMyLearningServerSnapshot,
  getMyLearningSnapshot,
  removeFromLearningList,
  subscribeToMyLearning,
  updateLearningNote,
  writeMyLearning,
} from "@/lib/my-learning";
import ResourceCard from "./resource-card";
import MyLearningList from "./my-learning-list";
import styles from "./resources.module.css";

export default function ResourceList() {
  const [resources, setResources] = useState<StoredResource[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const savedItems = useSyncExternalStore(
    subscribeToMyLearning,
    getMyLearningSnapshot,
    getMyLearningServerSnapshot,
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/resources")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { resources?: StoredResource[] }) => {
        if (!cancelled) {
          setResources(data.resources ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = useCallback((resource: StoredResource) => {
    setStorageError(!writeMyLearning(addToLearningList(getMyLearningSnapshot(), resource)));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setStorageError(!writeMyLearning(removeFromLearningList(getMyLearningSnapshot(), id)));
  }, []);

  const handleSaveNote = useCallback((id: string, note: string) => {
    setStorageError(!writeMyLearning(updateLearningNote(getMyLearningSnapshot(), id, note)));
  }, []);

  const savedIds = new Set(savedItems.map((item) => item.id));

  return (
    <>
      {failed && (
        <p role="alert" className={styles.loadError}>
          Resources could not be loaded. Refresh the page to try again.
        </p>
      )}
      {!failed && resources === null && (
        <p className={styles.loading}>Loading resources...</p>
      )}
      {resources !== null && resources.length === 0 && (
        <p className={styles.empty}>
          No resources yet. Add some from{" "}
          <Link href="/admin/resources" className={styles.adminLink}>
            the admin page
          </Link>
          .
        </p>
      )}
      {resources !== null && resources.length > 0 && (
        <div className={styles.list}>
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onSave={handleSave}
              saved={savedIds.has(resource.id)}
            />
          ))}
        </div>
      )}

      <section className={styles.learningSection}>
        <h2>My Learning List</h2>
        {storageError && (
          <p role="alert" className={styles.loadError}>
            Sorry — your learning list could not be saved because LocalStorage
            is unavailable or full in this browser. You can still browse the
            library and open resources; your list just will not persist.
          </p>
        )}
        <p className={styles.learningIntro}>
          Your personal list, saved in this browser only (LocalStorage). It
          will still be here after a refresh.
        </p>
        <MyLearningList
          items={savedItems}
          onRemove={handleRemove}
          onSaveNote={handleSaveNote}
        />
      </section>
    </>
  );
}
