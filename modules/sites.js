import { getData, addSite, updateSite, deleteSite, getSite, getStaffBySite, getStaff } from '../store.js';
import { toast, openModal, closeModal, formatDate, statusBadge, renderEmpty, renderPageTitle } from '../ui.js';

function renderSitesPage() {
  renderPageTitle('Sites');
  const data = getData();

  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="filter-bar">
      <select class="form-select" id="filterSiteStatus">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="planning">Planning</option>
        <option value="closed">Closed</option>
      </select>
      <div style="flex:1;"></div>
      <button class="btn btn-primary" id="addSiteBtn"><i data-lucide="plus"></i> Add Site</button>
    </div>
    <div id="sitesGrid" class="stats-grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr));"></div>
  `;

  document.getElementById('addSiteBtn').onclick = () => openSiteModal();
  document.getElementById('filterSiteStatus').onchange = renderSitesCards;
  renderSitesCards();
  lucide.createIcons();
}

function renderSitesCards() {
  const data = getData();
  const statusFilter = document.getElementById('filterSiteStatus').value;
  let filtered = [...data.sites];
  if (statusFilter) filtered = filtered.filter(s => s.status === statusFilter);

  const grid = document.getElementById('sitesGrid');
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;">${renderEmpty('building-2', 'No Sites Found', 'Add your first site to get started.')}</div>`;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(site => {
    const staffOnSite = getStaffBySite(site.id);
    return `
      <div class="card" style="cursor:pointer;" onclick="window._siteView('${site.id}')">
        <div class="card-header">
          <h3 style="font-size:1rem;">${site.name}</h3>
          ${statusBadge(site.status)}
        </div>
        <div class="card-body">
          <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px;">
            <i data-lucide="map-pin" style="width:14px;height:14px;display:inline;vertical-align:middle;"></i>
            ${site.address || 'No address'} ${site.postcode ? site.postcode : ''}
          </p>
          ${site.manager ? `<p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px;">
            <i data-lucide="user" style="width:14px;height:14px;display:inline;vertical-align:middle;"></i>
            ${site.manager}
          </p>` : ''}
          <p style="font-size:0.85rem;">
            <i data-lucide="users" style="width:14px;height:14px;display:inline;vertical-align:middle;"></i>
            ${staffOnSite.length} staff member${staffOnSite.length !== 1 ? 's' : ''} on site
          </p>
          ${staffOnSite.length > 0 ? `
            <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">
              ${staffOnSite.slice(0, 5).map(s => `<span class="badge badge-neutral">${s.firstName} ${s.lastName}</span>`).join('')}
              ${staffOnSite.length > 5 ? `<span class="badge badge-neutral">+${staffOnSite.length - 5} more</span>` : ''}
            </div>` : ''}
        </div>
        <div class="card-footer" style="display:flex;justify-content:flex-end;gap:6px;">
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();window._siteEdit('${site.id}')"><i data-lucide="edit-2"></i> Edit</button>
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();window._siteDelete('${site.id}')"><i data-lucide="trash-2"></i></button>
        </div>
      </div>`;
  }).join('');
  lucide.createIcons();
}

function openSiteModal(siteId = null) {
  const site = siteId ? getSite(siteId) : null;
  const title = site ? 'Edit Site' : 'Add Site';

  const body = `
    <div class="form-group">
      <label>Site Name *</label>
      <input type="text" class="form-input" id="siteName" value="${site?.name || ''}" required>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Address</label>
        <input type="text" class="form-input" id="siteAddress" value="${site?.address || ''}">
      </div>
      <div class="form-group">
        <label>Postcode</label>
        <input type="text" class="form-input" id="sitePostcode" value="${site?.postcode || ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Site Manager</label>
        <input type="text" class="form-input" id="siteManager" value="${site?.manager || ''}">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select class="form-select" id="siteStatus">
          <option value="active" ${site?.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="planning" ${site?.status === 'planning' ? 'selected' : ''}>Planning</option>
          <option value="closed" ${site?.status === 'closed' ? 'selected' : ''}>Closed</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea class="form-textarea" id="siteNotes" rows="2">${site?.notes || ''}</textarea>
    </div>
  `;

  const footer = `
    <button class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
    <button class="btn btn-primary" id="modalSaveSiteBtn">${site ? 'Save Changes' : 'Add Site'}</button>
  `;

  openModal(title, body, footer);
  document.getElementById('modalCancelBtn').onclick = closeModal;
  document.getElementById('modalSaveSiteBtn').onclick = () => {
    const name = document.getElementById('siteName').value.trim();
    if (!name) { toast('Site name is required', 'error'); return; }
    const siteData = {
      name,
      address: document.getElementById('siteAddress').value.trim(),
      postcode: document.getElementById('sitePostcode').value.trim(),
      manager: document.getElementById('siteManager').value.trim(),
      status: document.getElementById('siteStatus').value,
      notes: document.getElementById('siteNotes').value.trim()
    };
    if (site) { updateSite(site.id, siteData); toast('Site updated', 'success'); }
    else { addSite(siteData); toast('Site added', 'success'); }
    closeModal();
    renderSitesCards();
  };
}

window._siteView = (id) => {
  const site = getSite(id);
  if (!site) return;
  const staff = getStaffBySite(id);
  openModal(site.name,
    `<div style="margin-bottom:16px;">
      <p style="color:var(--text-secondary);">${site.address || 'No address'} ${site.postcode || ''}</p>
      ${site.manager ? `<p style="color:var(--text-secondary);">Manager: ${site.manager}</p>` : ''}
      ${statusBadge(site.status)}
    </div>
    <h4 style="margin-bottom:10px;">Staff on Site (${staff.length})</h4>
    ${staff.length === 0
      ? '<p style="color:var(--text-muted);">No staff currently assigned</p>'
      : `<table style="font-size:0.85rem;">
          <thead><tr><th>Name</th><th>Trades</th></tr></thead>
          <tbody>
            ${staff.map(s => `<tr>
              <td><strong>${s.firstName} ${s.lastName}</strong></td>
              <td>${s.trades.map(t => `<span class="badge badge-info">${t}</span>`).join(' ')}</td>
            </tr>`).join('')}
          </tbody>
        </table>`}
    ${site.notes ? `<div style="margin-top:12px;padding:10px;background:var(--bg-base);border-radius:var(--radius-sm);font-size:0.85rem;">${site.notes}</div>` : ''}`,
    `<button class="btn btn-secondary" id="modalCloseSite">Close</button>`);
  document.getElementById('modalCloseSite').onclick = closeModal;
};

window._siteEdit = (id) => openSiteModal(id);
window._siteDelete = (id) => {
  const site = getSite(id);
  if (!site) return;
  openModal('Delete Site',
    `<p>Are you sure you want to delete <strong>${site.name}</strong>?</p>
     <p style="color:var(--color-danger);font-size:0.85rem;">This will remove the site from all staff assignments.</p>`,
    `<button class="btn btn-secondary" id="modalCancelBtn2">Cancel</button>
     <button class="btn btn-danger" id="modalConfirmDelSiteBtn">Delete</button>`);
  document.getElementById('modalCancelBtn2').onclick = closeModal;
  document.getElementById('modalConfirmDelSiteBtn').onclick = () => {
    deleteSite(id);
    closeModal();
    toast('Site deleted', 'success');
    renderSitesCards();
  };
};

export { renderSitesPage };
