// ============ SITES ============
function renderSitesPage() {
  document.getElementById('pageTitle').textContent = 'Sites';
  var c = document.getElementById('pageContent');
  c.innerHTML = '<div class="filter-bar"><select class="form-select" id="filterSiteStatus"><option value="">All Status</option><option value="active">Active</option><option value="planning">Planning</option><option value="closed">Closed</option></select><div style="flex:1"></div><button class="btn btn-primary" id="addSiteBtn"><i data-lucide="plus"></i> Add Site</button></div><div id="sitesGrid" class="stats-grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))"></div>';
  document.getElementById('addSiteBtn').onclick = function(){ openSiteModal(); };
  document.getElementById('filterSiteStatus').onchange = renderSitesCards;
  renderSitesCards(); lucide.createIcons();
}

function renderSitesCards() {
  var data = getData();
  var sf = document.getElementById('filterSiteStatus').value;
  var f = data.sites.slice();
  if (sf) f = f.filter(function(s){return s.status===sf});
  var g = document.getElementById('sitesGrid');
  if (f.length === 0) { g.innerHTML = '<div style="grid-column:1/-1">'+renderEmpty('building-2','No Sites Found','Add your first site to get started.')+'</div>'; lucide.createIcons(); return; }
  g.innerHTML = f.map(function(site){
    var sos = getStaffBySite(site.id);
    return '<div class="card" style="cursor:pointer" onclick="viewSiteProfile(\''+site.id+'\')"><div class="card-header"><h3 style="font-size:1rem">'+site.name+'</h3>'+statusBadge(site.status)+'</div><div class="card-body"><p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:8px"><i data-lucide="map-pin" style="width:14px;height:14px;display:inline;vertical-align:middle"></i> '+(site.address||'No address')+(site.postcode?' '+site.postcode:'')+'</p>'+(site.manager?'<p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:8px"><i data-lucide="user" style="width:14px;height:14px;display:inline;vertical-align:middle"></i> '+site.manager+'</p>':'')+'<p style="font-size:.85rem"><i data-lucide="users" style="width:14px;height:14px;display:inline;vertical-align:middle"></i> '+sos.length+' staff</p>'+(sos.length>0?'<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">'+sos.slice(0,5).map(function(s){return '<span class="badge badge-neutral">'+s.firstName+' '+s.lastName+'</span>'}).join('')+(sos.length>5?'<span class="badge badge-neutral">+'+(sos.length-5)+' more</span>':'')+'</div>':'')+'</div><div class="card-footer" style="display:flex;justify-content:flex-end;gap:6px"><button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();openSiteModal(\''+site.id+'\')"><i data-lucide="edit-2"></i> Edit</button><button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteSiteConfirm(\''+site.id+'\')"><i data-lucide="trash-2"></i></button></div></div>';
  }).join(''); lucide.createIcons();
}

function openSiteModal(sid) {
  var site = sid ? getSite(sid) : null;
  var title = site ? 'Edit Site' : 'Add Site';
  var body = '<div class="form-group"><label>Site Name *</label><input type="text" class="form-input" id="siteName" value="'+(site?site.name:'')+'" required></div><div class="form-row"><div class="form-group"><label>Address</label><input type="text" class="form-input" id="siteAddress" value="'+(site?site.address||'':'')+'"></div><div class="form-group"><label>Postcode</label><input type="text" class="form-input" id="sitePostcode" value="'+(site?site.postcode||'':'')+'"></div></div><div class="form-row"><div class="form-group"><label>Site Manager</label><input type="text" class="form-input" id="siteManager" value="'+(site?site.manager||'':'')+'"></div><div class="form-group"><label>Status</label><select class="form-select" id="siteStatus"><option value="active" '+(site&&site.status==='active'?'selected':'')+'>Active</option><option value="planning" '+(site&&site.status==='planning'?'selected':'')+'>Planning</option><option value="closed" '+(site&&site.status==='closed'?'selected':'')+'>Closed</option></select></div></div><div class="form-group"><label>Notes</label><textarea class="form-textarea" id="siteNotes" rows="2">'+(site?site.notes||'':'')+'</textarea></div>';
  var footer = '<button class="btn btn-secondary" id="modalCancelBtn">Cancel</button><button class="btn btn-primary" id="modalSaveSiteBtn">'+(site?'Save Changes':'Add Site')+'</button>';
  openModal(title, body, footer);
  document.getElementById('modalCancelBtn').onclick = closeModal;
  document.getElementById('modalSaveSiteBtn').onclick = function() {
    var name = document.getElementById('siteName').value.trim();
    if (!name) { toast('Site name is required','error'); return; }
    var sd = { name:name, address:document.getElementById('siteAddress').value.trim(), postcode:document.getElementById('sitePostcode').value.trim(), manager:document.getElementById('siteManager').value.trim(), status:document.getElementById('siteStatus').value, notes:document.getElementById('siteNotes').value.trim() };
    if (site) { updateSite(site.id, sd); toast('Site updated','success'); }
    else { addSite(sd); toast('Site added','success'); }
    closeModal(); renderSitesCards();
  };
}

function viewSiteProfile(sid) {
  var site = getSite(sid); if (!site) return;
  var sos = getStaffBySite(sid);
  openModal(site.name, '<div style="margin-bottom:16px"><p style="color:var(--text-secondary)">'+(site.address||'No address')+(site.postcode?' '+site.postcode:'')+'</p>'+(site.manager?'<p style="color:var(--text-secondary)">Manager: '+site.manager+'</p>':'')+statusBadge(site.status)+'</div><h4 style="margin-bottom:10px">Staff on Site ('+sos.length+')</h4>'+(sos.length===0?'<p style="color:var(--text-muted)">No staff currently assigned</p>':'<table style="font-size:.85rem"><thead><tr><th>Name</th><th>Trades</th></tr></thead><tbody>'+sos.map(function(s){return '<tr><td><strong>'+s.firstName+' '+s.lastName+'</strong></td><td>'+s.trades.map(function(t){return '<span class="badge badge-info">'+t+'</span>'}).join(' ')+'</td></tr>'}).join('')+'</tbody></table>'), '<button class="btn btn-secondary" id="modalCloseSite">Close</button>');
  document.getElementById('modalCloseSite').onclick = closeModal;
}

function deleteSiteConfirm(sid) {
  var site = getSite(sid); if (!site) return;
  openModal('Delete Site', '<p>Are you sure you want to delete <strong>'+site.name+'</strong>?</p><p style="color:var(--color-danger);font-size:.85rem">This will remove the site from all staff assignments.</p>', '<button class="btn btn-secondary" id="modalCancelBtn2">Cancel</button><button class="btn btn-danger" id="modalConfirmDelSiteBtn">Delete</button>');
  document.getElementById('modalCancelBtn2').onclick = closeModal;
  document.getElementById('modalConfirmDelSiteBtn').onclick = function() {
    deleteSite(sid); closeModal(); toast('Site deleted','success'); renderSitesCards();
  };
}
