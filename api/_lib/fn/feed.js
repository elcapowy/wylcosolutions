// Feed de productos para Google Merchant Center: /merchant.xml
const { leerTienda, SITE } = require('../tienda');
const { precios } = require('../stripe');
const X = require('../extras');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
module.exports = async (req, res) => {
  const t = await leerTienda(), pr = await precios(t.map(p => p.slug)).catch(() => ({})), lleg = await X.cfg('llegada', {});
  const items = t.filter(p => pr[p.slug]).map(p => {
    const st = p.cases_available > 0, f = !st && lleg[p.slug] && lleg[p.slug].fecha;
    return `<item><g:id>${esc(p.sku)}</g:id><g:title>${esc(`${p.name} — wholesale case${p.units ? ' of ' + p.units : ''}`)}</g:title><g:description>${esc(p.desc + '. Sold by the case to HVAC-R distributors and supply houses. Ships from Miami.')}</g:description><g:link>${SITE}/order</g:link><g:image_link>${SITE}${esc(p.img)}</g:image_link><g:availability>${st ? 'in_stock' : f ? 'preorder' : 'out_of_stock'}</g:availability>${f ? `<g:availability_date>${f}T12:00-05:00</g:availability_date>` : ''}<g:price>${(pr[p.slug].unit_amount / 100).toFixed(2)} USD</g:price><g:brand>K11</g:brand><g:mpn>${esc(p.sku)}</g:mpn><g:identifier_exists>no</g:identifier_exists><g:condition>new</g:condition>${p.units ? `<g:multipack>${p.units}</g:multipack>` : ''}<g:is_bundle>no</g:is_bundle></item>`;
  }).join('');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8'); res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>K11 America — Wylco</title><link>${SITE}/order</link><description>K11 HVAC-R sealants, wholesale by the case</description>${items}</channel></rss>`);
};
