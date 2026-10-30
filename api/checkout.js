const { leerTienda, SITE, BY } = require('./_lib/tienda');
const { stripe, precios, TAX } = require('./_lib/stripe');
// Carrito de la landing → una Checkout Session con todos los SKUs (solo si todo está en stock y online)
module.exports = async (req, res) => {
  let b = req.body || {};
  if (typeof b === 'string') b = Object.fromEntries(new URLSearchParams(b));
  const lang = b.lang === 'es' ? 'es' : 'en', pre = lang === 'es' ? '/es' : '';
  const back = err => { res.setHeader('Cache-Control', 'no-store'); res.writeHead(303, { Location: `${pre}/order?err=${err}#cart` }).end(); };
  if (req.method !== 'POST') return back('method');
  try {
    const t = await leerTienda();
    const items = t.map(p => ({ p, q: Math.max(0, Math.floor(+b['qty_' + p.slug] || 0)) })).filter(x => x.q);
    if (!items.length) return back('empty');
    if (items.some(x => !x.p.online || x.q > x.p.cases_available)) return back('stock');
    const pr = await precios(items.map(x => x.p.slug));
    if (items.some(x => !pr[x.p.slug])) return back('stock');
    const meta = items.map(x => x.p.slug + ':' + x.q).join('|');
    const email = String(b.email_pay || '').trim();
    const ses = await stripe('checkout/sessions', {
      mode: 'payment', locale: lang,
      line_items: items.map(x => ({ price: pr[x.p.slug].id, quantity: x.q })),
      customer_creation: 'always', ...(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? { customer_email: email } : {}),
      billing_address_collection: 'required', shipping_address_collection: { allowed_countries: ['US'] },
      phone_number_collection: { enabled: true }, tax_id_collection: { enabled: true }, automatic_tax: { enabled: TAX },
      custom_fields: [{ key: 'company', label: { type: 'custom', custom: lang === 'es' ? 'Empresa' : 'Company name' }, type: 'text' }],
      metadata: { items: meta }, payment_intent_data: { metadata: { items: meta } },
      success_url: `${SITE}${pre}/order?paid=1`, cancel_url: `${SITE}${pre}/order?` + items.map(x => 'qty_' + x.p.slug + '=' + x.q).join('&') + '#cart'
    });
    res.setHeader('Cache-Control', 'no-store');
    res.writeHead(303, { Location: ses.url }).end();
  } catch (e) { console.error('checkout', e.message); back('stripe'); }
};
