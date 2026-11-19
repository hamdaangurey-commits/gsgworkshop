# AGENTS.md — HAMDAN PERSONAL OS

## Architecture
- A static site with no build step. Netlify publishes the repo root (`netlify.toml` → `publish = "."`).
- `index.html` contains only the shell: login screen, splash, sidebar, topbar, `#view` container, bottom bar, FAB, the shared modal, toasts and `#print-area`.
- `app.js` is one IIFE that holds everything:
  - **State**: `S` is a single object persisted to `localStorage` under the key `hamdan_os_v1`. `normalize()` merges with `defaults()` and always forces exactly 6 accounts. Call `save()` after every mutation.
  - **Session**: the key `hamdan_os_session` lives in localStorage when "Keep me signed in" is ticked, otherwise in sessionStorage. The credentials are constants (`USER`, `PASS`).
  - **Router**: hash-based (`#/dashboard`, `#/accounts`, …). `VIEWS[name](el)` renders into `#view`. `render(false)` re-renders the current view without its entry animation (use it after data changes).
  - **Events**: buttons use `data-act="name" data-id="…"`. A single delegated click handler on `#view` calls `actions[name](id, el)`. `actions` resets to `COMMON` on every render, and each view adds its own handlers. `fabAction` sets what the floating + button does on that view.
  - **Forms**: `openForm({title, fields, values, onSubmit, onMount})` builds modal forms. Return `false` from `onSubmit` to keep the modal open. The bill editor is custom (`billForm`).
  - **Recycle bin**: deletes go through `moveToBin(collection, id)`, which pushes `{col, item, deletedAt}` into `S.bin`. `restoreBin(id)` reverses it. Accounts are never deleted.
  - **Printing**: `doPrint(html)` fills `#print-area`, and `@media print` hides everything else. The `.p-*` classes in `styles.css` style the printed documents.
- `styles.css`: CSS variables in `:root`, mobile-first with breakpoints at 600 / 900 / 1024px (the sidebar becomes permanent at 1024px). The wallpapers come from `body.wp-blue` / `body.wp-light` and apply to `.wall` (login) and `.hero-wall` (dashboard hero).

## Conventions
- Escape all user text with `esc()` before putting it into HTML templates.
- Money is always a number in state. Format it with `money()`. Dates are local `YYYY-MM-DD` strings (`ymd()`), never `toISOString()` dates.
- Keep the UI copy: "Soo dhawoow Mr Hamdan", "Waad bilaawi kartaa xisaabta", "Welcome Mr Hamdan", and the brand "HAMdan".
- Do not add a build step or a framework unless the owner asks for one.
