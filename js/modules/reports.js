// ============ REPORTS ============
function renderReportsPage() {
  document.getElementById('pageTitle').textContent = 'Reports';
  var data = getData();
  var c = document.getElementById('pageContent');
  c.innerHTML = '<div class="tabs"><button class="tab-btn active" data-tab="report-employee">Employee Report</button><button class="tab-btn" data-tab="report-site">Site Report</button><button class="tab-btn" data-tab="report-expiry">Expiry Report</button></div>'+
  '<div id="report-employee" class="report-tab"><div class="filter-bar"><select class="form-select" id="reportEmpSelect"><option value="">Select an employee...</option>'+data.staff.map(function(s){return '<option value="'+s.id+'">'+s.firstName+' '+s.lastName+'</option>'}).join('')+'</select><button class="btn btn-sm btn-primary" onclick="generateEmployeeReport()"><i data-lucide="file-text"></i> Generate</button><button class="btn btn-sm btn-secondary" onclick="window.print()"><i data-lucide="printer"></i> Print</button></div><div id="employeeReportOutput"></div></div>'+
  '<div id="report-site" class="report-tab" style="display:none"><div class="filter-bar"><select class="form-select" id="reportSiteSelect"><option value="">Select a site...</option>'+data.sites.map(function(s){return '<option value="'+s.id+'">'+s.name+'</option>'}).join('')+'</select><button class="btn btn-sm btn-primary" onclick="generateSiteReport()"><i data-lucide="file-text"></i> Generate</button><button class="btn btn-sm btn-secondary" onclick="window.print()"><i data-lucide="printer"></i> Print</button></div><div id="siteReportOutput"></div></div>'+
  '<div id="report-expiry" class="report-tab" style="display:none"><div class="filter-bar"><select class="form-select" id="reportExpiryDays"><option value="7">Next 7 days</option><option value="14">Next 14 days</option><option value="30" selected>Next 30 days</option><option value="60">Next 60 days</option><option value="90">Next 90 days</option></select><button class="btn btn-sm btn-primary" onclick="generateExpiryReport()"><i data-lucide="file-text"></i> Generate</button><button class="btn btn-sm btn-secondary" onclick="window.print()"><i data-lucide="printer"></i> Print</button><button class="btn btn-sm btn-success" onclick="emailExpiryReport()"><i data-lucide="mail"></i> Email Report</button></div><div id="expiryReportOutput"></div></div>';
  document.querySelectorAll('.tab-btn').forEach(function(btn){
    btn.onclick = function(){ document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active')}); document.querySelectorAll('.report-tab').forEach(function(t){t.style.display='none'}); btn.classList.add('active'); document.getElementById(btn.dataset.tab).style.display='block'; };
  });
  lucide.createIcons();
}

function generateEmployeeReport() {
  var sid = document.getElementById('reportEmpSelect').value;
  if (!sid) { toast('Please select an employee','warning'); return; }
  var s = getStaff(sid); if (!s) return;
  var certs = getCertsForStaff(s.id);
  var sn = s.sites.map(function(i){var si=getSite(i);return si?si.name:''}).filter(Boolean);
  var data = getData();
  document.getElementById('employeeReportOutput').innerHTML = '<div class="card"><div class="card-header" style="background:var(--color-primary);color:#fff"><div><h3 style="color:#fff">'+data.settings.companyName+'</h3><p style="font-size:.8rem;opacity:.8">Employee Compliance Report</p></div><span style="font-size:.8rem">Generated: '+formatDate(new Date().toISOString())+'</span></div><div class="card-body"><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px"><div><h4>Employee Details</h4><table style="font-size:.85rem"><tr><td style="color:var(--text-secondary);width:120px">Name:</td><td><strong>'+s.firstName+' '+s.lastName+'</strong></td></tr><tr><td style="color:var(--text-secondary)">Phone:</td><td>'+(s.phone||'\u2014')+'</td></tr><tr><td style="color:var(--text-secondary)">Email:</td><td>'+(s.email||'\u2014')+'</td></tr><tr><td style="color:var(--text-secondary)">Start Date:</td><td>'+formatDate(s.startDate)+'</td></tr><tr><td style="color:var(--text-secondary)">TK ID:</td><td>'+(s.timekeeperId||'\u2014')+'</td></tr></table></div><div><h4>Assignments</h4><p style="font-size:.85rem;margin-bottom:4px"><strong>Trades:</strong> '+(s.trades.join(', ')||'None')+'</p><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">'+(sn.length?sn.map(function(n){return '<span class="badge badge-neutral">'+n+'</span>'}).join(''):'<span style="color:var(--text-muted)">None assigned</span>')+'</div></div></div><h4 style="margin-bottom:10px">Certificate Compliance ('+certs.length+' total)</h4>'+(certs.length===0?'<p style="color:var(--text-muted)">No certificates on file</p>':'<table style="font-size:.85rem"><thead><tr><th>Type</th><th>Number</th><th>Issue</th><th>Expiry</th><th>Status</th></tr></thead><tbody>'+certs.map(function(c){return '<tr><td><strong>'+c.type+'</strong></td><td>'+(c.number||'\u2014')+'</td><td>'+formatDate(c.issueDate)+'</td><td>'+formatDate(c.expiryDate)+'</td><td>'+statusBadge(certStatus(c))+'</td></tr>'}).join('')+'</tbody></table>')+(certs.some(function(c){return certStatus(c)!=='valid'})?'<div class="alert alert-danger" style="margin-top:16px"><i data-lucide="alert-circle"></i><div><strong>Compliance Issues</strong><p>'+certs.filter(function(c){return certStatus(c)==='expired'}).length+' expired, '+certs.filter(function(c){return certStatus(c)==='critical'||certStatus(c)==='warning'}).length+' expiring soon.</p></div></div>':'<div class="alert alert-success" style="margin-top:16px"><i data-lucide="check-circle"></i><div><strong>Compliant</strong> \u2014 All certificates up to date.</div></div>')+'</div></div>';
  lucide.createIcons();
}

function generateSiteReport() {
  var sid = document.getElementById('reportSiteSelect').value;
  if (!sid) { toast('Please select a site','warning'); return; }
  var site = getSite(sid); if (!site) return;
  var data = getData();
  var sos = data.staff.filter(function(s){return s.sites.indexOf(sid)!==-1});
  var expired=0, warning=0, valid=0;
  sos.forEach(function(s){getCertsForStaff(s.id).forEach(function(c){var st=certStatus(c);if(st==='expired')expired++;else if(st==='critical'||st==='warning')warning++;else if(st==='valid')valid++})});
  document.getElementById('siteReportOutput').innerHTML = '<div class="card"><div class="card-header" style="background:var(--color-primary);color:#fff"><div><h3 style="color:#fff">'+data.settings.companyName+'</h3><p style="font-size:.8rem;opacity:.8">Site Compliance Report</p></div><span style="font-size:.8rem">Generated: '+formatDate(new Date().toISOString())+'</span></div><div class="card-body"><h4>'+site.name+'</h4><p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:16px">'+(site.address||'')+(site.postcode?' '+site.postcode:'')+' | Manager: '+(site.manager||'\u2014')+'</p><div class="stats-grid" style="margin-bottom:20px"><div class="stat-card"><div class="stat-icon info"><i data-lucide="users"></i></div><div class="stat-info"><h3>'+sos.length+'</h3><p>Staff</p></div></div><div class="stat-card"><div class="stat-icon success"><i data-lucide="shield-check"></i></div><div class="stat-info"><h3>'+valid+'</h3><p>Valid</p></div></div><div class="stat-card"><div class="stat-icon warning"><i data-lucide="clock"></i></div><div class="stat-info"><h3>'+warning+'</h3><p>Expiring</p></div></div><div class="stat-card"><div class="stat-icon danger"><i data-lucide="alert-triangle"></i></div><div class="stat-info"><h3>'+expired+'</h3><p>Expired</p></div></div></div><h4 style="margin-bottom:10px">Staff & Certificates</h4>'+(sos.length===0?'<p style="color:var(--text-muted)">No staff assigned</p>':'<div class="table-container"><table style="font-size:.85rem"><thead><tr><th>Staff</th><th>Trades</th><th>Certs</th></tr></thead><tbody>'+sos.map(function(s){var certs=getCertsForStaff(s.id);return '<tr><td><strong>'+s.firstName+' '+s.lastName+'</strong></td><td>'+s.trades.map(function(t){return '<span class="badge badge-info">'+t+'</span>'}).join(' ')+'</td><td>'+certs.length+'</td></tr>'}).join('')+'</tbody></table></div>')+'</div></div>';
  lucide.createIcons();
}

function generateExpiryReport() {
  var days = parseInt(document.getElementById('reportExpiryDays').value);
  var expiring = getExpiringCerts(days);
  var expired = getExpiredCerts();
  var data = getData();
  document.getElementById('expiryReportOutput').innerHTML = '<div class="card"><div class="card-header" style="background:var(--color-primary);color:#fff"><div><h3 style="color:#fff">'+data.settings.companyName+'</h3><p style="font-size:.8rem;opacity:.8">Certificate Expiry Report \u2014 Next '+days+' Days</p></div><span style="font-size:.8rem">Generated: '+formatDate(new Date().toISOString())+'</span></div><div class="card-body"><p style="margin-bottom:16px;font-size:.9rem"><strong>'+expired.length+'</strong> expired, <strong>'+expiring.length+'</strong> expiring within '+days+' days.</p>'+(expired.length>0?'<h4 style="color:var(--color-danger);margin-bottom:10px">Expired</h4><div class="table-container"><table style="font-size:.85rem"><thead><tr><th>Staff</th><th>Sites</th><th>Certificate</th><th>Expiry</th><th>Overdue</th></tr></thead><tbody>'+expired.map(function(c){var staff=getStaff(c.staffId);var sn=staff?staff.sites.map(function(i){var si=getSite(i);return si?si.name:''}).filter(Boolean).join(', '):'\u2014';return '<tr><td><strong>'+(staff?staff.firstName+' '+staff.lastName:'Unknown')+'</strong></td><td>'+sn+'</td><td>'+c.type+'</td><td>'+formatDate(c.expiryDate)+'</td><td>'+Math.abs(daysUntilExpiry(c))+' days</td></tr>'}).join('')+'</tbody></table></div>':'')+(expiring.length>0?'<h4 style="color:var(--color-warning);margin-top:20px;margin-bottom:10px">Expiring Within '+days+' Days</h4><div class="table-container"><table style="font-size:.85rem"><thead><tr><th>Staff</th><th>Sites</th><th>Certificate</th><th>Expiry</th><th>Days Left</th></tr></thead><tbody>'+expiring.map(function(c){var staff=getStaff(c.staffId);var sn=staff?staff.sites.map(function(i){var si=getSite(i);return si?si.name:''}).filter(Boolean).join(', '):'\u2014';return '<tr><td><strong>'+(staff?staff.firstName+' '+staff.lastName:'Unknown')+'</strong></td><td>'+sn+'</td><td>'+c.type+'</td><td>'+formatDate(c.expiryDate)+'</td><td>'+daysUntilExpiry(c)+' days</td></tr>'}).join('')+'</tbody></table></div>':'')+'</div></div>';
  lucide.createIcons();
}

function emailExpiryReport() {
  var days = parseInt(document.getElementById('reportExpiryDays').value);
  var expiring = getExpiringCerts(days);
  var expired = getExpiredCerts();
  var data = getData();
  if (expired.length === 0 && expiring.length === 0) { toast('No certificates to report','info'); return; }
  var subject = data.settings.companyName + ' \u2014 Certificate Expiry Report ('+expired.length+' expired, '+expiring.length+' expiring)';
  var body = 'Certificate Expiry Report\nGenerated: '+formatDate(new Date().toISOString())+'\n'+'='.repeat(50)+'\n\n';
  if (expired.length > 0) {
    body += 'EXPIRED ('+expired.length+'):\n';
    expired.forEach(function(c){var staff=getStaff(c.staffId);var sn=staff?staff.sites.map(function(i){var si=getSite(i);return si?si.name:''}).filter(Boolean).join(', '):'\u2014';body+='  - '+(staff?staff.firstName+' '+staff.lastName:'Unknown')+' | '+c.type+' | Site: '+sn+' | Expired: '+formatDate(c.expiryDate)+'\n'});
    body += '\n';
  }
  if (expiring.length > 0) {
    body += 'EXPIRING WITHIN '+days+' DAYS ('+expiring.length+'):\n';
    expiring.forEach(function(c){var staff=getStaff(c.staffId);var sn=staff?staff.sites.map(function(i){var si=getSite(i);return si?si.name:''}).filter(Boolean).join(', '):'\u2014';body+='  - '+(staff?staff.firstName+' '+staff.lastName:'Unknown')+' | '+c.type+' | Site: '+sn+' | Expires: '+formatDate(c.expiryDate)+' ('+daysUntilExpiry(c)+' days)\n'});
  }
  window.open('mailto:'+data.settings.emailRecipients.join(',')+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body));
  toast('Email client opened with report','success');
}
