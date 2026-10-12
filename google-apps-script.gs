/**
 * cx contact / game recommendation receiver.
 * Create a Google Sheet, open Extensions > Apps Script, paste this file,
 * set SHEET_NAME if desired, then Deploy > New deployment > Web app.
 */
const SHEET_NAME = 'Submissions';

function doPost(e) {
  const p = (e && e.parameter) || {};
  const type = clean(p.type, 80);
  const name = clean(p.name, 80);
  const email = clean(p.email, 160);
  const gameTitle = clean(p.gameTitle, 120);
  const details = clean(p.details, 3000);
  const page = clean(p.page, 500);
  if (!type || !details) {
    return ContentService.createTextOutput('Missing required fields');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Received at', 'Type', 'Name', 'Email', 'Game title', 'Message / URL', 'Page']);
      sheet.setFrozenRows(1);
    }
    // Prefix user-controlled text with apostrophe to avoid spreadsheet formula injection.
    sheet.appendRow([new Date(), safeCell(type), safeCell(name), safeCell(email), safeCell(gameTitle), safeCell(details), safeCell(page)]);
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput('OK');
}

function clean(value, maxLength) {
  return String(value || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, maxLength);
}
function safeCell(value) {
  return /^[=+@\-]/.test(value) ? "'" + value : value;
}
