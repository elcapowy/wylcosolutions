const { redis, leerEstado, D } = require('./_lib/core');
const T = require('./_lib/tienda');
const { stripe, precios, fijarPrecio, TAX, MODE } = require('./_lib/stripe');
const UI = require('./_lib/adminui');
const S = require('./_lib/social');
const E = require('./_lib/envio');
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
  const cfg = await E.config(), sub = o.items.reduce((a, i) => a + pr[i.slug].unit_amount * i.cases, 0) / 100, nc = o.items.reduce((a, i) => a + i.cases, 0);
  const fl = o.flete_manual != null ? +o.flete_manual : E.flete(cfg, sub, nc, o.retiro);
  for (const i of o.items) await stripe('invoiceitems', { customer: sc.id, invoice: inv.id, price: pr[i.slug].id, quantity: i.cases, description: `${i.sku} ${i.name} — ${i.cases} case(s)${i.preorder ? ` (${i.preorder} pre-order)` : ''}` });
  if (fl > 0) await stripe('invoiceitems', { customer: sc.id, invoice: inv.id, amount: Math.round(fl * 100), currency: 'usd', tax_code: 'txcd_92010001', tax_behavior: 'exclusive', description: `Ground shipping — ${nc} case(s) (free on orders $${cfg.gratis.toLocaleString('en-US')}+)` });
  else if (!o.retiro) await stripe('invoiceitems', { customer: sc.id, invoice: inv.id, amount: 0, currency: 'usd', description: `Shipping — free (order over $${cfg.gratis.toLocaleString('en-US')})` });
  else await stripe('invoiceitems', { customer: sc.id, invoice: inv.id, amount: 0, currency: 'usd', description: 'Pickup in Miami — no shipping charge' });
  o.flete = fl;
  await stripe('invoices/' + inv.id + '/finalize', {});
  const s = await stripe('invoices/' + inv.id + '/send', {});
  Object.assign(o, { estado: 'confirmado', invoice: s.id, invoice_url: s.hosted_invoice_url, invoice_pdf: s.invoice_pdf, total: s.total / 100, tax: (s.tax || 0) / 100 });
  T.hist(o, `Factura ${s.number} enviada a ${o.email} · USD ${(s.total / 100).toFixed(2)}`);
  await T.guardarPedido(o);
  return s;
}

async function avisarCubiertos(cub) {
  const to = process.env.ORDER_TO || 'info@wylcosolutions.com';
  const body = cub.map(x => `${x.ref} · ${x.company} · ${x.cajas} caja(s) ${x.sku}${x.listo ? ' · COMPLETO, listo para despachar' : ' · todavía falta stock'}\nhttps://wylcosolutions.com/admin?v=venta&ref=${x.ref}`).join('\n\n');
  try { const { enviar } = require('./_lib/core'); await enviar(to, `[K11] Stock asignado a ${cub.length} pre-pedido(s)`, body); } catch {}
}
async function accion(b) {
  const a = b.a, s = b.s, P = T.BY[s];
  if (a === 'stock' && P) {
    const v = parseInt(b.v, 10); if (isNaN(v)) throw new Error('Ingresá una cantidad');
    const cub = b.modo === 'fijar' ? await T.fijarStock(s, Math.max(0, v)) : await T.sumarStock(s, v);
    const txt = cub && cub.length ? ` · asignadas a pre-pedidos: ${cub.map(x => x.ref + ' (' + x.cajas + ')').join(', ')}` : '';
    if (cub && cub.length) await avisarCubiertos(cub);
    return (b.modo === 'fijar' ? `Inventario ${P.sku} = ${Math.max(0, v)} cajas` : `${v > 0 ? '+' : ''}${v} cajas a ${P.sku}`) + txt;
  }
  if (a === 'envio_cfg') {
    const c = parseFloat(String(b.caja).replace(',', '.')), g = parseFloat(String(b.gratis).replace(',', '.'));
    if (!(c >= 0) || !(g > 0)) throw new Error('Cargá tarifa por caja y monto para envío gratis');
    await E.guardar(c, g); return `Envío: USD ${c.toFixed(2)} por caja · gratis desde USD ${g.toFixed(0)}`;
  }
  if (a === 'costo' && P) {
    const v = parseFloat(String(b.v).replace(',', '.'));
    if (v > 0) { await redis([['HSET', 'k11:costo', s, String(v)]]); return `Costo ${P.sku} = USD ${v.toFixed(2)} por caja`; }
    await redis([['HDEL', 'k11:costo', s]]); return `${P.sku}: costo borrado`;
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
  if (a === 'aliados') { const l = await S.guardarAliados(b.txt); return 'Lista guardada · ' + l.filter(x => x.estado === 'ok').length + ' cuentas se mencionan'; }
  if (a === 'socm_ok') { const m = await S.aprobarMes(b.ym); const e = m.posts.filter(p => p.estado === 'error'); return e.length ? 'Error en ' + e.length + ' post(s): ' + e[0].err : 'Mes aprobado: ' + m.posts.filter(p => p.estado === 'programado').length + ' posts programados'; }
  if (a === 'socm_cancel') { await S.cancelarMes(b.ym); return 'Aprobación del mes cancelada'; }
  if (a === 'socm_regen') { await S.regenerarMes(b.ym); return 'Mes regenerado'; }
  if (a === 'socm_edit') { await S.editarPost(b.ym, +b.i, b.text, S.IMG_NETS.filter(n => b['net_' + n]), b.off === '1'); return 'Post guardado'; }
  const o = b.ref ? await T.pedido(b.ref) : null;
  if (!o) throw new Error('Acción desconocida');
  if (a === 'envio') {
    const v = parseFloat(String(b.costo || '').replace(',', '.'));
    o.envio_costo = v >= 0 ? v : null; if (o.envio_costo == null) delete o.envio_costo;
    if (!o.invoice && o.origen !== 'stripe') { o.retiro = b.retiro === '1'; const m = String(b.flete_manual || '').trim(); if (m === '') delete o.flete_manual; else o.flete_manual = Math.max(0, parseFloat(m.replace(',', '.')) || 0); }
    T.hist(o, 'Envío: ' + (o.retiro ? 'retiro en Miami' : 'despacho') + (o.envio_costo != null ? ` · costo USD ${o.envio_costo.toFixed(2)}` : '') + (o.flete_manual != null ? ` · flete cobrado USD ${o.flete_manual.toFixed(2)} (manual)` : ''));
    await T.guardarPedido(o); return o.ref + ': envío guardado';
  }
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
  const [t, ps, cs, pr, coR] = await Promise.all([T.leerTienda(), T.pedidos(), T.clientes(), precios(T.PRODUCTS.map(p => p.slug)).catch(e => ({ _err: e.message })), redis([['HGETALL', 'k11:costo']]).catch(() => [null])]);
  const co = {}; { const x = coR && coR[0]; if (Array.isArray(x)) for (let j = 0; j < x.length; j += 2) co[x[j]] = +x[j + 1]; else if (x && typeof x === 'object') Object.assign(co, x); }
  // alta automática de clientes de ventas viejas
  const ids = new Set(cs.map(c => c.id));
  for (const o of ps) if (o.email && !ids.has(T.cid(o.email))) { const c = await T.upsertCliente(o); cs.push(c); ids.add(c.id); }
  for (const o of ps) if (!o.cliente && o.email) { o.cliente = T.cid(o.email); await T.guardarPedido(o); }

  const sw = process.env.STRIPE_WEBHOOK_SECRET;
  const banner = MODE === 'off' ? '<div class="flash err">Stripe no conectado: falta STRIPE_SECRET_KEY en Vercel.</div>'
    : `<div class="mode"><span><span class="dot ${MODE === 'live' ? 'ok' : ''}"></span>Stripe <b>${MODE === 'test' ? 'modo prueba' : 'en vivo'}</b></span><span><span class="dot ${TAX ? 'ok' : 'no'}"></span>Tax <b>${TAX ? 'automático' : 'desactivado'}</b></span><span><span class="dot ${sw ? 'ok' : 'no'}"></span>Webhook <b>${sw ? 'configurado' : 'falta secreto'}</b></span>${pr._err ? `<span class="no">Stripe: ${UI.esc(pr._err)}</span>` : ''}<a href="${DASH}" target="_blank">Abrir Stripe ↗</a></div>`;
  const counts = { ventas: ps.filter(o => !['enviado', 'cancelado'].includes(o.estado)).length, clientes: cs.length, stock: t.reduce((a, p) => a + p.cases_available, 0), mails: '/api/panel?k=' + encodeURIComponent(TOK) };
  let body, title;
  if (v === 'venta') { const o = ps.find(x => x.ref === q.ref); title = q.ref; const env = await E.config(); body = o ? UI.venta({ o, env, co, c: o.cliente && cs.find(c => c.id === o.cliente), mode: MODE, dash: DASH }) : '<h1>Venta no encontrada</h1>'; }
  else if (v === 'nueva') { title = 'Nueva venta'; body = UI.nueva({ t, cs: cs.slice().sort((a, b) => (a.company || '').localeCompare(b.company || '')), sel: q.id && cs.find(c => c.id === T.cid(q.id)) }); }
  else if (v === 'clientes') { title = 'Clientes'; body = UI.clientes({ cs, ps, q: q.q || '' }); }
  else if (v === 'cliente') { const c = cs.find(x => x.id === T.cid(q.id)); title = c ? c.company : 'Cliente'; body = c ? UI.cliente({ c, ps }) : '<h1>Cliente no encontrado</h1>'; }
  else if (v === 'stock') { title = 'Stock'; body = UI.stock({ t, pr, ps, co, env: await E.config() }); }
  else if (v === 'producto') { const p = t.find(x => x.slug === q.s); title = p ? p.sku : 'Producto'; body = p ? UI.producto({ p, price: pr[p.slug], ms: await T.movimientos(p.slug), ps }) : '<h1>Producto no encontrado</h1>'; }
  else if (v === 'redes') { title = 'Redes'; const ms = S.meses(); const ym = ms.includes(q.m) ? q.m : (ms.includes('2026-11') ? '2026-11' : ms[0]); const [m, conn, al] = await Promise.all([S.mes(ym), S.conectadas(), S.aliados()]); body = UI.redes({ aliados: al, m, meses: ms, conn, hasKey: !!S.KEY, NETS: S.NETS, IMG_NETS: S.IMG_NETS, seller: S.SELLER.es }); }
  else if (v === 'ventas') { title = 'Ventas'; body = UI.ventas({ ps, co, f: q.f || 'activas', q: q.q || '' }); }
  else {
    let mail = null;
    try { const { est, stop } = await leerEstado(); const vals = Object.values(est); mail = { enviado: vals.filter(x => x.e === 'enviado').length, pendiente: D.rows.length - vals.length, bajas: Object.values(stop).filter(x => x === 'baja').length }; } catch {}
    title = 'Portal'; body = UI.inicio({ ps, cs, t, mail, k: TOK, dash: DASH });
  }
  html(UI.layout({ v, title, body, flash: q.ok, banner, counts }));
};
module.exports.config = { maxDuration: 30 };
