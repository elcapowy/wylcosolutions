const { enviarHoy, autorizado } = require('./_lib/core');
module.exports = async (req, res) => {
  if (!autorizado(req)) return res.status(401).json({ error: 'no autorizado' });
  try { res.json(await enviarHoy({ simular: req.query.simular === '1' })); }
  catch (e) { res.status(500).json({ error: String(e.message || e) }); }
};
module.exports.config = { maxDuration: 60 };
