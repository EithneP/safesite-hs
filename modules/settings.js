import { getData, setData, exportAllData, importTimeKeeperData, seedDemoData } from '../store.js';
import { toast, openModal, closeModal, formatDate, renderPageTitle } from '../ui.js';

function renderSettingsPage() {
  renderPageTitle('Settings');
  const data = getData();

  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="tabs">
      <button class="tab-btn active" data-tab="settings-general" id="tabGeneral">General</button>
      <button class="tab-btn" data-tab="settings-email" id="tabEmail">Email Notifications</button>
      <button class="tab-btn" data-tab="settings-timekeeper" id="tabTimeKeeper">Time Keeper Import</button>
      <button class="tab-btn" data-tab="settings-data" id="tabData">Data Management</button>
    </div>

    <!-- General Settings -->
    <div id="settings-general" class="settings-tab">
      <div class="card">
        <div class="card-header"><h3>Company Settings</h3></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label>Company Name</label>
              <input type="text" class="form-input" id="settCompanyName" value="${data.settings.companyName || ''}">
            </div>
            <div class="form-group">
              <label>Notify Days Before Expiry</label>
              <input type="number" class="form-input" id="settNotifyDays" value="${data.settings.notifyDaysBefore || 30}" min="1" max="365">
              <span class="form-hint">Days before certificate expiry to trigger alerts</span>
            </div>
          </div>
          <button class="btn btn-primary" id="saveGeneralBtn"><i data-lucide="save"></i> Save Settings</button>
        </div>
      </div>
    </div>

    <!-- Email Settings -->
    <div id="settings-email" class="settings-tab" style="display:none;">
      <div class="card">
        <div class="card-header"><h3>Email Notification Settings</h3></div>
        <div class="card-body">
          <div class="form-group">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
              <input type="checkbox" id="settEmailEnabled" ${data.settings.emailNotifications ? 'checked' : ''}>
              Enable email notifications
            </label>
          </div>
          <div class="form-group">
            <label>Email Recipients (one per line)</label>
            <textarea class="form-textarea" id="settEmailRecipients" rows="4" placeholder="office@company.com\nhealth-safety@company.com">${(data.settings.emailRecipients || []).join('\n')}</textarea>
            <span class="form-hint">These addresses receive certificate expiry alerts</span>
          </div>
          <button class="btn btn-primary" id="saveEmailBtn"><i data-lucide="save"></i> Save Email Settings</button>
          <button class="btn btn-secondary" id="testEmailBtn"><i data-lucide="mail"></i> Send Test Email</button>
        </div>
      </div>
    </div>

    <!-- Time Keeper Import -->
    <div id="settings-timekeeper" class="settings-tab" style="display:none;">
      <div class="card">
        <div class="card-header"><h3>Time Keeper Software Import</h3></div>
        <div class="card-body">
          <div class="alert alert-info" style="margin-bottom:16px;">
            <i data-lucide="info"></i>
            <div>
              <strong>Import staff location data from your time keeper software.</strong>
              <p style="font-size:0.85rem;margin-top:4px;">Upload a CSV file with columns: <code>staffId, firstName, lastName, siteName, date</code></p>
            </div>
          </div>

          ${data.settings.lastTimeKeeperImport
            ? `<p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;">Last import: ${formatDate(data.settings.lastTimeKeeperImport)}</p>`
            : ''}

          <div class="form-group">
            <label>Upload CSV File</label>
            <input type="file" class="form-input" id="tkFileInput" accept=".csv,.txt">
          </div>

          <div id="tkPreview" style="display:none;">
            <h4 style="margin:16px 0 8px;">Preview</h4>
            <div class="table-container" id="tkPreviewTable"></div>
            <div style="margin-top:12px;">
              <button class="btn btn-primary" id="tkImportBtn"><i data-lucide="download"></i> Import Data</button>
            </div>
          </div>

          <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
            <h4 style="margin-bottom:8px;">Or Paste CSV Data</h4>
            <textarea class="form-textarea" id="tkPasteArea" rows="6" placeholder="staffId,firstName,lastName,siteName,date&#10;TK001,John,Smith,Riverside Towers,2024-01-15&#10;TK002,Jane,Doe,Green Park Office,2024-01-15"></textarea>
            <button class="btn btn-primary" id="tkPasteImportBtn" style="margin-top:8px;"><i data-lucide="download"></i> Import from Paste</button>
          </div>

          <div id="tkImportResult" style="display:none;"></div>
        </div>
      </div>
    </div>

    <!-- Data Management -->
    <div id="settings-data" class="settings-tab" style="display:none;">
      <div class="card">
        <div class="card-header"><h3>Data Management</h3></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div>
              <h4 style="margin-bottom:8px;">Export Data</h4>
              <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;">Download all staff, certificates, and site data as a JSON backup.</p>
              <button class="btn btn-primary" id="exportDataBtn2"><i data-lucide="download"></i> Export All Data</button>
            </div>
            <div>
              <h4 style="margin-bottom:8px;">Import Data</h4>
              <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;">Restore data from a previously exported backup file.</p>
              <input type="file" class="form-input" id="importDataInput" accept=".json" style="margin-bottom:8px;">
              <button class="btn btn-secondary" id="importDataBtn"><i data-lucide="upload"></i> Import Data</button>
            </div>
          </div>

          <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
            <h4 style="margin-bottom:8px;color:var(--color-danger);">Danger Zone</h4>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;">Load sample data to explore the platform. This will add demo staff, sites, and certificates.</p>
            <button class="btn btn-secondary" id="loadDemoBtn"><i data-lucide="database"></i> Load Demo Data</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.settings-tab').forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).style.display = 'block';
    };
  });

  // General
  document.getElementById('saveGeneralBtn').onclick = () => {
    const s = getData().settings;
    setData({ settings: { ...s,
      companyName: document.getElementById('settCompanyName').value.trim(),
      notifyDaysBefore: parseInt(document.getElementById('settNotifyDays').value) || 30
    }});
    toast('Settings saved', 'success');
  };

  // Email
  document.getElementById('saveEmailBtn').onclick = () => {
    const s = getData().settings;
    const recipients = document.getElementById('settEmailRecipients').value.split('\n').map(r => r.trim()).filter(Boolean);
    setData({ settings: { ...s,
      emailNotifications: document.getElementById('settEmailEnabled').checked,
      emailRecipients: recipients
    }});
    toast('Email settings saved', 'success');
  };

  document.getElementById('testEmailBtn').onclick = () => {
    const s = getData().settings;
    if (!s.emailRecipients?.length) { toast('No email recipients configured', 'error'); return; }
    const subject = encodeURIComponent('Test — H&S Platform Notification');
    const body = encodeURIComponent('This is a test email from the Health & Safety Platform.\n\nIf you received this, email notifications are working correctly.');
    window.open(`mailto:${s.emailRecipients[0]}?subject=${subject}&body=${body}`);
    toast('Test email opened', 'success');
  };

  // Time Keeper
  document.getElementById('tkFileInput').onchange = (e) => handleTKFile(e.target.files[0]);
  document.getElementById('tkPasteImportBtn').onclick = () => {
    const csv = document.getElementById('tkPasteArea').value.trim();
    if (!csv) { toast('Please paste CSV data', 'error'); return; }
    processTKCSV(csv);
  };

  // Export
  document.getElementById('exportDataBtn2').onclick = exportAllData;

  // Import
  document.getElementById('importDataBtn').onclick = () => {
    const file = document.getElementById('importDataInput').files[0];
    if (!file) { toast('Please select a file', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setData(imported);
        toast('Data imported successfully. Reloading...', 'success');
        setTimeout(() => location.reload(), 1000);
      } catch { toast('Invalid JSON file', 'error'); }
    };
    reader.readAsText(file);
  };

  document.getElementById('loadDemoBtn').onclick = () => {
    seedDemoData();
    toast('Demo data loaded. Reloading...', 'success');
    setTimeout(() => location.reload(), 1000);
  };

  // Global export button
  document.getElementById('exportDataBtn')?.addEventListener('click', exportAllData);

  lucide.createIcons();
}

function handleTKFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => processTKCSV(e.target.result);
  reader.readAsText(file);
}

function processTKCSV(csvText) {
  const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) { toast('CSV must have a header row and at least one data row', 'error'); return; }

  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    if (vals.length < headers.length) continue;
    const rec = {};
    headers.forEach((h, idx) => rec[h] = vals[idx]);
    records.push({
      staffId: rec.staffid || rec.staff_id || rec.id || '',
      firstName: rec.firstname || rec.first_name || rec.first || '',
      lastName: rec.lastname || rec.last_name || rec.last || '',
      siteName: rec.sitename || rec.site_name || rec.site || '',
      date: rec.date || rec.timestamp || ''
    });
  }

  // Show preview
  const preview = document.getElementById('tkPreview');
  preview.style.display = 'block';
  document.getElementById('tkPreviewTable').innerHTML = `
    <table>
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>
        ${records.slice(0, 10).map(r => `<tr>
          <td>${r.staffId}</td><td>${r.firstName}</td><td>${r.lastName}</td><td>${r.siteName}</td><td>${r.date}</td>
        </tr>`).join('')}
        ${records.length > 10 ? `<tr><td colspan="${headers.length}" style="color:var(--text-muted);">... and ${records.length - 10} more rows</td></tr>` : ''}
      </tbody>
    </table>`;

  document.getElementById('tkImportBtn').onclick = () => {
    const result = importTimeKeeperData(records);
    toast(`Imported ${result.imported} records across ${result.sites.length} site(s)`, 'success');
    document.getElementById('tkImportResult').style.display = 'block';
    document.getElementById('tkImportResult').innerHTML = `
      <div class="alert alert-success">
        <i data-lucide="check-circle"></i>
        <div><strong>Import Complete!</strong> ${result.imported} records imported. ${result.sites.length} sites found: ${result.sites.join(', ')}</div>
      </div>`;
    lucide.createIcons();
  };
}

export { renderSettingsPage };
