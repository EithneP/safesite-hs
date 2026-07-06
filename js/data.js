/* ========================================
   SafeSite — Data Store & Sample Data
   ======================================== */

// Helper: generate a date N days from now
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// Helper: generate a date N days ago
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ---------- Sites ----------
export const sites = [
  { id: 'S001', name: 'Riverside Tower', address: '42 Thames Bank Rd, London SE1', status: 'active', manager: 'Tom Hughes', startDate: '2024-03-01', estCompletion: '2025-12-31', staffCount: 42 },
  { id: 'S002', name: 'Oakfield Business Park', address: '15 Oakfield Lane, Croydon CR0', status: 'active', manager: 'Sarah Chen', startDate: '2024-06-15', estCompletion: '2025-09-30', staffCount: 28 },
  { id: 'S003', name: 'Greenwich Residences', address: '8 Creek Rd, Greenwich SE8', status: 'active', manager: 'Dave Morrison', startDate: '2024-01-10', estCompletion: '2025-08-15', staffCount: 35 },
  { id: 'S004', name: 'Heathrow Cargo Terminal', address: 'Northern Perimeter Rd, Heathrow TW6', status: 'active', manager: 'Linda Patel', startDate: '2024-09-01', estCompletion: '2026-03-31', staffCount: 22 },
  { id: 'S005', name: 'Canary Wharf Fit-Out', address: '25 Canada Square, London E14', status: 'active', manager: 'Mark Wilson', startDate: '2025-01-05', estCompletion: '2025-07-30', staffCount: 15 },
  { id: 'S006', name: 'Wembley Storage Depot', address: 'Unit 7, North End Rd, Wembley HA9', status: 'paused', manager: 'Rachel Kim', startDate: '2024-04-20', estCompletion: '2025-06-30', staffCount: 5 },
];

// ---------- Trades ----------
export const tradeList = [
  'Bricklayer', 'Electrician', 'Plumber', 'Carpenter', 'Scaffolder',
  'Steel Fixer', 'Crane Operator', 'Groundworker', 'Painter', 'Roofer',
  'Welder', 'Plant Operator', 'Labourer', 'Joiner', 'Plasterer',
  'Tiler', 'Glazier', 'Safety Officer', 'Surveyor', 'Foreman'
];

// ---------- Certification Types ----------
export const certTypes = [
  { id: 'CSCS', name: 'CSCS Card', validityMonths: 60, mandatory: true },
  { id: 'SMSTS', name: 'SMSTS', validityMonths: 60, mandatory: false },
  { id: 'SSSTS', name: 'SSSTS', validityMonths: 60, mandatory: false },
  { id: 'IPAF', name: 'IPAF Operator', validityMonths: 60, mandatory: false },
  { id: 'PASMA', name: 'PASMA Towers', validityMonths: 60, mandatory: false },
  { id: 'Asbestos', name: 'Asbestos Awareness', validityMonths: 12, mandatory: true },
  { id: 'FirstAid', name: 'First Aid at Work', validityMonths: 36, mandatory: true },
  { id: 'FireMarshal', name: 'Fire Marshal', validityMonths: 12, mandatory: false },
  { id: 'WorkingAtHeight', name: 'Working at Height', validityMonths: 24, mandatory: true },
  { id: 'ManualHandling', name: 'Manual Handling', validityMonths: 24, mandatory: false },
  { id: 'ElectricalCert', name: '18th Edition Wiring', validityMonths: 120, mandatory: false },
  { id: 'GasSafe', name: 'Gas Safe Register', validityMonths: 12, mandatory: false },
  { id: 'CraneCert', name: 'Crane Operator Licence', validityMonths: 60, mandatory: true },
  { id: 'ConfinedSpace', name: 'Confined Space Entry', validityMonths: 24, mandatory: false },
  { id: 'AbrasiveWheel', name: 'Abrasive Wheels', validityMonths: 36, mandatory: false },
];

// ---------- Employees ----------
export const employees = [
  { id: 'EMP001', firstName: 'John', lastName: 'Smith', phone: '07700 900001', email: 'j.smith@buildco.co.uk', trades: ['Electrician'], site: 'S001', status: 'active', startDate: '2022-03-15' },
  { id: 'EMP002', firstName: 'Sarah', lastName: 'Johnson', phone: '07700 900002', email: 's.johnson@buildco.co.uk', trades: ['Plumber', 'Gas Safe'], site: 'S001', status: 'active', startDate: '2021-09-01' },
  { id: 'EMP003', firstName: 'Mike', lastName: 'Williams', phone: '07700 900003', email: 'm.williams@buildco.co.uk', trades: ['Bricklayer', 'Labourer'], site: 'S003', status: 'active', startDate: '2023-01-10' },
  { id: 'EMP004', firstName: 'Emma', lastName: 'Brown', phone: '07700 900004', email: 'e.brown@buildco.co.uk', trades: ['Safety Officer', 'First Aid'], site: 'S002', status: 'active', startDate: '2020-06-22' },
  { id: 'EMP005', firstName: 'David', lastName: 'Jones', phone: '07700 900005', email: 'd.jones@buildco.co.uk', trades: ['Carpenter', 'Joiner'], site: 'S001', status: 'active', startDate: '2022-07-18' },
  { id: 'EMP006', firstName: 'Lisa', lastName: 'Taylor', phone: '07700 900006', email: 'l.taylor@buildco.co.uk', trades: ['Painter', 'Plasterer'], site: 'S003', status: 'active', startDate: '2023-04-05' },
  { id: 'EMP007', firstName: 'James', lastName: 'Davies', phone: '07700 900007', email: 'j.davies@buildco.co.uk', trades: ['Scaffolder', 'Steel Fixer'], site: 'S004', status: 'active', startDate: '2021-11-30' },
  { id: 'EMP008', firstName: 'Rachel', lastName: 'Wilson', phone: '07700 900008', email: 'r.wilson@buildco.co.uk', trades: ['Surveyor'], site: 'S005', status: 'active', startDate: '2024-01-15' },
  { id: 'EMP009', firstName: 'Tom', lastName: 'Anderson', phone: '07700 900009', email: 't.anderson@buildco.co.uk', trades: ['Crane Operator', 'Plant Operator'], site: 'S001', status: 'active', startDate: '2020-02-14' },
  { id: 'EMP010', firstName: 'Helen', lastName: 'Thomas', phone: '07700 900010', email: 'h.thomas@buildco.co.uk', trades: ['Groundworker'], site: 'S002', status: 'active', startDate: '2023-08-20' },
  { id: 'EMP011', firstName: 'Peter', lastName: 'Jackson', phone: '07700 900011', email: 'p.jackson@buildco.co.uk', trades: ['Roofer', 'Labourer'], site: 'S003', status: 'active', startDate: '2022-05-12' },
  { id: 'EMP012', firstName: 'Sophie', lastName: 'White', phone: '07700 900012', email: 's.white@buildco.co.uk', trades: ['Electrician', 'Fire Marshal'], site: 'S004', status: 'active', startDate: '2023-02-28' },
  { id: 'EMP013', firstName: 'Mark', lastName: 'Harris', phone: '07700 900013', email: 'm.harris@buildco.co.uk', trades: ['Welder', 'Steel Fixer'], site: 'S001', status: 'active', startDate: '2021-07-09' },
  { id: 'EMP014', firstName: 'Claire', lastName: 'Martin', phone: '07700 900014', email: 'c.martin@buildco.co.uk', trades: ['Tiler', 'Plumber'], site: 'S002', status: 'active', startDate: '2024-03-01' },
  { id: 'EMP015', firstName: 'Andrew', lastName: 'Thompson', phone: '07700 900015', email: 'a.thompson@buildco.co.uk', trades: ['Glazier', 'Labourer'], site: 'S005', status: 'active', startDate: '2023-10-15' },
  { id: 'EMP016', firstName: 'Karen', lastName: 'Moore', phone: '07700 900016', email: 'k.moore@buildco.co.uk', trades: ['Bricklayer'], site: 'S003', status: 'inactive', startDate: '2019-04-01' },
  { id: 'EMP017', firstName: 'Steve', lastName: 'Clark', phone: '07700 900017', email: 's.clark@buildco.co.uk', trades: ['Plant Operator', 'Crane Operator'], site: 'S001', status: 'active', startDate: '2022-01-20' },
  { id: 'EMP018', firstName: 'Nicola', lastName: 'Robinson', phone: '07700 900018', email: 'n.robinson@buildco.co.uk', trades: ['Foreman', 'Carpenter'], site: 'S004', status: 'active', startDate: '2020-09-12' },
  { id: 'EMP019', firstName: 'Dan', lastName: 'Lewis', phone: '07700 900019', email: 'd.lewis@buildco.co.uk', trades: ['Scaffolder'], site: 'S002', status: 'active', startDate: '2023-06-05' },
  { id: 'EMP020', firstName: 'Laura', lastName: 'Walker', phone: '07700 900020', email: 'l.walker@buildco.co.uk', trades: ['Plasterer', 'Painter'], site: 'S003', status: 'active', startDate: '2024-02-10' },
];

// ---------- Certifications ----------
export const certifications = [
  // EMP001
  { employeeId: 'EMP001', certId: 'CSCS', issued: daysAgo(550), expires: daysFromNow(15), images: [] },
  { employeeId: 'EMP001', certId: 'ElectricalCert', issued: daysAgo(300), expires: daysFromNow(200), images: [] },
  { employeeId: 'EMP001', certId: 'WorkingAtHeight', issued: daysAgo(600), expires: daysFromNow(-10), images: [] },
  { employeeId: 'EMP001', certId: 'Asbestos', issued: daysAgo(350), expires: daysFromNow(15), images: [] },
  { employeeId: 'EMP001', certId: 'ManualHandling', issued: daysAgo(200), expires: daysFromNow(550), images: [] },
  // EMP002
  { employeeId: 'EMP002', certId: 'CSCS', issued: daysAgo(1000), expires: daysFromNow(500), images: [] },
  { employeeId: 'EMP002', certId: 'GasSafe', issued: daysAgo(380), expires: daysFromNow(-5), images: [] },
  { employeeId: 'EMP002', certId: 'FirstAid', issued: daysAgo(900), expires: daysFromNow(50), images: [] },
  { employeeId: 'EMP002', certId: 'Asbestos', issued: daysAgo(400), expires: daysFromNow(-30), images: [] },
  // EMP003
  { employeeId: 'EMP003', certId: 'CSCS', issued: daysAgo(200), expires: daysFromNow(1600), images: [] },
  { employeeId: 'EMP003', certId: 'ManualHandling', issued: daysAgo(100), expires: daysFromNow(640), images: [] },
  { employeeId: 'EMP003', certId: 'WorkingAtHeight', issued: daysAgo(500), expires: daysFromNow(20), images: [] },
  // EMP004
  { employeeId: 'EMP004', certId: 'CSCS', issued: daysAgo(100), expires: daysFromNow(1700), images: [] },
  { employeeId: 'EMP004', certId: 'SMSTS', issued: daysAgo(200), expires: daysFromNow(1600), images: [] },
  { employeeId: 'EMP004', certId: 'FirstAid', issued: daysAgo(1000), expires: daysFromNow(80), images: [] },
  { employeeId: 'EMP004', certId: 'Asbestos', issued: daysAgo(350), expires: daysFromNow(15), images: [] },
  { employeeId: 'EMP004', certId: 'FireMarshal', issued: daysAgo(400), expires: daysFromNow(-40), images: [] },
  // EMP005
  { employeeId: 'EMP005', certId: 'CSCS', issued: daysAgo(300), expires: daysFromNow(1500), images: [] },
  { employeeId: 'EMP005', certId: 'WorkingAtHeight', issued: daysAgo(700), expires: daysFromNow(25), images: [] },
  { employeeId: 'EMP005', certId: 'ManualHandling', issued: daysAgo(150), expires: daysFromNow(590), images: [] },
  // EMP006
  { employeeId: 'EMP006', certId: 'CSCS', issued: daysAgo(400), expires: daysFromNow(1400), images: [] },
  { employeeId: 'EMP006', certId: 'AbrasiveWheel', issued: daysAgo(200), expires: daysFromNow(550), images: [] },
  { employeeId: 'EMP006', certId: 'Asbestos', issued: daysAgo(350), expires: daysFromNow(10), images: [] },
  // EMP007
  { employeeId: 'EMP007', certId: 'CSCS', issued: daysAgo(150), expires: daysFromNow(1650), images: [] },
  { employeeId: 'EMP007', certId: 'WorkingAtHeight', issued: daysAgo(100), expires: daysFromNow(640), images: [] },
  { employeeId: 'EMP007', certId: 'PASMA', issued: daysAgo(500), expires: daysFromNow(10), images: [] },
  { employeeId: 'EMP007', certId: 'FirstAid', issued: daysAgo(600), expires: daysFromNow(480), images: [] },
  // EMP008
  { employeeId: 'EMP008', certId: 'CSCS', issued: daysAgo(100), expires: daysFromNow(1700), images: [] },
  { employeeId: 'EMP008', certId: 'SMSTS', issued: daysAgo(300), expires: daysFromNow(1500), images: [] },
  // EMP009
  { employeeId: 'EMP009', certId: 'CSCS', issued: daysAgo(500), expires: daysFromNow(1300), images: [] },
  { employeeId: 'EMP009', certId: 'CraneCert', issued: daysAgo(600), expires: daysFromNow(15), images: [] },
  { employeeId: 'EMP009', certId: 'IPAF', issued: daysAgo(400), expires: daysFromNow(20), images: [] },
  { employeeId: 'EMP009', certId: 'WorkingAtHeight', issued: daysAgo(200), expires: daysFromNow(540), images: [] },
  { employeeId: 'EMP009', certId: 'ConfinedSpace', issued: daysAgo(300), expires: daysFromNow(440), images: [] },
  // EMP010
  { employeeId: 'EMP010', certId: 'CSCS', issued: daysAgo(200), expires: daysFromNow(1600), images: [] },
  { employeeId: 'EMP010', certId: 'ManualHandling', issued: daysAgo(100), expires: daysFromNow(640), images: [] },
  { employeeId: 'EMP010', certId: 'Asbestos', issued: daysAgo(350), expires: daysFromNow(12), images: [] },
  // EMP011
  { employeeId: 'EMP011', certId: 'CSCS', issued: daysAgo(400), expires: daysFromNow(1400), images: [] },
  { employeeId: 'EMP011', certId: 'WorkingAtHeight', issued: daysAgo(700), expires: daysFromNow(-20), images: [] },
  { employeeId: 'EMP011', certId: 'IPAF', issued: daysAgo(400), expires: daysFromNow(25), images: [] },
  // EMP012
  { employeeId: 'EMP012', certId: 'CSCS', issued: daysAgo(300), expires: daysFromNow(1500), images: [] },
  { employeeId: 'EMP012', certId: 'ElectricalCert', issued: daysAgo(100), expires: daysFromNow(1100), images: [] },
  { employeeId: 'EMP012', certId: 'FireMarshal', issued: daysAgo(300), expires: daysFromNow(60), images: [] },
  { employeeId: 'EMP012', certId: 'WorkingAtHeight', issued: daysAgo(200), expires: daysFromNow(540), images: [] },
  // EMP013
  { employeeId: 'EMP013', certId: 'CSCS', issued: daysAgo(500), expires: daysFromNow(1300), images: [] },
  { employeeId: 'EMP013', certId: 'ConfinedSpace', issued: daysAgo(300), expires: daysFromNow(440), images: [] },
  { employeeId: 'EMP013', certId: 'AbrasiveWheel', issued: daysAgo(200), expires: daysFromNow(550), images: [] },
  // EMP014
  { employeeId: 'EMP014', certId: 'CSCS', issued: daysAgo(50), expires: daysFromNow(1750), images: [] },
  { employeeId: 'EMP014', certId: 'ManualHandling', issued: daysAgo(30), expires: daysFromNow(710), images: [] },
  { employeeId: 'EMP014', certId: 'Asbestos', issued: daysAgo(350), expires: daysFromNow(8), images: [] },
  // EMP015
  { employeeId: 'EMP015', certId: 'CSCS', issued: daysAgo(200), expires: daysFromNow(1600), images: [] },
  { employeeId: 'EMP015', certId: 'WorkingAtHeight', issued: daysAgo(100), expires: daysFromNow(640), images: [] },
  // EMP017
  { employeeId: 'EMP017', certId: 'CSCS', issued: daysAgo(300), expires: daysFromNow(1500), images: [] },
  { employeeId: 'EMP017', certId: 'CraneCert', issued: daysAgo(200), expires: daysFromNow(1600), images: [] },
  { employeeId: 'EMP017', certId: 'IPAF', issued: daysAgo(400), expires: daysFromNow(18), images: [] },
  // EMP018
  { employeeId: 'EMP018', certId: 'CSCS', issued: daysAgo(150), expires: daysFromNow(1650), images: [] },
  { employeeId: 'EMP018', certId: 'SMSTS', issued: daysAgo(200), expires: daysFromNow(1600), images: [] },
  { employeeId: 'EMP018', certId: 'FirstAid', issued: daysAgo(500), expires: daysFromNow(560), images: [] },
  { employeeId: 'EMP018', certId: 'WorkingAtHeight', issued: daysAgo(300), expires: daysFromNow(440), images: [] },
  // EMP019
  { employeeId: 'EMP019', certId: 'CSCS', issued: daysAgo(100), expires: daysFromNow(1700), images: [] },
  { employeeId: 'EMP019', certId: 'PASMA', issued: daysAgo(50), expires: daysFromNow(1750), images: [] },
  { employeeId: 'EMP019', certId: 'WorkingAtHeight', issued: daysAgo(100), expires: daysFromNow(640), images: [] },
  // EMP020
  { employeeId: 'EMP020', certId: 'CSCS', issued: daysAgo(30), expires: daysFromNow(1770), images: [] },
  { employeeId: 'EMP020', certId: 'ManualHandling', issued: daysAgo(30), expires: daysFromNow(710), images: [] },
];

// ---------- Timekeeper Records ----------
export const timekeeperRecords = [
  { employeeId: 'EMP001', name: 'John Smith', site: 'S001', clockIn: '07:28', clockOut: '17:05', date: daysAgo(0) },
  { employeeId: 'EMP002', name: 'Sarah Johnson', site: 'S001', clockIn: '07:35', clockOut: '17:10', date: daysAgo(0) },
  { employeeId: 'EMP003', name: 'Mike Williams', site: 'S003', clockIn: '07:42', clockOut: '16:55', date: daysAgo(0) },
  { employeeId: 'EMP004', name: 'Emma Brown', site: 'S002', clockIn: '08:00', clockOut: '17:00', date: daysAgo(0) },
  { employeeId: 'EMP005', name: 'David Jones', site: 'S001', clockIn: '07:22', clockOut: '17:15', date: daysAgo(0) },
  { employeeId: 'EMP006', name: 'Lisa Taylor', site: 'S003', clockIn: '07:50', clockOut: '16:30', date: daysAgo(0) },
  { employeeId: 'EMP007', name: 'James Davies', site: 'S004', clockIn: '07:30', clockOut: '17:20', date: daysAgo(0) },
  { employeeId: 'EMP009', name: 'Tom Anderson', site: 'S001', clockIn: '06:55', clockOut: '17:45', date: daysAgo(0) },
  { employeeId: 'EMP010', name: 'Helen Thomas', site: 'S002', clockIn: '07:38', clockOut: '16:40', date: daysAgo(0) },
  { employeeId: 'EMP011', name: 'Peter Jackson', site: 'S003', clockIn: '07:15', clockOut: '17:00', date: daysAgo(0) },
  { employeeId: 'EMP013', name: 'Mark Harris', site: 'S001', clockIn: '07:30', clockOut: '17:30', date: daysAgo(0) },
  { employeeId: 'EMP014', name: 'Claire Martin', site: 'S002', clockIn: '08:05', clockOut: '16:50', date: daysAgo(0) },
  { employeeId: 'EMP015', name: 'Andrew Thompson', site: 'S005', clockIn: '07:45', clockOut: '16:55', date: daysAgo(0) },
  { employeeId: 'EMP017', name: 'Steve Clark', site: 'S001', clockIn: '07:00', clockOut: '17:30', date: daysAgo(0) },
  { employeeId: 'EMP018', name: 'Nicola Robinson', site: 'S004', clockIn: '07:30', clockOut: '17:00', date: daysAgo(0) },
  { employeeId: 'EMP019', name: 'Dan Lewis', site: 'S002', clockIn: '07:40', clockOut: '16:45', date: daysAgo(0) },
  { employeeId: 'EMP020', name: 'Laura Walker', site: 'S003', clockIn: '07:55', clockOut: '16:35', date: daysAgo(0) },
  { employeeId: 'EMP001', name: 'John Smith', site: 'S001', clockIn: '07:30', clockOut: '17:00', date: daysAgo(1) },
  { employeeId: 'EMP002', name: 'Sarah Johnson', site: 'S001', clockIn: '07:40', clockOut: '17:05', date: daysAgo(1) },
  { employeeId: 'EMP003', name: 'Mike Williams', site: 'S003', clockIn: '07:45', clockOut: '16:50', date: daysAgo(1) },
  { employeeId: 'EMP005', name: 'David Jones', site: 'S001', clockIn: '07:25', clockOut: '17:10', date: daysAgo(1) },
  { employeeId: 'EMP008', name: 'Rachel Wilson', site: 'S005', clockIn: '08:00', clockOut: '17:00', date: daysAgo(1) },
  { employeeId: 'EMP009', name: 'Tom Anderson', site: 'S001', clockIn: '07:00', clockOut: '17:40', date: daysAgo(1) },
  { employeeId: 'EMP012', name: 'Sophie White', site: 'S004', clockIn: '07:35', clockOut: '17:15', date: daysAgo(1) },
];

// ---------- Activity Log ----------
export const activityLog = [
  { type: 'expiry', text: 'CSCS Card for John Smith expiring in 15 days', time: '2 hours ago', icon: 'clock', iconBg: 'notif-item__icon--warning' },
  { type: 'clockin', text: 'Tom Anderson clocked in at Riverside Tower', time: '3 hours ago', icon: 'log-in', iconBg: 'notif-item__icon--info' },
  { type: 'cert_added', text: 'Asbestos Awareness renewed for Claire Martin', time: '5 hours ago', icon: 'shield-check', iconBg: 'notif-item__icon--success' },
  { type: 'alert', text: 'Working at Height EXPIRED for Peter Jackson', time: '1 day ago', icon: 'alert-triangle', iconBg: 'notif-item__icon--danger' },
  { type: 'site', text: 'Staff count updated: Canary Wharf Fit-Out (15)', time: '1 day ago', icon: 'building-2', iconBg: 'notif-item__icon--info' },
  { type: 'expiry', text: 'Asbestos Awareness for Emma Brown expiring in 15 days', time: '2 days ago', icon: 'clock', iconBg: 'notif-item__icon--warning' },
  { type: 'email', text: 'Weekly expiry digest sent to office@buildco.co.uk', time: '3 days ago', icon: 'mail', iconBg: 'notif-item__icon--success' },
];

// ---------- Notification Log ----------
export const notificationLog = [
  { id: 'N001', type: 'warning', title: 'CSCS Card Expiring — John Smith', desc: 'CSCS Card expires in 15 days. Site: Riverside Tower.', date: 'Today, 09:15', sent: false, employees: ['EMP001'] },
  { id: 'N002', type: 'danger', title: 'Working at Height EXPIRED — Peter Jackson', desc: 'Working at Height certification has expired. Staff should not work at height until renewed. Site: Greenwich Residences.', date: 'Yesterday, 08:30', sent: false, employees: ['EMP011'] },
  { id: 'N003', type: 'warning', title: 'Multiple Certs Expiring — Riverside Tower', desc: '3 staff at Riverside Tower have certifications expiring within 30 days. Immediate review required.', date: 'Yesterday, 08:30', sent: false, employees: ['EMP001', 'EMP009'] },
  { id: 'N004', type: 'danger', title: 'Gas Safe EXPIRED — Sarah Johnson', desc: 'Gas Safe Register has expired. Employee must not carry out gas work. Site: Riverside Tower.', date: '5 days ago', sent: true, employees: ['EMP002'] },
  { id: 'N005', type: 'info', title: 'Weekly Digest Sent', desc: 'Weekly expiry notification email sent to safety@buildco.co.uk and office@buildco.co.uk.', date: '3 days ago', sent: true, employees: [] },
  { id: 'N006', type: 'warning', title: 'IPAF Expiring — Tom Anderson', desc: 'IPAF Operator cert expires in 20 days. Site: Riverside Tower.', date: '3 days ago', sent: true, employees: ['EMP009'] },
  { id: 'N007', type: 'danger', title: 'Fire Marshal EXPIRED — Emma Brown', desc: 'Fire Marshal certification expired. Site: Oakfield Business Park.', date: '1 week ago', sent: true, employees: ['EMP004'] },
];

// ---------- Utility Functions ----------
export function getEmployee(id) {
  return employees.find(e => e.id === id);
}

export function getSite(id) {
  return sites.find(s => s.id === id);
}

export function getCertType(certId) {
  return certTypes.find(c => c.id === certId);
}

export function getEmpCerts(empId) {
  return certifications.filter(c => c.employeeId === empId);
}

export function getSiteEmployees(siteId) {
  return employees.filter(e => e.site === siteId && e.status === 'active');
}

export function getCertStatus(cert) {
  const now = new Date();
  const exp = new Date(cert.expires);
  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { status: 'expired', label: 'Expired', daysLeft: diffDays };
  if (diffDays <= 30) return { status: 'expiring', label: `${diffDays} days`, daysLeft: diffDays };
  return { status: 'valid', label: 'Valid', daysLeft: diffDays };
}

export function getEarliestCertExpiry(empId) {
  const certs = getEmpCerts(empId);
  if (certs.length === 0) return null;
  let earliest = null;
  for (const cert of certs) {
    const s = getCertStatus(cert);
    if (s.status === 'expired') return { ...cert, ...s };
    if (!earliest || new Date(cert.expires) < new Date(earliest.expires)) {
      earliest = { ...cert, ...s };
    }
  }
  return earliest;
}

export function getExpiringCerts(days = 30) {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return certifications
    .filter(c => new Date(c.expires) <= cutoff && new Date(c.expires) >= now)
    .sort((a, b) => new Date(a.expires) - new Date(b.expires));
}

export function getExpiredCerts() {
  const now = new Date().toISOString().split('T')[0];
  return certifications.filter(c => c.expires < now);
}
