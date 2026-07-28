const { verifyFromReq } = require('../lib/auth');

module.exports = async (req, res) => {
  const user = verifyFromReq(req);
  if (!user) {
    res.status(401).json({ error: 'N\u00e3o autenticado.' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!process.env.RESEND_API_KEY) {
    res.status(400).json({
      error: 'Envio autom\u00e1tico n\u00e3o configurado (RESEND_API_KEY ausente). Use o bot\u00e3o de e-mail do navegador como alternativa.',
    });
    return;
  }
  try {
    const { to, subject, text } = req.body || {};
    if (!to || !subject || !text) {
      res.status(400).json({ error: 'Campos obrigat\u00f3rios: to, subject, text.' });
      return;
    }
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'relatorios@tecfag.com.br',
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      res.status(502).json({ error: 'Falha ao enviar e-mail.', detail: errText });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar e-mail.' });
  }
};
