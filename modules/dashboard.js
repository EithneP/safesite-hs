import { getData, getStaff, getSite, getCertsForStaff, getExpiringCerts, getExpiredCerts, getValidCerts, certStatus, daysUntilExpiry } from '../store.js';
import { formatDate, formatRelative, statusBadge, renderEmpty, renderPageTitle } from '../ui.js';

function renderDashboard() {
  renderPageTitle('Dashboard');
  const data = getData();
  const expired = getExpiredCerts();
  const expiring = getExpiringCerts(data.settings.notifyDaysBefore || 30);
  const valid = getValidCerts();

  const totalStaff = data.staff.length;
  const totalSites = data.sites.length;
  const activeSites = data.sites.filter(s => s.status === 'active').length;

  // Staff with issues
  const staffWithExpired = new Set(expired.map(c => c.staffId)).size;
  const staffWithExpiring = new Set(expiring.map(c => c.staffId)).size - staffWithExpired;

  // Recent notifications
  const recentNotifs = data.notifications.slice(0, 8);

  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="users"></i></div>
        <div class="stat-info"><h3>${totalStaff}</h3><p>Total Staff</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info"><i data-lucide="building-2"></i></div>
        <div class="stat-info"><h3>${totalSites}</h3><p>Total Sites (${activeSites} active)</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon danger"><i data-lucide="alert-triangle"></i></div>
        <div class="stat-info"><h3>${expired.length}</h3><p>Expired Certificates</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="clock"></i></div>
        <div class="stat-info"><h3>${expiring.length}</h3><p>Expiring Soon</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="shield-check"></i></div>
        <div class="stat-info"><h3>${valid.length}</h3><p>Valid Certificates</p></div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <!-- Expiring Certs Table -->
      <div class="card" style="grid-column: 1 / -1;">
        <div class="card-header">
          <h3><i data-lucide="alert-triangle" style="width:18px;height:18px;color:var(--color-warning);display:inline;vertical-align:middle;margin-right:6px;"></i> Requiring Attention</h3>
          <a href="#certificates" class="btn btn-sm btn-secondary" onclick="document.querySelector('[data-page=certificates]').click()">View All</a>
        </div>
        <div class="card-body" style="padding:0;">
          ${expired.length === 0 && expiring.length === 0
            ? renderEmpty('shield-check', 'All Clear', 'No certificates require attention right now.')
            : `<div class="table-container"><table>
                <thead><tr><th>Staff Member</th><th>Certificate</th><th>Site</th><th>Expiry</th><th>Status</th></tr></thead>
                <tbody>
                  ${[...expired, ...expiring.slice(0, 10)].map(cert => {
                    const staff = getStaff(cert.staffId);
                    const siteNames = staff ? staff.sites.map(sId => getSite(sId)?.name || '—').join(', ') : '—';
                    return `<tr>
                      <td><strong>${staff ? staff.firstName + ' ' + staff.lastName : 'Unknown'}</strong></td>
                      <td>${cert.type}</td>
                      <td>${siteNames || '—'}</td>
                      <td>${formatDate(cert.expiryDate)} (${formatRelative(cert.expiryDate)})</td>
                      <td>${statusBadge(certStatus(cert))}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table></div>`
          }
        </div>
      </div>

      <!-- Staff with Multiple Trades -->
      <div class="card">
        <div class="card-header">
          <h3><i data-lucide="briefcase" style="width:18px;height:18px;color:var(--color-primary);display:inline;vertical-align:middle;margin-right:6px;"></i> Multi-Trade Staff</h3>
        </div>
        <div class="card-body" style="padding:0;">
          <div class="table-container"><table>
            <thead><tr><th>Name</th><th>Trades</th><th>Sites</th></tr></thead>
            <tbody>
              ${data.staff.filter(s => s.trades.length > 1).slice(0, 8).map(s => `
                <tr>
                  <td><strong>${s.firstName} ${s.lastName}</strong></td>
                  <td>${s.trades.map(t => `<span class="badge badge-info" style="margin:1px;">${t}</span>`).join(' ')}</td>
                  <td>${s.sites.length} site${s.sites.length !== 1 ? 's' : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table></div>
        </div>
      </div>

      <!-- Recent Notifications -->
      <div class="card">
        <div class="card-header">
          <h3><i data-lucide="bell" style="width:18px;height:18px;color:var(--color-info);display:inline;vertical-align:middle;margin-right:6px;"></i> Recent Alerts</h3>
          <a href="#notifications" class="btn btn-sm btn-secondary" onclick="document.querySelector('[data-page=notifications]').click()">View All</a>
        </div>
        <div class="card-body">
          ${recentNotifs.length === 0
            ? '<p style="color:var(--text-muted);text-align:center;padding:20px;">No notifications</p>'
            : recentNotifs.map(n => `
              <div class="alert alert-${n.severity || 'info'}" style="margin-bottom:8px;">
                <i data-lucide="${n.severity === 'danger' ? 'alert-circle' : n.severity === 'warning' ? 'alert-triangle' : 'info'}"></i>
                <div>
                  <strong>${n.title}</strong><br>
                  <span style="font-size:0.82rem;">${n.message}</span><br>
                  <span style="font-size:0.75rem;color:var(--text-muted);">${formatDate(n.createdAt)}</span>
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
}

export { renderDashboard };
