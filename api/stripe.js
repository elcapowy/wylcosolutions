const crypto = require('crypto');
const { enviar, redis } = require('./_lib/core');
const { BY, pedido, guardarPedido, devolverPedido, crearVenta, upsertCliente, hist } = require('./_lib/tienda');
const { stripe } = require('./_lib/stripe');
const WH = process.env.STRIPE_WEBHOOK_SECRET;
const TO = process.env.ORDER_TO || 'info@wylcosolutions.com';
const ADM = 'https://wylcosolutions.com/admin?v=venta&ref=';
const raw = req => new Promise((ok, ko) => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => ok(Buffer.concat(c).toString('utf8'))); req.on('error', ko); });

function verificar(body, sig) {
  const parts = {}; for (const x of String(sig || '').split(',')) { const [k, v] = x.split('='); (parts[k] = parts[k] || []).push(v); }
  const t = parts.t && parts.t[0];
  if (!t || !parts.v1 || Math.abs(Date.now() / 1000 - +t) > 600) return false;
  const h = crypto.createHmac('sha256', WH).update(t + '.' + body).digest('hex');
  return parts.v1.some(v => { try { return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(v)); } catch { return false; } });
}
const refDeSesion = async id => (await redis([['HGET', 'k11:sess', id]]))[0];
async function setEstado(ref, estado, extra = {}, txt) { const o = await pedido(ref); if (!o) return null; Object.assign(o, extra, { estado }); hist(o, txt || 'Estado → ' + estado); await guardarPedido(o); return o; }
const avisar = (ref, s, b) => enviar(TO, s, b + '\n\nVer venta: ' + ADM + ref + '\nEtiquetas de envío: https://wylcosolutions.com/api/etiqueta?ref=' + ref).catch(() => {});

async function sesionCompleta(s) {
  if (await refDeSesion(s.id)) return;
  const md = s.metadata || {};
  let items = [];
  if (md.items) items = md.items.split('|').map(x => { const [slug, q] = x.split(':'); return { slug, q: +q || 0 }; });
  else if (md.slug) { const li = await stripe('checkout/sessions/' + s.id + '/line_items?limit=10'); items = [{ slug: md.slug, q: (li.data || []).reduce((a, x) => a + (x.quantity || 0), 0) || 1 }]; }
  items = items.filter(i => BY[i.slug] && i.q > 0);
  const c = s.customer_details || {}, ship = (s.shipping_details || {}).address || c.address || {};
  const company = ((s.custom_fields || []).find(f => f.key === 'company') || {}).text?.value || c.name || '';
  const pagado = s.payment_status === 'paid';
  const datos = { email: (c.email || '').toLowerCase(), company, contact: c.name || '', phone: c.phone || '', address: [ship.line1, ship.line2].filter(Boolean).join(', '), city: ship.city || '', state: ship.state || '', zip: ship.postal_code || '', stripe_customer: s.customer || '', payment: pagado ? 'Card' : 'ACH (pendiente)' };
  const o = await crearVenta({ datos, items, origen: 'stripe', estado: pagado ? 'pagado' : 'pago pendiente', ref: 'K11-S' + Date.now().toString(36).toUpperCase(),
    extra: { stripe_session: s.id, stripe_customer: s.customer || '', total: (s.amount_total || 0) / 100, tax: ((s.total_details || {}).amount_tax || 0) / 100, flete: ((s.total_details || {}).amount_shipping || 0) / 100, retiro: !!(s.shipping_cost && s.shipping_cost.amount_total === 0 && /pickup|retiro/i.test(JSON.stringify(s.shipping_cost))), lang: s.locale === 'es' ? 'es' : 'en' } });
  await redis([['HSET', 'k11:sess', s.id, o.ref]]);
  const q = o.items.reduce((a, i) => a + i.cases, 0), pre = o.items.reduce((a, i) => a + i.preorder, 0);
  await avisar(o.ref, `[${pagado ? 'Pago' : 'Pago pendiente'} Stripe K11] ${company} · ${q} caja(s) · ${o.ref}`,
    `Ref: ${o.ref}\nCliente: ${company} · ${c.name || ''} <${c.email || ''}>\nEnvío: ${[ship.line1, ship.city, ship.state, ship.postal_code].filter(Boolean).join(', ')}\n\n${o.items.map(i => `${i.cases} × ${i.sku} ${i.name}`).join('\n')}\n\nTotal: USD ${o.total} (tax USD ${o.tax})\nEstado: ${pagado ? 'pagado' : 'ACH en proceso — no despachar hasta que figure pagado'}` + (pre ? `\nATENCIÓN: ${pre} caja(s) sin stock → pre-pedido` : ''));
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
      const ref = await refDeSesion(o.id);
      const x = await setEstado(ref, 'pagado', { payment: 'ACH' }, 'Pago ACH acreditado');
      if (x) await avisar(ref, `[ACH acreditado K11] ${x.company} · ${ref}`, `El pago ACH de ${ref} se acreditó. Ya se puede despachar.`);
    } else if (ev.type === 'checkout.session.async_payment_failed') {
      const ref = await refDeSesion(o.id), x = await pedido(ref);
      if (x && x.estado !== 'cancelado') { await devolverPedido(x); await setEstado(ref, 'cancelado', {}, 'ACH rechazado · stock devuelto'); await avisar(ref, `[ACH rechazado K11] ${x.company} · ${ref}`, `El pago ACH de ${ref} falló. Venta cancelada y stock devuelto.`); }
    } else if (ev.type === 'invoice.paid') {
      const ref = (o.metadata || {}).ref;
      const x = ref && await setEstado(ref, 'pagado', { total: o.amount_paid / 100, tax: (o.tax || 0) / 100 }, `Factura ${o.number || ''} pagada · USD ${o.amount_paid / 100}`);
      if (x) await avisar(ref, `[Factura pagada K11] ${x.company} · ${ref}`, `Factura ${o.number || o.id} pagada: USD ${o.amount_paid / 100}. Ya se puede despachar.`);
    } else if (ev.type === 'invoice.payment_failed') {
      const ref = (o.metadata || {}).ref, x = ref && await pedido(ref);
      if (x) { hist(x, 'Intento de pago de factura fallido'); await guardarPedido(x); await avisar(ref, `[Pago de factura fallido K11] ${ref}`, `Falló un intento de pago de la factura ${o.number || o.id}.`); }
    }
    res.json({ ok: true });
  } catch (e) {
    await redis([['DEL', 'k11:evt:' + ev.id]]);
    res.status(500).json({ error: String(e.message || e) });
  }
};
module.exports.config = { api: { bodyParser: false } };
