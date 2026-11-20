# AGENTS.md — HAMDAN PERSONAL OS

## Project overview
- Static site with no build step.
- Netlify publishes the repository root; `netlify.toml` uses `publish = "."`.
- Keep the app mobile-first and compatible with Android Chrome.
- Do not introduce a framework or build process unless the owner explicitly asks.

## File responsibilities
- `index.html` is the application shell only: login screen, splash, sidebar, topbar, `#view`, bottom bar, FAB, shared modal, toasts, and `#print-area`.
- `app.js` contains the application logic in one IIFE.
- `styles.css` contains styling and responsive layout.
- Other static assets include `manifest.webmanifest`, `icon.svg`, and `netlify.toml`.

## State and persistence
- Application state is `S`, persisted to `localStorage` under `hamdan_os_v1`.
- `normalize()` merges defaults and always forces exactly 6 accounts.
- Call `save()` after every state mutation.
- Session key is `hamdan_os_session` in localStorage when “Keep me signed in” is checked; otherwise use sessionStorage.
- Credentials are constants (`USER`, `PASS`).
- Finance data is browser/device-local. Do not assume Netlify deployment rollback restores localStorage data.
- Never upload, reset, migrate, or overwrite finance data as part of an ordinary code update without explicit owner approval and a verified backup.

## Routing and rendering
- Hash router uses routes such as `#/dashboard` and `#/accounts`.
- `VIEWS[name](el)` renders into `#view`.
- `render(false)` rerenders the current view without the entry animation; use it after data changes.

## Actions and forms
- Buttons use `data-act="name"` and optional `data-id="…"`.
- One delegated click handler on `#view` calls `actions[name](id, el)`.
- `actions` resets to `COMMON` on every render; each view adds its own handlers.
- `fabAction` controls the FAB.
- Use `openForm({title, fields, values, onSubmit, onMount})`.
- Returning `false` from `onSubmit` keeps the modal open.
- Bill editor uses the custom `billForm`.

## Recycle bin and printing
- Deletes use `moveToBin(collection, id)`, which pushes `{col, item, deletedAt}` into `S.bin`.
- `restoreBin(id)` reverses the recycle-bin operation.
- Accounts are never deleted.
- Printing uses `doPrint(html)`, fills `#print-area`, and CSS `@media print` hides everything else.
- Use existing `.p-*` print classes in `styles.css`.

## Styling and responsive layout
- CSS variables live in `:root`.
- Mobile-first breakpoints are 600px, 900px, and 1024px; sidebar is permanent at 1024px.
- Wallpapers use `body.wp-blue` and `body.wp-light`, with `.wall` and `.hero-wall`.

## Coding conventions
- Escape user-provided text with `esc()` before inserting it into HTML templates.
- Store money as numeric values in state and format with `money()`.
- Store dates as local `YYYY-MM-DD` using `ymd()`; do not use `toISOString()` for dates.
- Preserve exact UI copy:
  - “Soo dhawoow Mr Hamdan”
  - “Waad bilaawi kartaa xisaabta”
  - “Welcome Mr Hamdan”
  - Brand: “HAMdan”

## Update and release safety
- Make changes on a feature branch and use a pull request for review.
- Run `node --check app.js`, validate inline JavaScript where applicable, and run `git diff --check`.
- Require explicit owner approval before merging or releasing production changes.
- Before any change that could affect user data, create and validate a JSON backup of `hamdan_os_v1`.
- Do not put GitHub tokens, Netlify tokens, build-hook URLs, passwords, or other secrets in browser JavaScript, commits, or chat messages.
- Never claim a production deployment succeeded until its status is verified.
