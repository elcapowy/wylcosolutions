// Pedido de muestra gratis (campaña nov 2026): GET /samples?r=<id>&lang=en|es muestra el formulario; POST lo guarda en Muestras.
// Cupo: CAP muestras por producto (Redis hash k11:camp; se reserva con HINCRBY, atómico). Si se agota, queda en lista de espera.
// Cada pedido entra a k11:muestras con origen "Campaña" (estado Respondió) y la encuesta en notas; avisa a ORDER_TO y confirma al cliente.
const { redis, D } = require('../core');
const X = require('../extras');

const CAP = +(process.env.CAMP_CAP || 15);
const PROD = { tf: ['TapaFugas K11', '10 ml', 'Jeringa de 10 ml'], tf2: ['TapaFugas 2-in-1', '10 ml · UV', 'Jeringa 2 en 1 con UV'], sp: ['Sella Plus', '35 ml', 'Frasco de 35 ml'] };
const ROLES = { owner: ['Owner / manager', 'Dueño / gerente'], tech: ['Technician', 'Técnico'], buyer: ['Purchasing', 'Compras'], other: ['Other', 'Otro'] };
const JOBS = { '0-3': '0–3', '4-10': '4–10', '11+': '11+' };
const REFS = ['R-134a', 'R-404A', 'R-410A', 'R-22', 'R-290', 'Other'];
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clean = (v, n = 200) => String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').trim().slice(0, n);
const hoy = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
const mas = (d, n) => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

const TX = {
  en: {
    t: 'Free K11 sample', h1: 'Pick your free K11 sample', lead: 'Limited run: we only have {n} samples of each product. Tell us where to send yours and, after you try it, how it went.',
    lh: 'Early-access list', lh1: 'Join the K11 early-access list', ll: 'Our first samples are going to South Florida. Tell us what you would test and where you buy, and we will write to you as soon as K11 reaches your area. Joining the list does not guarantee a sample.',
    p1: '1. Pick one sample', left: n => n > 0 ? `${n} left` : 'Sold out', wl: 'Sold out: join the waiting list',
    p2: '2. Where do we send it?', name: 'Your name', comp: 'Company', role: 'Your role', email: 'Email', phone: 'Phone (mobile if you can)', addr: 'Street address', city: 'City', state: 'State', zip: 'ZIP',
    p3: '3. Help us improve (optional)', buy: 'Where do you buy your HVAC-R supplies today?', refs: 'Refrigerants you work with most', jobs: 'Leak repairs per month', jobsh: 'Choose',
    ok: 'OK to call or text me about the sample after it arrives', send: 'Request my free sample', sendl: 'Join the list', req: 'Required',
    thx: 'Request received', thxs: 'Thank you, {n}. We will ship your {p} from Miami and email you the tracking number. We will check in a few days after it arrives to hear how it went.',
    thxw: 'You are on the list', thxws: 'Thank you, {n}. We will write to you as soon as K11 and samples reach your area.',
    dup: 'We already have a request from this email. We will be in touch soon.', err: 'Please complete the required fields (marked *).', pickErr: 'Pick a product.', back: 'Back to the form', home: 'wylcosolutions.com',
    cm: { s: 'We received your K11 sample request', b: n => `Hi ${n},\n\nWe received your request for a free K11 sample (${'{p}'}). We will ship it from Miami and send you the tracking number by email.\n\nAfter it arrives we will check in to hear how it went, good or bad. Your honest opinion helps us a lot.\n\n— Fernando Lete · Wylco Solutions\n+1 (954) 881-8870 · info@wylcosolutions.com` },
    cw: { s: 'You are on the K11 early-access list', b: n => `Hi ${n},\n\nThanks for joining the K11 early-access list. Our first samples are going to South Florida; we will write to you as soon as K11 and samples reach your area.\n\n— Fernando Lete · Wylco Solutions\n+1 (954) 881-8870 · info@wylcosolutions.com` }
  },
  es: {
    t: 'Muestra gratis K11', h1: 'Elija su muestra gratis de K11', lead: 'Tirada limitada: solo tenemos {n} muestras de cada producto. Díganos adónde enviarla y, después de probarla, cómo le fue.',
    lh: 'Lista de acceso anticipado', lh1: 'Súmese a la lista de acceso anticipado de K11', ll: 'Nuestras primeras muestras salen al sur de Florida. Cuéntenos qué probaría y dónde compra, y le escribimos apenas K11 llegue a su zona. Sumarse a la lista no garantiza una muestra.',
    p1: '1. Elija una muestra', left: n => n > 0 ? `Quedan ${n}` : 'Agotada', wl: 'Agotada: anotarme en la lista de espera',
    p2: '2. ¿Adónde se la enviamos?', name: 'Su nombre', comp: 'Empresa', role: 'Su rol', email: 'Email', phone: 'Teléfono (celular si puede)', addr: 'Dirección', city: 'Ciudad', state: 'Estado', zip: 'ZIP',
    p3: '3. Ayúdenos a mejorar (opcional)', buy: '¿Dónde compra hoy sus insumos de HVAC-R?', refs: 'Refrigerantes con los que más trabaja', jobs: 'Reparaciones de fugas por mes', jobsh: 'Elija',
    ok: 'Pueden llamarme o escribirme por la muestra cuando llegue', send: 'Pedir mi muestra gratis', sendl: 'Sumarme a la lista', req: 'Obligatorio',
    thx: 'Pedido recibido', thxs: 'Gracias, {n}. Enviaremos su {p} desde Miami y le mandaremos el número de seguimiento por mail. Unos días después de que llegue le preguntaremos cómo le fue.',
    thxw: 'Está en la lista', thxws: 'Gracias, {n}. Le escribiremos apenas K11 y las muestras lleguen a su zona.',
    dup: 'Ya tenemos un pedido con este mail. Nos pondremos en contacto pronto.', err: 'Complete los campos obligatorios (con *).', pickErr: 'Elija un producto.', back: 'Volver al formulario', home: 'wylcosolutions.com',
    cm: { s: 'Recibimos su pedido de muestra K11', b: n => `Hola ${n}:\n\nRecibimos su pedido de una muestra gratis de K11 (${'{p}'}). La enviaremos desde Miami y le mandaremos el número de seguimiento por mail.\n\nCuando llegue le preguntaremos cómo le fue, bueno o malo. Su opinión sincera nos ayuda mucho.\n\n— Fernando Lete · Wylco Solutions\n+1 (954) 881-8870 · info@wylcosolutions.com` },
    cw: { s: 'Está en la lista de acceso anticipado de K11', b: n => `Hola ${n}:\n\nGracias por sumarse a la lista de acceso anticipado de K11. Nuestras primeras muestras salen al sur de Florida; le escribiremos apenas K11 y las muestras lleguen a su zona.\n\n— Fernando Lete · Wylco Solutions\n+1 (954) 881-8870 · info@wylcosolutions.com` }
  }
};

async function cupos() {
  const [h] = await redis([['HGETALL', 'k11:camp']]); const o = { tf: 0, tf2: 0, sp: 0 };
  if (Array.isArray(h)) for (let i = 0; i < h.length; i += 2) o[h[i]] = +h[i + 1] || 0; else if (h && typeof h === 'object') for (const k in h) o[k] = +h[k] || 0;
  return Object.fromEntries(Object.keys(o).map(k => [k, Math.max(0, CAP - o[k])]));
}

const CSS = `*{box-sizing:border-box;margin:0}body{font-family:'DM Sans',Arial,sans-serif;background:#F5F0E8;color:#0F1117;-webkit-text-size-adjust:100%}
.top{background:#0F1117;color:#fff;padding:14px 18px;display:flex;align-items:center;gap:10px;font:900 22px 'Barlow Condensed',sans-serif;letter-spacing:.16em}.top img{width:34px;height:34px}
.wrap{max-width:640px;margin:0 auto;padding:22px 16px 48px}h1{font:900 38px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.01em}
.lead{margin:10px 0 20px;color:#3A3F4D;line-height:1.5}h2{font:800 18px 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#B84417;margin:22px 0 10px}
.prods{display:grid;gap:10px}.pr{position:relative}.pr input{position:absolute;opacity:0}.pr label{display:flex;gap:12px;align-items:center;background:#fff;border:2px solid #E2D8CB;border-radius:12px;padding:12px;cursor:pointer}
.pr input:checked+label{border-color:#D4541A;box-shadow:0 0 0 3px rgba(212,84,26,.18)}.pr input:focus-visible+label{outline:3px solid #0F1117}.pr img{width:92px;height:62px;object-fit:contain;flex:0 0 92px}
.pr b{display:block;font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.04em}.pr small{color:#5E6372}.pr .n{margin-left:auto;font:800 14px 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#B84417;white-space:nowrap}
.pr.off label{opacity:.65}.g{display:grid;gap:12px}.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}label.f{display:block;font-size:14px;font-weight:500}label.f span{display:block;margin-bottom:4px}
input[type=text],input[type=email],input[type=tel],select{width:100%;font:16px 'DM Sans',Arial,sans-serif;padding:12px;border:1.5px solid #cfc5b6;border-radius:8px;background:#fff;color:#0F1117}
input:focus,select:focus{outline:3px solid rgba(212,84,26,.35);border-color:#D4541A}.chk{display:flex;flex-wrap:wrap;gap:8px}.chk label{background:#fff;border:1.5px solid #cfc5b6;border-radius:99px;padding:8px 14px;font-size:14px;cursor:pointer}
.ok{display:flex;gap:10px;align-items:flex-start;margin:18px 0;font-size:14px;color:#3A3F4D}.ok input{margin-top:3px;width:18px;height:18px}
button{width:100%;background:#D4541A;color:#fff;border:0;border-radius:10px;padding:16px;font:900 22px 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}button:hover{background:#B84417}
.err{background:#fde8e0;border:1px solid #D4541A;color:#7a2a0a;padding:10px 12px;border-radius:8px;margin-bottom:14px}.hp{position:absolute;left:-9999px}.sm{font-size:12px;color:#5E6372;margin-top:14px}
.box{background:#fff;border-radius:14px;padding:26px;margin-top:18px;border-left:6px solid #D4541A}.box p{line-height:1.55;margin-top:8px}.lang{float:right;font-size:14px}.lang a{color:#fff;margin-left:10px}
@media(max-width:480px){h1{font-size:32px}.g2{grid-template-columns:1fr}}`;
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800;900&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">`;
const IMG = { tf: '/assets/email/p-tf.jpg', tf2: '/assets/email/p-tf2.jpg', sp: '/assets/email/p-sp-en.jpg' };

function shell(L, title, body) {
  return `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} | Wylco · K11</title>${FONTS}<style>${CSS}</style></head><body><div class="top"><img src="/assets/logo-knockout.png" alt="">WYLCO<span class="lang" style="margin-left:auto;font:500 14px 'DM Sans',sans-serif;letter-spacing:0"><a href="?lang=en">EN</a><a href="?lang=es">ES</a></span></div><div class="wrap">${body}</div></body></html>`;
}

function form(L, { row, left, vals = {}, err = '', wait }) {
  const t = TX[L], v = k => esc(vals[k] || '');
  const sel = vals.sku || '';
  const prods = Object.keys(PROD).map(k => { const n = left[k], off = n <= 0 && !wait; return `<div class="pr${n <= 0 ? ' off' : ''}"><input type="radio" id="s-${k}" name="sku" value="${k}" required${sel === k ? ' checked' : ''}><label for="s-${k}"><img src="${IMG[k]}" alt="" loading="lazy"><span><b>${esc(PROD[k][0].replace(/-/g, '\u2011'))}</b><small>${esc(L === 'es' ? PROD[k][2] : PROD[k][1])}</small></span>${wait ? '' : `<span class="n">${esc(n > 0 ? t.left(n) : t.wl)}</span>`}</label></div>`; }).join('');
  const refs = REFS.map(r => `<label><input type="checkbox" name="refs" value="${r}" style="width:auto"${[].concat(vals.refs || []).includes(r) ? ' checked' : ''}> ${r}</label>`).join('');
  return `<h1>${esc(wait ? t.lh1 : t.h1)}</h1><p class="lead">${esc(wait ? t.ll : t.lead.replace('{n}', CAP))}</p>
${err ? `<div class="err" role="alert">${esc(err)}</div>` : ''}
<form method="post" action="/samples" novalidate><input type="hidden" name="r" value="${esc(row ? row.id : '')}"><input type="hidden" name="lang" value="${L}"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<h2>${esc(t.p1)}</h2><div class="prods">${prods}</div>
<h2>${esc(t.p2)}</h2><div class="g"><div class="g2">
<label class="f"><span>${esc(t.name)} *</span><input type="text" name="name" required autocomplete="name" value="${v('name')}"></label>
<label class="f"><span>${esc(t.comp)} *</span><input type="text" name="company" required autocomplete="organization" value="${esc(vals.company || (row && row.emp) || '')}"></label></div>
<div class="g2"><label class="f"><span>${esc(t.email)} *</span><input type="email" name="email" required autocomplete="email" inputmode="email" value="${v('email')}"></label>
<label class="f"><span>${esc(t.phone)} *</span><input type="tel" name="phone" required autocomplete="tel" inputmode="tel" value="${v('phone')}"></label></div>
<label class="f"><span>${esc(t.role)}</span><select name="role">${Object.keys(ROLES).map(k => `<option value="${k}"${vals.role === k ? ' selected' : ''}>${esc(ROLES[k][L === 'es' ? 1 : 0])}</option>`).join('')}</select></label>
<label class="f"><span>${esc(t.addr)} *</span><input type="text" name="addr" required autocomplete="street-address" value="${v('addr')}"></label>
<div class="g2"><label class="f"><span>${esc(t.city)} *</span><input type="text" name="city" required autocomplete="address-level2" value="${esc(vals.city || (row && row.c) || '')}"></label>
<div class="g2"><label class="f"><span>${esc(t.state)} *</span><input type="text" name="state" required maxlength="2" autocomplete="address-level1" value="${esc(vals.state || 'FL')}"></label><label class="f"><span>${esc(t.zip)} *</span><input type="text" name="zip" required inputmode="numeric" autocomplete="postal-code" value="${v('zip')}"></label></div></div></div>
<h2>${esc(t.p3)}</h2><div class="g"><label class="f"><span>${esc(t.buy)}</span><input type="text" name="buy" value="${v('buy')}"></label>
<div><div style="font-size:14px;font-weight:500;margin-bottom:6px">${esc(t.refs)}</div><div class="chk">${refs}</div></div>
<label class="f"><span>${esc(t.jobs)}</span><select name="jobs"><option value="">${esc(t.jobsh)}</option>${Object.keys(JOBS).map(k => `<option value="${k}"${vals.jobs === k ? ' selected' : ''}>${JOBS[k]}</option>`).join('')}</select></label></div>
<label class="ok"><input type="checkbox" name="call" value="1" checked> <span>${esc(t.ok)}</span></label>
<button type="submit">${esc(wait ? t.sendl : t.send)}</button><p class="sm">Wylco Solutions LLC · Miami, FL · +1 (954) 881-8870</p></form>`;
}

const page = (res, L, title, body, code = 200) => { res.statusCode = code; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(shell(L, title, body)); };
const rowOf = id => { const n = parseInt(id, 10); return n ? D.rows.find(r => r.id === n && /^mues/.test(r.k)) : null; };

module.exports = async (req, res) => {
  const q = req.query || {};
  if (req.method === 'GET' || req.method === 'HEAD') {
    const L = q.lang === 'es' ? 'es' : 'en', row = rowOf(q.r), left = await cupos();
    const wait = !!(row && row.g === 'E');
    return page(res, L, TX[L].t, form(L, { row, left, wait }));
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).end('Method not allowed'); }
  let b = req.body || {}; if (typeof b === 'string') b = Object.fromEntries(new URLSearchParams(b));
  const L = b.lang === 'es' ? 'es' : 'en', t = TX[L], row = rowOf(b.r);
  if (b.website) return page(res, L, t.thx, `<div class="box"><h1>${esc(t.thx)}</h1></div>`);
  const f = {}; for (const k of ['name', 'company', 'email', 'phone', 'addr', 'city', 'state', 'zip', 'role', 'buy', 'jobs']) f[k] = clean(b[k], k === 'addr' || k === 'buy' ? 200 : 80);
  f.email = f.email.toLowerCase(); f.state = f.state.toUpperCase();
  f.refs = [].concat(b.refs || []).filter(r => REFS.includes(r)); f.sku = PROD[b.sku] ? b.sku : ''; f.call = b.call === '1';
  const left0 = await cupos(), wait0 = !!(row && row.g === 'E');
  const back = e => page(res, L, t.t, form(L, { row, left: left0, vals: f, err: e, wait: wait0 }), 400);
  if (!f.sku) return back(t.pickErr);
  if (!f.name || !f.company || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email) || f.phone.replace(/\D/g, '').length < 7 || !f.addr || !f.city || !/^[A-Z]{2}$/.test(f.state) || !/^\d{5}(-\d{4})?$/.test(f.zip)) return back(t.err);
  // un pedido por mail
  const [dup] = await redis([['HSETNX', 'k11:camp_mail', f.email, new Date().toISOString()]]);
  if (+dup === 0) return page(res, L, t.thx, `<div class="box"><h1>${esc(t.thx)}</h1><p>${esc(t.dup)}</p></div>`);
  // reservar cupo (atómico); si no alcanzó o es lista de espera, queda sin muestra
  let sample = false;
  if (!wait0) { const [n] = await redis([['HINCRBY', 'k11:camp', f.sku, 1]]); if (+n <= CAP) sample = true; else await redis([['HINCRBY', 'k11:camp', f.sku, -1]]); }
  const id = 'C' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(), fecha = hoy(), P = PROD[f.sku][0];
  const enc = [`Rol: ${ROLES[f.role] ? ROLES[f.role][0] : '—'}`, f.buy && `Compra en: ${f.buy}`, f.refs.length && `Refrigerantes: ${f.refs.join(', ')}`, f.jobs && `Fugas/mes: ${JOBS[f.jobs]}`, `Elegió: ${P}${sample ? '' : ' (sin muestra: lista de espera)'}`, `Segmento ${row ? row.g : '—'}`, f.call ? 'OK llamar' : 'NO llamar'].filter(Boolean).join(' · ');
  const m = { id, at: new Date().toISOString(), origen: 'Campaña', ep: 'Campaña muestras' + (row ? ' · grupo ' + row.g : ''), nom: f.name, emp: f.company, tel: f.phone, mail: f.email, addr: f.addr, city: f.city, state: f.state, zip: f.zip,
    tf: sample && f.sku === 'tf' ? 1 : 0, tf2: sample && f.sku === 'tf2' ? 1 : 0, sp: sample && f.sku === 'sp' ? 1 : 0, carrier: 'UPS', tracking: '', est: 'Respondió', fecha, seg: sample ? mas(fecha, 2) : mas(fecha, 14), ultimo: '', notas: enc, camp: { r: row ? row.id : null, g: row ? row.g : null, sample, enc: { role: f.role, buy: f.buy, refs: f.refs, jobs: f.jobs, call: f.call } } };
  await redis([['HSET', 'k11:muestras', id, JSON.stringify(m)], ['HSETNX', 'k11:stop', f.email, 'respondió']]);
  const hi = f.name.split(' ')[0];
  try { await X.mail(X.TO(), `[K11] ${sample ? 'Muestra pedida' : 'Lista de espera'}: ${f.company} (${P})`, `${f.name} · ${f.company}\n${f.email} · ${f.phone}\n${f.addr}, ${f.city}, ${f.state} ${f.zip}\n\n${enc}\n\nCargada en Muestras (estado Respondió): ${X.SITE}/admin?v=muestras`); } catch (e) { console.error('muestra aviso', e.message); }
  try { const c = sample ? t.cm : t.cw; await X.mail(f.email, c.s, c.b(hi).replace('{p}', P)); } catch (e) { console.error('muestra confirm', e.message); }
  return page(res, L, t.thx, `<div class="box"><h1>${esc(sample ? t.thx : t.thxw)}</h1><p>${esc((sample ? t.thxs : t.thxws).replace('{n}', hi).replace('{p}', P))}</p></div><p class="sm"><a href="/">${t.home}</a></p>`);
};
module.exports.config = { maxDuration: 15 };
