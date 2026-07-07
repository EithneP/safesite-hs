// ============ DASHBOARD ============
function renderDashboard() {
  document.getElementById('pageTitle').textContent = 'Dashboard';
  var data = getData();
  var expired = getExpiredCerts();
  var expiring = getExpiringCerts(data.settings.notifyDaysBefore || 30);
  var valid = getValidCerts();
  var activeSites = data.sites.filter(function(s){return s.status==='active'}).length;
  var c = document.getElementById('pageContent');

  c.innerHTML = '<div class="stats-grid">'+
    '<div class="stat-card"><div class="stat-icon primary"><i data-lucide="users"></i></div><div class="stat-info"><h3>'+data.staff.length+'</h3><p>Total Staff</p></div></div>'+
    '<div class="stat-card"><div class="stat-icon info"><i data-lucide="building-2"></i></div><div class="stat-info"><h3>'+data.sites.length+'</h3><p>Total Sites ('+activeSites+' active)</p></div></div>'+
    '<div class="stat-card"><div class="stat-icon danger"><i data-lucide="alert-triangle"></i></div><div class="stat-info"><h3>'+expired.length+'</h3><p>Expired Certificates</p></div></div>'+
    '<div class="stat-card"><div class="stat-icon warning"><i data-lucide="clock"></i></div><div class="stat-info"><h3>'+expiring.length+'</h3><p>Expiring Soon</p></div></div>'+
    '<div class="stat-card"><div class="stat-icon success"><i data-lucide="shield-check"></i></div><div class="stat-info"><h3>'+valid.length+'</h3><p>Valid Certificates</p></div></div>'+
  '</div>'+

  '<div class="card" style="margin-bottom:20px"><div class="card-header"><h3><i data-lucide="alert-triangle" style="width:18px;height:18px;color:var(--color-warning);display:inline;vertical-align:middle;margin-right:6px"></i> Requiring Attention</h3><button class="btn btn-sm btn-secondary" onclick="navigateTo(\'certificates\')">View All</button></div><div class="card-body" style="padding:0">'+
    (expired.length===0 && expiring.length===0 ? renderEmpty('shield-check','All Clear','No certificates require attention right now.') :
    '<div class="table-container"><table><thead><tr><th>Staff Member</th><th>Certificate</th><th>Site</th><th>Expiry</th><th>Status</th></tr></thead><tbody>'+
    expired.concat(expiring.slice(0,10)).map(function(cert){
      var s = getStaff(cert.staffId);
      var sn = s ? s.sites.map(function(i){var si=getSite(i);return si?si.name:''}).filter(Boolean).join(', ') : '\u2014';
      return '<tr><td><strong>'+(s?s.firstName+' '+s.lastName:'Unknown')+'</strong></td><td>'+cert.type+'</td><td>'+sn+'</td><td>'+formatDate(cert.expiryDate)+' ('+formatRelative(cert.expiryDate)+')</td><td>'+statusBadge(certStatus(cert))+'</td></tr>';
    }).join('')+'</tbody></table></div>')+
  '</div></div>'+

  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">'+
    '<div class="card"><div class="card-header"><h3><i data-lucide="briefcase" style="width:18px;height:18px;color:var(--color-primary);display:inline;vertical-align:middle;margin-right:6px"></i> Multi-Trade Staff</h3></div><div class="card-body" style="padding:0"><div class="table-container"><table><thead><tr><th>Name</th><th>Trades</th><th>Sites</th></tr></thead><tbody>'+
    data.staff.filter(function(s){return s.trades.length>1}).slice(0,8).map(function(s){
      return '<tr><td><strong>'+s.firstName+' '+s.lastName+'</strong></td><td>'+s.trades.map(function(t){return '<span class="badge badge-info" style="margin:1px">'+t+'</span>'}).join(' ')+'</td><td>'+s.sites.length+' site'+(s.sites.length!==1?'s':'')+'</td></tr>';
    }).join('')+'</tbody></table></div></div></div>'+

    '<div class="card"><div class="card-header"><h3><i data-lucide="bell" style="width:18px;height:18px;color:var(--color-info);display:inline;vertical-align:middle;margin-right:6px"></i> Recent Alerts</h3><button class="btn btn-sm btn-secondary" onclick="navigateTo(\'notifications\')">View All</button></div><div class="card-body">'+
    (data.notifications.length===0 ? '<p style="color:var(--text-muted);text-align:center;padding:20px">No notifications</p>' :
    data.notifications.slice(0,6).map(function(n){
      return '<div class="alert alert-'+(n.severity||'info')+'" style="margin-bottom:8px"><i data-lucide="'+(n.severity==='danger'?'alert-circle':n.severity==='warning'?'alert-triangle':'info')+'"></i><div><strong>'+n.title+'</strong><br><span style="font-size:.82rem">'+n.message+'</span><br><span style="font-size:.75rem;color:var(--text-muted)">'+formatDate(n.createdAt)+'</span></div></div>';
    }).join(''))+
  '</div></div></div></div>';

  lucide.createIcons();
}
