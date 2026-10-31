// Reporte financiero (/admin?v=finanzas): estado de resultados, por producto, por mes, por cliente, pendientes.
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const usd = n => (n < 0 ? '−' : '') + 'USD ' + Math.abs(+n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (a, b) => b ? (Math.round(a / b * 1000) / 10) + '%' : '—';
const COB = o => ['pagado', 'enviado'].includes(o.estado);
const PER = { todo: 'Todo', mes: 'Este mes', mesant: 'Mes anterior', trim: 'Últimos 3 meses', anio: 'Este año' };
const MESN = ym => new Date(ym + '-15T12:00:00Z').toLocaleDateString('es-AR', { month: 'short', year: 'numeric', timeZone: 'UTC' });
// Costo fábrica (EXW) por caja — de la lista única api/_lib/precios.js
const EXW = Object.fromEntries(require('./precios').SKU.map(s => [s.slug, s.c * s.u]));
function rango(p) {
  const n = new Date(), y = n.getUTCFullYear(), m = n.getUTCMonth();
  if (p === 'mes') return [Date.UTC(y, m, 1), Infinity];
  if (p === 'mesant') return [Date.UTC(y, m - 1, 1), Date.UTC(y, m, 1)];
  if (p === 'trim') return [Date.UTC(y, m - 2, 1), Infinity];
  if (p === 'anio') return [Date.UTC(y, 0, 1), Infinity];
  return [0, Infinity];
}
function analizar({ ps, co, pr, p }) {
  const [a, b] = rango(p), enP = o => { const t = Date.parse(o.at); return t >= a && t < b; };
  const price = s => pr[s] && pr[s].unit_amount ? pr[s].unit_amount / 100 : 0;
  return ps.filter(o => COB(o) && enP(o)).map(o => {
    const total = +o.total || 0, tax = +o.tax || 0, fl = +o.flete || 0, merch = Math.max(0, total - tax - fl);
    const w = i => i.cases * (price(i.slug) || 1), base = (o.items || []).reduce((s, i) => s + w(i), 0) || 1;
    const items = (o.items || []).map(i => ({ slug: i.slug, sku: i.sku, name: i.name, cases: i.cases, ing: merch * w(i) / base, cst: +co[i.slug] > 0 ? i.cases * co[i.slug] : null }));
    const cm = items.some(i => i.cst == null) ? null : items.reduce((s, i) => s + i.cst, 0);
    const env = o.envio_costo != null ? +o.envio_costo : null, fee = +o.fee || 0;
    return { o, total, tax, fl, merch, ing: merch + fl, items, cm, env, fee, gan: cm == null ? null : merch + fl - cm - (env || 0) - fee, cajas: items.reduce((s, i) => s + i.cases, 0) };
  });
}
const sum = (l, f) => l.reduce((s, x) => s + (f(x) || 0), 0);

function render({ ps, co, pr, t, p = 'todo', gastos = [] }) {
  if (!PER[p]) p = 'todo';
  const U2 = require('./adminui2'), GM = gastos.reduce((a, x) => a + +x.monto, 0), nM = mesesPeriodo(p, ps), GF = GM * nM;
  const R = analizar({ ps, co, pr, p }), ok = R.filter(r => r.gan != null), nok = R.filter(r => r.gan == null);
  const ING = sum(R, r => r.ing), GAN = sum(ok, r => r.gan), INGok = sum(ok, r => r.ing);
  const faltan = t.filter(x => !(+co[x.slug] > 0));
  const faltanUsados = faltan.filter(x => R.some(r => r.items.some(i => i.slug === x.slug)));
  const H = (a, ex) => `<input type="hidden" name="a" value="${a}">` + Object.entries(ex || {}).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join('');
  const costoForm = x => `<form method="post" class="inl">${H('costo', { s: x.slug })}<input class="sm" style="width:130px" type="number" step="0.01" min="0" name="v" value="${+co[x.slug] > 0 ? (+co[x.slug]).toFixed(2) : ''}" placeholder="${EXW[x.slug] ? 'EXW ' + EXW[x.slug].toFixed(0) : 'USD'}"><button class="sec">Guardar</button></form>`;

  const aviso = faltanUsados.length ? `<div class="card pad" style="border-color:var(--o);margin-bottom:18px"><h2 style="margin:0 0 6px">Falta el costo por caja de ${faltanUsados.length} producto(s)</h2>
<p class="mut" style="margin:0 0 12px;font-size:13px">Sin costo no se puede calcular la ganancia de esas ventas (${nok.length} venta(s), ${usd(sum(nok, r => r.ing))} de ingresos). Cargá el costo puesto en Miami (EXW + importación). El valor gris es solo el EXW de la planilla de importación, como referencia.</p>
<div style="display:grid;gap:8px">${faltanUsados.map(x => `<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span style="min-width:220px"><b>${esc(x.name)}</b> <small class="m">${esc(x.sku)}</small></span>${costoForm(x)}</div>`).join('')}</div></div>` : '';

  const chips = `<div class="chips">${Object.entries(PER).map(([k, l]) => `<a href="/admin?v=finanzas&p=${k}" class="${p === k ? 'on' : ''}">${l}</a>`).join('')}</div>`;
  const kp = [['Ingresos', usd(ING), `${R.length} venta(s) cobradas · sin tax`], ['Ganancia neta', ok.length ? usd(GAN - GF) : '—', ok.length ? `operativa ${usd(GAN)} · margen ${pct(GAN, INGok)}${nok.length ? ` · ${nok.length} venta(s) sin costo excluidas` : ''}` : 'cargá los costos'],
    ['Cajas vendidas', sum(R, r => r.cajas), R.length ? `ticket promedio ${usd(ING / R.length)}` : ''], ['Sales tax cobrado', usd(sum(R, r => r.tax)), 'a pagar al estado, no es ingreso']];
  const kpis = `<div class="kpis">${kp.map(([l, n, s]) => `<div class="kpi"><div class="l">${l}</div><div class="n" style="font-size:28px">${n}</div><div class="s">${s}</div></div>`).join('')}</div>`;

  // Estado de resultados (solo ventas con costo completo)
  const L = (l, v, cls = '', note = '') => `<tr class="${cls}"><td>${l}${note ? `<br><small class="mut">${note}</small>` : ''}</td><td class="r num">${v}</td><td class="r"><small class="mut">${INGok ? pct(typeof v === 'number' ? v : 0, INGok) : ''}</small></td></tr>`;
  const m = sum(ok, r => r.merch), f = sum(ok, r => r.fl), cm = sum(ok, r => r.cm), ce = sum(ok, r => r.env), sinEnv = ok.filter(r => r.env == null && !r.o.retiro).length;
  const pl = `<div class="card tw"><div style="padding:16px 16px 0"><h2>Estado de resultados</h2><small class="mut">${PER[p]} · ventas pagadas o enviadas${nok.length ? ` con costo cargado (${ok.length} de ${R.length})` : ''}</small></div>
<table style="min-width:0"><tbody>
<tr><td>Ventas de mercadería</td><td class="r num">${usd(m)}</td><td></td></tr>
<tr><td>+ Flete cobrado</td><td class="r num">${usd(f)}</td><td></td></tr>
<tr style="font-weight:700"><td>Ingresos netos</td><td class="r num">${usd(m + f)}</td><td class="r"><small class="mut">100%</small></td></tr>
<tr><td>− Costo de mercadería</td><td class="r num">${usd(-cm)}</td><td class="r"><small class="mut">${pct(cm, m + f)}</small></td></tr>
<tr style="font-weight:700"><td>Margen bruto</td><td class="r num">${usd(m + f - cm)}</td><td class="r"><small class="mut">${pct(m + f - cm, m + f)}</small></td></tr>
<tr><td>− Costo de envío (UPS/FedEx)${sinEnv ? `<br><small class="mut">${sinEnv} venta(s) sin costo de envío cargado</small>` : ''}</td><td class="r num">${usd(-ce)}</td><td class="r"><small class="mut">${pct(ce, m + f)}</small></td></tr>
<tr><td>− Comisiones Stripe</td><td class="r num">${usd(-sum(ok, r => r.fee))}</td><td class="r"><small class="mut">${pct(sum(ok, r => r.fee), m + f)}</small></td></tr>
<tr style="font-weight:700;border-top:2px solid var(--ink)"><td>Ganancia operativa</td><td class="r num">${usd(GAN)}</td><td class="r"><small>${pct(GAN, m + f)}</small></td></tr>
<tr><td>− Gastos fijos<br><small class="mut">${usd(GM)}/mes × ${nM} mes(es)</small></td><td class="r num">${usd(-GF)}</td><td class="r"><small class="mut">${pct(GF, m + f)}</small></td></tr>
<tr style="font-weight:800;font-size:17px;border-top:2px solid var(--ink)"><td>Ganancia neta</td><td class="r num">${usd(GAN - GF)}</td><td class="r"><small>${pct(GAN - GF, m + f)}</small></td></tr>
${nok.length ? `<tr><td><small class="mut">Ventas sin costo cargado (no incluidas arriba)</small></td><td class="r num"><small class="mut">${usd(sum(nok, r => r.ing))}</small></td><td></td></tr>` : ''}
<tr><td><small class="mut">Sales tax cobrado (pasivo, se paga al estado)</small></td><td class="r num"><small class="mut">${usd(sum(R, r => r.tax))}</small></td><td></td></tr>
</tbody></table></div>`;

  // Por producto
  const prod = t.map(x => { const its = R.flatMap(r => r.items.filter(i => i.slug === x.slug)); const cj = sum(its, i => i.cases), ing = sum(its, i => i.ing), c = +co[x.slug] > 0 ? cj * co[x.slug] : null; return { x, cj, ing, c, g: c == null ? null : ing - c }; });
  const pt = `<div class="card tw"><div style="padding:16px 16px 0"><h2>Por producto</h2><small class="mut">Ingresos repartidos según el precio de lista. Sin envío ni tax.</small></div><table><thead><tr><th>Producto</th><th class="r">Cajas</th><th class="r">Ingresos</th><th>Costo / caja</th><th class="r">Ganancia</th><th class="r">Margen</th></tr></thead><tbody>
${prod.map(({ x, cj, ing, c, g }) => `<tr><td><a href="/admin?v=producto&s=${x.slug}"><strong>${esc(x.name)}</strong></a><br><small class="m">${esc(x.sku)}</small></td><td class="num">${cj}</td><td class="r num">${ing ? usd(ing) : '—'}</td><td>${costoForm(x)}</td><td class="r num">${g != null && cj ? usd(g) : '—'}</td><td class="r">${g != null && ing ? pct(g, ing) : '—'}</td></tr>`).join('')}
</tbody></table></div>`;

  // Por mes
  const meses = [...new Set(R.map(r => r.o.at.slice(0, 7)))].sort().reverse();
  const mx = Math.max(1, ...meses.map(k => sum(R.filter(r => r.o.at.startsWith(k)), r => r.ing)));
  const mt = meses.length ? `<div class="card tw"><div style="padding:16px 16px 0"><h2>Por mes</h2></div><table><thead><tr><th>Mes</th><th class="r">Ventas</th><th class="r">Cajas</th><th>Ingresos</th><th class="r">Ganancia</th><th class="r">Margen</th></tr></thead><tbody>
${meses.map(k => { const l = R.filter(r => r.o.at.startsWith(k)), lo = l.filter(r => r.gan != null), ing = sum(l, r => r.ing), g = sum(lo, r => r.gan); return `<tr><td>${MESN(k)}</td><td class="num">${l.length}</td><td class="num">${sum(l, r => r.cajas)}</td><td><div style="display:flex;align-items:center;gap:8px"><span style="display:block;height:8px;border-radius:4px;background:var(--o);width:${Math.max(2, Math.round(ing / mx * 140))}px"></span><span class="num">${usd(ing)}</span></div></td><td class="r num">${lo.length ? usd(g) : '—'}${lo.length < l.length ? '<br><small class="mut">parcial</small>' : ''}</td><td class="r">${lo.length ? pct(g, sum(lo, r => r.ing)) : '—'}</td></tr>`; }).join('')}
</tbody></table></div>` : '';

  // Por cliente
  const cl = {}; for (const r of R) { const k = r.o.cliente || r.o.email || r.o.company; const c = cl[k] = cl[k] || { n: r.o.company || r.o.email, id: r.o.cliente, v: 0, cj: 0, ing: 0, g: 0, gk: true }; c.v++; c.cj += r.cajas; c.ing += r.ing; if (r.gan == null) c.gk = false; else c.g += r.gan; }
  const cls = Object.values(cl).sort((a, b) => b.ing - a.ing).slice(0, 15);
  const ct = cls.length ? `<div class="card tw"><div style="padding:16px 16px 0"><h2>Clientes</h2></div><table><thead><tr><th>Cliente</th><th class="r">Ventas</th><th class="r">Cajas</th><th class="r">Ingresos</th><th class="r">% del total</th><th class="r">Ganancia</th></tr></thead><tbody>
${cls.map(c => `<tr><td>${c.id ? `<a href="/admin?v=cliente&id=${encodeURIComponent(c.id)}"><strong>${esc(c.n)}</strong></a>` : `<strong>${esc(c.n)}</strong>`}</td><td class="num">${c.v}</td><td class="num">${c.cj}</td><td class="r num">${usd(c.ing)}</td><td class="r">${pct(c.ing, ING)}</td><td class="r num">${c.gk ? usd(c.g) : '—'}</td></tr>`).join('')}
</tbody></table></div>` : '';

  // Pendientes (siempre totales, no dependen del período)
  const porCob = ps.filter(o => ['confirmado', 'pago pendiente'].includes(o.estado)), pre = ps.filter(o => !['enviado', 'cancelado'].includes(o.estado)).reduce((s, o) => s + (o.items || []).reduce((a, i) => a + (i.preorder || 0), 0), 0);
  const sinE = ps.filter(o => o.estado === 'enviado' && o.envio_costo == null && !o.retiro);
  const pend = `<div class="card pad"><h2>Pendientes</h2><dl class="kv">
<dt>Por cobrar</dt><dd><a href="/admin?v=ventas&f=porcobrar"><strong>${usd(sum(porCob, o => +o.total || 0))}</strong></a> <small>${porCob.length} venta(s)</small></dd>
<dt>Pre-pedido</dt><dd>${pre} caja(s) vendidas sin stock</dd>
<dt>Envíos sin costo</dt><dd>${sinE.length ? sinE.slice(0, 8).map(o => `<a class="m" href="/admin?v=venta&ref=${o.ref}">${o.ref}</a>`).join(' · ') + (sinE.length > 8 ? ' …' : '') : 'ninguno'}</dd></dl></div>`;

  const det = R.length ? `<div class="card tw"><div style="padding:16px 16px 0;display:flex;justify-content:space-between;align-items:center"><h2>Detalle por venta</h2><a href="/admin?v=finanzas&p=${p}&csv=1">Descargar CSV</a></div><table><thead><tr><th>Venta</th><th>Cliente</th><th class="r">Ingresos</th><th class="r">Costo merc.</th><th class="r">Envío</th><th class="r">Ganancia</th><th class="r">Margen</th></tr></thead><tbody>
${R.map(r => `<tr class="row" data-href="/admin?v=venta&ref=${r.o.ref}"><td><a class="m" href="/admin?v=venta&ref=${r.o.ref}">${r.o.ref}</a><br><small>${r.o.at.slice(0, 10)}</small></td><td>${esc(r.o.company)}</td><td class="r num">${usd(r.ing)}</td><td class="r num">${r.cm != null ? usd(r.cm) : '<small class="no">falta costo</small>'}</td><td class="r num">${r.env != null ? usd(r.env) : r.o.retiro ? '<small>retiro</small>' : '<small class="mut">—</small>'}</td><td class="r num"><strong>${r.gan != null ? usd(r.gan) : '—'}</strong></td><td class="r">${r.gan != null ? pct(r.gan, r.ing) : '—'}</td></tr>`).join('')}
</tbody></table></div>` : `<div class="card pad"><p class="mut" style="margin:0">No hay ventas pagadas o enviadas en este período.</p></div>`;

  return `<div class="crumb"><a href="/admin?v=ventas">Ventas</a>/<span>Finanzas</span></div><div class="hd"><div><h1>Reporte financiero</h1><div class="sub">Ventas pagadas o enviadas. Ganancia = ingresos sin tax − costo de mercadería − costo de envío.</div></div><a class="btn sec" href="/admin?v=finanzas&p=${p}&csv=1">Descargar CSV</a></div>
${chips}${aviso}${kpis}
<div class="grid2" style="margin-bottom:16px">${pl}${pend}</div>
<div style="display:grid;gap:16px">${pt}${mt}${ct}<div class="grid2">${U2.gastos(gastos)}${taxEstado(R)}</div>${utmT(R)}${det}</div>`;
}

function mesesPeriodo(p, ps) {
  const n = new Date();
  if (p === 'mes' || p === 'mesant') return 1; if (p === 'trim') return 3; if (p === 'anio') return n.getUTCMonth() + 1;
  const f = ps.map(o => o.at).sort()[0]; if (!f) return 1; const d = new Date(f); return Math.max(1, (n.getUTCFullYear() - d.getUTCFullYear()) * 12 + n.getUTCMonth() - d.getUTCMonth() + 1);
}
function taxEstado(R) {
  const g = {}; for (const r of R) { const k = (r.o.state || '—').toUpperCase().slice(0, 2); const x = g[k] = g[k] || { n: 0, base: 0, tax: 0 }; x.n++; x.base += r.merch + r.fl; x.tax += r.tax; }
  const l = Object.entries(g).sort((a, b) => b[1].tax - a[1].tax);
  return `<div class="card pad"><h2>Sales tax por estado</h2><small class="mut">Lo cobrado en el período, para presentar en cada estado.</small><table style="min-width:0;margin-top:8px"><thead><tr><th>Estado</th><th class="r">Ventas</th><th class="r">Base</th><th class="r">Tax cobrado</th></tr></thead><tbody>${l.map(([k, x]) => `<tr><td>${esc(k)}</td><td class="num">${x.n}</td><td class="r num">${usd(x.base)}</td><td class="r num"><strong>${usd(x.tax)}</strong></td></tr>`).join('') || '<tr><td colspan="4" class="mut">Sin ventas</td></tr>'}</tbody></table></div>`;
}
function utmT(R) {
  const g = {}; for (const r of R) { const u = String(r.o.utm || ''); const k = u ? u : 'directo / sin campaña'; const x = g[k] = g[k] || { n: 0, ing: 0 }; x.n++; x.ing += r.ing; }
  const l = Object.entries(g).sort((a, b) => b[1].ing - a[1].ing); if (!l.length) return '';
  return `<div class="card tw"><div style="padding:16px 16px 0"><h2>De dónde vienen las ventas</h2><small class="mut">Según el link con el que entró el cliente (redes, mails). Formato: fuente · campaña · post.</small></div><table><thead><tr><th>Origen</th><th class="r">Ventas</th><th class="r">Ingresos</th></tr></thead><tbody>${l.map(([k, x]) => `<tr><td>${esc(k)}</td><td class="num">${x.n}</td><td class="r num">${usd(x.ing)}</td></tr>`).join('')}</tbody></table></div>`;
}
function csv({ ps, co, pr, p = 'todo' }) {
  const q = v => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const n = v => v == null ? '' : (Math.round(v * 100) / 100).toFixed(2);
  const rows = [['ref', 'fecha', 'estado', 'cliente', 'email', 'cajas', 'total', 'sales_tax', 'flete_cobrado', 'ingresos_sin_tax', 'costo_mercaderia', 'costo_envio', 'comision_stripe', 'ganancia', 'margen_%']];
  for (const r of analizar({ ps, co, pr, p: PER[p] ? p : 'todo' })) rows.push([r.o.ref, r.o.at.slice(0, 10), r.o.estado, r.o.company, r.o.email, r.cajas, n(r.total), n(r.tax), n(r.fl), n(r.ing), n(r.cm), n(r.env), n(r.fee), n(r.gan), r.gan != null && r.ing ? (r.gan / r.ing * 100).toFixed(1) : '']);
  return '\ufeff' + rows.map(l => l.map(q).join(',')).join('\n');
}
module.exports = { render, csv, analizar };
