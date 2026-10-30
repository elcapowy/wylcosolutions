const { leerTienda, PRODUCTS } = require('./_lib/tienda');
const { render } = require('./_lib/orderpage');
module.exports = async (req, res) => {
  const L = req.query.lang === 'es' ? 'es' : 'en';
  let t;
  try { t = await leerTienda(); } catch { t = PRODUCTS.map(p => ({ ...p, cases_available: 0, status: 'PreOrder', online: false, buy_url: null })); }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', req.query.paid ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300');
  res.send(render(L, t, String(req.query.sku || '').toLowerCase(), req.query.paid === '1'));
};
