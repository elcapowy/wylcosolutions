const { leerTienda, SITE } = require('./_lib/tienda');
const pub = p => ({ sku: p.sku, slug: p.slug, name: p.name, description: p.desc, units_per_case: p.units, cases_available: p.cases_available, availability: p.status, buy_url: p.buy_url, quote_field: 'qty_' + p.slug, sds: p.sds ? SITE + p.sds : null });
module.exports = async (req, res) => {
  try {
    const t = await leerTienda();
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.query.full !== '1') return res.json({ updated: new Date().toISOString(), products: t.map(pub) });
    res.json({
      seller: { name: 'Wylco LLC', brand: 'K11', location: 'Miami, FL, USA', email: 'info@wylcosolutions.com', phone: '+1-954-881-8870' },
      buyers: 'Businesses only (HVAC-R dealers, supply houses, wholesalers, contractors) in the US',
      currency: 'USD',
      pricing: 'Wholesale price per case shown at Stripe checkout (buy_url) or on a Stripe invoice sent after an order request. Not published. Sales tax added where applicable; resellers with a resale certificate invoiced tax-exempt.',
      minimum_order: '1 full case per SKU',
      availability_rules: 'InStock: ships from Miami, FL in 2-5 business days. PreOrder: ships when stock arrives. Orders larger than cases_available are split: available cases reserved, rest pre-ordered.',
      payment_methods: ['card', 'ACH', 'wire', 'Zelle'],
      how_to_buy: {
        online: 'If buy_url is not null, open it: Stripe Checkout, choose 1..cases_available cases, pay by card or ACH.',
        invoice: 'After an order request Wylco emails a Stripe invoice within 1 business day (card, ACH, wire).',
        order_api: 'POST ' + SITE + '/api/pedido as application/x-www-form-urlencoded or application/json. Send Accept: application/json for a JSON reply.',
        required: ['company', 'contact', 'email', 'address', 'city', 'state', 'zip', 'business_type', 'business=yes', 'qty_<slug> (cases, at least one > 0)'],
        optional: ['phone', 'ein', 'notes', 'payment (Card|ACH|Wire|Zelle)', 'lang (en|es)']
      },
      products: t.map(pub),
      updated: new Date().toISOString()
    });
  } catch (e) { res.status(500).json({ error: String(e.message || e) }); }
};
