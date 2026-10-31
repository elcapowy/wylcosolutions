// Mejoras (nov 2026): backup/restauración, reposición, log de auditoría, roles, niveles de precio, recompra, Shippo, chequeo de lanzamiento.
const { redis, toObj } = require('./core');
const X = require('./extras');
const T = require('./tienda');
const { esc } = require('./adminui');
const DIA = 864e5, now = () => new Date().toISOString();
const usd = n => 'USD ' + (+n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const H = (a, extra = {}) => `<input type="hidden" name="a" value="${a}">` + Object.entries(extra).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join('');
const hobj = x => Array.isArray(x) ? toObj(x) : (x || {});
const dfecha = s => s ? new Date(s).toLocaleString('es-AR', { timeZone: 'America/New_York', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── roles: ADMIN_TOKEN = todo · ADMIN_TOKEN_DEPOSITO = despacho (ventas, stock, tracking, etiquetas) ──
function rolDe(tok) { if (!tok) return null; if (tok === process.env.ADMIN_TOKEN) return 'admin'; if (process.env.ADMIN_TOKEN_DEPOSITO && tok === process.env.ADMIN_TOKEN_DEPOSITO) return 'deposito'; return null; }
const DEP_V = ['ventas', 'venta', 'venta_envio', 'stock', 'producto'];
const depPuede = b => ['tracking', 'envio', 'listo', 'ship_buy', 'dir_venta'].includes(b.a) || (b.a === 'estado' && b.v === 'enviado');

// ── log de auditoría (k11:log, últimas 1000) ──
async function log(e) { try { await redis([['LPUSH', 'k11:log', JSON.stringify({ at: now(), ...e })], ['LTRIM', 'k11:log', 0, 999]]); } catch {} }
async function logs(n = 150) { try { const [l] = await redis([['LRANGE', 'k11:log', 0, n - 1]]); return (l || []).map(x => { try { return JSON.parse(x); } catch { return null; } }).filter(Boolean); } catch { return []; } }

// ── backup / restauración ──
const SKIP = /^k11:(evt:|alerta:|sess$)/;
const LEER = { hash: k => ['HGETALL', k], string: k => ['GET', k], list: k => ['LRANGE', k, 0, -1], set: k => ['SMEMBERS', k], zset: k => ['ZRANGE', k, 0, -1, 'WITHSCORES'] };
async function backup() {
  const [keys] = await redis([['KEYS', 'k11:*']]);
  const ks = (keys || []).filter(k => !SKIP.test(k)).sort();
  const ty = ks.length ? await redis(ks.map(k => ['TYPE', k])) : [];
  const ok = ks.map((k, i) => [k, ty[i]]).filter(([, t]) => LEER[t]);
  const vals = ok.length ? await redis(ok.map(([k, t]) => LEER[t](k))) : [];
  const data = {}; ok.forEach(([k, t], i) => data[k] = { t, v: t === 'hash' ? hobj(vals[i]) : vals[i] });
  return { at: now(), keys: ok.length, data };
}
async function restaurar(txt) {
  let b; try { b = JSON.parse(txt); } catch { throw new Error('El archivo no es un backup válido'); }
  if (!b || !b.data) throw new Error('El archivo no es un backup válido');
  const cmds = [];
  for (const [k, { t, v }] of Object.entries(b.data)) {
    if (!/^k11:/.test(k)) continue; cmds.push(['DEL', k]);
    if (t === 'string' && v != null) cmds.push(['SET', k, v]);
    else if (t === 'hash') { const f = Object.entries(v || {}).flat(); if (f.length) cmds.push(['HSET', k, ...f]); }
    else if (t === 'list' && v && v.length) cmds.push(['RPUSH', k, ...v]);
    else if (t === 'set' && v && v.length) cmds.push(['SADD', k, ...v]);
    else if (t === 'zset' && v && v.length) { const a = []; for (let i = 0; i < v.length; i += 2) a.push(v[i + 1], v[i]); cmds.push(['ZADD', k, ...a]); }
  }
  for (let i = 0; i < cmds.length; i += 40) await redis(cmds.slice(i, i + 40));
  return { n: Object.keys(b.data).length, at: b.at };
}
async function backupDiario() {
  const b = await backup(), s = JSON.stringify(b), d = b.at.slice(0, 10);
  await X.mail(X.TO(), `[K11] Backup diario ${d} · ${b.keys} claves`, `Backup automático de la base K11 (ventas, clientes, stock, costos, compras, configuración).\n\nGuardá el adjunto. Para restaurar: /admin?v=sistema → Restaurar backup.`, [{ filename: `k11-backup-${d}.json`, content: Buffer.from(s).toString('base64') }]);
  await X.setCfg('backup_at', { at: b.at, keys: b.keys, kb: Math.round(s.length / 1024) });
  return b.keys;
}

// ── reposición: ritmo de venta → días de stock → cuándo y cuánto pedir ──
async function reorden(t, ps) {
  const rc = await X.cfg('reorden', { transito: 60, cobertura: 90 }), lead = +rc.transito || 60, cob = +rc.cobertura || 90;
  let comp = []; try { comp = await require('./compras').lista(); } catch {}
  const lleg = await X.cfg('llegada', {}), hoy = Date.now(), act = ps.filter(o => o.estado !== 'cancelado');
  const prim = act.reduce((m, o) => Math.min(m, Date.parse(o.at) || hoy), hoy), dias = Math.max(14, Math.min(90, (hoy - prim) / DIA));
  const abiertas = comp.filter(c => ['pedido', 'en camino'].includes(c.estado));
  const rows = t.map(p => {
    const vend = act.filter(o => hoy - Date.parse(o.at) <= dias * DIA).reduce((a, o) => a + (o.items || []).filter(i => i.slug === p.slug).reduce((b, i) => b + i.cases, 0), 0);
    const v = vend / dias, st = p.cases_available;
    let ent = abiertas.reduce((a, c) => a + (+((c.items || []).find(i => i.slug === p.slug) || {}).cases || 0), 0);
    if (!ent && lleg[p.slug]) ent = +lleg[p.slug].cajas || 0;
    const dl = v > 0 ? st / v : null, dlt = v > 0 ? (st + ent) / v : null;
    const sug = v > 0 ? Math.max(0, Math.ceil(v * (lead + cob) - st - ent)) : 0;
    const pedirEn = dlt != null ? Math.round(dlt - lead) : null;
    return { p, st, ent, v, dl, sug, pedirEn, alerta: dlt != null && dlt <= lead + 14 };
  });
  return { lead, cob, dias: Math.round(dias), rows };
}
function vReorden(R) {
  const rows = R.rows.map(r => `<tr><td><strong>${esc(r.p.name)}</strong><br><small class="m">${esc(r.p.sku)}</small></td><td class="num">${r.st}</td><td class="num">${r.ent || '—'}</td><td class="num">${r.v ? (r.v * 30).toFixed(1) : '—'}</td><td class="num">${r.dl != null ? Math.round(r.dl) + ' d' : '—'}</td>
<td>${r.pedirEn == null ? '<small class="mut">sin ventas todavía</small>' : r.alerta ? `<strong style="color:var(--od,#b42318)">${r.pedirEn <= 0 ? 'Pedir ya' : 'Pedir en ' + r.pedirEn + ' d'}</strong>` : `<small>en ${r.pedirEn} días</small>`}</td><td class="num"><strong>${r.sug || '—'}</strong></td></tr>`).join('');
  return `<div class="card tw" style="margin-top:18px"><div style="padding:16px 16px 0;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:end"><div><h2>Reposición</h2><small class="mut">Ritmo de venta de los últimos ${R.dias} días. Sugerido = cubrir tránsito (${R.lead} d) + ${R.cob} d de venta, menos stock y lo que viene en camino.</small></div>
<form method="post" class="inl">${H('reorden_cfg')}<label><small>Tránsito (días)</small> <input class="sm" type="number" name="transito" value="${R.lead}" min="1"></label><label><small>Cobertura (días)</small> <input class="sm" type="number" name="cobertura" value="${R.cob}" min="7"></label><button class="sec">Guardar</button></form></div>
<table><thead><tr><th>Producto</th><th class="r">Stock</th><th class="r">En camino</th><th class="r">Cajas / mes</th><th class="r">Alcanza</th><th>Pedido a fábrica</th><th class="r">Sugerido</th></tr></thead><tbody>${rows}</tbody></table>
<div style="padding:12px 16px"><a class="btn sec" href="/admin?v=compras">Ir a Compras</a></div></div>`;
}
async function alertaReorden(t, ps) {
  const R = await reorden(t, ps), al = R.rows.filter(r => r.alerta); if (!al.length) return [];
  const [ok] = await redis([['SET', 'k11:alerta:reorden', '1', 'NX', 'EX', String(7 * 86400)]]); if (ok !== 'OK') return [];
  await X.mail(X.TO(), `[K11] Reposición: ${al.length} producto(s) para pedir a fábrica`, al.map(r => `${r.p.sku} ${r.p.name}: stock ${r.st}, en camino ${r.ent}, alcanza ${r.dl != null ? Math.round(r.dl) : '—'} días → sugerido ${r.sug} cajas`).join('\n') + `\n\nTránsito considerado: ${R.lead} días.\n${X.SITE}/admin?v=stock`).catch(() => {});
  return al.map(r => r.p.sku);
}

// ── niveles de precio por cliente ──
const NIVELES = [['distribuidor', 'Distribuidor'], ['mayorista', 'Mayorista'], ['cuenta', 'Cuenta clave']];
async function pctNivel(c) { if (!c || !c.nivel) return 0; const n = await X.cfg('niveles', {}); return +n[c.nivel] || 0; }
function nivelForm(c, niv) {
  return `<form method="post" class="card pad" style="margin-top:18px;display:grid;gap:10px">${H('nivel_cli', { id: c.id })}<h2>Nivel de precio</h2>
<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end"><select name="nivel">${NIVELES.map(([k, l]) => `<option value="${k}"${(c.nivel || 'distribuidor') === k ? ' selected' : ''}>${l}${+niv[k] ? ' · −' + niv[k] + '%' : ''}</option>`).join('')}</select><button class="sec">Guardar</button></div>
<small class="mut">Se aplica en facturas y en el checkout online (con el email del cliente). Si también hay descuento por volumen o fijo, gana el mayor. Los % se editan en Sistema.</small></form>`;
}

// ── recompra: avisa cuando un cliente pasó su frecuencia habitual de compra ──
async function recompra(ps, simular) {
  const out = [];
  for (const c0 of await T.clientes()) {
    if (!c0.id || c0.nomail) continue;
    const os = ps.filter(o => o.cliente === c0.id && o.estado !== 'cancelado' && o.at).sort((a, b) => a.at.localeCompare(b.at));
    if (os.length < 2) continue;
    const ts = os.map(o => Date.parse(o.at)), avg = (ts[ts.length - 1] - ts[0]) / (ts.length - 1), ult = os[os.length - 1];
    if (avg < 7 * DIA || Date.now() - ts[ts.length - 1] < avg || (c0.recompra && c0.recompra >= ult.at)) continue;
    out.push(c0.id); if (simular) continue;
    const es = ult.lang === 'es', hi = (es ? 'Hola' : 'Hi') + (c0.contact ? ' ' + c0.contact.split(' ')[0] : '') + ',';
    const link = `${X.SITE}${es ? '/es' : ''}/order?${(ult.items || []).map(i => 'qty_' + i.slug + '=' + i.cases).join('&')}&utm_source=email&utm_medium=reorder#checkout`;
    const lin = (ult.items || []).map(i => `  ${i.cases} × ${i.sku} ${i.name}`).join('\n');
    try {
      await X.mail(c0.id, es ? '¿Reponemos tu K11?' : 'Time to restock K11?', `${hi}\n\n${es ? `Por tu ritmo de compra, quizás ya necesites reponer. Tu último pedido (${ult.ref}):` : `Based on your usual ordering pace, you may be due to restock. Your last order (${ult.ref}):`}\n\n${lin}\n\n${es ? 'Repetilo en un clic (el carrito ya está cargado):' : 'Repeat it in one click (cart is pre-filled):'}\n${link}\n\n${es ? 'Mis pedidos:' : 'My orders:'} ${X.portalUrl(c0.id)}\n\n— Wylco · K11 America\nMiami, FL · +1 (954) 881-8870 · info@wylcosolutions.com`);
      const c = await T.cliente(c0.id); if (c) { c.recompra = now(); await T.guardarCliente(c); }
    } catch {}
  }
  return out;
}

// ── Shippo: cotizar y comprar etiqueta UPS/FedEx/USPS ──
const SH = () => process.env.SHIPPO_API_KEY;
const EST = { alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE', 'district of columbia': 'DC', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'puerto rico': 'PR', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY' };
const estado2 = s => { const x = String(s || '').trim(); return x.length === 2 ? x.toUpperCase() : EST[x.toLowerCase()] || x; };
const dirTo = o => ({ name: o.contact || o.company, company: o.company, street1: o.address, street2: o.address2 || '', city: o.city, state: estado2(o.state), zip: String(o.zip || '').trim(), country: 'US', phone: o.phone || '', email: o.email, validate: true });
async function shippo(path, body) {
  const r = await fetch('https://api.goshippo.com/' + path, { method: body ? 'POST' : 'GET', headers: { Authorization: 'ShippoToken ' + SH(), 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error('Shippo ' + r.status + ': ' + JSON.stringify(j).slice(0, 180)); return j;
}
async function cotizar(o) {
  if (!SH()) throw new Error('Falta SHIPPO_API_KEY en Vercel');
  const org = await X.cfg('origen', null); if (!org || !org.street1) throw new Error('Cargá la dirección de origen en Sistema');
  if (!o.address || !o.zip) throw new Error('La venta no tiene dirección de envío completa');
  const dim = await X.cfg('caja_dim', { l: 16, w: 12, h: 10 }), peso = await X.cfg('peso', {});
  const parcels = []; for (const i of o.items || []) for (let k = 0; k < i.cases; k++) parcels.push({ length: String(dim.l), width: String(dim.w), height: String(dim.h), distance_unit: 'in', weight: String(+peso[i.slug] || 15), mass_unit: 'lb' });
  if (!parcels.length) throw new Error('Sin cajas'); if (parcels.length > 25) throw new Error('Más de 25 cajas: cotizá como flete (LTL)');
  const to = await shippo('addresses/', dirTo(o)), vr = to.validation_results || {};
  const val = { ok: vr.is_valid !== false, msgs: (vr.messages || []).map(m => m.text).filter(Boolean) };
  const s = await shippo('shipments/', { address_from: { ...org, state: estado2(org.state), country: 'US' }, address_to: to.object_id, parcels, async: false });
  const rates = (s.rates || []).map(r => ({ id: r.object_id, prov: r.provider, srv: (r.servicelevel || {}).name, amt: +r.amount, dias: r.estimated_days })).sort((a, b) => a.amt - b.amt);
  return { rates, val, provs: [...new Set(rates.map(r => r.prov))] };
}
async function vCotizar(o) {
  let q = {}, err; try { q = await cotizar(o); } catch (e) { err = e.message; }
  const rates = q.rates, val = q.val || { ok: true, msgs: [] };
  const rows = (rates || []).map(r => `<tr><td><strong>${esc(r.prov)}</strong> ${esc(r.srv || '')}</td><td class="r num">${r.dias ? r.dias + ' d' : '—'}</td><td class="r num"><strong>${usd(r.amt)}</strong></td><td class="r"><form method="post" style="display:inline-flex;gap:12px;align-items:center;justify-content:flex-end" onsubmit="return confirm('¿Comprar etiqueta ${esc(r.prov)} por ${usd(r.amt)}? Se cobra en tu cuenta Shippo.')">${H('ship_buy', { ref: o.ref, rate: r.id, amt: r.amt, prov: r.prov })}<label style="display:inline-flex;gap:6px;align-items:center;font-size:13px;white-space:nowrap"><input type="checkbox" name="avisar" value="1" checked style="width:16px;height:16px;margin:0"> avisar cliente</label><button${val.ok ? '' : ' disabled title="Corregí la dirección primero"'}>Comprar</button></form></td></tr>`).join('');
  const D = [['company', 'Empresa'], ['contact', 'Contacto'], ['address', 'Dirección (calle y número)'], ['address2', 'Suite / unidad'], ['city', 'Ciudad'], ['state', 'Estado (FL, TX…)'], ['zip', 'ZIP'], ['phone', 'Teléfono']];
  const dir = `<form method="post" class="card pad" style="display:grid;gap:12px;margin-bottom:18px">${H('dir_venta', { ref: o.ref })}<h2 style="margin:0">Dirección de entrega ${val.ok && !err ? '<span class="tag t-pagado">verificada</span>' : '<span class="tag t-cancelado">revisar</span>'}</h2>${val.msgs.length ? `<small style="color:var(--od,#b42318)">${esc(val.msgs.join(' · '))}</small>` : ''}<div class="fg">${D.map(([k, l]) => `<label>${l}<input name="${k}" value="${esc(k === 'state' ? estado2(o[k]) : o[k] || '')}"></label>`).join('')}</div><div><button class="sec">Guardar y recotizar</button></div></form>`;
  const falta = rates && !['UPS', 'FedEx'].every(c => (q.provs || []).some(p => p.toLowerCase().includes(c.toLowerCase())));
  const cobrado = o.flete != null ? o.flete : o.flete_manual;
  return `<div class="crumb"><a href="/admin?v=ventas">Ventas</a>/<a href="/admin?v=venta&ref=${o.ref}">${o.ref}</a>/<span>Envío</span></div><div class="hd"><div><h1>Cotizar envío</h1><div class="sub">${esc([o.company, o.address, o.city, o.state, o.zip].filter(Boolean).join(' · '))}${cobrado != null ? ' · flete cobrado al cliente ' + usd(cobrado) : ''}</div></div></div>
${err ? `<div class="flash err">${esc(err)}</div>` : ''}${dir}${falta ? `<p class="mut" style="font-size:13px;margin:0 0 12px">Solo aparecen ${esc((q.provs || []).join(', ') || 'algunos transportistas')}. Para ver UPS y FedEx: Shippo → Settings → Carriers → activá UPS y FedEx (cuentas de Shippo o las tuyas).</p>` : ''}${err ? '' : rows ? `<div class="card tw"><table><thead><tr><th>Servicio</th><th class="r">Tránsito</th><th class="r">Costo</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><p class="mut" style="font-size:13px">Al comprar: se guarda tracking, etiqueta PDF 4×6 y costo real (resta de la ganancia), y la venta pasa a enviado.</p>` : '<div class="empty">Sin tarifas para esta dirección.</div>'}`;
}
function envioCard(o) {
  if (o.estado === 'cancelado' || o.retiro) return '';
  return `<div class="card pad" style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;align-items:center"><h2 style="margin:0 auto 0 0">Etiqueta de transporte</h2>${o.label_url ? `<a class="btn" href="${esc(o.label_url)}" target="_blank">Etiqueta ${esc(o.carrier || '')} (PDF)</a>` : ''}<a class="btn sec" href="/admin?v=venta_envio&ref=${encodeURIComponent(o.ref)}">${o.label_url ? 'Otra etiqueta' : 'Cotizar UPS / FedEx / USPS'}</a></div>`;
}

// ── chequeo de lanzamiento ──
async function chequeo({ MODE, TAX, t, pr, ps }) {
  const E = process.env, b = await X.cfg('backup_at', null), org = await X.cfg('origen', null);
  let dom = { ok: null, txt: 'No se pudo consultar (la API key de Resend es solo de envío)' };
  if (E.RESEND_API_KEY) try {
    const r = await fetch('https://api.resend.com/domains', { headers: { Authorization: 'Bearer ' + E.RESEND_API_KEY } });
    if (r.ok) { const j = await r.json(), from = (E.MAIL_FROM || 'wylcosolutions.com').match(/@([^>\s]+)/), dn = from ? from[1] : 'wylcosolutions.com', d = (j.data || []).find(x => x.name === dn); dom = d ? { ok: d.status === 'verified', txt: `${dn}: ${d.status}` } : { ok: false, txt: `${dn} no está agregado en Resend` }; }
  } catch {}
  const online = t.filter(p => p.online), sinPrecio = online.filter(p => !pr[p.slug]);
  const e2e = ps.some(o => o.origen === 'stripe' && ['pagado', 'enviado'].includes(o.estado));
  const C = [
    ['Stripe en vivo', MODE === 'live', MODE === 'live' ? 'Claves live activas' : 'Cambiar STRIPE_SECRET_KEY a sk_live_… (o rk_live_…) en Vercel'],
    ['Webhook de Stripe', !!E.STRIPE_WEBHOOK_SECRET, 'Registrar https://wylcosolutions.com/api/stripe en Stripe (modo live) y pegar el whsec_ en STRIPE_WEBHOOK_SECRET'],
    ['Stripe Tax', TAX, 'Activar Stripe Tax, cargar registraciones por estado (FL primero) y poner STRIPE_TAX=1'],
    ['Mails: dominio verificado', dom.ok, dom.txt + (dom.ok ? '' : ' · agregá los registros SPF, DKIM y DMARC que da Resend en el DNS')],
    ['Mails: avisos internos', !!E.ORDER_TO, E.ORDER_TO ? 'ORDER_TO = ' + E.ORDER_TO : 'Usa info@wylcosolutions.com por defecto (ORDER_TO opcional)'],
    ['Tareas automáticas', !!E.CRON_SECRET, 'Definir CRON_SECRET en Vercel (protege recordatorios y backup diario)'],
    ['Backup diario', !!(b && Date.now() - Date.parse(b.at) < 2 * DIA), b ? `Último: ${dfecha(b.at)} · ${b.keys} claves · ${b.kb} KB` : 'Todavía no corrió. Probalo con el botón de abajo'],
    ['Stock cargado', t.some(p => p.cases_available > 0), t.reduce((a, p) => a + p.cases_available, 0) + ' cajas en stock'],
    ['Precios online', online.length > 0 && !sinPrecio.length, online.length ? (sinPrecio.length ? 'Sin precio en Stripe: ' + sinPrecio.map(p => p.sku).join(', ') : online.length + ' producto(s) a la venta online') : 'Ningún producto online: cargá precio por caja en Stock'],
    ['Prueba completa', e2e, e2e ? 'Hay al menos un pago por checkout registrado' : 'Hacer un pedido en /order → pagar → ver mail → admin → etiqueta'],
    ['Envíos con Shippo', !!(E.SHIPPO_API_KEY && org && org.street1), E.SHIPPO_API_KEY ? (org && org.street1 ? 'Listo para cotizar' : 'Falta dirección de origen (abajo)') : 'Opcional: crear cuenta en goshippo.com y poner SHIPPO_API_KEY'],
    ['Usuario de depósito', !!E.ADMIN_TOKEN_DEPOSITO, E.ADMIN_TOKEN_DEPOSITO ? 'Entra con /admin?k=<token depósito>' : 'Opcional: ADMIN_TOKEN_DEPOSITO para alguien que solo despacha']
  ];
  return C;
}
function vSistema({ C, L, niv, org, dim, peso }) {
  const ico = ok => ok === true ? '<span class="dot ok"></span>' : ok === false ? '<span class="dot no"></span>' : '<span class="dot"></span>';
  const n = C.filter(c => c[1] === true).length;
  const F = [['name', 'Nombre'], ['company', 'Empresa'], ['street1', 'Dirección'], ['city', 'Ciudad'], ['state', 'Estado'], ['zip', 'ZIP'], ['phone', 'Teléfono'], ['email', 'Email']];
  const lrows = L.map(l => `<tr><td><small>${dfecha(l.at)}</small></td><td>${esc(l.rol || '')}</td><td class="m">${esc(l.a || '')}</td><td>${l.ref ? `<a href="/admin?v=venta&ref=${esc(l.ref)}">${esc(l.ref)}</a>` : esc(l.s || l.id || '')}</td><td><small>${esc(String(l.msg || '').slice(0, 140))}</small></td></tr>`).join('');
  return `<div class="hd"><div><h1>Sistema</h1><div class="sub">Lanzamiento ${n}/${C.length} · backup · niveles de precio · envíos · registro de cambios</div></div></div>
<div class="card tw"><table><thead><tr><th></th><th>Chequeo</th><th>Estado / qué falta</th></tr></thead><tbody>${C.map(([l, ok, txt]) => `<tr><td>${ico(ok)}</td><td><strong>${l}</strong></td><td><small>${esc(txt)}</small></td></tr>`).join('')}</tbody></table></div>
<div class="grid2" style="margin-top:18px">
<div class="card pad" style="display:grid;gap:12px;align-content:start"><h2>Backup</h2><small class="mut">Se manda solo todos los días por mail a ORDER_TO. Incluye ventas, clientes, stock, costos, compras y configuración.</small>
<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="/admin?v=backup">Descargar ahora (.json)</a><form method="post" class="inl">${H('backup_mail')}<button class="sec">Mandar por mail</button></form></div>
<details><summary>Restaurar backup</summary><form method="post" style="display:grid;gap:10px;margin-top:10px" onsubmit="return confirm('Reemplaza los datos actuales por los del backup. ¿Seguro?')">${H('backup_restore')}<input type="file" accept=".json,application/json" onchange="var f=this.files[0],t=this.form.querySelector('textarea');if(f){var r=new FileReader();r.onload=function(){t.value=r.result};r.readAsText(f)}"><textarea name="json" rows="3" required placeholder="o pegá el JSON" style="font-family:monospace;font-size:11px"></textarea><label>Escribí RESTAURAR<input name="conf" required autocomplete="off" style="max-width:200px"></label><div><button class="danger">Restaurar</button></div></form></details></div>
<form method="post" class="card pad" style="display:grid;gap:12px;align-content:start">${H('niveles_cfg')}<h2>Niveles de precio</h2><small class="mut">Descuento sobre el precio de lista por caja. Se asigna en cada cliente.</small>
<div class="fg">${NIVELES.map(([k, l]) => `<label>${l} (%)<input type="number" step="0.5" min="0" max="50" name="${k}" value="${+niv[k] || 0}"${k === 'distribuidor' ? ' readonly' : ''}></label>`).join('')}</div><div><button class="sec">Guardar</button></div></form>
<form method="post" class="card pad" style="display:grid;gap:12px;align-content:start">${H('origen_cfg')}<h2>Origen de envíos (Shippo)</h2><div class="fg">${F.map(([k, l]) => `<label>${l}<input name="${k}" value="${esc((org || {})[k] || '')}"></label>`).join('')}</div><div><button class="sec">Guardar</button></div></form>
<form method="post" class="card pad" style="display:grid;gap:12px;align-content:start">${H('caja_cfg')}<h2>Caja de envío</h2><small class="mut">Medidas (pulgadas) y peso por caja (lb) para cotizar.</small>
<div class="fg"><label>Largo<input type="number" step="0.1" name="l" value="${dim.l}"></label><label>Ancho<input type="number" step="0.1" name="w" value="${dim.w}"></label><label>Alto<input type="number" step="0.1" name="h" value="${dim.h}"></label></div>
<div class="fg">${T.PRODUCTS.map(p => `<label>${esc(p.sku)} (lb)<input type="number" step="0.1" min="0" name="p_${p.slug}" value="${+peso[p.slug] || 15}"></label>`).join('')}</div><div><button class="sec">Guardar</button></div></form></div>
<div class="card tw" style="margin-top:18px"><div style="padding:16px 16px 0"><h2>Registro de cambios</h2><small class="mut">Quién hizo qué en el admin (últimos ${L.length}).</small></div>${lrows ? `<table><thead><tr><th>Cuándo</th><th>Rol</th><th>Acción</th><th>Sobre</th><th>Resultado</th></tr></thead><tbody>${lrows}</tbody></table>` : '<div class="empty">Sin cambios registrados todavía.</div>'}</div>`;
}

// ── acciones del admin ──
const ACC = ['dir_venta', 'backup_mail', 'backup_restore', 'reorden_cfg', 'niveles_cfg', 'nivel_cli', 'origen_cfg', 'caja_cfg', 'ship_buy'];
async function accion(b) {
  const a = b.a, num = v => parseFloat(String(v || '').replace(',', '.'));
  if (a === 'backup_mail') { const n = await backupDiario(); return `Backup enviado a ${X.TO()} · ${n} claves`; }
  if (a === 'backup_restore') { if (String(b.conf || '').trim().toUpperCase() !== 'RESTAURAR') throw new Error('Escribí RESTAURAR para confirmar'); const r = await restaurar(String(b.json || '')); return `Restaurado: ${r.n} claves del backup del ${dfecha(r.at)}`; }
  if (a === 'reorden_cfg') { const tr = parseInt(b.transito, 10), co = parseInt(b.cobertura, 10); if (!(tr > 0) || !(co > 0)) throw new Error('Cargá días de tránsito y cobertura'); await X.setCfg('reorden', { transito: tr, cobertura: co }); return `Reposición: tránsito ${tr} d · cobertura ${co} d`; }
  if (a === 'niveles_cfg') { const n = {}; for (const [k] of NIVELES) if (k !== 'distribuidor') { const v = Math.min(50, Math.max(0, num(b[k]) || 0)); if (v) n[k] = v; } await X.setCfg('niveles', n); return 'Niveles: ' + (NIVELES.filter(([k]) => n[k]).map(([k, l]) => l + ' −' + n[k] + '%').join(' · ') || 'sin descuentos'); }
  if (a === 'nivel_cli') { const c = await T.cliente(b.id); if (!c) throw new Error('Cliente no encontrado'); if (b.nivel && b.nivel !== 'distribuidor') c.nivel = String(b.nivel); else delete c.nivel; await T.guardarCliente(c); return 'Nivel: ' + (NIVELES.find(([k]) => k === (c.nivel || 'distribuidor')) || [])[1]; }
  if (a === 'origen_cfg') { const o = {}; for (const k of ['name', 'company', 'street1', 'city', 'state', 'zip', 'phone', 'email']) o[k] = String(b[k] || '').trim(); if (!o.street1 || !o.zip) throw new Error('Falta dirección o ZIP'); await X.setCfg('origen', o); return 'Origen de envíos guardado'; }
  if (a === 'caja_cfg') { const d = { l: num(b.l) || 16, w: num(b.w) || 12, h: num(b.h) || 10 }, p = {}; for (const x of T.PRODUCTS) { const v = num(b['p_' + x.slug]); if (v > 0) p[x.slug] = v; } await X.setCfg('caja_dim', d); await X.setCfg('peso', p); return `Caja ${d.l}×${d.w}×${d.h} in guardada`; }
  if (a === 'dir_venta') {
    const o = await T.pedido(b.ref); if (!o) throw new Error('Venta no encontrada');
    for (const k of ['company', 'contact', 'address', 'address2', 'city', 'state', 'zip', 'phone']) if (b[k] != null) o[k] = String(b[k]).trim();
    o.state = estado2(o.state); T.hist(o, 'Dirección de entrega corregida: ' + [o.address, o.address2, o.city, o.state, o.zip].filter(Boolean).join(', '));
    await T.guardarPedido(o); return { msg: 'Dirección guardada', go: '/admin?v=venta_envio&ref=' + encodeURIComponent(o.ref) };
  }
  if (a === 'ship_buy') {
    const o = await T.pedido(b.ref); if (!o) throw new Error('Venta no encontrada');
    const tx = await shippo('transactions/', { rate: b.rate, label_file_type: 'PDF_4x6', async: false });
    if (tx.status !== 'SUCCESS') throw new Error('Shippo: ' + ((tx.messages || []).map(m => m.text).join(' ') || tx.status));
    const pv = String(b.prov || ''); o.carrier = /ups/i.test(pv) ? 'UPS' : /fedex/i.test(pv) ? 'FedEx' : /usps/i.test(pv) ? 'USPS' : 'Otro';
    o.tracking = tx.tracking_number; o.label_url = tx.label_url; o.envio_costo = +b.amt || o.envio_costo; o.estado = 'enviado';
    T.hist(o, `Etiqueta ${o.carrier} comprada (Shippo) · ${o.tracking} · costo ${usd(o.envio_costo)}`);
    if (b.avisar === '1' && await X.mailCliente(o, 'tracking')) { o.tracking_mail = true; T.hist(o, 'Mail de seguimiento enviado a ' + o.email); }
    await T.guardarPedido(o); return { msg: `${o.ref}: etiqueta ${o.carrier} lista`, go: '/admin?v=venta&ref=' + o.ref };
  }
  throw new Error('Acción desconocida');
}

module.exports = { rolDe, DEP_V, depPuede, log, logs, backup, restaurar, backupDiario, reorden, vReorden, alertaReorden, NIVELES, pctNivel, nivelForm, recompra, cotizar, vCotizar, envioCard, chequeo, vSistema, ACC, accion };
