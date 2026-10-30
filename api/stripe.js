const crypto = require('crypto');
const { enviar, redis } = require('./_lib/core');
const { BY, pedido, guardarPedido, reservar, devolverPedido } = require('./_lib/tienda');
const { stripe } = require('./_lib/stripe');
const WH = process.env.STRIPE_WEBHOOK_SECRET;
const TO = process.env.ORDER_TO || 'info@wylcosolutions.com';
const ADM = 'https://wylcosolutions.com/admin';
const raw = req => new Promise((ok, ko) => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => ok(Buffer.concat(c).toString('utf8'))); req.on('error', ko); });

function verificar(body, sig) {
  const parts = {}; for (const x of String(sig || '').split(',')) { const [k, v] = x.split('='); (parts[k] = parts[k] || []).push(v); }
  const t = parts.t && parts.t[0];
  if (!t || !parts.v1 || Math.abs(Date.now() / 1000 - +t) > 600) return false;
  const h = crypto.createHmac('sha256', WH).update(t + '.' + body).digest('hex');
  return parts.v1.some(v => { try { return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(v)); } catch { return false; } });
}
const refDeSesion = async id => (await redis([['HGET', 'k11:sess', id]]))[0];
async function setEstado(ref, estado, extra = {}) { const o = ref && await pedido(ref); if (!o) return null; Object.assign(o, extra, { estado }); await guardarPedido(o); return o; }
const avisar = (s, b) => enviar(TO, s, b + '\n\nGestionar: ' + ADM).catch(() => {});

async function sesionCompleta(s) {
  if (await refDeSesion(s.id)) return; // ya procesada
  const slug = (s.metadata || {}).slug, p = BY[slug];
  const li = await stripe('checkout/sessions/' + s.id + '/line_items?limit=10');
  const q = (li.data || []).reduce((a, x) => a + (x.quantity || 0), 0) || 1;
  const c = s.customer_details || {}, ship = (s.shipping_details || {}).address || c.address || {};
  const company = ((s.custom_fields || []).find(f => f.key === 'company') || {}).text?.value || c.name || '';
  const items = [];
  if (p) { const r = await reservar(slug, q); items.push({ slug, sku: p.sku, name: p.name, cases: q, reserved: r, preorder: q - r }); }
  const pagado = s.payment_status === 'paid';
  const ref = 'K11-S' + Date.now().toString(36).toUpperCase();
  await guardarPedido({ ref, at: new Date().toISOString(), estado: pagado ? 'pagado' : 'pago pendiente', origen: 'stripe', stripe_session: s.id, stripe_customer: s.customer, total: (s.amount_total || 0) / 100, tax: ((s.total_details || {}).amount_tax || 0) / 100,
    company, contact: c.name || '', email: c.email || '', phone: c.phone || '', state: ship.state || '', address: [ship.line1, ship.line2, ship.city, ship.state, ship.postal_code].filter(Boolean).join(', '), payment: pagado ? 'Card' : 'ACH (pendiente)', items, lang: s.locale === 'es' ? 'es' : 'en' });
  await redis([['HSET', 'k11:sess', s.id, ref]]);
  await avisar(`[${pagado ? 'Pago' : 'Pago pendiente'} Stripe K11] ${company} · ${q} caja(s) ${p ? p.sku : '?'} · ${ref}`,
    `Ref: ${ref}\nCliente: ${company} · ${c.name || ''} <${c.email || ''}>\nEnvío: ${[ship.line1, ship.city, ship.state, ship.postal_code].filter(Boolean).join(', ')}\nTotal: USD ${(s.amount_total || 0) / 100} (tax USD ${((s.total_details || {}).amount_tax || 0) / 100})\nEstado: ${pagado ? 'pagado' : 'ACH en proceso — no despachar hasta que figure pagado'}` + (items[0] && items[0].preorder ? `\nATENCIÓN: ${items[0].preorder} caja(s) sin stock → pre-pedido` : ''));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.STRIPE_SECRET_KEY || !WH) return res.status(500).send('Faltan STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET');
  const body = await raw(req);
  if (!verificar(body, req.headers['stripe-signature'])) return res.status(400).send('firma inválida');
  const ev = JSON.parse(body), o = ev.data.object;
  const [nuevo] = await redis([['SET', 'k11:evt:' + ev.id, '1', 'NX', 'EX', '2592000']]);
  if (nuevo !== 'OK') return res.json({ ok: true, repetido: true });
  try {
    if (ev.type === 'checkout.session.completed') await sesionCompleta(o);
    else if (ev.type === 'checkout.session.async_payment_succeeded') {
      if (!(await refDeSesion(o.id))) await sesionCompleta(o);
      const x = await setEstado(await refDeSesion(o.id), 'pagado', { payment: 'ACH' });
      if (x) await avisar(`[ACH acreditado K11] ${x.company} · ${x.ref}`, `El pago ACH de ${x.ref} se acreditó. Ya se puede despachar.`);
    } else if (ev.type === 'checkout.session.async_payment_failed') {
      const x = await pedido(await refDeSesion(o.id));
      if (x && x.estado !== 'cancelado') { await devolverPedido(x); await setEstado(x.ref, 'cancelado', { nota: 'ACH rechazado' }); await avisar(`[ACH rechazado K11] ${x.company} · ${x.ref}`, `El pago ACH de ${x.ref} falló. Pedido cancelado y stock devuelto.`); }
    } else if (ev.type === 'invoice.paid') {
      const x = await setEstado((o.metadata || {}).ref, 'pagado', { total: o.amount_paid / 100, tax: (o.tax || 0) / 100 });
      if (x) await avisar(`[Factura pagada K11] ${x.company} · ${x.ref}`, `Factura ${o.number || o.id} pagada: USD ${o.amount_paid / 100}. Ya se puede despachar.`);
    } else if (ev.type === 'invoice.payment_failed') {
      const ref = (o.metadata || {}).ref;
      if (ref) await avisar(`[Factura con pago fallido K11] ${ref}`, `Falló un intento de pago de la factura ${o.number || o.id}. Stripe reintenta según tu configuración.`);
    }
    res.json({ ok: true });
  } catch (e) {
    await redis([['DEL', 'k11:evt:' + ev.id]]); // permite reintento de Stripe
    res.status(500).json({ error: String(e.message || e) });
  }
};
module.exports.config = { api: { bodyParser: false } };
