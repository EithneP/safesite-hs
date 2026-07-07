// UI helpers — toasts, modals, rendering utilities

// ===== Toast =====
let toastContainer;
function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function toast(message, type = 'success') {
  const container = ensureToastContainer();
  const icons = { success: 'check-circle', error: 'alert-circle', warning: 'alert-triangle', info: 'info' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i data-lucide="${icons[type] || 'info'}"></i><span>${message}</span>`;
  container.appendChild(el);
  lucide.createIcons();
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 3500);
}

// ===== Modal =====
const overlay = () => document.getElementById('modalOverlay');

function openModal(title, bodyHTML, footerHTML = '', opts = {}) {
  const o = overlay();
  o.innerHTML = `
    <div class="modal ${opts.large ? 'modal-lg' : ''}">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="btn btn-icon btn-secondary" id="modalCloseBtn">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
    </div>`;
  o.classList.add('open');
  lucide.createIcons();
  document.getElementById('modalCloseBtn').onclick = closeModal;
  o.onclick = (e) => { if (e.target === o) closeModal(); };
  return o;
}

function closeModal() {
  overlay().classList.remove('open');
  overlay().innerHTML = '';
}

// ===== Date helpers =====
function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatRelative(d) {
  if (!d) return '—';
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  return `${days}d`;
}

// ===== Render helpers =====
function statusBadge(status) {
  const map = {
    valid: ['badge-success', 'Valid'],
    warning: ['badge-warning', 'Expiring Soon'],
    critical: ['badge-danger', 'Critical'],
    expired: ['badge-danger', 'Expired'],
    unknown: ['badge-neutral', 'No Expiry'],
    active: ['badge-success', 'Active'],
    planning: ['badge-info', 'Planning'],
    closed: ['badge-neutral', 'Closed'],
  };
  const [cls, label] = map[status] || ['badge-neutral', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

function renderEmpty(icon, title, desc, action = '') {
  return `<div class="empty-state">
    <i data-lucide="${icon}"></i>
    <h3>${title}</h3>
    <p>${desc}</p>
    ${action}
  </div>`;
}

function renderPageTitle(title) {
  document.getElementById('pageTitle').textContent = title;
}

export { toast, openModal, closeModal, formatDate, formatRelative, statusBadge, renderEmpty, renderPageTitle };
