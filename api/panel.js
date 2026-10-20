const { D, leerEstado, marcarStop, autorizado, hoy } = require('./_lib/core');
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
module.exports = async (req, res) => {
  if (!autorizado(req)) return res.status(401).send('no autorizado');
  const k = req.query.k;
  if (req.query.email) { await marcarStop(req.query.email, req.query.motivo || ''); return res.redirect(302, '/api/panel?k=' + encodeURIComponent(k)); }
  const { est, stop } = await leerEstado();
  const h = hoy(), c = { enviado: 0, omitido: 0, error: 0, pendiente: 0 };
  const filas = D.rows.map(r => {
    const s = est[r.id]; const e = s ? s.e : 'pendiente'; c[e]++;
    const st = stop[r.e] || '';
    const btn = m => `<a href="/api/panel?k=${encodeURIComponent(k)}&email=${encodeURIComponent(r.e)}&motivo=${m}">${m}</a>`;
    return `<tr class="${e}${r.f === h ? ' hoy' : ''}"><td>${r.f}</td><td>${r.k}</td><td>${r.g}</td><td>${esc(r.emp)}</td><td>${esc(r.e)}</td><td>${e}</td><td>${esc(s && s.n)}</td><td>${st ? `<b>${st}</b> <a href="/api/panel?k=${encodeURIComponent(k)}&email=${encodeURIComponent(r.e)}&motivo=">quitar</a>` : btn('respondió') + ' · ' + btn('baja')}</td></tr>`;
  }).join('');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Envíos K11</title>
<style>body{font:14px system-ui;margin:24px;background:#F5F0E8;color:#0F1117}h1{font-size:22px}.k{display:flex;gap:16px;flex-wrap:wrap;margin:12px 0}.k b{font-size:20px;display:block}table{border-collapse:collapse;width:100%;background:#fff;font-size:12.5px}td{padding:5px 8px;border-bottom:1px solid #eee}tr.enviado td:nth-child(6){color:#2a7a2a}tr.error td:nth-child(6){color:#b00}tr.omitido{opacity:.55}tr.hoy{background:#fff4ec}a{color:#D4541A}</style>
<h1>Envíos K11 · hoy ${h}</h1><div class="k">${Object.entries(c).map(([a, b]) => `<div><b>${b}</b>${a}</div>`).join('')}</div>
<p><a href="/api/enviar?k=${encodeURIComponent(k)}&simular=1">Simular envío de hoy</a> · <a href="/api/test?k=${encodeURIComponent(k)}">Mail de prueba</a></p>
<table><tr><th>Fecha</th><th>Plantilla</th><th>Grupo</th><th>Empresa</th><th>Email</th><th>Estado</th><th>Nota</th><th>Marcar</th></tr>${filas}</table>`);
};
