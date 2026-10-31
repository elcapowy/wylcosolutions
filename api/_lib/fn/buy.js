const { leerTienda, SITE } = require('../tienda');
const { stripe, precios, TAX } = require('../stripe');
// Crea una Checkout Session por SKU (cliente elige cajas hasta el stock disponible)
module.exports = async (req, res) => {
  const s = String(req.query.s || '').toLowerCase();
  const lang = req.query.lang === 'es' ? 'es' : 'en', pre = lang === 'es' ? '/es' : '';
  let dest = `${pre}/order?sku=${encodeURIComponent(s)}#quote`;
  try {
    const p = (await leerTienda()).find(x => x.slug === s);
    if (p && p.online && p.cases_available > 0) {
      const pr = (await precios([s]))[s];
      if (pr) {
        const max = Math.min(99, p.cases_available);
        const ses = await stripe('checkout/sessions', {
          mode: 'payment', locale: lang,
          line_items: [{ price: pr.id, quantity: 1, adjustable_quantity: { enabled: true, minimum: 1, maximum: max } }],
          customer_creation: 'always',
          billing_address_collection: 'required',
          shipping_address_collection: { allowed_countries: ['US'] },
          phone_number_collection: { enabled: true },
          tax_id_collection: { enabled: true },
          automatic_tax: { enabled: TAX },
          custom_fields: [{ key: 'company', label: { type: 'custom', custom: lang === 'es' ? 'Empresa' : 'Company name' }, type: 'text' }],
          metadata: { slug: s, sku: p.sku },
          payment_intent_data: { metadata: { slug: s, sku: p.sku } },
          success_url: `${SITE}${pre}/order?paid=1&session={CHECKOUT_SESSION_ID}`,
          cancel_url: `${SITE}${pre}/order?sku=${encodeURIComponent(s)}`
        });
        dest = ses.url;
      }
    }
  } catch (e) { console.error('buy', e.message); }
  res.setHeader('Cache-Control', 'no-store');
  res.writeHead(303, { Location: dest }).end();
};
