const { verifyFromReq } = require('../lib/auth');

module.exports = async (req, res) => {
  const user = verifyFromReq(req);
  if (!user) {
    res.status(401).json({ error: 'N\u00e3o autenticado.' });
    return;
  }
  res.status(200).json({ ok: true, nome: user.nome, papel: user.papel });
};
