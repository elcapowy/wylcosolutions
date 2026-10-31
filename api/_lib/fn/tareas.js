// Cron diario: recordatorios de facturas impagas (día 3 y 7 después de enviada).
const T = require('../tienda');
const X = require('../extras');
module.exports = async (req, res) => {
  const auth = req.headers.authorization || '', k = (req.query || {}).k;
  if (process.env.CRON_SECRET ? auth !== 'Bearer ' + process.env.CRON_SECRET && k !== process.env.ADMIN_TOKEN : k !== process.env.ADMIN_TOKEN && !req.headers['x-vercel-cron']) return res.status(401).end();
  const simular = !!(req.query || {}).simular, out = [];
  const ps = await T.pedidos(), dia = 864e5;
  for (const o of ps) {
    if (!o.invoice || !['confirmado', 'pago pendiente'].includes(o.estado)) continue;
    const env = Date.parse((o.hist || []).find(h => /Factura .* enviada/.test(h.txt))?.at || o.at), d = Math.floor((Date.now() - env) / dia), n = o.recordatorios || 0;
    const toca = (n === 0 && d >= 3) || (n === 1 && d >= 7);
    if (!toca) continue;
    out.push(o.ref + ' (día ' + d + ')');
    if (simular) continue;
    if (await X.mailCliente(o, 'recordatorio')) { o.recordatorios = n + 1; T.hist(o, `Recordatorio de pago ${n + 1} enviado a ${o.email}`); await T.guardarPedido(o); }
  }
  res.json({ ok: true, simular, recordatorios: out });
};
