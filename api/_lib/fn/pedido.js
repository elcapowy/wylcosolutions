const { enviar } = require('../core');
const { PRODUCTS, crearVenta } = require('../tienda');
const TO = process.env.ORDER_TO || 'info@wylcosolutions.com';
// Preventa 15%: precio por caja (USD) con 15% sobre el mayorista. Solo estos SKUs.
const PRE = { 'tfk11-10': 2570.40, 'k11-2in1-11': 3198.72, 'spk11-b35': 391.68, '20002': 2023.00 };
const usd = n => '$' + (+n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  const preventa = String(b.preorder || '') === '15';
  const wantsJson = /json/.test(req.headers.accept || '') || /json/.test(req.headers['content-type'] || '');
  const reply = (code, ok, msg, extra = {}, lines) => (!wantsJson && ok && extra.reference) ? res.status(303).setHeader('Location', '/thank-you?ref=' + encodeURIComponent(extra.reference) + '&lang=' + lang + (preventa ? '&t=pre' : '&t=order')).end() : wantsJson ? res.status(code).json({ ok, message: msg, ...extra }) : res.status(code).setHeader('Content-Type', 'text/html; charset=utf-8').send(page(lang, ok, msg, lines));
  if (b.website) return reply(200, true, 'OK');

  const f = {}; for (const k of ['company', 'contact', 'email', 'phone', 'address', 'city', 'state', 'zip', 'business_type', 'ein', 'payment', 'notes']) f[k] = clean(b[k]);
  f.email = f.email.toLowerCase();
  const src = b.items && typeof b.items === 'object' ? b.items : {};
  const want = PRODUCTS.filter(p => !preventa || PRE[p.slug]).map(p => ({ slug: p.slug, q: Math.min(999, Math.max(0, Math.floor(+(b['qty_' + p.slug] ?? src[p.slug] ?? src[p.sku] ?? 0) || 0))) })).filter(x => x.q);
  const biz = b.business === true || b.business === 'yes' || b.business === 'on';
  const falta = ['company', 'contact', 'email', 'address', 'city', 'state', 'zip', 'business_type'].filter(k => !f[k]);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) falta.push('email');
  if (!biz) falta.push('business');
  if (!want.length) falta.push('qty_<slug>');
  if (falta.length) { const m = [...new Set(falta)]; return reply(400, false, (es ? 'Completá: ' : 'Please complete: ') + m.join(', '), { missing: m }); }

  let preTotal = 0, preEnvio = 0;
  if (preventa) {
    const nc = want.reduce((a, x) => a + x.q, 0); preTotal = want.reduce((a, x) => a + PRE[x.slug] * x.q, 0);
    preEnvio = 0; // el envío se cotiza por cada operación y se agrega a la factura
    f.payment = 'PREVENTA 15%: ACH/wire/Zelle, pago completo antes del 30-nov-2026';
    f.notes = ('PREVENTA 15% · subtotal ' + usd(preTotal) + ' · envio: cotizar' + ' · total sin envio ' + usd(preTotal) + (f.notes ? ' · ' + f.notes : '')).slice(0, 300);
  }
  let o;
  try { o = await crearVenta({ datos: f, items: want, origen: 'web', extra: { retiro: b.retiro === '1', lang, utm: String(b.utm || '').slice(0, 120), ...(preventa ? { preventa: 15, precios_preventa: Object.fromEntries(want.map(x => [x.slug, PRE[x.slug]])), total: Math.round(preTotal * 100) / 100, subtotal_preventa: preTotal, envio_preventa: preEnvio } : {}) } }); }
  catch (e) { return reply(500, false, es ? 'No pudimos registrar el pedido. Escribí a info@wylcosolutions.com.' : 'We could not register your order. Please email info@wylcosolutions.com.'); }
  const items = o.items, ref = o.ref;
  if (!preventa) await require('../extras').mailCliente(o, 'confirmacion'); // la preventa manda su propio mail (sin Stripe)
  const pre = items.some(i => i.preorder), allStock = !pre;
  const line = i => es
    ? `${i.cases} caja(s) ${i.sku} ${i.name}` + (i.reserved && i.preorder ? ` — ${i.reserved} en stock, ${i.preorder} en pre-pedido` : i.preorder ? ' — pre-pedido' : ' — en stock, reservada')
    : `${i.cases} case(s) ${i.sku} ${i.name}` + (i.reserved && i.preorder ? ` — ${i.reserved} in stock, ${i.preorder} pre-order` : i.preorder ? ' — pre-order' : ' — in stock, reserved');
  const lines = items.map(line);
  const ship = es ? (allStock ? 'Lo reservado se despacha desde Miami en 2–5 días hábiles después del pago.' : 'Lo que está en stock queda reservado; el resto se despacha desde Miami apenas llega.') : (allStock ? 'Reserved cases ship from Miami 2–5 business days after payment.' : 'In-stock cases are reserved; the rest ships from Miami as soon as stock arrives.');
  const body = [`Ref: ${ref}`, `Empresa: ${f.company}`, `Contacto: ${f.contact}`, `Email: ${f.email}`, `Tel: ${f.phone}`, `Dirección: ${f.address}, ${f.city}, ${f.state} ${f.zip}`, `Tipo: ${f.business_type}`, `EIN/Reventa: ${f.ein}`, `Pago: ${f.payment}`, '', 'Pedido:', ...items.map(i => `${i.cases} × ${i.sku} ${i.name} (reservadas ${i.reserved}, pre-pedido ${i.preorder})`), '', `Notas: ${f.notes}`, ...(preventa ? ['', `PREVENTA 15%: subtotal ${usd(preTotal)}; ENVIO A COTIZAR${b.retiro === '1' ? ' (retira en Miami: sin envio)' : ''}. Cobrar por ACH/wire/Zelle antes del 30-nov.`] : []), '', `Ver venta: https://wylcosolutions.com/admin?v=venta&ref=${ref}`, `Etiquetas de envío: https://wylcosolutions.com/api/etiqueta?ref=${ref}`].join('\n');
  try { await enviar(TO, `[Pedido K11${preventa ? ' PREVENTA 15%' : ''}] ${f.company} · ${items.reduce((a, i) => a + i.cases, 0)} caja(s)${pre ? ' · incluye pre-pedido' : ''} · ${ref}`, body); } catch {}
  const preLines = preventa ? items.map(i => `${i.cases} × ${i.sku} ${i.name} — ${usd(PRE[i.slug])}/case = ${usd(PRE[i.slug] * i.cases)}`) : null;
  const confPre = preventa ? `Hi ${f.contact},\n\nWe received your K11 pre-order (ref. ${ref}) at 15% off:\n\n` + preLines.join('\n') + `\n\nSubtotal: ${usd(preTotal)}\nShipping: ${b.retiro === '1' ? 'pickup in Miami, no charge' : 'we will quote it for your order and add it to the invoice'}\n\nWe will email our invoice with ACH, wire and Zelle instructions within 1 business day. Pay in full by Nov 30, 2026 to lock the pre-order price; your cases are reserved in order of payment. Full refund until your order ships. Ships from Miami as soon as the first inventory clears customs.\n\nWylco Solutions LLC · 4350 Hillcrest Dr, Apt 220, Hollywood, FL 33021 · info@wylcosolutions.com · +1 (954) 881-8870` : null;
  const conf = preventa ? confPre : (es ? `Hola ${f.contact},\n\nRecibimos tu pedido K11 (ref. ${ref}):\n\n` : `Hi ${f.contact},\n\nWe received your K11 order (ref. ${ref}):\n\n`) + lines.join('\n') + '\n\n' + ship + '\n\n' + (es ? 'Te enviamos una factura de Stripe en 1 día hábil: pagás con tarjeta, ACH o transferencia.' : 'We will email you a Stripe invoice within 1 business day — pay by card, ACH or wire.') + '\n\nWylco Solutions LLC · 4350 Hillcrest Dr, Apt 220, Hollywood, FL 33021 · info@wylcosolutions.com · +1 (954) 881-8870';
  await enviar(f.email, preventa ? `K11 pre-order received · ${ref}` : es ? `Pedido K11 recibido · ${ref}` : `K11 order received · ${ref}`, conf).catch(() => {});
  return reply(200, true, preventa ? `Thank you. Your pre-order reference is ${ref}. Subtotal ${usd(preTotal)} plus shipping, which we will quote for your order. We will email the invoice with payment instructions within 1 business day. · Gracias. Le enviamos la factura con las instrucciones de pago en 1 día hábil.` : (es ? `Gracias. Tu referencia es ${ref}. ` : `Thank you. Your reference is ${ref}. `) + ship, { reference: ref, items, shipping: ship }, lines);
};
