const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const usd = n => n ? 'USD ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
const fecha = s => s ? new Date(s).toLocaleString('es-AR', { timeZone: 'America/New_York', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
const dia = s => s ? new Date(s).toLocaleDateString('es-AR', { timeZone: 'America/New_York', day: '2-digit', month: 'short', year: 'numeric' }) : '';
const ESTADOS = ['nuevo', 'confirmado', 'pago pendiente', 'pagado', 'enviado', 'cancelado'];
const ACTIVOS = o => !['enviado', 'cancelado'].includes(o.estado);
const tag = e => `<span class="tag t-${String(e).replace(/\s/g, '-')}">${esc(e)}</span>`;
const cajas = o => (o.items || []).reduce((a, i) => a + i.cases, 0);
const H = (a, extra = {}) => `<input type="hidden" name="a" value="${a}">` + Object.entries(extra).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join('');
const btn = (a, extra, txt, cls = '', conf) => `<form method="post" class="inl"${conf ? ` onsubmit="return confirm('${esc(conf)}')"` : ''}>${H(a, extra)}<button class="${cls}">${txt}</button></form>`;
const empty = t => `<div class="empty">${t}</div>`;

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
:root{--o:#D4541A;--od:#B84417;--ink:#0F1117;--bg:#F5F0E8;--bg2:#EDE6DA;--line:#E2D8CB;--mut:#6B645A;--card:#fff;--g:#1D7A3A;--a:#B7791F;--r:#B3261E;--fd:"Barlow Condensed",sans-serif;--fb:"DM Sans",system-ui,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 var(--fb)}a{color:var(--od)}a:hover{color:var(--ink)}
.shell{display:grid;grid-template-columns:220px minmax(0,1fr);min-height:100vh}
aside{background:var(--ink);color:#fff;padding:22px 14px;display:flex;flex-direction:column;gap:4px;position:sticky;top:0;height:100vh}
.logo{display:flex;align-items:center;gap:10px;font:800 18px var(--fd);letter-spacing:.12em;text-transform:uppercase;padding:0 10px 20px;color:#fff;text-decoration:none}.logo img{width:30px;height:30px}
aside nav{display:flex;flex-direction:column;gap:2px}aside nav a{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:8px;color:rgba(255,255,255,.7);text-decoration:none;font-weight:600}
aside nav a:hover{background:rgba(255,255,255,.06);color:#fff}aside nav a.on{background:var(--o);color:#fff}aside nav a .ct{font-size:12px;background:rgba(255,255,255,.14);padding:1px 8px;border-radius:10px}
aside .new{margin:14px 0 0;display:flex;justify-content:center;padding:11px;border-radius:8px;border:1px solid rgba(255,255,255,.2);color:#fff;text-decoration:none;font-weight:600}aside .new:hover{border-color:#fff;color:#fff}
aside .foot{margin-top:auto;display:flex;flex-direction:column;gap:6px;padding:0 12px;font-size:12px}aside .foot a{color:rgba(255,255,255,.5);text-decoration:none}aside .foot a:hover{color:#fff}
main{padding:28px clamp(16px,3vw,40px) 60px;max-width:1280px;width:100%}
.hd{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:space-between;margin-bottom:20px}
h1{font:800 clamp(30px,3.4vw,40px)/1 var(--fd);text-transform:uppercase;letter-spacing:.02em;margin:0}.sub{color:var(--mut);margin-top:6px}
h2{font:700 20px var(--fd);text-transform:uppercase;letter-spacing:.04em;margin:0 0 12px}
.crumb{font-size:12px;color:var(--mut);margin-bottom:8px;display:flex;gap:6px}.crumb a{color:var(--mut)}
.flash{background:var(--ink);color:#fff;padding:12px 16px;border-radius:10px;margin-bottom:16px}.flash.err{background:var(--r)}
.mode{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12px;color:var(--mut);margin-bottom:18px}.mode b{color:var(--ink)}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:var(--a)}.dot.ok{background:var(--g)}.dot.no{background:var(--r)}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:22px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;text-decoration:none;color:inherit;display:block}a.kpi:hover{border-color:var(--o);color:inherit}
.kpi .n{font:800 34px/1 var(--fd);margin-bottom:4px}.kpi .l{font-size:12px;color:var(--mut);text-transform:uppercase;letter-spacing:.06em;font-weight:600}.kpi .s{font-size:12px;color:var(--mut);margin-top:2px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}.card.pad{padding:20px}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-bottom:16px}
.tw{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:720px}th,td{padding:12px 16px;border-bottom:1px solid var(--bg2);text-align:left;vertical-align:middle}
th{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--mut);background:#FBF9F5;font-weight:700}tr:last-child td{border-bottom:0}
tr.row{cursor:pointer}tr.row:hover td{background:#FBF7F1}td.num{text-align:right;font:700 20px var(--fd)}td.r{text-align:right}
.m{font-family:ui-monospace,Menlo,monospace;font-size:12px}small,.mut{color:var(--mut)}
.tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:var(--bg2);white-space:nowrap}
.t-nuevo{background:var(--o);color:#fff}.t-confirmado{background:#E3E8F2;color:#2B4170}.t-pago-pendiente{background:#F8E7C4;color:#7A4B00}.t-pagado{background:#DCEFE2;color:var(--g)}.t-enviado{background:var(--ink);color:#fff}.t-cancelado{background:var(--bg2);color:var(--mut);text-decoration:line-through}
.t-ok{background:#DCEFE2;color:var(--g)}.t-pre{background:var(--bg2);color:var(--mut)}.t-ex{background:#DCEFE2;color:var(--g)}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}.chips a{padding:6px 14px;border-radius:20px;background:var(--card);border:1px solid var(--line);text-decoration:none;color:var(--ink);font-weight:500}.chips a.on{background:var(--ink);border-color:var(--ink);color:#fff}.chips a .ct{opacity:.6;margin-left:4px}
.tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:12px}.tools .sp{flex:1}
input,select,textarea{font:inherit;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:8px;padding:9px 12px;min-height:40px;width:100%}input:focus,select:focus,textarea:focus{outline:2px solid var(--o);outline-offset:0;border-color:transparent}
input.sm{width:90px}textarea{min-height:80px}
label{display:grid;gap:5px;font-size:12px;font-weight:600;color:var(--mut)}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.chk{display:flex;gap:10px;align-items:center;font-size:14px;color:var(--ink);font-weight:500}.chk input{width:18px;min-height:18px}
button,.btn{font:600 14px var(--fb);display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:0 16px;border-radius:8px;border:0;background:var(--o);color:#fff;cursor:pointer;text-decoration:none;white-space:nowrap}
button:hover,.btn:hover{background:var(--od);color:#fff}button.sec,.btn.sec{background:#fff;color:var(--ink);border:1px solid var(--line)}button.sec:hover,.btn.sec:hover{border-color:var(--ink);color:var(--ink);background:#fff}
button.dk{background:var(--ink)}button.dk:hover{background:#2a2f3c}button.lnk{background:none;color:var(--od);padding:0;min-height:0;text-decoration:underline}button.lnk:hover{color:var(--ink);background:none}button.danger{background:#fff;color:var(--r);border:1px solid #EBC9C6}button.danger:hover{background:var(--r);color:#fff}
form.inl{display:inline-flex;gap:6px;margin:0;align-items:center}
.acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.kv{display:grid;grid-template-columns:120px minmax(0,1fr);gap:8px 14px;margin:0}.kv dt{color:var(--mut);font-size:12px;font-weight:600;padding-top:2px}.kv dd{margin:0}
.big{font:800 48px/1 var(--fd)}.ok{color:var(--g)}.no{color:var(--r)}
.tl{list-style:none;margin:0;padding:0;display:grid;gap:10px}.tl li{display:grid;grid-template-columns:110px minmax(0,1fr);gap:10px;font-size:13px}.tl li span{color:var(--mut);font-size:12px}
.prod{display:flex;align-items:center;gap:12px}.prod img{width:44px;height:44px;object-fit:contain;background:var(--bg);border-radius:8px;padding:4px}
.empty{padding:40px;text-align:center;color:var(--mut)}
.qgrid{display:grid;gap:8px}.qrow{display:grid;grid-template-columns:minmax(0,1fr) 90px;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--bg2)}.qrow:last-child{border:0}
.links{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-bottom:22px}
.lg{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px}.lg h2{font-size:16px;margin:0 0 10px;display:flex;align-items:center;gap:8px}.lg h2 i{width:8px;height:8px;border-radius:50%;background:var(--o)}
.lg ul{list-style:none;margin:0;padding:0;display:grid;gap:2px}.lg li a{display:flex;justify-content:space-between;gap:10px;padding:7px 8px;margin:0 -8px;border-radius:6px;text-decoration:none;color:var(--ink);font-weight:500}.lg li a:hover{background:var(--bg);color:var(--ink)}.lg li a small{color:var(--mut);font-weight:400;text-align:right}
.wk{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
.sp{background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}.sp img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:var(--ink)}
.sp .bd{padding:14px;display:grid;gap:10px}.sp .when{display:flex;justify-content:space-between;align-items:center;font-weight:700}.sp textarea{min-height:170px;font-size:13px}
.nets{display:flex;flex-wrap:wrap;gap:6px}.nets label{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--ink);font-weight:500;border:1px solid var(--line);border-radius:20px;padding:3px 10px}.nets input{width:auto;min-height:0}
.whd{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:26px 0 12px}
.steps-c{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin-bottom:20px}.steps-c ol{margin:8px 0 0;padding-left:20px;display:grid;gap:6px}
.login{min-height:100vh;display:grid;place-items:center;padding:24px}.login .card{max-width:360px;width:100%}
@media(max-width:860px){.shell{grid-template-columns:1fr}aside{position:static;height:auto;flex-direction:row;flex-wrap:wrap;align-items:center;padding:12px}aside nav{flex-direction:row;flex-wrap:wrap}.logo{padding:0 10px 0 0}aside .new{margin:0}aside .foot{display:none}}`;

function layout({ v, title, body, flash = '', banner = '', counts }) {
  const nav = [['inicio', 'Inicio', null], ['ventas', 'Ventas', counts.ventas], ['clientes', 'Clientes', counts.clientes], ['stock', 'Stock', counts.stock], ['compras', 'Compras', counts.compras || null], ['finanzas', 'Finanzas', null], ['redes', 'Redes', null], ['sistema', 'Sistema', counts.sistema || null]].filter(([k]) => counts.rol !== 'deposito' || ['ventas', 'stock'].includes(k));
  const sec = v === 'sistema' ? 'sistema' : v === 'redes' ? 'redes' : v === 'inicio' ? 'inicio' : v === 'finanzas' ? 'finanzas' : v.startsWith('compra') ? 'compras' : v.startsWith('venta') || v === 'nueva' ? 'ventas' : v.startsWith('cliente') ? 'clientes' : 'stock';
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} · K11 Admin</title><link rel="icon" href="/assets/logo-wylco.png"><style>${CSS}</style></head><body>
<div class="shell"><aside><a class="logo" href="/admin"><img src="/assets/logo-wylco.png" alt="">K11 Admin</a>
<nav>${nav.map(([k, l, c]) => `<a href="/admin?v=${k}" class="${sec === k ? 'on' : ''}">${l}${c != null ? `<span class="ct">${c}</span>` : ''}</a>`).join('')}</nav>
<a class="new" href="/admin?v=nueva">+ Nueva venta</a>
<div class="foot"><a href="/order" target="_blank">Ver tienda ↗</a><a href="${counts.mails}">Panel de mails</a><a href="/admin?salir=1">Salir</a></div></aside>
<main>${banner}${flash ? `<div class="flash${/^Error/.test(flash) ? ' err' : ''}">${esc(flash)}</div>` : ''}${body}</main></div>
<script>document.querySelectorAll('tr[data-href]').forEach(function(r){r.addEventListener('click',function(e){if(e.target.closest('a,button,input,form'))return;location.href=r.dataset.href;});});</script>
</body></html>`;
}
const login = err => `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>K11 Admin</title><style>${CSS}</style></head><body><div class="login"><form class="card pad" method="get" action="/admin" style="display:grid;gap:14px"><h1>K11 Admin</h1>${err ? '<div class="flash err">Clave incorrecta</div>' : ''}<label>Clave de administrador<input type="password" name="k" autofocus required></label><button>Entrar</button></form></div></body></html>`;

// ── VENTAS ──
const COBRADO = o => ['pagado', 'enviado'].includes(o.estado);
const neto = o => Math.max(0, (o.total || 0) - (o.tax || 0));
const costoV = (o, co) => (o.items || []).reduce((a, i) => a + (i.cases || 0) * (+co[i.slug] || 0), 0) + (+o.envio_costo || 0) + (+o.fee || 0);
const sinCosto = (o, co) => (o.items || []).some(i => !(+co[i.slug] > 0));
function ventas({ ps, f, q, co = {} }) {
  const act = ps.filter(ACTIVOS);
  const cobT = ps.filter(COBRADO), cob = cobT.filter(o => !sinCosto(o, co)), falt = cobT.length - cob.length, ing = cob.reduce((a, o) => a + neto(o), 0), cst = cob.reduce((a, o) => a + costoV(o, co), 0), gan = ing - cst;
  const porCobrar = act.filter(o => ['confirmado', 'pago pendiente'].includes(o.estado));
  const k = [
    ['nuevo', 'Por facturar', act.filter(o => o.estado === 'nuevo').length, 'pedidos nuevos'],
    ['porcobrar', 'Por cobrar', porCobrar.length, usd(porCobrar.reduce((a, o) => a + (o.total || 0), 0))],
    ['pagado', 'A despachar', act.filter(o => o.estado === 'pagado').length, 'pagadas'],
    ['activas', 'Pre-pedido', act.reduce((a, o) => a + (o.items || []).reduce((b, i) => b + i.preorder, 0), 0), 'cajas sin stock'],
    ['/admin?v=finanzas', 'Ganancia', ing ? usd(gan) : '—', ing ? `${Math.round(gan / ing * 100)}% de ${usd(ing)} cobrado sin tax${falt ? ` · faltan costos (${falt} venta${falt > 1 ? 's' : ''} excluida${falt > 1 ? 's' : ''})` : ''}` : (falt ? `faltan costos (${falt} venta${falt > 1 ? 's' : ''}) · cargalos →` : 'sin ventas cobradas')]];
  let list = ps;
  if (f === 'activas') list = act; else if (f === 'porcobrar') list = porCobrar; else if (ESTADOS.includes(f)) list = ps.filter(o => o.estado === f);
  if (q) { const s = q.toLowerCase(); list = list.filter(o => [o.ref, o.company, o.email, o.contact].join(' ').toLowerCase().includes(s)); }
  const chips = [['activas', 'Activas', act.length], ...ESTADOS.map(e => [e, e, ps.filter(o => o.estado === e).length]), ['todas', 'Todas', ps.length]];
  const rows = list.map(o => `<tr class="row" data-href="/admin?v=venta&ref=${o.ref}"><td><a href="/admin?v=venta&ref=${o.ref}" class="m">${o.ref}</a><br><small>${fecha(o.at)} · ${esc(o.origen)}</small></td>
<td>${o.cliente ? `<a href="/admin?v=cliente&id=${encodeURIComponent(o.cliente)}"><strong>${esc(o.company || o.email)}</strong></a>` : `<strong>${esc(o.company)}</strong>`}<br><small>${esc(o.contact)} · ${esc([o.city, o.state].filter(Boolean).join(', '))}</small></td>
<td>${(o.items || []).map(i => `${i.cases}× <span class="m">${esc(i.sku)}</span>`).join('<br>')}${(o.items || []).some(i => i.preorder) ? '<br><small>incluye pre-pedido</small>' : ''}</td>
<td class="r">${usd(o.total)}<br><small>${esc(o.payment || '')}</small></td><td class="r">${o.total && !sinCosto(o, co) ? usd(neto(o) - costoV(o, co)) : '—'}</td><td>${tag(o.estado)}</td></tr>`).join('');
  return `<div class="hd"><div><h1>Ventas</h1><div class="sub">Pedidos de la web, del checkout de Stripe y cargados a mano.</div></div><a class="btn" href="/admin?v=nueva">+ Nueva venta</a></div>
<div class="kpis">${k.map(([fk, l, n, s]) => `<a class="kpi" href="${fk.startsWith('/') ? fk : '/admin?v=ventas&f=' + encodeURIComponent(fk)}"><div class="l">${l}</div><div class="n">${n}</div><div class="s">${s}</div></a>`).join('')}</div>
<div class="tools"><div class="chips" style="margin:0">${chips.map(([fk, l, n]) => `<a href="/admin?v=ventas&f=${encodeURIComponent(fk)}" class="${f === fk ? 'on' : ''}">${l}<span class="ct">${n}</span></a>`).join('')}</div><span class="sp"></span>
<form method="get" class="inl"><input type="hidden" name="v" value="ventas"><input type="hidden" name="f" value="${esc(f)}"><input name="q" value="${esc(q)}" placeholder="Buscar ref, empresa, email" style="width:240px"></form></div>
<div class="card tw">${rows ? `<table><thead><tr><th>Venta</th><th>Cliente</th><th>Cajas</th><th class="r">Total</th><th class="r">Ganancia</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table>` : empty('No hay ventas en este filtro.')}</div>`;
}

function venta({ o, c, mode, dash, env = { caja: 35, gratis: 2000 }, co = {} }) {
  const r = { ref: o.ref };
  const acts = [];
  const abierta = ACTIVOS(o);
  if (abierta && !o.invoice && o.origen !== 'stripe') acts.push(btn('factura', r, 'Crear y enviar factura', '', `¿Crear la factura en Stripe (${mode}) y enviarla a ${o.email}?`));
  if (abierta && o.estado !== 'pagado') acts.push(btn('estado', { ...r, v: 'pagado', pago: 'Zelle' }, 'Cobrado por Zelle', 'sec', '¿Confirmás que recibiste el Zelle?'));
  if (abierta && o.estado === 'nuevo' && !o.invoice) acts.push(btn('estado', { ...r, v: 'confirmado' }, 'Marcar confirmado', 'sec'));
  if (abierta) acts.push(btn('estado', { ...r, v: 'enviado' }, 'Marcar enviado', 'dk', o.estado !== 'pagado' ? 'Esta venta no figura como pagada. ¿Marcar enviada igual?' : ''));
  if (o.estado !== 'cancelado' && cajas(o)) acts.push(`<a class="btn sec" href="/api/etiqueta?ref=${encodeURIComponent(o.ref)}" target="_blank">Etiquetas de envío (${cajas(o)})</a>`);
  if (o.estado !== 'cancelado') acts.push(btn('estado', { ...r, v: 'cancelado' }, 'Cancelar', 'danger', '¿Cancelar la venta, devolver stock' + (o.invoice ? ' y anular la factura' : '') + '?'));
  const items = (o.items || []).map(i => `<tr><td><a href="/admin?v=producto&s=${i.slug}" class="m">${esc(i.sku)}</a></td><td>${esc(i.name)}</td><td class="num">${i.cases}</td><td class="r">${i.reserved ? `<span class="tag t-ok">${i.reserved} de stock</span>` : ''} ${i.preorder ? `<span class="tag t-pre">${i.preorder} pre-pedido</span>` : ''}</td></tr>`).join('');
  const cli = c || o;
  return `<div class="crumb"><a href="/admin?v=ventas">Ventas</a>/<span>${o.ref}</span></div>
<div class="hd"><div><h1>${o.ref}</h1><div class="sub">${fecha(o.at)} · origen ${esc(o.origen)} · ${cajas(o)} caja(s)</div></div><div>${tag(o.estado)}</div></div>
<div class="acts" style="margin-bottom:18px">${acts.join('')}</div>
<div class="grid2"><div class="card pad"><h2>Cliente</h2><dl class="kv">
<dt>Empresa</dt><dd>${o.cliente ? `<a href="/admin?v=cliente&id=${encodeURIComponent(o.cliente)}"><strong>${esc(cli.company || o.company)}</strong></a>` : esc(o.company)} ${c && c.exento ? tag('exento') : ''}</dd>
<dt>Contacto</dt><dd>${esc(o.contact)}</dd><dt>Email</dt><dd><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></dd><dt>Teléfono</dt><dd>${esc(o.phone)}</dd>
<dt>Envío</dt><dd>${esc([o.address, o.city, o.state, o.zip].filter(Boolean).join(', '))}</dd><dt>Tipo</dt><dd>${esc(o.business_type || '')}</dd><dt>EIN / reventa</dt><dd>${esc(o.ein || '—')}</dd></dl></div>
<div class="card pad"><h2>Pago</h2><dl class="kv"><dt>Total</dt><dd><strong>${usd(o.total)}</strong>${o.tax ? ` <small>(tax ${usd(o.tax)})</small>` : ''}</dd><dt>Forma</dt><dd>${esc(o.payment || '—')}</dd>
<dt>Factura</dt><dd>${o.invoice ? `<a href="${esc(o.invoice_url)}" target="_blank">Ver factura</a> · <a href="${esc(o.invoice_pdf)}" target="_blank">PDF</a> · <a href="${dash}/invoices/${o.invoice}" target="_blank">Stripe</a>` : o.origen === 'stripe' ? `Checkout online${o.stripe_customer ? ` · <a href="${dash}/customers/${o.stripe_customer}" target="_blank">Stripe</a>` : ''}` : 'Sin factura'}</dd>
<dt>Flete cobrado</dt><dd>${o.retiro ? 'Retiro en Miami' : o.flete != null ? (o.flete ? usd(o.flete) : 'Gratis') : o.invoice || o.origen === 'stripe' ? '—' : `se calcula al facturar (USD ${env.caja}/caja · gratis desde USD ${env.gratis.toLocaleString('en-US')})`}${o.flete_manual != null ? ' <small>(manual)</small>' : ''}</dd>
<dt>Ganancia</dt><dd>${o.total && !(o.items || []).some(i => !(+co[i.slug] > 0)) ? `<strong>${usd(neto(o) - costoV(o, co))}</strong>${o.envio_costo == null && !o.retiro ? ' <small>(sin costo de envío)</small>' : ''}` : '—'}</dd>
<dt>Notas</dt><dd>${esc(o.notes || '—')}</dd></dl></div></div>
<div class="card pad" style="margin-bottom:16px"><h2>Envío</h2><form method="post" class="inl" style="flex-wrap:wrap;gap:10px;align-items:end">${H('envio', r)}
<label>Lo que pagaste (UPS/FedEx)<input class="sm" type="number" step="0.01" min="0" name="costo" value="${o.envio_costo != null ? (+o.envio_costo).toFixed(2) : ''}" placeholder="USD"></label>
${!o.invoice && o.origen !== 'stripe' ? `<label>Flete a cobrar (opcional)<input class="sm" type="number" step="0.01" min="0" name="flete_manual" value="${o.flete_manual != null ? (+o.flete_manual).toFixed(2) : ''}" placeholder="auto"></label><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" name="retiro" value="1"${o.retiro ? ' checked' : ''}>Retiro en Miami</label>` : ''}
<button class="sec">Guardar</button></form><p class="mut" style="font-size:12px;margin:8px 0 0">El costo de envío se descuenta de la ganancia. "Flete a cobrar" vacío = automático según la regla de Stock.</p></div>
<div class="card tw" style="margin-bottom:16px"><table><thead><tr><th>SKU</th><th>Producto</th><th class="r">Cajas</th><th class="r">Origen</th></tr></thead><tbody>${items}</tbody></table></div>
<div class="card pad"><h2>Historial</h2><ul class="tl">${(o.hist || [{ at: o.at, txt: 'Venta creada' }]).slice().reverse().map(h => `<li><span>${fecha(h.at)}</span><div>${esc(h.txt)}</div></li>`).join('')}</ul></div>`;
}

function nueva({ t, cs, sel, rep }) {
  const c = sel || {}, rq = {}; if (rep) for (const i of rep.items || []) rq[i.slug] = i.cases;
  return `<div class="crumb"><a href="/admin?v=ventas">Ventas</a>/<span>Nueva</span></div><div class="hd"><div><h1>Nueva venta</h1><div class="sub">Para pedidos por teléfono, WhatsApp o en persona. Reserva stock al guardar.</div></div></div>
<form method="post" class="grid2">${H('nueva')}
<div class="card pad" style="display:grid;gap:14px;align-content:start"><h2>Cliente</h2>
<label>Cliente existente<select name="cliente" onchange="if(this.value)location.href='/admin?v=nueva&id='+encodeURIComponent(this.value)"><option value="">— Cliente nuevo —</option>${cs.map(x => `<option value="${esc(x.id)}"${x.id === c.id ? ' selected' : ''}>${esc(x.company || x.id)} · ${esc(x.id)}</option>`).join('')}</select></label>
<div class="fg">${[['company', 'Empresa *', 1], ['contact', 'Contacto'], ['email', 'Email *', 1, 'email'], ['phone', 'Teléfono'], ['address', 'Dirección'], ['city', 'Ciudad'], ['state', 'Estado'], ['zip', 'ZIP'], ['ein', 'EIN / reventa']].map(([n, l, req, ty]) => `<label>${l}<input name="${n}" type="${ty || 'text'}" value="${esc(c[n] || '')}"${req ? ' required' : ''}></label>`).join('')}
<label>Tipo<select name="business_type">${['HVAC-R dealer / supply house', 'Wholesaler / distributor', 'Contractor', 'Other business'].map(x => `<option${x === c.business_type ? ' selected' : ''}>${x}</option>`).join('')}</select></label></div></div>
<div class="card pad" style="display:grid;gap:14px;align-content:start"><h2>Productos</h2><div class="qgrid">${t.map(p => `<div class="qrow"><div class="prod"><img src="${p.img}" alt=""><div><strong>${esc(p.name)}</strong><br><small class="m">${p.sku}</small> · ${p.cases_available ? `<span class="ok">${p.cases_available} en stock</span>` : '<small>sin stock → pre-pedido</small>'}</div></div><input type="number" name="qty_${p.slug}" min="0" value="${rq[p.slug] || 0}" aria-label="Cajas ${p.sku}"></div>`).join('')}</div>
<label>Forma de pago<select name="payment"><option>Wire</option><option>Zelle</option><option>ACH</option><option>Card</option></select></label>
<label>Notas<textarea name="notes"></textarea></label><div><button>Guardar venta</button></div></div></form>`;
}

// ── CLIENTES ──
function clientes({ cs, ps, q }) {
  const by = {}; for (const o of ps) if (o.cliente) (by[o.cliente] = by[o.cliente] || []).push(o);
  let list = cs.map(c => { const os = (by[c.id] || []).filter(o => o.estado !== 'cancelado'); return { ...c, n: os.length, cajas: os.reduce((a, o) => a + cajas(o), 0), total: os.reduce((a, o) => a + (o.total || 0), 0), ult: os[0] && os[0].at }; });
  if (q) { const s = q.toLowerCase(); list = list.filter(c => [c.company, c.id, c.contact, c.city, c.state].join(' ').toLowerCase().includes(s)); }
  list.sort((a, b) => (b.ult || b.alta || '').localeCompare(a.ult || a.alta || ''));
  const rows = list.map(c => `<tr class="row" data-href="/admin?v=cliente&id=${encodeURIComponent(c.id)}"><td><a href="/admin?v=cliente&id=${encodeURIComponent(c.id)}"><strong>${esc(c.company || c.id)}</strong></a> ${c.exento ? tag('exento') : ''}<br><small>${esc(c.contact || '')} · ${esc(c.id)}</small></td>
<td>${esc([c.city, c.state].filter(Boolean).join(', '))}<br><small>${esc(c.business_type || '')}</small></td><td class="num">${c.n}</td><td class="num">${c.cajas}</td><td class="r">${usd(c.total)}</td><td><small>${c.ult ? dia(c.ult) : '—'}</small></td></tr>`).join('');
  return `<div class="hd"><div><h1>Clientes</h1><div class="sub">Se crean solos con cada pedido. El email es la clave.</div></div><form method="get" class="inl"><input type="hidden" name="v" value="clientes"><input name="q" value="${esc(q)}" placeholder="Buscar empresa, email, ciudad" style="width:260px"></form></div>
<div class="card tw">${rows ? `<table><thead><tr><th>Empresa</th><th>Ubicación</th><th class="r">Ventas</th><th class="r">Cajas</th><th class="r">Facturado</th><th>Última</th></tr></thead><tbody>${rows}</tbody></table>` : empty('Todavía no hay clientes.')}</div>`;
}

function cliente({ c, ps }) {
  const os = ps.filter(o => o.cliente === c.id), ok = os.filter(o => o.estado !== 'cancelado');
  const rows = os.map(o => `<tr class="row" data-href="/admin?v=venta&ref=${o.ref}"><td><a href="/admin?v=venta&ref=${o.ref}" class="m">${o.ref}</a><br><small>${fecha(o.at)}</small></td><td>${(o.items || []).map(i => `${i.cases}× <span class="m">${esc(i.sku)}</span>`).join(', ')}</td><td class="r">${usd(o.total)}</td><td>${tag(o.estado)}</td></tr>`).join('');
  const F = [['company', 'Empresa'], ['contact', 'Contacto'], ['phone', 'Teléfono'], ['address', 'Dirección'], ['city', 'Ciudad'], ['state', 'Estado'], ['zip', 'ZIP'], ['ein', 'EIN / reventa']];
  return `<div class="crumb"><a href="/admin?v=clientes">Clientes</a>/<span>${esc(c.company || c.id)}</span></div>
<div class="hd"><div><h1>${esc(c.company || c.id)}</h1><div class="sub">${esc(c.id)} · cliente desde ${dia(c.alta)}</div></div><a class="btn" href="/admin?v=nueva&id=${encodeURIComponent(c.id)}">+ Nueva venta</a></div>
<div class="kpis"><div class="kpi"><div class="l">Ventas</div><div class="n">${ok.length}</div></div><div class="kpi"><div class="l">Cajas</div><div class="n">${ok.reduce((a, o) => a + cajas(o), 0)}</div></div><div class="kpi"><div class="l">Facturado</div><div class="n" style="font-size:26px">${usd(ok.reduce((a, o) => a + (o.total || 0), 0))}</div></div><div class="kpi"><div class="l">Sales tax</div><div class="n" style="font-size:26px">${c.exento ? 'Exento' : 'Con tax'}</div></div></div>
<div class="grid2"><form method="post" class="card pad" style="display:grid;gap:14px">${H('cliente', { id: c.id })}<h2>Datos</h2><div class="fg">${F.map(([n, l]) => `<label>${l}<input name="${n}" value="${esc(c[n] || '')}"></label>`).join('')}
<label>Tipo<select name="business_type">${['HVAC-R dealer / supply house', 'Wholesaler / distributor', 'Contractor', 'Other business'].map(x => `<option${x === c.business_type ? ' selected' : ''}>${x}</option>`).join('')}</select></label></div>
<label class="chk"><input type="checkbox" name="exento" value="1"${c.exento ? ' checked' : ''}>Exento de sales tax (tengo su certificado de reventa)</label>
<label>Notas internas<textarea name="notas">${esc(c.notas || '')}</textarea></label><div><button>Guardar cambios</button></div></form>
<div class="card tw" style="align-self:start"><div style="padding:16px 16px 0"><h2>Ventas</h2></div>${rows ? `<table style="min-width:0"><tbody>${rows}</tbody></table>` : empty('Sin ventas.')}</div></div>`;
}

// ── STOCK ──
function stock({ t, pr, ps, co = {}, env = { caja: 35, gratis: 2000 } }) {
  const res = {}; for (const o of ps.filter(ACTIVOS)) for (const i of o.items || []) { const r = res[i.slug] = res[i.slug] || { r: 0, p: 0 }; r.r += i.reserved || 0; r.p += i.preorder || 0; }
  const tot = t.reduce((a, p) => a + p.cases_available, 0);
  const rows = t.map(p => { const price = pr[p.slug], x = res[p.slug] || { r: 0, p: 0 };
    return `<tr class="row" data-href="/admin?v=producto&s=${p.slug}"><td><div class="prod"><img src="${p.img}" alt=""><div><a href="/admin?v=producto&s=${p.slug}"><strong>${esc(p.name)}</strong></a><br><small class="m">${p.sku}</small>${p.units ? ` <small>· ${p.units} u/caja</small>` : ''}</div></div></td>
<td class="num ${p.cases_available ? 'ok' : 'no'}">${p.cases_available}</td><td class="num">${x.r}</td><td class="num">${x.p}</td>
<td><form method="post" class="inl">${H('stock', { s: p.slug })}<input class="sm" type="number" name="v" placeholder="cajas"><button name="modo" value="sumar" class="sec">+ Sumar</button><button name="modo" value="fijar" class="sec">Fijar</button></form></td>
<td><form method="post" class="inl">${H('precio', { s: p.slug })}<input class="sm" type="number" step="0.01" min="0" name="v" value="${price ? (price.unit_amount / 100).toFixed(2) : ''}" placeholder="USD"><button class="sec">Guardar</button></form></td>
<td><form method="post" class="inl">${H('costo', { s: p.slug })}<input class="sm" type="number" step="0.01" min="0" name="v" value="${+co[p.slug] > 0 ? (+co[p.slug]).toFixed(2) : ''}" placeholder="USD"><button class="sec">Guardar</button></form>${price && +co[p.slug] > 0 ? `<br><small>margen ${Math.round((price.unit_amount / 100 - co[p.slug]) / (price.unit_amount / 100) * 100)}%</small>` : ''}</td>
<td>${price ? btn('online', { s: p.slug, v: p.online ? '0' : '1' }, p.online ? '<span class="dot ok"></span>Online' : '<span class="dot"></span>Solo factura', 'lnk') : '<small>sin precio</small>'}</td></tr>`; }).join('');
  return `<div class="hd"><div><h1>Stock</h1><div class="sub">En cajas. Lo que está acá es lo que ven los clientes y las IA en /order y /catalog.json.</div></div></div>
<div class="kpis"><div class="kpi"><div class="l">Cajas disponibles</div><div class="n">${tot}</div></div><div class="kpi"><div class="l">Reservadas</div><div class="n">${Object.values(res).reduce((a, x) => a + x.r, 0)}</div><div class="s">en ventas activas</div></div><div class="kpi"><div class="l">Pre-pedido</div><div class="n">${Object.values(res).reduce((a, x) => a + x.p, 0)}</div><div class="s">cajas a cubrir</div></div><div class="kpi"><div class="l">SKUs online</div><div class="n">${t.filter(p => p.online).length}/${t.length}</div></div></div>
<div class="card tw"><table><thead><tr><th>Producto</th><th class="r">Disponible</th><th class="r">Reservado</th><th class="r">Pre-pedido</th><th>Ajustar</th><th>Precio / caja</th><th>Costo / caja</th><th>Venta online</th></tr></thead><tbody>${rows}</tbody></table></div>
<p class="mut" style="font-size:12px">El precio se guarda en Stripe y se muestra en el resumen del checkout de /order. "Online" muestra el pago con tarjeta/ACH en /order cuando hay stock. El costo por caja (puesto en Miami: EXW + importación) es interno y se usa para calcular la ganancia en Ventas.</p>
<div class="card pad"><h2>Envío</h2><form method="post" class="inl" style="flex-wrap:wrap;gap:10px;align-items:end">${H('envio_cfg')}<label>Tarifa por caja (USD)<input class="sm" type="number" step="0.01" min="0" name="caja" value="${env.caja}"></label><label>Envío gratis desde (USD, sin tax)<input class="sm" type="number" step="1" min="1" name="gratis" value="${env.gratis}"></label><button class="sec">Guardar</button></form>
<p class="mut" style="font-size:12px;margin:8px 0 0">EE.UU. continental. Se aplica en el pago online (Stripe) y en las facturas. Retiro en Miami siempre sin cargo.</p></div>
<div class="card pad" style="margin-top:16px;border-color:#e2b4a0"><h2>Borrar datos de prueba</h2><p class="mut" style="font-size:13px;margin:0 0 12px">Borra todas las ventas, clientes, movimientos de stock y el historial de pagos. Quedan los precios, costos, venta online y la configuración de envío. No se puede deshacer.</p>
<form method="post" class="inl" style="flex-wrap:wrap;gap:10px;align-items:center" onsubmit="return confirm('¿Borrar todas las ventas y clientes? No se puede deshacer.')">${H('reset')}<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" name="stock" value="1" checked>Poner también el stock en 0</label><input class="sm" style="width:130px" name="conf" placeholder="escribí BORRAR" autocomplete="off"><button class="danger">Borrar datos</button></form></div>`;
}

function producto({ p, price, ms, ps }) {
  const os = ps.filter(o => (o.items || []).some(i => i.slug === p.slug));
  const mrows = ms.map(m => `<tr><td><small>${fecha(m.at)}</small></td><td>${esc(m.motivo)}</td><td class="num ${m.delta > 0 ? 'ok' : 'no'}">${m.delta > 0 ? '+' : ''}${m.delta}</td><td>${m.ref ? `<a class="m" href="/admin?v=venta&ref=${m.ref}">${m.ref}</a>` : ''}</td></tr>`).join('');
  const orows = os.map(o => { const i = o.items.find(x => x.slug === p.slug); return `<tr class="row" data-href="/admin?v=venta&ref=${o.ref}"><td><a class="m" href="/admin?v=venta&ref=${o.ref}">${o.ref}</a><br><small>${fecha(o.at)}</small></td><td>${o.cliente ? `<a href="/admin?v=cliente&id=${encodeURIComponent(o.cliente)}">${esc(o.company)}</a>` : esc(o.company)}</td><td class="num">${i.cases}</td><td>${tag(o.estado)}</td></tr>`; }).join('');
  return `<div class="crumb"><a href="/admin?v=stock">Stock</a>/<span>${p.sku}</span></div>
<div class="hd"><div class="prod"><img src="${p.img}" alt="" style="width:72px;height:72px"><div><h1>${esc(p.name)}</h1><div class="sub"><span class="m">${p.sku}</span> · ${esc(p.desc)}${p.units ? ' · ' + p.units + ' u/caja' : ''}</div></div></div>
<form method="post" class="inl">${H('stock', { s: p.slug, r: 'producto' })}<input class="sm" type="number" name="v" placeholder="cajas"><button name="modo" value="sumar">+ Ingreso</button><button name="modo" value="fijar" class="sec">Fijar inventario</button></form></div>
<div class="kpis"><div class="kpi"><div class="l">Disponible</div><div class="n ${p.cases_available ? 'ok' : 'no'}">${p.cases_available}</div><div class="s">cajas</div></div><div class="kpi"><div class="l">Precio / caja</div><div class="n" style="font-size:26px">${price ? usd(price.unit_amount / 100) : '—'}</div></div><div class="kpi"><div class="l">Online</div><div class="n" style="font-size:26px">${p.online ? 'Sí' : 'No'}</div></div><div class="kpi"><div class="l">Ventas</div><div class="n">${os.length}</div></div></div>
<div class="grid2"><div class="card tw"><div style="padding:16px 16px 0"><h2>Movimientos</h2></div>${mrows ? `<table style="min-width:0"><tbody>${mrows}</tbody></table>` : empty('Sin movimientos todavía.')}</div>
<div class="card tw" style="align-self:start"><div style="padding:16px 16px 0"><h2>Ventas con este producto</h2></div>${orows ? `<table style="min-width:0"><tbody>${orows}</tbody></table>` : empty('Sin ventas.')}</div></div>`;
}

// ── INICIO / PORTAL ──
function inicio({ ps, cs, t, mail, k, dash }) {
  const act = ps.filter(ACTIVOS), porCobrar = act.filter(o => ['confirmado', 'pago pendiente'].includes(o.estado));
  const K = encodeURIComponent(k || '');
  const G = (title, items) => `<div class="lg"><h2><i></i>${title}</h2><ul>${items.map(([href, l, s, ext]) => `<li><a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${l}${s ? `<small>${s}</small>` : ''}</a></li>`).join('')}</ul></div>`;
  const rec = ps.slice(0, 6).map(o => `<tr class="row" data-href="/admin?v=venta&ref=${o.ref}"><td><a class="m" href="/admin?v=venta&ref=${o.ref}">${o.ref}</a><br><small>${fecha(o.at)}</small></td><td><strong>${esc(o.company)}</strong></td><td>${cajas(o)} caja(s)</td><td>${tag(o.estado)}</td></tr>`).join('');
  return `<div class="hd"><div><h1>Portal K11</h1><div class="sub">Todo en un lugar: ventas, stock, campaña de mails, sitio y servicios.</div></div><a class="btn" href="/admin?v=nueva">+ Nueva venta</a></div>
<div class="kpis">
<a class="kpi" href="/admin?v=ventas&f=nuevo"><div class="l">Por facturar</div><div class="n">${act.filter(o => o.estado === 'nuevo').length}</div><div class="s">ventas nuevas</div></a>
<a class="kpi" href="/admin?v=ventas&f=porcobrar"><div class="l">Por cobrar</div><div class="n">${porCobrar.length}</div><div class="s">${usd(porCobrar.reduce((a, o) => a + (o.total || 0), 0))}</div></a>
<a class="kpi" href="/admin?v=ventas&f=pagado"><div class="l">A despachar</div><div class="n">${act.filter(o => o.estado === 'pagado').length}</div><div class="s">pagadas</div></a>
<a class="kpi" href="/admin?v=stock"><div class="l">Stock</div><div class="n">${t.reduce((a, p) => a + p.cases_available, 0)}</div><div class="s">cajas disponibles</div></a>
<a class="kpi" href="/api/panel?k=${K}"><div class="l">Mails campaña</div><div class="n">${mail ? mail.enviado : '—'}</div><div class="s">${mail ? `enviados · ${mail.pendiente} pendientes · ${mail.bajas} bajas` : 'sin datos'}</div></a>
</div>
<div class="links">
${G('Gestión', [['/admin?v=ventas', 'Ventas', act.length + ' activas'], ['/admin?v=nueva', 'Nueva venta'], ['/admin?v=clientes', 'Clientes', cs.length], ['/admin?v=stock', 'Stock y precios']])}
${G('Campaña de mails', [['/api/panel?k=' + K, 'Panel de envíos', 'ver, dar de baja'], ['/api/enviar?k=' + K + '&simular=1', 'Simular envío de hoy', 'no envía', 1], ['/api/test?k=' + K, 'Mandarme un mail de prueba', '', 1], ['https://resend.com/emails', 'Resend · historial', '↗', 1]])}
${G('Tienda pública', [['/order', 'Página de compra', 'EN', 1], ['/es/order', 'Página de compra', 'ES', 1], ['/api/stock', 'Stock en vivo (JSON)', '', 1], ['/catalog.json', 'Catálogo para IA', '', 1], ['/llms.txt', 'llms.txt', '', 1]])}
${G('Sitio web', [['/', 'Inicio', '', 1], ['/products', 'Productos', '', 1], ['/docs', 'Hojas de seguridad (SDS)', '', 1], ['/distributors', 'Distribuidores', '', 1], ['/es', 'Versión español', '', 1], ['/sitemap.xml', 'Sitemap', '', 1]])}
${G('Materiales (con contraseña)', [['/k11', 'Todos los materiales', '', 1], ['/k11/precios', 'Lista de precios', '', 1], ['/k11/ficha', 'Ficha técnica', '', 1], ['/k11/flyer', 'Flyer distribuidores', '', 1], ['/k11/kit', 'Kit de impresión', '', 1], ['/k11/margenes', 'Márgenes', '', 1], ['/k11/carta', 'Carta de presentación', '', 1], ['/k11/formulario', 'Formulario', '', 1], ['/k11/tarjeta', 'Tarjeta personal', '', 1]])}
${G('Redes sociales', [['/admin?v=redes', 'Calendario mensual', 'aprobar mes'], ['https://app.upload-post.com/manage-users', 'Upload-Post · cuentas', '↗', 1], ['https://business.facebook.com', 'Meta Business Suite', '↗', 1], ['https://www.linkedin.com', 'LinkedIn', '↗', 1], ['https://business.google.com', 'Google Business', '↗', 1]])}
${G('Servicios', [[dash, 'Stripe · panel', '↗', 1], [dash + '/payments', 'Stripe · pagos', '↗', 1], [dash + '/invoices', 'Stripe · facturas', '↗', 1], [dash + '/webhooks', 'Stripe · webhooks', '↗', 1], ['https://vercel.com/dashboard', 'Vercel · deploys y variables', '↗', 1], ['https://console.upstash.com', 'Upstash · base de datos', '↗', 1], ['https://analytics.google.com', 'Google Analytics', '↗', 1], ['https://github.com', 'GitHub · repo wylco-site', '↗', 1]])}
</div>
<div class="card tw"><div style="padding:16px 16px 0;display:flex;justify-content:space-between;align-items:center"><h2>Últimas ventas</h2><a href="/admin?v=ventas&f=todas">Ver todas →</a></div>${rec ? `<table><tbody>${rec}</tbody></table>` : empty('Todavía no hay ventas.')}</div>`;
}

// ── REDES (por mes) ──
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const TIPO = { tip: 'Tip mostrador', case: 'Caso de campo', promo: 'Distribuidores', tour: 'Gira' };
const MES = ym => new Date(ym + '-15T12:00:00Z').toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
function redes({ m, meses, conn, hasKey, NETS, IMG_NETS, seller, aliados = [] }) {
  const st = !hasKey ? `<div class="steps-c"><h2>Conectar las redes (una sola vez)</h2><ol>
<li>Crear las cuentas de la marca: Instagram (profesional), página de Facebook, página de empresa en LinkedIn y Google Business Profile.</li>
<li>En <a href="https://app.upload-post.com/manage-users" target="_blank" rel="noopener">Upload-Post → Manage Users</a> crear el perfil <b>wylco</b> y conectar ahí las 4 redes.</li>
<li>En Vercel cargar <b>UPLOADPOST_API_KEY</b> (API Keys de Upload-Post) y, si el perfil no se llama wylco, <b>UPLOADPOST_USER</b>. Opcional: <b>UPLOADPOST_FB_PAGE</b> (ID página Facebook) y <b>UPLOADPOST_LI_PAGE</b> (ID página LinkedIn). Redeploy.</li>
<li>Volver acá, revisar el mes y tocar <b>Aprobar mes</b>: todo queda programado.</li></ol>
<p class="mut" style="margin:10px 0 0;font-size:13px">Mientras tanto podés publicar a mano: descargá la imagen y copiá el texto.</p></div>`
    : `<div class="mode"><span><span class="dot ok"></span>Upload-Post <b>conectado</b></span>${conn ? IMG_NETS.map(n => `<span><span class="dot ${conn.includes(n) ? 'ok' : 'no'}"></span>${NETS[n]}</span>`).join('') : '<span class="no">No se pudo leer las cuentas</span>'}</div>`;
  const ok = m.estado === 'aprobado', act = m.posts.filter(p => !p.off).length;
  const tabs = `<div class="chips">${meses.map(y => `<a href="/admin?v=redes&m=${y}" class="${y === m.ym ? 'on' : ''}">${MES(y)}</a>`).join('')}</div>`;
  const head = `<div class="whd"><div><h2 style="margin:0;text-transform:capitalize">${MES(m.ym)} · ${esc(m.name)}</h2><small class="mut">${act} posts · lun/mié/vie 10:00 Miami · ${ok ? 'Aprobado ' + fecha(m.aprobado) : 'Borrador'}${m.draft ? ' · <b class="no">fechas a confirmar</b>' : ''}</small></div><div class="acts">
${ok ? btn('socm_cancel', { ym: m.ym }, 'Cancelar aprobación', 'danger', '¿Cancelar todos los posts programados del mes?') : btn('socm_regen', { ym: m.ym }, 'Regenerar mes', 'sec', '¿Volver a generar el mes? Se pierden tus ediciones.') + (hasKey ? btn('socm_ok', { ym: m.ym }, 'Aprobar mes (' + act + ' posts)', '', '¿Programar los ' + act + ' posts del mes en todas las redes elegidas?') : '')}</div></div>`;
  const cards = m.posts.map((p, i) => { const d = new Date(p.day + 'T12:00:00Z');
    return `<div class="sp"${p.off ? ' style="opacity:.45"' : ''}><a href="${p.imgPath.split('?')[0]}?v=3" download target="_blank"><img src="${p.imgPath.split('?')[0]}?v=3" alt="" loading="lazy"></a><div class="bd">
<div class="when"><span>${DIAS[d.getUTCDay()]} ${d.getUTCDate()} · 10:00</span>${p.estado ? tag(p.estado) : `<span class="tag${p.type === 'tour' ? ' t-nuevo' : ''}">${TIPO[p.type] || p.type}</span>`}</div>
${p.err ? `<small class="no">${esc(p.err)}</small>` : ''}
<form method="post" style="display:grid;gap:10px">${H('socm_edit', { ym: m.ym, i })}<textarea name="text"${ok ? ' readonly' : ''}>${esc(p.text)}</textarea>
<div class="nets">${IMG_NETS.map(n => `<label><input type="checkbox" name="net_${n}" value="1"${p.nets.includes(n) ? ' checked' : ''}${ok ? ' disabled' : ''}>${NETS[n]}</label>`).join('')}<label><input type="checkbox" name="off" value="1"${p.off ? ' checked' : ''}${ok ? ' disabled' : ''}>No publicar</label></div>
<div class="acts">${ok ? '' : '<button class="sec">Guardar</button>'}<a class="btn sec" href="${p.imgPath.split('?')[0]}?v=3" download>Imagen</a><button type="button" class="sec" onclick="navigator.clipboard.writeText(this.form.text.value);this.textContent='Copiado ✓'">Copiar texto</button></div></form></div></div>`; }).join('');
  return `<div class="hd"><div><h1>Redes sociales</h1><div class="sub">Calendario mensual para distribuidores y casas de repuestos HVAC-R. Cada post firma como <b>${esc(seller)}</b> y lleva link a /order. Se aprueba el mes completo.</div></div></div>
${st}
<details class="card pad" style="margin-bottom:18px"><summary style="cursor:pointer;font-weight:700">Cuentas aliadas / influencers · ${aliados.filter(a => a.estado === 'ok').length} se mencionan en cada post</summary>
<p class="mut" style="font-size:13px">Una cuenta por línea: <code>@handle | red | nota | estado</code>. Estado: <b>candidato</b> → <b>contactado</b> → <b>ok</b> (aceptó) o <b>no</b>. Solo las <b>ok</b> se arroban automáticamente (máx. 5 por post). Arrobar sin acuerdo previo suele verse como spam y baja el alcance.</p>
<table style="min-width:0;margin:10px 0"><thead><tr><th>Cuenta</th><th>Red</th><th>Nota</th><th>Estado</th></tr></thead><tbody>${aliados.map(a => `<tr><td class="m"><a href="https://www.${a.red === 'tiktok' ? 'tiktok.com/' + a.h : 'instagram.com/' + a.h.slice(1)}" target="_blank" rel="noopener">${esc(a.h)}</a></td><td>${esc(a.red)}</td><td><small>${esc(a.nota)}</small></td><td><span class="tag${a.estado === 'ok' ? ' t-ok' : ''}">${esc(a.estado)}</span></td></tr>`).join('')}</tbody></table>
<form method="post" style="display:grid;gap:10px">${H('aliados')}<textarea name="txt" style="min-height:150px;font-family:ui-monospace,Menlo,monospace;font-size:12px">${esc(aliados.map(a => [a.h, a.red, a.nota, a.estado].join(' | ')).join('\n'))}</textarea><div><button class="sec">Guardar lista</button></div></form></details>
${tabs}${head}<div class="wk">${cards}</div>
<p class="mut" style="font-size:12px;margin-top:20px">TikTok y YouTube Shorts necesitan video vertical: se suman cuando lo tengas. Los casos de campo son escenarios típicos; reemplazalos por casos reales. Para enero: ajustar fechas y zonas de la gira en api/_lib/social.js (CAMPAIGNS) y tocar Regenerar mes.</p>`;
}

module.exports = { redes, inicio, layout, login, ventas, venta, nueva, clientes, cliente, stock, producto, ESTADOS, esc };
