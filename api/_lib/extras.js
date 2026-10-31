// Extras: mails al cliente, portal, descuentos, alertas de stock, llegadas, gastos, fees de Stripe.
const crypto = require('crypto');
const { redis, CFG } = require('./core');
const SITE = 'https://wylcosolutions.com';
const TO = () => process.env.ORDER_TO || 'info@wylcosolutions.com';
const now = () => new Date().toISOString();

// ── config en Redis (k11:cfg hash, JSON por campo) ──
async function cfg(k, def) { try { const [x] = await redis([['HGET', 'k11:cfg', k]]); return x ? JSON.parse(x) : def; } catch { return def; } }
const setCfg = (k, v) => redis([['HSET', 'k11:cfg', k, JSON.stringify(v)]]);

// ── portal: link firmado por cliente ──
const firma = e => crypto.createHmac('sha256', process.env.ADMIN_TOKEN || 'k11').update(String(e).toLowerCase()).digest('hex').slice(0, 24);
const portalUrl = e => `${SITE}/api/portal?e=${encodeURIComponent(String(e).toLowerCase())}&t=${firma(e)}`;
const firmaOk = (e, t) => !!e && !!t && t.length === 24 && crypto.timingSafeEqual(Buffer.from(firma(e)), Buffer.from(String(t)));

// ── mail genérico (Resend) con adjuntos opcionales {filename, content(base64)} ──
async function mail(to, subject, text, attachments) {
  const p = { from: CFG.FROM, to: [to], subject, text, reply_to: CFG.REPLY_TO };
  if (attachments && attachments.length) p.attachments = attachments;
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
  if (!r.ok) throw new Error('Resend ' + r.status);
}

// ── tracking ──
const CARRIERS = { UPS: n => 'https://www.ups.com/track?tracknum=' + n, FedEx: n => 'https://www.fedex.com/fedextrack/?trknbr=' + n, USPS: n => 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' + n, Otro: () => '' };
const trackUrl = (c, n) => (CARRIERS[c] || CARRIERS.Otro)(encodeURIComponent(n || ''));

// ── mails al cliente ──
const FIRMA = { en: '— Wylco · K11 America\nMiami, FL · +1 (954) 881-8870 · info@wylcosolutions.com', es: '— Wylco · K11 America\nMiami, FL · +1 (954) 881-8870 · info@wylcosolutions.com' };
const lineas = o => (o.items || []).map(i => `  ${i.cases} × ${i.sku} ${i.name}${i.preorder ? (o.lang === 'es' ? ` (${i.preorder} en pre-pedido)` : ` (${i.preorder} on pre-order)`) : ''}`).join('\n');
const usd = n => '$' + (+n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function textoCliente(o, tipo, x = {}) {
  const es = o.lang === 'es', P = portalUrl(o.email), hi = es ? `Hola${o.contact ? ' ' + o.contact.split(' ')[0] : ''},` : `Hi${o.contact ? ' ' + o.contact.split(' ')[0] : ''},`;
  const pre = (o.items || []).some(i => i.preorder);
  if (tipo === 'confirmacion') return {
    s: es ? `Recibimos tu pedido K11 · ${o.ref}` : `We received your K11 order · ${o.ref}`,
    b: `${hi}\n\n${es ? 'Gracias por tu pedido. Resumen:' : 'Thanks for your order. Summary:'}\n\n${lineas(o)}\n\n${o.origen === 'stripe' ? (es ? `Total pagado: ${usd(o.total)}` : `Total paid: ${usd(o.total)}`) : (es ? 'Te mandamos la factura de Stripe dentro de 1 día hábil.' : 'We will email your Stripe invoice within 1 business day.')}\n${o.retiro ? (es ? 'Entrega: retiro en Miami (te avisamos cuando esté listo).' : 'Delivery: pickup in Miami (we will let you know when it is ready).') : (es ? 'Envío: desde Miami, 2–5 días hábiles después del pago.' : 'Shipping: from Miami, 2–5 business days after payment.')}${pre ? '\n' + (es ? 'Las cajas en pre-pedido salen cuando llegue el stock; te avisamos.' : 'Pre-order cases ship when stock arrives; we will keep you posted.') : ''}\n\n${es ? 'Tus pedidos, facturas y certificado de reventa:' : 'Your orders, invoices and resale certificate:'}\n${P}\n\n${FIRMA[es ? 'es' : 'en']}` };
  if (tipo === 'tracking') { const u = trackUrl(o.carrier, o.tracking); return {
    s: es ? `Tu pedido K11 ${o.ref} salió` : `Your K11 order ${o.ref} has shipped`,
    b: `${hi}\n\n${es ? 'Tu pedido ya está en camino.' : 'Your order is on its way.'}\n\n${lineas(o)}\n\n${o.carrier || ''} ${o.tracking}${u ? '\n' + u : ''}\n\n${es ? 'Mis pedidos:' : 'My orders:'} ${P}\n\n${FIRMA[es ? 'es' : 'en']}` }; }
  if (tipo === 'listo') return {
    s: es ? `Tu pedido K11 ${o.ref} está listo para retirar` : `Your K11 order ${o.ref} is ready for pickup`,
    b: `${hi}\n\n${es ? 'Tu pedido está listo para retirar en Miami. Respondé este mail para coordinar el horario.' : 'Your order is ready for pickup in Miami. Reply to this email to set a time.'}\n\n${lineas(o)}\n\n${FIRMA[es ? 'es' : 'en']}` };
  if (tipo === 'recordatorio') return {
    s: es ? `Recordatorio: factura pendiente ${o.ref}` : `Reminder: invoice due for ${o.ref}`,
    b: `${hi}\n\n${es ? `Te recordamos que la factura de tu pedido ${o.ref} (${usd(o.total)}) sigue pendiente.` : `A friendly reminder that the invoice for order ${o.ref} (${usd(o.total)}) is still open.`}\n\n${es ? 'Pagar online (tarjeta, ACH o transferencia):' : 'Pay online (card, ACH or wire):'}\n${o.invoice_url || P}\n\n${es ? '¿Ya pagaste por Zelle o transferencia? Respondé este mail y lo marcamos.' : 'Already paid by Zelle or wire? Just reply and we will mark it.'}\n\n${FIRMA[es ? 'es' : 'en']}` };
  if (tipo === 'abandono') return {
    s: es ? 'Tu pedido K11 quedó sin terminar' : 'Your K11 order is still waiting',
    b: `${hi}\n\n${es ? 'Vimos que empezaste un pedido de K11 y no se completó el pago:' : 'You started a K11 order but the payment was not completed:'}\n\n${(x.items || []).map(i => `  ${i.q} × ${i.name}`).join('\n')}\n\n${es ? 'Retomalo acá (el carrito ya está cargado):' : 'Pick up where you left off (cart is pre-filled):'}\n${SITE}${es ? '/es' : ''}/order?${(x.items || []).map(i => 'qty_' + i.slug + '=' + i.q).join('&')}&utm_source=email&utm_medium=abandoned#checkout\n\n${es ? '¿Preferís factura o tenés dudas? Respondé este mail.' : 'Prefer an invoice or have a question? Just reply.'}\n\n${FIRMA[es ? 'es' : 'en']}` };
}
async function mailCliente(o, tipo, x) { if (!o || !o.email) return false; try { const t = textoCliente(o, tipo, x); await mail(o.email, t.s, t.b); return true; } catch (e) { console.error('mailCliente', tipo, e.message); return false; } }

// ── descuentos: por volumen (cfg desc = [{min, pct}]), por cliente (c.desc_pct) y por nivel (c.nivel → cfg niveles). Gana el mayor. ──
async function descuento(c, cajas) {
  const tiers = await cfg('desc', []); let p = 0;
  for (const t of tiers) if (cajas >= +t.min && +t.pct > p) p = +t.pct;
  if (c && +c.desc_pct > p) p = +c.desc_pct;
  if (c && c.nivel) { const nv = await cfg('niveles', {}); if (+nv[c.nivel] > p) p = +nv[c.nivel]; }
  return Math.min(50, p);
}

// ── stock mínimo: avisa (máx. 1 vez cada 3 días por SKU) ──
async function chequearMinimo(slugs, BY) {
  const min = await cfg('minimo', {}); const q = slugs.filter(s => +min[s] > 0); if (!q.length) return;
  const st = await redis(q.map(s => ['HGET', 'k11:stock', s]));
  const bajos = q.map((s, i) => ({ s, n: parseInt(st[i] || '0', 10) || 0 })).filter(x => x.n < +min[x.s]);
  for (const x of bajos) {
    const [ok] = await redis([['SET', 'k11:alerta:' + x.s, '1', 'NX', 'EX', '259200']]); if (ok !== 'OK') continue;
    const p = BY[x.s] || { sku: x.s, name: x.s };
    try { await mail(TO(), `[K11] Stock bajo: ${p.sku} · quedan ${x.n} caja(s)`, `${p.name} (${p.sku}) bajó de ${min[x.s]} cajas: quedan ${x.n}.\n\nCargar ingreso: ${SITE}/admin?v=stock`); } catch {}
  }
}

// ── fee real de Stripe para un PaymentIntent o Charge ──
async function feeStripe(stripe, { pi, charge }) {
  try {
    let ch = charge;
    if (!ch && pi) { const p = await stripe('payment_intents/' + pi); ch = p.latest_charge; }
    if (!ch) return null;
    const c = await stripe('charges/' + (typeof ch === 'string' ? ch : ch.id) + '?expand[]=balance_transaction');
    const bt = c.balance_transaction; return bt && typeof bt === 'object' ? bt.fee / 100 : null;
  } catch { return null; }
}

module.exports = { cfg, setCfg, firma, firmaOk, portalUrl, mail, mailCliente, textoCliente, trackUrl, CARRIERS, descuento, chequearMinimo, feeStripe, SITE, TO, now };
