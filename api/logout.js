const { clearCookie } = require('../lib/auth');

module.exports = async (req, res) => {
  clearCookie(res);
  res.status(200).json({ ok: true });
};
