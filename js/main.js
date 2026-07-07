import { getData, seedDemoData, checkAndGenerateNotifications, getUnreadCount } from './store.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderStaffPage } from './modules/staff.js';
import { renderCertificatesPage } from './modules/certificates.js';
import { renderSitesPage } from './modules/sites.js';
import { renderNotificationsPage } from './modules/notifications.js';
import { renderReportsPage } from './modules/reports.js';
import { renderSettingsPage } from './modules/settings.js';
import { openModal, closeModal } from './ui.js';

// ===== Navigation =====
const pages = {
  dashboard: { render: renderDashboard, title: 'Dashboard' },
  staff: { render: renderStaffPage, title: 'Staff Management' },
  certificates: { render: renderCertificatesPage, title: 'Certificates' },
  sites: { render: renderSitesPage, title: 'Sites' },
  notifications: { render: renderNotificationsPage, title: 'Notifications' },
  reports: { render: renderReportsPage, title: 'Reports' },
  settings: { render: renderSettingsPage, title: 'Settings' }
};

let currentPage = 'dashboard';

function navigateTo(page) {
  if (!pages[page]) return;
  currentPage = page;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Render page
  pages[page].render();

  // Update URL hash
  history.replaceState(null, '', `#${page}`);

  // Close mobile menu
  document.getElementById('sidebar').classList.remove('open');
}

// ===== Init =====
function init() {
  // Seed demo data if first time
  seedDemoData();

  // Check for expiring certs
  checkAndGenerateNotifications();

  // Initialize Lucide icons
  lucide.createIcons();

  // Set up navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
  });

  // Mobile menu
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Close sidebar on mobile overlay click
  document.getElementById('mainContent').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
  });

  // Global search
  document.getElementById('globalSearch').addEventListener('input', handleGlobalSearch);

  // Add Staff button in top bar
  document.getElementById('addStaffBtn').addEventListener('click', () => {
    navigateTo('staff');
    // Trigger add staff modal after render
    setTimeout(() => {
      const addBtn = document.getElementById('addNewStaffBtn');
      if (addBtn) addBtn.click();
    }, 100);
  });

  // Hash-based routing
  const hash = window.location.hash.slice(1);
  if (hash && pages[hash]) {
    navigateTo(hash);
  } else {
    navigateTo('dashboard');
  }

  // Update badges
  updateBadges();

  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.slice(1);
    if (h && pages[h] && h !== currentPage) navigateTo(h);
  });
}

// ===== Badges =====
function updateBadges() {
  const data = getData();
  const unread = getUnreadCount();

  const notifBadge = document.getElementById('notifBadge');
  if (unread > 0) { notifBadge.textContent = unread; notifBadge.classList.add('visible'); }
  else { notifBadge.classList.remove('visible'); }

  const certBadge = document.getElementById('certBadge');
  const now = Date.now();
  const expCount = data.certificates.filter(c => {
    if (!c.expiryDate) return false;
    return new Date(c.expiryDate).getTime() < now;
  }).length + data.certificates.filter(c => {
    if (!c.expiryDate) return false;
    const days = (new Date(c.expiryDate).getTime() - now) / 86400000;
    return days > 0 && days <= (data.settings.notifyDaysBefore || 30);
  }).length;

  if (expCount > 0) { certBadge.textContent = expCount; certBadge.classList.add('visible'); }
  else { certBadge.classList.remove('visible'); }

  const dashBadge = document.getElementById('dashboardBadge');
  if (expCount > 0) { dashBadge.textContent = expCount; dashBadge.classList.add('visible'); }
  else { dashBadge.classList.remove('visible'); }
}

// ===== Global Search =====
function handleGlobalSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  if (!query) return;

  const data = getData();
  const results = [];

  data.staff.forEach(s => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    if (name.includes(query)) results.push({ type: 'staff', label: `${s.firstName} ${s.lastName}`, page: 'staff' });
  });

  data.certificates.forEach(c => {
    if (c.type.toLowerCase().includes(query) || (c.number || '').toLowerCase().includes(query)) {
      const staff = data.staff.find(s => s.id === c.staffId);
      results.push({ type: 'cert', label: `${c.type} — ${staff ? staff.firstName + ' ' + staff.lastName : 'Unknown'}`, page: 'certificates' });
    }
  });

  data.sites.forEach(s => {
    if (s.name.toLowerCase().includes(query)) results.push({ type: 'site', label: s.name, page: 'sites' });
  });

  if (results.length > 0) {
    const first = results[0];
    navigateTo(first.page);
    e.target.value = '';
  }
}

// Make updateBadges globally accessible
window._updateBadges = updateBadges;

// Start
document.addEventListener('DOMContentLoaded', init);
