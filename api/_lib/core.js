const D = require('./data.json');

const CFG = {
  FROM: process.env.MAIL_FROM || 'Fernando Lette · Wylco <fernando@wylcosolutions.com>',
  REPLY_TO: process.env.MAIL_REPLY_TO || 'info@wylcosolutions.com',
  MAX_POR_DIA: +(process.env.MAX_POR_DIA || 60),
  FICHA_URL: process.env.FICHA_URL || '',
  TZ: 'America/New_York'
};
const PRIMERO = { cont2: 'cont1', dist2: 'dist1' };

const RURL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const RTOK = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
async function redis(cmds) {
  if (!RURL) throw new Error('Falta la base Redis (Upstash) conectada al proyecto');
  const r = await fetch(RURL + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + RTOK, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  const j = await r.json();
  return j.map(x => x.result);
}
const toObj = a => { const o = {}; for (let i = 0; a && i < a.length; i += 2) o[a[i]] = a[i + 1]; return o; };
async function leerEstado() {
  const [est, stop] = await redis([['HGETALL', 'k11:estado'], ['HGETALL', 'k11:stop']]);
  const e = toObj(est); Object.keys(e).forEach(k => e[k] = JSON.parse(e[k]));
  return { est: e, stop: toObj(stop) };
}
const guardar = (id, o) => redis([['HSET', 'k11:estado', String(id), JSON.stringify(o)]]);
const marcarStop = (email, motivo) => redis([motivo ? ['HSET', 'k11:stop', email, motivo] : ['HDEL', 'k11:stop', email]]);

function hoy() { return new Intl.DateTimeFormat('en-CA', { timeZone: CFG.TZ }).format(new Date()); }

function armar(k, lang, emp, ciudad) {
  const t = D.tpl[k][lang] || D.tpl[k].en;
  const r = s => s.replace(/\{empresa\}/g, emp).replace(/\{enciudad\}/g, ciudad ? ' in ' + ciudad : '').replace(/\{enciudad_es\}/g, ciudad ? ' en ' + ciudad : '');
  return { s: r(t.s), b: r(t.b) + '\n\n' + D.sig[lang] + '\n\n' + r(D.foot[lang]) };
}

async function enviar(to, s, b, adjuntar) {
  const p = { from: CFG.FROM, to: [to], subject: s, text: b, reply_to: CFG.REPLY_TO,
    headers: { 'List-Unsubscribe': '<mailto:' + CFG.REPLY_TO + '?subject=unsubscribe>' } };
  if (adjuntar && CFG.FICHA_URL) p.attachments = [{ path: CFG.FICHA_URL, filename: 'K11-ficha-tecnica.pdf' }];
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(r.status + ' ' + (j.message || JSON.stringify(j)).slice(0, 150));
  return j.id;
}
const pausa = ms => new Promise(r => setTimeout(r, ms));

async function enviarHoy({ simular = false } = {}) {
  const { est, stop } = await leerEstado();
  const h = hoy(), enviados = {}, log = [];
  for (const r of D.rows) if (est[r.id] && est[r.id].e === 'enviado') enviados[r.e + '|' + r.k] = 1;
  let n = 0;
  for (const r of D.rows) {
    if (n >= CFG.MAX_POR_DIA) break;
    if (est[r.id] || r.f > h) continue;
    const lang = String(r.l).slice(0, 2) === 'es' ? 'es' : 'en';
    let res;
    if (stop[r.e] === 'baja') res = { e: 'omitido', n: 'baja' };
    else if (PRIMERO[r.k] && !enviados[r.e + '|' + PRIMERO[r.k]]) res = { e: 'omitido', n: 'no se envió el primero' };
    else if (PRIMERO[r.k] && stop[r.e]) res = { e: 'omitido', n: 'respondió' };
    else if (simular) { log.push({ id: r.id, k: r.k, e: r.e }); n++; continue; }
    else {
      try { const m = armar(r.k, lang, r.emp, r.c); res = { e: 'enviado', n: await enviar(r.e, m.s, m.b, r.k === 'dist1') }; n++; await pausa(600); }
      catch (err) { res = { e: 'error', n: String(err.message || err) }; }
    }
    res.at = new Date().toISOString();
    if (!simular) await guardar(r.id, res);
    log.push({ id: r.id, k: r.k, e: r.e, ...res });
  }
  return { fecha: h, enviados: n, simular, detalle: log };
}

function autorizado(req) {
  const tok = (req.headers.authorization || '').replace('Bearer ', '') || (req.query && req.query.k) || '';
  return (process.env.CRON_SECRET && tok === process.env.CRON_SECRET) || (process.env.ADMIN_TOKEN && tok === process.env.ADMIN_TOKEN);
}

module.exports = { D, CFG, armar, enviar, enviarHoy, leerEstado, marcarStop, autorizado, hoy, pausa };
