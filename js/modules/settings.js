// ============ SETTINGS ============
function renderSettingsPage() {
  document.getElementById('pageTitle').textContent = 'Settings';
  var data = getData();
  var c = document.getElementById('pageContent');
  c.innerHTML = '<div class="tabs"><button class="tab-btn active" data-tab="settings-general">General</button><button class="tab-btn" data-tab="settings-email">Email</button><button class="tab-btn" data-tab="settings-timekeeper">Time Keeper Import</button><button class="tab-btn" data-tab="settings-data">Data Management</button></div>'+
  '<div id="settings-general" class="settings-tab"><div class="card"><div class="card-header"><h3>Company Settings</h3></div><div class="card-body"><div class="form-row"><div class="form-group"><label>Company Name</label><input type="text" class="form-input" id="settCompanyName" value="'+(data.settings.companyName||'')+'"></div><div class="form-group"><label>Notify Days Before Expiry</label><input type="number" class="form-input" id="settNotifyDays" value="'+(data.settings.notifyDaysBefore||30)+'" min="1" max="365"><span class="form-hint">Days before certificate expiry to trigger alerts</span></div></div><button class="btn btn-primary" id="saveGeneralBtn"><i data-lucide="save"></i> Save Settings</button></div></div></div>'+
  '<div id="settings-email" class="settings-tab" style="display:none"><div class="card"><div class="card-header"><h3>Email Notification Settings</h3></div><div class="card-body"><div class="form-group"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="settEmailEnabled" '+(data.settings.emailNotifications?'checked':'')+'> Enable email notifications</label></div><div class="form-group"><label>Email Recipients (one per line)</label><textarea class="form-textarea" id="settEmailRecipients" rows="4">'+(data.settings.emailRecipients||[]).join('\n')+'</textarea><span class="form-hint">These addresses receive certificate expiry alerts</span></div><button class="btn btn-primary" id="saveEmailBtn"><i data-lucide="save"></i> Save</button> <button class="btn btn-secondary" id="testEmailBtn"><i data-lucide="mail"></i> Test Email</button></div></div></div>'+
  '<div id="settings-timekeeper" class="settings-tab" style="display:none"><div class="card"><div class="card-header"><h3>Time Keeper Software Import</h3></div><div class="card-body"><div class="alert alert-info" style="margin-bottom:16px"><i data-lucide="info"></i><div><strong>Import staff location data from your time keeper software.</strong><p style="font-size:.85rem;margin-top:4px">Upload a CSV with columns: <code>staffId, firstName, lastName, siteName, date</code></p></div></div>'+(data.settings.lastTimeKeeperImport?'<p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:12px">Last import: '+formatDate(data.settings.lastTimeKeeperImport)+'</p>':'')+'<div class="form-group"><label>Upload CSV File</label><input type="file" class="form-input" id="tkFileInput" accept=".csv,.txt"></div><div id="tkPreview" style="display:none"><h4 style="margin:16px 0 8px">Preview</h4><div class="table-container" id="tkPreviewTable"></div><div style="margin-top:12px"><button class="btn btn-primary" id="tkImportBtn"><i data-lucide="download"></i> Import Data</button></div></div><div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)"><h4 style="margin-bottom:8px">Or Paste CSV Data</h4><textarea class="form-textarea" id="tkPasteArea" rows="6" placeholder="staffId,firstName,lastName,siteName,date\nTK001,John,Smith,Riverside Towers,2024-01-15"></textarea><button class="btn btn-primary" id="tkPasteImportBtn" style="margin-top:8px"><i data-lucide="download"></i> Import from Paste</button></div><div id="tkImportResult" style="display:none"></div></div></div></div>'+
  '<div id="settings-data" class="settings-tab" style="display:none"><div class="card"><div class="card-header"><h3>Data Management</h3></div><div class="card-body"><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div><h4 style="margin-bottom:8px">Export Data</h4><p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:12px">Download all data as a JSON backup.</p><button class="btn btn-primary" id="exportDataBtn2"><i data-lucide="download"></i> Export All Data</button></div><div><h4 style="margin-bottom:8px">Import Data</h4><p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:12px">Restore from a backup file.</p><input type="file" class="form-input" id="importDataInput" accept=".json" style="margin-bottom:8px"><button class="btn btn-secondary" id="importDataBtn"><i data-lucide="upload"></i> Import Data</button></div></div><div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)"><h4 style="margin-bottom:8px;color:var(--color-danger)">Danger Zone</h4><p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:12px">Load sample data to explore the platform.</p><button class="btn btn-secondary" id="loadDemoBtn"><i data-lucide="database"></i> Load Demo Data</button></div></div></div></div>';

  document.querySelectorAll('.tab-btn').forEach(function(btn){
    btn.onclick = function(){ document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active')}); document.querySelectorAll('.settings-tab').forEach(function(t){t.style.display='none'}); btn.classList.add('active'); document.getElementById(btn.dataset.tab).style.display='block'; };
  });

  document.getElementById('saveGeneralBtn').onclick = function(){
    var s = getData().settings;
    setData({settings:Object.assign({},s,{companyName:document.getElementById('settCompanyName').value.trim(),notifyDaysBefore:parseInt(document.getElementById('settNotifyDays').value)||30})});
    toast('Settings saved','success');
  };
  document.getElementById('saveEmailBtn').onclick = function(){
    var s = getData().settings;
    var rec = document.getElementById('settEmailRecipients').value.split('\n').map(function(r){return r.trim()}).filter(Boolean);
    setData({settings:Object.assign({},s,{emailNotifications:document.getElementById('settEmailEnabled').checked,emailRecipients:rec})});
    toast('Email settings saved','success');
  };
  document.getElementById('testEmailBtn').onclick = function(){
    var s = getData().settings;
    if (!s.emailRecipients || !s.emailRecipients.length) { toast('No email recipients configured','error'); return; }
    window.open('mailto:'+s.emailRecipients[0]+'?subject='+encodeURIComponent('Test \u2014 H&S Platform')+'&body='+encodeURIComponent('Test email from the H&S Platform.'));
    toast('Test email opened','success');
  };
  document.getElementById('tkFileInput').onchange = function(e){ handleTKFile(e.target.files[0]); };
  document.getElementById('tkPasteImportBtn').onclick = function(){
    var csv = document.getElementById('tkPasteArea').value.trim();
    if (!csv) { toast('Please paste CSV data','error'); return; }
    processTKCSV(csv);
  };
  document.getElementById('exportDataBtn2').onclick = exportAllData;
  document.getElementById('importDataBtn').onclick = function(){
    var file = document.getElementById('importDataInput').files[0];
    if (!file) { toast('Please select a file','error'); return; }
    var reader = new FileReader();
    reader.onload = function(e){
      try { var imported = JSON.parse(e.target.result); setData(imported); toast('Data imported. Reloading...','success'); setTimeout(function(){location.reload()},1000); }
      catch(ex) { toast('Invalid JSON file','error'); }
    };
    reader.readAsText(file);
  };
  document.getElementById('loadDemoBtn').onclick = function(){
    seedDemoData(); toast('Demo data loaded. Reloading...','success'); setTimeout(function(){location.reload()},1000);
  };
  lucide.createIcons();
}

function handleTKFile(file) {
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) { processTKCSV(e.target.result); };
  reader.readAsText(file);
}

function processTKCSV(csvText) {
  var lines = csvText.split('\n').map(function(l){return l.trim()}).filter(Boolean);
  if (lines.length < 2) { toast('CSV must have a header and data rows','error'); return; }
  var headers = lines[0].toLowerCase().split(',').map(function(h){return h.trim()});
  var records = [];
  for (var i = 1; i < lines.length; i++) {
    var vals = lines[i].split(',').map(function(v){return v.trim()});
    if (vals.length < headers.length) continue;
    var rec = {};
    headers.forEach(function(h, idx){ rec[h] = vals[idx]; });
    records.push({ staffId:rec.staffid||rec.staff_id||rec.id||'', firstName:rec.firstname||rec.first_name||'', lastName:rec.lastname||rec.last_name||'', siteName:rec.sitename||rec.site_name||rec.site||'', date:rec.date||rec.timestamp||'' });
  }
  document.getElementById('tkPreview').style.display = 'block';
  document.getElementById('tkPreviewTable').innerHTML = '<table><thead><tr>'+headers.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+records.slice(0,10).map(function(r){return '<tr><td>'+r.staffId+'</td><td>'+r.firstName+'</td><td>'+r.lastName+'</td><td>'+r.siteName+'</td><td>'+r.date+'</td></tr>'}).join('')+(records.length>10?'<tr><td colspan="'+headers.length+'" style="color:var(--text-muted)">... and '+(records.length-10)+' more</td></tr>':'')+'</tbody></table>';
  document.getElementById('tkImportBtn').onclick = function(){
    var result = importTimeKeeperData(records);
    toast('Imported '+result.imported+' records across '+result.sites.length+' site(s)','success');
    document.getElementById('tkImportResult').style.display = 'block';
    document.getElementById('tkImportResult').innerHTML = '<div class="alert alert-success"><i data-lucide="check-circle"></i><div><strong>Import Complete!</strong> '+result.imported+' records imported. Sites: '+result.sites.join(', ')+'</div></div>';
    lucide.createIcons();
  };
}
