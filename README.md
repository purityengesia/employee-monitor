# WorkWatch — Employee Monitoring System

Real-time employee productivity monitoring dashboard built with Node.js, Express, EJS, HTML/CSS, and JavaScript.

## Features

- **Dashboard** — Live stats, risk overview, recent alerts
- **Employee Profiles** — Individual activity logs, productivity score, violation history
- **Activity Log** — Filterable log of all web and phone activity
- **Alerts** — Real-time violation alerts with severity levels (HIGH/MEDIUM)
- **Settings** — Configure work hours, alert thresholds, and blocked sites
- **Simulate Events** — Demo tool to trigger live activity events

## What It Monitors

| Signal | Description |
|---|---|
| Web visits | Tracks sites visited during work hours |
| Phone usage | Detects mobile device access to sites |
| Blocked sites | Flags visits to Facebook, Instagram, TikTok, YouTube, etc. |
| Idle time | Detects extended periods of inactivity |
| Risk levels | LOW / MEDIUM / HIGH based on cumulative violations |

## Tech Stack

- **Backend**: Node.js + Express
- **Views**: EJS (Embedded JavaScript Templates)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Session**: express-session
- **Storage**: In-memory (swap for MongoDB/PostgreSQL in production)

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node server.js

# 3. Open browser
http://localhost:3000

# Login credentials
Username: admin
Password: admin123
```

## Project Structure

```
employee-monitor/
├── server.js            # Express app, routes, in-memory data
├── views/
│   ├── partials/
│   │   ├── header.ejs   # Sidebar + top bar
│   │   └── footer.ejs   # Closing tags + scripts
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── employees.ejs
│   ├── employee-detail.ejs
│   ├── activity.ejs
│   ├── alerts.ejs
│   └── settings.ejs
├── public/
│   ├── css/style.css
│   └── js/app.js
└── package.json
```

## Production Notes

- Replace in-memory store with a real database (MongoDB, PostgreSQL)
- Integrate with actual network monitoring agents per device
- Add HTTPS and stronger session secrets
- Use environment variables for secrets (`dotenv`)
- Add role-based access control for multi-manager setups
