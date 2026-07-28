const bcrypt = require('bcryptjs');
const { getUserByUsername } = require('../lib/sheets');
const { sign, setCookie } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      res.status(400).json({ error: 'Usu\u00e1rio e senha s\u00e3o obrigat\u00f3rios.' });
      return;
    }
    const user = await getUserByUsername(username);
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Usu\u00e1rio ou senha inv\u00e1lidos.' });
      return;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Usu\u00e1rio ou senha inv\u00e1lidos.' });
      return;
    }
    const token = sign({ username: user.username, nome: user.nome, papel: user.papel });
    setCookie(res, token);
    res.status(200).json({ ok: true, nome: user.nome, papel: user.papel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao autenticar.' });
  }
};
