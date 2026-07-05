/* ========================================
   SafeSite — Main Application Logic
   ======================================== */

import {
  sites, employees, certifications, certTypes, tradeList,
  timekeeperRecords, activityLog, notificationLog,
  getEmployee, getSite, getCertType, getEmpCerts, getSiteEmployees,
  getCertStatus, getEarliestCertExpiry, getExpiringCerts, getExpiredCerts
} from './data.js';

// ========== State ==========
let currentPage = 'dashboard';
let tkSyncTime = null;
let currentExpiryReportType = null; // track which expiry report is active

// ========== DOM Ready ==========
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initNavigation();
  initTopbar();
  setCurrentDate();
  renderDashboard();
  renderEmployees();
  renderSites();
  renderTraining();
  renderNotifications();
  renderReports();
  renderTimekeeper();
  initModals();
  initGlobalSearch();
  initLightbox();
  initDateRange();
  initExportPrint();
});

// ========== Navigation ==========
function initNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });
  document.querySelectorAll('[data-page]').forEach(el => {
    if (!el.classList.contains('nav-item')) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(el.dataset.page);
      });
    }
  });
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('page--active'));
  document.getElementById(`page-${page}`)?.classList.add('page--active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
}

// ========== Topbar ==========
function initTopbar() {
  document.getElementById('notifBtn').addEventListener('click', () => navigateTo('notifications'));
  document.getElementById('quickAddBtn').addEventListener('click', () => showAddEmployeeModal());
}

function setCurrentDate() {
  const now = new Date();
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

// ========== Global Search ==========
function initGlobalSearch() {
  const searchInput = document.getElementById('globalSearch');
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (q.length < 2) return;
    const matchEmps = employees.filter(emp =>
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q) ||
      emp.trades.some(t => t.toLowerCase().includes(q))
    );
    if (matchEmps.length > 0) {
      navigateTo('employees');
      renderEmployees(matchEmps);
    } else {
      const matchSites = sites.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
      if (matchSites.length > 0) navigateTo('sites');
    }
  });
}

// ========== Dashboard ==========
function renderDashboard() {
  document.getElementById('kpiTotalStaff').textContent = employees.filter(e => e.status === 'active').length;
  document.getElementById('kpiActiveSites').textContent = sites.filter(s => s.status === 'active').length;

  const expiringSoon = getExpiringCerts(30);
  const expired = getExpiredCerts();
  document.getElementById('kpiExpiringSoon').textContent = expiringSoon.length;
  document.getElementById('kpiExpired').textContent = expired.length;

  const expiryEl = document.getElementById('dashExpiryList');
  const topExpiry = expiringSoon.slice(0, 6);
  if (topExpiry.length === 0) {
    expiryEl.innerHTML = '<p class="text-muted">No certifications expiring soon.</p>';
  } else {
    expiryEl.innerHTML = topExpiry.map(cert => {
      const emp = getEmployee(cert.employeeId);
      const certInfo = getCertType(cert.certId);
      const status = getCertStatus(cert);
      const isUrgent = status.daysLeft <= 7 || status.status === 'expired';
      return `
        <div class="expiry-item">
          <div class="avatar avatar--sm">${emp ? emp.firstName[0] + emp.lastName[0] : '??'}</div>
          <div class="expiry-item__info">
            <div class="expiry-item__name">${emp ? emp.firstName + ' ' + emp.lastName : cert.employeeId}</div>
            <div class="expiry-item__cert">${certInfo ? certInfo.name : cert.certId}</div>
          </div>
          <span class="expiry-item__days ${isUrgent ? 'expiry-item__days--urgent' : 'expiry-item__days--soon'}">
            ${status.status === 'expired' ? 'EXPIRED' : status.daysLeft + ' days'}
          </span>
          <span class="badge badge--${status.status}">${status.label}</span>
        </div>`;
    }).join('');
  }

  const siteEl = document.getElementById('dashSiteList');
  siteEl.innerHTML = sites.map(site => {
    const staffOnSite = getSiteEmployees(site.id).length;
    return `
      <div class="expiry-item">
        <span class="status-dot status-dot--${site.status}"></span>
        <div class="expiry-item__info">
          <div class="expiry-item__name">${site.name}</div>
          <div class="expiry-item__cert">${site.address}</div>
        </div>
        <span class="badge badge--info">${staffOnSite} staff</span>
      </div>`;
  }).join('');

  const actEl = document.getElementById('dashActivityList');
  actEl.innerHTML = activityLog.map(a => `
    <div class="activity-item">
      <div class="activity-item__icon ${a.iconBg}"><i data-lucide="${a.icon}"></i></div>
      <span class="activity-item__text">${a.text}</span>
      <span class="activity-item__time">${a.time}</span>
    </div>`).join('');

  lucide.createIcons();
}

// ========== Employees ==========
function renderEmployees(list = null) {
  populateSiteFilter('empFilterSite');
  populateTradeFilter('empFilterTrade');

  const tbody = document.getElementById('employeeTableBody');
  const employeesToRender = list || getFilteredEmployees();

  tbody.innerHTML = employeesToRender.map(emp => {
    const site = getSite(emp.site);
    const earliest = getEarliestCertExpiry(emp.id);
    const totalCerts = getEmpCerts(emp.id).length;
    const expiredCount = getEmpCerts(emp.id).filter(c => getCertStatus(c).status === 'expired').length;

    let nextExpiryHtml = '';
    if (earliest) {
      nextExpiryHtml = `<span class="badge badge--${earliest.status}">${earliest.status === 'expired' ? 'EXPIRED' : earliest.daysLeft + ' days'}</span>`;
    } else {
      nextExpiryHtml = '<span class="text-muted">—</span>';
    }

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <div class="avatar avatar--sm">${emp.firstName[0]}${emp.lastName[0]}</div>
            <div>
              <strong>${emp.firstName} ${emp.lastName}</strong><br>
              <span class="text-muted" style="font-size:0.78rem;">${emp.email}</span>
            </div>
          </div>
        </td>
        <td><code style="font-size:0.82rem;">${emp.id}</code></td>
        <td>
          <div class="trade-tags">
            ${emp.trades.map(t => `<span class="trade-tag">${t}</span>`).join('')}
          </div>
        </td>
        <td>${site ? site.name : '—'}</td>
        <td>${totalCerts} ${expiredCount > 0 ? `<span style="color:var(--color-red);">(${expiredCount} expired)</span>` : ''}</td>
        <td>${nextExpiryHtml}</td>
        <td><span class="badge badge--${emp.status}">${emp.status === 'active' ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="btn btn--ghost btn--sm" onclick="window.showEmpDetail('${emp.id}')"><i data-lucide="eye"></i></button>
          <button class="btn btn--ghost btn--sm" onclick="window.showEditEmployee('${emp.id}')"><i data-lucide="pencil"></i></button>
        </td>
      </tr>`;
  }).join('');

  lucide.createIcons();
}

function getFilteredEmployees() {
  const siteFilter = document.getElementById('empFilterSite')?.value || '';
  const tradeFilter = document.getElementById('empFilterTrade')?.value || '';
  const statusFilter = document.getElementById('empFilterStatus')?.value || '';
  const certFilter = document.getElementById('empFilterCert')?.value || '';

  return employees.filter(emp => {
    if (siteFilter && emp.site !== siteFilter) return false;
    if (tradeFilter && !emp.trades.includes(tradeFilter)) return false;
    if (statusFilter && emp.status !== statusFilter) return false;
    if (certFilter) {
      const empCerts = getEmpCerts(emp.id);
      if (certFilter === 'expired' && !empCerts.some(c => getCertStatus(c).status === 'expired')) return false;
      if (certFilter === 'expiring' && !empCerts.some(c => getCertStatus(c).status === 'expiring')) return false;
      if (certFilter === 'valid' && empCerts.some(c => getCertStatus(c).status !== 'valid')) return false;
    }
    return true;
  });
}

document.getElementById('empFilterSite')?.addEventListener('change', () => renderEmployees());
document.getElementById('empFilterTrade')?.addEventListener('change', () => renderEmployees());
document.getElementById('empFilterStatus')?.addEventListener('change', () => renderEmployees());
document.getElementById('empFilterCert')?.addEventListener('change', () => renderEmployees());
document.getElementById('clearEmpFilters')?.addEventListener('click', () => {
  document.getElementById('empFilterSite').value = '';
  document.getElementById('empFilterTrade').value = '';
  document.getElementById('empFilterStatus').value = '';
  document.getElementById('empFilterCert').value = '';
  renderEmployees();
});

// ========== Sites ==========
function renderSites() {
  const grid = document.getElementById('sitesGrid');
  grid.innerHTML = sites.map(site => {
    const staff = getSiteEmployees(site.id);
    const expiredCount = staff.reduce((acc, emp) => {
      return acc + getEmpCerts(emp.id).filter(c => getCertStatus(c).status === 'expired').length;
    }, 0);
    const expiringCount = staff.reduce((acc, emp) => {
      return acc + getEmpCerts(emp.id).filter(c => getCertStatus(c).status === 'expiring').length;
    }, 0);

    return `
      <div class="site-card">
        <div class="site-card__header">
          <div>
            <div class="site-card__name">${site.name}</div>
            <div class="site-card__address">${site.address}</div>
          </div>
          <span class="badge badge--${site.status === 'active' ? 'active' : 'inactive'}">
            <span class="status-dot status-dot--${site.status}"></span>
            ${site.status === 'active' ? 'Active' : 'Paused'}
          </span>
        </div>
        <div class="site-card__body">
          <div class="site-card__stats">
            <div class="site-stat">
              <span class="site-stat__value">${staff.length}</span>
              <span class="site-stat__label">Staff</span>
            </div>
            <div class="site-stat">
              <span class="site-stat__value" style="color:${expiredCount > 0 ? 'var(--color-red)' : 'var(--color-green)'}">${expiredCount}</span>
              <span class="site-stat__label">Expired Certs</span>
            </div>
            <div class="site-stat">
              <span class="site-stat__value" style="color:${expiringCount > 0 ? 'var(--color-amber)' : 'var(--color-green)'}">${expiringCount}</span>
              <span class="site-stat__label">Expiring</span>
            </div>
            <div class="site-stat">
              <span class="site-stat__value">${site.manager}</span>
              <span class="site-stat__label">Manager</span>
            </div>
          </div>
          <div class="site-card__staff">
            <div class="site-card__staff-title">Assigned Staff</div>
            <div class="site-card__staff-list">
              ${staff.length === 0 ? '<span class="text-muted">No staff assigned</span>' :
                staff.slice(0, 8).map(e => `<span class="trade-tag">${e.firstName} ${e.lastName}</span>`).join('') +
                (staff.length > 8 ? `<span class="trade-tag">+${staff.length - 8} more</span>` : '')
              }
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ========== Training & Certifications ==========
function renderTraining() {
  populateCertTypeFilter('certFilterType');
  populateSiteFilter('certFilterSite');

  const allCerts = [...certifications];
  const valid = allCerts.filter(c => getCertStatus(c).status === 'valid').length;
  const expiring = allCerts.filter(c => getCertStatus(c).status === 'expiring').length;
  const expired = allCerts.filter(c => getCertStatus(c).status === 'expired').length;

  document.getElementById('certValidCount').textContent = valid;
  document.getElementById('certExpiringCount').textContent = expiring;
  document.getElementById('certExpiredCount').textContent = expired;

  renderCertTable();
}

function renderCertTable() {
  const tbody = document.getElementById('certTableBody');
  const filtered = getFilteredCerts();

  tbody.innerHTML = filtered.map(cert => {
    const emp = getEmployee(cert.employeeId);
    const certInfo = getCertType(cert.certId);
    const status = getCertStatus(cert);
    const site = emp ? getSite(emp.site) : null;
    const label = emp ? `${emp.firstName} ${emp.lastName} — ${certInfo ? certInfo.name : cert.certId}` : cert.certId;

    const imageCell = cert.image
      ? `<img class="cert-thumb" src="${cert.image}" alt="${label}" onclick="window.openLightbox('${cert.image}','${label.replace(/'/g, "\\'")}')">`
      : `<button class="btn btn--ghost btn--sm" onclick="window.showUploadCertImage('${cert.employeeId}','${cert.certId}')" title="Upload certificate image"><i data-lucide="camera"></i></button>`;

    return `
      <tr>
        <td>${emp ? emp.firstName + ' ' + emp.lastName : cert.employeeId}</td>
        <td><strong>${certInfo ? certInfo.name : cert.certId}</strong></td>
        <td>${imageCell}</td>
        <td>${formatDate(cert.issued)}</td>
        <td>${formatDate(cert.expires)}</td>
        <td><span class="badge badge--${status.status}">
          ${status.status === 'expired' ? 'EXPIRED' : status.status === 'expiring' ? status.daysLeft + ' days' : 'Valid'}
        </span></td>
        <td>${site ? site.name : '—'}</td>
        <td>
          <button class="btn btn--ghost btn--sm" onclick="window.showRenewCertModal('${cert.employeeId}','${cert.certId}')"><i data-lucide="refresh-cw"></i></button>
        </td>
      </tr>`;
  }).join('');

  lucide.createIcons();
}

function getFilteredCerts() {
  const typeFilter = document.getElementById('certFilterType')?.value || '';
  const statusFilter = document.getElementById('certFilterStatus')?.value || '';
  const siteFilter = document.getElementById('certFilterSite')?.value || '';

  return certifications.filter(cert => {
    if (typeFilter && cert.certId !== typeFilter) return false;
    const status = getCertStatus(cert);
    if (statusFilter && status.status !== statusFilter) return false;
    if (siteFilter) {
      const emp = getEmployee(cert.employeeId);
      if (!emp || emp.site !== siteFilter) return false;
    }
    return true;
  }).sort((a, b) => new Date(a.expires) - new Date(b.expires));
}

document.getElementById('certFilterType')?.addEventListener('change', () => renderCertTable());
document.getElementById('certFilterStatus')?.addEventListener('change', () => renderCertTable());
document.getElementById('certFilterSite')?.addEventListener('change', () => renderCertTable());

// ========== Certificate Image Upload ==========
window.showUploadCertImage = function(empId, certId) {
  const emp = getEmployee(empId);
  const certInfo = getCertType(certId);
  const cert = certifications.find(c => c.employeeId === empId && c.certId === certId);

  const body = `
    <p style="margin-bottom:1rem;">Upload a scanned copy or photo of the <strong>${certInfo ? certInfo.name : certId}</strong> certificate for <strong>${emp ? emp.firstName + ' ' + emp.lastName : empId}</strong>.</p>
    <div class="cert-upload-zone" id="certUploadZone">
      <i data-lucide="upload-cloud"></i>
      <p>Drag &amp; drop an image here, or click to browse</p>
      <p class="upload-hint">Supports JPG, PNG, PDF — max 10 MB</p>
      <input type="file" id="certFileInput" accept="image/*,.pdf">
    </div>
    <div id="certImagePreview" style="margin-top:1rem;"></div>
  `;
  openModal('Upload Certificate Image', body, `
    <button class="btn btn--outline" onclick="closeModal()">Cancel</button>
    <button class="btn btn--primary" id="saveCertImageBtn" disabled><i data-lucide="save"></i> Save Image</button>
  `);

  // Set up drag/drop and file picker
  const zone = document.getElementById('certUploadZone');
  const input = document.getElementById('certFileInput');
  const preview = document.getElementById('certImagePreview');
  const saveBtn = document.getElementById('saveCertImageBtn');
  let pendingImageData = null;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleCertFile(e.dataTransfer.files[0]);
  });
  input.addEventListener('change', (e) => {
    if (e.target.files.length) handleCertFile(e.target.files[0]);
  });

  function handleCertFile(file) {
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'File too large — maximum 10 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      pendingImageData = e.target.result;
      preview.innerHTML = `
        <div style="display:flex;align-items:center;gap:1rem;">
          <img src="${pendingImageData}" style="max-width:200px;max-height:150px;border-radius:var(--radius-sm);border:1px solid var(--color-border);">
          <div>
            <strong>${file.name}</strong><br>
            <span class="text-muted">${(file.size / 1024).toFixed(0)} KB</span>
          </div>
        </div>`;
      saveBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  saveBtn.addEventListener('click', () => {
    if (pendingImageData && cert) {
      cert.image = pendingImageData;
      closeModal();
      renderCertTable();
      renderDashboard();
      showToast('success', `Certificate image saved for ${certInfo ? certInfo.name : certId}`);
    }
  });
};

// ========== Lightbox ==========
function initLightbox() {
  const overlay = document.getElementById('lightboxOverlay');
  const closeBtn = document.getElementById('lightboxClose');

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeLightbox();
  });
}

window.openLightbox = function(src, caption) {
  const overlay = document.getElementById('lightboxOverlay');
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxCaption').textContent = caption || '';
  overlay.classList.add('active');
};

function closeLightbox() {
  document.getElementById('lightboxOverlay').classList.remove('active');
}

// ========== Notifications ==========
function renderNotifications() {
  const log = document.getElementById('notifLog');
  log.innerHTML = notificationLog.map(n => `
    <div class="notif-item ${n.sent ? 'notif-item--sent' : 'notif-item--unread'}">
      <div class="notif-item__icon notif-item__icon--${n.type}">
        <i data-lucide="${n.type === 'danger' ? 'shield-alert' : n.type === 'warning' ? 'alert-triangle' : n.type === 'success' ? 'check-circle' : 'info'}"></i>
      </div>
      <div class="notif-item__content">
        <div class="notif-item__title">${n.title}</div>
        <div class="notif-item__desc">${n.desc}</div>
        <div class="notif-item__meta">${n.date}</div>
      </div>
      <div class="notif-item__actions">
        ${!n.sent ? `<button class="btn btn--primary btn--sm" onclick="window.sendNotification('${n.id}')"><i data-lucide="send"></i> Send</button>` : '<span class="badge badge--active"><i data-lucide="check"></i> Sent</span>'}
      </div>
    </div>`).join('');

  lucide.createIcons();
}

window.sendNotification = function(notifId) {
  const n = notificationLog.find(x => x.id === notifId);
  if (n) {
    n.sent = true;
    showToast('success', `Email sent: ${n.title}`);
    renderNotifications();
  }
};

document.getElementById('sendAllNotifsBtn')?.addEventListener('click', () => {
  notificationLog.filter(n => !n.sent).forEach(n => { n.sent = true; });
  showToast('success', 'All pending notifications sent via email');
  renderNotifications();
});

document.getElementById('clearNotifsBtn')?.addEventListener('click', () => {
  showToast('info', 'All notifications marked as read');
});

document.getElementById('sendExpiryEmailsBtn')?.addEventListener('click', () => {
  const expiring = getExpiringCerts(30);
  if (expiring.length === 0) {
    showToast('info', 'No expiring certificates to report');
    return;
  }
  const emailTo = document.getElementById('notifEmailTo')?.value || 'office@buildco.co.uk';
  showToast('success', `Expiry alert email sent to ${emailTo} — ${expiring.length} certificates flagged`);
});

// ========== Reports ==========
let lastReportType = null;

function renderReports() {
  document.querySelectorAll('[data-report]').forEach(btn => {
    btn.addEventListener('click', () => generateReport(btn.dataset.report));
  });
}

function generateReport(type, dateFrom, dateTo) {
  lastReportType = type;
  const output = document.getElementById('reportOutput');
  const title = document.getElementById('reportTitle');
  const content = document.getElementById('reportContent');
  const dateRangePicker = document.getElementById('dateRangePicker');
  output.style.display = 'block';

  // Show date range picker only for expiry report
  dateRangePicker.style.display = type === 'expiry' ? 'flex' : 'none';

  switch (type) {
    case 'employee':
      title.textContent = 'Employee Compliance Report';
      content.innerHTML = buildEmployeeReport();
      break;
    case 'site':
      title.textContent = 'Site Compliance Report';
      content.innerHTML = buildSiteReport();
      break;
    case 'expiry':
      title.textContent = 'Expiry Forecast Report';
      content.innerHTML = buildExpiryReport(dateFrom, dateTo);
      break;
    case 'trade':
      title.textContent = 'Trade Coverage Report';
      content.innerHTML = buildTradeReport();
      break;
  }
  lucide.createIcons();
}

// ========== Date Range for Expiry Report ==========
function initDateRange() {
  // Set sensible defaults
  const today = new Date();
  const from = document.getElementById('expiryRangeFrom');
  const to = document.getElementById('expiryRangeTo');
  if (from) from.value = today.toISOString().split('T')[0];
  if (to) {
    const future = new Date();
    future.setMonth(future.getMonth() + 3);
    to.value = future.toISOString().split('T')[0];
  }

  document.getElementById('applyDateRange')?.addEventListener('click', () => {
    const f = document.getElementById('expiryRangeFrom').value;
    const t = document.getElementById('expiryRangeTo').value;
    generateReport('expiry', f, t);
    showToast('info', `Showing certifications expired/expiring between ${formatDate(f)} and ${formatDate(t)}`);
  });

  document.getElementById('resetDateRange')?.addEventListener('click', () => {
    const now = new Date();
    document.getElementById('expiryRangeFrom').value = now.toISOString().split('T')[0];
    const future = new Date();
    future.setMonth(future.getMonth() + 3);
    document.getElementById('expiryRangeTo').value = future.toISOString().split('T')[0];
    generateReport('expiry');
  });
}

// ========== Report Builders ==========
function buildEmployeeReport() {
  let html = '<table class="report-table"><thead><tr><th>Employee</th><th>ID</th><th>Trades</th><th>Site</th><th>Total Certs</th><th>Valid</th><th>Expiring</th><th>Expired</th></tr></thead><tbody>';
  employees.forEach(emp => {
    const certs = getEmpCerts(emp.id);
    const valid = certs.filter(c => getCertStatus(c).status === 'valid').length;
    const expiring = certs.filter(c => getCertStatus(c).status === 'expiring').length;
    const expired = certs.filter(c => getCertStatus(c).status === 'expired').length;
    const site = getSite(emp.site);
    html += `<tr>
      <td>${emp.firstName} ${emp.lastName}</td>
      <td><code>${emp.id}</code></td>
      <td>${emp.trades.join(', ')}</td>
      <td>${site ? site.name : '—'}</td>
      <td>${certs.length}</td>
      <td><span style="color:var(--color-green);font-weight:600;">${valid}</span></td>
      <td><span style="color:var(--color-amber);font-weight:600;">${expiring}</span></td>
      <td><span style="color:var(--color-red);font-weight:600;">${expired}</span></td>
    </tr>`;
  });
  html += '</tbody></table>';
  return html;
}

function buildSiteReport() {
  let html = '<table class="report-table"><thead><tr><th>Site</th><th>Status</th><th>Staff</th><th>Total Certs</th><th>Valid</th><th>Expiring</th><th>Expired</th><th>Compliance %</th></tr></thead><tbody>';
  sites.forEach(site => {
    const staff = getSiteEmployees(site.id);
    let totalCerts = 0, valid = 0, expiring = 0, expired = 0;
    staff.forEach(emp => {
      const certs = getEmpCerts(emp.id);
      totalCerts += certs.length;
      valid += certs.filter(c => getCertStatus(c).status === 'valid').length;
      expiring += certs.filter(c => getCertStatus(c).status === 'expiring').length;
      expired += certs.filter(c => getCertStatus(c).status === 'expired').length;
    });
    const compliance = totalCerts > 0 ? Math.round((valid / totalCerts) * 100) : 100;
    html += `<tr>
      <td><strong>${site.name}</strong></td>
      <td><span class="badge badge--${site.status === 'active' ? 'active' : 'inactive'}">${site.status}</span></td>
      <td>${staff.length}</td>
      <td>${totalCerts}</td>
      <td style="color:var(--color-green);font-weight:600;">${valid}</td>
      <td style="color:var(--color-amber);font-weight:600;">${expiring}</td>
      <td style="color:var(--color-red);font-weight:600;">${expired}</td>
      <td><strong style="color:${compliance < 80 ? 'var(--color-red)' : compliance < 95 ? 'var(--color-amber)' : 'var(--color-green)'}">${compliance}%</strong></td>
    </tr>`;
  });
  html += '</tbody></table>';
  return html;
}

function buildExpiryReport(dateFrom, dateTo) {
  // If date range provided, filter by that range instead of preset buckets
  if (dateFrom && dateTo) {
    return buildCustomExpiryReport(dateFrom, dateTo);
  }

  // Default: preset period buckets
  const periods = [
    { label: 'Already Expired', certs: getExpiredCerts() },
    { label: 'Expiring in 7 days', certs: getExpiringCerts(7).filter(c => getCertStatus(c).status !== 'expired') },
    { label: 'Expiring in 30 days', certs: getExpiringCerts(30).filter(c => getCertStatus(c).daysLeft > 7) },
    { label: 'Expiring in 90 days', certs: getExpiringCerts(90).filter(c => getCertStatus(c).daysLeft > 30) },
  ];

  let html = '<table class="report-table"><thead><tr><th>Period</th><th>Count</th><th>Employees</th></tr></thead><tbody>';
  periods.forEach(p => {
    const empNames = [...new Set(p.certs.map(c => {
      const emp = getEmployee(c.employeeId);
      return emp ? emp.firstName + ' ' + emp.lastName : c.employeeId;
    }))];
    html += `<tr>
      <td><strong>${p.label}</strong></td>
      <td><strong>${p.certs.length}</strong></td>
      <td>${empNames.slice(0, 5).join(', ')}${empNames.length > 5 ? ` +${empNames.length - 5} more` : ''}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  html += '<p class="text-muted" style="margin-top:1rem;"><i data-lucide="info"></i> Use the date range above to filter for a specific timeframe.</p>';
  return html;
}

function buildCustomExpiryReport(dateFrom, dateTo) {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  to.setHours(23, 59, 59, 999);

  const matching = certifications.filter(c => {
    const exp = new Date(c.expires);
    return exp >= from && exp <= to;
  }).sort((a, b) => new Date(a.expires) - new Date(b.expires));

  if (matching.length === 0) {
    return `<p class="text-muted">No certifications found with expiry dates between <strong>${formatDate(dateFrom)}</strong> and <strong>${formatDate(dateTo)}</strong>.</p>`;
  }

  const expired = matching.filter(c => getCertStatus(c).status === 'expired');
  const expiring = matching.filter(c => getCertStatus(c).status === 'expiring');
  const valid = matching.filter(c => getCertStatus(c).status === 'valid');

  let html = `<div style="display:flex;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;">
    <div class="cert-summary__card cert-summary__card--expired" style="flex:1;min-width:120px;"><span class="cert-summary__count">${expired.length}</span><span class="cert-summary__label">Already Expired</span></div>
    <div class="cert-summary__card cert-summary__card--expiring" style="flex:1;min-width:120px;"><span class="cert-summary__count">${expiring.length}</span><span class="cert-summary__label">Expiring Soon</span></div>
    <div class="cert-summary__card cert-summary__card--valid" style="flex:1;min-width:120px;"><span class="cert-summary__count">${valid.length}</span><span class="cert-summary__label">Valid (in range)</span></div>
  </div>`;

  html += `<p class="text-muted" style="margin-bottom:0.75rem;">Showing <strong>${matching.length}</strong> certifications expiring between <strong>${formatDate(dateFrom)}</strong> and <strong>${formatDate(dateTo)}</strong>.</p>`;

  html += '<table class="report-table"><thead><tr><th>Employee</th><th>Certification</th><th>Site</th><th>Issued</th><th>Expires</th><th>Status</th><th>Image</th></tr></thead><tbody>';
  matching.forEach(cert => {
    const emp = getEmployee(cert.employeeId);
    const certInfo = getCertType(cert.certId);
    const site = emp ? getSite(emp.site) : null;
    const status = getCertStatus(cert);
    const label = emp ? `${emp.firstName} ${emp.lastName} — ${certInfo ? certInfo.name : cert.certId}` : cert.certId;
    const imgCell = cert.image
      ? `<img class="cert-thumb" src="${cert.image}" alt="${label}" onclick="window.openLightbox('${cert.image}','${label.replace(/'/g, "\\'")}')" style="cursor:pointer;">`
      : '<span class="text-muted">—</span>';

    html += `<tr>
      <td>${emp ? emp.firstName + ' ' + emp.lastName : cert.employeeId}</td>
      <td><strong>${certInfo ? certInfo.name : cert.certId}</strong></td>
      <td>${site ? site.name : '—'}</td>
      <td>${formatDate(cert.issued)}</td>
      <td>${formatDate(cert.expires)}</td>
      <td><span class="badge badge--${status.status}">${status.status === 'expired' ? 'EXPIRED' : status.status === 'expiring' ? status.daysLeft + ' days' : 'Valid'}</span></td>
      <td>${imgCell}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  return html;
}

function buildTradeReport() {
  const tradeCounts = {};
  employees.filter(e => e.status === 'active').forEach(emp => {
    emp.trades.forEach(trade => {
      if (!tradeCounts[trade]) tradeCounts[trade] = { total: 0, sites: new Set() };
      tradeCounts[trade].total++;
      tradeCounts[trade].sites.add(emp.site);
    });
  });

  let html = '<table class="report-table"><thead><tr><th>Trade</th><th>Staff Count</th><th>Sites Covered</th><th>Sites</th></tr></thead><tbody>';
  Object.entries(tradeCounts).sort((a, b) => b[1].total - a[1].total).forEach(([trade, data]) => {
    const siteNames = [...data.sites].map(s => getSite(s)?.name || s).join(', ');
    html += `<tr>
      <td><strong>${trade}</strong></td>
      <td>${data.total}</td>
      <td>${data.sites.size}</td>
      <td style="font-size:0.82rem;">${siteNames}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  return html;
}

// ========== Export & Print ==========
function initExportPrint() {
  document.getElementById('exportCsvBtn')?.addEventListener('click', exportCurrentReportCsv);
  document.getElementById('printReportBtn')?.addEventListener('click', () => {
    window.print();
    showToast('info', 'Print dialog opened');
  });
}

function exportCurrentReportCsv() {
  const table = document.querySelector('#reportContent .report-table');
  if (!table) {
    showToast('warning', 'Generate a report first');
    return;
  }
  let csv = '';
  table.querySelectorAll('tr').forEach(row => {
    const cells = [];
    row.querySelectorAll('th, td').forEach(cell => {
      let text = cell.textContent.trim().replace(/"/g, '""');
      cells.push(`"${text}"`);
    });
    csv += cells.join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `safesite-report-${lastReportType || 'data'}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('success', 'CSV exported');
}

// ========== Timekeeper ==========
function renderTimekeeper() {
  const tbody = document.getElementById('tkTableBody');
  tbody.innerHTML = timekeeperRecords.map(r => {
    const inMin = timeToMin(r.clockIn);
    const outMin = timeToMin(r.clockOut);
    const hours = ((outMin - inMin) / 60).toFixed(1);
    const emp = getEmployee(r.employeeId);
    const site = getSite(r.site);
    return `
      <tr>
        <td><code>${r.employeeId}</code></td>
        <td>${r.name}</td>
        <td>${site ? site.name : r.site}</td>
        <td>${r.clockIn}</td>
        <td>${r.clockOut}</td>
        <td>${hours}h</td>
        <td>${formatDate(r.date)}</td>
      </tr>`;
  }).join('');

  const todayRecords = timekeeperRecords.filter(r => r.date === new Date().toISOString().split('T')[0]);
  document.getElementById('tkLastSync').textContent = tkSyncTime || 'Never';
  document.getElementById('tkRecordCount').textContent = timekeeperRecords.length;
  document.getElementById('tkOnSiteNow').textContent = todayRecords.length;
}

document.getElementById('syncTimekeeperBtn')?.addEventListener('click', () => {
  tkSyncTime = new Date().toLocaleString('en-GB');
  renderTimekeeper();
  showToast('success', 'Timekeeper data synced successfully');
});

document.getElementById('uploadTimekeeperBtn')?.addEventListener('click', () => {
  showToast('info', 'Timekeeper CSV upload — connect your timekeeping system to feed data here');
});

// ========== Modals ==========
function initModals() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
}

function openModal(title, bodyHtml, footerHtml = '') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('modalFooter').innerHTML = footerHtml;
  document.getElementById('modalOverlay').classList.add('active');
  lucide.createIcons();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

// Employee Detail
window.showEmpDetail = function(empId) {
  const emp = getEmployee(empId);
  if (!emp) return;
  const certs = getEmpCerts(emp.id);
  const site = getSite(emp.site);

  let certHtml = certs.length === 0 ? '<p class="text-muted">No certifications recorded.</p>' :
    `<table class="report-table"><thead><tr><th>Certification</th><th>Issued</th><th>Expires</th><th>Status</th><th>Certificate</th></tr></thead><tbody>` +
    certs.map(c => {
      const info = getCertType(c.certId);
      const s = getCertStatus(c);
      const label = `${emp.firstName} ${emp.lastName} — ${info ? info.name : c.certId}`;
      const imgCell = c.image
        ? `<img class="cert-thumb" src="${c.image}" alt="${label}" onclick="window.openLightbox('${c.image}','${label.replace(/'/g, "\\'")}')">`
        : `<button class="btn btn--ghost btn--sm" onclick="closeModal();window.showUploadCertImage('${emp.id}','${c.certId}')"><i data-lucide="camera"></i> Upload</button>`;
      return `<tr>
        <td><strong>${info ? info.name : c.certId}</strong></td>
        <td>${formatDate(c.issued)}</td>
        <td>${formatDate(c.expires)}</td>
        <td><span class="badge badge--${s.status}">${s.status === 'expired' ? 'EXPIRED' : s.status === 'expiring' ? s.daysLeft + ' days' : 'Valid'}</span></td>
        <td>${imgCell}</td>
      </tr>`;
    }).join('') + '</tbody></table>';

  const body = `
    <div style="display:flex;gap:1.25rem;align-items:flex-start;margin-bottom:1.5rem;">
      <div class="avatar avatar--lg">${emp.firstName[0]}${emp.lastName[0]}</div>
      <div>
        <h3 style="margin-bottom:0.25rem;">${emp.firstName} ${emp.lastName}</h3>
        <p class="text-muted">${emp.email} • ${emp.phone}</p>
        <p class="text-muted" style="margin-top:0.25rem;">ID: ${emp.id} • Started: ${formatDate(emp.startDate)}</p>
        <div class="trade-tags" style="margin-top:0.5rem;">
          ${emp.trades.map(t => `<span class="trade-tag">${t}</span>`).join('')}
        </div>
      </div>
    </div>
    <div style="margin-bottom:0.5rem;"><strong>Current Site:</strong> ${site ? site.name : 'Unassigned'}</div>
    <div style="margin-bottom:1rem;"><strong>Status:</strong> <span class="badge badge--${emp.status}">${emp.status === 'active' ? 'Active' : 'Inactive'}</span></div>
    <h4 style="margin-bottom:0.75rem;">Certifications</h4>
    ${certHtml}
  `;
  openModal('Employee Details', body, '<button class="btn btn--outline" onclick="closeModal()">Close</button>');
};

// Edit Employee
window.showEditEmployee = function(empId) {
  const emp = getEmployee(empId);
  if (!emp) return;
  const siteOptions = sites.map(s => `<option value="${s.id}" ${s.id === emp.site ? 'selected' : ''}>${s.name}</option>`).join('');
  const tradeCheckboxes = tradeList.map(t =>
    `<label style="display:flex;align-items:center;gap:0.4rem;padding:0.2rem 0;font-size:0.88rem;">
      <input type="checkbox" name="trades" value="${t}" ${emp.trades.includes(t) ? 'checked' : ''}> ${t}
    </label>`
  ).join('');

  const body = `
    <form id="editEmpForm">
      <div class="form-row">
        <div class="form-group">
          <label for="editFirstName">First Name</label>
          <input type="text" id="editFirstName" class="form-input" value="${emp.firstName}">
        </div>
        <div class="form-group">
          <label for="editLastName">Last Name</label>
          <input type="text" id="editLastName" class="form-input" value="${emp.lastName}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="editEmail">Email</label>
          <input type="email" id="editEmail" class="form-input" value="${emp.email}">
        </div>
        <div class="form-group">
          <label for="editPhone">Phone</label>
          <input type="text" id="editPhone" class="form-input" value="${emp.phone}">
        </div>
      </div>
      <div class="form-group">
        <label for="editSite">Site</label>
        <select id="editSite" class="form-input">${siteOptions}</select>
      </div>
      <div class="form-group">
        <label>Trades</label>
        <div style="max-height:150px;overflow-y:auto;border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:0.5rem;">
          ${tradeCheckboxes}
        </div>
      </div>
    </form>
  `;
  openModal('Edit Employee', body, `
    <button class="btn btn--outline" onclick="closeModal()">Cancel</button>
    <button class="btn btn--primary" onclick="window.saveEmployee('${emp.id}')"><i data-lucide="save"></i> Save</button>
  `);
};

window.saveEmployee = function(empId) {
  const emp = getEmployee(empId);
  if (!emp) return;
  emp.firstName = document.getElementById('editFirstName').value;
  emp.lastName = document.getElementById('editLastName').value;
  emp.email = document.getElementById('editEmail').value;
  emp.phone = document.getElementById('editPhone').value;
  emp.site = document.getElementById('editSite').value;
  emp.trades = [...document.querySelectorAll('input[name="trades"]:checked')].map(cb => cb.value);

  closeModal();
  renderEmployees();
  renderDashboard();
  showToast('success', `Employee ${emp.firstName} ${emp.lastName} updated`);
};

// Add Employee
document.getElementById('addEmployeeBtn')?.addEventListener('click', () => showAddEmployeeModal());

function showAddEmployeeModal() {
  const siteOptions = sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  const tradeCheckboxes = tradeList.map(t =>
    `<label style="display:flex;align-items:center;gap:0.4rem;padding:0.2rem 0;font-size:0.88rem;">
      <input type="checkbox" name="newTrades" value="${t}"> ${t}
    </label>`
  ).join('');

  const body = `
    <form id="addEmpForm">
      <div class="form-row">
        <div class="form-group">
          <label for="newFirstName">First Name</label>
          <input type="text" id="newFirstName" class="form-input" required>
        </div>
        <div class="form-group">
          <label for="newLastName">Last Name</label>
          <input type="text" id="newLastName" class="form-input" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="newEmail">Email</label>
          <input type="email" id="newEmail" class="form-input">
        </div>
        <div class="form-group">
          <label for="newPhone">Phone</label>
          <input type="text" id="newPhone" class="form-input">
        </div>
      </div>
      <div class="form-group">
        <label for="newSite">Site</label>
        <select id="newSite" class="form-input">${siteOptions}</select>
      </div>
      <div class="form-group">
        <label>Trades</label>
        <div style="max-height:150px;overflow-y:auto;border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:0.5rem;">
          ${tradeCheckboxes}
        </div>
      </div>
    </form>
  `;
  openModal('Add New Employee', body, `
    <button class="btn btn--outline" onclick="closeModal()">Cancel</button>
    <button class="btn btn--primary" onclick="window.createNewEmployee()"><i data-lucide="user-plus"></i> Add Employee</button>
  `);
}

window.createNewEmployee = function() {
  const firstName = document.getElementById('newFirstName').value.trim();
  const lastName = document.getElementById('newLastName').value.trim();
  if (!firstName || !lastName) {
    showToast('error', 'First and last name are required');
    return;
  }
  const newId = 'EMP' + String(employees.length + 1).padStart(3, '0');
  const trades = [...document.querySelectorAll('input[name="newTrades"]:checked')].map(cb => cb.value);
  if (trades.length === 0) {
    showToast('error', 'Select at least one trade');
    return;
  }

  employees.push({
    id: newId,
    firstName,
    lastName,
    phone: document.getElementById('newPhone').value,
    email: document.getElementById('newEmail').value,
    trades,
    site: document.getElementById('newSite').value,
    status: 'active',
    startDate: new Date().toISOString().split('T')[0]
  });

  closeModal();
  renderEmployees();
  renderDashboard();
  showToast('success', `${firstName} ${lastName} added as ${newId}`);
};

// Renew Cert Modal
window.showRenewCertModal = function(empId, certId) {
  const emp = getEmployee(empId);
  const certInfo = getCertType(certId);
  if (!emp || !certInfo) return;

  const body = `
    <p style="margin-bottom:1rem;">Renew <strong>${certInfo.name}</strong> for <strong>${emp.firstName} ${emp.lastName}</strong></p>
    <div class="form-group">
      <label for="renewIssueDate">Issue Date</label>
      <input type="date" id="renewIssueDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
    </div>
    <div class="form-group">
      <label for="renewExpiryDate">Expiry Date</label>
      <input type="date" id="renewExpiryDate" class="form-input" value="${getFutureDate(certInfo.validityMonths)}">
    </div>
    <p class="text-muted" style="margin-bottom:1rem;">Default validity: ${certInfo.validityMonths} months from issue</p>
    <div class="cert-upload-zone" id="renewUploadZone">
      <i data-lucide="camera"></i>
      <p>Upload renewed certificate image (optional)</p>
      <p class="upload-hint">Drag &amp; drop or click to browse</p>
      <input type="file" id="renewFileInput" accept="image/*,.pdf">
    </div>
    <div id="renewImagePreview" style="margin-top:0.75rem;"></div>
  `;
  openModal('Renew Certification', body, `
    <button class="btn btn--outline" onclick="closeModal()">Cancel</button>
    <button class="btn btn--primary" onclick="window.renewCert('${empId}','${certId}')"><i data-lucide="refresh-cw"></i> Renew</button>
  `);

  // Set up upload in renew modal
  setTimeout(() => {
    const zone = document.getElementById('renewUploadZone');
    const input = document.getElementById('renewFileInput');
    const preview = document.getElementById('renewImagePreview');
    if (!zone || !input) return;

    let pendingImage = null;
    window._renewPendingImage = null;

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault(); zone.classList.remove('dragover');
      if (e.dataTransfer.files.length) processRenewFile(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', (e) => {
      if (e.target.files.length) processRenewFile(e.target.files[0]);
    });

    function processRenewFile(file) {
      if (file.size > 10 * 1024 * 1024) { showToast('error', 'Max 10 MB'); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        pendingImage = e.target.result;
        window._renewPendingImage = pendingImage;
        preview.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;">
          <img src="${pendingImage}" style="max-width:150px;max-height:100px;border-radius:var(--radius-sm);border:1px solid var(--color-border);">
          <div><strong>${file.name}</strong><br><span class="text-muted">${(file.size / 1024).toFixed(0)} KB</span></div>
        </div>`;
      };
      reader.readAsDataURL(file);
    }
  }, 100);
};

window.renewCert = function(empId, certId) {
  const issueDate = document.getElementById('renewIssueDate').value;
  const expiryDate = document.getElementById('renewExpiryDate').value;

  const existing = certifications.find(c => c.employeeId === empId && c.certId === certId);
  if (existing) {
    existing.issued = issueDate;
    existing.expires = expiryDate;
    if (window._renewPendingImage) existing.image = window._renewPendingImage;
  } else {
    certifications.push({
      employeeId: empId,
      certId,
      issued: issueDate,
      expires: expiryDate,
      image: window._renewPendingImage || null
    });
  }
  window._renewPendingImage = null;

  closeModal();
  renderTraining();
  renderDashboard();
  renderEmployees();
  showToast('success', 'Certification renewed successfully');
};

// ========== Helpers ==========
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeToMin(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function getFutureDate(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

function populateSiteFilter(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">All Sites</option>' + sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  sel.value = current;
}

function populateTradeFilter(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">All Trades</option>' + tradeList.map(t => `<option value="${t}">${t}</option>`).join('');
  sel.value = current;
}

function populateCertTypeFilter(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">All Types</option>' + certTypes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  sel.value = current;
}

// Toast
function showToast(type, message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : type === 'warning' ? 'alert-triangle' : 'info';
  toast.innerHTML = `<i data-lucide="${iconName}"></i> ${message}`;
  container.appendChild(toast);
  lucide.createIcons();
  setTimeout(() => toast.remove(), 4000);
}

window.closeModal = closeModal;
