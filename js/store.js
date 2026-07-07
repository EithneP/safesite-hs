// Data layer — localStorage-backed store with helpers
const STORE_KEY = 'hs_platform';

const TRADES = [
  'Bricklayer', 'Carpenter', 'Electrician', 'Plumber', 'Plasterer',
  'Steel Fixer', 'Scaffolder', 'Painter', 'Roofer', 'Groundworker',
  'Crane Operator', 'Labourer', 'Site Manager', 'Foreman', 'Driver',
  'Welder', 'Fitter', 'Plant Operator', 'Traffic Marshal', 'Banksmen'
];

const CERT_TYPES = [
  'CSCS Card', 'CSCS Gold', 'CSCS White', 'CSCS Blue', 'CSCS Red',
  'SMSTS', 'SSSTS', 'First Aid at Work', 'Fire Safety', 'Asbestos Awareness',
  'Working at Height', 'Manual Handling', 'Harness Training', 'Abrasive Wheels',
  'Confined Spaces', 'Toolbox Talk', 'IPAF', 'PASMA', 'Crane/PUVER',
  'Lifting Operations', 'Slinger/Signaller', 'Telehandler', 'Mini Excavator',
  'Dumper', 'Ride-On Roller', 'Chainsaw', 'Food Hygiene', 'Noise Awareness'
];

function getDefaultData() {
  return {
    staff: [],
    sites: [],
    certificates: [],
    notifications: [],
    settings: {
      companyName: 'My Construction Co',
      emailNotifications: true,
      notifyDaysBefore: 30,
      emailRecipients: ['office@company.com'],
      lastTimeKeeperImport: null
    }
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ...getDefaultData(), ...JSON.parse(raw) };
  } catch (e) { console.error('Failed to load data', e); }
  return getDefaultData();
}

function saveData(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) { console.error('Failed to save data', e); }
}

let _data = loadData();
function getData() { return _data; }
function setData(patch) { Object.assign(_data, patch); saveData(_data); }

// ID generator
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// Staff helpers
function addStaff(staff) {
  const s = { id: genId(), trades: [], sites: [], certIds: [], ...staff, createdAt: Date.now() };
  _data.staff.push(s);
  saveData(_data);
  return s;
}
function updateStaff(id, updates) {
  const s = _data.staff.find(x => x.id === id);
  if (s) { Object.assign(s, updates); saveData(_data); }
  return s;
}
function deleteStaff(id) {
  _data.staff = _data.staff.filter(x => x.id !== id);
  // Remove related certs
  _data.certificates = _data.certificates.filter(c => c.staffId !== id);
  saveData(_data);
}
function getStaff(id) { return _data.staff.find(x => x.id === id); }
function getStaffBySite(siteId) { return _data.staff.filter(s => s.sites.includes(siteId)); }

// Certificate helpers
function addCertificate(cert) {
  const c = { id: genId(), images: [], ...cert, createdAt: Date.now() };
  _data.certificates.push(c);
  if (c.staffId) {
    const s = _data.staff.find(x => x.id === c.staffId);
    if (s && !s.certIds.includes(c.id)) { s.certIds.push(c.id); saveData(_data); }
  }
  saveData(_data);
  return c;
}
function updateCertificate(id, updates) {
  const c = _data.certificates.find(x => x.id === id);
  if (c) { Object.assign(c, updates); saveData(_data); }
  return c;
}
function deleteCertificate(id) {
  const cert = _data.certificates.find(c => c.id === id);
  if (cert && cert.staffId) {
    const s = _data.staff.find(x => x.id === cert.staffId);
    if (s) s.certIds = s.certIds.filter(cId => cId !== id);
  }
  _data.certificates = _data.certificates.filter(c => c.id !== id);
  saveData(_data);
}
function getCertsForStaff(staffId) { return _data.certificates.filter(c => c.staffId === staffId); }
function getCertificate(id) { return _data.certificates.find(c => c.id === id); }

// Cert expiry helpers
function getExpiringCerts(days) {
  const now = Date.now();
  const threshold = days * 24 * 60 * 60 * 1000;
  return _data.certificates.filter(c => {
    if (!c.expiryDate) return false;
    const exp = new Date(c.expiryDate).getTime();
    const diff = exp - now;
    return diff <= threshold && diff > -30 * 24 * 60 * 60 * 1000; // within range + 30 days past
  });
}
function getExpiredCerts() {
  const now = Date.now();
  return _data.certificates.filter(c => {
    if (!c.expiryDate) return false;
    return new Date(c.expiryDate).getTime() < now;
  });
}
function getValidCerts() {
  const now = Date.now();
  return _data.certificates.filter(c => {
    if (!c.expiryDate) return false;
    return new Date(c.expiryDate).getTime() >= now;
  });
}
function certStatus(cert) {
  if (!cert.expiryDate) return 'unknown';
  const now = Date.now();
  const exp = new Date(cert.expiryDate).getTime();
  const days = Math.ceil((exp - now) / (24 * 60 * 60 * 1000));
  if (days < 0) return 'expired';
  if (days <= 30) return 'critical';
  if (days <= 60) return 'warning';
  return 'valid';
}
function daysUntilExpiry(cert) {
  if (!cert.expiryDate) return null;
  return Math.ceil((new Date(cert.expiryDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

// Site helpers
function addSite(site) {
  const s = { id: genId(), ...site, createdAt: Date.now() };
  _data.sites.push(s);
  saveData(_data);
  return s;
}
function updateSite(id, updates) {
  const s = _data.sites.find(x => x.id === id);
  if (s) { Object.assign(s, updates); saveData(_data); }
  return s;
}
function deleteSite(id) {
  _data.sites = _data.sites.filter(x => x.id !== id);
  // Remove site from staff assignments
  _data.staff.forEach(s => { s.sites = s.sites.filter(sId => sId !== id); });
  saveData(_data);
}
function getSite(id) { return _data.sites.find(x => x.id === id); }

// Notification helpers
function addNotification(notif) {
  const n = { id: genId(), read: false, createdAt: Date.now(), ...notif };
  _data.notifications.unshift(n);
  saveData(_data);
  return n;
}
function markNotificationRead(id) {
  const n = _data.notifications.find(x => x.id === id);
  if (n) { n.read = true; saveData(_data); }
}
function markAllNotificationsRead() {
  _data.notifications.forEach(n => n.read = true);
  saveData(_data);
}
function getUnreadCount() { return _data.notifications.filter(n => !n.read).length; }

// Generate expiry notifications
function checkAndGenerateNotifications() {
  const days = _data.settings.notifyDaysBefore || 30;
  const expiring = getExpiringCerts(days);
  const existingIds = new Set(_data.notifications.map(n => n.certId));

  expiring.forEach(cert => {
    if (existingIds.has(cert.id)) return;
    const staff = getStaff(cert.staffId);
    if (!staff) return;
    const days = daysUntilExpiry(cert);
    addNotification({
      type: 'expiry_warning',
      certId: cert.id,
      staffId: cert.staffId,
      title: `Certificate Expiring: ${cert.type}`,
      message: `${staff.firstName} ${staff.lastName}'s ${cert.type} expires in ${days} days`,
      severity: days <= 7 ? 'danger' : days <= 14 ? 'warning' : 'info'
    });
  });

  return expiring.length;
}

// Time Keeper import
function importTimeKeeperData(records) {
  // records: [{ staffId, firstName, lastName, siteName, date }]
  let imported = 0;
  const sites = new Set();

  records.forEach(rec => {
    sites.add(rec.siteName);
    let staff = _data.staff.find(s => s.timekeeperId === rec.staffId);

    if (!staff) {
      staff = addStaff({
        firstName: rec.firstName,
        lastName: rec.lastName,
        timekeeperId: rec.staffId,
        trades: rec.trades || [],
        sites: [],
        phone: rec.phone || '',
        email: rec.email || '',
        startDate: rec.startDate || ''
      });
    }

    // Ensure site exists
    let site = _data.sites.find(s => s.name === rec.siteName);
    if (!site) {
      site = addSite({ name: rec.siteName, address: '', postcode: '', status: 'active', manager: '' });
    }

    // Assign staff to site
    if (!staff.sites.includes(site.id)) {
      staff.sites.push(site.id);
    }

    staff.lastSeen = rec.date || new Date().toISOString();
    imported++;
  });

  setData({ settings: { ..._data.settings, lastTimeKeeperImport: new Date().toISOString() } });
  return { imported, sites: [...sites] };
}

// Export
function exportAllData() {
  const blob = new Blob([JSON.stringify(_data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hs-platform-export-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Seed demo data
function seedDemoData() {
  if (_data.staff.length > 0) return;

  const site1 = addSite({ name: 'Riverside Towers', address: '45 River Rd', postcode: 'SW1A 1AA', status: 'active', manager: 'John Smith' });
  const site2 = addSite({ name: 'Green Park Office', address: '12 Park Lane', postcode: 'W1K 1BE', status: 'active', manager: 'Sarah Jones' });
  const site3 = addSite({ name: 'Westfield Mall Extension', address: 'Ariel Way', postcode: 'W12 7GF', status: 'planning', manager: 'Mike Brown' });

  const staffMembers = [
    { firstName: 'James', lastName: 'Wilson', trades: ['Bricklayer', 'Labourer'], phone: '07700 123456', email: 'j.wilson@company.com' },
    { firstName: 'David', lastName: 'Thompson', trades: ['Electrician'], phone: '07700 234567', email: 'd.thompson@company.com' },
    { firstName: 'Mark', lastName: 'Davies', trades: ['Carpenter', 'Roofing'], phone: '07700 345678', email: 'm.davies@company.com' },
    { firstName: 'Paul', lastName: 'Roberts', trades: ['Plumber', 'Gas'], phone: '07700 456789', email: 'p.roberts@company.com' },
    { firstName: 'Andrew', lastName: 'Clarke', trades: ['Steel Fixer', 'Scaffolder'], phone: '07700 567890', email: 'a.clarke@company.com' },
    { firstName: 'Tom', lastName: 'Evans', trades: ['Plant Operator', 'Driver'], phone: '07700 678901', email: 't.evans@company.com' },
    { firstName: 'Simon', lastName: 'Baker', trades: ['Labourer', 'Traffic Marshal'], phone: '07700 789012', email: 's.baker@company.com' },
    { firstName: 'Chris', lastName: 'Murphy', trades: ['Plasterer', 'Painter'], phone: '07700 890123', email: 'c.murphy@company.com' },
  ];

  const createdStaff = staffMembers.map(s => {
    const staff = addStaff(s);
    // Assign to random 1-2 sites
    staff.sites = [site1.id];
    if (Math.random() > 0.4) staff.sites.push(site2.id);
    if (Math.random() > 0.8) staff.sites.push(site3.id);
    return staff;
  });

  // Create certs with various expiry dates
  const now = Date.now();
  const DAY = 86400000;

  const certData = [
    { staffIdx: 0, type: 'CSCS Card', issue: -300, expiry: 10 },
    { staffIdx: 0, type: 'First Aid at Work', issue: -200, expiry: -5 },
    { staffIdx: 1, type: 'CSCS Blue', issue: -400, expiry: 45 },
    { staffIdx: 1, type: 'SMSTS', issue: -350, expiry: 200 },
    { staffIdx: 1, type: 'Abrasive Wheels', issue: -100, expiry: 8 },
    { staffIdx: 2, type: 'CSCS Gold', issue: -250, expiry: 60 },
    { staffIdx: 2, type: 'Working at Height', issue: -150, expiry: -10 },
    { staffIdx: 3, type: 'CSCS Blue', issue: -200, expiry: 25 },
    { staffIdx: 3, type: 'Confined Spaces', issue: -180, expiry: 3 },
    { staffIdx: 4, type: 'CSCS Card', issue: -500, expiry: 90 },
    { staffIdx: 4, type: 'Slinger/Signaller', issue: -300, expiry: 15 },
    { staffIdx: 5, type: 'CSCS Card', issue: -150, expiry: 350 },
    { staffIdx: 5, type: 'IPAF', issue: -100, expiry: -20 },
    { staffIdx: 5, type: 'Telehandler', issue: -90, expiry: 50 },
    { staffIdx: 6, type: 'CSCS Red', issue: -60, expiry: 300 },
    { staffIdx: 6, type: 'Traffic Marshal', issue: -50, expiry: 12 },
    { staffIdx: 7, type: 'CSCS Card', issue: -280, expiry: 85 },
    { staffIdx: 7, type: 'Asbestos Awareness', issue: -30, expiry: -15 },
    { staffIdx: 7, type: 'Manual Handling', issue: -180, expiry: 40 },
  ];

  certData.forEach(c => {
    const staff = createdStaff[c.staffIdx];
    addCertificate({
      staffId: staff.id,
      type: c.type,
      number: 'CERT-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      issueDate: new Date(now + c.issue * DAY).toISOString().slice(0, 10),
      expiryDate: new Date(now + c.expiry * DAY).toISOString().slice(0, 10),
      images: [],
      notes: ''
    });
  });

  // Generate initial notifications
  checkAndGenerateNotifications();
}

export {
  TRADES, CERT_TYPES,
  getData, setData, genId,
  addStaff, updateStaff, deleteStaff, getStaff, getStaffBySite,
  addCertificate, updateCertificate, deleteCertificate, getCertsForStaff, getCertificate,
  getExpiringCerts, getExpiredCerts, getValidCerts, certStatus, daysUntilExpiry,
  addSite, updateSite, deleteSite, getSite,
  addNotification, markNotificationRead, markAllNotificationsRead, getUnreadCount,
  checkAndGenerateNotifications,
  importTimeKeeperData, exportAllData, seedDemoData
};
