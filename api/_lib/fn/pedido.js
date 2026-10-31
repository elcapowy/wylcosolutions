const { enviar } = require('../core');
const { PRODUCTS, crearVenta } = require('../tienda');
const TO = process.env.ORDER_TO || 'info@wylcosolutions.com';
const clean = v => String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').trim().slice(0, 300);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function page(lang, ok, msg, lines) {
  const es = lang === 'es', back = es ? '/es/order' : '/order';
  const h = ok ? (es ? 'Pedido recibido' : 'Order received') : (es ? 'Falta información' : 'Missing information');
  const list = lines && lines.length ? '<ul>' + lines.map(l => `<li>${esc(l)}</li>`).join('') + '</ul>' : '';
  return `<!DOCTYPE html><html lang="${es ? 'es' : 'en'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${h} | Wylco</title><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet"><style>body{margin:0;background:#0F1117;color:#fff;font:16px/1.6 "DM Sans",system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px}main{max-width:560px}h1{font:800 clamp(2.4rem,6vw,3.4rem)/1 "Barlow Condensed",sans-serif;text-transform:uppercase;margin:0 0 16px}h1 em{color:#D4541A;font-style:normal}p,li{color:rgba(255,255,255,.75)}a{color:#F08A5D}a:hover{color:#fff}ul{padding-left:20px}</style></head><body><main><h1>${ok ? '<em>✓</em> ' : ''}${h}</h1><p>${esc(msg)}</p>${list}<p><a href="${back}">${es ? 'Volver' : 'Back to order page'}</a></p></main></body></html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'POST only. See https://wylcosolutions.com/catalog.json' }); }
  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = Object.fromEntries(new URLSearchParams(b)); } }
  const lang = b.lang === 'es' ? 'es' : 'en', es = lang === 'es';
  const wantsJson = /json/.test(req.headers.accept || '') || /json/.test(req.headers['content-type'] || '');
  const reply = (code, ok, msg, extra = {}, lines) => wantsJson ? res.status(code).json({ ok, message: msg, ...extra }) : res.status(code).setHeader('Content-Type', 'text/html; charset=utf-8').send(page(lang, ok, msg, lines));
  if (b.website) return reply(200, true, 'OK');

  const f = {}; for (const k of ['company', 'contact', 'email', 'phone', 'address', 'city', 'state', 'zip', 'business_type', 'ein', 'payment', 'notes']) f[k] = clean(b[k]);
  f.email = f.email.toLowerCase();
  const src = b.items && typeof b.items === 'object' ? b.items : {};
  const want = PRODUCTS.map(p => ({ slug: p.slug, q: Math.min(999, Math.max(0, Math.floor(+(b['qty_' + p.slug] ?? src[p.slug] ?? src[p.sku] ?? 0) || 0))) })).filter(x => x.q);
  const biz = b.business === true || b.business === 'yes' || b.business === 'on';
  const falta = ['company', 'contact', 'email', 'address', 'city', 'state', 'zip', 'business_type'].filter(k => !f[k]);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) falta.push('email');
  if (!biz) falta.push('business');
  if (!want.length) falta.push('qty_<slug>');
  if (falta.length) { const m = [...new Set(falta)]; return reply(400, false, (es ? 'Completá: ' : 'Please complete: ') + m.join(', '), { missing: m }); }

  let o;
  try { o = await crearVenta({ datos: f, items: want, origen: 'web', extra: { retiro: b.retiro === '1', lang, utm: String(b.utm || '').slice(0, 120) } }); }
  catch (e) { return reply(500, false, es ? 'No pudimos registrar el pedido. Escribí a info@wylcosolutions.com.' : 'We could not register your order. Please email info@wylcosolutions.com.'); }
  const items = o.items, ref = o.ref;
  await require('../extras').mailCliente(o, 'confirmacion');
  const pre = items.some(i => i.preorder), allStock = !pre;
  const line = i => es
    ? `${i.cases} caja(s) ${i.sku} ${i.name}` + (i.reserved && i.preorder ? ` — ${i.reserved} en stock, ${i.preorder} en pre-pedido` : i.preorder ? ' — pre-pedido' : ' — en stock, reservada')
    : `${i.cases} case(s) ${i.sku} ${i.name}` + (i.reserved && i.preorder ? ` — ${i.reserved} in stock, ${i.preorder} pre-order` : i.preorder ? ' — pre-order' : ' — in stock, reserved');
  const lines = items.map(line);
  const ship = es ? (allStock ? 'Lo reservado se despacha desde Miami en 2–5 días hábiles después del pago.' : 'Lo que está en stock queda reservado; el resto se despacha desde Miami apenas llega.') : (allStock ? 'Reserved cases ship from Miami 2–5 business days after payment.' : 'In-stock cases are reserved; the rest ships from Miami as soon as stock arrives.');
  const body = [`Ref: ${ref}`, `Empresa: ${f.company}`, `Contacto: ${f.contact}`, `Email: ${f.email}`, `Tel: ${f.phone}`, `Dirección: ${f.address}, ${f.city}, ${f.state} ${f.zip}`, `Tipo: ${f.business_type}`, `EIN/Reventa: ${f.ein}`, `Pago: ${f.payment}`, '', 'Pedido:', ...items.map(i => `${i.cases} × ${i.sku} ${i.name} (reservadas ${i.reserved}, pre-pedido ${i.preorder})`), '', `Notas: ${f.notes}`, '', `Ver venta: https://wylcosolutions.com/admin?v=venta&ref=${ref}`, `Etiquetas de envío: https://wylcosolutions.com/api/etiqueta?ref=${ref}`].join('\n');
  try { await enviar(TO, `[Pedido K11] ${f.company} · ${items.reduce((a, i) => a + i.cases, 0)} caja(s)${pre ? ' · incluye pre-pedido' : ''} · ${ref}`, body); } catch {}
  const conf = (es ? `Hola ${f.contact},\n\nRecibimos tu pedido K11 (ref. ${ref}):\n\n` : `Hi ${f.contact},\n\nWe received your K11 order (ref. ${ref}):\n\n`) + lines.join('\n') + '\n\n' + ship + '\n\n' + (es ? 'Te enviamos una factura de Stripe en 1 día hábil: pagás con tarjeta, ACH o transferencia.' : 'We will email you a Stripe invoice within 1 business day — pay by card, ACH or wire.') + '\n\nWylco LLC · info@wylcosolutions.com · +1 (954) 881-8870';
  await enviar(f.email, es ? `Pedido K11 recibido · ${ref}` : `K11 order received · ${ref}`, conf).catch(() => {});
  return reply(200, true, (es ? `Gracias. Tu referencia es ${ref}. ` : `Thank you. Your reference is ${ref}. `) + ship, { reference: ref, items, shipping: ship }, lines);
};
