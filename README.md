
# WorkWatch — Employee Monitoring System
A real-time web-based employee productivity monitoring system built with Node.js, Express, EJS, HTML, CSS, and JavaScript.

# 🧩 What is it?
WorkWatch is a full-stack web application that allows employers to monitor their employees' online activity during work hours. It tracks which websites employees visit, detects phone usage, flags violations, and provides a live dashboard with productivity scores and risk levels for each employee.

# 🚨 What Problem Does It Solve?
Many employers struggle to know whether their employees are focused during work hours or spending time on social media and personal browsing. WorkWatch solves this by:

Detecting when employees visit blocked/distracting sites like Facebook, TikTok, Instagram, and YouTube during work hours
Flagging phone usage on company time
Giving each employee a productivity score and risk level (LOW, MEDIUM, HIGH)
Sending instant alerts to the employer whenever a violation is detected
Providing a live dashboard so the employer always knows what is happening


# ✨ Features
FeatureDescription🔐 Secure LoginEmployer login with session authentication👤 Profile SettingsChange your name, username and password📊 Live DashboardReal-time stats — employees, violations, alerts👥 Employee ManagementAdd and remove employees from monitoring📱 Phone DetectionDetects mobile device usage during work hours🌐 Web TrackingLogs all websites visited per employee🚨 Instant AlertsHIGH/MEDIUM severity alerts for every violation📈 Productivity ScoreAuto-calculated score per employee based on violations⚠️ Risk LevelsLOW / MEDIUM / HIGH risk assigned automatically⚡ Live SimulationDemo tool to trigger activity events in real time⚙️ SettingsConfigure work hours, blocked sites, alert threshold📱 Responsive DesignWorks on desktop, tablet, and mobile screens

# 🛠️ Tech Stack

Backend: Node.js + Express
Templating: EJS (Embedded JavaScript Templates)
Frontend: HTML, CSS, Vanilla JavaScript
Authentication: express-session
Storage: In-memory (no database required to run)


# 🚀 How to Run on Your Computer
Prerequisites
Make sure you have these installed:

Node.js (version 14 or higher)
Git

# Step 1 — Clone the project
git clone https://github.com/purityengesia/employee-monitor.git
# Step 2 — Enter the project folder
cd employee-monitor
# Step 3 — Install dependencies
npm install
# Step 4 — Start the server
node server.js
# Step 5 — Open in browser
http://localhost:3000
# Step 6 — Login
Username: admin Password: admin123

# 📁 Project Structure

server.js — Express server, routes, business logic
views/login.ejs — Employer login page
views/dashboard.ejs — Main dashboard with live stats
views/employees.ejs — All employees list
views/employee-detail.ejs — Individual employee activity
views/add-employee.ejs — Add new employee form
views/activity.ejs — Full activity log
views/alerts.ejs — All violation alerts
views/profile.ejs — Change name/username/password
views/settings.ejs — Configure monitoring policy
public/css/style.css — All styling and responsive design
public/js/app.js — Frontend JavaScript


# 👩‍💻 Author
Purity Engesia
DI Bootcamp — Week 8 Hackathon Project