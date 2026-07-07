import { getData, addCertificate, updateCertificate, deleteCertificate, getCertificate, getStaff, getCertsForStaff, certStatus, daysUntilExpiry, CERT_TYPES } from '../store.js';
import { toast, openModal, closeModal, formatDate, formatRelative, statusBadge, renderEmpty, renderPageTitle } from '../ui.js';

function renderCertificatesPage() {
  renderPageTitle('Certificates');
  const data = getData();

  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="filter-bar">
      <select class="form-select" id="filterCertType">
        <option value="">All Types</option>
        ${CERT_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
      <select class="form-select" id="filterCertStatus">
        <option value="">All Status</option>
        <option value="expired">Expired</option>
        <option value="critical">Critical (≤7 days)</option>
        <option value="warning">Warning (≤30 days)</option>
        <option value="valid">Valid</option>
      </select>
      <select class="form-select" id="filterCertStaff">
        <option value="">All Staff</option>
        ${data.staff.map(s => `<option value="${s.id}">${s.firstName} ${s.lastName}</option>`).join('')}
      </select>
      <div style="flex:1;"></div>
      <button class="btn btn-primary" id="addCertBtn"><i data-lucide="plus"></i> Add Certificate</button>
    </div>
    <div class="card">
      <div class="card-body" style="padding:0;">
        <div class="table-container" id="certTableContainer"></div>
      </div>
    </div>
  `;

  document.getElementById('addCertBtn').onclick = () => openCertModal();
  document.getElementById('filterCertType').onchange = renderCertTable;
  document.getElementById('filterCertStatus').onchange = renderCertTable;
  document.getElementById('filterCertStaff').onchange = renderCertTable;

  renderCertTable();
  lucide.createIcons();
}

function renderCertTable() {
  const data = getData();
  const typeFilter = document.getElementById('filterCertType').value;
  const statusFilter = document.getElementById('filterCertStatus').value;
  const staffFilter = document.getElementById('filterCertStaff').value;

  let filtered = [...data.certificates];
  if (typeFilter) filtered = filtered.filter(c => c.type === typeFilter);
  if (staffFilter) filtered = filtered.filter(c => c.staffId === staffFilter);
  if (statusFilter) filtered = filtered.filter(c => certStatus(c) === statusFilter);

  // Sort by expiry (most urgent first)
  filtered.sort((a, b) => {
    const da = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
    const db = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
    return da - db;
  });

  const container = document.getElementById('certTableContainer');
  if (filtered.length === 0) {
    container.innerHTML = renderEmpty('file-check', 'No Certificates Found', 'Add your first certificate to get started.',
      '<button class="btn btn-primary" onclick="document.getElementById(\'addCertBtn\').click()"><i data-lucide="plus"></i> Add Certificate</button>');
    lucide.createIcons();
    return;
  }

  container.innerHTML = `<table>
    <thead><tr>
      <th>Staff</th><th>Certificate</th><th>Number</th><th>Issue Date</th><th>Expiry Date</th><th>Status</th><th>Images</th><th>Actions</th>
    </tr></thead>
    <tbody>
      ${filtered.map(c => {
        const staff = getStaff(c.staffId);
        const days = daysUntilExpiry(c);
        return `<tr>
          <td><strong>${staff ? staff.firstName + ' ' + staff.lastName : 'Unknown'}</strong></td>
          <td>${c.type}</td>
          <td style="font-size:0.8rem;color:var(--text-muted);">${c.number || '—'}</td>
          <td>${formatDate(c.issueDate)}</td>
          <td>${formatDate(c.expiryDate)}<br><small style="color:var(--text-muted);">${days !== null ? (days >= 0 ? `${days}d remaining` : `${Math.abs(days)}d overdue`) : '—'}</small></td>
          <td>${statusBadge(certStatus(c))}</td>
          <td>${(c.images?.length || 0) > 0 ? `<button class="btn btn-sm btn-secondary" onclick="window._certViewImages('${c.id}')"><i data-lucide="image"></i> ${c.images.length}</button>` : '<span style="color:var(--text-muted);">—</span>'}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-secondary" onclick="window._certEdit('${c.id}')"><i data-lucide="edit-2"></i></button>
              <button class="btn btn-sm btn-danger" onclick="window._certDelete('${c.id}')"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
  lucide.createIcons();
}

// Image handling — store as base64 data URLs
let tempImages = [];

function handleImageUpload(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) { toast('Only image files are accepted', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { toast('Image must be under 5MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      tempImages.push({ dataUrl: e.target.result, name: file.name, addedAt: Date.now() });
      renderImagePreviews();
    };
    reader.readAsDataURL(file);
  });
}

function renderImagePreviews() {
  const grid = document.getElementById('certImageGrid');
  if (!grid) return;
  grid.innerHTML = tempImages.map((img, i) => `
    <div class="image-thumb">
      <img src="${img.dataUrl}" alt="${img.name}">
      <button class="remove-img" onclick="window._removeCertImage(${i})" title="Remove">×</button>
    </div>
  `).join('') + `
    <div class="image-upload-zone" onclick="document.getElementById('certImageInput').click()">
      <i data-lucide="upload"></i>
      <p style="font-size:0.82rem;">Add More</p>
    </div>`;
  lucide.createIcons();
}

function openCertModal(certId = null) {
  const data = getData();
  const c = certId ? getCertificate(certId) : null;
  const title = c ? 'Edit Certificate' : 'Add Certificate';
  tempImages = c?.images ? [...c.images] : [];

  const body = `
    <div class="form-group">
      <label>Staff Member *</label>
      <select class="form-select" id="certStaffId">
        <option value="">Select staff member...</option>
        ${data.staff.map(s => `<option value="${s.id}" ${c?.staffId === s.id ? 'selected' : ''}>${s.firstName} ${s.lastName}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Certificate Type *</label>
        <select class="form-select" id="certType">
          <option value="">Select type...</option>
          ${CERT_TYPES.map(t => `<option value="${t}" ${c?.type === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Certificate Number</label>
        <input type="text" class="form-input" id="certNumber" value="${c?.number || ''}" placeholder="e.g. CSCS-123456">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Issue Date</label>
        <input type="date" class="form-input" id="certIssueDate" value="${c?.issueDate || ''}">
      </div>
      <div class="form-group">
        <label>Expiry Date</label>
        <input type="date" class="form-input" id="certExpiryDate" value="${c?.expiryDate || ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea class="form-textarea" id="certNotes" rows="2">${c?.notes || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Certificate Images</label>
      <span class="form-hint">Upload photos or scans of the certificate (multiple files allowed, max 5MB each)</span>
      <div id="certImageGrid" class="image-grid" style="margin-top:8px;"></div>
      <input type="file" id="certImageInput" accept="image/*" multiple style="display:none;">
    </div>
  `;

  const footer = `
    <button class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
    <button class="btn btn-primary" id="modalSaveCertBtn">${c ? 'Save Changes' : 'Add Certificate'}</button>
  `;

  openModal(title, body, footer, { large: true });

  document.getElementById('certImageInput').onchange = (e) => handleImageUpload(e.target.files);
  renderImagePreviews();

  document.getElementById('modalCancelBtn').onclick = closeModal;
  document.getElementById('modalSaveCertBtn').onclick = () => {
    const staffId = document.getElementById('certStaffId').value;
    const type = document.getElementById('certType').value;
    if (!staffId || !type) { toast('Staff and certificate type are required', 'error'); return; }

    const certData = {
      staffId, type,
      number: document.getElementById('certNumber').value.trim(),
      issueDate: document.getElementById('certIssueDate').value,
      expiryDate: document.getElementById('certExpiryDate').value,
      notes: document.getElementById('certNotes').value.trim(),
      images: [...tempImages]
    };

    if (c) {
      updateCertificate(c.id, certData);
      toast('Certificate updated', 'success');
    } else {
      addCertificate(certData);
      toast('Certificate added', 'success');
    }
    closeModal();
    renderCertTable();
  };
}

window._removeCertImage = (idx) => {
  tempImages.splice(idx, 1);
  renderImagePreviews();
};

window._certViewImages = (certId) => {
  const cert = getCertificate(certId);
  if (!cert || !cert.images?.length) return;
  openModal('Certificate Images',
    `<div style="display:grid;grid-template-columns:1fr;gap:16px;">
      ${cert.images.map((img, i) => `
        <div>
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px;">${img.name || 'Image ' + (i+1)}</p>
          <img src="${img.dataUrl}" alt="Certificate image ${i+1}" style="width:100%;border-radius:var(--radius-sm);border:1px solid var(--border);">
        </div>
      `).join('')}
    </div>`,
    `<button class="btn btn-secondary" id="modalCloseImgs">Close</button>`,
    { large: true });
  document.getElementById('modalCloseImgs').onclick = closeModal;
};

window._certEdit = (id) => openCertModal(id);
window._certDelete = (id) => {
  const cert = getCertificate(id);
  if (!cert) return;
  openModal('Delete Certificate',
    `<p>Are you sure you want to delete the <strong>${cert.type}</strong> certificate?</p>
     <p style="color:var(--color-danger);font-size:0.85rem;">This cannot be undone.</p>`,
    `<button class="btn btn-secondary" id="modalCancelBtn2">Cancel</button>
     <button class="btn btn-danger" id="modalConfirmDelCertBtn">Delete</button>`);
  document.getElementById('modalCancelBtn2').onclick = closeModal;
  document.getElementById('modalConfirmDelCertBtn').onclick = () => {
    deleteCertificate(id);
    closeModal();
    toast('Certificate deleted', 'success');
    renderCertTable();
  };
};

export { renderCertificatesPage };
