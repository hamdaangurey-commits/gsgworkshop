# HAMDAN PERSONAL OS

A personal finance website for Mr Hamdan, built mobile-first for Android Chrome. It has a dark navy and blue look, a login welcome screen with two wallpapers (Blue 💙 and Light Blue), and a dashboard branded **HAMdan**.

## Features

- **Login**: shows "Soo dhawoow Mr Hamdan". Username `Hamdan`, password `2288`. After login it shows "Waad bilaawi kartaa xisaabta".
- **Dashboard**: says "Welcome Mr Hamdan" and has a circular profile photo you can upload. It shows a ring for the $200 monthly income target (editable), totals for income, expenses, balance and investments, a 7-day chart, quick actions, and recent activity.
- **Six editable accounts**: each has a name, opening balance, colour and note. Balances update from the income and expenses linked to that account.
- **Family Investment** and **Personal Investment**: record what you invested and what it is worth now, and see the gain or loss and return.
- **Income & expense tracking**: filter by type, month and account, and search.
- **Calculator**: has keyboard support and a history, and can save a result as income or an expense.
- **Daily financial notes**: each note has a tag, and you can search them.
- **Daily reports**: move from day to day, see spending by category and month-to-date progress, and print the report.
- **Printable bills**: add line items and a discount, mark paid or unpaid, print or save as PDF, and optionally record the bill total as income.
- **Calendar**: a month grid with markers for income, expenses, notes and bills. Tap a day to see its details or add entries to it.
- **Recycle bin**: deleted items can be restored, all at once or one by one, or deleted permanently. Each deletion also offers an Undo toast.
- **Backup**: export or import everything as a JSON file, export transactions as CSV, and reset all data.

## Technology

Plain **HTML, CSS and JavaScript**. There is no framework and no build step. All data is saved in the browser with `localStorage`, so it stays on the device.

Files:

| File | Purpose |
| --- | --- |
| `index.html` | Page shell (login, splash, app layout, modal) |
| `styles.css` | Theme, wallpapers, responsive layout, print styles |
| `app.js` | All app logic, views and storage |
| `manifest.webmanifest`, `icon.svg` | Lets the site be added to the Android home screen |
| `netlify.toml` | Netlify deploy config (publishes the root folder) |

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
netlify dev
```

## Deploy

Push to the connected repository, or drag the folder into Netlify. No build command is needed. The publish directory is the project root.

## Notes

- The login is a simple screen that runs in the browser. It keeps casual visitors out, but it is not real account security.
- Data is stored per browser and device. Use **Backup & Settings → Export JSON** to move data or keep a copy.
