const { pedido, cliente, BY, SITE } = require('../tienda');
const TOK = process.env.ADMIN_TOKEN;
const FROM = (process.env.SHIP_FROM || 'Wylco LLC\nMiami, FL\nUSA\n+1 (954) 881-8870').split(/\\n|\n/);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Etiquetas de envío 4×6" (una por caja) para impresora térmica o papel
function render(o) {
  const boxes = [];
  for (const i of o.items || []) {
    for (let n = 0; n < (i.reserved || 0); n++) boxes.push({ ...i, pre: false });
    for (let n = 0; n < (i.preorder || 0); n++) boxes.push({ ...i, pre: true });
  }
  const N = boxes.length;
  const to = [o.company, o.contact ? 'Attn: ' + o.contact : '', o.address, [o.city, o.state, o.zip].filter(Boolean).join(', ').replace(/, (\d{5})/, ' $1'), o.phone].filter(Boolean);
  const pages = boxes.map((b, k) => `<section class="lb">
<div class="hd"><div class="from"><div class="cap">FROM</div>${FROM.map(esc).join('<br>')}</div><div class="lg"><img src="/assets/logo-knockout-black.png" alt="Wylco"><span>wylcosolutions.com</span></div></div>
<div class="to"><div class="cap">SHIP TO</div><div class="addr">${to.map((l, j) => j === 0 ? `<b>${esc(l)}</b>` : esc(l)).join('<br>')}</div></div>
<div class="box"><div><div class="cap">CONTENTS</div><div class="sku">${esc(b.sku)}</div><div class="nm">${esc(b.name)}</div><div class="u">1 case${b.units ? ' · ' + b.units + ' units' : ''}</div></div>
<div class="cnt"><div class="cap">BOX</div><b>${k + 1}</b><span>of ${N}</span></div></div>
<div class="ft"><div class="fl"><div><div class="cap">ORDER</div><div class="ref">${esc(o.ref)}</div></div>${b.pre ? '<div class="pre">PRE-ORDER</div>' : ''}</div><div class="qr" data-u="${esc((SITE || 'https://wylcosolutions.com') + ((BY[b.slug] && BY[b.slug].sds) || '/docs'))}">SCAN · SDS</div><div class="hz">HVAC-R chemicals · Safety Data Sheet: scan the QR or visit wylcosolutions.com/docs</div></div>
</section>`).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>Labels ${esc(o.ref)}</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>@page{size:4in 6in;margin:0}*{box-sizing:border-box}body{margin:0;background:#ddd;font:11pt/1.3 "DM Sans",Arial,sans-serif;color:#000}
.bar{position:sticky;top:0;background:#0F1117;color:#fff;padding:10px 16px;display:flex;gap:16px;align-items:center;justify-content:space-between;font-size:14px}.bar button{font:600 14px "DM Sans",sans-serif;background:#D4541A;color:#fff;border:0;border-radius:8px;padding:10px 18px;cursor:pointer}.bar button:hover{background:#B84417}.bar a{color:#F08A5D}
.wrap{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;padding:20px}
.lb{width:4in;height:6in;background:#fff;padding:.18in;display:grid;grid-template-rows:auto 1fr auto auto;gap:.1in;overflow:hidden;break-after:page;page-break-after:always}
.cap{font:700 7.5pt "DM Sans",sans-serif;letter-spacing:.12em;color:#000;margin-bottom:2pt}
.from{font-size:9pt}
.to{padding:.06in 0}.addr{font-size:15pt;line-height:1.25}.addr b{font:900 22pt/1 "Barlow Condensed",sans-serif;text-transform:uppercase;display:block;margin-bottom:4pt}
.box{display:grid;grid-template-columns:1fr auto;gap:.12in;border:2pt solid #000;padding:.1in}
.sku{font:700 13pt ui-monospace,Menlo,monospace}.nm{font:800 15pt/1.05 "Barlow Condensed",sans-serif;text-transform:uppercase}.u{font-size:9pt}
.cnt{text-align:center;border-left:2pt solid #000;padding-left:.12in;display:flex;flex-direction:column;justify-content:center}.cnt b{font:900 34pt/1 "Barlow Condensed",sans-serif}.cnt span{font-size:9pt}
.hd{display:flex;justify-content:space-between;align-items:flex-start;gap:.1in;border-bottom:2pt solid #000;padding-bottom:.08in}.lg{display:flex;flex-direction:column;align-items:flex-end;gap:3pt;font:700 8pt "DM Sans",sans-serif}.lg img{width:.55in;height:.55in;display:block}
.ft{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4pt .12in;align-items:end}.fl{display:flex;flex-direction:column;align-items:flex-start;gap:4pt}.ref{font:900 20pt/1 "Barlow Condensed",sans-serif;letter-spacing:.04em}
.qr{width:.95in;text-align:center;font:700 6.5pt "DM Sans",sans-serif;letter-spacing:.1em}.qr svg{width:.95in;height:.95in;display:block;margin-bottom:2pt}
.pre{font:900 14pt "Barlow Condensed",sans-serif;background:#000;color:#fff;padding:2pt 8pt}.hz{grid-column:1/-1;font-size:7.5pt;border-top:1pt solid #000;padding-top:3pt}
@media print{body{background:#fff}.bar{display:none}.wrap{display:block;padding:0}}</style></head><body>
<div class="bar"><span><b>${esc(o.ref)}</b> · ${N} etiqueta(s) 4×6" · una por caja</span><span><a href="/admin?v=venta&ref=${encodeURIComponent(o.ref)}">Volver a la venta</a> <button onclick="print()">Imprimir</button></span></div>
<div class="wrap">${pages || '<p>Esta venta no tiene cajas.</p>'}</div><script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script><script>document.querySelectorAll('.qr[data-u]').forEach(function(e){var q=qrcode(0,'M');q.addData(e.dataset.u);q.make();e.insertAdjacentHTML('afterbegin',q.createSvgTag({cellSize:2,margin:0,scalable:true}));});</script></body></html>`;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const ck = (req.headers.cookie || '').match(/k11adm=([^;]+)/);
  const okTok = x => !!x && (x === TOK || (!!process.env.ADMIN_TOKEN_DEPOSITO && x === process.env.ADMIN_TOKEN_DEPOSITO));
  if (!TOK || (!okTok(ck && decodeURIComponent(ck[1])) && !okTok(req.query.k))) { res.writeHead(303, { Location: '/admin' }); return res.end(); }
  const o = await pedido(req.query.ref);
  if (!o) return res.status(404).send('Venta no encontrada');
  if (o.cliente) { const c = await cliente(o.cliente); if (c) for (const k of ['company', 'contact', 'address', 'city', 'state', 'zip', 'phone']) if (!o[k] && c[k]) o[k] = c[k]; }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(render(o));
};
module.exports.render = render;
