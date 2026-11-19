// Muestras: envío de muestras a prospectos, con tracking y seguimiento (llamar a los 3 días de entregada).
// Redis hash k11:muestras (id → JSON). El stock de muestras es aparte del stock de venta (cfg muestras_stock = lo que se cargó al inicio).
const { redis } = require('./core');
const X = require('./extras');

const PROD = { tf: 'TapaFugas', tf2: 'TapaFugas 2 en 1', sp: 'Sella Plus' };
const INI = { tf: 30, tf2: 30, sp: 30 };
const PRE = ['Por visitar', 'Por contactar', 'Mail enviado', 'Respondió'];
const ESTADOS = [...PRE, 'Preparando', 'Enviada', 'En camino', 'Entregada', 'Probando', 'Le gustó', 'Compró', 'No interesa'];
const CERRADOS = ['Compró', 'No interesa'];
const EN_RUTA = ['Preparando', 'Enviada', 'En camino'];
const ORIGENES = ['Dealer', 'Podcast'];
const CARRIERS = ['UPS', 'FedEx', 'USPS', 'Otro', 'Entrega en mano'];
const AHR = 'AHR Expo 2027 · Podcast Pavilion';
const PODCASTS = [
  ['HVACSCHOOL', 'HVAC School', 'Bryan Orr', 'bryan@hvacrschool.com', 'Bryan', 'refrigeration techs', 'Mayor audiencia de técnicos en EE.UU. (8 sesiones en el Pavilion).'],
  ['REFMENTOR', 'Refrigeration Mentor', 'Trevor Matthews', 'info@refrigerationmentor.com', 'Trevor', 'refrigeration techs', 'Mail del pie de su web; también formulario en refrigerationmentor.com.'],
  ['ACSERVICETECH', 'AC Service Tech Answers', 'Craig Migliaccio', 'info@acservicetech.com', 'Craig', 'HVAC-R techs', 'Mail sacado de notas de episodios: primer envío corto y confirmar que llegó.'],
  ['CKCHRON', 'Commercial Kitchen Chronicles', 'Pat Finley', 'commercialkitchenchronicles@gmail.com', 'Pat', 'foodservice refrigeration techs', 'Refrigeración comercial. Mail de notas de episodios.'],
  ['HVACKNIGHTS', 'HVAC Knights', 'Adrian y Jake', 'thehvacknights@gmail.com', 'Adrian and Jake', 'HVAC-R techs', 'Mail de su Linktree / hvacknights.com.'],
  ['RELIABLETRADES', 'Reliable Trades', 'Adrian Garcia', 'reliablemediahub@gmail.com', 'Adrian', 'HVAC-R techs', 'Mail de su Linktree (colaboraciones y sponsors).'],
  ['HVACRND', 'HVAC R&D', 'Rhydon Atzenhoffer', '', 'Rhydon', 'HVAC-R techs', 'Sin mail público: formulario "Contact Us" en hvacrnd.com (y cuestionario de invitados en hvacrnd.podbean.com). Pegar el texto en el formulario.'],
  ['HPHVAC', 'High-Performance HVAC', 'National Comfort Institute', '', 'team', 'HVAC-R techs', 'Sin mail público: formulario en el sitio de NCI o teléfono (800) 633-7058.'],
  ['REFRIGERANT365', 'Refrigerant365', 'Elizabeth Ortlieb', '', 'Elizabeth', 'refrigerant and leak-detection techs', 'Sin mail propio: Instagram @refrigerant365. info@alpynestrategy.com es de su consultora (aclarar que es para Elizabeth). Audiencia justo de refrigerantes y fugas.']
];
const VISITAS = [
  ['Doral', 'Refricenter West', '', '+13054779675', 'jurena@refricenter.net'], ['Doral', 'A&R Supply Doral', '', '+13054714788', 'salesdoral@ar-supply.com'], ['Doral', 'Saez Distributors', '', '', 'miami@saezdistributors.com'],
  ['Doral', 'General Air Cond. & Refrig. Supply', '', '+17866633350', ''], ['Doral', 'Vnadf AC & Supplies', '', '+13054771040', ''], ['Doral', 'J&S AC & Ref Supply', '', '+13058873336', ''],
  ['Dolphin Mall', 'Deplus A/C Supply', '', '', ''], ['Dolphin Mall', 'Winsupply of Miami', 'Y. Quintana', '+13056020731', 'yquintana@winsupply.com'], ['Dolphin Mall', 'Lennox Parts Plus', '', '+13055071730', ''],
  ['Hialeah', 'Refricenter Hialeah', '', '+13056331535', 'jurena@refricenter.net'], ['Hialeah', 'HG Refrigeration Supply', '', '+13055943704', ''], ['Hialeah', 'Discount Refrigeration Supply', '', '+13056359616', ''],
  ['Hialeah', 'United Refrigeration', '', '+13057170955', 'branch62@uri.com'], ['Hialeah', 'AP AC Distributors', '', '', 'AP.Purchasing.Dept@gmail.com'], ['Hialeah', 'Og AC Supply', '', '+13056335144', '']
];
const mailPod = m => { const P = PODCASTS.find(x => 'POD-' + x[0] === m.id) || [], hi = P[4] || (m.nom || '').split(' ')[0] || 'there', aud = P[5] || 'HVAC-R techs';
  return { s: `Free samples of K11 leak sealant for ${m.emp}`, b: `Hi ${hi},\n\nI'm Miguel Wyler, and I work with Wylco, the U.S. distributor of K11 HVAC-R products. I've been following ${m.emp}, and I think your audience of ${aud} would be a good fit for what we make.\n\nK11 is a leak sealant for HVAC-R systems. I'd like to send you free samples so you can test it on your own jobs and give us your honest opinion, good or bad. If it holds up, we'd also be glad to join an episode and answer technical questions about compatibility, oils and refrigerants.\n\nWhere should I ship the samples?\n\nBest regards,\nMiguel Wyler\nWylco / K11` }; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hoy = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
const mas = (d, n) => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const fd = d => d ? d.slice(8, 10) + '/' + d.slice(5, 7) : '';
const H = (a, extra = {}) => `<input type="hidden" name="a" value="${a}">` + Object.entries(extra).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join('');
const btn = (a, extra, txt, cls = '', conf) => `<form method="post" class="inl"${conf ? ` onsubmit="return confirm('${esc(conf)}')"` : ''}>${H(a, extra)}<button class="${cls}">${txt}</button></form>`;

let sembrando = false;
// Primera vez que se abre: carga sola las visitas planeadas y los podcasts a contactar (una sola vez), así se ve todo junto.
async function lista() {
  if (!sembrando) { sembrando = true; try { const [ok] = await redis([['SET', 'k11:muestras_seed2', new Date().toISOString(), 'NX']]); if (ok === 'OK') { await accion({ a: 'muestra_visitas' }); await accion({ a: 'muestra_seed' }); } } catch (e) { console.error('seed muestras', e.message); } finally { sembrando = false; } }
  try { const [ok] = await redis([['SET', 'k11:muestras_fix1', '1', 'NX']]); if (ok === 'OK') for (const m of await lista0()) if (String(m.id).startsWith('VIS-') && m.est === 'Por visitar' && (m.tf || m.tf2 || m.sp)) { m.tf = 0; m.tf2 = 0; m.sp = 0; await guardar(m); } } catch (e) { console.error('fix muestras', e.message); }
  return lista0();
}
async function lista0() {
  const [x] = await redis([['HGETALL', 'k11:muestras']]); const out = [];
  if (Array.isArray(x)) for (let i = 1; i < x.length; i += 2) { try { out.push(JSON.parse(x[i])); } catch {} }
  else if (x && typeof x === 'object') for (const k in x) { try { out.push(JSON.parse(x[k])); } catch {} }
  return out.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.at || '').localeCompare(a.at || ''));
}
const guardar = m => redis([['HSET', 'k11:muestras', m.id, JSON.stringify(m)]]);
const pod = m => m.origen === 'Podcast';
const vence = m => !!m.seg && m.seg <= hoy() && !CERRADOS.includes(m.est) && !EN_RUTA.includes(m.est);
const verbo = m => PRE.includes(m.est) ? 'Seguir' : 'Llamar';
const trackUrl = m => m.tracking && !['Otro', 'Entrega en mano'].includes(m.carrier) ? X.trackUrl(m.carrier, m.tracking) : '';
function resumen(L) {
  const u = { tf: 0, tf2: 0, sp: 0 }; L.forEach(m => { for (const k in u) u[k] += +m[k] || 0; });
  return { podcast: L.filter(pod).length, total: L.length, ruta: L.filter(m => EN_RUTA.includes(m.est)).length, entregadas: L.filter(m => m.est === 'Entregada').length, llamar: L.filter(vence).length, compro: L.filter(m => m.est === 'Compró').length, quedan: Object.fromEntries(Object.keys(INI).map(k => [k, INI[k] - u[k]])) };
}
const prods = m => Object.keys(PROD).filter(k => +m[k] > 0).map(k => PROD[k] + (m[k] > 1 ? ' ×' + m[k] : '')).join(' · ') || '—';
const tagE = m => { const c = vence(m) ? 'background:var(--o);color:#fff' : m.est === 'Compró' ? 'background:#DCEFE2;color:var(--g)' : m.est === 'No interesa' ? 'background:var(--bg2);color:var(--mut)' : EN_RUTA.includes(m.est) ? 'background:#E3E8F2;color:#2B4170' : 'background:#F8E7C4;color:#7A4B00'; return `<span class="tag" style="${c}">${vence(m) ? verbo(m) : esc(m.est)}</span>`; };
const tagO = m => !pod(m) ? (m.ep ? `<small>${esc(m.ep)}</small><br>` : '') : `<span class="tag" style="background:var(--ink);color:#fff">Podcast</span>${m.ep ? ` <small>${esc(m.ep)}</small>` : ''}<br>`;

// ── tracking real (Shippo, opcional) ──
async function consultar(m) {
  const key = process.env.SHIPPO_API_KEY; if (!key) throw new Error('Falta SHIPPO_API_KEY en Vercel: por ahora cambiá el estado a mano');
  const car = { UPS: 'ups', FedEx: 'fedex', USPS: 'usps' }[m.carrier]; if (!car || !m.tracking) throw new Error('Cargá transportista (UPS, FedEx o USPS) y número de tracking');
  const r = await fetch(`https://api.goshippo.com/tracks/${car}/${encodeURIComponent(m.tracking)}`, { headers: { Authorization: 'ShippoToken ' + key } });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error('Shippo ' + r.status + ' ' + String(j.detail || j.message || '').slice(0, 100));
  const ts = j.tracking_status || {}, loc = ts.location ? [ts.location.city, ts.location.state].filter(Boolean).join(', ') : '';
  return { status: ts.status || 'UNKNOWN', txt: [ts.status_details, loc].filter(Boolean).join(' · '), at: ts.status_date || '' };
}
function aplicarTrack(m, t) {
  m.ship = { status: t.status, txt: t.txt, at: t.at, chk: new Date().toISOString() };
  if (EN_RUTA.includes(m.est)) {
    if (t.status === 'DELIVERED') { m.est = 'Entregada'; m.entregada = (t.at || '').slice(0, 10) || hoy(); m.seg = mas(m.entregada, 3); }
    else if (t.status === 'TRANSIT') m.est = 'En camino';
    else if (t.status === 'PRE_TRANSIT' && m.est === 'Preparando') m.est = 'Enviada';
  }
}

// ── acciones (POST /admin) ──
async function accion(b) {
  const a = b.a;
  if (a === 'muestra') {
    const o = {}; for (const k of ['nom', 'emp', 'tel', 'mail', 'addr', 'city', 'state', 'zip', 'tracking', 'notas', 'ep']) o[k] = String(b[k] || '').trim().slice(0, 300);
    for (const k of Object.keys(PROD)) o[k] = Math.max(0, parseInt(b[k], 10) || 0);
    o.origen = ORIGENES.includes(b.origen) ? b.origen : 'Dealer'; o.carrier = CARRIERS.includes(b.carrier) ? b.carrier : 'UPS'; o.est = ESTADOS.includes(b.est) ? b.est : 'Preparando';
    o.fecha = /^\d{4}-\d\d-\d\d$/.test(b.fecha || '') ? b.fecha : hoy(); o.seg = /^\d{4}-\d\d-\d\d$/.test(b.seg || '') ? b.seg : '';
    if (!o.nom && !o.emp) throw new Error('Falta contacto o empresa');
    if (b.id) {
      const [x] = await redis([['HGET', 'k11:muestras', b.id]]); if (!x) throw new Error('Muestra no encontrada');
      const m = Object.assign(JSON.parse(x), o); if (m.est === 'Entregada' && !m.entregada) m.entregada = hoy(); await guardar(m); return { msg: 'Muestra guardada', go: '/admin?v=muestras' };
    }
    o.id = 'M' + Date.now().toString(36).toUpperCase(); o.at = new Date().toISOString(); o.ultimo = '';
    if (!o.seg) o.seg = mas(o.fecha, 5); // envío + tránsito; al entregarse pasa a +3 días
    await guardar(o); return { msg: 'Muestra cargada' + (o.mail && o.tracking ? ' · podés mandarle el tracking por mail' : ''), go: '/admin?v=muestras' };
  }
  if (a === 'muestra_aviso') { const u = (await lista()).filter(vence); if (!u.length) return { msg: 'Hoy no hay nadie para seguir', go: '/admin?v=muestras' }; await X.mail(X.TO(), `[K11] Hoy: ${u.length} ${u.length === 1 ? 'contacto para seguir' : 'contactos para seguir'}`, avisoHoy(u)); return { msg: 'Te mandé el aviso por mail', go: '/admin?v=muestras' }; }
  if (a === 'muestra_visitas') {
    const ex = new Set((await lista()).map(m => m.id)); let n = 0;
    const base = { at: new Date().toISOString(), origen: 'Dealer', addr: '', city: 'Miami', state: 'FL', zip: '', carrier: 'Entrega en mano', tracking: '', ultimo: '', notas: '' };
    if (!ex.has('VIS-FERNANDO')) { await guardar({ ...base, id: 'VIS-FERNANDO', nom: 'Fernando', emp: '', tel: '', mail: '', tf: 1, tf2: 1, sp: 1, est: 'Entregada', fecha: '2026-11-11', entregada: '2026-11-11', seg: '2026-11-14' }); n++; }
    for (let i = 0; i < VISITAS.length; i++) { const v = VISITAS[i], id = 'VIS-' + i; if (ex.has(id)) continue; await guardar({ ...base, id, ep: 'Ruta ' + v[0], emp: v[1], nom: v[2], tel: v[3], mail: v[4], tf: 0, tf2: 0, sp: 0, est: 'Por visitar', fecha: hoy(), seg: hoy() }); n++; }
    return { msg: n ? n + ' visitas cargadas sin muestras: al entregar, tocá "Entregué muestras"' : 'Las visitas ya estaban cargadas', go: '/admin?v=muestras&f=todas' };
  }
  if (a === 'muestra_seed') {
    const ex = new Set((await lista()).map(m => m.id)); let n = 0;
    for (const P of PODCASTS) { const id = 'POD-' + P[0]; if (ex.has(id)) continue; await guardar({ id, at: new Date().toISOString(), origen: 'Podcast', ep: AHR, emp: P[1], nom: P[2], mail: P[3], tel: P[0] === 'HPHVAC' ? '(800) 633-7058' : '', addr: '', city: '', state: '', zip: '', tf: 0, tf2: 0, sp: 0, carrier: 'UPS', tracking: '', est: 'Por contactar', fecha: hoy(), seg: hoy(), ultimo: '', notas: P[6] }); n++; }
    return { msg: n ? n + ' podcasts cargados (Por contactar)' : 'Los podcasts ya estaban cargados', go: '/admin?v=muestras&f=podcast' };
  }
  const [x] = await redis([['HGET', 'k11:muestras', b.id || '']]); if (!x) throw new Error('Muestra no encontrada');
  const m = JSON.parse(x);
  if (a === 'muestra_del') { await redis([['HDEL', 'k11:muestras', m.id]]); return { msg: 'Muestra eliminada', go: '/admin?v=muestras' }; }
  if (a === 'muestra_est') { if (!ESTADOS.includes(b.v)) throw new Error('Estado inválido'); m.est = b.v; if (b.v === 'Entregada') { m.entregada = hoy(); m.seg = mas(m.entregada, 3); if (!(m.tf || m.tf2 || m.sp)) { m.tf = 1; m.tf2 = 1; m.sp = 1; } } else if (b.v === 'Por visitar') m.seg = hoy(); else if (b.v === 'Mail enviado') { m.mailEnv = hoy(); m.seg = mas(hoy(), 5); } else if (b.v === 'Respondió') m.seg = mas(hoy(), 2); else if (b.v === 'Preparando' && pod(m)) m.seg = mas(hoy(), 5); await guardar(m); return { msg: (m.emp || m.nom) + ' → ' + b.v, go: '/admin?v=muestras' }; }
  if (a === 'muestra_hablo') { m.ultimo = hoy(); m.seg = mas(hoy(), 7); if (b.nota) m.notas = (m.notas ? m.notas + ' | ' : '') + fd(hoy()) + ': ' + String(b.nota).slice(0, 200); if (m.est === 'Entregada') m.est = 'Probando'; else if (m.est === 'Mail enviado') m.est = 'Respondió'; await guardar(m); return { msg: 'Anotado · próximo llamado ' + fd(m.seg), go: '/admin?v=muestras' }; }
  if (a === 'muestra_track') { const t = await consultar(m); aplicarTrack(m, t); await guardar(m); return { msg: `${m.tracking}: ${t.status}${t.txt ? ' · ' + t.txt : ''}`, go: '/admin?v=muestras' }; }
  if (a === 'muestra_mail') {
    if (!m.mail) throw new Error('Esta muestra no tiene email'); if (!m.tracking) throw new Error('Cargá el tracking primero');
    const u = trackUrl(m), hi = 'Hi' + (m.nom ? ' ' + m.nom.split(' ')[0] : '') + ',';
    await X.mail(m.mail, 'Your K11 samples are on the way', `${hi}\n\nWe just shipped your K11 samples:\n\n  ${prods(m)}\n\n${m.carrier} ${m.tracking}${u ? '\n' + u : ''}\n\nTry them on a real job and tell us what you think. Reply to this email or call +1 (954) 881-8870 and we will help with dosing and compatibility.\n\n— Wylco · K11 America\nMiami, FL · +1 (954) 881-8870 · info@wylcosolutions.com`);
    m.mailed = new Date().toISOString(); await guardar(m); return { msg: 'Tracking enviado a ' + m.mail, go: '/admin?v=muestras' };
  }
  throw new Error('Acción desconocida');
}

// ── vista del panel principal: bloque remarcado ──
function card(L) {
  const r = resumen(L), urg = L.filter(vence), ruta = L.filter(m => EN_RUTA.includes(m.est));
  const fila = m => `<tr><td>${tagO(m)}<strong>${esc(m.emp || m.nom)}</strong>${m.emp && m.nom ? `<br><small>${esc(m.nom)}</small>` : ''}</td><td>${esc(prods(m))}</td><td>${tagE(m)}</td><td>${trackUrl(m) ? `<a href="${esc(trackUrl(m))}" target="_blank" rel="noopener">${esc(m.carrier)} ${esc(m.tracking)}</a>` : m.tracking ? esc(m.carrier + ' ' + m.tracking) : '<small>sin tracking</small>'}${m.ship && m.ship.txt ? `<br><small>${esc(m.ship.txt)}</small>` : ''}</td><td class="r">${vence(m) ? `<strong>${verbo(m)}</strong>${m.tel ? ` · <a href="tel:${esc(m.tel)}">${esc(m.tel)}</a>` : ''}` : `<small>${verbo(m).toLowerCase()} ${fd(m.seg) || '—'}</small>`}</td></tr>`;
  const top = urg.concat(ruta.filter(m => !urg.includes(m))).slice(0, 6);
  return `<section class="mu" aria-label="Muestras en seguimiento"><div class="mu-h"><div><h2>Muestras en seguimiento</h2><div class="sub">Mails a podcasts, envío con tracking y llamado a los 3 días de entregada.</div></div><div class="acts"><a class="btn" href="/admin?v=muestras#nueva">+ Enviar muestra</a><a class="btn sec" href="/admin?v=muestras">Ver todas →</a></div></div>
<div class="mu-k"><a href="/admin?v=muestras&f=llamar"><b class="${r.llamar ? 'no' : ''}">${r.llamar}</b><span>Seguir hoy</span></a><a href="/admin?v=muestras&f=ruta"><b>${r.ruta}</b><span>En camino</span></a><a href="/admin?v=muestras&f=Entregada"><b>${r.entregadas}</b><span>Entregadas</span></a><a href="/admin?v=muestras&f=podcast"><b>${r.podcast}</b><span>Podcast</span></a><a href="/admin?v=muestras&f=Compró"><b class="ok">${r.compro}</b><span>Compraron</span></a><a href="/admin?v=muestras"><b>${Object.keys(r.quedan).map(k => r.quedan[k]).join(' / ')}</b><span>Quedan TF / 2en1 / Sella</span></a></div>
${top.length ? `<div class="tw"><table><thead><tr><th>Destino</th><th>Muestras</th><th>Estado</th><th>Tracking</th><th class="r">Seguimiento</th></tr></thead><tbody>${top.map(fila).join('')}</tbody></table></div>` : '<div class="empty" style="padding:18px">Todavía no cargaste envíos de muestras. Tocá “+ Enviar muestra”.</div>'}</section>`;
}

// ── página completa /admin?v=muestras ──
function vista({ list, f = 'todas', q = '', e }) {
  const r = resumen(list), ed = e && list.find(m => m.id === e), d = ed || { origen: 'Dealer', fecha: hoy(), seg: mas(hoy(), 5), tf: 1, tf2: 1, sp: 1, carrier: 'UPS', est: 'Preparando' };
  const flt = [['todas', 'Todo junto', list.length], ['activas', 'Activas', list.filter(m => !CERRADOS.includes(m.est)).length], ['llamar', 'Seguir hoy', r.llamar], ['visitas', 'Por visitar', list.filter(m => m.est === 'Por visitar').length], ['podcast', 'Podcast', r.podcast], ['ruta', 'En camino', r.ruta], ['Entregada', 'Entregadas', r.entregadas], ['Probando', 'Probando', list.filter(m => m.est === 'Probando').length], ['Le gustó', 'Le gustó', list.filter(m => m.est === 'Le gustó').length], ['Compró', 'Compró', r.compro], ['No interesa', 'No interesa', list.filter(m => m.est === 'No interesa').length]];
  const ql = q.toLowerCase(), L = list.filter(m => (f === 'todas' || (f === 'activas' ? !CERRADOS.includes(m.est) : f === 'llamar' ? vence(m) : f === 'podcast' ? pod(m) : f === 'visitas' ? m.est === 'Por visitar' : f === 'ruta' ? EN_RUTA.includes(m.est) : m.est === f)) && (!ql || [m.emp, m.nom, m.mail, m.tel, m.tracking].join(' ').toLowerCase().includes(ql)))
    .sort((a, b) => vence(b) - vence(a) || (a.seg || '9').localeCompare(b.seg || '9'));
  const inp = (n, l, ty = 'text', req) => `<label>${l}<input name="${n}" type="${ty}" value="${esc(d[n] == null ? '' : d[n])}"${req ? ' required' : ''}></label>`;
  const row = m => `<tr${vence(m) ? ' style="background:#FFF6EF"' : ''}><td>${tagO(m)}<strong>${esc(m.emp || m.nom)}</strong>${m.emp && m.nom ? `<br>${esc(m.nom)}` : ''}<br><small>${[m.tel ? `<a href="tel:${esc(m.tel)}">${esc(m.tel)}</a>` : '', m.mail ? `<a href="mailto:${esc(m.mail)}">${esc(m.mail)}</a>` : ''].filter(Boolean).join(' · ')}</small>${[m.addr, [m.city, m.state, m.zip].filter(Boolean).join(' ')].filter(Boolean).length ? `<br><small>${esc([m.addr, [m.city, m.state, m.zip].filter(Boolean).join(' ')].filter(Boolean).join(', '))}</small>` : ''}</td>
<td>${esc(prods(m))}<br><small>enviada ${fd(m.fecha)}</small></td>
<td>${trackUrl(m) ? `<a href="${esc(trackUrl(m))}" target="_blank" rel="noopener">${esc(m.carrier)} ${esc(m.tracking)}</a>` : m.tracking ? esc(m.carrier + ' ' + m.tracking) : `<small>${esc(m.carrier || 'sin tracking')}</small>`}${m.ship ? `<br><small>${esc(m.ship.status)}${m.ship.txt ? ' · ' + esc(m.ship.txt) : ''}</small>` : ''}</td>
<td>${tagE(m)}<br><small>${m.entregada ? 'entregada ' + fd(m.entregada) + ' · ' : ''}${m.mailEnv ? 'mail ' + fd(m.mailEnv) + ' · ' : ''}${m.seg && !CERRADOS.includes(m.est) ? verbo(m).toLowerCase() + ' ' + fd(m.seg) : ''}${m.ultimo ? ' · hablamos ' + fd(m.ultimo) : ''}</small>${m.notas ? `<br><small><i>${esc(m.notas)}</i></small>` : ''}</td>
<td>${pod(m) && PRE.includes(m.est) ? (() => { const t = mailPod(m); return `<details style="margin-bottom:8px"><summary><strong>Texto del mail</strong>${m.mail ? ' · ' + esc(m.mail) : ' · (formulario / redes)'}</summary><textarea readonly rows="12" onfocus="this.select()" aria-label="Texto del mail">Asunto: ${esc(t.s)}\n\n${esc(t.b)}</textarea></details>`; })() : ''}<div class="acts">${pod(m) && m.est === 'Por contactar' ? btn('muestra_est', { id: m.id, v: 'Mail enviado' }, 'Marcar mail enviado') : ''}${!pod(m) && m.est === 'Por visitar' ? btn('muestra_est', { id: m.id, v: 'Entregada' }, 'Entregué muestras') : ''}${m.tracking ? btn('muestra_track', { id: m.id }, 'Actualizar tracking', 'sec') : ''}${m.mail && m.tracking ? btn('muestra_mail', { id: m.id }, m.mailed ? 'Reenviar tracking' : 'Mandar tracking', 'sec', 'Enviar tracking por mail a ' + m.mail + '?') : ''}
<form method="post" class="inl">${H('muestra_est', { id: m.id })}<select name="v" aria-label="Estado" onchange="this.form.submit()">${ESTADOS.map(s => `<option${s === m.est ? ' selected' : ''}>${s}</option>`).join('')}</select></form>
<form method="post" class="inl" onsubmit="this.nota.value=prompt('¿Qué te dijo? (opcional)')||'';return true">${H('muestra_hablo', { id: m.id })}<input type="hidden" name="nota"><button class="sec">Ya hablé</button></form>
<a class="btn sec" href="/admin?v=muestras&e=${esc(m.id)}#nueva">Editar</a>${btn('muestra_del', { id: m.id }, 'Eliminar', 'danger', 'Eliminar esta muestra?')}</div></td></tr>`;
  return `<div class="hd"><div><h1>Muestras</h1><div class="sub">Cada envío lleva tracking y a los 3 días de entregada te marca a quién llamar. Quedan: TapaFugas ${r.quedan.tf} · 2 en 1 ${r.quedan.tf2} · Sella Plus ${r.quedan.sp}.</div></div><a class="btn" href="#nueva">+ Enviar muestra</a></div>
<div class="chips">${flt.map(([k, l, c]) => `<a href="/admin?v=muestras&f=${encodeURIComponent(k)}" class="${f === k ? 'on' : ''}">${l}<span class="ct">${c}</span></a>`).join('')}</div>
${btn('muestra_aviso', {}, 'Mandarme el aviso de hoy por mail', 'sec')}${list.some(m => String(m.id).startsWith('VIS-')) ? '' : btn('muestra_visitas', {}, 'Cargar visitas planeadas (15 locales + Fernando)', '', 'Cargar las 15 visitas planeadas (Doral, Dolphin Mall y Hialeah)?')}${r.podcast ? '' : btn('muestra_seed', {}, 'Cargar podcasts del AHR Expo (9)', '', 'Cargar la lista de 9 podcasts?')}
<form class="tools" method="get" action="/admin"><input type="hidden" name="v" value="muestras"><input type="hidden" name="f" value="${esc(f)}"><input name="q" value="${esc(q)}" placeholder="Buscar empresa, contacto o tracking" style="max-width:340px" aria-label="Buscar"><button class="sec">Buscar</button></form>
<div class="card tw" style="margin-bottom:20px">${L.length ? `<table><thead><tr><th>Destino</th><th>Muestras</th><th>Tracking</th><th>Estado y seguimiento</th><th>Acciones</th></tr></thead><tbody>${L.map(row).join('')}</tbody></table>` : '<div class="empty">Nada en este filtro.</div>'}</div>
<form method="post" id="nueva" class="card pad" style="display:grid;gap:14px">${H('muestra', ed ? { id: ed.id } : {})}<h2>${ed ? 'Editar muestra' : 'Enviar muestra'}</h2>
<div class="fg"><label>Origen<select name="origen">${ORIGENES.map(c => `<option${c === d.origen ? ' selected' : ''}>${c}</option>`).join('')}</select></label>${inp('ep', 'Episodio / evento (podcast)')}</div>
<div class="fg">${inp('nom', 'Contacto *')}${inp('emp', 'Empresa')}${inp('tel', 'Teléfono', 'tel')}${inp('mail', 'Email', 'email')}${inp('addr', 'Dirección')}${inp('city', 'Ciudad')}${inp('state', 'Estado')}${inp('zip', 'ZIP')}</div>
<div class="fg">${Object.keys(PROD).map(k => `<label>${PROD[k]} (unidades)<input type="number" name="${k}" min="0" value="${+d[k] || 0}"></label>`).join('')}</div>
<div class="fg"><label>Transportista<select name="carrier">${CARRIERS.map(c => `<option${c === d.carrier ? ' selected' : ''}>${c}</option>`).join('')}</select></label>${inp('tracking', 'Número de tracking')}${inp('fecha', 'Fecha de envío', 'date', 1)}${inp('seg', 'Llamar el', 'date')}<label>Estado<select name="est">${ESTADOS.map(s => `<option${s === d.est ? ' selected' : ''}>${s}</option>`).join('')}</select></label></div>
<label>Notas<textarea name="notas" placeholder="Qué usa hoy, qué dijo, próximo paso">${esc(d.notas || '')}</textarea></label>
<div class="acts"><button>${ed ? 'Guardar cambios' : 'Guardar envío'}</button>${ed ? '<a class="btn sec" href="/admin?v=muestras">Cancelar</a>' : ''}</div></form>`;
}

// Texto del aviso diario: agrupado por qué hacer, un bloque por contacto.
function avisoHoy(urg) {
  const bloque = (m, n) => [`${n}. ${m.emp || m.nom}${pod(m) ? ' (podcast)' : ''}`, m.nom && m.emp ? `   Contacto: ${m.nom}` : '', `   Teléfono: ${m.tel || 'sin cargar'}`, prods(m) !== '—' ? `   Muestras: ${prods(m)}` : '', m.notas ? `   Nota: ${m.notas}` : ''].filter(Boolean).join('\n');
  const a = urg.filter(m => !PRE.includes(m.est)), b = urg.filter(m => PRE.includes(m.est));
  const sec = (t, sub, L) => L.length ? `${t} (${L.length})\n${sub}\n\n${L.map((m, i) => bloque(m, i + 1)).join('\n\n')}` : '';
  return ['Hoy te toca contactar a ' + urg.length + '.', '', sec('LLAMAR: ya recibieron muestras', 'Preguntales qué tal les fue con el producto.', a), sec('VISITAR / SEGUIR: todavía no recibieron muestras', 'Pasá por el local o escribiles para presentar K11.', b), `Marcá cada uno como hecho acá:\n${X.SITE}/admin?v=muestras&f=llamar`].filter(Boolean).join('\n\n');
}
// ── cron diario: actualiza tracking de lo que está en camino y avisa a quién llamar ──
async function diario(simular) {
  const L = await lista(), out = { tracking: 0, llamar: [] };
  if (process.env.SHIPPO_API_KEY && !simular) for (const m of L.filter(x => EN_RUTA.includes(x.est) && x.tracking && ['UPS', 'FedEx', 'USPS'].includes(x.carrier))) { try { aplicarTrack(m, await consultar(m)); await guardar(m); out.tracking++; } catch {} }
  const urg = L.filter(vence); out.llamar = urg.map(m => m.emp || m.nom);
  if (urg.length && !simular) { const [ok] = await redis([['SET', 'k11:alerta:muestras:' + hoy(), '1', 'NX', 'EX', '172800']]); if (ok === 'OK') try { await X.mail(X.TO(), `[K11] Hoy: ${urg.length} ${urg.length === 1 ? 'contacto para seguir' : 'contactos para seguir'}`, avisoHoy(urg)); } catch {} }
  return out;
}

module.exports = { lista, resumen, vence, card, vista, accion, diario, ESTADOS };
