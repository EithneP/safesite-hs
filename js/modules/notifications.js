import { getData, addNotification, markNotificationRead, markAllNotificationsRead, getUnreadCount } from '../store.js';
import { formatDate, renderEmpty, renderPageTitle, toast } from '../ui.js';

function renderNotificationsPage() {
  renderPageTitle('Notifications');
  const data = getData();

  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="filter-bar">
      <div style="display:flex;gap:8px;">
        <button class="btn btn-sm btn-secondary" id="markAllReadBtn"><i data-lucide="check-check"></i> Mark All Read</button>
        <button class="btn btn-sm btn-secondary" id="simulateNotifBtn"><i data-lucide="bell-ring"></i> Simulate Alert</button>
      </div>
      <div style="flex:1;"></div>
      <span style="font-size:0.85rem;color:var(--text-secondary);">${getUnreadCount()} unread notification${getUnreadCount() !== 1 ? 's' : ''}</span>
    </div>
    <div id="notificationsList"></div>
  `;

  document.getElementById('markAllReadBtn').onclick = () => {
    markAllNotificationsRead();
    toast('All notifications marked as read', 'success');
    renderNotificationsList();
  };

  document.getElementById('simulateNotifBtn').onclick = () => {
    addNotification({
      type: 'expiry_warning',
      title: 'Test: Certificate Expiring',
      message: 'This is a simulated expiry notification for testing email alerts.',
      severity: 'warning',
      certId: null,
      staffId: null
    });
    toast('Test notification created', 'success');
    renderNotificationsList();
  };

  renderNotificationsList();
  lucide.createIcons();
}

function renderNotificationsList() {
  const data = getData();
  const list = document.getElementById('notificationsList');

  if (data.notifications.length === 0) {
    list.innerHTML = renderEmpty('bell', 'No Notifications', 'You\'re all caught up!');
    lucide.createIcons();
    return;
  }

  list.innerHTML = data.notifications.map(n => `
    <div class="alert alert-${n.severity || 'info'}" style="cursor:pointer;opacity:${n.read ? 0.6 : 1};" onclick="window._markNotifRead('${n.id}')">
      <i data-lucide="${n.severity === 'danger' ? 'alert-circle' : n.severity === 'warning' ? 'alert-triangle' : 'info'}"></i>
      <div style="flex:1;">
        <strong>${n.title}</strong>
        <p style="font-size:0.85rem;margin-top:2px;">${n.message}</p>
        <span style="font-size:0.75rem;color:var(--text-muted);">${formatDate(n.createdAt)}</span>
        ${!n.read ? '<span class="badge badge-danger" style="margin-left:8px;">New</span>' : ''}
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

window._markNotifRead = (id) => {
  markNotificationRead(id);
  renderNotificationsList();
};

export { renderNotificationsPage };
