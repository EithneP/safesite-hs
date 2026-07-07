import { getData, getStaff, getSite, getCertsForStaff, certStatus, daysUntilExpiry, getExpiringCerts, getExpiredCerts } from '../store.js';
import { formatDate, formatRelative, statusBadge, renderPageTitle, openModal, closeModal, toast } from '../ui.js';

function renderReportsPage() {
  renderPageTitle('Reports');

  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="tabs">
      <button class="tab-btn active" data-tab="report-employee" id="tabEmployee">Employee Report</button>
      <button class="tab-btn" data-tab="report-site" id="tabSite">Site Report</button>
      <button class="tab-btn" data-tab="report-expiry" id="tabExpiry">Expiry Report</button>
    </div>

    <div id="report-employee" class="report-tab">
      <div class="filter-bar">
        <select class="form-select" id="reportEmpSelect">
          <option value="">Select an employee...</option>
          ${getData().staff.map(s => `<option value="${s.id}">${s.firstName} ${s.lastName}</option>`).join('')}
        </select>
        <button class="btn btn-sm btn-primary" id="genEmpReport"><i data-lucide="file-text"></i> Generate</button>
        <button class="btn btn-sm btn-secondary" id="printEmpReport"><i data-lucide="printer"></i> Print</button>
      </div>
      <div id="employeeReportOutput"></div>
    </div>

    <div id="report-site" class="report-tab" style="display:none;">
      <div class="filter-bar">
        <select class="form-select" id="reportSiteSelect">
          <option value="">Select a site...</option>
          ${getData().sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
        </select>
        <button class="btn btn-sm btn-primary" id="genSiteReport"><i data-lucide="file-text"></i> Generate</button>
        <button class="btn btn-sm btn-secondary" id="printSiteReport"><i data-lucide="printer"></i> Print</button>
      </div>
      <div id="siteReportOutput"></div>
    </div>

    <div id="report-expiry" class="report-tab" style="display:none;">
      <div class="filter-bar">
        <select class="form-select" id="reportExpiryDays">
          <option value="7">Next 7 days</option>
          <option value="14">Next 14 days</option>
          <option value="30" selected>Next 30 days</option>
          <option value="60">Next 60 days</option>
          <option value="90">Next 90 days</option>
        </select>
        <button class="btn btn-sm btn-primary" id="genExpiryReport"><i data-lucide="file-text"></i> Generate</button>
        <button class="btn btn-sm btn-secondary" id="printExpiryReport"><i data-lucide="printer"></i> Print</button>
        <button class="btn btn-sm btn-success" id="emailExpiryReport"><i data-lucide="mail"></i> Email Report</button>
      </div>
      <div id="expiryReportOutput"></div>
    </div>
  `;

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.report-tab').forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).style.display = 'block';
    };
  });

  document.getElementById('genEmpReport').onclick = generateEmployeeReport;
  document.getElementById('genSiteReport').onclick = generateSiteReport;
  document.getElementById('genExpiryReport').onclick = generateExpiryReport;

  document.getElementById('printEmpReport').onclick = () => window.print();
  document.getElementById('printSiteReport').onclick = () => window.print();
  document.getElementById('printExpiryReport').onclick = () => window.print();
  document.getElementById('emailExpiryReport').onclick = emailExpiryReport;

  lucide.createIcons();
}

function generateEmployeeReport() {
  const staffId = document.getElementById('reportEmpSelect').value;
  if (!staffId) { toast('Please select an employee', 'warning'); return; }

  const s = getStaff(staffId);
  if (!s) return;
  const certs = getCertsForStaff(s.id);
  const siteNames = s.sites.map(sId => getSite(sId)?.name).filter(Boolean);
  const data = getData();

  document.getElementById('employeeReportOutput').innerHTML = `
    <div class="card" id="printableReport">
      <div class="card-header" style="background:var(--color-primary);color:#fff;">
        <div>
          <h3 style="color:#fff;">${data.settings.companyName}</h3>
          <p style="font-size:0.8rem;opacity:0.8;">Employee Compliance Report</p>
        </div>
        <span style="font-size:0.8rem;">Generated: ${formatDate(new Date().toISOString())}</span>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          <div>
            <h4>Employee Details</h4>
            <table style="font-size:0.85rem;">
              <tr><td style="color:var(--text-secondary);width:120px;">Name:</td><td><strong>${s.firstName} ${s.lastName}</strong></td></tr>
              <tr><td style="color:var(--text-secondary);">Phone:</td><td>${s.phone || '—'}</td></tr>
              <tr><td style="color:var(--text-secondary);">Email:</td><td>${s.email || '—'}</td></tr>
              <tr><td style="color:var(--text-secondary);">Start Date:</td><td>${formatDate(s.startDate)}</td></tr>
              <tr><td style="color:var(--text-secondary);">TK ID:</td><td>${s.timekeeperId || '—'}</td></tr>
            </table>
          </div>
          <div>
            <h4>Assignments</h4>
            <p style="font-size:0.85rem;margin-bottom:4px;"><strong>Trades:</strong> ${s.trades.join(', ') || 'None'}</p>
            <p style="font-size:0.85rem;"><strong>Sites:</strong></p>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${siteNames.map(n => `<span class="badge badge-neutral">${n}</span>`).join('') || '<span style="color:var(--text-muted);">None assigned</span>'}
            </div>
          </div>
        </div>

        <h4 style="margin-bottom:10px;">Certificate Compliance (${certs.length} total)</h4>
        ${certs.length === 0
          ? '<p style="color:var(--text-muted);">No certificates on file</p>'
          : `<table style="font-size:0.85rem;">
              <thead><tr><th>Type</th><th>Number</th><th>Issue</th><th>Expiry</th><th>Status</th><th>Images</th></tr></thead>
              <tbody>
                ${certs.map(c => {
                  const days = daysUntilExpiry(c);
                  return `<tr>
                    <td><strong>${c.type}</strong></td>
                    <td>${c.number || '—'}</td>
                    <td>${formatDate(c.issueDate)}</td>
                    <td>${formatDate(c.expiryDate)}${days !== null ? ` (${days >= 0 ? days + 'd left' : Math.abs(days) + 'd overdue'})` : ''}</td>
                    <td>${statusBadge(certStatus(c))}</td>
                    <td>${c.images?.length || 0}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>`
        }

        ${certs.some(c => certStatus(c) !== 'valid') ? `
          <div class="alert alert-danger" style="margin-top:16px;">
            <i data-lucide="alert-circle"></i>
            <div>
              <strong>Compliance Issues Found</strong>
              <p>${certs.filter(c => certStatus(c) === 'expired').length} expired, ${certs.filter(c => certStatus(c) === 'critical' || certStatus(c) === 'warning').length} expiring soon.</p>
            </div>
          </div>
        ` : `
          <div class="alert alert-success" style="margin-top:16px;">
            <i data-lucide="check-circle"></i>
            <div><strong>Compliant</strong> — All certificates are up to date.</div>
          </div>
        `}
      </div>
    </div>
  `;
  lucide.createIcons();
}

function generateSiteReport() {
  const siteId = document.getElementById('reportSiteSelect').value;
  if (!siteId) { toast('Please select a site', 'warning'); return; }

  const site = getSite(siteId);
  if (!site) return;
  const data = getData();
  const staffOnSite = data.staff.filter(s => s.sites.includes(siteId));

  let allCerts = [];
  staffOnSite.forEach(s => {
    const certs = getCertsForStaff(s.id);
    certs.forEach(c => allCerts.push({ ...c, staffName: s.firstName + ' ' + s.lastName }));
  });

  const expired = allCerts.filter(c => certStatus(c) === 'expired');
  const warning = allCerts.filter(c => ['critical', 'warning'].includes(certStatus(c)));
  const valid = allCerts.filter(c => certStatus(c) === 'valid');

  document.getElementById('siteReportOutput').innerHTML = `
    <div class="card" id="printableReport">
      <div class="card-header" style="background:var(--color-primary);color:#fff;">
        <div>
          <h3 style="color:#fff;">${data.settings.companyName}</h3>
          <p style="font-size:0.8rem;opacity:0.8;">Site Compliance Report</p>
        </div>
        <span style="font-size:0.8rem;">Generated: ${formatDate(new Date().toISOString())}</span>
      </div>
      <div class="card-body">
        <h4>${site.name}</h4>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px;">
          ${site.address || ''} ${site.postcode || ''} | Manager: ${site.manager || '—'} | ${statusBadge(site.status)}
        </p>

        <div class="stats-grid" style="margin-bottom:20px;">
          <div class="stat-card"><div class="stat-icon info"><i data-lucide="users"></i></div><div class="stat-info"><h3>${staffOnSite.length}</h3><p>Staff on Site</p></div></div>
          <div class="stat-card"><div class="stat-icon success"><i data-lucide="shield-check"></i></div><div class="stat-info"><h3>${valid.length}</h3><p>Valid Certs</p></div></div>
          <div class="stat-card"><div class="stat-icon warning"><i data-lucide="clock"></i></div><div class="stat-info"><h3>${warning.length}</h3><p>Expiring Soon</p></div></div>
          <div class="stat-card"><div class="stat-icon danger"><i data-lucide="alert-triangle"></i></div><div class="stat-info"><h3>${expired.length}</h3><p>Expired</p></div></div>
        </div>

        <h4 style="margin-bottom:10px;">Staff & Certificates</h4>
        ${staffOnSite.length === 0
          ? '<p style="color:var(--text-muted);">No staff assigned to this site</p>'
          : `<div class="table-container"><table style="font-size:0.85rem;">
              <thead><tr><th>Staff</th><th>Trades</th><th>Certs</th><th>Status</th></tr></thead>
              <tbody>
                ${staffOnSite.map(s => {
                  const certs = getCertsForStaff(s.id);
                  const worst = certs.length > 0
                    ? (certs.some(c => certStatus(c) === 'expired') ? 'expired'
                      : certs.some(c => ['critical','warning'].includes(certStatus(c))) ? 'warning' : 'valid') : 'unknown';
                  return `<tr>
                    <td><strong>${s.firstName} ${s.lastName}</strong></td>
                    <td>${s.trades.map(t => `<span class="badge badge-info">${t}</span>`).join(' ')}</td>
                    <td>${certs.length}</td>
                    <td>${statusBadge(worst)}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table></div>`
        }

        ${expired.length > 0 ? `
          <div class="alert alert-danger" style="margin-top:16px;">
            <i data-lucide="alert-circle"></i>
            <div>
              <strong>${expired.length} Expired Certificate(s) on This Site</strong>
              <p>${expired.map(c => `${c.staffName} — ${c.type}`).join('; ')}</p>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  lucide.createIcons();
}

function generateExpiryReport() {
  const days = parseInt(document.getElementById('reportExpiryDays').value);
  const expiring = getExpiringCerts(days);
  const expired = getExpiredCerts();
  const data = getData();

  document.getElementById('expiryReportOutput').innerHTML = `
    <div class="card" id="printableReport">
      <div class="card-header" style="background:var(--color-primary);color:#fff;">
        <div>
          <h3 style="color:#fff;">${data.settings.companyName}</h3>
          <p style="font-size:0.8rem;opacity:0.8;">Certificate Expiry Report — Next ${days} Days</p>
        </div>
        <span style="font-size:0.8rem;">Generated: ${formatDate(new Date().toISOString())}</span>
      </div>
      <div class="card-body">
        <p style="margin-bottom:16px;font-size:0.9rem;">
          <strong>${expired.length}</strong> expired certificates, <strong>${expiring.length}</strong> expiring within ${days} days.
        </p>

        ${expired.length > 0 ? `
          <h4 style="color:var(--color-danger);margin-bottom:10px;">Expired Certificates</h4>
          <div class="table-container"><table style="font-size:0.85rem;">
            <thead><tr><th>Staff</th><th>Sites</th><th>Certificate</th><th>Expiry</th><th>Days Overdue</th></tr></thead>
            <tbody>
              ${expired.map(c => {
                const staff = getStaff(c.staffId);
                const siteNames = staff ? staff.sites.map(sId => getSite(sId)?.name).filter(Boolean).join(', ') : '—';
                return `<tr>
                  <td><strong>${staff ? staff.firstName + ' ' + staff.lastName : 'Unknown'}</strong></td>
                  <td>${siteNames}</td>
                  <td>${c.type}</td>
                  <td>${formatDate(c.expiryDate)}</td>
                  <td>${Math.abs(daysUntilExpiry(c))} days</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table></div>
        ` : ''}

        ${expiring.length > 0 ? `
          <h4 style="color:var(--color-warning);margin-top:20px;margin-bottom:10px;">Expiring Within ${days} Days</h4>
          <div class="table-container"><table style="font-size:0.85rem;">
            <thead><tr><th>Staff</th><th>Sites</th><th>Certificate</th><th>Expiry</th><th>Days Left</th></tr></thead>
            <tbody>
              ${expiring.map(c => {
                const staff = getStaff(c.staffId);
                const siteNames = staff ? staff.sites.map(sId => getSite(sId)?.name).filter(Boolean).join(', ') : '—';
                return `<tr>
                  <td><strong>${staff ? staff.firstName + ' ' + staff.lastName : 'Unknown'}</strong></td>
                  <td>${siteNames}</td>
                  <td>${c.type}</td>
                  <td>${formatDate(c.expiryDate)}</td>
                  <td>${daysUntilExpiry(c)} days</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table></div>
        ` : ''}
      </div>
    </div>
  `;
  lucide.createIcons();
}

function emailExpiryReport() {
  const days = parseInt(document.getElementById('reportExpiryDays').value);
  const expiring = getExpiringCerts(days);
  const expired = getExpiredCerts();
  const data = getData();

  if (expired.length === 0 && expiring.length === 0) {
    toast('No expiring or expired certificates to report', 'info');
    return;
  }

  // Build email body content
  const subject = encodeURIComponent(`${data.settings.companyName} — Certificate Expiry Report (${expired.length} expired, ${expiring.length} expiring)`);
  const body = encodeURIComponent(
    `Certificate Expiry Report\n` +
    `Generated: ${formatDate(new Date().toISOString())}\n` +
    `${'='.repeat(50)}\n\n` +
    (expired.length > 0 ? `EXPIRED CERTIFICATES (${expired.length}):\n` + expired.map(c => {
      const staff = getStaff(c.staffId);
      const siteNames = staff ? staff.sites.map(sId => getSite(sId)?.name).filter(Boolean).join(', ') : '—';
      return `  - ${staff ? staff.firstName + ' ' + staff.lastName : 'Unknown'} | ${c.type} | Site: ${siteNames} | Expired: ${formatDate(c.expiryDate)} (${Math.abs(daysUntilExpiry(c))} days ago)`;
    }).join('\n') + '\n\n' : '') +
    (expiring.length > 0 ? `EXPIRING WITHIN ${days} DAYS (${expiring.length}):\n` + expiring.map(c => {
      const staff = getStaff(c.staffId);
      const siteNames = staff ? staff.sites.map(sId => getSite(sId)?.name).filter(Boolean).join(', ') : '—';
      return `  - ${staff ? staff.firstName + ' ' + staff.lastName : 'Unknown'} | ${c.type} | Site: ${siteNames} | Expires: ${formatDate(c.expiryDate)} (${daysUntilExpiry(c)} days)`;
    }).join('\n') : '')
  );

  const recipients = data.settings.emailRecipients.join(',');
  window.open(`mailto:${recipients}?subject=${subject}&body=${body}`);
  toast('Email client opened with report', 'success');
}

export { renderReportsPage };
