const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

const store = {
  employees: [],
  activityLogs: [],
  alerts: [],
  nextId: 1,
  settings: {
    workStart: '08:00',
    workEnd: '17:00',
    alertThreshold: 3,
    blockedSites: ['facebook.com', 'twitter.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'netflix.com', 'reddit.com'],
  }
};

// Admin credentials (changeable at runtime)
const admin = {
  username: 'admin',
  password: 'admin123',
  name: 'Manager Admin',
};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'monitor-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function requireAuth(req, res, next) {
  if (req.session && req.session.employer) return next();
  res.redirect('/login');
}

function getViolationMap() {
  const map = {};
  store.employees.forEach(e => { map[e.id] = 0; });
  store.activityLogs.filter(l => l.isViolation).forEach(v => {
    map[v.employeeId] = (map[v.employeeId] || 0) + 1;
  });
  return map;
}

function riskLevel(count) {
  return count >= 5 ? 'high' : count >= 2 ? 'medium' : 'low';
}

function makeAvatar(name) {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

// ── Auth ──────────────────────────────────────────────
app.get('/login', (req, res) => {
  if (req.session.employer) return res.redirect('/');
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === admin.username && password === admin.password) {
    req.session.employer = { username: admin.username, name: admin.name };
    return res.redirect('/');
  }
  res.render('login', { error: 'Invalid credentials.' });
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/login'); });

// ── Dashboard ─────────────────────────────────────────
app.get('/', requireAuth, (req, res) => {
  const violations = store.activityLogs.filter(l => l.isViolation);
  const phoneViolations = violations.filter(l => l.device === 'mobile');
  const unacknowledgedAlerts = store.alerts.filter(a => !a.acknowledged);
  const violationMap = getViolationMap();

  const riskEmployees = store.employees.map(e => ({
    ...e,
    violationCount: violationMap[e.id] || 0,
    riskLevel: riskLevel(violationMap[e.id] || 0)
  })).sort((a, b) => b.violationCount - a.violationCount);

  res.render('dashboard', {
    employer: req.session.employer,
    totalEmployees: store.employees.length,
    totalViolations: violations.length,
    phoneViolations: phoneViolations.length,
    unacknowledgedAlerts: unacknowledgedAlerts.length,
    riskEmployees,
    recentAlerts: store.alerts.slice(0, 8),
  });
});

// ── Employees ─────────────────────────────────────────
app.get('/employees', requireAuth, (req, res) => {
  const violationMap = getViolationMap();
  const employees = store.employees.map(e => ({
    ...e,
    violationCount: violationMap[e.id] || 0,
    riskLevel: riskLevel(violationMap[e.id] || 0),
    lastActivity: store.activityLogs.find(l => l.employeeId === e.id)
  }));
  res.render('employees', { employer: req.session.employer, employees });
});

// Add employee form
app.get('/employees/add', requireAuth, (req, res) => {
  res.render('add-employee', { employer: req.session.employer, error: null });
});

// Add employee submit
app.post('/employees/add', requireAuth, (req, res) => {
  const { name, department, email } = req.body;
  if (!name || !department || !email) {
    return res.render('add-employee', { employer: req.session.employer, error: 'All fields are required.' });
  }
  const existing = store.employees.find(e => e.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.render('add-employee', { employer: req.session.employer, error: 'An employee with that email already exists.' });
  }
  const emp = {
    id: store.nextId++,
    name: name.trim(),
    department: department.trim(),
    email: email.trim(),
    status: 'online',
    avatar: makeAvatar(name),
    addedAt: Date.now(),
  };
  store.employees.push(emp);
  res.redirect('/employees');
});

// Delete employee
app.post('/employees/:id/delete', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  store.employees = store.employees.filter(e => e.id !== id);
  store.activityLogs = store.activityLogs.filter(l => l.employeeId !== id);
  store.alerts = store.alerts.filter(a => a.employeeId !== id);
  res.redirect('/employees');
});

// Employee detail
app.get('/employees/:id', requireAuth, (req, res) => {
  const emp = store.employees.find(e => e.id === parseInt(req.params.id));
  if (!emp) return res.redirect('/employees');
  const logs = store.activityLogs.filter(l => l.employeeId === emp.id);
  const empAlerts = store.alerts.filter(a => a.employeeId === emp.id);
  const violations = logs.filter(l => l.isViolation);
  const phoneViolations = logs.filter(l => l.device === 'mobile' && l.isViolation);
  res.render('employee-detail', {
    employer: req.session.employer,
    employee: emp,
    logs,
    alerts: empAlerts,
    totalLogs: logs.length,
    violations: violations.length,
    phoneViolations: phoneViolations.length,
    productivity: Math.max(0, 100 - (violations.length * 8)),
  });
});

// ── Activity ──────────────────────────────────────────
app.get('/activity', requireAuth, (req, res) => {
  const { filter, employee } = req.query;
  let logs = [...store.activityLogs];
  if (filter === 'violations') logs = logs.filter(l => l.isViolation);
  if (filter === 'phone') logs = logs.filter(l => l.device === 'mobile');
  if (employee) logs = logs.filter(l => l.employeeId === parseInt(employee));
  res.render('activity', {
    employer: req.session.employer,
    logs: logs.slice(0, 100),
    employees: store.employees,
    filter: filter || 'all',
    selectedEmployee: employee || '',
  });
});

// ── Alerts ────────────────────────────────────────────
app.get('/alerts', requireAuth, (req, res) => {
  res.render('alerts', {
    employer: req.session.employer,
    alerts: store.alerts,
    unreadCount: store.alerts.filter(a => !a.acknowledged).length,
  });
});

app.post('/alerts/:id/acknowledge', requireAuth, (req, res) => {
  const alert = store.alerts.find(a => a.id === parseInt(req.params.id));
  if (alert) alert.acknowledged = true;
  res.json({ success: true });
});

app.post('/alerts/acknowledge-all', requireAuth, (req, res) => {
  store.alerts.forEach(a => a.acknowledged = true);
  res.json({ success: true });
});

// ── Settings ──────────────────────────────────────────
app.get('/settings', requireAuth, (req, res) => {
  res.render('settings', { employer: req.session.employer, settings: store.settings, saved: false });
});

app.post('/settings', requireAuth, (req, res) => {
  const { workStart, workEnd, alertThreshold, blockedSites } = req.body;
  store.settings.workStart = workStart;
  store.settings.workEnd = workEnd;
  store.settings.alertThreshold = parseInt(alertThreshold);
  store.settings.blockedSites = blockedSites
    ? blockedSites.split('\n').map(s => s.trim()).filter(Boolean)
    : store.settings.blockedSites;
  res.render('settings', { employer: req.session.employer, settings: store.settings, saved: true });
});

// ── API: Simulate activity ────────────────────────────
app.post('/api/activity', requireAuth, (req, res) => {
  const { employeeId, type, site, device } = req.body;
  const emp = store.employees.find(e => e.id === parseInt(employeeId));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const isViolation = store.settings.blockedSites.includes(site) || type === 'phone_detected';
  const log = {
    id: store.activityLogs.length + 1,
    employeeId: emp.id,
    employeeName: emp.name,
    type,
    site: site || null,
    timestamp: Date.now(),
    isViolation,
    device: device || 'desktop',
    duration: 0,
  };
  store.activityLogs.unshift(log);
  if (isViolation) {
    store.alerts.unshift({
      id: store.alerts.length + 2000,
      employeeId: emp.id,
      employeeName: emp.name,
      message: type === 'phone_detected'
        ? `${emp.name} accessed ${site} on a mobile device during work hours`
        : `${emp.name} visited restricted site: ${site}`,
      timestamp: Date.now(),
      severity: type === 'phone_detected' ? 'high' : 'medium',
      acknowledged: false,
    });
  }
  res.json({ success: true, isViolation, log });
});

// API: live stats
app.get('/api/stats', requireAuth, (req, res) => {
  const violations = store.activityLogs.filter(l => l.isViolation);
  res.json({
    totalEmployees: store.employees.length,
    totalViolations: violations.length,
    phoneViolations: violations.filter(l => l.device === 'mobile').length,
    unacknowledgedAlerts: store.alerts.filter(a => !a.acknowledged).length,
  });
});

// ── Profile / Change credentials ──────────────────────
app.get('/profile', requireAuth, (req, res) => {
  res.render('profile', {
    employer: req.session.employer,
    admin,
    success: null,
    error: null,
  });
});

app.post('/profile', requireAuth, (req, res) => {
  const { fullName, username, currentPassword, newPassword, confirmPassword } = req.body;

  // Verify current password
  if (currentPassword !== admin.password) {
    return res.render('profile', {
      employer: req.session.employer,
      admin,
      success: null,
      error: 'Current password is incorrect.',
    });
  }

  // Validate new password match if provided
  if (newPassword && newPassword !== confirmPassword) {
    return res.render('profile', {
      employer: req.session.employer,
      admin,
      success: null,
      error: 'New passwords do not match.',
    });
  }

  // Apply changes
  admin.name = fullName.trim() || admin.name;
  admin.username = username.trim() || admin.username;
  if (newPassword) admin.password = newPassword;

  // Update session with new name/username
  req.session.employer.name = admin.name;
  req.session.employer.username = admin.username;

  res.render('profile', {
    employer: req.session.employer,
    admin,
    success: 'Profile updated successfully!',
    error: null,
  });
});

app.listen(PORT, () => {
  console.log(`\n🖥️  Employee Monitor running at http://localhost:${PORT}`);
  console.log(`   Login: admin / admin123\n`);
});
