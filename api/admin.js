const { autorizado, redis, enviar } = require('./_lib/core');
const { BY, PRODUCTS, leerTienda, pedidos, pedido, guardarPedido, devolverPedido } = require('./_lib/tienda');
const { stripe, precios, fijarPrecio, TAX, MODE } = require('./_lib/stripe');
const ESTADOS = ['nuevo', 'confirmado', 'pago pendiente', 'pagado', 'enviado', 'cancelado'];
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const DASH = MODE === 'test' ? 'https://dashboard.stripe.com/test' : 'https://dashboard.stripe.com';

async function cliente(o) {
  const addr = { line1: o.address || undefined, city: o.city || undefined, state: o.state || undefined, postal_code: o.zip || undefined, country: 'US' };
  const data = { email: o.email, name: o.company, phone: o.phone || undefined, address: addr, shipping: { name: o.company, address: addr }, tax_exempt: o.exento ? 'exempt' : 'none', metadata: { contact: o.contact, ein: o.ein || '' } };
  if (o.stripe_customer) return stripe('customers/' + o.stripe_customer, data);
  return stripe('customers', data);
}
async function crearFactura(o) {
  const pr = await precios(o.items.map(i => i.slug));
  const falta = o.items.filter(i => !pr[i.slug]).map(i => i.sku);
  if (falta.length) throw new Error('Falta precio en Stripe para: ' + falta.join(', '));
  const c = await cliente(o); o.stripe_customer = c.id;
  const inv = await stripe('invoices', {
    customer: c.id, collection_method: 'send_invoice', days_until_due: 7, auto_advance: true, pending_invoice_items_behavior: 'exclude',
    automatic_tax: { enabled: TAX }, metadata: { ref: o.ref },
    description: `K11 order ${o.ref}` + (o.items.some(i => i.preorder) ? ' — includes pre-order items, ship when stock arrives' : ''),
    footer: 'Wylco LLC · Miami, FL · info@wylcosolutions.com · +1 (954) 881-8870',
    payment_settings: { payment_method_types: ['card', 'us_bank_account', 'customer_balance'], payment_method_options: { customer_balance: { funding_type: 'bank_transfer', bank_transfer: { type: 'us_bank_transfer' } } } }
  });
  for (const i of o.items) await stripe('invoiceitems', { customer: c.id, invoice: inv.id, price: pr[i.slug].id, quantity: i.cases, description: `${i.sku} ${i.name} — ${i.cases} case(s)${i.preorder ? ` (${i.preorder} pre-order)` : ''}` });
  await stripe('invoices/' + inv.id + '/finalize', {});
  const sent = await stripe('invoices/' + inv.id + '/send', {});
  Object.assign(o, { estado: 'confirmado', invoice: sent.id, invoice_url: sent.hosted_invoice_url, invoice_pdf: sent.invoice_pdf, total: sent.total / 100, tax: (sent.tax || 0) / 100 });
  await guardarPedido(o);
  return sent;
}

module.exports = async (req, res) => {
  if (!autorizado(req)) return res.status(401).send('no autorizado — usá /admin?k=TU_TOKEN');
  const q = req.query, k = encodeURIComponent(q.k || '');
  let aviso = '';
  try {
    if (q.a === 'stock' && BY[q.s]) { const v = Math.max(0, parseInt(q.v, 10) || 0); await redis([['HSET', 'k11:stock', q.s, String(v)]]); aviso = `Stock ${BY[q.s].sku} = ${v} cajas`; }
    if (q.a === 'sumar' && BY[q.s]) { const v = parseInt(q.v, 10) || 0; await redis([['HINCRBY', 'k11:stock', q.s, v]]); aviso = `${v > 0 ? '+' : ''}${v} cajas a ${BY[q.s].sku}`; }
    if (q.a === 'precio' && BY[q.s]) {
      const v = parseFloat(String(q.v).replace(',', '.'));
      if (v > 0) { await fijarPrecio(BY[q.s], v); await redis([['HSET', 'k11:online', q.s, '1']]); aviso = `Precio ${BY[q.s].sku} = USD ${v.toFixed(2)} por caja (Stripe ${MODE})`; }
      else { await redis([['HDEL', 'k11:online', q.s]]); aviso = `${BY[q.s].sku}: venta online desactivada`; }
    }
    if (q.a === 'online' && BY[q.s]) { await redis([q.v === '1' ? ['HSET', 'k11:online', q.s, '1'] : ['HDEL', 'k11:online', q.s]]); aviso = `${BY[q.s].sku}: venta online ${q.v === '1' ? 'activada' : 'desactivada'}`; }
    const o = q.ref ? await pedido(q.ref) : null;
    if (o && q.a === 'estado' && ESTADOS.includes(q.v)) {
      if (q.v === 'cancelado' && o.estado !== 'cancelado') { await devolverPedido(o); if (o.invoice) await stripe('invoices/' + o.invoice + '/void', {}).catch(() => {}); }
      o.estado = q.v; if (q.pago) o.payment = q.pago; await guardarPedido(o);
      aviso = `${o.ref} → ${q.v}` + (q.v === 'cancelado' ? ' (stock devuelto' + (o.invoice ? ', factura anulada' : '') + ')' : '');
    }
    if (o && q.a === 'exento') { o.exento = !o.exento; if (o.stripe_customer) await stripe('customers/' + o.stripe_customer, { tax_exempt: o.exento ? 'exempt' : 'none' }); await guardarPedido(o); aviso = `${o.ref}: ${o.exento ? 'exento de sales tax (guardá el certificado de reventa)' : 'con sales tax'}`; }
    if (o && q.a === 'factura') { if (o.invoice) aviso = `${o.ref} ya tiene factura`; else { const inv = await crearFactura(o); aviso = `Factura ${inv.number} enviada a ${o.email} · USD ${(inv.total / 100).toFixed(2)}`; } }
  } catch (e) { aviso = 'Error: ' + (e.message || e); }
  if (q.a) { res.writeHead(303, { Location: '/admin?k=' + k + (q.f ? '&f=' + encodeURIComponent(q.f) : '') + '&ok=' + encodeURIComponent(aviso) }); return res.end(); }

  const [t, ps, pr] = await Promise.all([leerTienda(), pedidos(), precios(PRODUCTS.map(p => p.slug)).catch(e => ({ _err: e.message }))]);
  const filtro = q.f || 'activos';
  const lista = ps.filter(o => filtro === 'todos' || (filtro === 'activos' ? !['enviado', 'cancelado'].includes(o.estado) : o.estado === filtro));
  const res2 = {}; for (const o of ps) if (!['enviado', 'cancelado'].includes(o.estado)) for (const i of o.items || []) { res2[i.slug] = (res2[i.slug] || 0) + (i.reserved || 0); res2[i.slug + '_p'] = (res2[i.slug + '_p'] || 0) + (i.preorder || 0); }
  const H = (a, s, extra = '') => `<input type="hidden" name="k" value="${esc(q.k)}"><input type="hidden" name="a" value="${a}"><input type="hidden" name="s" value="${s}">${extra}`;
  const L = (params, txt, conf) => `<a href="/admin?k=${k}&f=${encodeURIComponent(filtro)}&${params}"${conf ? ` onclick="return confirm('${conf}')"` : ''}>${txt}</a>`;
  const stockRows = t.map(p => { const price = pr[p.slug];
    return `<tr><td class="m">${p.sku}</td><td>${esc(p.name)}<br><small>${p.units ? p.units + ' u/caja' : ''}</small></td>
<td class="n ${p.cases_available ? 'ok' : 'no'}">${p.cases_available}</td><td class="n">${res2[p.slug] || 0}</td><td class="n">${res2[p.slug + '_p'] || 0}</td>
<td><form>${H('stock', p.slug)}<input type="number" name="v" min="0" value="${p.cases_available}"><button>Fijar</button></form><form>${H('sumar', p.slug)}<input type="number" name="v" placeholder="+/-"><button>Sumar</button></form></td>
<td><form>${H('precio', p.slug)}<input type="number" name="v" step="0.01" min="0" value="${price ? (price.unit_amount / 100).toFixed(2) : ''}" placeholder="USD/caja"><button>Guardar</button></form>
<small>${price ? (p.online ? `<span class="ok">● Online</span> · ${L('a=online&s=' + p.slug + '&v=0', 'desactivar')}` : `Solo facturas · ${L('a=online&s=' + p.slug + '&v=1', 'activar online')}`) : 'Sin precio'}</small></td></tr>`; }).join('');
  const ordRows = lista.map(o => {
    const acts = [];
    if (!o.invoice && o.origen !== 'stripe' && !['cancelado', 'enviado'].includes(o.estado)) acts.push(L('a=factura&ref=' + o.ref, '<b>Crear y enviar factura</b>', '¿Crear la factura en Stripe (' + MODE + ') y enviarla a ' + esc(o.email) + '?'));
    if (o.invoice_url) acts.push(`<a href="${esc(o.invoice_url)}" target="_blank">ver factura</a>`);
    if (o.invoice) acts.push(`<a href="${DASH}/invoices/${o.invoice}" target="_blank">Stripe</a>`);
    if (o.stripe_session && o.stripe_customer) acts.push(`<a href="${DASH}/customers/${o.stripe_customer}" target="_blank">Stripe</a>`);
    if (!o.invoice && o.origen !== 'stripe') acts.push(L('a=exento&ref=' + o.ref, o.exento ? 'quitar exención' : 'marcar exento'));
    if (o.estado !== 'pagado' && !['cancelado', 'enviado'].includes(o.estado)) acts.push(L('a=estado&ref=' + o.ref + '&v=pagado&pago=Zelle', 'pagado por Zelle', '¿Confirmás que recibiste el Zelle?'));
    for (const e of ['enviado', 'cancelado']) if (o.estado !== e) acts.push(L('a=estado&ref=' + o.ref + '&v=' + e, e, e === 'cancelado' ? '¿Cancelar, devolver stock' + (o.invoice ? ' y anular factura' : '') + '?' : ''));
    return `<tr class="e-${o.estado.replace(' ', '-')}"><td class="m">${o.ref}<br><small>${o.at.slice(0, 16).replace('T', ' ')} · ${o.origen}</small></td>
<td><strong>${esc(o.company)}</strong>${o.exento ? ' <span class="tag ex">exento</span>' : ''}<br><small>${esc(o.contact)} · <a href="mailto:${esc(o.email)}">${esc(o.email)}</a> ${esc(o.phone)}<br>${esc(o.address || '')}${o.city ? ', ' + esc(o.city) : ''} ${esc(o.state)} ${esc(o.zip || '')}<br>${esc(o.business_type || '')} ${o.ein ? '· EIN/reventa ' + esc(o.ein) : ''}</small></td>
<td>${(o.items || []).map(i => `${i.cases}× ${i.sku}<br><small>stock ${i.reserved} · pre ${i.preorder}</small>`).join('<br>')}</td>
<td><small>${esc(o.payment || '')}${o.total ? `<br><b>USD ${o.total.toFixed ? o.total.toFixed(2) : o.total}</b>${o.tax ? ' (tax ' + o.tax + ')' : ''}` : ''}${o.notes ? '<br>' + esc(o.notes) : ''}${o.nota ? '<br>' + esc(o.nota) : ''}</small></td>
<td><span class="tag">${o.estado}</span><div class="acts">${acts.join('')}</div></td></tr>`; }).join('') || '<tr><td colspan="5">Sin pedidos.</td></tr>';
  const tabs = ['activos', ...ESTADOS, 'todos'].map(f => `<a href="/admin?k=${k}&f=${encodeURIComponent(f)}" class="${f === filtro ? 'on' : ''}">${f}</a>`).join('');
  const banner = MODE === 'off' ? '<div class="warn">Stripe no conectado: agregá STRIPE_SECRET_KEY en Vercel.</div>'
    : `<div class="st ${MODE}">Stripe <b>${MODE === 'test' ? 'MODO PRUEBA' : 'EN VIVO'}</b> · Tax automático: <b>${TAX ? 'activado' : 'desactivado (STRIPE_TAX=1 para activar)'}</b> · Webhook: <b>${process.env.STRIPE_WEBHOOK_SECRET ? 'configurado' : 'falta STRIPE_WEBHOOK_SECRET'}</b>${pr._err ? ' · Error: ' + esc(pr._err) : ''} · <a href="${DASH}" target="_blank">Dashboard</a></div>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Admin K11 · Stock, precios y pedidos</title>
<style>body{margin:0;background:#f4f1ec;color:#1a1a1a;font:14px/1.45 system-ui,sans-serif}main{max-width:1240px;margin:0 auto;padding:24px}h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:28px 0 10px}a{color:#B8461A}a:hover{color:#1a1a1a}
.top{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center}.top nav{display:flex;gap:14px;flex-wrap:wrap}
.ok-msg{background:#1a1a1a;color:#fff;padding:10px 14px;border-radius:8px;margin:14px 0}.warn{background:#b3261e;color:#fff;padding:10px 14px;border-radius:8px;margin:14px 0}
.st{padding:10px 14px;border-radius:8px;margin:14px 0;background:#fff;border:1px solid #e2dcd2}.st.test{border-left:6px solid #E8A33C}.st.live{border-left:6px solid #1d7a3a}
.tw{overflow-x:auto;background:#fff;border:1px solid #e2dcd2;border-radius:10px}table{width:100%;border-collapse:collapse;min-width:960px}th,td{padding:10px 12px;border-bottom:1px solid #eee7dc;text-align:left;vertical-align:top}th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b645a;background:#faf8f4}
.m{font-family:ui-monospace,Menlo,monospace;font-size:12px}.n{font-size:18px;font-weight:700;text-align:right}.ok{color:#1d7a3a}.no{color:#b3261e}small{color:#6b645a}
form{display:flex;gap:6px;margin:0 0 6px}input{font:inherit;padding:6px 8px;border:1px solid #d6cfc3;border-radius:6px;width:90px}button{font:inherit;padding:6px 10px;border:0;border-radius:6px;background:#D4541A;color:#fff;cursor:pointer}button:hover{background:#1a1a1a}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.tabs a{padding:6px 12px;border-radius:20px;background:#fff;border:1px solid #e2dcd2;text-decoration:none;color:#1a1a1a}.tabs a.on{background:#1a1a1a;color:#fff}
.tag{display:inline-block;padding:2px 8px;border-radius:10px;background:#eee7dc;font-weight:600}.tag.ex{background:#dfeee4;color:#1d7a3a}.e-nuevo .tag:first-child{background:#D4541A;color:#fff}.e-pagado td:last-child .tag{background:#1d7a3a;color:#fff}.e-pago-pendiente td:last-child .tag{background:#E8A33C;color:#1a1a1a}.e-cancelado{opacity:.5}
.acts{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px;font-size:12px}</style></head><body><main>
<div class="top"><div><h1>K11 · Stock, precios y pedidos</h1><small>Stock en cajas. /order, /api/stock y /catalog.json lo muestran con hasta 1 min de demora.</small></div><nav><a href="/order" target="_blank">Ver /order</a><a href="/api/stock" target="_blank">/api/stock</a><a href="/api/panel?k=${k}">Panel mails</a></nav></div>
${banner}${q.ok ? `<div class="${String(q.ok).startsWith('Error') ? 'warn' : 'ok-msg'}">${esc(q.ok)}</div>` : ''}
<h2>Stock y precios</h2><div class="tw"><table><thead><tr><th>SKU</th><th>Producto</th><th>Disponible</th><th>Reservado</th><th>Pre-pedido</th><th>Ajustar (cajas)</th><th>Precio por caja (Stripe)</th></tr></thead><tbody>${stockRows}</tbody></table></div>
<p><small>El precio se guarda en Stripe (no se publica en la web). "Online" muestra el botón de pago en /order cuando hay stock. Facturas: se pueden pagar con tarjeta, ACH o transferencia bancaria (Stripe da los datos bancarios).</small></p>
<h2>Pedidos</h2><div class="tabs">${tabs}</div><div class="tw"><table><thead><tr><th>Ref</th><th>Cliente</th><th>Cajas</th><th>Pago / total</th><th>Estado y acciones</th></tr></thead><tbody>${ordRows}</tbody></table></div>
<p><small>Marcá "exento" antes de facturar solo si recibiste el certificado de reventa del cliente. Cancelar devuelve el stock reservado y anula la factura abierta.</small></p>
</main></body></html>`);
};
module.exports.config = { maxDuration: 30 };
