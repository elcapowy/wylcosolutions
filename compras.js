// Compras / importaciones: pedidos a fábrica con mix de productos, costos reales del embarque y recepción en stock.
// Redis: k11:compras (id → JSON), k11:compras_n (contador). Al recibir: suma stock (cubre pre-pedidos) y actualiza k11:costo con promedio ponderado.
const { redis } = require('./core');
const T = require('./tienda');
const X = require('./extras');
const P = require('./precios');
const { esc } = require('./adminui');

const K = [['freight', 'Flete México → Miami'], ['mxbroker', 'Despacho de exportación MX'], ['ins', 'Seguro de carga'], ['duty', 'Aranceles (MFN + Sección 301)'], ['mpf', 'Tasa MPF'], ['usbroker', 'Despachante EE. UU.'], ['bond', 'Bono de aduana'], ['whs', 'Recepción y almacenaje Miami'], ['otros', 'Otros']];
const EST = ['borrador', 'pedido', 'en camino', 'recibido', 'cancelado'];
const ESTL = { borrador: 'Borrador', pedido: 'Pedido a fábrica', 'en camino': 'En camino', recibido: 'Recibido', cancelado: 'Cancelado' };
const usd = (n, d = 2) => (n < 0 ? '−' : '') + 'USD ' + Math.abs(+n || 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const num = v => { const x = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(x) ? x : null; };
const dia = s => s ? new Date(s.length === 10 ? s + 'T12:00:00Z' : s).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—';
const H = (a, ex = {}) => `<input type="hidden" name="a" value="${a}">` + Object.entries(ex).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join('');

// ── datos ──
async function lista() {
  const [h] = await redis([['HGETALL', 'k11:compras']]); const out = [];
  if (Array.isArray(h)) for (let i = 0; i < h.length; i += 2) { try { out.push(JSON.parse(h[i + 1])); } catch {} }
  else if (h && typeof h === 'object') for (const v of Object.values(h)) { try { out.push(JSON.parse(v)); } catch {} }
  return out.sort((a, b) => b.n - a.n);
}
async function una(id) { const [x] = await redis([['HGET', 'k11:compras', id]]); return x ? JSON.parse(x) : null; }
const guardar = c => redis([['HSET', 'k11:compras', c.id, JSON.stringify(c)]]);
const hist = (c, txt) => { (c.hist = c.hist || []).unshift({ at: new Date().toISOString(), txt }); };

// ── cálculo: reparte los costos del embarque según valor de fábrica ──
function calc(c) {
  const sku = P.SKU.map(s => { const it = (c.items || []).find(i => i.slug === s.slug) || {}; return { ...s, c: it.c != null ? +it.c : s.c }; });
  const q = sku.map(s => +(((c.items || []).find(i => i.slug === s.slug) || {}).cases) || 0);
  const E = P.calcular({ q }, sku);
  const est = Object.fromEntries(K.map(([k], i) => [k, i < 8 ? E.C[i][1] : 0]));
  const real = c.costos || {};
  const costo = Object.fromEntries(K.map(([k]) => [k, real[k] != null ? +real[k] : est[k]]));
  const imp = Object.values(costo).reduce((a, v) => a + v, 0), V = E.V, f = V ? imp / V : 0;
  const rows = E.rows.filter(r => r.cases > 0).map(r => {
    const land = r.c * (1 + f), lc = land * r.u, venta = r.p * r.units;
    return { ...r, land, lc, venta, gan: venta - land * r.units, mg: r.p ? (r.p - land) / r.p : 0 };
  });
  const cajas = rows.reduce((a, r) => a + r.cases, 0), unidades = rows.reduce((a, r) => a + r.units, 0), venta = rows.reduce((a, r) => a + r.venta, 0);
  return { rows, est, costo, real, imp, V, f, total: V + imp, cajas, unidades, venta, gan: venta - V - imp, faltan: K.filter(([k]) => real[k] == null && est[k] > 0).length };
}

// ── acciones (a = compra_*) ──
async function accion(b) {
  const a = b.a;
  if (a === 'compra_nueva') {
    const [n] = await redis([['INCR', 'k11:compras_n']]);
    const base = b.copiar ? await una(b.copiar) : null;
    const c = { id: 'P' + n, n: +n, nombre: 'Pedido ' + n, at: new Date().toISOString(), estado: 'borrador', proveedor: base ? base.proveedor : 'K11 México',
      items: base ? base.items.map(i => ({ slug: i.slug, cases: i.cases, c: i.c })) : P.SKU.map((s, i) => ({ slug: s.slug, cases: P.DEF.q[i] || 0, c: s.c })), costos: {} };
    hist(c, base ? 'Creado copiando ' + base.nombre : 'Creado'); await guardar(c);
    return { go: '/admin?v=compra&id=' + c.id, msg: c.nombre + ' creado' };
  }
  if (a === 'compra_reset') {
    if (String(b.ok || '').trim().toUpperCase() !== 'BORRAR') throw new Error('Escribí BORRAR para confirmar');
    const cs = await lista(); for (const c of cs) await limpiarLlegada(c);
    const cmd = [['DEL', 'k11:compras'], ['DEL', 'k11:compras_n']];
    if (b.stock === '1') cmd.push(['DEL', 'k11:stock'], ['DEL', 'k11:costo'], ['DEL', 'k11:mov']);
    await redis(cmd);
    return { go: '/admin?v=compras', msg: cs.length + ' compra(s) borrada(s)' + (b.stock === '1' ? ' · stock y costos en cero' : '') + ' · el próximo es Pedido 1' };
  }
  const c = await una(b.id); if (!c) throw new Error('Pedido no encontrado');
  const lock = () => { if (c.estado === 'recibido') throw new Error('Ya se recibió: no se puede cambiar'); };
  if (a === 'compra_datos') {
    for (const k of ['nombre', 'proveedor', 'factura', 'eta', 'notas']) if (b[k] != null) c[k] = String(b[k]).slice(0, k === 'notas' ? 1000 : 80).trim();
    const pg = num(b.pago); c.pago = pg; c.pago_fecha = String(b.pago_fecha || '').slice(0, 10);
    await guardar(c); return 'Datos guardados';
  }
  if (a === 'compra_items') {
    lock();
    c.items = P.SKU.map(s => ({ slug: s.slug, cases: Math.max(0, parseInt(b['q_' + s.slug], 10) || 0), c: num(b['c_' + s.slug]) ?? s.c })).filter(i => i.cases > 0);
    hist(c, 'Mix: ' + c.items.map(i => i.cases + ' × ' + T.BY[i.slug].sku).join(', ')); await guardar(c);
    if (c.estado === 'en camino') await marcarLlegada(c);
    return 'Mix guardado · ' + c.items.reduce((x, i) => x + i.cases, 0) + ' cajas';
  }
  if (a === 'compra_costos') {
    const r = {}; for (const [k] of K) { const v = num(b['k_' + k]); if (v != null && String(b['k_' + k]).trim() !== '') r[k] = v; }
    c.costos = r; hist(c, 'Costos reales cargados (' + Object.keys(r).length + '/' + K.length + ')'); await guardar(c); return 'Costos guardados';
  }
  if (a === 'compra_estado' && EST.includes(b.v) && b.v !== 'recibido') {
    lock(); c.estado = b.v; if (b.eta) c.eta = String(b.eta).slice(0, 10);
    hist(c, 'Estado → ' + ESTL[b.v] + (b.v === 'en camino' && c.eta ? ' · llega ' + c.eta : ''));
    await guardar(c); if (b.v === 'en camino') await marcarLlegada(c); if (b.v === 'cancelado') await limpiarLlegada(c);
    return c.nombre + ': ' + ESTL[b.v];
  }
  if (a === 'compra_recibir') {
    lock(); const k = calc(c), cub = [], rec = [];
    const st = await redis(k.rows.map(r => ['HGET', 'k11:stock', r.slug]).concat(k.rows.map(r => ['HGET', 'k11:costo', r.slug])));
    const n = k.rows.length, auto = P.costoCaja();
    for (let i = 0; i < n; i++) {
      const r = k.rows[i], got = Math.max(0, parseInt(b['r_' + r.slug], 10) || 0); if (!got) continue;
      const antes = Math.max(0, parseInt(st[i] || '0', 10) || 0), cAnt = +st[n + i] > 0 ? +st[n + i] : auto[r.slug];
      // costo por caja del lote: si llegaron menos cajas, el costo del embarque se reparte entre las que llegaron
      const lc = (r.lc * r.cases) / got;
      const prom = antes > 0 ? (antes * cAnt + got * lc) / (antes + got) : lc;
      await redis([['HSET', 'k11:costo', r.slug, prom.toFixed(2)]]);
      cub.push(...(await T.sumarStock(r.slug, got, c.nombre)));
      rec.push({ slug: r.slug, pedidas: r.cases, cases: got, lc: +lc.toFixed(2), costo_nuevo: +prom.toFixed(2) });
    }
    if (!rec.length) throw new Error('No cargaste cajas recibidas');
    c.estado = 'recibido'; c.recibido = { at: new Date().toISOString(), items: rec };
    hist(c, 'Recibido: ' + rec.map(x => x.cases + '/' + x.pedidas + ' × ' + T.BY[x.slug].sku).join(', ') + ' · stock y costos actualizados');
    await guardar(c); await limpiarLlegada(c);
    return { msg: c.nombre + ' recibido · +' + rec.reduce((x, r) => x + r.cases, 0) + ' cajas en stock' + (cub.length ? ' · ' + cub.length + ' pre-pedido(s) cubierto(s)' : ''), cub };
  }
  if (a === 'compra_borrar') { if (c.estado === 'recibido' && String(b.ok || '').toUpperCase() !== 'BORRAR') throw new Error('Pedido recibido: escribí BORRAR para confirmar'); await limpiarLlegada(c); await redis([['HDEL', 'k11:compras', c.id]]); return { go: '/admin?v=compras', msg: c.nombre + ' borrado' }; }
  throw new Error('Acción desconocida');
}
async function marcarLlegada(c) { if (!c.eta) return; const m = await X.cfg('llegada', {}); for (const i of c.items) m[i.slug] = { cajas: i.cases, fecha: c.eta, compra: c.id }; await X.setCfg('llegada', m); }
async function limpiarLlegada(c) { const m = await X.cfg('llegada', {}); let ch = 0; for (const i of c.items || []) if (m[i.slug] && (!m[i.slug].compra || m[i.slug].compra === c.id)) { delete m[i.slug]; ch = 1; } if (ch) await X.setCfg('llegada', m); }

// ── vistas ──
const tagE = e => `<span class="tag ${e === 'recibido' ? 't-ok' : e === 'en camino' ? 't-pre' : ''}">${ESTL[e] || e}</span>`;
function vLista(cs) {
  const ab = cs.filter(c => ['pedido', 'en camino'].includes(c.estado)), K2 = cs.map(c => ({ c, k: calc(c) }));
  const enCamino = K2.filter(x => ['pedido', 'en camino'].includes(x.c.estado)).reduce((a, x) => a + x.k.total, 0);
  const inv = K2.filter(x => x.c.estado === 'recibido').reduce((a, x) => a + x.k.total, 0);
  const rows = K2.map(({ c, k }) => `<tr data-href="/admin?v=compra&id=${c.id}"><td><strong>${esc(c.nombre)}</strong><br><small class="m">${dia(c.at)}${c.factura ? ' · fact. ' + esc(c.factura) : ''}</small></td><td>${tagE(c.estado)}</td>
<td>${k.rows.map(r => `${r.cases} × ${esc(r.id)}`).join('<br>') || '<span class="mut">sin productos</span>'}</td><td class="r num">${k.cajas}</td><td class="r num">${usd(k.V, 0)}</td><td class="r num">${usd(k.imp, 0)}<br><small class="m">${(k.f * 100).toFixed(1)}%${k.faltan ? ' · estimado' : ''}</small></td><td class="r num"><strong>${usd(k.total, 0)}</strong></td><td>${c.estado === 'recibido' ? dia(c.recibido.at) : c.eta ? 'llega ' + dia(c.eta) : '—'}</td></tr>`).join('');
  return `<div style="display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap;margin-bottom:16px"><div><h1>Compras</h1><p class="mut" style="margin:4px 0 0">Pedidos a fábrica con mix de productos, costos del embarque y recepción en stock.</p></div>
<form method="post">${H('compra_nueva')}<button>+ Nuevo pedido</button></form></div>
<div class="kpis"><div class="kpi"><div class="l">Pedidos abiertos</div><div class="n">${ab.length}</div></div><div class="kpi"><div class="l">En camino / pedido</div><div class="n">${usd(enCamino, 0)}</div></div><div class="kpi"><div class="l">Invertido (recibido)</div><div class="n">${usd(inv, 0)}</div></div></div>
<details class="card pad" style="margin-bottom:16px"><summary style="cursor:pointer;font-weight:700">Borrar compras de prueba</summary>
<form method="post" style="display:grid;gap:10px;margin-top:12px" onsubmit="return confirm('¿Borrar TODAS las compras? No se puede deshacer.')">${H('compra_reset')}
<label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" name="stock" value="1" checked>También poner stock, costos por caja y movimientos en cero (lo que sumaron las compras de prueba)</label>
<label>Escribí BORRAR para confirmar<input name="ok" required autocomplete="off" style="max-width:200px"></label><div><button class="danger">Borrar todas las compras</button></div></form>
<p class="mut" style="font-size:12px;margin:8px 0 0">No toca ventas, clientes, precios de Stripe ni envío. La numeración vuelve a Pedido 1.</p></details>
<div class="card tw"><table><thead><tr><th>Pedido</th><th>Estado</th><th>Mix</th><th class="r">Cajas</th><th class="r">Fábrica</th><th class="r">Importación</th><th class="r">Total</th><th>Llegada</th></tr></thead><tbody>${rows || '<tr><td colspan="8" class="mut">Todavía no hay pedidos. Creá el Pedido 1 con el botón de arriba.</td></tr>'}</tbody></table></div>`;
}
function vDetalle(c, stock = {}) {
  const k = calc(c), rx = c.estado === 'recibido', ed = !rx;
  const mix = P.SKU.map(s => { const it = (c.items || []).find(i => i.slug === s.slug) || {}, r = k.rows.find(x => x.slug === s.slug);
    return `<tr><td><strong>${esc(s.n)}</strong><br><small class="m">${esc(s.id)} · ${s.u} un./caja · stock ${stock[s.slug] || 0}</small></td>
<td class="r">${ed ? `<input class="sm" type="number" min="0" name="q_${s.slug}" value="${it.cases || 0}">` : (it.cases || 0)}</td>
<td class="r">${ed ? `<input class="sm" type="number" step="0.01" min="0" name="c_${s.slug}" value="${(it.c != null ? +it.c : s.c).toFixed(2)}">` : usd(it.c)}</td>
<td class="r num">${r ? usd(r.exw, 0) : '—'}</td><td class="r num">${r ? usd(r.land) : '—'}</td><td class="r num"><strong>${r ? usd(r.lc) : '—'}</strong></td><td class="r num">${r ? usd(s.p) : '—'}</td><td class="r num">${r ? `<span style="color:${r.mg < 0.3 ? '#B3261E' : 'var(--g)'}">${(r.mg * 100).toFixed(1)}%</span>` : '—'}</td></tr>`; }).join('');
  const cost = K.map(([key, l]) => `<tr><td>${l}</td><td class="r num mut">${usd(k.est[key])}</td><td class="r">${`<input class="sm" style="width:120px" type="number" step="0.01" min="0" name="k_${key}" value="${k.real[key] != null ? k.real[key] : ''}" placeholder="${k.est[key].toFixed(2)}">`}</td><td class="r num">${usd(k.costo[key])}</td></tr>`).join('');
  const rec = rx ? `<div class="card pad"><h2>Recepción · ${dia(c.recibido.at)}</h2><table style="min-width:0"><thead><tr><th>Producto</th><th class="r">Pedidas</th><th class="r">Llegaron</th><th class="r">Costo/caja del lote</th><th class="r">Costo/caja nuevo (promedio)</th></tr></thead><tbody>${c.recibido.items.map(x => `<tr><td>${esc(T.BY[x.slug].sku)}</td><td class="r num">${x.pedidas}</td><td class="r num">${x.cases}</td><td class="r num">${usd(x.lc)}</td><td class="r num"><strong>${usd(x.costo_nuevo)}</strong></td></tr>`).join('')}</tbody></table></div>`
    : c.estado === 'cancelado' ? '' : `<div class="card pad"><h2>Recibir en Miami</h2><p class="mut" style="margin:0 0 10px;font-size:13px">Cargá las cajas que llegaron. Se suman al stock y se cubren los pre-pedidos. Además, el costo por caja de cada producto pasa a ser el promedio entre el stock que ya tenías y este lote. Antes de recibir, cargá los costos reales.</p>
<form method="post" style="display:grid;gap:10px" onsubmit="return confirm('¿Recibir y sumar al stock? No se puede deshacer.')">${H('compra_recibir', { id: c.id })}<div style="display:flex;gap:14px;flex-wrap:wrap">${k.rows.map(r => `<label>${esc(r.id)}<input class="sm" type="number" min="0" name="r_${r.slug}" value="${r.cases}"></label>`).join('')}</div>
${k.faltan ? `<p style="margin:0;font-size:13px;color:var(--od)">Faltan ${k.faltan} costo(s) real(es): se va a usar el estimado.</p>` : ''}<div><button>Recibir y sumar al stock</button></div></form></div>`;
  const flujo = ed && c.estado !== 'cancelado' ? `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">${c.estado === 'borrador' ? `<form method="post">${H('compra_estado', { id: c.id, v: 'pedido' })}<button>Marcar pedido a fábrica</button></form>` : ''}
${['borrador', 'pedido'].includes(c.estado) ? `<form method="post" class="inl" style="gap:6px;align-items:end">${H('compra_estado', { id: c.id, v: 'en camino' })}<label>Llega<input type="date" name="eta" value="${esc(c.eta || '')}" required></label><button class="sec">Marcar en camino</button></form>` : ''}
<form method="post" onsubmit="return confirm('¿Cancelar el pedido?')">${H('compra_estado', { id: c.id, v: 'cancelado' })}<button class="lnk">Cancelar</button></form>${c.estado === 'borrador' ? `<form method="post" onsubmit="return confirm('¿Borrar borrador?')">${H('compra_borrar', { id: c.id })}<button class="lnk">Borrar</button></form>` : ''}</div>` : rx ? `<form method="post" class="inl" style="gap:8px;align-items:end" onsubmit="return confirm('¿Borrar este pedido? El stock que sumó NO se descuenta.')">${H('compra_borrar', { id: c.id })}<label>Borrar pedido (escribí BORRAR)<input name="ok" required style="width:120px"></label><button class="lnk">Borrar</button></form>` : '';
  return `<p style="margin:0 0 6px"><a href="/admin?v=compras">← Compras</a></p>
<div style="display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap;margin-bottom:16px"><div><h1>${esc(c.nombre)} ${tagE(c.estado)}</h1><p class="mut" style="margin:4px 0 0">${esc(c.proveedor || '')} · creado ${dia(c.at)}${c.eta && !rx ? ' · llega ' + dia(c.eta) : ''}</p></div>
<form method="post">${H('compra_nueva', { copiar: c.id })}<button class="sec">Nuevo pedido con este mix</button></form></div>
<div class="kpis"><div class="kpi"><div class="l">Cajas · unidades</div><div class="n">${k.cajas} · ${k.unidades.toLocaleString('en-US')}</div></div><div class="kpi"><div class="l">Fábrica (EXW)</div><div class="n">${usd(k.V, 0)}</div></div><div class="kpi"><div class="l">Importación${k.faltan ? ' (con estimados)' : ''}</div><div class="n">${usd(k.imp, 0)}</div><div class="mut" style="font-size:12px">${(k.f * 100).toFixed(1)}% sobre fábrica</div></div><div class="kpi"><div class="l">Total puesto en Miami</div><div class="n">${usd(k.total, 0)}</div></div><div class="kpi"><div class="l">Si vendés todo a precio base</div><div class="n">${usd(k.venta, 0)}</div><div class="mut" style="font-size:12px">ganancia bruta ${usd(k.gan, 0)} · ${k.venta ? (k.gan / k.venta * 100).toFixed(1) : 0}%</div></div></div>
${flujo ? `<div class="card pad" style="margin-bottom:16px">${flujo}</div>` : ''}
<form method="post" class="card tw" style="margin-bottom:16px">${H('compra_items', { id: c.id })}<div style="padding:16px 16px 0"><h2>Mix del pedido</h2><small class="mut">El costo de fábrica sale de tu lista de compra; cambialo si la factura dice otro. El costo real por caja reparte la importación según el valor de cada producto.</small></div>
<table><thead><tr><th>Producto</th><th class="r">Cajas</th><th class="r">Costo fábrica / un.</th><th class="r">Fábrica total</th><th class="r">Costo real / un.</th><th class="r">Costo real / caja</th><th class="r">Precio base</th><th class="r">Margen</th></tr></thead><tbody>${mix}</tbody></table>${ed ? '<div style="padding:12px 16px"><button>Guardar mix</button></div>' : ''}</form>
<div class="grid2" style="margin-bottom:16px"><form method="post" class="card pad">${H('compra_costos', { id: c.id })}<h2>Costos del embarque</h2><small class="mut">Cargá lo que pagaste realmente (facturas de flete, despachante, aduana). Vacío = se usa el estimado.</small>
<table style="min-width:0;margin-top:8px"><thead><tr><th>Concepto</th><th class="r">Estimado</th><th class="r">Real</th><th class="r">Usado</th></tr></thead><tbody>${cost}<tr style="font-weight:700"><td>Total importación</td><td></td><td></td><td class="r num">${usd(k.imp)}</td></tr></tbody></table><div style="margin-top:10px"><button class="sec">Guardar costos</button></div></form>
<form method="post" class="card pad" style="display:grid;gap:10px;align-content:start">${H('compra_datos', { id: c.id })}<h2>Datos</h2>
<label>Nombre<input name="nombre" value="${esc(c.nombre)}"></label><label>Proveedor<input name="proveedor" value="${esc(c.proveedor || '')}"></label><label>Nº factura proveedor<input name="factura" value="${esc(c.factura || '')}"></label>
<div style="display:flex;gap:10px;flex-wrap:wrap"><label>Pagado a fábrica (USD)<input class="sm" style="width:140px" type="number" step="0.01" name="pago" value="${c.pago != null ? c.pago : ''}" placeholder="${k.V.toFixed(2)}"></label><label>Fecha de pago<input type="date" name="pago_fecha" value="${esc(c.pago_fecha || '')}"></label><label>Llegada estimada<input type="date" name="eta" value="${esc(c.eta || '')}"></label></div>
<label>Notas<textarea name="notas" style="min-height:70px">${esc(c.notas || '')}</textarea></label><div><button class="sec">Guardar datos</button></div></form></div>
${rec}
<div class="card pad" style="margin-top:16px"><h2>Historial</h2>${(c.hist || []).map(h => `<div style="font-size:13px;padding:4px 0;border-top:1px solid var(--line)"><span class="mut">${dia(h.at)}</span> · ${esc(h.txt)}</div>`).join('')}</div>`;
}
module.exports = { lista, una, calc, accion, vLista, vDetalle, K };
