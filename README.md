# Said Banking — Private Banking Portal

A fully responsive, production-grade private banking web application.

## Project Structure

```
said-banking/
├── index.html        ← Main HTML (all pages/screens)
├── css/
│   └── style.css     ← All styles + responsive breakpoints
├── js/
│   ├── db.js         ← In-memory database & seed data
│   └── app.js        ← All application logic
└── README.md
```

## Features

- **Authentication** — Sign in or register a new account
- **Overview** — Live account balances, stats summary, transaction history
- **Transfer** — Move funds between accounts instantly
- **Profile** — Account tier, total assets, and session info

## Responsive Design

| Breakpoint | Layout |
|---|---|
| Mobile (≤640px) | Stacked auth, bottom tab navigation |
| Tablet (641–900px) | Side-by-side auth, top navigation |
| Desktop (≥901px) | Full split-screen auth, full top navigation |

## Running Locally

Simply open `index.html` in any modern browser — no build step required.

```bash
# Option 1: open directly
open index.html

# Option 2: serve with a local server (recommended)
npx serve .
# or
python3 -m http.server 3000
```

## Demo Account

| Field | Value |
|---|---|
| Email | said@bank.com |
| Password | pass123 |

## Technology

- Vanilla HTML, CSS, JavaScript — zero dependencies, zero build step
- [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) + [Inter](https://fonts.google.com/specimen/Inter) from Google Fonts
- [Tabler Icons](https://tabler-icons.io) webfont via jsDelivr

---
Said Banking © 2025 — Private Banking Portal
website: 
