// ============ STAFF ============
function renderStaffPage() {
  document.getElementById('pageTitle').textContent = 'Staff Management';
  var data = getData();
  var c = document.getElementById('pageContent');
  c.innerHTML = '<div class="filter-bar"><select class="form-select" id="filterSite"><option value="">All Sites</option>'+data.sites.map(function(s){return '<option value="'+s.id+'">'+s.name+'</option>'}).join('')+'</select><select class="form-select" id="filterTrade"><option value="">All Trades</option>'+TRADES.map(function(t){return '<option value="'+t+'">'+t+'</option>'}).join('')+'</select><select class="form-select" id="filterCertStatus"><option value="">All Cert Status</option><option value="expired">Has Expired Certs</option><option value="warning">Has Expiring Certs</option></select><div style="flex:1"></div><button class="btn btn-primary" id="addNewStaffBtn"><i data-lucide="plus"></i> Add Staff</button></div><div class="card"><div class="card-body" style="padding:0"><div class="table-container" id="staffTableContainer"></div></div></div>';
  document.getElementById('addNewStaffBtn').onclick = function(){ openStaffModal(); };
  document.getElementById('filterSite').onchange = renderStaffTable;
  document.getElementById('filterTrade').onchange = renderStaffTable;
  document.getElementById('filterCertStatus').onchange = renderStaffTable;
  renderStaffTable();
  lucide.createIcons();
}

function renderStaffTable() {
  var data = getData();
  var sf = document.getElementById('filterSite').value;
  var tf = document.getElementById('filterTrade').value;
  var cs = document.getElementById('filterCertStatus').value;
  var f = data.staff.slice();
  if (sf) f = f.filter(function(s){return s.sites.includes(sf)});
  if (tf) f = f.filter(function(s){return s.trades.indexOf(tf)!==-1});
  if (cs) f = f.filter(function(s){return getCertsForStaff(s.id).some(function(c){return certStatus(c)===cs})});
  var ct = document.getElementById('staffTableContainer');
  if (f.length === 0) { ct.innerHTML = renderEmpty('users','No Staff Found','Add your first team member to get started.'); lucide.createIcons(); return; }
  ct.innerHTML = '<table><thead><tr><th>Name</th><th>Trades</th><th>Sites</th><th>Certs</th><th>Status</th><th>Actions</th></tr></thead><tbody>'+
  f.map(function(s){
    var certs = getCertsForStaff(s.id);
    var ws = certs.length > 0 ? (certs.some(function(c){return certStatus(c)==='expired'})?'expired':certs.some(function(c){return certStatus(c)==='critical'})?'critical':certs.some(function(c){return certStatus(c)==='warning'})?'warning':'valid') : 'unknown';
    var sn = s.sites.map(function(i){return getSite(i)}).filter(Boolean).map(function(si){return si.name});
    return '<tr><td><strong>'+s.firstName+' '+s.lastName+'</strong>'+(s.phone?'<br><span style="font-size:.8rem;color:var(--text-muted)">'+s.phone+'</span>':'')+'</td><td>'+(s.trades.length?s.trades.map(function(t){return '<span class="badge badge-info">'+t+'</span>'}).join(' '):'<span class="badge badge-neutral">None</span>')+'</td><td>'+(sn.length?sn.map(function(n){return '<span class="badge badge-neutral">'+n+'</span>'}).join(' '):'<span class="badge badge-neutral">Unassigned</span>')+'</td><td>'+certs.length+'</td><td>'+statusBadge(ws)+'</td><td><div class="btn-group"><button class="btn btn-sm btn-secondary" aria-label="View '+s.firstName+' '+s.lastName+'" onclick="viewStaffProfile(\''+s.id+'\')"><i data-lucide="eye"></i></button><button class="btn btn-sm btn-secondary" aria-label="Edit '+s.firstName+' '+s.lastName+'" onclick="openStaffModal(\''+s.id+'\')"><i data-lucide="edit-2"></i></button><button class="btn btn-sm btn-danger" aria-label="Delete '+s.firstName+' '+s.lastName+'" onclick="deleteStaffConfirm(\''+s.id+'\')"><i data-lucide="trash-2"></i></button></div></td></tr>';
  }).join('')+'</tbody></table>';
  lucide.createIcons();
}

function openStaffModal(sid) {
  var data = getData();
  var s = sid ? getStaff(sid) : null;
  var title = s ? 'Edit Staff Member' : 'Add Staff Member';
  var body = '<div class="form-row"><div class="form-group"><label>First Name *</label><input type="text" class="form-input" id="staffFirstName" value="'+(s?s.firstName:'')+'" required></div><div class="form-group"><label>Last Name *</label><input type="text" class="form-input" id="staffLastName" value="'+(s?s.lastName:'')+'" required></div></div><div class="form-row"><div class="form-group"><label>Phone</label><input type="tel" class="form-input" id="staffPhone" value="'+(s&&s.phone?s.phone:'')+'"></div><div class="form-group"><label>Email</label><input type="email" class="form-input" id="staffEmail" value="'+(s&&s.email?s.email:'')+'"></div></div><div class="form-group"><label>Trades</label><div class="checkbox-group">'+TRADES.map(function(t){return '<label class="checkbox-label"><input type="checkbox" value="'+t+'" class="staff-trade-check" '+(s&&s.trades&&s.trades.indexOf(t)!==-1?'checked':'')+'>'+t+'</label>'}).join('')+'</div></div><div class="form-group"><label>Site Assignments</label><div class="checkbox-group">'+data.sites.map(function(site){return '<label class="checkbox-label"><input type="checkbox" value="'+site.id+'" class="staff-site-check" '+(s&&s.sites&&s.sites.indexOf(site.id)!==-1?'checked':'')+'>'+site.name+'</label>'}).join('')+'</div></div><div class="form-row"><div class="form-group"><label>Start Date</label><input type="date" class="form-input" id="staffStartDate" value="'+(s&&s.startDate?s.startDate:'')+'"></div><div class="form-group"><label>Time Keeper ID</label><input type="text" class="form-input" id="staffTKId" value="'+(s&&s.timekeeperId?s.timekeeperId:'')+'"><span class="form-hint">Link to time keeper software</span></div></div>';
  var footer = '<button class="btn btn-secondary" id="modalCancelBtn">Cancel</button><button class="btn btn-primary" id="modalSaveBtn">'+(s?'Save Changes':'Add Staff')+'</button>';
  openModal(title, body, footer);
  document.getElementById('modalCancelBtn').onclick = closeModal;
  document.getElementById('modalSaveBtn').onclick = function() {
    var fn = document.getElementById('staffFirstName').value.trim();
    var ln = document.getElementById('staffLastName').value.trim();
    if (!fn || !ln) { toast('First and last name are required', 'error'); return; }
    var trades = Array.prototype.slice.call(document.querySelectorAll('.staff-trade-check:checked')).map(function(c){return c.value});
    var sites = Array.prototype.slice.call(document.querySelectorAll('.staff-site-check:checked')).map(function(c){return c.value});
    var sd = { firstName:fn, lastName:ln, phone:document.getElementById('staffPhone').value.trim(), email:document.getElementById('staffEmail').value.trim(), trades:trades, sites:sites, startDate:document.getElementById('staffStartDate').value, timekeeperId:document.getElementById('staffTKId').value.trim() };
    if (s) { updateStaff(s.id, sd); toast('Staff member updated','success'); }
    else { addStaff(sd); toast('Staff member added','success'); }
    closeModal(); renderStaffTable();
  };
}

function viewStaffProfile(sid) {
  var s = getStaff(sid); if (!s) return;
  var certs = getCertsForStaff(s.id);
  var sn = s.sites.map(function(i){var si=getSite(i);return si?si.name:''}).filter(Boolean);
  var body = '<div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:20px"><div style="width:60px;height:60px;background:var(--color-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;font-weight:700">'+s.firstName[0]+s.lastName[0]+'</div><div><h2 style="margin-bottom:4px">'+s.firstName+' '+s.lastName+'</h2><p style="color:var(--text-secondary)">'+(s.trades.join(', ')||'No trades assigned')+'</p>'+(s.phone?'<p style="font-size:.85rem">\uD83D\uDCF1 '+s.phone+'</p>':'')+(s.email?'<p style="font-size:.85rem">\u2709\uFE0F '+s.email+'</p>':'')+(s.startDate?'<p style="font-size:.85rem">\uD83D\uDCC5 Started: '+formatDate(s.startDate)+'</p>':'')+'</div></div><h4 style="margin-bottom:10px">Certificates ('+certs.length+')</h4>'+(certs.length===0?'<p style="color:var(--text-muted);text-align:center;padding:20px">No certificates on file</p>':'<table style="font-size:.85rem"><thead><tr><th>Certificate</th><th>Issue</th><th>Expiry</th><th>Status</th><th>Images</th></tr></thead><tbody>'+certs.map(function(c){return '<tr><td><strong>'+c.type+'</strong><br><span style="font-size:.75rem;color:var(--text-muted)">'+(c.number||'')+'</span></td><td>'+formatDate(c.issueDate)+'</td><td>'+formatDate(c.expiryDate)+'</td><td>'+statusBadge(certStatus(c))+'</td><td>'+(c.images?c.images.length:0)+'</td></tr>'}).join('')+'</tbody></table>')+'<h4 style="margin-top:20px;margin-bottom:10px">Assigned Sites</h4>'+(sn.length===0?'<p style="color:var(--text-muted)">Not assigned to any sites</p>':sn.map(function(n){return '<span class="badge badge-neutral" style="margin:4px;font-size:.85rem">'+n+'</span>'}).join(''));
  openModal('Staff Profile', body, '<button class="btn btn-secondary" id="modalCloseBtn2">Close</button>');
  document.getElementById('modalCloseBtn2').onclick = closeModal;
}

function deleteStaffConfirm(sid) {
  var s = getStaff(sid); if (!s) return;
  openModal('Delete Staff Member', '<p>Are you sure you want to delete <strong>'+s.firstName+' '+s.lastName+'</strong>?</p><p style="color:var(--color-danger);font-size:.85rem">This will also remove all their certificates. This cannot be undone.</p>', '<button class="btn btn-secondary" id="modalCancelBtn2">Cancel</button><button class="btn btn-danger" id="modalConfirmDelBtn">Delete</button>');
  document.getElementById('modalCancelBtn2').onclick = closeModal;
  document.getElementById('modalConfirmDelBtn').onclick = function() {
    deleteStaff(sid); closeModal(); toast('Staff member deleted','success'); renderStaffTable();
  };
}
