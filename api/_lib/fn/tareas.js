// Cron diario: recordatorios de facturas (día 3 y 7), backup por mail, alerta de reposición (semanal), aviso de recompra a clientes.
const T = require('../tienda');
const X = require('../extras');
const M = require('../mejoras');
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
  const extra = {};
  if (!simular) { try { extra.backup = await M.backupDiario(); } catch (e) { extra.backup = 'error: ' + e.message; } }
  try { extra.reposicion = simular ? (await M.reorden(await T.leerTienda(), ps)).rows.filter(r => r.alerta).map(r => r.p.sku) : await M.alertaReorden(await T.leerTienda(), ps); } catch (e) { extra.reposicion = 'error: ' + e.message; }
  try { extra.recompra = await M.recompra(ps, simular); } catch (e) { extra.recompra = 'error: ' + e.message; }
  res.json({ ok: true, simular, recordatorios: out, ...extra });
};
