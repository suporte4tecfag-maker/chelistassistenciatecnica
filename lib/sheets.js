const { google } = require('googleapis');

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) {
    throw new Error('Configure GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_PRIVATE_KEY nas variaveis de ambiente.');
  }
  return new google.auth.JWT(email, null, key, [
    'https://www.googleapis.com/auth/spreadsheets',
  ]);
}

async function getSheetsClient() {
  const auth = getAuth();
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

function sheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error('Configure GOOGLE_SHEET_ID nas variaveis de ambiente.');
  return id;
}

// Aba "Usuarios": username | password_hash | nome | papel
async function getUserByUsername(username) {
  const sheets = await getSheetsClient();
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: 'Usuarios!A2:D',
  });
  const rows = resp.data.values || [];
  const row = rows.find((r) => (r[0] || '').toLowerCase() === String(username).toLowerCase());
  if (!row) return null;
  return {
    username: row[0],
    passwordHash: row[1],
    nome: row[2] || row[0],
    papel: row[3] || 'tecnico',
  };
}

// Aba "Relatorios": id | criado_em | tecnico | cliente | equipamento | status | pendencias | payload_json
async function appendReport(row) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId(),
    range: 'Relatorios!A:A',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

async function listReportRows() {
  const sheets = await getSheetsClient();
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: 'Relatorios!A2:H',
  });
  return resp.data.values || [];
}

module.exports = { getUserByUsername, appendReport, listReportRows };
