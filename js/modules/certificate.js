// ============ CERTIFICATES ============
var tempImages = [];

function renderCertificatesPage() {
  document.getElementById('pageTitle').textContent = 'Certificates';
  var data = getData();
  var c = document.getElementById('pageContent');
  c.innerHTML = '<div class="filter-bar"><select class="form-select" id="filterCertType"><option value="">All Types</option>'+CERT_TYPES.map(function(t){return '<option value="'+t+'">'+t+'</option>'}).join('')+'</select><select class="form-select" id="filterCertStatus"><option value="">All Status</option><option value="expired">Expired</option><option value="critical">Critical</option><option value="warning">Warning</option><option value="valid">Valid</option></select><select class="form-select" id="filterCertStaff"><option value="">All Staff</option>'+data.staff.map(function(s){return '<option value="'+s.id+'">'+s.firstName+' '+s.lastName+'</option>'}).join('')+'</select><div style="flex:1"></div><button class="btn btn-primary" id="addCertBtn"><i data-lucide="plus"></i> Add Certificate</button></div><div class="card"><div class="card-body" style="padding:0"><div class="table-container" id="certTableContainer"></div></div></div>';
  document.getElementById('addCertBtn').onclick = function(){ openCertModal(); };
  document.getElementById('filterCertType').onchange = renderCertTable;
  document.getElementById('filterCertStatus').onchange = renderCertTable;
  document.getElementById('filterCertStaff').onchange = renderCertTable;
  renderCertTable();
  lucide.createIcons();
}

function renderCertTable() {
  var data = getData();
  var tf = document.getElementById('filterCertType').value;
  var sf = document.getElementById('filterCertStatus').value;
  var stf = document.getElementById('filterCertStaff').value;
  var f = data.certificates.slice();
  if (tf) f = f.filter(function(c){return c.type===tf});
  if (stf) f = f.filter(function(c){return c.staffId===stf});
  if (sf) f = f.filter(function(c){return certStatus(c)===sf});
  f.sort(function(a,b){var da=a.expiryDate?new Date(a.expiryDate).getTime():Infinity;var db=b.expiryDate?new Date(b.expiryDate).getTime():Infinity;return da-db});
  var ct = document.getElementById('certTableContainer');
  if (f.length === 0) { ct.innerHTML = renderEmpty('file-check','No Certificates Found','Add your first certificate to get started.'); lucide.createIcons(); return; }
  ct.innerHTML = '<table><thead><tr><th>Staff</th><th>Certificate</th><th>Number</th><th>Issue</th><th>Expiry</th><th>Status</th><th>Images</th><th>Actions</th></tr></thead><tbody>'+
  f.map(function(c){
    var s = getStaff(c.staffId);
    var d = daysUntilExpiry(c);
    return '<tr><td><strong>'+(s?s.firstName+' '+s.lastName:'Unknown')+'</strong></td><td>'+c.type+'</td><td style="font-size:.8rem;color:var(--text-muted)">'+(c.number||'\u2014')+'</td><td>'+formatDate(c.issueDate)+'</td><td>'+formatDate(c.expiryDate)+'<br><small style="color:var(--text-muted)">'+(d!==null?(d>=0?d+'d remaining':Math.abs(d)+'d overdue'):'\u2014')+'</small></td><td>'+statusBadge(certStatus(c))+'</td><td>'+(c.images&&c.images.length>0?'<button class="btn btn-sm btn-secondary" onclick="viewCertImages(\''+c.id+'\')"><i data-lucide="image"></i> '+c.images.length+'</button>':'<span style="color:var(--text-muted)">\u2014</span>')+'</td><td><div class="btn-group"><button class="btn btn-sm btn-secondary" onclick="openCertModal(\''+c.id+'\')"><i data-lucide="edit-2"></i></button><button class="btn btn-sm btn-danger" onclick="deleteCertConfirm(\''+c.id+'\')"><i data-lucide="trash-2"></i></button></div></td></tr>';
  }).join('')+'</tbody></table>';
  lucide.createIcons();
}

function handleImageUpload(files) {
  Array.prototype.slice.call(files).forEach(function(file) {
    if (!file.type.startsWith('image/')) { toast('Only image files are accepted', 'error'); return; }
    if (file.size > 5*1024*1024) { toast('Image must be under 5MB', 'error'); return; }
    var reader = new FileReader();
    reader.onload = function(e) { tempImages.push({dataUrl:e.target.result,name:file.name,addedAt:Date.now()}); renderImagePreviews(); };
    reader.readAsDataURL(file);
  });
}

function renderImagePreviews() {
  var g = document.getElementById('certImageGrid'); if (!g) return;
  g.innerHTML = tempImages.map(function(img, i) {
    return '<div class="image-thumb"><img src="'+img.dataUrl+'" alt="'+img.name+'"><button class="remove-img" onclick="removeCertImage('+i+')" title="Remove">\u00d7</button></div>';
  }).join('') + '<div class="image-upload-zone" onclick="document.getElementById(\'certImageInput\').click()"><i data-lucide="upload"></i><p style="font-size:.82rem">Add More</p></div>';
  lucide.createIcons();
}

function removeCertImage(i) { tempImages.splice(i, 1); renderImagePreviews(); }

function viewCertImages(cid) {
  var cert = getCertificate(cid); if (!cert || !cert.images || !cert.images.length) return;
  openModal('Certificate Images', '<div style="display:grid;gap:16px">'+cert.images.map(function(img, i) {
    return '<div><p style="font-size:.8rem;color:var(--text-muted);margin-bottom:4px">'+(img.name||'Image '+(i+1))+'</p><img src="'+img.dataUrl+'" alt="Certificate image '+(i+1)+'" style="width:100%;border-radius:var(--radius-sm);border:1px solid var(--border)"></div>';
  }).join('')+'</div>', '<button class="btn btn-secondary" id="modalCloseImgs">Close</button>', {large:true});
  document.getElementById('modalCloseImgs').onclick = closeModal;
}

function openCertModal(cid) {
  var data = getData();
  var c = cid ? getCertificate(cid) : null;
  var title = c ? 'Edit Certificate' : 'Add Certificate';
  tempImages = (c && c.images) ? c.images.slice() : [];
  var body = '<div class="form-group"><label>Staff Member *</label><select class="form-select" id="certStaffId"><option value="">Select staff member...</option>'+data.staff.map(function(s){return '<option value="'+s.id+'" '+(c&&c.staffId===s.id?'selected':'')+'>'+s.firstName+' '+s.lastName+'</option>'}).join('')+'</select></div><div class="form-row"><div class="form-group"><label>Certificate Type *</label><select class="form-select" id="certType"><option value="">Select type...</option>'+CERT_TYPES.map(function(t){return '<option value="'+t+'" '+(c&&c.type===t?'selected':'')+'>'+t+'</option>'}).join('')+'</select></div><div class="form-group"><label>Certificate Number</label><input type="text" class="form-input" id="certNumber" value="'+(c?c.number||'':'')+'" placeholder="e.g. CSCS-123456"></div></div><div class="form-row"><div class="form-group"><label>Issue Date</label><input type="date" class="form-input" id="certIssueDate" value="'+(c?c.issueDate||'':'')+'"></div><div class="form-group"><label>Expiry Date</label><input type="date" class="form-input" id="certExpiryDate" value="'+(c?c.expiryDate||'':'')+'"></div></div><div class="form-group"><label>Notes</label><textarea class="form-textarea" id="certNotes" rows="2">'+(c?c.notes||'':'')+'</textarea></div><div class="form-group"><label>Certificate Images</label><span class="form-hint">Upload photos or scans (multiple allowed, max 5MB each)</span><div id="certImageGrid" class="image-grid" style="margin-top:8px"></div><input type="file" id="certImageInput" accept="image/*" multiple style="display:none"></div>';
  var footer = '<button class="btn btn-secondary" id="modalCancelBtn">Cancel</button><button class="btn btn-primary" id="modalSaveCertBtn">'+(c?'Save Changes':'Add Certificate')+'</button>';
  openModal(title, body, footer, {large:true});
  document.getElementById('certImageInput').onchange = function(e) { handleImageUpload(e.target.files); };
  renderImagePreviews();
  document.getElementById('modalCancelBtn').onclick = closeModal;
  document.getElementById('modalSaveCertBtn').onclick = function() {
    var staffId = document.getElementById('certStaffId').value;
    var type = document.getElementById('certType').value;
    if (!staffId || !type) { toast('Staff and certificate type are required', 'error'); return; }
    var certData = { staffId:staffId, type:type, number:document.getElementById('certNumber').value.trim(), issueDate:document.getElementById('certIssueDate').value, expiryDate:document.getElementById('certExpiryDate').value, notes:document.getElementById('certNotes').value.trim(), images:tempImages.slice() };
    if (c) { updateCertificate(c.id, certData); toast('Certificate updated','success'); }
    else { addCertificate(certData); toast('Certificate added','success'); }
    closeModal(); renderCertTable();
  };
}

function deleteCertConfirm(cid) {
  var cert = getCertificate(cid); if (!cert) return;
  openModal('Delete Certificate', '<p>Are you sure you want to delete the <strong>'+cert.type+'</strong> certificate?</p><p style="color:var(--color-danger);font-size:.85rem">This cannot be undone.</p>', '<button class="btn btn-secondary" id="modalCancelBtn2">Cancel</button><button class="btn btn-danger" id="modalConfirmDelCertBtn">Delete</button>');
  document.getElementById('modalCancelBtn2').onclick = closeModal;
  document.getElementById('modalConfirmDelCertBtn').onclick = function() {
    deleteCertificate(cid); closeModal(); toast('Certificate deleted','success'); renderCertTable();
  };
}
