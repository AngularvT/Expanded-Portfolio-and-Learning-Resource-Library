# Portfolio — ISBA2438 Assignment 2

A personal portfolio built with Next.js (App Router, TypeScript, CSS modules).
It includes the static portfolio pages, a blog with admin CRUD, a Learning
Resource Library with a personal "My Learning List" saved in the browser, and
contact forms backed by a JSON file on the server.

## Setup

```bash
npm install
npm run dev        # development server on http://localhost:3000
```

For a production-style run (what the tests use):

```bash
npm run build
npm start          # http://localhost:3000
```

Node 20+ recommended.

## Features and where to find them

| Feature | Public page | Admin page | API |
| --- | --- | --- | --- |
| Portfolio | `/`, `/about-me` | — | — |
| Projects | `/projects`, `/projects/[slug]` | `/admin/projects` | `/api/projects` |
| Blog | `/blogs`, `/blogs/[slug]` | `/admin/blogs` | `/api/blogs` |
| Resources | `/resources` | `/admin/resources` | `/api/resources` |
| Contact | `/contact-me-server-form` (Server Action), `/contact-me` (JSON/fetch) | `/admin/contacts` (opt-in, see below) | `POST /api/contacts`, `POST /api/contact` |

## Backend JSON storage

All server-side data lives in `data/`:

- `projects.json`, `blogs.json`, `resources.json` — content edited through the
  admin pages.
- `submissions.json` — contact form submissions. **This file is gitignored**
  (see `.gitignore`) so real submissions never enter version control. Server
  logs record only method, route, and status (`[api] POST /api/resources -> 201`)
  — never form contents.

## Enabling contact management (local demo only, off by default)

Contact submission management is disabled by default. To enable it for a
local demo:

1. Create a `.env.local` file with:
   ```
   CONTACT_ADMIN_ENABLED=true
   ```
   (or prefix the start command: `CONTACT_ADMIN_ENABLED=true npm start`)
2. Restart the server.
3. Open `http://localhost:3000/admin/contacts`.

When enabled, viewing, editing, and deleting submissions is still limited to
requests from your own machine (localhost) — remote requests get `403`. The
public contact forms work regardless of this setting. With the setting off,
the admin page explains that management is unavailable and the admin API
returns `403`.

## Project structure

```
app/            pages, admin pages, API routes, shared components
lib/            validation, JSON stores, request handlers, access rules
data/           JSON files the server reads and writes
```

Each content feature follows the same split: a pure validation module
(`lib/<feature>-validation.ts`), a store owning its JSON file
(`lib/<feature>-store.ts`), and request handlers
(`lib/<feature>-request.ts`).
