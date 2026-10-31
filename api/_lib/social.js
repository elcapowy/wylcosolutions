// Redes sociales por MES: campañas (gira Florida) + rotación. Publica vía Ayrshare.
const { redis } = require('./core');
const SITE = 'https://wylcosolutions.com';
const KEY = process.env.AYRSHARE_API_KEY || '';
const IMG_NETS = ['instagram', 'facebook', 'linkedin', 'gmb'];
const NETS = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', gmb: 'Google Business', tiktok: 'TikTok', youtube: 'YouTube Shorts' };
// Decir "exclusivo/único" SOLO con contrato de exclusividad firmado (ver CLAUDE.md)
const SELLER = { en: 'K11 wholesale distributor in the USA', es: 'Distribuidor mayorista de K11 en EE.UU.' };
const TAGS = '#HVACR #HVACsupply #HVACdistributor #SupplyHouse #Refrigeration #AirConditioning #Miami #Florida #K11';
const HOUR_ET = 10;

const BANK = {
  tip1: { type: 'tip', en: 'Counter tip for your techs: if a system takes 30+ days to lose its charge, it is a micro-leak — K11 TapaFugas seals it. Losing charge faster? Repair first.', es: 'Tip de mostrador para tus técnicos: si el equipo tarda más de 30 días en perder carga, es micro-fuga y K11 TapaFugas la sella. ¿Pierde más rápido? Primero reparar.' },
  tip2: { type: 'tip', en: 'What your techs ask at the counter: K11 TapaFugas goes in through the low-side port with the system running. No evacuation, no downtime.', es: 'Lo que preguntan tus técnicos en el mostrador: K11 TapaFugas entra por el puerto de baja con el equipo andando. Sin evacuar, sin detener.' },
  tip3: { type: 'tip', en: 'Give your techs a faster way to find leaks: K11 Revela Fugas UV dye, a UV light and a few minutes of run time.', es: 'Dales a tus técnicos una forma más rápida de encontrar fugas: tinte UV K11 Revela Fugas, una linterna UV y unos minutos de funcionamiento.' },
  tip4: { type: 'tip', en: 'An easy add-on sale at the counter: K11 Sella Plus seals and lubricates flares, gaskets and O-rings, and stays flexible.', es: 'Una venta adicional fácil en el mostrador: K11 Sella Plus sella y lubrica flares, juntas y O-rings, y se mantiene flexible.' },
  case1: { type: 'case', en: 'Field case: a mini-split that ran low every summer. Micro-leak in the coil, one K11 TapaFugas 2-in-1 injection: sealed and UV-marked.', es: 'Caso de campo: un mini-split que quedaba bajo de gas cada verano. Micro-fuga en el serpentín, una inyección de K11 TapaFugas 2-en-1: sellada y marcada con UV.' },
  case2: { type: 'case', en: 'Field case: rooftop unit, leak nobody could find. K11 Revela Fugas pointed straight to a Schrader valve.', es: 'Caso de campo: equipo de techo con una fuga que nadie encontraba. K11 Revela Fugas marcó directo una válvula Schrader.' },
  case3: { type: 'case', en: 'Field case: weeping flare fitting, reassembled with K11 Sella Plus — sealant and lubricant that never hardens.', es: 'Caso de campo: flare que goteaba, rearmado con K11 Sella Plus, sellador y lubricante que no se endurece.' },
  case4: { type: 'case', en: 'Field case: slow loss on a 3-ton split, leak too small to braze. 10 ml of K11 TapaFugas, injected with the system running.', es: 'Caso de campo: pérdida lenta en un split de 3 TR, fuga demasiado chica para soldar. 10 ml de K11 TapaFugas, inyectado con el equipo andando.' },
  promo1: { type: 'promo', en: 'HVAC-R supply houses and distributors: stock K11 at your counter. Wholesale by the case, shipped from Miami.', es: 'Casas de repuestos y distribuidores HVAC-R: tengan K11 en el mostrador. Mayorista por caja, despacho desde Miami.' },
  promo2: { type: 'promo', en: 'Distributors: order K11 online by the case with live stock. Card, ACH, wire or Zelle.', es: 'Distribuidores: pidan K11 online por caja con stock en vivo. Tarjeta, ACH, transferencia o Zelle.' },
  promo3: { type: 'promo', en: 'Safety Data Sheets for every K11 product, ready for your purchasing and compliance team.', es: 'Hojas de seguridad de todos los productos K11, listas para compras y seguridad de tu empresa.', link: '/docs' },
  promo4: { type: 'promo', en: 'Resellers: send your resale certificate and we invoice K11 without sales tax.', es: 'Revendedores: manden su certificado de reventa y facturamos K11 sin sales tax.' }
};
const FILL = ['promo1', 'tip1', 'case4', 'promo2', 'tip3', 'case1', 'promo3', 'tip2', 'case2', 'promo4', 'tip4', 'case3'];

const fmt = (d, L) => new Date(d + 'T12:00:00Z').toLocaleDateString(L === 'es' ? 'es-AR' : 'en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
function tourPosts(t) {
  const r = `${fmt(t.start, 'en')}–${fmt(t.end, 'en')}`, rs = `${fmt(t.start, 'es')} al ${fmt(t.end, 'es')}`;
  const stops = t.stops ? `\n\n${t.stops.en}` : '', stopsEs = t.stops ? `\n\n${t.stops.es}` : '';
  return {
    announce: { id: 'tour1', type: 'tour', en: `We're visiting ${t.area} supply houses ${r}. Want K11 at your counter? Book a 15-minute visit — message us or reply here.`, es: `Visitamos casas de repuestos de ${t.area} del ${rs}. ¿Querés K11 en tu mostrador? Agendá una visita de 15 minutos: escribinos o respondé acá.`, link: '/distributors' },
    demo: { id: 'tour2', type: 'tour', en: `Next week in ${t.area}: live K11 demo at your counter, SDS and wholesale terms in 15 minutes. A few slots left.`, es: `La semana que viene en ${t.area}: demo de K11 en tu mostrador, hojas de seguridad y condiciones mayoristas en 15 minutos. Quedan pocos horarios.`, link: '/distributors' },
    week: { id: 'tour3', type: 'tour', en: `This week we're in ${t.area} visiting HVAC-R supply houses.${stops}\n\nWant us to stop by? Send a message.`, es: `Esta semana estamos en ${t.area} visitando casas de repuestos HVAC-R.${stopsEs}\n\n¿Querés que pasemos? Mandanos un mensaje.`, link: '/distributors' },
    thanks: { id: 'tour4', type: 'tour', en: `Thank you, ${t.area}, for opening your counters to K11. Distributor orders are open by the case.`, es: `Gracias, ${t.area}, por abrirnos el mostrador. Los pedidos para distribuidores están abiertos, por caja.` },
    next: { id: 'tour5', type: 'tour', en: `${t.nextEn || 'Next visit coming soon.'} Want a stop at your counter? Tell us now and we'll add you to the route.`, es: `${t.nextEs || 'Pronto volvemos.'} ¿Querés que pasemos por tu mostrador? Avisanos y te sumamos a la ruta.`, link: '/distributors' }
  };
}
const CAMPAIGNS = {
  '2026-11': { name: 'Gira Florida · Miami-Dade', tour: { start: '2026-11-09', end: '2026-11-16', area: 'Miami-Dade', stops: { en: 'Tue: Doral · Wed: Hialeah · Thu: Little Havana · Fri: Kendall', es: 'Mar: Doral · Mié: Hialeah · Jue: Little Havana · Vie: Kendall' }, nextEn: 'Back in Florida in January.', nextEs: 'Volvemos a Florida en enero.' } },
  '2027-01': { name: 'Gira Florida · enero (fechas a confirmar)', draft: true, tour: { start: '2027-01-11', end: '2027-01-18', area: 'Florida', nextEn: 'More Florida visits coming soon.', nextEs: 'Pronto más visitas en Florida.' } }
};

const slots = ym => { const [y, m] = ym.split('-').map(Number), out = []; for (let d = 1; d <= 31; d++) { const dt = new Date(Date.UTC(y, m - 1, d)); if (dt.getUTCMonth() !== m - 1) break; if ([1, 3, 5].includes(dt.getUTCDay())) out.push(dt.toISOString().slice(0, 10)); } return out; };
function utcAt(day) { const d = new Date(day + 'T00:00:00Z'), m = d.getUTCMonth(), off = m > 2 && m < 10 ? 4 : 5; d.setUTCHours(HOUR_ET + off); return d.toISOString(); }
function caption(p, ym, i) {
  const link = SITE + (p.link || '/order') + `?utm_source=social&utm_medium=organic&utm_campaign=${ym}&utm_content=${i + 1}-${p.id}`;
  return `${p.en}\n\n🇪🇸 ${p.es}\n\n✅ Tested per ASHRAE 97 · RoHS compliant · OSHA/GHS Safety Data Sheets\n${SELLER.en} · ${SELLER.es}\n👉 ${link}\n\n${TAGS}`;
}
function plan(ym) {
  const days = slots(ym), c = CAMPAIGNS[ym], fixed = {};
  if (c && c.tour) {
    const t = tourPosts(c.tour), st = c.tour.start, en = c.tour.end;
    const before = days.filter(d => d < st), during = days.filter(d => d >= st && d <= en), after = days.filter(d => d > en);
    if (before.length >= 3) fixed[before[before.length - 5] || before[0]] = t.announce;
    if (before.length) fixed[before[before.length - 1]] = t.demo;
    if (during.length) fixed[during[0]] = t.week;
    if (after.length) fixed[after[0]] = t.thanks;
    if (after.length > 1) fixed[after[after.length - 1]] = t.next;
  }
  let k = 0;
  return days.map((d, i) => {
    let p = fixed[d]; if (!p) { const id = FILL[k++ % FILL.length]; p = { id, ...BANK[id] }; }
    return { day: d, at: utcAt(d), id: p.id, type: p.type, imgPath: `/assets/social/${p.id}.png?v=3`, img: `${SITE}/assets/social/${p.id}.png?v=3`, text: caption(p, ym, i), nets: IMG_NETS.slice() };
  });
}
const ymOf = (d = new Date(), plus = 0) => { const ny = new Date(d.toLocaleString('en-US', { timeZone: 'America/New_York' })); ny.setDate(1); ny.setMonth(ny.getMonth() + plus); return ny.getFullYear() + '-' + String(ny.getMonth() + 1).padStart(2, '0'); };
function meses() { const s = new Set([ymOf(), ymOf(new Date(), 1), ymOf(new Date(), 2), ...Object.keys(CAMPAIGNS)]); return [...s].filter(m => m >= ymOf()).sort(); }
async function mes(ym) { const [x] = await redis([['HGET', 'k11:socialm', ym]]); if (x) return JSON.parse(x); const c = CAMPAIGNS[ym]; return { ym, name: c ? c.name : 'Rotación', draft: !!(c && c.draft), estado: 'borrador', posts: plan(ym) }; }
const guardar = m => redis([['HSET', 'k11:socialm', m.ym, JSON.stringify(m)]]);

async function ayr(path, method, body) {
  if (!KEY) throw new Error('Falta AYRSHARE_API_KEY en Vercel');
  const r = await fetch('https://api.ayrshare.com/api/' + path, { method, headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.status === 'error') throw new Error((j.errors && j.errors[0] && j.errors[0].message) || j.message || ('Ayrshare ' + r.status));
  return j;
}
async function conectadas() { if (!KEY) return null; try { const j = await ayr('user', 'GET'); return j.activeSocialAccounts || []; } catch { return null; } }

// Cuentas aliadas: solo las marcadas "ok" (aceptaron) se mencionan en cada post
const ALIADOS_INI = [
  { h: '@politecnicodemiamifl', red: 'instagram', nota: 'Escuela HVAC en español, Miami', estado: 'candidato' },
  { h: '@actipsenespanol', red: 'tiktok', nota: 'A/C tips en español', estado: 'candidato' },
  { h: '@tuguajirofavorito', red: 'tiktok', nota: 'Técnico HVAC en español', estado: 'candidato' },
  { h: '@maestrohvacr.app', red: 'tiktok', nota: 'Cursos HVAC en español', estado: 'candidato' },
  { h: '@yosbelgonzalezdieguez', red: 'tiktok', nota: 'Empresa HVAC en Miami', estado: 'candidato' },
  { h: '@carlospannorefrig', red: 'tiktok', nota: 'Técnico refrigeración en español', estado: 'candidato' }
];
async function aliados() { const [x] = await redis([['GET', 'k11:aliados']]); return x ? JSON.parse(x) : ALIADOS_INI; }
async function guardarAliados(txt) {
  const list = String(txt || '').split('\n').map(l => l.split('|').map(x => x.trim())).filter(a => a[0]).map(([h, red, nota, estado]) => ({ h, red: red || 'instagram', nota: nota || '', estado: ['ok', 'contactado', 'candidato', 'no'].includes(estado) ? estado : 'candidato' }));
  await redis([['SET', 'k11:aliados', JSON.stringify(list)]]); return list;
}
const menciones = list => list.filter(a => a.estado === 'ok' && /^@[\w.]+$/.test(a.h)).slice(0, 5).map(a => a.h).join(' ');

async function aprobarMes(ym) {
  const m = await mes(ym); if (m.estado === 'aprobado') return m;
  const now = Date.now(), men = menciones(await aliados());
  for (const p of m.posts) {
    if (p.off) { p.estado = 'omitido'; continue; }
    if (Date.parse(p.at) < now + 10 * 60e3) { p.estado = 'vencido'; continue; }
    try { const j = await ayr('post', 'POST', { post: men && !p.text.includes(men) ? p.text + '\n\n' + men : p.text, platforms: p.nets, mediaUrls: [p.img], scheduleDate: p.at }); p.ayr = j.id; p.estado = 'programado'; delete p.err; }
    catch (e) { p.estado = 'error'; p.err = String(e.message || e); }
  }
  m.estado = 'aprobado'; m.aprobado = new Date().toISOString(); await guardar(m); return m;
}
async function cancelarMes(ym) {
  const m = await mes(ym);
  for (const p of m.posts) { if (p.ayr && p.estado === 'programado') { try { await ayr('post', 'DELETE', { id: p.ayr }); } catch {} } if (p.estado !== 'publicado') { delete p.estado; delete p.ayr; } }
  m.estado = 'borrador'; await guardar(m); return m;
}
async function editarPost(ym, i, text, nets, off) {
  const m = await mes(ym), p = m.posts[i]; if (!p) throw new Error('Post no encontrado');
  if (m.estado === 'aprobado') throw new Error('Cancelá la aprobación del mes para editar');
  if (text != null) p.text = String(text).slice(0, 2200);
  if (Array.isArray(nets)) p.nets = nets.filter(n => IMG_NETS.includes(n));
  p.off = !!off; await guardar(m); return m;
}
async function regenerarMes(ym) { const c = CAMPAIGNS[ym]; const m = { ym, name: c ? c.name : 'Rotación', draft: !!(c && c.draft), estado: 'borrador', posts: plan(ym) }; await guardar(m); return m; }

module.exports = { aliados, guardarAliados, menciones, KEY, NETS, IMG_NETS, SELLER, CAMPAIGNS, meses, mes, plan, aprobarMes, cancelarMes, editarPost, regenerarMes, conectadas };
