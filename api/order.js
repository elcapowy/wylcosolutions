const { leerTienda, PRODUCTS } = require('./_lib/tienda');
const { render } = require('./_lib/orderpage');
const { precios } = require('./_lib/stripe');
const E = require('./_lib/envio');
module.exports = async (req, res) => {
  const q = req.query || {}, L = q.lang === 'es' ? 'es' : 'en';
  let t;
  try { t = await leerTienda(); } catch { t = PRODUCTS.map(p => ({ ...p, cases_available: 0, status: 'PreOrder', online: false, buy_url: null })); }
  const prices = {}; try { const pr = await precios(PRODUCTS.map(p => p.slug)); for (const k in pr) prices[k] = pr[k].unit_amount || 0; } catch {}
  const qty = {}; for (const p of PRODUCTS) if (q['qty_' + p.slug]) qty[p.slug] = q['qty_' + p.slug];
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', q.paid || q.err ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300');
  res.send(render(L, t, String(q.sku || '').toLowerCase(), q.paid === '1', { err: q.err, qty, prices, envio: await E.config() }));
};
