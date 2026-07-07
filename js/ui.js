// ============ UI HELPERS ============

function toast(msg, type) {
  type = type || 'success';
  var c = document.getElementById('toastContainer');
  if (!c) { c = document.createElement('div'); c.id='toastContainer'; c.className='toast-container'; document.body.appendChild(c); }
  var ic = {success:'check-circle',error:'alert-circle',warning:'alert-triangle',info:'info'};
  var el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = '<i data-lucide="'+(ic[type]||'info')+'"></i><span>'+msg+'</span>';
  c.appendChild(el);
  lucide.createIcons();
  setTimeout(function(){ el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(function(){el.remove()},300); }, 3500);
}

function openModal(title, bodyHTML, footerHTML, opts) {
  var o = document.getElementById('modalOverlay');
  o.innerHTML = '<div class="modal '+(opts && opts.large ? 'modal-lg' : '')+'"><div class="modal-header"><h2>'+title+'</h2><button class="btn btn-icon btn-secondary" id="modalCloseBtn"><i data-lucide="x"></i></button></div><div class="modal-body">'+bodyHTML+'</div>'+(footerHTML ? '<div class="modal-footer">'+footerHTML+'</div>' : '')+'</div>';
  o.classList.add('open');
  lucide.createIcons();
  document.getElementById('modalCloseBtn').onclick = closeModal;
  o.onclick = function(e) { if (e.target === o) closeModal(); };
  return o;
}

function closeModal() {
  var o = document.getElementById('modalOverlay');
  o.classList.remove('open');
  o.innerHTML = '';
}

function formatDate(d) {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

function formatRelative(d) {
  if (!d) return '\u2014';
  var days = Math.ceil((new Date(d).getTime() - Date.now()) / 864e5);
  return days < 0 ? Math.abs(days)+'d overdue' : days === 0 ? 'Today' : days+'d';
}

function statusBadge(s) {
  var m = { valid:['badge-success','Valid'], warning:['badge-warning','Expiring Soon'], critical:['badge-danger','Critical'], expired:['badge-danger','Expired'], unknown:['badge-neutral','No Expiry'], active:['badge-success','Active'], planning:['badge-info','Planning'], closed:['badge-neutral','Closed'] };
  var v = m[s] || ['badge-neutral', s];
  return '<span class="badge '+v[0]+'">'+v[1]+'</span>';
}

function renderEmpty(icon, title, desc, action) {
  return '<div class="empty-state"><i data-lucide="'+icon+'"></i><h3>'+title+'</h3><p>'+desc+'</p>'+(action||'')+'</div>';
}
