// Portal del cliente: pedidos, facturas, certificado de reventa, baja de mails. Link firmado: /api/portal?e=email&t=firma
const T = require('./_lib/tienda');
const X = require('./_lib/extras');
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const usd = n => n ? '$' + (+n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
const ST = { nuevo: ['Received', 'Recibido'], confirmado: ['Invoiced', 'Facturado'], 'pago pendiente': ['Payment pending', 'Pago pendiente'], pagado: ['Paid', 'Pagado'], enviado: ['Shipped', 'Enviado'], cancelado: ['Cancelled', 'Cancelado'] };
const page = (L, body) => `<!DOCTYPE html><html lang="${L}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>K11 · ${L === 'es' ? 'Mis pedidos' : 'My orders'}</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800;900&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>:root{--o:#D4541A;--od:#B84417;--ink:#0F1117;--mut:#6B645A;--w:#F5F0E8;--w2:#EDE6DA;--w3:#E2D8CB}*{box-sizing:border-box}body{margin:0;background:var(--w);color:var(--ink);font:15px/1.55 "DM Sans",system-ui,sans-serif}a{color:var(--od)}a:hover{color:var(--ink)}
header{background:var(--ink);color:#fff;padding:16px max(20px,4vw);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}header b{font:800 1.1rem "Barlow Condensed",sans-serif;letter-spacing:.14em;text-transform:uppercase}header a{color:#F08A5D}
main{max-width:920px;margin:0 auto;padding:28px max(20px,4vw) 60px;display:grid;gap:18px}h1{font:900 2.4rem/1 "Barlow Condensed",sans-serif;text-transform:uppercase;margin:0}h2{font:800 1.4rem "Barlow Condensed",sans-serif;text-transform:uppercase;margin:0 0 10px}
.card{background:#fff;border:1px solid var(--w3);border-radius:14px;padding:18px 20px;overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:560px}th,td{text-align:left;padding:10px 8px;border-top:1px solid var(--w2);vertical-align:top;font-size:14px}th{font-size:12px;color:var(--mut);text-transform:uppercase;letter-spacing:.06em;border-top:0}.r{text-align:right}
.tag{display:inline-block;font-size:12px;font-weight:700;padding:2px 9px;border-radius:20px;background:var(--w2)}.ok{background:#DCEFE2;color:#1D7A3A}.mut{color:var(--mut)}
label{display:grid;gap:5px;font-size:13px;font-weight:600;color:var(--mut)}input{font:inherit;border:1px solid var(--w3);border-radius:8px;padding:10px 12px;min-height:44px;width:100%}
.btn{display:inline-flex;align-items:center;min-height:44px;padding:0 20px;border-radius:10px;background:var(--o);color:#fff;border:0;font:700 14px "DM Sans",sans-serif;cursor:pointer;text-decoration:none}.btn:hover{background:var(--od);color:#fff}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;align-items:end}.note{padding:12px 16px;border-radius:10px;background:#DCEFE2;color:#1D7A3A;font-weight:600}</style></head><body>${body}</body></html>`;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const q = req.query || {}, e = String(q.e || '').toLowerCase(), t = String(q.t || '');
  if (!X.firmaOk(e, t)) return res.status(403).send('Link inválido / invalid link');
  const c = await T.cliente(e), L = q.lang === 'es' || (!q.lang && c && /es/.test(c.lang || '')) ? 'es' : (q.lang === 'en' ? 'en' : 'en'), es = L === 'es';
  const self = `/api/portal?e=${encodeURIComponent(e)}&t=${t}`;
  if (req.method === 'POST') {
    let b = req.body || {}; if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = Object.fromEntries(new URLSearchParams(b)); } }
    if (!c) return res.status(404).json({ ok: false });
    if (b.a === 'cert') {
      const num = String(b.num || '').slice(0, 60), name = String(b.name || 'certificate.pdf').replace(/[^\w.\- ]/g, '').slice(0, 80), data = String(b.data || '');
      if (!num && !data) return res.status(400).json({ ok: false });
      if (data.length > 5.5e6) return res.status(413).json({ ok: false, error: 'File too large (max 4 MB)' });
      c.cert = { num, file: name, at: X.now(), estado: 'pendiente' }; if (num) c.ein = c.ein || num; await T.guardarCliente(c);
      try { await X.mail(X.TO(), `[K11] Certificado de reventa · ${c.company || e}`, `${c.company || ''} <${e}> subió su certificado de reventa.\nNúmero: ${num || '—'}\n\nAprobar (marca exento de sales tax): ${X.SITE}/admin?v=cliente&id=${encodeURIComponent(e)}`, data ? [{ filename: name, content: data }] : null); } catch {}
      return res.json({ ok: true });
    }
    return res.status(400).json({ ok: false });
  }
  if (q.baja && c) { c.nomail = true; await T.guardarCliente(c); return res.send(page(L, `<header><b>K11 America</b></header><main><div class="note">${es ? 'Listo: no te vamos a mandar más novedades. Los mails de tus pedidos y facturas siguen llegando.' : 'Done: you will no longer receive our updates. Order and invoice emails will still arrive.'}</div><a href="${self}">${es ? 'Ver mis pedidos' : 'View my orders'}</a></main>`)); }
  const os = (await T.pedidos()).filter(o => o.cliente === e || o.email === e);
  const rows = os.map(o => `<tr><td><b>${esc(o.ref)}</b><br><span class="mut">${o.at.slice(0, 10)}</span></td><td>${(o.items || []).map(i => `${i.cases} × ${esc(i.name)}${i.preorder ? ` <span class="tag">${i.preorder} pre-order</span>` : ''}`).join('<br>')}</td><td class="r">${usd(o.total)}</td>
<td><span class="tag${['pagado', 'enviado'].includes(o.estado) ? ' ok' : ''}">${(ST[o.estado] || [o.estado, o.estado])[es ? 1 : 0]}</span>${o.tracking ? `<br><a href="${esc(X.trackUrl(o.carrier, o.tracking))}" target="_blank" rel="noopener">${esc(o.carrier || '')} ${esc(o.tracking)}</a>` : ''}</td>
<td>${o.invoice_url ? `<a href="${esc(o.invoice_url)}" target="_blank" rel="noopener">${['pagado', 'enviado'].includes(o.estado) ? (es ? 'Factura' : 'Invoice') : (es ? 'Pagar' : 'Pay')}</a>${o.invoice_pdf ? ` · <a href="${esc(o.invoice_pdf)}">PDF</a>` : ''}` : '—'}</td></tr>`).join('');
  const re = os.find(o => o.estado !== 'cancelado'), again = re ? `${es ? '/es' : ''}/order?${(re.items || []).map(i => 'qty_' + i.slug + '=' + i.cases).join('&')}#checkout` : `${es ? '/es' : ''}/order`;
  const cs = c && c.cert, ex = c && c.exento;
  const cert = `<div class="card"><h2>${es ? 'Certificado de reventa' : 'Resale certificate'}</h2>${ex ? `<p class="note" style="margin:0">${es ? 'Tu cuenta está exenta de sales tax.' : 'Your account is sales-tax exempt.'}</p>` : cs ? `<p class="mut" style="margin:0">${es ? 'Recibimos tu certificado' : 'Certificate received'} (${esc(cs.num || cs.file)}) · ${es ? 'en revisión' : 'under review'}.</p>` : `<p class="mut" style="margin:0 0 12px">${es ? 'Subí tu certificado (Florida Annual Resale Certificate u otro estado) para comprar sin sales tax.' : 'Upload your resale certificate (Florida Annual Resale Certificate or other state) to buy tax-free.'}</p>
<form id="cf" class="fg"><label>${es ? 'Número de certificado' : 'Certificate number'}<input name="num" required></label><label>PDF / JPG (max 4 MB)<input type="file" name="f" accept=".pdf,image/*"></label><div><button class="btn">${es ? 'Enviar' : 'Submit'}</button></div></form><p id="cm" class="mut"></p>
<script>document.getElementById('cf').onsubmit=async function(ev){ev.preventDefault();var f=this.f.files[0],num=this.num.value,m=document.getElementById('cm');m.textContent='…';var data='',name='';if(f){if(f.size>4e6){m.textContent='Max 4 MB';return;}name=f.name;data=await new Promise(function(ok){var r=new FileReader();r.onload=function(){ok(String(r.result).split(',')[1]);};r.readAsDataURL(f);});}
var r=await fetch(location.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({a:'cert',num:num,name:name,data:data})});m.textContent=r.ok?${JSON.stringify(es ? 'Recibido. Te avisamos cuando quede aprobado.' : 'Received. We will let you know once it is approved.')}:'Error';if(r.ok)this.reset();};</script>`}</div>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(page(L, `<header><b>K11 America</b><span><a href="${self}&lang=${es ? 'en' : 'es'}">${es ? 'English' : 'Español'}</a></span></header><main>
<div style="display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap"><div><h1>${es ? 'Mis pedidos' : 'My orders'}</h1><div class="mut">${esc((c && c.company) || e)}</div></div><a class="btn" href="${again}">${re ? (es ? 'Repetir último pedido' : 'Reorder last order') : (es ? 'Hacer un pedido' : 'Place an order')}</a></div>
<div class="card">${rows ? `<table><thead><tr><th>${es ? 'Pedido' : 'Order'}</th><th>${es ? 'Productos' : 'Items'}</th><th class="r">Total</th><th>${es ? 'Estado' : 'Status'}</th><th>${es ? 'Factura' : 'Invoice'}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="mut" style="margin:0">${es ? 'Todavía no hay pedidos.' : 'No orders yet.'}</p>`}</div>
${cert}<p class="mut" style="font-size:13px">${es ? 'Hojas de seguridad' : 'Safety Data Sheets'}: <a href="/docs">wylcosolutions.com/docs</a> · <a href="${self}&baja=1">${es ? 'No recibir novedades' : 'Unsubscribe from updates'}</a></p></main>`));
};
module.exports.config = { api: { bodyParser: { sizeLimit: '6mb' } } };
