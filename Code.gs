const CFG_SHEET_NAME = 'Konfiguracja';
const LOG_SHEET_NAME = 'Rejestr';
const CACHE_TTL_SEC = 10 * 60; // 10 minut

function doGet(e) {
  let zone = '';
  if (e && e.parameter && e.parameter.strefa) {
    zone = e.parameter.strefa;
  }

  const template = HtmlService.createTemplateFromFile('Index');
  template.zoneParam = zone; 
  
  // TU JEST ZMIANA: Przekazujemy email do widoku
  template.userEmail = Session.getActiveUser().getEmail(); 
  
  return template.evaluate()
    .setTitle('Weryfikacja LOTO | Lounge by Zalando')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getLotoSteps(zoneFilter) {
  const zone = String(zoneFilter || '').trim();
  if (!zone) return [];

  const cache = CacheService.getScriptCache();
  const cacheKey = `lotoSteps:v3:${zone.toLowerCase()}`;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) { }
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CFG_SHEET_NAME);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  const zoneLower = zone.toLowerCase();
  const filteredSteps = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowZone = String(row[0] || '').trim();
    
    if (!rowZone || rowZone.toLowerCase() !== zoneLower) continue;
    
    const url = String(row[4] || '').trim();
    const fileId = url ? getIdFromUrl(url) : null;

    filteredSteps.push({
      id: row[1],
      name: row[2],
      desc: row[3],
      fileId: fileId,
      image: null,
      zone: rowZone
    });
  }

  cache.put(cacheKey, JSON.stringify(filteredSteps), CACHE_TTL_SEC);
  return filteredSteps;
}

function getStepImageBase64(fileId) {
  if (!fileId) return null;
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());
    return "data:" + blob.getContentType() + ";base64," + base64;
  } catch (e) {
    return null;
  }
}

function logStepAction(zone, stepName, status, comment) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000); 
  } catch (e) {
    throw new Error('Serwer zajęty. Spróbuj ponownie.');
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(LOG_SHEET_NAME);
    const userEmail = Session.getActiveUser().getEmail();
    const timestamp = new Date();
    
    sheet.appendRow([timestamp, userEmail, zone, stepName, status, comment]);
    return "OK";
  } finally {
    lock.releaseLock();
  }
}

function getIdFromUrl(url) {
  const match = String(url || '').match(/[-\w]{25,}/);
  return match ? match[0] : null;
}
// --- NOWE FUNKCJE DLA DASHBOARDU ---

function getDashboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Rejestr');
  const lastRow = sheet.getLastRow();
  
  // Domyślne dane, jeśli arkusz pusty
  if (lastRow < 2) {
    return { total: 0, rejected: 0, today: 0, issues: [] };
  }

  // Pobieramy dane: Data(0), Email(1), Strefa(2), Etap(3), Status(4), Uwagi(5)
  // Zakładamy, że dane są w kolumnach A:F
  const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  
  let stats = {
    total: data.length,
    rejected: 0,
    today: 0,
    issues: [] // Tu trafią szczegóły błędów
  };

  const todayStr = new Date().toDateString();

  // Przechodzimy przez wiersze od końca (najnowsze na górze)
  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    const timestamp = new Date(row[0]);
    const status = String(row[4]);
    
    // Liczymy dzisiejsze
    if (timestamp.toDateString() === todayStr) {
      stats.today++;
    }

    // Szukamy odrzuconych
    if (status === 'ODRZUCONO') {
      stats.rejected++;
      // Dodajemy do listy błędów (max 50 ostatnich)
      if (stats.issues.length < 50) {
        stats.issues.push({
          date: Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "dd.MM HH:mm"),
          email: row[1],
          zone: row[2],
          step: row[3],
          reason: row[5]
        });
      }
    }
  }
  
  return stats;
}