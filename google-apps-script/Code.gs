/**
 * Google Apps Script collector for the Dealer LMS Feedback Survey.
 *
 * Setup:
 *  1. Create a Google Sheet → Extensions → Apps Script, paste this file.
 *  2. Deploy → New deployment → Web app
 *       Execute as: Me   ·   Who has access: Anyone
 *  3. Copy the /exec URL into SUBMIT_URL in config.js.
 *
 * Each response becomes one row in the "Responses" tab. Headers are created
 * from the payload keys on first submit, and new keys are appended as columns.
 */
var SHEET_NAME = "Responses";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // Accept both form-encoded fields (SUBMIT_FORMAT "form") and a JSON body ("json").
    var data = e.postData && e.postData.type === "application/x-www-form-urlencoded"
      ? e.parameter
      : JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    var headers = sheet.getLastColumn()
      ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      : [];
    Object.keys(data).forEach(function (k) {
      if (headers.indexOf(k) === -1) headers.push(k);
    });
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);

    var row = headers.map(function (h) { return data[h] !== undefined ? data[h] : ""; });
    sheet.appendRow(row);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, service: "dealer-lms-survey" });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
