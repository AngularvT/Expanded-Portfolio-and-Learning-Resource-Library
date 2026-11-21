export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.length > 0 ? base : "post";
}

export function uniqueSlug(title: string, takenSlugs: string[]): string {
  const taken = new Set(takenSlugs);
  const base = slugifyTitle(title);
  let slug = base;
  let counter = 2;
  while (taken.has(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}
