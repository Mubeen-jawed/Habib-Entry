/**
 * Habib mock interview signup webhook.
 *
 * Setup:
 *   1. Open https://script.google.com and create a new project.
 *   2. Paste this file into Code.gs.
 *   3. Project Settings → check "Show 'appsscript.json' manifest file in editor",
 *      then open appsscript.json and set its oauthScopes so DriveApp gets the
 *      full drive scope (not the default drive.file, which can't read folders
 *      the script didn't itself create):
 *        "oauthScopes": [
 *          "https://www.googleapis.com/auth/spreadsheets",
 *          "https://www.googleapis.com/auth/drive",
 *          "https://www.googleapis.com/auth/script.external_request"
 *        ]
 *      Without this you'll see: "Unexpected error while getting the method or
 *      property getFolderById on object DriveApp".
 *   4. Replace SHEET_ID and DRIVE_FOLDER_ID below.
 *      - SHEET_ID is in the Sheet URL: docs.google.com/spreadsheets/d/<SHEET_ID>/edit
 *      - DRIVE_FOLDER_ID is in the Drive folder URL: drive.google.com/drive/folders/<FOLDER_ID>
 *   5. Toolbar → run doPost once (it will error on the missing event object,
 *      but this triggers the authorization prompt for the scopes above).
 *   6. Deploy > New deployment > Type: Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   7. Copy the /exec URL and set it as INTERVIEW_WEBHOOK_URL in .env.local.
 */

const SHEET_ID = 'REPLACE_WITH_SPREADSHEET_ID';
const SHEET_NAME = 'Interview signups';
const DRIVE_FOLDER_ID = 'REPLACE_WITH_DRIVE_FOLDER_ID';

const HEADERS = [
  'Submitted at',
  'Name',
  'WhatsApp',
  'Field',
  'Application ID',
  'Gender',
  'Test month',
  'Applying for',
  'Applying for (other)',
  'Test date status',
  'Test date (other)',
  'Interview date status',
  'Interview date',
  'Interview time',
  'Desired date',
  'Preparation',
  'Help areas',
  'Help areas (other)',
  'Questions',
  'Agreed',
  'Admit card',
  'Extracurriculars',
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const fields = payload.fields || {};
    const files = payload.files || {};

    const admitUrl = saveFile(files.admitCard, 'admit-card');
    const ecaUrl = saveFile(files.eca, 'eca');

    const helpAreas = Array.isArray(fields.helpAreas)
      ? fields.helpAreas.join(', ')
      : (fields.helpAreas || '');

    const row = [
      payload.submittedAt || new Date().toISOString(),
      fields.name || '',
      fields.whatsapp || '',
      fields.field || '',
      fields.applicationId || '',
      fields.gender || '',
      fields.testMonth || '',
      fields.applyingFor || '',
      fields.applyingForOther || '',
      fields.testDateStatus || '',
      fields.testDateOther || '',
      fields.interviewDateStatus || '',
      fields.interviewDate || '',
      fields.interviewTime || '',
      fields.desiredDate || '',
      fields.preparation || '',
      helpAreas,
      fields.helpOther || '',
      fields.questions || '',
      fields.agree || '',
      admitUrl,
      ecaUrl,
    ];

    getOrCreateSheet().appendRow(row);

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err && err.message || err) });
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveFile(file, prefix) {
  if (!file || !file.data) return '';
  const bytes = Utilities.base64Decode(file.data);
  const name = `${prefix}-${Date.now()}-${(file.name || 'upload').replace(/[^\w.\-]/g, '_')}`;
  const blob = Utilities.newBlob(bytes, file.type || 'application/octet-stream', name);
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const saved = folder.createFile(blob);
  // Best-effort public link. Workspace policies often block ANYONE_WITH_LINK;
  // if so, keep the file (already saved above) and return its normal URL —
  // anyone with access to the parent folder can still open it.
  try {
    saved.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (shareErr) {
    // ignore: sharing policy restricted, file is still saved
  }
  return saved.getUrl();
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
