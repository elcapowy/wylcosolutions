const { redis, leerEstado, D } = require('./_lib/core');
const T = require('./_lib/tienda');
const { stripe, precios, fijarPrecio, TAX, MODE } = require('./_lib/stripe');
const UI = require('./_lib/adminui');
const S = require('./_lib/social');
const E = require('./_lib/envio');
const F = require('./_lib/finanzas');
const X = require('./_lib/extras');
const U2 = require('./_lib/adminui2');
const CO = require('./_lib/compras');
const M = require('./_lib/mejoras');
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
  const pct = await X.descuento(c, nc);
  if (pct > 0) { await stripe('invoiceitems', { customer: sc.id, invoice: inv.id, amount: -Math.round(sub * pct), currency: 'usd', tax_behavior: 'exclusive', description: `${c && (+c.desc_pct >= pct || await M.pctNivel(c) >= pct) ? 'Customer' : 'Volume'} discount ${pct}%` }); o.descuento = pct; }
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
  if (M.ACC.includes(a)) return M.accion(b);
  if (String(a).startsWith('compra_')) { const r = await CO.accion(b); if (r && r.cub && r.cub.length) await avisarCubiertos(r.cub); return r; }
  if (a === 'stock' && P) {
    const v = parseInt(b.v, 10); if (isNaN(v)) throw new Error('Ingresá una cantidad');
    const cub = b.modo === 'fijar' ? await T.fijarStock(s, Math.max(0, v)) : await T.sumarStock(s, v);
    const txt = cub && cub.length ? ` · asignadas a pre-pedidos: ${cub.map(x => x.ref + ' (' + x.cajas + ')').join(', ')}` : '';
    if (cub && cub.length) await avisarCubiertos(cub);
    return (b.modo === 'fijar' ? `Inventario ${P.sku} = ${Math.max(0, v)} cajas` : `${v > 0 ? '+' : ''}${v} cajas a ${P.sku}`) + txt;
  }
  if (a === 'reset') {
    if (String(b.conf || '').trim().toUpperCase() !== 'BORRAR') throw new Error('Escribí BORRAR para confirmar');
    const [ek] = await redis([['KEYS', 'k11:evt:*']]);
    const cmds = [['DEL', 'k11:pedidos'], ['DEL', 'k11:clientes'], ['DEL', 'k11:sess'], ['DEL', 'k11:mov']];
    if (b.stock === '1') cmds.push(['DEL', 'k11:stock']);
    for (const k of ek || []) cmds.push(['DEL', k]);
    await redis(cmds);
    return 'Datos borrados: ventas, clientes, sesiones y movimientos' + (b.stock === '1' ? ', stock en 0' : '') + '. Quedan precios, costos, venta online y envío.';
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
  if (a === 'minimo' && P) { const m = await X.cfg('minimo', {}); const v = parseInt(b.v, 10); if (v > 0) m[s] = v; else delete m[s]; await X.setCfg('minimo', m); return `${P.sku}: ${v > 0 ? 'aviso con menos de ' + v + ' cajas' : 'sin aviso'}`; }
  if (a === 'llegada' && P) { const m = await X.cfg('llegada', {}); if (b.borrar || !b.fecha) delete m[s]; else m[s] = { cajas: parseInt(b.cajas, 10) || 0, fecha: String(b.fecha).slice(0, 10) }; await X.setCfg('llegada', m); return `${P.sku}: ${m[s] ? 'embarque llega ' + m[s].fecha : 'sin embarque'}`; }
  if (a === 'desc_cfg') { const d = [0, 1, 2].map(i => ({ min: parseInt(b['min' + i], 10), pct: parseFloat(b['pct' + i]) })).filter(x => x.min > 0 && x.pct > 0).sort((x, y) => x.min - y.min); await X.setCfg('desc', d); return d.length ? 'Descuentos: ' + d.map(x => x.min + '+ cajas ' + x.pct + '%').join(' · ') : 'Sin descuento por volumen'; }
  if (a === 'gasto_add') { const g = await X.cfg('gastos', []); const m = parseFloat(String(b.monto).replace(',', '.')); if (!b.concepto || !(m >= 0)) throw new Error('Concepto y monto'); g.push({ concepto: String(b.concepto).slice(0, 60), monto: m }); await X.setCfg('gastos', g); return 'Gasto agregado'; }
  if (a === 'gasto_del') { const g = await X.cfg('gastos', []); g.splice(+b.i, 1); await X.setCfg('gastos', g); return 'Gasto quitado'; }
  if (a === 'desc_cli' || a === 'cert_ok') {
    const c = await T.cliente(b.id); if (!c) throw new Error('Cliente no encontrado');
    if (a === 'desc_cli') { const p = Math.min(50, Math.max(0, parseFloat(b.pct) || 0)); if (p) c.desc_pct = p; else delete c.desc_pct; await T.guardarCliente(c); return p ? `Descuento fijo ${p}%` : 'Sin descuento fijo'; }
    c.exento = true; if (c.cert) c.cert.estado = 'aprobado'; if (c.cert && c.cert.num && !c.ein) c.ein = c.cert.num;
    if (c.stripe_customer) await stripe('customers/' + c.stripe_customer, { tax_exempt: 'exempt' }).catch(() => {});
    await T.guardarCliente(c); try { await X.mail(c.id, c.lang === 'es' ? 'Certificado de reventa aprobado · K11' : 'Resale certificate approved · K11', (c.lang === 'es' ? 'Tu cuenta quedó exenta de sales tax para próximas compras.' : 'Your account is now sales-tax exempt for future orders.') + '\n\n' + X.portalUrl(c.id) + '\n\n— Wylco · K11 America'); } catch {}
    return 'Certificado aprobado · cliente exento';
  }
  if (a === 'newsletter') {
    const s0 = String(b.s || '').trim(), b0 = String(b.b || '').trim(); if (!s0 || !b0) throw new Error('Falta asunto o texto');
    const pie = e => `\n\n—\nMy orders & invoices: ${X.portalUrl(e)}\nUnsubscribe: ${X.portalUrl(e)}&baja=1`;
    if (b.prueba) { await X.mail(X.TO(), '[PRUEBA] ' + s0, b0.replace(/\{nombre\}/g, 'there') + pie(X.TO())); return 'Prueba enviada a ' + X.TO(); }
    const cs = (await T.clientes()).filter(c => c.id && !c.nomail); let n = 0;
    for (const c of cs) { try { await X.mail(c.id, s0, b0.replace(/\{nombre\}/g, (c.contact || '').split(' ')[0] || 'there') + pie(c.id)); n++; await new Promise(r => setTimeout(r, 550)); } catch {} }
    await X.setCfg('ultimo_mensual', { at: new Date().toISOString(), n, s: s0 }); return `Mail mensual enviado a ${n} cliente(s)`;
  }
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
  if (a === 'tracking') {
    o.carrier = String(b.carrier || 'UPS'); o.tracking = String(b.tracking || '').trim(); if (!o.tracking) throw new Error('Falta el número');
    if (o.estado !== 'enviado') { o.estado = 'enviado'; }
    T.hist(o, `Despachado por ${o.carrier} · ${o.tracking}`);
    if (b.avisar === '1' && await X.mailCliente(o, 'tracking')) { o.tracking_mail = true; T.hist(o, 'Mail de seguimiento enviado a ' + o.email); }
    await T.guardarPedido(o); return o.ref + ': enviado' + (o.tracking_mail ? ' · cliente avisado' : '');
  }
  if (a === 'listo') { if (await X.mailCliente(o, 'listo')) { T.hist(o, 'Aviso "listo para retirar" enviado'); await T.guardarPedido(o); return 'Cliente avisado'; } throw new Error('No se pudo mandar el mail'); }
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
    if (!M.rolDe(q.k)) return html(UI.login(true));
    res.setHeader('Set-Cookie', `${CK}=${encodeURIComponent(q.k)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`);
    const u = new URLSearchParams(q); u.delete('k'); return go('/admin' + (u.toString() ? '?' + u : ''));
  }
  const ck = (req.headers.cookie || '').match(new RegExp(CK + '=([^;]+)'));
  const rol = ck && M.rolDe(decodeURIComponent(ck[1]));
  if (!rol) return html(UI.login(false));

  // Limpieza única antes del lanzamiento: deja la base vacía (solo precios/costos/online/envío). Corre una sola vez.
  try {
    const [hecho] = await redis([['GET', 'k11:reset_lanzamiento']]);
    if (!hecho) {
      const [ek] = await redis([['KEYS', 'k11:evt:*']]);
      await redis([['DEL', 'k11:pedidos'], ['DEL', 'k11:clientes'], ['DEL', 'k11:sess'], ['DEL', 'k11:mov'], ['DEL', 'k11:stock'], ...(ek || []).map(k => ['DEL', k]), ['SET', 'k11:reset_lanzamiento', new Date().toISOString()]]);
    }
  } catch (e) { console.error('reset', e.message); }

  if (req.method === 'POST') {
    let b = req.body || {}; if (typeof b === 'string') b = Object.fromEntries(new URLSearchParams(b));
    let back = '/admin';
    try { const r = new URL(req.headers.referer || ''); r.searchParams.delete('ok'); back = r.pathname + r.search; } catch {}
    let msg;
    if (rol === 'deposito' && !M.depPuede(b)) { msg = 'Error: tu usuario (depósito) no puede hacer esto'; return go(back + (back.includes('?') ? '&' : '?') + 'ok=' + encodeURIComponent(msg)); }
    try { const r = await accion(b); if (r && r.go) { back = r.go; msg = r.msg; } else msg = r && typeof r === 'object' ? r.msg : r; } catch (e) { msg = 'Error: ' + (e.message || e); }
    await M.log({ rol, a: b.a, ref: b.ref, s: b.s, id: b.id, msg: String(msg || '').slice(0, 200), ip: String(req.headers['x-forwarded-for'] || '').split(',')[0] });
    return go(back + (back.includes('?') ? '&' : '?') + 'ok=' + encodeURIComponent(msg));
  }

  let v = q.v || 'inicio';
  if (rol === 'deposito' && !M.DEP_V.includes(v)) { if (v !== 'inicio') return go('/admin?v=ventas&f=pagado'); v = 'ventas'; q.f = q.f || 'pagado'; }
  if (v === 'backup') { const b = await M.backup(); res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Content-Disposition', `attachment; filename="k11-backup-${b.at.slice(0, 10)}.json"`); await M.log({ rol, a: 'backup_descarga', msg: b.keys + ' claves' }); return res.send(JSON.stringify(b)); }
  const [t, ps, cs, pr, coR] = await Promise.all([T.leerTienda(), T.pedidos(), T.clientes(), precios(T.PRODUCTS.map(p => p.slug)).catch(e => ({ _err: e.message })), redis([['HGETALL', 'k11:costo']]).catch(() => [null])]);
  const co = {}; { const x = coR && coR[0]; if (Array.isArray(x)) for (let j = 0; j < x.length; j += 2) co[x[j]] = +x[j + 1]; else if (x && typeof x === 'object') Object.assign(co, x); }
  { const auto = require('./_lib/precios').costoCaja(); for (const k in auto) if (!(co[k] > 0)) co[k] = auto[k]; } // costo real calculado si no se cargó a mano
  if (rol === 'deposito') for (const k in co) delete co[k]; // depósito no ve costos ni ganancia
  // alta automática de clientes de ventas viejas
  const ids = new Set(cs.map(c => c.id));
  for (const o of ps) if (o.email && !ids.has(T.cid(o.email))) { const c = await T.upsertCliente(o); cs.push(c); ids.add(c.id); }
  for (const o of ps) if (!o.cliente && o.email) { o.cliente = T.cid(o.email); await T.guardarPedido(o); }

  const sw = process.env.STRIPE_WEBHOOK_SECRET;
  const banner = MODE === 'off' ? '<div class="flash err">Stripe no conectado: falta STRIPE_SECRET_KEY en Vercel.</div>'
    : `<div class="mode"><span><span class="dot ${MODE === 'live' ? 'ok' : ''}"></span>Stripe <b>${MODE === 'test' ? 'modo prueba' : 'en vivo'}</b></span><span><span class="dot ${TAX ? 'ok' : 'no'}"></span>Tax <b>${TAX ? 'automático' : 'desactivado'}</b></span><span><span class="dot ${sw ? 'ok' : 'no'}"></span>Webhook <b>${sw ? 'configurado' : 'falta secreto'}</b></span>${pr._err ? `<span class="no">Stripe: ${UI.esc(pr._err)}</span>` : ''}<a href="${DASH}" target="_blank">Abrir Stripe ↗</a></div>`;
  const cps = await CO.lista().catch(() => []);
  const counts = { compras: cps.filter(c => ['borrador', 'pedido', 'en camino'].includes(c.estado)).length, ventas: ps.filter(o => !['enviado', 'cancelado'].includes(o.estado)).length, clientes: cs.length, stock: t.reduce((a, p) => a + p.cases_available, 0), mails: rol === 'admin' ? '/api/panel?k=' + encodeURIComponent(TOK) : '/admin', rol };
  let body, title;
  if (v === 'venta') { const o = ps.find(x => x.ref === q.ref); title = q.ref; const env = await E.config(); body = o ? UI.venta({ o, env, co, c: o.cliente && cs.find(c => c.id === o.cliente), mode: MODE, dash: DASH }) + U2.despacho(o) + M.envioCard(o) : '<h1>Venta no encontrada</h1>'; }
  else if (v === 'venta_envio') { const o = ps.find(x => x.ref === q.ref); title = 'Envío ' + (q.ref || ''); body = o ? await M.vCotizar(o) : '<h1>Venta no encontrada</h1>'; }
  else if (v === 'sistema') { title = 'Sistema'; const [C, L, niv, org, cj] = await Promise.all([M.chequeo({ MODE, TAX, t, pr, ps }), M.logs(), X.cfg('niveles', {}), X.cfg('origen', null), M.cajasEnvio()]); body = M.vSistema({ C, L, niv, org, cj }); }
  else if (v === 'nueva') { title = 'Nueva venta'; body = UI.nueva({ t, cs: cs.slice().sort((a, b) => (a.company || '').localeCompare(b.company || '')), sel: q.id && cs.find(c => c.id === T.cid(q.id)), rep: q.rep && ps.find(o => o.ref === q.rep) }); }
  else if (v === 'clientes') { title = 'Clientes'; body = UI.clientes({ cs, ps, q: q.q || '' }) + U2.mensual({ cs, borrador: U2.borradorMensual({ t, lleg: await X.cfg('llegada', {}), mes: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'America/New_York' }) }) }); }
  else if (v === 'cliente') { const c = cs.find(x => x.id === T.cid(q.id)); title = c ? c.company : 'Cliente'; body = c ? UI.cliente({ c, ps }) + U2.clienteExtra(c, ps) + M.nivelForm(c, await X.cfg('niveles', {})) : '<h1>Cliente no encontrado</h1>'; }
  else if (v === 'stock') { title = 'Stock'; body = UI.stock({ t, pr, ps, co, env: await E.config() }) + U2.stockCfg({ t, min: await X.cfg('minimo', {}), lleg: await X.cfg('llegada', {}), desc: await X.cfg('desc', []) }) + M.vReorden(await M.reorden(t, ps)); }
  else if (v === 'producto') { const p = t.find(x => x.slug === q.s); title = p ? p.sku : 'Producto'; body = p ? UI.producto({ p, price: pr[p.slug], ms: await T.movimientos(p.slug), ps }) : '<h1>Producto no encontrado</h1>'; }
  else if (v === 'redes') { title = 'Redes'; const ms = S.meses(); const ym = ms.includes(q.m) ? q.m : (ms.includes('2026-11') ? '2026-11' : ms[0]); const [m, conn, al] = await Promise.all([S.mes(ym), S.conectadas(), S.aliados()]); body = UI.redes({ aliados: al, m, meses: ms, conn, hasKey: !!S.KEY, NETS: S.NETS, IMG_NETS: S.IMG_NETS, seller: S.SELLER.es }); }
  else if (v === 'finanzas') {
    if (q.csv) { res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', `attachment; filename="k11-finanzas-${q.p || 'todo'}.csv"`); return res.send(F.csv({ ps, co, pr, p: q.p, gastos: await X.cfg('gastos', []) })); }
    title = 'Finanzas'; body = F.render({ ps, co, pr, t, p: q.p || 'todo', gastos: await X.cfg('gastos', []) });
  }
  else if (v === 'compras') { title = 'Compras'; body = CO.vLista(cps); }
  else if (v === 'compra') { const c = cps.find(x => x.id === q.id); title = c ? c.nombre : 'Compra'; body = c ? CO.vDetalle(c, Object.fromEntries(t.map(p => [p.slug, p.cases_available]))) : '<p>No encontrado. <a href="/admin?v=compras">Volver</a></p>'; }
  else if (v === 'ventas') { title = 'Ventas'; body = UI.ventas({ ps, co, f: q.f || 'activas', q: q.q || '' }); }
  else {
    let mail = null;
    try { const { est, stop } = await leerEstado(); const vals = Object.values(est); mail = { enviado: vals.filter(x => x.e === 'enviado').length, pendiente: D.rows.length - vals.length, bajas: Object.values(stop).filter(x => x === 'baja').length }; } catch {}
    title = 'Portal'; body = UI.inicio({ ps, cs, t, mail, k: TOK, dash: DASH });
  }
  let out = UI.layout({ v, title, body, flash: q.ok, banner: rol === 'deposito' ? '' : banner, counts });
  if (rol === 'deposito') out = out.replace(/<a class="(?:new|btn)[^"]*" href="\/admin\?v=nueva[^"]*">[^<]*<\/a>/g, '').replace(/<a class="kpi" href="\/admin\?v=finanzas[^"]*">[\s\S]*?<\/a>/g, '').replace(/<a class="kpi"[^>]*>\s*<div class="l">Ganancia[\s\S]*?<\/a>/g, '').replace(/<div class="kpi">\s*<div class="l">Ganancia[\s\S]*?<\/div><\/div>/g, '');
  html(out);
};
module.exports.config = { maxDuration: 30, api: { bodyParser: { sizeLimit: '6mb' } } };
