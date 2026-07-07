import { getData, addStaff, updateStaff, deleteStaff, getStaff, getSite, getCertsForStaff, certStatus, TRADES } from '../store.js';
import { toast, openModal, closeModal, formatDate, statusBadge, renderEmpty, renderPageTitle } from '../ui.js';

function renderStaffPage() {
  renderPageTitle('Staff Management');
  const data = getData();

  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="filter-bar">
      <select class="form-select" id="filterSite">
        <option value="">All Sites</option>
        ${data.sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
      </select>
      <select class="form-select" id="filterTrade">
        <option value="">All Trades</option>
        ${TRADES.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
      <select class="form-select" id="filterCertStatus">
        <option value="">All Cert Status</option>
        <option value="expired">Has Expired Certs</option>
        <option value="warning">Has Expiring Certs</option>
      </select>
      <div style="flex:1;"></div>
      <button class="btn btn-primary" id="addNewStaffBtn"><i data-lucide="plus"></i> Add Staff</button>
    </div>
    <div class="card">
      <div class="card-body" style="padding:0;">
        <div class="table-container" id="staffTableContainer"></div>
      </div>
    </div>
  `;

  document.getElementById('addNewStaffBtn').onclick = () => openStaffModal();
  document.getElementById('filterSite').onchange = renderStaffTable;
  document.getElementById('filterTrade').onchange = renderStaffTable;
  document.getElementById('filterCertStatus').onchange = renderStaffTable;

  renderStaffTable();
  lucide.createIcons();
}

function renderStaffTable() {
  const data = getData();
  const siteFilter = document.getElementById('filterSite').value;
  const tradeFilter = document.getElementById('filterTrade').value;
  const certStatusFilter = document.getElementById('filterCertStatus').value;

  let filtered = [...data.staff];

  if (siteFilter) filtered = filtered.filter(s => s.sites.includes(siteFilter));
  if (tradeFilter) filtered = filtered.filter(s => s.trades.includes(tradeFilter));

  if (certStatusFilter) {
    filtered = filtered.filter(s => {
      const certs = getCertsForStaff(s.id);
      return certs.some(c => certStatus(c) === certStatusFilter);
    });
  }

  const container = document.getElementById('staffTableContainer');
  if (filtered.length === 0) {
    container.innerHTML = renderEmpty('users', 'No Staff Found', 'Add your first team member to get started.',
      '<button class="btn btn-primary" onclick="document.getElementById(\'addNewStaffBtn\').click()"><i data-lucide="plus"></i> Add Staff</button>');
    lucide.createIcons();
    return;
  }

  container.innerHTML = `<table>
    <thead><tr>
      <th>Name</th><th>Trades</th><th>Sites</th><th>Certs</th><th>Status</th><th>Actions</th>
    </tr></thead>
    <tbody>
      ${filtered.map(s => {
        const certs = getCertsForStaff(s.id);
        const worstStatus = certs.length > 0
          ? (certs.some(c => certStatus(c) === 'expired') ? 'expired'
            : certs.some(c => certStatus(c) === 'critical') ? 'critical'
            : certs.some(c => certStatus(c) === 'warning') ? 'warning' : 'valid')
          : 'unknown';
        const siteNames = s.sites.map(sId => getSite(sId)?.name).filter(Boolean);
        return `<tr>
          <td>
            <strong>${s.firstName} ${s.lastName}</strong>
            ${s.phone ? `<br><span style="font-size:0.8rem;color:var(--text-muted);">${s.phone}</span>` : ''}
          </td>
          <td>${s.trades.map(t => `<span class="badge badge-info">${t}</span>`).join(' ') || '<span class="badge badge-neutral">None</span>'}</td>
          <td>${siteNames.map(n => `<span class="badge badge-neutral">${n}</span>`).join(' ') || '<span class="badge badge-neutral">Unassigned</span>'}</td>
          <td>${certs.length}</td>
          <td>${statusBadge(worstStatus)}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-secondary" onclick="window._staffView('${s.id}')"><i data-lucide="eye"></i></button>
              <button class="btn btn-sm btn-secondary" onclick="window._staffEdit('${s.id}')"><i data-lucide="edit-2"></i></button>
              <button class="btn btn-sm btn-danger" onclick="window._staffDelete('${s.id}')"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
  lucide.createIcons();
}

function openStaffModal(staffId = null) {
  const data = getData();
  const s = staffId ? getStaff(staffId) : null;
  const title = s ? 'Edit Staff Member' : 'Add Staff Member';

  const body = `
    <div class="form-row">
      <div class="form-group">
        <label>First Name *</label>
        <input type="text" class="form-input" id="staffFirstName" value="${s?.firstName || ''}" required>
      </div>
      <div class="form-group">
        <label>Last Name *</label>
        <input type="text" class="form-input" id="staffLastName" value="${s?.lastName || ''}" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Phone</label>
        <input type="tel" class="form-input" id="staffPhone" value="${s?.phone || ''}">
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" class="form-input" id="staffEmail" value="${s?.email || ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Trades</label>
      <div class="checkbox-group">
        ${TRADES.map(t => `
          <label class="checkbox-label">
            <input type="checkbox" value="${t}" class="staff-trade-check" ${s?.trades?.includes(t) ? 'checked' : ''}>
            ${t}
          </label>`).join('')}
      </div>
    </div>
    <div class="form-group">
      <label>Site Assignments</label>
      <div class="checkbox-group">
        ${data.sites.map(site => `
          <label class="checkbox-label">
            <input type="checkbox" value="${site.id}" class="staff-site-check" ${s?.sites?.includes(site.id) ? 'checked' : ''}>
            ${site.name}
          </label>`).join('')}
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Start Date</label>
        <input type="date" class="form-input" id="staffStartDate" value="${s?.startDate || ''}">
      </div>
      <div class="form-group">
        <label>Time Keeper ID</label>
        <input type="text" class="form-input" id="staffTKId" value="${s?.timekeeperId || ''}">
        <span class="form-hint">Link to time keeper software</span>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
    <button class="btn btn-primary" id="modalSaveBtn">${s ? 'Save Changes' : 'Add Staff'}</button>
  `;

  openModal(title, body, footer);
  document.getElementById('modalCancelBtn').onclick = closeModal;
  document.getElementById('modalSaveBtn').onclick = () => {
    const firstName = document.getElementById('staffFirstName').value.trim();
    const lastName = document.getElementById('staffLastName').value.trim();
    if (!firstName || !lastName) { toast('First and last name are required', 'error'); return; }

    const trades = [...document.querySelectorAll('.staff-trade-check:checked')].map(c => c.value);
    const sites = [...document.querySelectorAll('.staff-site-check:checked')].map(c => c.value);

    const staffData = {
      firstName, lastName,
      phone: document.getElementById('staffPhone').value.trim(),
      email: document.getElementById('staffEmail').value.trim(),
      trades, sites,
      startDate: document.getElementById('staffStartDate').value,
      timekeeperId: document.getElementById('staffTKId').value.trim()
    };

    if (s) {
      updateStaff(s.id, staffData);
      toast('Staff member updated', 'success');
    } else {
      addStaff(staffData);
      toast('Staff member added', 'success');
    }
    closeModal();
    renderStaffTable();
  };
}

function viewStaffProfile(staffId) {
  const s = getStaff(staffId);
  if (!s) return;
  const data = getData();
  const certs = getCertsForStaff(s.id);
  const siteNames = s.sites.map(sId => getSite(sId)?.name).filter(Boolean);

  const body = `
    <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:20px;">
      <div style="width:60px;height:60px;background:var(--color-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;font-weight:700;">
        ${s.firstName[0]}${s.lastName[0]}
      </div>
      <div>
        <h2 style="margin-bottom:4px;">${s.firstName} ${s.lastName}</h2>
        <p style="color:var(--text-secondary);">${s.trades.join(', ') || 'No trades assigned'}</p>
        ${s.phone ? `<p style="font-size:0.85rem;">📱 ${s.phone}</p>` : ''}
        ${s.email ? `<p style="font-size:0.85rem;">✉️ ${s.email}</p>` : ''}
        ${s.startDate ? `<p style="font-size:0.85rem;">📅 Started: ${formatDate(s.startDate)}</p>` : ''}
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" data-tab="profile-certs">Certificates (${certs.length})</button>
      <button class="tab-btn" data-tab="profile-sites">Sites (${siteNames.length})</button>
    </div>

    <div id="profile-certs" class="tab-content">
      ${certs.length === 0
        ? '<p style="color:var(--text-muted);text-align:center;padding:20px;">No certificates on file</p>'
        : `<table style="font-size:0.85rem;">
            <thead><tr><th>Certificate</th><th>Issue</th><th>Expiry</th><th>Status</th><th>Images</th></tr></thead>
            <tbody>
              ${certs.map(c => `<tr>
                <td><strong>${c.type}</strong><br><span style="font-size:0.75rem;color:var(--text-muted);">${c.number || ''}</span></td>
                <td>${formatDate(c.issueDate)}</td>
                <td>${formatDate(c.expiryDate)}<br><small>${formatDate && window._formatRelative ? window._formatRelative(c.expiryDate) : ''}</small></td>
                <td>${statusBadge(certStatus(c))}</td>
                <td>${c.images?.length || 0} file${(c.images?.length || 0) !== 1 ? 's' : ''}</td>
              </tr>`).join('')}
            </tbody>
          </table>`
      }
    </div>

    <div id="profile-sites" class="tab-content" style="display:none;">
      ${siteNames.length === 0
        ? '<p style="color:var(--text-muted);text-align:center;padding:20px;">Not assigned to any sites</p>'
        : siteNames.map(n => `<span class="badge badge-neutral" style="margin:4px;font-size:0.85rem;">${n}</span>`).join('')}
    </div>
  `;

  openModal('Staff Profile', body, `<button class="btn btn-secondary" id="modalCloseBtn2">Close</button>`);
  document.getElementById('modalCloseBtn2').onclick = closeModal;

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).style.display = 'block';
    };
  });
}

// Wire up globals
window._staffView = (id) => viewStaffProfile(id);
window._staffEdit = (id) => openStaffModal(id);
window._staffDelete = (id) => {
  const s = getStaff(id);
  if (!s) return;
  openModal('Delete Staff Member',
    `<p>Are you sure you want to delete <strong>${s.firstName} ${s.lastName}</strong>?</p>
     <p style="color:var(--color-danger);font-size:0.85rem;">This will also remove all their certificates. This cannot be undone.</p>`,
    `<button class="btn btn-secondary" id="modalCancelBtn2">Cancel</button>
     <button class="btn btn-danger" id="modalConfirmDelBtn">Delete</button>`);
  document.getElementById('modalCancelBtn2').onclick = closeModal;
  document.getElementById('modalConfirmDelBtn').onclick = () => {
    deleteStaff(id);
    closeModal();
    toast('Staff member deleted', 'success');
    renderStaffTable();
  };
};

export { renderStaffPage };
