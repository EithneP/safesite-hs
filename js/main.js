// ============ NAVIGATION & INIT ============
// All functions are globals loaded via <script> tags — no imports needed

var currentPage = 'dashboard';

var pageRenderers = {
  dashboard: renderDashboard,
  staff: renderStaffPage,
  certificates: renderCertificatesPage,
  sites: renderSitesPage,
  notifications: renderNotificationsPage,
  reports: renderReportsPage,
  settings: renderSettingsPage
};

var pageTitles = {
  dashboard: 'Dashboard',
  staff: 'Staff Management',
  certificates: 'Certificates',
  sites: 'Sites',
  notifications: 'Notifications',
  reports: 'Reports',
  settings: 'Settings'
};

function navigateTo(page) {
  if (!pageRenderers[page]) return;
  currentPage = page;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Update title
  document.getElementById('pageTitle').textContent = pageTitles[page] || page;

  // Render page
  pageRenderers[page]();

  // Update URL hash
  history.replaceState(null, '', '#' + page);

  // Close mobile menu
  document.getElementById('sidebar').classList.remove('open');

  // Update badges
  updateBadges();
}

// ===== Badges =====
function updateBadges() {
  var data = getData();
  var unread = getUnreadCount();

  var notifBadge = document.getElementById('notifBadge');
  if (unread > 0) { notifBadge.textContent = unread; notifBadge.classList.add('visible'); }
  else { notifBadge.classList.remove('visible'); }

  var now = Date.now();
  var expCount = data.certificates.filter(function(c) {
    if (!c.expiryDate) return false;
    return new Date(c.expiryDate).getTime() < now;
  }).length + data.certificates.filter(function(c) {
    if (!c.expiryDate) return false;
    var days = (new Date(c.expiryDate).getTime() - now) / 86400000;
    return days > 0 && days <= (data.settings.notifyDaysBefore || 30);
  }).length;

  var certBadge = document.getElementById('certBadge');
  if (expCount > 0) { certBadge.textContent = expCount; certBadge.classList.add('visible'); }
  else { certBadge.classList.remove('visible'); }

  var dashBadge = document.getElementById('dashboardBadge');
  if (expCount > 0) { dashBadge.textContent = expCount; dashBadge.classList.add('visible'); }
  else { dashBadge.classList.remove('visible'); }
}

// ===== Global Search =====
function handleGlobalSearch(e) {
  var query = e.target.value.toLowerCase().trim();
  if (!query) return;

  var data = getData();
  var match = null;

  // Search staff
  data.staff.forEach(function(s) {
    if (match) return;
    if ((s.firstName + ' ' + s.lastName).toLowerCase().indexOf(query) !== -1) match = 'staff';
  });

  // Search certs
  data.certificates.forEach(function(c) {
    if (match) return;
    if (c.type.toLowerCase().indexOf(query) !== -1 || (c.number || '').toLowerCase().indexOf(query) !== -1) match = 'certificates';
  });

  // Search sites
  data.sites.forEach(function(s) {
    if (match) return;
    if (s.name.toLowerCase().indexOf(query) !== -1) match = 'sites';
  });

  if (match) {
    navigateTo(match);
    e.target.value = '';
  }
}

// ===== INIT =====
function init() {
  // Seed demo data if first time
  seedDemoData();

  // Check for expiring certs
  checkAndGenerateNotifications();

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Set up navigation
  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.body.classList.toggle('sidebar-collapsed');
  });

  // Mobile menu
  document.getElementById('mobileMenuBtn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Close sidebar on mobile
  document.getElementById('mainContent').addEventListener('click', function() {
    document.getElementById('sidebar').classList.remove('open');
  });

  // Global search
  document.getElementById('globalSearch').addEventListener('input', handleGlobalSearch);

  // Add Staff button
  document.getElementById('addStaffBtn').addEventListener('click', function() {
    navigateTo('staff');
    setTimeout(function() {
      var addBtn = document.getElementById('addNewStaffBtn');
      if (addBtn) addBtn.click();
    }, 100);
  });

  // Export button
  document.getElementById('exportDataBtn').addEventListener('click', exportAllData);

  // Hash-based routing
  var hash = window.location.hash.slice(1);
  var validPages = ['dashboard','staff','certificates','sites','notifications','reports','settings'];
  if (hash && validPages.indexOf(hash) !== -1) {
    navigateTo(hash);
  } else {
    navigateTo('dashboard');
  }

  // Listen for hash changes
  window.addEventListener('hashchange', function() {
    var h = window.location.hash.slice(1);
    if (h && pageRenderers[h] && h !== currentPage) navigateTo(h);
  });
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
