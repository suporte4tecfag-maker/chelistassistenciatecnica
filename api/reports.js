const { verifyFromReq } = require('../lib/auth');
const { appendReport, listReportRows } = require('../lib/sheets');

function rowToReport(row) {
  return {
    id: row[0],
    criado_em: row[1],
    tecnico: row[2],
    cliente: row[3],
    equipamento: row[4],
    status: row[5],
    pendencias: row[6] === 'true',
    payload: row[7] ? safeParse(row[7]) : null,
  };
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return null;
  }
}

module.exports = async (req, res) => {
  const user = verifyFromReq(req);
  if (!user) {
    res.status(401).json({ error: 'N\u00e3o autenticado.' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const rows = await listReportRows();
      const reports = rows.map(rowToReport).reverse();
      res.status(200).json({ reports });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao listar relat\u00f3rios.' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const payload = req.body || {};
      const f = payload.fields || {};
      const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      const criadoEm = new Date().toISOString();

      if (!payload.meta) payload.meta = {};
      payload.meta.id = id;
      payload.meta.finalizadoEm = criadoEm;
      payload.meta.finalizadoPor = user.nome;

      await appendReport([
        id,
        criadoEm,
        f.f_tecnico || user.nome,
        f.f_cliente || '',
        f.f_equipamento || '',
        payload.statusLabel || '',
        String(!!payload.pendencias),
        JSON.stringify(payload),
      ]);

      res.status(201).json({ ok: true, id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao salvar relat\u00f3rio.' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
