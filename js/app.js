/* ============================================
   SafeSite — Construction H&S Platform
   Main Application JavaScript
   ============================================ */

(function () {
  'use strict';

  // ── Storage ──
  const STORAGE_KEY = 'safesite-data';

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ── Sample Data ──
  function getDefaultData() {
    const today = new Date();
    const d = (daysAgo) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - daysAgo);
      return dt.toISOString().split('T')[0];
    };
    const future = (daysAhead) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + daysAhead);
      return dt.toISOString().split('T')[0];
    };

    return {
      staff: [
        { id: 's1', name: 'John Smith', role: 'Site Manager', phone: '07700 900001', email: 'john.smith@buildco.co.uk', siteId: 'site1', startDate: d(365), status: 'active' },
        { id: 's2', name: 'Sarah Williams', role: 'Safety Officer', phone: '07700 900002', email: 'sarah.w@buildco.co.uk', siteId: 'site1', startDate: d(200), status: 'active' },
        { id: 's3', name: 'Mike Johnson', role: 'Foreman', phone: '07700 900003', email: 'mike.j@buildco.co.uk', siteId: 'site2', startDate: d(150), status: 'active' },
        { id: 's4', name: 'Emma Brown', role: 'Operative', phone: '07700 900004', email: 'emma.b@buildco.co.uk', siteId: 'site2', startDate: d(90), status: 'active' },
        { id: 's5', name: 'David Wilson', role: 'Operative', phone: '07700 900005', email: 'david.w@buildco.co.uk', siteId: 'site3', startDate: d(60), status: 'active' },
        { id: 's6', name: 'Lisa Taylor', role: 'Administrator', phone: '07700 900006', email: 'lisa.t@buildco.co.uk', siteId: 'site1', startDate: d(300), status: 'active' },
        { id: 's7', name: 'James Anderson', role: 'Operative', phone: '07700 900007', email: 'james.a@buildco.co.uk', siteId: 'site3', startDate: d(30), status: 'inactive' },
      ],
      sites: [
        { id: 'site1', name: 'Riverside Tower Block', address: '14 Riverside Drive, London SE1 2AB', status: 'active', startDate: d(400), manager: 'John Smith' },
        { id: 'site2', name: 'Greenfield Business Park', address: 'Greenfield Lane, Manchester M1 3PQ', status: 'active', startDate: d(250), manager: 'Mike Johnson' },
        { id: 'site3', name: 'Harbour View Residences', address: '22 Harbour Road, Bristol BS1 5TY', status: 'active', startDate: d(120), manager: 'John Smith' },
        { id: 'site4', name: 'City Centre Refurb', address: '8 High Street, Birmingham B1 1BB', status: 'completed', startDate: d(500), manager: 'Lisa Taylor' },
      ],
      certificates: [
        { id: 'c1', staffId: 's1', type: 'CSCS Card', issueDate: d(180), expiryDate: future(180), images: [], notes: 'Gold card — Supervisor' },
        { id: 'c2', staffId: 's1', type: 'First Aid at Work', issueDate: d(100), expiryDate: future(265), images: [], notes: '3-day course completed' },
        { id: 'c3', staffId: 's2', type: 'NEBOSH General', issueDate: d(300), expiryDate: future(65), images: [], notes: 'National Certificate' },
        { id: 'c4', staffId: 's2', type: 'Fire Safety', issueDate: d(90), expiryDate: future(275), images: [], notes: 'Fire Warden training' },
        { id: 'c5', staffId: 's3', type: 'CSCS Card', issueDate: d(150), expiryDate: future(215), images: [], notes: 'Gold card — Foreman' },
        { id: 'c6', staffId: 's4', type: 'CSCS Card', issueDate: d(60), expiryDate: future(305), images: [], notes: 'Blue card — Skilled Worker' },
        { id: 'c7', staffId: 's4', type: 'Asbestos Awareness', issueDate: d(45), expiryDate: future(320), images: [], notes: 'UKATA approved course' },
        { id: 'c8', staffId: 's5', type: 'CSCS Card', issueDate: d(30), expiryDate: future(335), images: [], notes: 'Blue card' },
        { id: 'c9', staffId: 's5', type: 'Manual Handling', issueDate: d(25), expiryDate: future(340), images: [], notes: 'Annual refresher completed' },
        { id: 'c10', staffId: 's3', type: 'IPAF Operator', issueDate: d(200), expiryDate: future(-20), images: [], notes: 'MEWP Category 3a & 3b' },
        { id: 'c11', staffId: 's6', type: 'Asbestos Awareness', issueDate: d(120), expiryDate: future(245), images: [], notes: 'Office admin — refresher' },
      ],
      notifications: [
        { id: 'n1', type: 'warning', title: 'Certificate Expiring', desc: "Mike Johnson's IPAF Operator certificate expired 20 days ago", time: d(0), read: false },
        { id: 'n2', type: 'danger', title: 'Certificate Overdue', desc: 'Sarah Williams — NEBOSH General expires in 65 days', time: d(0), read: false },
        { id: 'n3', type: 'info', title: 'New Staff Member', desc: 'James Anderson added to Harbour View Residences', time: d(5), read: false },
        { id: 'n4', type: 'success', title: 'Site Inspection Passed', desc: 'Riverside Tower Block — Q4 safety audit passed', time: d(10), read: true },
      ],
      currentPage: 'dashboard',
    };
  }

  // ── State ──
  const state = loadData() || getDefaultData();
  if (!loadData()) saveData();

  // ── Utility ──
  function genId() { return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7); }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function getStaffById(id) {
    return state.staff.find(s => s.id === id);
  }

  function getSiteById(id) {
    return state.sites.find(s => s.id === id);
  }

  function getStaffName(id) {
    const s = getStaffById(id);
    return s ? s.name : 'Unknown';
  }

  function getSiteName(id) {
    const s = getSiteById(id);
    return s ? s.name : 'Unassigned';
  }

  function daysUntil(dateStr) {
    const target = new Date(dateStr);
    const now = new Date();
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  }

  function getExpiryBadgeClass(days) {
    if (days < 0) return 'badge--danger';
    if (days <= 30) return 'badge--warning';
    return 'badge--success';
  }

  function getExpiryLabel(days) {
    if (days < 0) return `Expired ${Math.abs(days)}d ago`;
    if (days === 0) return 'Expires today';
    return `Expires in ${days}d`;
  }

  const CERT_TYPES = [
    'CSCS Card', 'First Aid at Work', 'NEBOSH General', 'Fire Safety',
    'Asbestos Awareness', 'Manual Handling', 'IPAF Operator',
    'Working at Height', 'Abrasive Wheels', 'Scaffolding', 'Confined Spaces',
    'DBS Check', 'Other'
  ];

  // ── DOM refs ──
  const pageContent = document.getElementById('pageContent');
  const pageTitle = document.getElementById('pageTitle');
  const sidebarNav = document.getElementById('sidebarNav');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalFooter = document.getElementById('modalFooter');
  const notifPane = document.getElementById('notificationsPane');
  const notifList = document.getElementById('notificationsList');
  const notifBadge = document.getElementById('notifBadge');

  // ── Certificate filter state ──
  let certFilters = {
    search: '',
    types: [],      // multi-select: empty = show all
    expiringOnly: false,
  };

  // ── Navigation ──
  function navigateTo(page) {
    state.currentPage = page;
    saveData();
    renderNav();
    renderPage();
  }

  function renderNav() {
    sidebarNav.querySelectorAll('.sidebar__link').forEach(btn => {
      btn.classList.toggle('sidebar__link--active', btn.dataset.page === state.currentPage);
    });
  }

  function renderPage() {
    const titles = {
      dashboard: 'Dashboard',
      staff: 'Staff Management',
      sites: 'Site Management',
      certificates: 'Certificates & Training',
      reports: 'Reports',
    };
    pageTitle.textContent = titles[state.currentPage] || 'Dashboard';

    switch (state.currentPage) {
      case 'dashboard': renderDashboard(); break;
      case 'staff': renderStaff(); break;
      case 'sites': renderSites(); break;
      case 'certificates': renderCertificates(); break;
      case 'reports': renderReports(); break;
      default: renderDashboard();
    }
    lucide.createIcons();
  }

  // ── DASHBOARD ──
  function renderDashboard() {
    const activeStaff = state.staff.filter(s => s.status === 'active').length;
    const activeSites = state.sites.filter(s => s.status === 'active').length;
    const totalCerts = state.certificates.length;
    const expiringCerts = state.certificates.filter(c => {
      const days = daysUntil(c.expiryDate);
      return days >= 0 && days <= 30;
    }).length;
    const expiredCerts = state.certificates.filter(c => daysUntil(c.expiryDate) < 0).length;

    pageContent.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--orange"><i data-lucide="users"></i></div>
          <div>
            <div class="stat-card__value">${activeStaff}</div>
            <div class="stat-card__label">Active Staff</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--blue"><i data-lucide="building-2"></i></div>
          <div>
            <div class="stat-card__value">${activeSites}</div>
            <div class="stat-card__label">Active Sites</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--green"><i data-lucide="award"></i></div>
          <div>
            <div class="stat-card__value">${totalCerts}</div>
            <div class="stat-card__label">Total Certificates</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--red"><i data-lucide="alert-triangle"></i></div>
          <div>
            <div class="stat-card__value">${expiredCerts + expiringCerts}</div>
            <div class="stat-card__label">Expiring / Expired</div>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Upcoming Expirations</h3>
          </div>
          <div class="card__body">
            ${renderExpiringList()}
          </div>
        </div>
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Recent Activity</h3>
          </div>
          <div class="card__body">
            ${renderRecentActivity()}
          </div>
        </div>
      </div>
    `;
  }

  function renderExpiringList() {
    const expiring = state.certificates
      .map(c => ({ ...c, days: daysUntil(c.expiryDate) }))
      .filter(c => c.days <= 30)
      .sort((a, b) => a.days - b.days)
      .slice(0, 5);

    if (expiring.length === 0) {
      return '<p style="color:var(--color-text-muted);font-size:0.85rem;">No certificates expiring soon.</p>';
    }

    return `<ul class="recent-activity">` + expiring.map(c => `
      <li class="recent-activity__item">
        <div class="recent-activity__icon" style="background:${c.days < 0 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)'};color:${c.days < 0 ? 'var(--color-danger)' : 'var(--color-warning)'}">
          <i data-lucide="alert-circle"></i>
        </div>
        <div class="recent-activity__text">
          <strong>${getStaffName(c.staffId)}</strong> — ${c.type}
          <br><span class="badge ${getExpiryBadgeClass(c.days)}" style="margin-top:4px;">${getExpiryLabel(c.days)}</span>
        </div>
      </li>
    `).join('') + `</ul>`;
  }

  function renderRecentActivity() {
    const items = state.notifications.slice().sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
    if (items.length === 0) {
      return '<p style="color:var(--color-text-muted);font-size:0.85rem;">No recent activity.</p>';
    }

    const iconMap = {
      warning: { icon: 'alert-triangle', cls: 'notif-item__icon--warning' },
      danger: { icon: 'alert-octagon', cls: 'notif-item__icon--danger' },
      info: { icon: 'info', cls: 'notif-item__icon--info' },
      success: { icon: 'check-circle', cls: 'notif-item__icon--success' },
    };

    return `<ul class="recent-activity">` + items.map(n => {
      const ic = iconMap[n.type] || iconMap.info;
      return `
        <li class="recent-activity__item">
          <div class="recent-activity__icon ${ic.cls}"><i data-lucide="${ic.icon}"></i></div>
          <div class="recent-activity__text"><strong>${n.title}</strong><br>${n.desc}</div>
          <div class="recent-activity__time">${formatDate(n.time)}</div>
        </li>`;
    }).join('') + `</ul>`;
  }

  // ── STAFF PAGE ──
  function renderStaff() {
    const rows = state.staff.map(s => {
      const siteName = getSiteName(s.siteId);
      const certCount = state.certificates.filter(c => c.staffId === s.id).length;
      return `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td>${s.role}</td>
          <td>${s.phone}</td>
          <td>${siteName}</td>
          <td>${certCount}</td>
          <td><span class="badge ${s.status === 'active' ? 'badge--success' : 'badge--neutral'}">${s.status}</span></td>
          <td>
            <button class="btn btn--ghost btn--sm" onclick="window._app.editStaff('${s.id}')" title="Edit"><i data-lucide="pencil"></i></button>
            <button class="btn btn--ghost btn--sm" onclick="window._app.deleteStaff('${s.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
          </td>
        </tr>`;
    }).join('');

    pageContent.innerHTML = `
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">All Staff (${state.staff.length})</h3>
          <button class="btn btn--primary" onclick="window._app.addStaff()"><i data-lucide="plus"></i> Add Staff</button>
        </div>
        <div class="card__body">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Role</th><th>Phone</th><th>Site</th><th>Certs</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ── SITES PAGE ──
  function renderSites() {
    const rows = state.sites.map(s => {
      const staffCount = state.staff.filter(st => st.siteId === s.id).length;
      return `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td>${s.address}</td>
          <td>${s.manager}</td>
          <td>${staffCount}</td>
          <td><span class="badge ${s.status === 'active' ? 'badge--success' : 'badge--neutral'}">${s.status}</span></td>
          <td>${formatDate(s.startDate)}</td>
          <td>
            <button class="btn btn--ghost btn--sm" onclick="window._app.editSite('${s.id}')" title="Edit"><i data-lucide="pencil"></i></button>
            <button class="btn btn--ghost btn--sm" onclick="window._app.deleteSite('${s.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
          </td>
        </tr>`;
    }).join('');

    pageContent.innerHTML = `
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">All Sites (${state.sites.length})</h3>
          <button class="btn btn--primary" onclick="window._app.addSite()"><i data-lucide="plus"></i> Add Site</button>
        </div>
        <div class="card__body">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Site Name</th><th>Address</th><th>Manager</th><th>Staff</th><th>Status</th><th>Start Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ── CERTIFICATES PAGE ──
  function renderCertificates() {
    // Build filtered list
    let filtered = state.certificates.slice();

    // Text search
    if (certFilters.search) {
      const q = certFilters.search.toLowerCase();
      filtered = filtered.filter(c => {
        const staffName = getStaffName(c.staffId).toLowerCase();
        return staffName.includes(q) || c.type.toLowerCase().includes(q) || (c.notes || '').toLowerCase().includes(q);
      });
    }

    // Type filter (multi-select — show ALL selected types, or all if none selected)
    if (certFilters.types.length > 0) {
      filtered = filtered.filter(c => certFilters.types.includes(c.type));
    }

    // Expiring only
    if (certFilters.expiringOnly) {
      filtered = filtered.filter(c => daysUntil(c.expiryDate) <= 30);
    }

    // Build filter bar with multi-select type checkboxes
    const typeCheckboxes = CERT_TYPES.map(t => {
      const count = state.certificates.filter(c => c.type === t).length;
      if (count === 0) return '';
      const checked = certFilters.types.includes(t) ? 'checked' : '';
      return `<label class="checkbox-tag"><input type="checkbox" value="${t}" ${checked} onchange="window._app.toggleCertTypeFilter('${t}')">${t} (${count})</label>`;
    }).filter(Boolean).join('');

    const rows = filtered.map(c => {
      const days = daysUntil(c.expiryDate);
      const thumbHtml = c.images && c.images.length > 0
        ? `<div class="cert-images">${c.images.slice(0, 3).map(img => `<img src="${img}" alt="Cert" onclick="window._app.openLightbox('${img}')">`).join('')}${c.images.length > 3 ? `<div class="cert-images__more">+${c.images.length - 3}</div>` : ''}</div>`
        : '<span style="color:var(--color-text-muted);font-size:0.8rem;">No images</span>';

      return `
        <tr>
          <td><strong>${getStaffName(c.staffId)}</strong></td>
          <td><span class="badge badge--info">${c.type}</span></td>
          <td>${formatDate(c.issueDate)}</td>
          <td>${formatDate(c.expiryDate)}</td>
          <td><span class="badge ${getExpiryBadgeClass(days)}">${getExpiryLabel(days)}</span></td>
          <td>${thumbHtml}</td>
          <td>
            <button class="btn btn--ghost btn--sm" onclick="window._app.editCert('${c.id}')" title="Edit"><i data-lucide="pencil"></i></button>
            <button class="btn btn--ghost btn--sm" onclick="window._app.deleteCert('${c.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
          </td>
        </tr>`;
    }).join('');

    pageContent.innerHTML = `
      <div class="filter-bar">
        <input type="text" class="form-input" placeholder="Search staff, type, notes..." value="${certFilters.search}" oninput="window._app.onCertSearch(this.value)" style="min-width:240px;">
        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
          <input type="checkbox" ${certFilters.expiringOnly ? 'checked' : ''} onchange="window._app.toggleExpiringOnly(this.checked)">
          Expiring / Expired only
        </label>
      </div>
      <div style="margin-bottom:20px;">
        <div style="font-size:0.8rem;font-weight:600;color:var(--color-text-muted);margin-bottom:8px;">Filter by Certificate Type:</div>
        <div class="checkbox-group">${typeCheckboxes || '<span style="font-size:0.8rem;color:var(--color-text-muted);">No certificate types in data</span>'}</div>
      </div>
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">Certificates (${filtered.length})</h3>
          <button class="btn btn--primary" onclick="window._app.addCert()"><i data-lucide="plus"></i> Add Certificate</button>
        </div>
        <div class="card__body">
          ${filtered.length === 0
            ? `<div class="empty-state"><i data-lucide="award"></i><h3>No certificates found</h3><p>Adjust filters or add a new certificate.</p></div>`
            : `<div class="table-wrapper"><table>
              <thead>
                <tr>
                  <th>Staff</th><th>Type</th><th>Issued</th><th>Expiry</th><th>Status</th><th>Images</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table></div>`
          }
        </div>
      </div>
    `;
  }

  // ── REPORTS PAGE ──
  function renderReports() {
    const activeStaff = state.staff.filter(s => s.status === 'active').length;
    const expiredCount = state.certificates.filter(c => daysUntil(c.expiryDate) < 0).length;
    const expiringCount = state.certificates.filter(c => { const d = daysUntil(c.expiryDate); return d >= 0 && d <= 30; }).length;

    pageContent.innerHTML = `
      <div class="report-options">
        <div class="report-option" onclick="window._app.generateReport('compliance')">
          <i data-lucide="shield-check"></i>
          <h3>Compliance Summary</h3>
          <p>Overall safety compliance across all sites</p>
        </div>
        <div class="report-option" onclick="window._app.generateReport('staff')">
          <i data-lucide="users"></i>
          <h3>Staff by Site</h3>
          <p>Staff allocation breakdown per site</p>
        </div>
        <div class="report-option" onclick="window._app.generateReport('certs')">
          <i data-lucide="award"></i>
          <h3>Certificate Status</h3>
          <p>All certificates with expiry details</p>
        </div>
        <div class="report-option" onclick="window._app.generateReport('expired')">
          <i data-lucide="alert-octagon"></i>
          <h3>Expired / Expiring</h3>
          <p>Certificates requiring immediate action</p>
        </div>
      </div>
      <div class="report-output" id="reportOutput">
        <div class="card">
          <div class="card__body">
            <div class="empty-state">
              <i data-lucide="file-bar-chart"></i>
              <h3>Select a report type above</h3>
              <p>Click a report card to generate the report</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function generateReport(type) {
    const output = document.getElementById('reportOutput');
    if (!output) return;

    let html = '';

    if (type === 'compliance') {
      const totalCerts = state.certificates.length;
      const validCerts = state.certificates.filter(c => daysUntil(c.expiryDate) > 30).length;
      const complianceRate = totalCerts > 0 ? Math.round((validCerts / totalCerts) * 100) : 0;

      html = `
        <div class="card">
          <div class="card__header"><h3 class="card__title">Compliance Summary Report</h3><span style="font-size:0.8rem;color:var(--color-text-muted);">Generated: ${formatDate(new Date().toISOString())}</span></div>
          <div class="card__body">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-card__icon stat-card__icon--green"><i data-lucide="percent"></i></div>
                <div><div class="stat-card__value">${complianceRate}%</div><div class="stat-card__label">Compliance Rate</div></div>
              </div>
              <div class="stat-card">
                <div class="stat-card__icon stat-card__icon--green"><i data-lucide="check-circle"></i></div>
                <div><div class="stat-card__value">${validCerts}</div><div class="stat-card__label">Valid Certificates</div></div>
              </div>
              <div class="stat-card">
                <div class="stat-card__icon stat-card__icon--red"><i data-lucide="alert-circle"></i></div>
                <div><div class="stat-card__value">${totalCerts - validCerts}</div><div class="stat-card__label">Expiring / Expired</div></div>
              </div>
            </div>
            <p style="font-size:0.85rem;color:var(--color-text-muted);margin-top:16px;">
              ${activeStaff} active staff across ${state.sites.filter(s => s.status === 'active').length} active sites.
              ${complianceRate < 80 ? '<br><strong style="color:var(--color-danger);">⚠ Compliance rate is below 80% — immediate action required.</strong>' : '<br><strong style="color:var(--color-success);">✓ Compliance rate is satisfactory.</strong>'}
            </p>
          </div>
        </div>`;
    }

    if (type === 'staff') {
      const siteGroups = {};
      state.sites.forEach(s => {
        siteGroups[s.id] = { name: s.name, staff: state.staff.filter(st => st.siteId === s.id) };
      });
      html = `<div class="card"><div class="card__header"><h3 class="card__title">Staff by Site Report</h3></div><div class="card__body">`;
      Object.values(siteGroups).forEach(g => {
        html += `<h4 style="margin:16px 0 8px;font-size:0.95rem;">${g.name} <span class="badge badge--info">${g.staff.length}</span></h4>`;
        if (g.staff.length === 0) {
          html += `<p style="font-size:0.8rem;color:var(--color-text-muted);">No staff assigned</p>`;
        } else {
          html += `<table><thead><tr><th>Name</th><th>Role</th><th>Status</th></tr></thead><tbody>`;
          g.staff.forEach(s => {
            html += `<tr><td>${s.name}</td><td>${s.role}</td><td><span class="badge ${s.status === 'active' ? 'badge--success' : 'badge--neutral'}">${s.status}</span></td></tr>`;
          });
          html += `</tbody></table>`;
        }
      });
      html += `</div></div>`;
    }

    if (type === 'certs') {
      html = `<div class="card"><div class="card__header"><h3 class="card__title">All Certificates</h3></div><div class="card__body"><div class="table-wrapper"><table>
        <thead><tr><th>Staff</th><th>Type</th><th>Issued</th><th>Expiry</th><th>Status</th></tr></thead><tbody>`;
      state.certificates.forEach(c => {
        const days = daysUntil(c.expiryDate);
        html += `<tr><td>${getStaffName(c.staffId)}</td><td>${c.type}</td><td>${formatDate(c.issueDate)}</td><td>${formatDate(c.expiryDate)}</td><td><span class="badge ${getExpiryBadgeClass(days)}">${getExpiryLabel(days)}</span></td></tr>`;
      });
      html += `</tbody></table></div></div></div>`;
    }

    if (type === 'expired') {
      const bad = state.certificates.filter(c => daysUntil(c.expiryDate) <= 30).sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));
      html = `<div class="card"><div class="card__header"><h3 class="card__title">Expired / Expiring Certificates</h3></div><div class="card__body">`;
      if (bad.length === 0) {
        html += `<p style="font-size:0.85rem;color:var(--color-text-muted);">No certificates expiring or expired.</p>`;
      } else {
        html += `<div class="table-wrapper"><table><thead><tr><th>Staff</th><th>Type</th><th>Expiry</th><th>Status</th></tr></thead><tbody>`;
        bad.forEach(c => {
          const days = daysUntil(c.expiryDate);
          html += `<tr><td><strong>${getStaffName(c.staffId)}</strong></td><td>${c.type}</td><td>${formatDate(c.expiryDate)}</td><td><span class="badge ${getExpiryBadgeClass(days)}">${getExpiryLabel(days)}</span></td></tr>`;
        });
        html += `</tbody></table></div>`;
      }
      html += `</div></div>`;
    }

    output.innerHTML = html;
    lucide.createIcons();
  }

  // ── MODAL SYSTEM ──
  function openModal(title, bodyHtml, footerHtml) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modalFooter.innerHTML = footerHtml;
    modalOverlay.classList.add('modal-overlay--open');
    lucide.createIcons();
  }

  function closeModal() {
    modalOverlay.classList.remove('modal-overlay--open');
  }

  // ── LIGHTBOX ──
  function openLightbox(src) {
    let lb = document.querySelector('.lightbox-overlay');
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lightbox-overlay';
      lb.innerHTML = '<img>';
      lb.addEventListener('click', () => lb.classList.remove('lightbox-overlay--open'));
      document.body.appendChild(lb);
    }
    lb.querySelector('img').src = src;
    lb.classList.add('lightbox-overlay--open');
  }

  // ── NOTIFICATIONS ──
  function renderNotifications() {
    const unread = state.notifications.filter(n => !n.read).length;
    notifBadge.textContent = unread;
    notifBadge.dataset.count = unread;
    notifBadge.style.display = unread > 0 ? 'flex' : 'none';

    if (state.notifications.length === 0) {
      notifList.innerHTML = `<div class="notif-empty"><i data-lucide="bell-off"></i><p>No notifications</p></div>`;
      lucide.createIcons();
      return;
    }

    const iconMap = {
      warning: { icon: 'alert-triangle', cls: 'notif-item__icon--warning' },
      danger: { icon: 'alert-octagon', cls: 'notif-item__icon--danger' },
      info: { icon: 'info', cls: 'notif-item__icon--info' },
      success: { icon: 'check-circle', cls: 'notif-item__icon--success' },
    };

    notifList.innerHTML = state.notifications.map(n => {
      const ic = iconMap[n.type] || iconMap.info;
      return `
        <div class="notif-item" style="${n.read ? 'opacity:0.6;' : ''}" onclick="window._app.markNotifRead('${n.id}')">
          <div class="notif-item__icon ${ic.cls}"><i data-lucide="${ic.icon}"></i></div>
          <div class="notif-item__text">
            <div class="notif-item__title">${n.title}</div>
            <div class="notif-item__desc">${n.desc}</div>
            <div class="notif-item__time">${formatDate(n.time)}</div>
          </div>
        </div>`;
    }).join('');
    lucide.createIcons();
  }

  function toggleNotifPane() {
    notifPane.classList.toggle('notifications-pane--open');
    renderNotifications();
  }

  function markNotifRead(id) {
    const n = state.notifications.find(x => x.id === id);
    if (n) { n.read = true; saveData(); renderNotifications(); }
  }

  // ── STAFF CRUD ──
  function staffFormHtml(staff) {
    const siteOptions = state.sites.map(s =>
      `<option value="${s.id}" ${staff && staff.siteId === s.id ? 'selected' : ''}>${s.name}</option>`
    ).join('');

    return `
      <div class="form-row">
        <div class="form-group">
          <label>Full Name</label>
          <input class="form-input" id="staffName" value="${staff ? staff.name : ''}" placeholder="e.g. John Smith">
        </div>
        <div class="form-group">
          <label>Role</label>
          <input class="form-input" id="staffRole" value="${staff ? staff.role : ''}" placeholder="e.g. Operative">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Phone</label>
          <input class="form-input" id="staffPhone" value="${staff ? staff.phone : ''}" placeholder="07...">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input class="form-input" id="staffEmail" value="${staff ? staff.email : ''}" placeholder="name@company.co.uk">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Site</label>
          <select class="form-select" id="staffSite">
            <option value="">— Unassigned —</option>
            ${siteOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="form-select" id="staffStatus">
            <option value="active" ${staff && staff.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="inactive" ${staff && staff.status === 'inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Start Date</label>
        <input class="form-input" type="date" id="staffStartDate" value="${staff ? staff.startDate : new Date().toISOString().split('T')[0]}">
      </div>
    `;
  }

  function getStaffFormData() {
    return {
      name: document.getElementById('staffName').value.trim(),
      role: document.getElementById('staffRole').value.trim(),
      phone: document.getElementById('staffPhone').value.trim(),
      email: document.getElementById('staffEmail').value.trim(),
      siteId: document.getElementById('staffSite').value,
      status: document.getElementById('staffStatus').value,
      startDate: document.getElementById('staffStartDate').value,
    };
  }

  function addStaff() {
    openModal('Add Staff Member', staffFormHtml(null),
      `<button class="btn btn--secondary" onclick="window._app.closeModal()">Cancel</button>
       <button class="btn btn--primary" onclick="window._app.saveStaff()">Save</button>`
    );
  }

  function editStaff(id) {
    const s = getStaffById(id);
    if (!s) return;
    openModal('Edit Staff Member', staffFormHtml(s),
      `<button class="btn btn--secondary" onclick="window._app.closeModal()">Cancel</button>
       <button class="btn btn--primary" onclick="window._app.saveStaff('${id}')">Update</button>`
    );
  }

  function saveStaff(id) {
    const data = getStaffFormData();
    if (!data.name) { alert('Name is required.'); return; }

    if (id) {
      const s = getStaffById(id);
      if (s) Object.assign(s, data);
    } else {
      state.staff.push({ id: genId(), ...data });
    }
    saveData();
    closeModal();
    renderPage();
  }

  function deleteStaff(id) {
    if (!confirm('Delete this staff member?')) return;
    state.staff = state.staff.filter(s => s.id !== id);
    state.certificates = state.certificates.filter(c => c.staffId !== id);
    saveData();
    renderPage();
  }

  // ── SITE CRUD ──
  function siteFormHtml(site) {
    return `
      <div class="form-group">
        <label>Site Name</label>
        <input class="form-input" id="siteName" value="${site ? site.name : ''}" placeholder="e.g. Riverside Tower Block">
      </div>
      <div class="form-group">
        <label>Address</label>
        <input class="form-input" id="siteAddress" value="${site ? site.address : ''}" placeholder="Full address">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Manager</label>
          <input class="form-input" id="siteManager" value="${site ? site.manager : ''}" placeholder="Site manager name">
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="form-select" id="siteStatus">
            <option value="active" ${site && site.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="completed" ${site && site.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Start Date</label>
        <input class="form-input" type="date" id="siteStartDate" value="${site ? site.startDate : new Date().toISOString().split('T')[0]}">
      </div>
    `;
  }

  function getSiteFormData() {
    return {
      name: document.getElementById('siteName').value.trim(),
      address: document.getElementById('siteAddress').value.trim(),
      manager: document.getElementById('siteManager').value.trim(),
      status: document.getElementById('siteStatus').value,
      startDate: document.getElementById('siteStartDate').value,
    };
  }

  function addSite() {
    openModal('Add Site', siteFormHtml(null),
      `<button class="btn btn--secondary" onclick="window._app.closeModal()">Cancel</button>
       <button class="btn btn--primary" onclick="window._app.saveSite()">Save</button>`
    );
  }

  function editSite(id) {
    const s = getSiteById(id);
    if (!s) return;
    openModal('Edit Site', siteFormHtml(s),
      `<button class="btn btn--secondary" onclick="window._app.closeModal()">Cancel</button>
       <button class="btn btn--primary" onclick="window._app.saveSite('${id}')">Update</button>`
    );
  }

  function saveSite(id) {
    const data = getSiteFormData();
    if (!data.name) { alert('Site name is required.'); return; }

    if (id) {
      const s = getSiteById(id);
      if (s) Object.assign(s, data);
    } else {
      state.sites.push({ id: genId(), ...data });
    }
    saveData();
    closeModal();
    renderPage();
  }

  function deleteSite(id) {
    if (!confirm('Delete this site?')) return;
    state.sites = state.sites.filter(s => s.id !== id);
    saveData();
    renderPage();
  }

  // ── CERTIFICATE CRUD ──
  let certUploadImages = []; // temp storage for images being added in modal

  function certFormHtml(cert) {
    certUploadImages = (cert && cert.images) ? [...cert.images] : [];

    const staffOptions = state.staff.map(s =>
      `<option value="${s.id}" ${cert && cert.staffId === s.id ? 'selected' : ''}>${s.name}</option>`
    ).join('');

    const typeOptions = CERT_TYPES.map(t =>
      `<option value="${t}" ${cert && cert.type === t ? 'selected' : ''}>${t}</option>`
    ).join('');

    return `
      <div class="form-row">
        <div class="form-group">
          <label>Staff Member</label>
          <select class="form-select" id="certStaff">${staffOptions}</select>
        </div>
        <div class="form-group">
          <label>Certificate Type</label>
          <select class="form-select" id="certType">${typeOptions}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Issue Date</label>
          <input class="form-input" type="date" id="certIssueDate" value="${cert ? cert.issueDate : new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label>Expiry Date</label>
          <input class="form-input" type="date" id="certExpiryDate" value="${cert ? cert.expiryDate : ''}">
        </div>
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea class="form-textarea" id="certNotes" placeholder="Additional notes...">${cert ? cert.notes || '' : ''}</textarea>
      </div>
      <div class="form-group">
        <label>Certificate Images</label>
        <p class="form-hint">Upload photos of the training certificate as proof</p>
        <div class="image-upload-area" id="certUploadArea">
          <i data-lucide="upload-cloud"></i>
          <p>Click to upload images (JPG, PNG)</p>
          <input type="file" id="certFileInput" accept="image/*" multiple style="display:none;">
        </div>
        <div class="image-preview-grid" id="certImagePreview"></div>
      </div>
    `;
  }

  function renderCertImagePreviews() {
    const container = document.getElementById('certImagePreview');
    if (!container) return;
    container.innerHTML = certUploadImages.map((img, i) => `
      <div class="image-preview-item">
        <img src="${img}" alt="Certificate image">
        <button class="image-preview-item__remove" onclick="window._app.removeCertImage(${i})">&times;</button>
      </div>
    `).join('');
  }

  function removeCertImage(index) {
    certUploadImages.splice(index, 1);
    renderCertImagePreviews();
  }

  function handleCertFileUpload(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = function (ev) {
        certUploadImages.push(ev.target.result);
        renderCertImagePreviews();
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be selected again
    e.target.value = '';
  }

  function setupCertUploadListeners() {
    const area = document.getElementById('certUploadArea');
    const input = document.getElementById('certFileInput');
    if (area && input) {
      area.addEventListener('click', () => input.click());
      input.addEventListener('change', handleCertFileUpload);
    }
  }

  function getCertFormData() {
    return {
      staffId: document.getElementById('certStaff').value,
      type: document.getElementById('certType').value,
      issueDate: document.getElementById('certIssueDate').value,
      expiryDate: document.getElementById('certExpiryDate').value,
      notes: document.getElementById('certNotes').value.trim(),
      images: [...certUploadImages],
    };
  }

  function addCert() {
    openModal('Add Certificate', certFormHtml(null),
      `<button class="btn btn--secondary" onclick="window._app.closeModal()">Cancel</button>
       <button class="btn btn--primary" onclick="window._app.saveCert()">Save</button>`
    );
    setTimeout(setupCertUploadListeners, 50);
  }

  function editCert(id) {
    const c = state.certificates.find(x => x.id === id);
    if (!c) return;
    openModal('Edit Certificate', certFormHtml(c),
      `<button class="btn btn--secondary" onclick="window._app.closeModal()">Cancel</button>
       <button class="btn btn--primary" onclick="window._app.saveCert('${id}')">Update</button>`
    );
    setTimeout(setupCertUploadListeners, 50);
  }

  function saveCert(id) {
    const data = getCertFormData();
    if (!data.staffId || !data.type) { alert('Staff member and certificate type are required.'); return; }

    if (id) {
      const c = state.certificates.find(x => x.id === id);
      if (c) Object.assign(c, data);
    } else {
      state.certificates.push({ id: genId(), ...data });
    }
    certUploadImages = [];
    saveData();
    closeModal();
    renderPage();
  }

  function deleteCert(id) {
    if (!confirm('Delete this certificate?')) return;
    state.certificates = state.certificates.filter(c => c.id !== id);
    saveData();
    renderPage();
  }

  // ── CERT FILTERS ──
  function onCertSearch(val) {
    certFilters.search = val;
    renderCertificates();
    lucide.createIcons();
  }

  function toggleCertTypeFilter(type) {
    const idx = certFilters.types.indexOf(type);
    if (idx >= 0) {
      certFilters.types.splice(idx, 1);
    } else {
      certFilters.types.push(type);
    }
    renderCertificates();
    lucide.createIcons();
  }

  function toggleExpiringOnly(checked) {
    certFilters.expiringOnly = checked;
    renderCertificates();
    lucide.createIcons();
  }

  // ── MOBILE MENU ──
  function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('sidebar--open');
  }

  // ── INIT ──
  function init() {
    // Navigation clicks
    sidebarNav.querySelectorAll('.sidebar__link').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateTo(btn.dataset.page);
        // Close mobile menu
        document.getElementById('sidebar').classList.remove('sidebar--open');
      });
    });

    // Notifications button
    document.getElementById('notifBtn').addEventListener('click', toggleNotifPane);
    document.getElementById('notifClose').addEventListener('click', () => {
      notifPane.classList.remove('notifications-pane--open');
    });

    // Mobile menu
    document.getElementById('menuToggle').addEventListener('click', toggleMobileMenu);

    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
      const sidebar = document.getElementById('sidebar');
      const menuBtn = document.getElementById('menuToggle');
      if (sidebar.classList.contains('sidebar--open') && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove('sidebar--open');
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        notifPane.classList.remove('notifications-pane--open');
        document.querySelector('.lightbox-overlay')?.classList.remove('lightbox-overlay--open');
      }
    });

    // Check for expiring certificates and create notifications
    generateExpiryNotifications();

    // Initial render
    renderNav();
    renderPage();
    renderNotifications();
  }

  function generateExpiryNotifications() {
    // Only add notifications for certs expiring within 30 days that don't already have a notification
    state.certificates.forEach(c => {
      const days = daysUntil(c.expiryDate);
      if (days <= 30) {
        const exists = state.notifications.some(n =>
          n.desc.includes(getStaffName(c.staffId)) && n.desc.includes(c.type)
        );
        if (!exists) {
          state.notifications.push({
            id: genId(),
            type: days < 0 ? 'danger' : 'warning',
            title: days < 0 ? 'Certificate Expired' : 'Certificate Expiring Soon',
            desc: `${getStaffName(c.staffId)} — ${c.type}: ${getExpiryLabel(days)}`,
            time: new Date().toISOString(),
            read: false,
          });
        }
      }
    });
    saveData();
  }

  // ── Public API (for onclick handlers) ──
  window._app = {
    navigateTo,
    addStaff, editStaff, saveStaff, deleteStaff,
    addSite, editSite, saveSite, deleteSite,
    addCert, editCert, saveCert, deleteCert,
    removeCertImage,
    generateReport,
    openLightbox,
    closeModal,
    toggleNotifPane,
    markNotifRead,
    onCertSearch,
    toggleCertTypeFilter,
    toggleExpiringOnly,
  };

  // Start
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();
