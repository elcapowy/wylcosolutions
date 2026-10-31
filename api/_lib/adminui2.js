// Tarjetas extra del admin (envío/tracking, config de stock, descuentos, portal/cert de cliente, mail mensual, gastos).
const { esc } = require('./adminui');
const X = require('./extras');
const H = (a, extra = {}) => `<input type="hidden" name="a" value="${a}">` + Object.entries(extra).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join('');
const usd = n => 'USD ' + (+n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function despacho(o) {
  if (o.estado === 'cancelado') return '';
  const u = o.tracking ? X.trackUrl(o.carrier, o.tracking) : '';
  return `<div class="card pad" style="margin-bottom:16px"><h2>Despacho</h2>
${o.tracking ? `<p style="margin:0 0 10px">Enviado por <b>${esc(o.carrier || '')}</b> · ${u ? `<a href="${esc(u)}" target="_blank">${esc(o.tracking)}</a>` : esc(o.tracking)}${o.tracking_mail ? ' · <small>cliente avisado</small>' : ''}</p>` : ''}
${o.retiro ? `<form method="post" class="inl" onsubmit="return confirm('¿Avisar al cliente que está listo para retirar?')">${H('listo', { ref: o.ref })}<button class="sec">Avisar "listo para retirar"</button></form>` : `<form method="post" class="inl" style="flex-wrap:wrap;gap:10px;align-items:end">${H('tracking', { ref: o.ref })}
<label>Transporte<select name="carrier">${Object.keys(X.CARRIERS).map(c => `<option${c === (o.carrier || 'UPS') ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
<label>Nº de seguimiento<input name="tracking" value="${esc(o.tracking || '')}" style="width:220px" required></label>
<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" name="avisar" value="1" checked>Mandar mail al cliente</label><button>Guardar y marcar enviado</button></form>`}
<p class="mut" style="font-size:12px;margin:8px 0 0">El cliente ve el seguimiento en su portal: <a href="${esc(X.portalUrl(o.email))}" target="_blank">abrir portal</a></p></div>`;
}

function stockCfg({ t, min = {}, lleg = {}, desc = [] }) {
  const rows = t.map(p => { const l = lleg[p.slug] || {}; return `<tr><td><strong>${esc(p.name)}</strong><br><small class="m">${esc(p.sku)}</small></td>
<td><form method="post" class="inl">${H('minimo', { s: p.slug })}<input class="sm" type="number" min="0" name="v" value="${+min[p.slug] || ''}" placeholder="—"><button class="sec">OK</button></form></td>
<td><form method="post" class="inl" style="flex-wrap:wrap;gap:6px">${H('llegada', { s: p.slug })}<input class="sm" type="number" min="0" name="cajas" value="${l.cajas || ''}" placeholder="cajas"><input type="date" name="fecha" value="${esc(l.fecha || '')}" style="width:150px"><button class="sec">OK</button>${l.fecha ? `<button name="borrar" value="1" class="lnk">quitar</button>` : ''}</form></td></tr>`; }).join('');
  const d = desc.length ? desc : [{ min: '', pct: '' }];
  return `<div class="card tw" style="margin-top:16px"><div style="padding:16px 16px 0"><h2>Alertas y embarques</h2><small class="mut">Mínimo: te llega un mail cuando el stock baja de ese número. Embarque: /order muestra "llega el …" en vez de "pre-pedido".</small></div>
<table><thead><tr><th>Producto</th><th>Stock mínimo</th><th>Embarque en camino</th></tr></thead><tbody>${rows}</tbody></table></div>
<div class="card pad" style="margin-top:16px"><h2>Descuento por volumen</h2><form method="post" style="display:grid;gap:8px">${H('desc_cfg')}
${[0, 1, 2].map(i => `<div class="inl" style="gap:8px;align-items:center">Desde <input class="sm" type="number" min="1" name="min${i}" value="${(d[i] || {}).min || ''}" placeholder="cajas"> cajas → <input class="sm" type="number" min="0" max="50" step="0.5" name="pct${i}" value="${(d[i] || {}).pct || ''}" placeholder="%"> % off</div>`).join('')}
<div><button class="sec">Guardar</button></div></form><p class="mut" style="font-size:12px;margin:8px 0 0">Se aplica solo en el pago online y en las facturas, y se muestra en el resumen de /order. Un descuento fijo por cliente (en su ficha) gana si es mayor.</p></div>`;
}

function clienteExtra(c, ps) {
  const last = ps.filter(o => o.cliente === c.id && o.estado !== 'cancelado')[0];
  const cert = c.cert ? `<p style="margin:0 0 10px">Certificado ${esc(c.cert.num || '')} ${c.cert.file ? `(${esc(c.cert.file)}, llegó por mail)` : ''} · ${c.exento ? '<span class="tag t-ok">aprobado</span>' : `<span class="tag t-pre">pendiente</span> ${''}`}</p>${!c.exento ? `<form method="post" class="inl">${H('cert_ok', { id: c.id })}<button>Aprobar → exento de sales tax</button></form>` : ''}` : '<p class="mut" style="margin:0">Todavía no subió certificado de reventa.</p>';
  return `<div class="grid2" style="margin-top:16px"><div class="card pad"><h2>Portal y certificado</h2>${cert}
<p style="margin:12px 0 0"><a href="${esc(X.portalUrl(c.id))}" target="_blank">Abrir portal del cliente ↗</a> <button type="button" class="lnk" onclick="navigator.clipboard.writeText('${X.portalUrl(c.id)}');this.textContent='copiado'">copiar link</button></p>
${c.nomail ? '<p class="mut" style="font-size:12px">Se dio de baja de las novedades.</p>' : ''}</div>
<div class="card pad"><h2>Precio especial</h2><form method="post" class="inl" style="gap:8px;align-items:center">${H('desc_cli', { id: c.id })}<input class="sm" type="number" min="0" max="50" step="0.5" name="pct" value="${+c.desc_pct || ''}" placeholder="%"> % de descuento fijo<button class="sec">Guardar</button></form>
${last ? `<p style="margin:14px 0 0"><a class="btn sec" href="/admin?v=nueva&id=${encodeURIComponent(c.id)}&rep=${encodeURIComponent(last.ref)}">Repetir último pedido (${esc(last.ref)})</a></p>` : ''}</div></div>`;
}

function borradorMensual({ t, lleg = {}, mes }) {
  const disp = t.filter(p => p.cases_available > 0).map(p => `• ${p.name}: ${p.cases_available} case(s) in stock`);
  const ll = t.filter(p => lleg[p.slug] && lleg[p.slug].fecha).map(p => `• ${p.name}: arriving ${lleg[p.slug].fecha}`);
  return { s: `K11 update · ${mes}`, b: `Hi {nombre},\n\nHere is what is available this month for your counter:\n\n${disp.join('\n') || '• Stock arriving soon — pre-orders open.'}${ll.length ? '\n\nOn the way:\n' + ll.join('\n') : ''}\n\nOrder by the case (free shipping from $2,000): https://wylcosolutions.com/order?utm_source=email&utm_medium=monthly\n\n— Wylco · K11 America\nMiami, FL · +1 (954) 881-8870` };
}
function mensual({ cs, borrador }) {
  const n = cs.filter(c => !c.nomail && c.id).length;
  return `<div class="card pad" style="margin-top:16px"><h2>Mail mensual a clientes</h2><form method="post" style="display:grid;gap:10px" onsubmit="return confirm('¿Enviar a ${n} cliente(s)?')">${H('newsletter')}
<label>Asunto<input name="s" value="${esc(borrador.s)}"></label><label>Texto <small>({nombre} = contacto)</small><textarea name="b" style="min-height:220px">${esc(borrador.b)}</textarea></label>
<div class="inl" style="gap:10px;align-items:center"><button>Enviar a ${n} cliente(s)</button><button name="prueba" value="1" class="sec">Mandarme una prueba</button></div></form>
<p class="mut" style="font-size:12px;margin:8px 0 0">Cada mail lleva el link al portal y para darse de baja. Armado automático con el stock y los embarques cargados.</p></div>`;
}

function gastos(g = []) {
  return `<div class="card pad"><h2>Gastos fijos mensuales</h2><small class="mut">Depósito, software, seguros… se restan de la ganancia por cada mes del período.</small>
<table style="min-width:0;margin-top:8px"><tbody>${g.map((x, i) => `<tr><td>${esc(x.concepto)}</td><td class="r num">${usd(x.monto)}</td><td class="r"><form method="post" class="inl">${H('gasto_del', { i })}<button class="lnk">quitar</button></form></td></tr>`).join('')}
<tr style="font-weight:700"><td>Total por mes</td><td class="r num">${usd(g.reduce((a, x) => a + +x.monto, 0))}</td><td></td></tr></tbody></table>
<form method="post" class="inl" style="gap:8px;margin-top:10px;flex-wrap:wrap">${H('gasto_add')}<input name="concepto" placeholder="Concepto" required style="width:180px"><input class="sm" type="number" step="0.01" min="0" name="monto" placeholder="USD/mes" required><button class="sec">Agregar</button></form></div>`;
}
module.exports = { despacho, stockCfg, clienteExtra, borradorMensual, mensual, gastos };
