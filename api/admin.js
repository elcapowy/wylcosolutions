const { redis, leerEstado, D } = require('./_lib/core');
const T = require('./_lib/tienda');
const { stripe, precios, fijarPrecio, TAX, MODE } = require('./_lib/stripe');
const UI = require('./_lib/adminui');
const TOK = process.env.ADMIN_TOKEN;
const DASH = MODE === 'test' ? 'https://dashboard.stripe.com/test' : 'https://dashboard.stripe.com';
const CK = 'k11adm';

async function clienteStripe(o, c) {
  const addr = { line1: o.address || undefined, city: o.city || undefined, state: o.state || undefined, postal_code: o.zip || undefined, country: 'US' };
  const data = { email: o.email, name: o.company, phone: o.phone || undefined, address: addr, shipping: { name: o.company, address: addr }, tax_exempt: c && c.exento ? 'exempt' : 'none', metadata: { contact: o.contact || '', ein: o.ein || '' } };
  const id = (c && c.stripe_customer) || o.stripe_customer;
  return id ? stripe('customers/' + id, data) : stripe('customers', data);
}
async function crearFactura(o) {
  const pr = await precios(o.items.map(i => i.slug));
  const falta = o.items.filter(i => !pr[i.slug]).map(i => i.sku);
  if (falta.length) throw new Error('Falta precio en Stripe para: ' + falta.join(', ') + ' (cargalo en Stock)');
  const c = o.cliente ? await T.cliente(o.cliente) : null;
  const sc = await clienteStripe(o, c);
  o.stripe_customer = sc.id; if (c && c.stripe_customer !== sc.id) { c.stripe_customer = sc.id; await T.guardarCliente(c); }
  const inv = await stripe('invoices', {
    customer: sc.id, collection_method: 'send_invoice', days_until_due: 7, auto_advance: true, pending_invoice_items_behavior: 'exclude',
    automatic_tax: { enabled: TAX }, metadata: { ref: o.ref },
    description: `K11 order ${o.ref}` + (o.items.some(i => i.preorder) ? ' — includes pre-order items, ship when stock arrives' : ''),
    footer: 'Wylco LLC · Miami, FL · info@wylcosolutions.com · +1 (954) 881-8870',
    payment_settings: { payment_method_types: ['card', 'us_bank_account', 'customer_balance'], payment_method_options: { customer_balance: { funding_type: 'bank_transfer', bank_transfer: { type: 'us_bank_transfer' } } } }
  });
  for (const i of o.items) await stripe('invoiceitems', { customer: sc.id, invoice: inv.id, price: pr[i.slug].id, quantity: i.cases, description: `${i.sku} ${i.name} — ${i.cases} case(s)${i.preorder ? ` (${i.preorder} pre-order)` : ''}` });
  await stripe('invoices/' + inv.id + '/finalize', {});
  const s = await stripe('invoices/' + inv.id + '/send', {});
  Object.assign(o, { estado: 'confirmado', invoice: s.id, invoice_url: s.hosted_invoice_url, invoice_pdf: s.invoice_pdf, total: s.total / 100, tax: (s.tax || 0) / 100 });
  T.hist(o, `Factura ${s.number} enviada a ${o.email} · USD ${(s.total / 100).toFixed(2)}`);
  await T.guardarPedido(o);
  return s;
}

async function accion(b) {
  const a = b.a, s = b.s, P = T.BY[s];
  if (a === 'stock' && P) {
    const v = parseInt(b.v, 10); if (isNaN(v)) throw new Error('Ingresá una cantidad');
    if (b.modo === 'fijar') { await T.fijarStock(s, Math.max(0, v)); return `Inventario ${P.sku} = ${Math.max(0, v)} cajas`; }
    await T.sumarStock(s, v); return `${v > 0 ? '+' : ''}${v} cajas a ${P.sku}`;
  }
  if (a === 'precio' && P) {
    const v = parseFloat(String(b.v).replace(',', '.'));
    if (v > 0) { await fijarPrecio(P, v); await redis([['HSET', 'k11:online', s, '1']]); return `Precio ${P.sku} = USD ${v.toFixed(2)} por caja`; }
    await redis([['HDEL', 'k11:online', s]]); return `${P.sku}: venta online desactivada`;
  }
  if (a === 'online' && P) { await redis([b.v === '1' ? ['HSET', 'k11:online', s, '1'] : ['HDEL', 'k11:online', s]]); return `${P.sku}: ${b.v === '1' ? 'online' : 'solo factura'}`; }
  if (a === 'cliente') {
    const c = await T.cliente(b.id); if (!c) throw new Error('Cliente no encontrado');
    for (const k of ['company', 'contact', 'phone', 'address', 'city', 'state', 'zip', 'ein', 'business_type', 'notas']) if (b[k] != null) c[k] = String(b[k]).trim();
    const ex = b.exento === '1';
    if (ex !== !!c.exento) { c.exento = ex; if (c.stripe_customer) await stripe('customers/' + c.stripe_customer, { tax_exempt: ex ? 'exempt' : 'none' }).catch(() => {}); }
    await T.guardarCliente(c); return 'Cliente guardado' + (ex ? ' · exento de sales tax' : '');
  }
  if (a === 'nueva') {
    const datos = {}; for (const k of ['company', 'contact', 'email', 'phone', 'address', 'city', 'state', 'zip', 'business_type', 'ein', 'payment', 'notes']) datos[k] = String(b[k] || '').trim();
    datos.email = datos.email.toLowerCase();
    const items = T.PRODUCTS.map(p => ({ slug: p.slug, q: Math.max(0, parseInt(b['qty_' + p.slug], 10) || 0) })).filter(x => x.q);
    if (!datos.email || !datos.company) throw new Error('Falta empresa o email');
    if (!items.length) throw new Error('Cargá al menos una caja');
    const o = await T.crearVenta({ datos, items, origen: 'admin', estado: 'nuevo' });
    return { msg: `Venta ${o.ref} creada`, go: '/admin?v=venta&ref=' + o.ref };
  }
  const o = b.ref ? await T.pedido(b.ref) : null;
  if (!o) throw new Error('Acción desconocida');
  if (a === 'factura') { if (o.invoice) return 'Esta venta ya tiene factura'; const inv = await crearFactura(o); return `Factura ${inv.number} enviada a ${o.email}`; }
  if (a === 'estado' && UI.ESTADOS.includes(b.v)) {
    if (b.v === 'cancelado' && o.estado !== 'cancelado') { await T.devolverPedido(o); if (o.invoice) await stripe('invoices/' + o.invoice + '/void', {}).catch(() => {}); }
    o.estado = b.v; if (b.pago) o.payment = b.pago;
    T.hist(o, 'Estado → ' + b.v + (b.pago ? ' (' + b.pago + ')' : '') + (b.v === 'cancelado' ? ' · stock devuelto' + (o.invoice ? ' · factura anulada' : '') : ''));
    await T.guardarPedido(o); return `${o.ref} → ${b.v}`;
  }
  throw new Error('Acción desconocida');
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const html = s => { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.send(s); };
  const go = loc => { res.writeHead(303, { Location: loc }); res.end(); };
  const q = req.query || {};
  if (!TOK) return html(UI.login(false).replace('<h1>K11 Admin</h1>', '<h1>K11 Admin</h1><div class="flash err">Falta ADMIN_TOKEN en Vercel</div>'));
  if (q.salir) { res.setHeader('Set-Cookie', `${CK}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`); return go('/admin'); }
  if (q.k) {
    if (q.k !== TOK) return html(UI.login(true));
    res.setHeader('Set-Cookie', `${CK}=${encodeURIComponent(TOK)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`);
    const u = new URLSearchParams(q); u.delete('k'); return go('/admin' + (u.toString() ? '?' + u : ''));
  }
  const ck = (req.headers.cookie || '').match(new RegExp(CK + '=([^;]+)'));
  if (!ck || decodeURIComponent(ck[1]) !== TOK) return html(UI.login(false));

  if (req.method === 'POST') {
    let b = req.body || {}; if (typeof b === 'string') b = Object.fromEntries(new URLSearchParams(b));
    let back = '/admin';
    try { const r = new URL(req.headers.referer || ''); r.searchParams.delete('ok'); back = r.pathname + r.search; } catch {}
    let msg;
    try { const r = await accion(b); if (r && r.go) { back = r.go; msg = r.msg; } else msg = r; } catch (e) { msg = 'Error: ' + (e.message || e); }
    return go(back + (back.includes('?') ? '&' : '?') + 'ok=' + encodeURIComponent(msg));
  }

  const v = q.v || 'inicio';
  const [t, ps, cs, pr] = await Promise.all([T.leerTienda(), T.pedidos(), T.clientes(), precios(T.PRODUCTS.map(p => p.slug)).catch(e => ({ _err: e.message }))]);
  // alta automática de clientes de ventas viejas
  const ids = new Set(cs.map(c => c.id));
  for (const o of ps) if (o.email && !ids.has(T.cid(o.email))) { const c = await T.upsertCliente(o); cs.push(c); ids.add(c.id); }
  for (const o of ps) if (!o.cliente && o.email) { o.cliente = T.cid(o.email); await T.guardarPedido(o); }

  const sw = process.env.STRIPE_WEBHOOK_SECRET;
  const banner = MODE === 'off' ? '<div class="flash err">Stripe no conectado: falta STRIPE_SECRET_KEY en Vercel.</div>'
    : `<div class="mode"><span><span class="dot ${MODE === 'live' ? 'ok' : ''}"></span>Stripe <b>${MODE === 'test' ? 'modo prueba' : 'en vivo'}</b></span><span><span class="dot ${TAX ? 'ok' : 'no'}"></span>Tax <b>${TAX ? 'automático' : 'desactivado'}</b></span><span><span class="dot ${sw ? 'ok' : 'no'}"></span>Webhook <b>${sw ? 'configurado' : 'falta secreto'}</b></span>${pr._err ? `<span class="no">Stripe: ${UI.esc(pr._err)}</span>` : ''}<a href="${DASH}" target="_blank">Abrir Stripe ↗</a></div>`;
  const counts = { ventas: ps.filter(o => !['enviado', 'cancelado'].includes(o.estado)).length, clientes: cs.length, stock: t.reduce((a, p) => a + p.cases_available, 0), mails: '/api/panel?k=' + encodeURIComponent(TOK) };
  let body, title;
  if (v === 'venta') { const o = ps.find(x => x.ref === q.ref); title = q.ref; body = o ? UI.venta({ o, c: o.cliente && cs.find(c => c.id === o.cliente), mode: MODE, dash: DASH }) : '<h1>Venta no encontrada</h1>'; }
  else if (v === 'nueva') { title = 'Nueva venta'; body = UI.nueva({ t, cs: cs.slice().sort((a, b) => (a.company || '').localeCompare(b.company || '')), sel: q.id && cs.find(c => c.id === T.cid(q.id)) }); }
  else if (v === 'clientes') { title = 'Clientes'; body = UI.clientes({ cs, ps, q: q.q || '' }); }
  else if (v === 'cliente') { const c = cs.find(x => x.id === T.cid(q.id)); title = c ? c.company : 'Cliente'; body = c ? UI.cliente({ c, ps }) : '<h1>Cliente no encontrado</h1>'; }
  else if (v === 'stock') { title = 'Stock'; body = UI.stock({ t, pr, ps }); }
  else if (v === 'producto') { const p = t.find(x => x.slug === q.s); title = p ? p.sku : 'Producto'; body = p ? UI.producto({ p, price: pr[p.slug], ms: await T.movimientos(p.slug), ps }) : '<h1>Producto no encontrado</h1>'; }
  else if (v === 'ventas') { title = 'Ventas'; body = UI.ventas({ ps, f: q.f || 'activas', q: q.q || '' }); }
  else {
    let mail = null;
    try { const { est, stop } = await leerEstado(); const vals = Object.values(est); mail = { enviado: vals.filter(x => x.e === 'enviado').length, pendiente: D.rows.length - vals.length, bajas: Object.values(stop).filter(x => x === 'baja').length }; } catch {}
    title = 'Portal'; body = UI.inicio({ ps, cs, t, mail, k: TOK, dash: DASH });
  }
  html(UI.layout({ v, title, body, flash: q.ok, banner, counts }));
};
module.exports.config = { maxDuration: 30 };
