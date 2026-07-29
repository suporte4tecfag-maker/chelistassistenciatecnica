// Fala com o Google Apps Script publicado como Web App (veja apps-script/Code.gs).
// Nao precisa de conta de servico, chave, nem Google Cloud Console.

function scriptUrl() {
  var url = process.env.APPS_SCRIPT_URL;
  if (!url) throw new Error('Configure APPS_SCRIPT_URL nas variaveis de ambiente.');
  return url.trim();
}

function scriptSecret() {
  var secret = process.env.APPS_SCRIPT_SECRET;
  if (!secret) throw new Error('Configure APPS_SCRIPT_SECRET nas variaveis de ambiente.');
  return secret.trim();
}

async function callAppsScript(action, extra) {
  const resp = await fetch(scriptUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(Object.assign({ secret: scriptSecret(), action: action }, extra || {})),
  });
  const data = await resp.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// Aba "Usuarios": username | senha | nome | papel
async function getUserByUsername(username) {
  const data = await callAppsScript('getUser', { username });
  const row = data.user;
  if (!row) return null;
  return {
    username: row[0],
    senha: row[1],
    nome: row[2] || row[0],
    papel: row[3] || 'tecnico',
  };
}

// Aba "Relatorios": id | criado_em | tecnico | cliente | equipamento | status | pendencias | payload_json
async function appendReport(row) {
  await callAppsScript('appendReport', { row: row });
}

async function listReportRows() {
  const data = await callAppsScript('listReports', {});
  return data.reports || [];
}

module.exports = { getUserByUsername, appendReport, listReportRows };
