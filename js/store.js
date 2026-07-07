// ============ DATA STORE ============
var STORE_KEY = 'hs_platform';
var TRADES = ['Bricklayer','Carpenter','Electrician','Plumber','Plasterer','Steel Fixer','Scaffolder','Painter','Roofer','Groundworker','Crane Operator','Labourer','Site Manager','Foreman','Driver','Welder','Fitter','Plant Operator','Traffic Marshal','Banksmen'];
var CERT_TYPES = ['CSCS Card','CSCS Gold','CSCS White','CSCS Blue','CSCS Red','SMSTS','SSSTS','First Aid at Work','Fire Safety','Asbestos Awareness','Working at Height','Manual Handling','Harness Training','Abrasive Wheels','Confined Spaces','Toolbox Talk','IPAF','PASMA','Crane/PUVER','Lifting Operations','Slinger/Signaller','Telehandler','Mini Excavator','Dumper','Ride-On Roller','Chainsaw','Food Hygiene','Noise Awareness'];

function getDefaultData() {
  return { staff: [], sites: [], certificates: [], notifications: [], settings: { companyName: 'My Construction Co', emailNotifications: true, notifyDaysBefore: 30, emailRecipients: ['office@company.com'], lastTimeKeeperImport: null } };
}

function loadData() {
  try { var r = localStorage.getItem(STORE_KEY); if (r) return Object.assign(getDefaultData(), JSON.parse(r)); } catch(e) {}
  return getDefaultData();
}

function saveData(data) { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch(e) {} }
var _data = loadData();
function getData() { return _data; }
function setData(patch) { Object.assign(_data, patch); saveData(_data); }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

// Staff
function addStaff(staff) {
  var s = Object.assign({ id: genId(), trades: [], sites: [], certIds: [] }, staff, { createdAt: Date.now() });
  _data.staff.push(s); saveData(_data); return s;
}
function updateStaff(id, updates) {
  var s = _data.staff.find(function(x){return x.id===id});
  if (s) { Object.assign(s, updates); saveData(_data); }
  return s;
}
function deleteStaff(id) {
  _data.staff = _data.staff.filter(function(x){return x.id!==id});
  _data.certificates = _data.certificates.filter(function(c){return c.staffId!==id});
  saveData(_data);
}
function getStaff(id) { return _data.staff.find(function(x){return x.id===id}); }
function getStaffBySite(siteId) { return _data.staff.filter(function(s){return s.sites.includes(siteId)}); }

// Certificates
function addCertificate(cert) {
  var c = Object.assign({ id: genId(), images: [] }, cert, { createdAt: Date.now() });
  _data.certificates.push(c);
  if (c.staffId) { var s = _data.staff.find(function(x){return x.id===c.staffId}); if (s && !s.certIds.includes(c.id)) { s.certIds.push(c.id); } }
  saveData(_data); return c;
}
function updateCertificate(id, updates) {
  var c = _data.certificates.find(function(x){return x.id===id});
  if (c) { Object.assign(c, updates); saveData(_data); }
  return c;
}
function deleteCertificate(id) {
  var cert = _data.certificates.find(function(c){return c.id===id});
  if (cert && cert.staffId) { var s = _data.staff.find(function(x){return x.id===cert.staffId}); if (s) s.certIds = s.certIds.filter(function(cId){return cId!==id}); }
  _data.certificates = _data.certificates.filter(function(c){return c.id!==id});
  saveData(_data);
}
function getCertsForStaff(staffId) { return _data.certificates.filter(function(c){return c.staffId===staffId}); }
function getCertificate(id) { return _data.certificates.find(function(c){return c.id===id}); }

// Cert status
function certStatus(c) {
  if (!c.expiryDate) return 'unknown';
  var days = Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / 864e5);
  return days < 0 ? 'expired' : days <= 30 ? 'critical' : days <= 60 ? 'warning' : 'valid';
}
function daysUntilExpiry(c) {
  if (!c.expiryDate) return null;
  return Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / 864e5);
}
function getExpiringCerts(days) {
  var now = Date.now(), th = days * 864e5;
  return _data.certificates.filter(function(c){ if (!c.expiryDate) return false; var d = new Date(c.expiryDate).getTime()-now; return d<=th && d>-30*864e5; });
}
function getExpiredCerts() {
  var now = Date.now();
  return _data.certificates.filter(function(c){ return c.expiryDate && new Date(c.expiryDate).getTime()<now; });
}
function getValidCerts() {
  var now = Date.now();
  return _data.certificates.filter(function(c){ return c.expiryDate && new Date(c.expiryDate).getTime()>=now; });
}

// Sites
function addSite(site) {
  var s = Object.assign({ id: genId() }, site, { createdAt: Date.now() });
  _data.sites.push(s); saveData(_data); return s;
}
function updateSite(id, updates) {
  var s = _data.sites.find(function(x){return x.id===id});
  if (s) { Object.assign(s, updates); saveData(_data); }
  return s;
}
function deleteSite(id) {
  _data.sites = _data.sites.filter(function(x){return x.id!==id});
  _data.staff.forEach(function(s){ s.sites = s.sites.filter(function(sId){return sId!==id}); });
  saveData(_data);
}
function getSite(id) { return _data.sites.find(function(x){return x.id===id}); }

// Notifications
function addNotification(n) {
  var notif = Object.assign({ id: genId(), read: false, createdAt: Date.now() }, n);
  _data.notifications.unshift(notif); saveData(_data); return notif;
}
function markNotificationRead(id) {
  var n = _data.notifications.find(function(x){return x.id===id});
  if (n) { n.read = true; saveData(_data); }
}
function markAllNotificationsRead() { _data.notifications.forEach(function(n){n.read=true}); saveData(_data); }
function getUnreadCount() { return _data.notifications.filter(function(n){return !n.read}).length; }

function checkAndGenerateNotifications() {
  var days = _data.settings.notifyDaysBefore || 30;
  var expiring = getExpiringCerts(days);
  var existing = {};
  _data.notifications.forEach(function(n){ if(n.certId) existing[n.certId]=true; });
  expiring.forEach(function(cert) {
    if (existing[cert.id]) return;
    var s = getStaff(cert.staffId);
    if (!s) return;
    var d = daysUntilExpiry(cert);
    addNotification({ type:'expiry_warning', certId:cert.id, staffId:cert.staffId, title:'Certificate Expiring: '+cert.type, message:s.firstName+' '+s.lastName+"'s "+cert.type+" expires in "+d+" days", severity:d<=7?'danger':d<=14?'warning':'info' });
  });
}

// Time Keeper import
function importTimeKeeperData(records) {
  var imported = 0, sites = {};
  records.forEach(function(rec) {
    sites[rec.siteName] = true;
    var staff = _data.staff.find(function(s){return s.timekeeperId===rec.staffId});
    if (!staff) { staff = addStaff({ firstName:rec.firstName, lastName:rec.lastName, timekeeperId:rec.staffId, trades:[], sites:[], phone:'', email:'', startDate:'' }); }
    var site = _data.sites.find(function(s){return s.name===rec.siteName});
    if (!site) { site = addSite({ name:rec.siteName, address:'', postcode:'', status:'active', manager:'' }); }
    if (!staff.sites.includes(site.id)) { staff.sites.push(site.id); }
    imported++;
  });
  setData({ settings: Object.assign({}, _data.settings, { lastTimeKeeperImport: new Date().toISOString() }) });
  return { imported: imported, sites: Object.keys(sites) };
}

function exportAllData() {
  var b = new Blob([JSON.stringify(_data,null,2)], {type:'application/json'});
  var u = URL.createObjectURL(b);
  var a = document.createElement('a');
  a.href = u; a.download = 'hs-platform-export-'+new Date().toISOString().slice(0,10)+'.json';
  a.click(); URL.revokeObjectURL(u);
}

// Seed demo data
function seedDemoData() {
  if (_data.staff.length > 0) return;
  var s1=addSite({name:'Riverside Towers',address:'45 River Rd',postcode:'SW1A 1AA',status:'active',manager:'John Smith'});
  var s2=addSite({name:'Green Park Office',address:'12 Park Lane',postcode:'W1K 1BE',status:'active',manager:'Sarah Jones'});
  var s3=addSite({name:'Westfield Mall Extension',address:'Ariel Way',postcode:'W12 7GF',status:'planning',manager:'Mike Brown'});
  var staffData=[
    {firstName:'James',lastName:'Wilson',trades:['Bricklayer','Labourer'],phone:'07700 123456',email:'j.wilson@company.com'},
    {firstName:'David',lastName:'Thompson',trades:['Electrician'],phone:'07700 234567',email:'d.thompson@company.com'},
    {firstName:'Mark',lastName:'Davies',trades:['Carpenter','Roofer'],phone:'07700 345678',email:'m.davies@company.com'},
    {firstName:'Paul',lastName:'Roberts',trades:['Plumber'],phone:'07700 456789',email:'p.roberts@company.com'},
    {firstName:'Andrew',lastName:'Clarke',trades:['Steel Fixer','Scaffolder'],phone:'07700 567890',email:'a.clarke@company.com'},
    {firstName:'Tom',lastName:'Evans',trades:['Plant Operator','Driver'],phone:'07700 678901',email:'t.evans@company.com'},
    {firstName:'Simon',lastName:'Baker',trades:['Labourer','Traffic Marshal'],phone:'07700 789012',email:'s.baker@company.com'},
    {firstName:'Chris',lastName:'Murphy',trades:['Plasterer','Painter'],phone:'07700 890123',email:'c.murphy@company.com'}
  ];
  var created=staffData.map(function(s){
    var st=addStaff(s);
    st.sites=[s1.id]; if(Math.random()>.4)st.sites.push(s2.id); if(Math.random()>.8)st.sites.push(s3.id);
    return st;
  });
  var now=Date.now(),D=864e5;
  [{i:0,t:'CSCS Card',is:-300,e:10},{i:0,t:'First Aid at Work',is:-200,e:-5},{i:1,t:'CSCS Blue',is:-400,e:45},{i:1,t:'SMSTS',is:-350,e:200},{i:1,t:'Abrasive Wheels',is:-100,e:8},{i:2,t:'CSCS Gold',is:-250,e:60},{i:2,t:'Working at Height',is:-150,e:-10},{i:3,t:'CSCS Blue',is:-200,e:25},{i:3,t:'Confined Spaces',is:-180,e:3},{i:4,t:'CSCS Card',is:-500,e:90},{i:4,t:'Slinger/Signaller',is:-300,e:15},{i:5,t:'CSCS Card',is:-150,e:350},{i:5,t:'IPAF',is:-100,e:-20},{i:5,t:'Telehandler',is:-90,e:50},{i:6,t:'CSCS Red',is:-60,e:300},{i:6,t:'Traffic Marshal',is:-50,e:12},{i:7,t:'CSCS Card',is:-280,e:85},{i:7,t:'Asbestos Awareness',is:-30,e:-15},{i:7,t:'Manual Handling',is:-180,e:40}
  ].forEach(function(c){
    addCertificate({staffId:created[c.i].id,type:c.t,number:'CERT-'+Math.random().toString(36).slice(2,8).toUpperCase(),issueDate:new Date(now+c.is*D).toISOString().slice(0,10),expiryDate:new Date(now+c.e*D).toISOString().slice(0,10),images:[],notes:''});
  });
  checkAndGenerateNotifications();
}
