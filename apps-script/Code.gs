// ===================================================================
// Tecfag - Checklist de Visita Tecnica
// Cole este codigo inteiro em Extensoes > Apps Script (dentro da planilha)
// e siga o README para publicar como Web App.
// ===================================================================

// Troque por uma string aleatoria so sua. Use o MESMO valor na variavel
// de ambiente APPS_SCRIPT_SECRET no Vercel.
var SECRET = 'TROQUE-POR-UMA-STRING-BEM-ALEATORIA';

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return output({ error: 'Requisicao invalida.' });
  }

  if (String(body.secret || '').trim() !== SECRET.trim()) {
    return output({ error: 'Nao autorizado.' });
  }

  try {
    if (body.action === 'getUser') {
      return output({ user: getUser(body.username) });
    }
    if (body.action === 'listReports') {
      return output({ reports: listReports() });
    }
    if (body.action === 'appendReport') {
      appendReport(body.row);
      return output({ ok: true });
    }
    return output({ error: 'Acao desconhecida: ' + body.action });
  } catch (err) {
    return output({ error: String(err) });
  }
}

function output(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Aba "Usuarios": username | senha | nome | papel
function getUser(username) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === String(username).toLowerCase()) {
      return data[i];
    }
  }
  return null;
}

// Aba "Relatorios": id | criado_em | tecnico | cliente | equipamento | status | pendencias | payload_json
function listReports() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Relatorios');
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, 8).getValues();
}

function appendReport(row) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Relatorios');
  sheet.appendRow(row);
}
