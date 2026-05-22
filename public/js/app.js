// Live clock
function updateClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// Mobile sidebar
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

// Auto-refresh stats every 30s on dashboard
if (document.getElementById('stat-violations')) {
  setInterval(async () => {
    try {
      const data = await fetch('/api/stats').then(r => r.json());
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set('stat-violations', data.totalViolations);
      set('stat-phone', data.phoneViolations);
      set('stat-alerts', data.unacknowledgedAlerts);
    } catch (e) {}
  }, 30000);
}

// Toast auto-dismiss
const toast = document.querySelector('.toast');
if (toast) {
  setTimeout(() => {
    toast.style.transition = 'opacity 0.5s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}
