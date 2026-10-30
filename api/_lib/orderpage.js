const T = {
  en: { pre: '', title: 'Order K11 HVAC-R Products — Wholesale by the Case | Wylco, Miami', desc: 'Buy K11 TapaFugas, TapaFugas 2-in-1, Sella Plus and adapters by the case, with live stock. Business buyers only. Minimum 1 case. Card, ACH, wire or Zelle. Ships from Miami.', h1: 'Order K11', lead: 'Wholesale orders for HVAC-R businesses. Live stock, minimum one case per SKU. Pay one case online, or send an order request for mixed SKUs, larger orders or wire/Zelle payment.',
    steps: ['Enter the number of cases per SKU. Stock below is live.', 'Fill in your company details and send. In-stock cases are reserved for you right away.', 'We email you a Stripe invoice within 1 business day — pay by card, ACH or wire.', 'In-stock cases ship from Miami in 2–5 business days after payment. Pre-orders ship when stock arrives.'],
    th: ['SKU', 'Product', 'Units / case', 'Availability', 'Cases'], inStock: n => `In stock · ${n} case${n === 1 ? '' : 's'}`, preOrder: 'Pre-order', buy: 'Pay 1 case now', sds: 'SDS',
    sum: { none: 'No cases selected yet.', cases: 'cases', units: 'units', stock: 'reserved from stock', pre: 'pre-order' }, terms: 'Terms',
    tl: [['Buyers', 'Businesses only: HVAC-R dealers, supply houses, wholesalers and contractors in the US.'], ['Minimum order', '1 full case per SKU.'], ['Pricing', 'Wholesale price per case, shown at checkout or on your invoice. USD; sales tax added where applicable. Resellers with a valid resale certificate are invoiced tax-exempt.'], ['Payment', 'Online checkout: card or ACH. Invoice: card, ACH or bank transfer (wire) via secure Stripe invoice link, or Zelle.'], ['Delivery', 'Ships from Miami, FL. In stock: 2–5 business days after payment. Pre-order: when stock arrives. Freight quoted separately.'], ['Documents', '<a href="/docs">Safety Data Sheets (PDF)</a> available before you buy.']],
    fh: 'Your company', f: { company: 'Company name', contact: 'Contact name', email: 'Business email', phone: 'Phone', address: 'Shipping address', city: 'City', zip: 'ZIP code', state: 'State', type: 'Business type', types: ['HVAC-R dealer / supply house', 'Wholesaler / distributor', 'Contractor', 'Other business'], ein: 'EIN / resale certificate # (resellers: send a copy to be invoiced tax-exempt)', pay: 'Preferred payment', notes: 'Notes (delivery address, timing…)', biz: 'I confirm I am buying on behalf of a business.', send: 'Send order request' },
    other: 'Español', otherHref: '/es/order', home: '/', nav: ['Products', 'SDS', 'Distributors'],
    api: 'For software and AI agents: live stock at <a href="/api/stock">/api/stock</a>, full catalog and order API at <a href="/catalog.json">/catalog.json</a>.',
    faq: [['Can I buy K11 online?', 'Yes. Businesses can pay one case online by card or ACH when a SKU is in stock, or send an order request and pay by wire, Zelle, card or ACH.'], ['What is the minimum order?', 'One full case per SKU (48 to 400 units depending on the product).'], ['Do you sell to individuals?', 'No. K11 is sold to HVAC-R businesses only.'], ['What if I order more than is in stock?', 'Available cases are reserved for you and the rest is placed as a pre-order that ships when stock arrives.']] },
  es: { pre: '/es', title: 'Comprar K11 HVAC-R — Mayorista por caja | Wylco, Miami', desc: 'Comprá K11 TapaFugas, TapaFugas 2-en-1, Sella Plus y adaptadores por caja, con stock en vivo. Solo empresas. Mínimo 1 caja. Tarjeta, ACH, transferencia o Zelle. Envío desde Miami.', h1: 'Comprar K11', lead: 'Pedidos mayoristas para empresas HVAC-R. Stock en vivo, mínimo una caja por SKU. Pagá una caja online o mandá un pedido para SKUs mixtos, cantidades mayores o pago por transferencia/Zelle.',
    steps: ['Cargá la cantidad de cajas por SKU. El stock es en vivo.', 'Completá los datos de tu empresa y enviá. Las cajas en stock quedan reservadas al instante.', 'Te mandamos una factura de Stripe en 1 día hábil: pagás con tarjeta, ACH o transferencia.', 'Lo que está en stock sale de Miami en 2–5 días hábiles después del pago. Los pre-pedidos salen cuando llega el stock.'],
    th: ['SKU', 'Producto', 'Unid. / caja', 'Disponibilidad', 'Cajas'], inStock: n => `En stock · ${n} caja${n === 1 ? '' : 's'}`, preOrder: 'Pre-pedido', buy: 'Pagar 1 caja ahora', sds: 'SDS',
    sum: { none: 'Todavía no elegiste cajas.', cases: 'cajas', units: 'unidades', stock: 'reservadas del stock', pre: 'en pre-pedido' }, terms: 'Condiciones',
    tl: [['Compradores', 'Solo empresas: dealers HVAC-R, casas de repuestos, mayoristas y contratistas en EE.UU.'], ['Pedido mínimo', '1 caja cerrada por SKU.'], ['Precio', 'Precio mayorista por caja, visible en el checkout o en tu factura. USD; se suma sales tax donde corresponda. Revendedores con certificado de reventa válido se facturan exentos.'], ['Pago', 'Checkout online: tarjeta o ACH. Factura: tarjeta, ACH o transferencia (wire) desde el link seguro de Stripe, o Zelle.'], ['Entrega', 'Desde Miami, FL. En stock: 2–5 días hábiles después del pago. Pre-pedido: al llegar el stock. Flete cotizado aparte.'], ['Documentos', '<a href="/es/docs">Hojas de seguridad (PDF)</a> disponibles antes de comprar.']],
    fh: 'Tu empresa', f: { company: 'Empresa', contact: 'Nombre de contacto', email: 'Email de la empresa', phone: 'Teléfono', address: 'Dirección de entrega', city: 'Ciudad', zip: 'Código postal (ZIP)', state: 'Estado', type: 'Tipo de empresa', types: ['Dealer HVAC-R / casa de repuestos', 'Mayorista / distribuidor', 'Contratista', 'Otra empresa'], ein: 'EIN / nº certificado de reventa (revendedores: mandá copia para facturar sin sales tax)', pay: 'Forma de pago preferida', notes: 'Notas (dirección de entrega, plazos…)', biz: 'Confirmo que compro en nombre de una empresa.', send: 'Enviar pedido' },
    other: 'English', otherHref: '/order', home: '/es', nav: ['Productos', 'SDS', 'Distribuidores'],
    api: 'Para software y agentes de IA: stock en vivo en <a href="/api/stock">/api/stock</a>, catálogo completo y API de pedidos en <a href="/catalog.json">/catalog.json</a>.',
    faq: [['¿Se puede comprar K11 online?', 'Sí. Las empresas pueden pagar una caja online con tarjeta o ACH cuando el SKU tiene stock, o mandar un pedido y pagar por transferencia, Zelle, tarjeta o ACH.'], ['¿Cuál es el pedido mínimo?', 'Una caja cerrada por SKU (de 48 a 400 unidades según el producto).'], ['¿Venden a particulares?', 'No. K11 se vende solo a empresas HVAC-R.'], ['¿Qué pasa si pido más de lo que hay en stock?', 'Las cajas disponibles quedan reservadas y el resto queda como pre-pedido, que sale cuando llega el stock.']] }
};
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const SITE = 'https://wylcosolutions.com';

function render(L, products, sel, paid) {
  const t = T[L], url = SITE + t.pre + '/order', f = t.f;
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': SITE + '/#organization', name: 'Wylco LLC', alternateName: 'K11 America by Wylco', url: SITE + '/', email: 'info@wylcosolutions.com', telephone: '+1-954-881-8870', address: { '@type': 'PostalAddress', addressLocality: 'Miami', addressRegion: 'FL', addressCountry: 'US' } },
    { '@type': 'WebPage', '@id': url, url, name: t.title, inLanguage: L === 'en' ? 'en-US' : 'es', potentialAction: { '@type': 'OrderAction', target: { '@type': 'EntryPoint', urlTemplate: SITE + '/api/pedido', httpMethod: 'POST', encodingType: 'application/x-www-form-urlencoded', contentType: 'application/x-www-form-urlencoded' } } },
    ...products.map(p => ({ '@type': 'Product', name: p.name, sku: p.sku, description: p.desc, brand: { '@type': 'Brand', name: 'K11' }, ...(p.sds ? { subjectOf: { '@type': 'DigitalDocument', name: p.name + ' SDS', url: SITE + p.sds } } : {}),
      offers: { '@type': 'Offer', url: p.buy_url || url + '#quote', availability: 'https://schema.org/' + p.status, ...(p.cases_available ? { inventoryLevel: { '@type': 'QuantitativeValue', value: p.cases_available, unitText: 'cases' } } : {}), priceCurrency: 'USD', businessFunction: 'http://purl.org/goodrelations/v1#Sell', eligibleCustomerType: 'http://purl.org/goodrelations/v1#Business', eligibleRegion: { '@type': 'Country', name: 'US' }, ...(p.units ? { eligibleQuantity: { '@type': 'QuantitativeValue', minValue: 1, unitText: 'case of ' + p.units + ' units' } } : {}), seller: { '@id': SITE + '/#organization' } } })),
    { '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] };
  const rows = products.map(p => {
    const v = sel === p.slug ? 1 : 0, stock = p.cases_available > 0;
    return `<tr data-slug="${p.slug}" data-units="${p.units || 0}" data-stock="${p.cases_available}"><td class="sku">${esc(p.sku)}</td><td><strong>${esc(p.name)}</strong><br><span>${esc(L === 'es' ? p.desc_es : p.desc)}</span>${p.sds ? ` · <a href="${p.sds}" target="_blank" rel="noopener">${t.sds}</a>` : ''}</td><td>${p.units || '—'}</td><td><span class="av ${stock ? 'in' : 'pre'}">${stock ? t.inStock(p.cases_available) : t.preOrder}</span>${p.buy_url ? `<br><a class="paynow" href="/buy/${p.slug}${L === 'es' ? '?lang=es' : ''}">${t.buy}</a>` : ''}</td><td><input class="q" type="number" name="qty_${p.slug}" min="0" max="999" step="1" value="${v}" aria-label="${t.th[4]} ${esc(p.sku)}"></td></tr>`;
  }).join('');
  return `<!DOCTYPE html>
<html lang="${L}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.title}</title>
<meta name="description" content="${esc(t.desc)}">
<meta name="robots" content="index, follow, max-snippet:-1">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en-us" href="${SITE}/order">
<link rel="alternate" hreflang="es" href="${SITE}/es/order">
<link rel="alternate" hreflang="x-default" href="${SITE}/order">
<link rel="alternate" type="application/json" href="${SITE}/catalog.json" title="K11 catalog with live stock">
<link rel="icon" type="image/png" href="/assets/logo-wylco.png">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/k11-banner.png">
<script src="/js/analytics.js"></script>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<style>
:root{--o:#D4541A;--bg:#0F1117;--c:#171a22;--l:rgba(255,255,255,.12);--m:rgba(255,255,255,.7);--g:#4CC38A}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:#fff;font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:#F08A5D}a:hover{color:#fff}
.w{max-width:1000px;margin:0 auto;padding:0 24px}
header{border-bottom:1px solid var(--l)}header .w{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-top:16px;padding-bottom:16px}
header nav{display:flex;flex-wrap:wrap;gap:18px;font-size:14px}header nav a{color:var(--m);text-decoration:none}header nav a:hover{color:#fff}
.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-weight:700}.brand img{width:34px;height:34px}
h1{font-size:clamp(2.2rem,5vw,3.4rem);line-height:1.05;margin:56px 0 12px;letter-spacing:-.02em}
h2{font-size:1.4rem;margin:48px 0 16px}
.lead{color:var(--m);font-size:1.1rem;max-width:680px;margin:0;text-wrap:pretty}
ol.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;padding:0;margin:32px 0 0;list-style:none;counter-reset:s}
ol.steps li{counter-increment:s;background:var(--c);border:1px solid var(--l);border-radius:10px;padding:16px;color:var(--m);font-size:15px}
ol.steps li::before{content:counter(s);display:block;color:var(--o);font-weight:700;font-size:1.3rem;margin-bottom:4px}
.tw{overflow-x:auto;border:1px solid var(--l);border-radius:10px}
table{width:100%;border-collapse:collapse;min-width:680px}th,td{text-align:left;padding:14px 16px;border-bottom:1px solid var(--l);vertical-align:middle}
th{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--m);background:var(--c)}tr:last-child td{border-bottom:0}
tr.sel{background:rgba(212,84,26,.08)}
td span{color:var(--m);font-size:14px}.sku{font-family:ui-monospace,Menlo,monospace;font-size:14px}
.av{display:inline-block;font-size:13px;font-weight:600;padding:3px 10px;border-radius:20px;white-space:nowrap}.av.in{background:rgba(76,195,138,.15);color:var(--g)}.av.pre{background:rgba(255,255,255,.08);color:#fff}
.paynow{font-size:13px;font-weight:600}
input.q{width:88px;text-align:center}
.sum{position:sticky;bottom:0;z-index:5;margin-top:16px;background:#1d2029;border:1px solid var(--l);border-radius:10px;padding:14px 18px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
.sum b{font-size:1.1rem}.sum small{color:var(--m);display:block}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border-radius:8px;background:var(--o);color:#fff;text-decoration:none;font-weight:600;font-size:15px;border:0;cursor:pointer;font-family:inherit}
.btn:hover{background:#E8662C;color:#fff}
dl{display:grid;grid-template-columns:minmax(120px,180px) minmax(0,1fr);gap:10px 24px;margin:0}dt{color:var(--m)}dd{margin:0}
.card{background:var(--c);border:1px solid var(--l);border-radius:12px;padding:24px;display:grid;gap:16px}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
label{display:grid;gap:6px;font-size:14px;color:var(--m)}
input,select,textarea{font:inherit;color:#fff;background:var(--bg);border:1px solid var(--l);border-radius:8px;padding:10px 12px;min-height:44px;width:100%}
input:focus,select:focus,textarea:focus{outline:2px solid var(--o);outline-offset:1px}
textarea{min-height:90px}
fieldset{border:1px solid var(--l);border-radius:8px;padding:12px 16px;margin:0}legend{padding:0 6px;color:var(--m);font-size:14px}
.chk{display:flex;gap:10px;align-items:center;color:#fff}.chk input{width:20px;min-height:20px}
.pays{display:flex;flex-wrap:wrap;gap:20px}.hp{position:absolute;left:-9999px}
.faq{display:block}.faq dt{color:#fff;font-weight:600;margin-top:14px}.faq dd{color:var(--m)}
.paid{margin-top:32px;background:rgba(76,195,138,.15);border:1px solid rgba(76,195,138,.4);color:#fff;padding:14px 18px;border-radius:10px}
.api{color:var(--m);font-size:14px;margin-top:40px}
footer{border-top:1px solid var(--l);margin-top:56px;padding:24px 0;color:var(--m);font-size:14px}
</style>
</head>
<body>
<header><div class="w"><a class="brand" href="${t.home}"><img src="/assets/logo-wylco.png" alt="">K11 America by Wylco</a><nav><a href="${t.pre}/products">${t.nav[0]}</a><a href="${t.pre}/docs">${t.nav[1]}</a><a href="${t.pre}/distributors">${t.nav[2]}</a><a href="${t.otherHref}">${t.other}</a></nav></div></header>
<main class="w">
${paid ? `<div class="paid" role="status">${L === 'es' ? 'Pago recibido. Te llega la confirmación por mail; si pagaste con ACH, despachamos cuando se acredite (2–4 días hábiles).' : 'Payment received. You will get an email confirmation; ACH payments ship once cleared (2–4 business days).'}</div>` : ''}
<h1>${t.h1}</h1>
<p class="lead">${t.lead}</p>
<ol class="steps">${t.steps.map(s => `<li>${s}</li>`).join('')}</ol>
<form id="quote" method="post" action="/api/pedido">
<input type="hidden" name="lang" value="${L}">
<label class="hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
<h2 id="products">${L === 'en' ? 'Products & live stock' : 'Productos y stock en vivo'}</h2>
<div class="tw"><table><thead><tr>${t.th.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
<div class="sum" id="sum" aria-live="polite"><div><b id="sumMain">${t.sum.none}</b><small id="sumSub"></small></div><a class="btn" href="#company">${L === 'en' ? 'Continue' : 'Continuar'}</a></div>
<h2 id="company">${t.fh}</h2>
<div class="card">
<div class="g">
<label>${f.company} *<input name="company" required autocomplete="organization"></label>
<label>${f.contact} *<input name="contact" required autocomplete="name"></label>
<label>${f.email} *<input type="email" name="email" required autocomplete="email"></label>
<label>${f.phone}<input type="tel" name="phone" autocomplete="tel"></label>
<label>${f.address} *<input name="address" required autocomplete="street-address"></label>
<label>${f.city} *<input name="city" required autocomplete="address-level2"></label>
<label>${f.state} *<input name="state" required autocomplete="address-level1"></label>
<label>${f.zip} *<input name="zip" required autocomplete="postal-code" inputmode="numeric"></label>
<label>${f.type} *<select name="business_type" required>${f.types.map(x => `<option>${x}</option>`).join('')}</select></label>
</div>
<label>${f.ein}<input name="ein"></label>
<fieldset><legend>${f.pay}</legend><div class="pays">${['Card', 'ACH', 'Wire', 'Zelle'].map((p, i) => `<label class="chk"><input type="radio" name="payment" value="${p}"${i === 2 ? ' checked' : ''}>${p}</label>`).join('')}</div></fieldset>
<label>${f.notes}<textarea name="notes"></textarea></label>
<label class="chk"><input type="checkbox" name="business" value="yes" required>${f.biz}</label>
<div><button class="btn" type="submit">${f.send}</button></div>
</div>
</form>
<h2 id="terms">${t.terms}</h2>
<dl>${t.tl.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>
<h2>FAQ</h2>
<dl class="faq">${t.faq.map(([q, a]) => `<dt>${q}</dt><dd>${a}</dd>`).join('')}</dl>
<p class="api">${t.api}</p>
</main>
<footer><div class="w">Wylco LLC · Miami, FL, USA · <a href="mailto:info@wylcosolutions.com">info@wylcosolutions.com</a> · <a href="tel:+19548818870">+1 (954) 881-8870</a></div></footer>
<script>
(function(){var S=${JSON.stringify(t.sum)};var rows=[].slice.call(document.querySelectorAll('tr[data-slug]'));
var sk=new URLSearchParams(location.search).get('sku');if(sk){rows.forEach(function(r){if(r.dataset.slug===sk.toLowerCase()){var i=r.querySelector('input.q');if(+i.value<1)i.value=1;}});}
function upd(){var c=0,u=0,st=0,pr=0;rows.forEach(function(r){var q=Math.max(0,parseInt(r.querySelector('input.q').value,10)||0);r.classList.toggle('sel',q>0);c+=q;u+=q*(+r.dataset.units);var s=Math.min(q,+r.dataset.stock);st+=s;pr+=q-s;});
document.getElementById('sumMain').textContent=c?c+' '+S.cases+(u?' · '+u.toLocaleString()+' '+S.units:''):S.none;
document.getElementById('sumSub').textContent=c?[st?st+' '+S.stock:'',pr?pr+' '+S.pre:''].filter(Boolean).join(' · '):'';}
rows.forEach(function(r){r.querySelector('input.q').addEventListener('input',upd);});upd();})();
</script>
</body>
</html>
`;
}
module.exports = { render };
