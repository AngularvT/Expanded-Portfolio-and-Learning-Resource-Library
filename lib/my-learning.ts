export const MY_LEARNING_KEY = "my-learning-list";

export type SavedResource = {
  id: string;
  title: string;
  link: string;
  category: string;
  note: string;
  savedAt: string;
};

function normalizeSavedResource(value: unknown): SavedResource | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    record.id.length === 0 ||
    typeof record.title !== "string" ||
    record.title.length === 0 ||
    typeof record.link !== "string" ||
    record.link.length === 0
  ) {
    return null;
  }
  return {
    id: record.id,
    title: record.title,
    link: record.link,
    category:
      typeof record.category === "string" && record.category.length > 0
        ? record.category
        : "Uncategorized",
    note: typeof record.note === "string" ? record.note : "",
    savedAt: typeof record.savedAt === "string" ? record.savedAt : "",
  };
}

export function parseMyLearning(raw: string | null): SavedResource[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const items: SavedResource[] = [];
    for (const entry of parsed) {
      const normalized = normalizeSavedResource(entry);
      if (normalized) {
        items.push(normalized);
      }
    }
    return items;
  } catch {
    return [];
  }
}

export function addToLearningList(
  items: SavedResource[],
  resource: { id: string; title: string; link: string; category: string },
): SavedResource[] {
  if (items.some((item) => item.id === resource.id)) {
    return items;
  }
  return [
    ...items,
    { ...resource, note: "", savedAt: new Date().toISOString() },
  ];
}

export function removeFromLearningList(
  items: SavedResource[],
  id: string,
): SavedResource[] {
  return items.filter((item) => item.id !== id);
}

export function updateLearningNote(
  items: SavedResource[],
  id: string,
  note: string,
): SavedResource[] {
  const trimmed = note.trim();
  return items.map((item) =>
    item.id === id ? { ...item, note: trimmed } : item,
  );
}

const listeners = new Set<() => void>();
const EMPTY: SavedResource[] = [];
let cachedRaw: string | null = null;
let cachedItems: SavedResource[] = EMPTY;

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function handleStorage(event: StorageEvent) {
  if (event.key === null || event.key === MY_LEARNING_KEY) {
    emitChange();
  }
}

export function subscribeToMyLearning(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getMyLearningSnapshot(): SavedResource[] {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(MY_LEARNING_KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parseMyLearning(raw);
  }
  return cachedItems;
}

export function getMyLearningServerSnapshot(): SavedResource[] {
  return EMPTY;
}

export function writeMyLearning(items: SavedResource[]): boolean {
  let raw: string;
  try {
    raw = JSON.stringify(items);
    window.localStorage.setItem(MY_LEARNING_KEY, raw);
  } catch {
    return false;
  }
  cachedRaw = raw;
  cachedItems = items;
  emitChange();
  return true;
}
