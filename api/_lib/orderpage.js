const SITE = 'https://wylcosolutions.com';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const T = {
  en: { pre: '', title: 'Buy K11 Wholesale — HVAC-R Distributors & Supply Houses | Wylco, Miami', desc: 'Wholesale K11 TapaFugas, TapaFugas 2-in-1, Sella Plus and adapters by the case, with live stock. For HVAC-R distributors, supply houses and contractors. Minimum 1 case. Card, ACH, wire or Zelle. Ships from Miami.',
    nav: ['Products', 'SDS', 'Distributor program'], other: 'Español', otherHref: '/es/order', home: '/',
    eyebrow: 'Wholesale · Distributors', h1: ['Stock K11', 'for your counter.'], lead: 'Order by the case with live stock from Miami. Pay online now or get a Stripe invoice — whichever fits your purchasing.',
    facts: [['1 case', 'minimum per SKU'], ['Free shipping', 'orders $' + '{GN}+ · contiguous US'], ['Card · ACH · Wire · Zelle', 'payment'], ['Tax-exempt', 'with resale certificate']],
    sec1: 'Choose your cases', sec1s: 'Stock updates live. If you order more than we have, the rest is held as a pre-order.',
    perCase: 'units / case', inStock: n => `${n} case${n === 1 ? '' : 's'} in stock`, preOrder: 'Pre-order', sds: 'Safety Data Sheet',
    cart: { none: 'No cases selected', cases: 'cases', units: 'units', stock: 'from stock', pre: 'pre-order', go: 'Checkout' },
    sec2: 'Checkout', payH: 'Pay now online', payP: 'Card or ACH via Stripe. Stripe asks for your company, address and tax ID. Available when every case in your cart is in stock.', payB: 'Pay now', pickL: 'Pickup in Miami (no shipping)', payNo: 'Pay now needs every case in stock. Your cart has pre-order cases — use "Get an invoice" instead.', sum: { h: 'Order summary', cs: 'case', css: 'cases', per: '/ case', pre: 'pre-order', sub: 'Subtotal', tax: 'Sales tax', taxV: 'Calculated at checkout · exempt with resale certificate', ship: 'Shipping', free: 'Free', pick: 'Pickup in Miami · free', perC: 'case', away: 'away from free shipping', na: 'On invoice', none: 'Add cases above to see your total.', part: 'Some prices are confirmed on the invoice.' },
    invH: 'Get an invoice', invP: 'We email a Stripe invoice within 1 business day. Pay by card, ACH, wire or Zelle. Best for pre-orders, larger orders and tax-exempt resellers.', invB: 'Send order & get invoice',
    f: { company: 'Company', contact: 'Contact name', email: 'Business email', phone: 'Phone', address: 'Shipping address', city: 'City', state: 'State', zip: 'ZIP', type: 'Business type', types: ['HVAC-R dealer / supply house', 'Wholesaler / distributor', 'Contractor', 'Other business'], ein: 'EIN / resale certificate #', pay: 'Preferred payment', notes: 'Notes', biz: 'I am buying on behalf of a business.' },
    terms: 'Terms', tl: [['Buyers', 'Businesses only: HVAC-R distributors, supply houses, wholesalers and contractors in the US.'], ['Minimum', '1 full case per SKU.'], ['Pricing', 'Wholesale price per case, shown at checkout or on your invoice. USD; sales tax added where applicable.'], ['Tax-exempt', 'Resellers: include your resale certificate number and email a copy to be invoiced without sales tax.'], ['Delivery', 'Contiguous US from Miami, FL. Free shipping on orders of {G}+; below that, {C} per case. Free pickup in Miami. In stock: 2–5 business days after payment. Pre-order: when stock arrives.'], ['Documents', '<a href="/docs">Safety Data Sheets (PDF)</a> for every product.']],
    faq: [['Can I buy K11 online?', 'Yes. Businesses can pay online by card or ACH when every case in the cart is in stock, or send the order and pay a Stripe invoice by card, ACH, wire or Zelle.'], ['What is the minimum order?', 'One full case per SKU (48 to 400 units depending on the product).'], ['Do you sell to individuals?', 'No. K11 is sold to HVAC-R businesses only.'], ['What if I order more than is in stock?', 'Available cases are reserved for you and the rest is held as a pre-order that ships when stock arrives.']],
    paid: 'Payment received. Your confirmation is on its way by email. ACH payments ship once cleared (2–4 business days).', err: { stock: 'Some cases in your cart are no longer in stock or not available online. Send the order to get an invoice instead.', empty: 'Your cart is empty.', stripe: 'We could not open the payment page. Please send the order to get an invoice.', method: '' },
    api: 'For software and AI agents: live stock at <a href="/api/stock">/api/stock</a> · catalog and order API at <a href="/catalog.json">/catalog.json</a>.' },
  es: { pre: '/es', title: 'Comprar K11 mayorista — Distribuidores y casas de repuestos HVAC-R | Wylco, Miami', desc: 'K11 TapaFugas, TapaFugas 2-en-1, Sella Plus y adaptadores por caja, con stock en vivo. Para distribuidores HVAC-R, casas de repuestos y contratistas. Mínimo 1 caja. Tarjeta, ACH, transferencia o Zelle. Envío desde Miami.',
    nav: ['Productos', 'SDS', 'Programa distribuidores'], other: 'English', otherHref: '/order', home: '/es',
    eyebrow: 'Mayorista · Distribuidores', h1: ['K11 en tu', 'mostrador.'], lead: 'Pedí por caja con stock en vivo desde Miami. Pagá online ahora o recibí una factura de Stripe, como te quede mejor.',
    facts: [['1 caja', 'mínimo por SKU'], ['Envío gratis', 'desde USD ' + '{GN} · EE.UU. continental'], ['Tarjeta · ACH · Wire · Zelle', 'formas de pago'], ['Exento', 'con certificado de reventa']],
    sec1: 'Elegí tus cajas', sec1s: 'El stock se actualiza en vivo. Si pedís más de lo que hay, el resto queda en pre-pedido.',
    perCase: 'unidades / caja', inStock: n => `${n} caja${n === 1 ? '' : 's'} en stock`, preOrder: 'Pre-pedido', sds: 'Hoja de seguridad',
    cart: { none: 'Sin cajas elegidas', cases: 'cajas', units: 'unidades', stock: 'de stock', pre: 'pre-pedido', go: 'Finalizar' },
    sec2: 'Finalizar pedido', payH: 'Pagar ahora online', payP: 'Tarjeta o ACH con Stripe. Stripe te pide empresa, dirección y tax ID. Disponible cuando todas las cajas del carrito están en stock.', payB: 'Pagar ahora', pickL: 'Retiro en Miami (sin envío)', payNo: 'Pagar ahora requiere todas las cajas en stock. Tu carrito tiene cajas en pre-pedido: usá "Recibir factura".', sum: { h: 'Resumen del pedido', cs: 'caja', css: 'cajas', per: '/ caja', pre: 'pre-pedido', sub: 'Subtotal', tax: 'Sales tax', taxV: 'Se calcula en el pago · exento con certificado de reventa', ship: 'Envío', free: 'Gratis', pick: 'Retiro en Miami · sin cargo', perC: 'caja', away: 'para envío gratis', na: 'En factura', none: 'Agregá cajas arriba para ver el total.', part: 'Algunos precios se confirman en la factura.' },
    invH: 'Recibir factura', invP: 'Te mandamos una factura de Stripe en 1 día hábil. Pagás con tarjeta, ACH, transferencia o Zelle. Ideal para pre-pedidos, pedidos grandes y revendedores exentos.', invB: 'Enviar pedido y recibir factura',
    f: { company: 'Empresa', contact: 'Nombre de contacto', email: 'Email de la empresa', phone: 'Teléfono', address: 'Dirección de entrega', city: 'Ciudad', state: 'Estado', zip: 'ZIP', type: 'Tipo de empresa', types: ['Dealer HVAC-R / casa de repuestos', 'Mayorista / distribuidor', 'Contratista', 'Otra empresa'], ein: 'EIN / nº certificado de reventa', pay: 'Forma de pago preferida', notes: 'Notas', biz: 'Compro en nombre de una empresa.' },
    terms: 'Condiciones', tl: [['Compradores', 'Solo empresas: distribuidores HVAC-R, casas de repuestos, mayoristas y contratistas en EE.UU.'], ['Mínimo', '1 caja cerrada por SKU.'], ['Precio', 'Precio mayorista por caja, visible en el checkout o en tu factura. USD; se suma sales tax donde corresponda.'], ['Exento', 'Revendedores: incluí tu nº de certificado de reventa y mandanos copia para facturar sin sales tax.'], ['Entrega', 'EE.UU. continental desde Miami, FL. Envío gratis desde {G}; debajo, {C} por caja. Retiro en Miami sin cargo. En stock: 2–5 días hábiles después del pago. Pre-pedido: al llegar el stock.'], ['Documentos', '<a href="/es/docs">Hojas de seguridad (PDF)</a> de cada producto.']],
    faq: [['¿Se puede comprar K11 online?', 'Sí. Las empresas pagan online con tarjeta o ACH cuando todo el carrito está en stock, o mandan el pedido y pagan la factura de Stripe con tarjeta, ACH, transferencia o Zelle.'], ['¿Cuál es el pedido mínimo?', 'Una caja cerrada por SKU (de 48 a 400 unidades según el producto).'], ['¿Venden a particulares?', 'No. K11 se vende solo a empresas HVAC-R.'], ['¿Qué pasa si pido más de lo que hay?', 'Las cajas disponibles quedan reservadas y el resto queda en pre-pedido, que sale cuando llega el stock.']],
    paid: 'Pago recibido. Te llega la confirmación por mail. Si pagaste con ACH, despachamos cuando se acredite (2–4 días hábiles).', err: { stock: 'Algunas cajas del carrito ya no están en stock o no se venden online. Enviá el pedido para recibir factura.', empty: 'El carrito está vacío.', stripe: 'No pudimos abrir la página de pago. Enviá el pedido para recibir factura.', method: '' },
    api: 'Para software y agentes de IA: stock en vivo en <a href="/api/stock">/api/stock</a> · catálogo y API de pedidos en <a href="/catalog.json">/catalog.json</a>.' }
};

const DISP = {
  'tfk11-10': { box: '/assets/products/tfk11-box.png', acc: 'linear-gradient(90deg,#0B5FA8,#1FA3E0)', title: 'TapaFugas K11', line: { en: '10 ml · up to 36,000 BTU/h', es: '10 ml · hasta 36.000 BTU/h' } },
  'tfk11-co': { box: '/assets/products/tfk11-box.png', acc: 'linear-gradient(90deg,#0B5FA8,#1FA3E0)', title: 'TapaFugas K11', line: { en: 'Syringe + adapter', es: 'Jeringa + adaptador' } },
  'k11-2in1-11': { box: '/assets/products/tfk11-2in1-box.png', acc: 'linear-gradient(90deg,#1E9BD7,#39B54A)', title: 'TapaFugas K11 2in1', line: { en: 'Seal + UV detect', es: 'Sella + detecta UV' } },
  'rfk11': { box: '/assets/products/rfk11-box.png', acc: 'linear-gradient(90deg,#1F8F3A,#56C228)', title: 'Revela Fugas K11', line: { en: 'UV leak finder', es: 'Detector UV de fugas' } },
  'spk11-b35': { box: '/assets/products/sella-plus-en.png', bottle: true, acc: 'linear-gradient(90deg,#1E5BB8,#2BA673)', title: 'Sella Plus K11', line: { en: '35 ml · HVAC-R sealant', es: '35 ml · sellador HVAC-R' } }
};
function display(p, L) {
  const d = DISP[p.slug];
  if (!d) return `<img class="solo" src="${p.img}" alt="${esc(p.name)}" loading="lazy">`;
  const n = d.bottle ? 4 : 5;
  const items = Array.from({ length: n }, (_, i) => `<img src="${d.box}" alt="" loading="lazy" style="--i:${i}">`).join('');
  return `<div class="dsp${d.bottle ? ' bt' : ''}" style="--acc:${d.acc}" aria-label="${esc(p.name)} counter display">
<div class="dsp-hd"><b>${esc(d.title)}</b><span>${esc(d.line[L])}</span></div>
<div class="dsp-back">${items}</div><div class="dsp-row">${items}</div>
<div class="dsp-front"><i></i></div><div class="dsp-side"></div></div>`;
}

function render(L, products, sel, paid, opts = {}) {
  const t0 = T[L], url = SITE + t0.pre + '/order', pre = opts.qty || {}, PR = opts.prices || {}, EV = opts.envio || { caja: 35, gratis: 2000 };
  const fm = n => '$' + Number(n).toLocaleString('en-US'), sub = s => typeof s === 'string' ? s.replace(/\{G\}/g, fm(EV.gratis)).replace(/\{GN\}/g, Number(EV.gratis).toLocaleString('en-US')).replace(/\{C\}/g, fm(EV.caja)) : s;
  const t = { ...t0, tl: t0.tl.map(([a, b]) => [a, sub(b)]), facts: t0.facts.map(([a, b]) => [a, sub(b)]) }, f = t.f;
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': SITE + '/#organization', name: 'Wylco LLC', alternateName: 'K11 America by Wylco', url: SITE + '/', email: 'info@wylcosolutions.com', telephone: '+1-954-881-8870', address: { '@type': 'PostalAddress', addressLocality: 'Miami', addressRegion: 'FL', addressCountry: 'US' } },
    { '@type': 'WebPage', '@id': url, url, name: t.title, inLanguage: L === 'en' ? 'en-US' : 'es', potentialAction: { '@type': 'OrderAction', target: { '@type': 'EntryPoint', urlTemplate: SITE + '/api/pedido', httpMethod: 'POST', encodingType: 'application/x-www-form-urlencoded', contentType: 'application/x-www-form-urlencoded' } } },
    ...products.map(p => ({ '@type': 'Product', name: p.name, sku: p.sku, description: p.desc, image: SITE + p.img, brand: { '@type': 'Brand', name: 'K11' }, ...(p.sds ? { subjectOf: { '@type': 'DigitalDocument', name: p.name + ' SDS', url: SITE + p.sds } } : {}),
      offers: { '@type': 'Offer', url: p.buy_url || url + '#cart', availability: 'https://schema.org/' + p.status, ...(p.cases_available ? { inventoryLevel: { '@type': 'QuantitativeValue', value: p.cases_available, unitText: 'cases' } } : {}), priceCurrency: 'USD', businessFunction: 'http://purl.org/goodrelations/v1#Sell', eligibleCustomerType: 'http://purl.org/goodrelations/v1#Business', eligibleRegion: { '@type': 'Country', name: 'US' }, ...(p.units ? { eligibleQuantity: { '@type': 'QuantitativeValue', minValue: 1, unitText: 'case of ' + p.units + ' units' } } : {}), seller: { '@id': SITE + '/#organization' } } })),
    { '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] };
  const cards = products.map(p => {
    const v = +pre[p.slug] || (sel === p.slug ? 1 : 0), st = p.cases_available > 0;
    return `<article class="pc" data-slug="${p.slug}" data-units="${p.units || 0}" data-stock="${p.cases_available}" data-online="${p.online ? 1 : 0}" data-price="${PR[p.slug] || 0}" data-name="${esc(p.name)}" data-sku="${esc(p.sku)}">
<div class="pimg">${display(p, L)}<span class="av ${st ? 'in' : 'pre'}">${st ? t.inStock(p.cases_available) : t.preOrder}</span>${p.units ? `<span class="qty"><b>× ${p.units}</b>${L === 'es' ? 'por caja' : 'per case'}</span>` : ''}</div>
<div class="pb"><div class="sku">${esc(p.sku)}</div><h3>${esc(p.name)}</h3><p>${esc(L === 'es' ? p.desc_es : p.desc)}</p>
<div class="meta">${p.units ? `<span><b>${p.units}</b> ${t.perCase}</span>` : '<span></span>'}${p.sds ? `<a href="${p.sds}" target="_blank" rel="noopener">${t.sds}</a>` : ''}</div>
<div class="step"><button type="button" class="mn" aria-label="−">−</button><input class="q" type="number" name="qty_${p.slug}" min="0" max="999" step="1" value="${v}" aria-label="${esc(p.sku)} cases"><button type="button" class="pl" aria-label="+">+</button></div></div></article>`;
  }).join('');
  const notice = paid ? `<div class="note ok" role="status">${t.paid}</div>` : opts.err && t.err[opts.err] ? `<div class="note bad" role="alert">${t.err[opts.err]}</div>` : '';
  const F = (n, l, req, ty, ac) => `<label>${l}${req ? ' *' : ''}<input name="${n}" type="${ty || 'text'}"${req ? ' required' : ''}${ac ? ` autocomplete="${ac}"` : ''}></label>`;
  return `<!DOCTYPE html>
<html lang="${L}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.title}</title>
<meta name="description" content="${esc(t.desc)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
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
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
<script src="/js/analytics.js"></script>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<style>
:root{--o:#D4541A;--od:#B84417;--bg:#0F1117;--d2:#161A23;--d3:#1E2330;--warm:#F5F0E8;--w2:#EDE6DA;--w3:#E2D8CB;--ink:#0F1117;--mut:#6B645A;--l:rgba(255,255,255,.12);--lm:rgba(255,255,255,.68);--g:#4CC38A;--fd:"Barlow Condensed",sans-serif;--fb:"DM Sans",system-ui,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--warm);color:var(--ink);font:16px/1.6 var(--fb);-webkit-font-smoothing:antialiased}
a{color:var(--od)}a:hover{color:var(--ink)}.dk a{color:#F08A5D}.dk a:hover{color:#fff}
.w{max-width:1180px;margin:0 auto;padding:0 max(20px,4vw)}
header{background:var(--bg);color:#fff}header .w{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-top:16px;padding-bottom:16px}
.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font:800 1.15rem var(--fd);letter-spacing:.14em;text-transform:uppercase}.brand img{width:34px;height:34px}.brand:hover{color:#fff}
header nav{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:14px}header.dk nav a{color:var(--lm);text-decoration:none}header.dk nav a:hover{color:#fff}
.hero{background:var(--bg);color:#fff;padding:40px 0 56px;position:relative;overflow:hidden}
.hero::after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 50% 70% at 85% 30%,rgba(212,84,26,.16),transparent 70%);pointer-events:none}
.hero .w{position:relative;z-index:1}
.eye{font:700 13px var(--fd);letter-spacing:.16em;text-transform:uppercase;color:var(--o);margin-bottom:18px}
h1{font:900 clamp(3.2rem,8vw,6.5rem)/.88 var(--fd);text-transform:uppercase;letter-spacing:.01em;margin:0 0 22px}h1 em{font-style:normal;color:var(--o)}
.lead{max-width:600px;color:var(--lm);font-size:1.1rem;margin:0 0 36px;text-wrap:pretty}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1px;background:var(--l);border:1px solid var(--l);border-radius:14px;overflow:hidden;max-width:920px}
.facts div{background:var(--d2);padding:18px 20px}.facts b{display:block;font:800 1.5rem/1.1 var(--fd);text-transform:uppercase;color:#fff}.facts span{font-size:13px;color:var(--lm)}
.note{margin:28px 0 0;padding:14px 18px;border-radius:10px;font-weight:500}.note.ok{background:rgba(76,195,138,.15);border:1px solid rgba(76,195,138,.45);color:#fff}.note.bad{background:rgba(212,84,26,.15);border:1px solid rgba(212,84,26,.5);color:#fff}
section{padding:64px 0}
h2{font:800 clamp(2rem,4vw,3rem)/1 var(--fd);text-transform:uppercase;margin:0 0 8px}.ss{color:var(--mut);margin:0 0 28px;max-width:640px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr));gap:16px;align-items:stretch}
.pc{background:#fff;border:1px solid var(--w3);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;transition:border-color .2s,box-shadow .2s}
.pc.sel{border-color:var(--o);box-shadow:0 0 0 3px rgba(212,84,26,.14)}
.pimg{background:radial-gradient(ellipse 80% 60% at 50% 100%,#e9e2d6,#f7f3ec 70%);height:280px;position:relative;overflow:hidden;border-bottom:1px solid var(--w2)}
.pimg img.solo{position:absolute;inset:28px 16px 16px;width:calc(100% - 32px);height:calc(100% - 44px);object-fit:contain;display:block}
.qty{position:absolute;z-index:3;top:12px;right:12px;background:var(--bg);color:#fff;border-radius:10px;padding:5px 10px 6px;text-align:center;font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;line-height:1.1}.qty b{display:block;font:900 1.35rem/1 var(--fd);letter-spacing:0;color:#fff}
.dsp{position:absolute;left:50%;bottom:18px;width:78%;max-width:260px;height:210px;transform:translateX(-50%);filter:drop-shadow(0 14px 18px rgba(15,17,23,.18))}
.dsp-hd{position:absolute;left:6%;right:6%;top:0;height:46%;background:#fff;border-radius:10px 10px 0 0;padding:12px 12px 0;overflow:hidden;box-shadow:inset 0 -1px 0 rgba(0,0,0,.06)}
.dsp-hd::after{content:"";position:absolute;left:0;right:0;bottom:0;height:22%;background:var(--acc)}
.dsp-hd b{display:block;font:900 1.05rem/1 var(--fd);text-transform:uppercase;letter-spacing:.01em;color:#0B3F7A}.dsp.bt .dsp-hd b{color:#1E4FA0}
.dsp-hd span{display:block;font-size:10px;font-weight:600;color:#3d6b4f;margin-top:3px}
.dsp-back,.dsp-row{position:absolute;left:7%;right:12%;display:flex;justify-content:center;gap:2%}
.dsp-back{bottom:26%;height:52%;filter:brightness(.82);transform:translateX(5%)}.dsp-row{bottom:12%;height:56%}
.dsp-back img,.dsp-row img{height:100%;width:auto;object-fit:contain;flex:0 0 auto}
.dsp.bt .dsp-back{height:40%;bottom:30%}.dsp.bt .dsp-row{height:44%;bottom:12%;gap:3%}
.dsp-front{position:absolute;left:0;right:8%;bottom:0;height:30%;background:#fff;border-radius:0 0 4px 4px;overflow:hidden;box-shadow:0 -1px 0 rgba(0,0,0,.05)}
.dsp-front i{position:absolute;left:0;right:0;bottom:0;height:28%;background:var(--acc)}
.dsp-side{position:absolute;right:0;bottom:0;width:10%;height:62%;background:var(--acc);clip-path:polygon(0 30%,100% 0,100% 100%,0 100%);opacity:.92}
.av{position:absolute;z-index:1;top:12px;left:12px;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px}.av.in{background:#DCEFE2;color:#1D7A3A}.av.pre{background:#fff;color:var(--mut);border:1px solid var(--w3)}
.pb{padding:18px 20px 20px;display:flex;flex-direction:column;gap:6px;flex:1}
.sku{font:600 12px ui-monospace,Menlo,monospace;color:var(--mut)}h3{font:800 1.55rem/1 var(--fd);text-transform:uppercase;margin:0}.pb p{margin:0;color:var(--mut);font-size:14px;min-height:2.6em}
.meta{display:flex;justify-content:space-between;gap:8px;font-size:13px;color:var(--mut);margin-top:auto;padding-top:10px;min-height:2em}
.step{display:grid;grid-template-columns:48px minmax(0,1fr) 48px;border:1px solid var(--w3);border-radius:10px;overflow:hidden;margin-top:10px}
.step button{background:var(--w2);border:0;font:600 22px var(--fb);color:var(--ink);cursor:pointer;min-height:48px}.step button:hover{background:var(--w3)}
.step input{border:0;text-align:center;font:800 1.5rem var(--fd);min-height:48px;width:100%;-moz-appearance:textfield;background:#fff;color:var(--ink)}.step input::-webkit-inner-spin-button{-webkit-appearance:none}.step input:focus{outline:2px solid var(--o);outline-offset:-2px}
.bar{position:sticky;bottom:0;z-index:10;background:var(--bg);color:#fff;border-top:1px solid var(--l)}
.bar .w{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-top:14px;padding-bottom:14px}
.bar b{font:800 1.5rem var(--fd);text-transform:uppercase}.bar small{display:block;color:var(--lm);font-size:13px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 24px;border-radius:10px;background:var(--o);color:#fff;text-decoration:none;font:700 15px var(--fb);border:0;cursor:pointer}.btn:hover{background:var(--od);color:#fff}
.btn.ghost{background:transparent;color:var(--ink);border:1.5px solid var(--ink)}.btn.ghost:hover{background:var(--ink);color:#fff}
.btn[disabled]{opacity:.4;cursor:not-allowed}
.co{background:var(--w2)}.sum{background:#fff;border:1px solid var(--w3);border-radius:16px;padding:22px 26px;margin:20px 0 16px}.sum h3{font-size:1.5rem;margin:0 0 12px}.sum .r{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 16px;padding:10px 0;border-top:1px solid var(--w2);font-size:15px}.sum .r:first-of-type{border-top:0}.sum .r small{grid-column:1;color:var(--mut);font-size:13px}.sum .r b{font-weight:600}.sum .r .v{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}.sum .tot{border-top:2px solid var(--ink);margin-top:4px;font:800 1.5rem var(--fd);text-transform:uppercase}.sum .x{color:var(--mut);font-size:14px}.sum .warn{margin:12px 0 0;padding:10px 14px;border-radius:8px;background:rgba(212,84,26,.1);color:var(--od);font-size:14px;font-weight:500}.sum .m{color:var(--mut);margin:0}
.opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;align-items:start}
.opt{background:#fff;border:1px solid var(--w3);border-radius:16px;padding:26px;display:grid;gap:16px}
.opt h3{font-size:1.8rem}.opt>p{margin:0;color:var(--mut);font-size:15px}
.opt.pay{background:var(--bg);color:#fff;border-color:var(--bg)}.opt.pay>p{color:var(--lm)}.opt.pay .why{font-size:13px;color:#F08A5D;min-height:1em;margin:0}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
label{display:grid;gap:5px;font-size:13px;font-weight:600;color:var(--mut)}
input,select,textarea{font:inherit;font-size:15px;color:var(--ink);background:#fff;border:1px solid var(--w3);border-radius:8px;padding:10px 12px;min-height:46px;width:100%}input:focus,select:focus,textarea:focus{outline:2px solid var(--o);outline-offset:0;border-color:transparent}
textarea{min-height:80px}.pays{display:flex;flex-wrap:wrap;gap:8px}.pays label{display:flex;align-items:center;gap:8px;border:1px solid var(--w3);border-radius:8px;padding:0 14px;min-height:44px;color:var(--ink);font-weight:500;cursor:pointer}.pays input{width:auto;min-height:0}
.chk{display:flex;gap:10px;align-items:center;color:var(--ink);font-weight:500;font-size:14px}.chk input{width:20px;min-height:20px}
.hp{position:absolute;left:-9999px}
.info{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px}
dl{margin:0;display:grid;grid-template-columns:minmax(100px,140px) minmax(0,1fr);gap:12px 20px}dt{font-weight:700}dd{margin:0;color:var(--mut)}
.faq{display:block}.faq dt{margin-top:16px}.faq dt:first-child{margin-top:0}.faq dd{margin-top:4px}
.api{color:var(--mut);font-size:14px;margin:40px 0 0}
@media(max-width:640px){
header .w{padding-top:12px;padding-bottom:4px;gap:10px}header nav{gap:4px 16px;font-size:13px}.brand{font-size:1rem}.brand img{width:28px;height:28px}
.hero{padding:16px 0 32px}.eye{margin-bottom:10px;font-size:11px}h1{font-size:clamp(2.6rem,13vw,3.4rem);margin-bottom:14px}.lead{font-size:1rem;margin-bottom:22px}
.facts{grid-template-columns:1fr 1fr;border-radius:12px}.facts div{padding:12px 14px}.facts b{font-size:1.1rem}.facts span{font-size:12px}
section{padding:40px 0}h2{font-size:2rem}.ss{margin-bottom:20px;font-size:15px}
.grid{grid-template-columns:1fr 1fr;gap:10px}.pimg{height:200px}.dsp{height:150px;width:88%;bottom:12px}.dsp-hd{padding:8px 8px 0}.dsp-hd b{font-size:.8rem}.dsp-hd span{font-size:8px}
.qty{top:8px;right:8px;padding:3px 7px 4px;font-size:8px}.qty b{font-size:1rem}.av{top:8px;left:8px;font-size:10px;padding:3px 8px}
.pb{padding:12px 12px 14px}h3{font-size:1.15rem}.pb p{font-size:12px}.meta{font-size:11px;flex-direction:column;gap:2px}
.step{grid-template-columns:40px minmax(0,1fr) 40px}.step button,.step input{min-height:44px}.step input{font-size:1.25rem}
.bar .w{padding-top:10px;padding-bottom:10px}.bar b{font-size:1.15rem}.bar .btn{min-height:44px;padding:0 18px}
.opt{padding:18px}.opt h3{font-size:1.5rem}.info{gap:28px}dl{grid-template-columns:1fr;gap:2px 0}dd{margin-bottom:10px}
}
footer{background:var(--bg);color:var(--lm);font-size:14px;padding:28px 0}
</style>
</head>
<body>
<header class="dk"><div class="w"><a class="brand" href="${t.home}"><img src="/assets/logo-wylco.png" alt="">K11 America</a><nav><a href="${t.pre}/products">${t.nav[0]}</a><a href="${t.pre}/docs">${t.nav[1]}</a><a href="${t.pre}/distributors">${t.nav[2]}</a><a href="${t.otherHref}">${t.other}</a></nav></div></header>
<div class="hero dk"><div class="w"><div class="eye">${t.eyebrow}</div><h1>${t.h1[0]}<br><em>${t.h1[1]}</em></h1><p class="lead">${t.lead}</p>
<div class="facts">${t.facts.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>${notice}</div></div>
<form id="cart" method="post" action="/api/pedido">
<input type="hidden" name="lang" value="${L}">
<label class="hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
<section><div class="w"><h2 id="products">${t.sec1}</h2><p class="ss">${t.sec1s}</p><div class="grid">${cards}</div></div></section>
<div class="bar dk" aria-live="polite"><div class="w"><div><b id="sumMain">${t.cart.none}</b><small id="sumSub"></small></div><a class="btn" href="#checkout">${t.cart.go}</a></div></div>
<section class="co" id="checkout"><div class="w"><h2>${t.sec2}</h2><div class="sum" id="sum" aria-live="polite"></div>
<div class="opts">
<div class="opt pay dk"><h3>${t.payH}</h3><p>${t.payP}</p><label style="color:var(--lm)">${f.email}<input type="email" name="email_pay" autocomplete="email"></label>
<div><button class="btn" id="payBtn" type="submit" formaction="/api/checkout" formnovalidate>${t.payB} →</button></div><p class="why" id="payWhy"></p></div>
<div class="opt"><h3>${t.invH}</h3><p>${t.invP}</p>
<div class="fg">${F('company', f.company, 1, 0, 'organization')}${F('contact', f.contact, 1, 0, 'name')}${F('email', f.email, 1, 'email', 'email')}${F('phone', f.phone, 0, 'tel', 'tel')}</div>
<div class="fg">${F('address', f.address, 1, 0, 'street-address')}${F('city', f.city, 1, 0, 'address-level2')}${F('state', f.state, 1, 0, 'address-level1')}${F('zip', f.zip, 1, 0, 'postal-code')}</div>
<div class="fg"><label>${f.type} *<select name="business_type" required>${f.types.map(x => `<option>${x}</option>`).join('')}</select></label>${F('ein', f.ein)}</div>
<div><label style="margin-bottom:6px">${f.pay}</label><div class="pays">${['Wire', 'ACH', 'Card', 'Zelle'].map((p, i) => `<label><input type="radio" name="payment" value="${p}"${i === 0 ? ' checked' : ''}>${p}</label>`).join('')}</div></div>
<label>${f.notes}<textarea name="notes"></textarea></label>
<label class="chk"><input type="checkbox" name="retiro" value="1" id="pick">${t.pickL}</label>
<label class="chk"><input type="checkbox" name="business" value="yes" required>${f.biz}</label>
<div><button class="btn ghost" type="submit">${t.invB}</button></div></div>
</div></div></section>
</form>
<section><div class="w info"><div><h2 style="font-size:2rem;margin-bottom:20px">${t.terms}</h2><dl>${t.tl.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl></div>
<div><h2 style="font-size:2rem;margin-bottom:20px">FAQ</h2><dl class="faq">${t.faq.map(([q, a]) => `<dt>${q}</dt><dd>${a}</dd>`).join('')}</dl></div></div>
<div class="w"><p class="api">${t.api}</p></div></section>
<footer class="dk"><div class="w">Wylco LLC · Miami, FL, USA · <a href="mailto:info@wylcosolutions.com">info@wylcosolutions.com</a> · <a href="tel:+19548818870">+1 (954) 881-8870</a></div></footer>
<script>
(function(){var S=${JSON.stringify(t.cart)},NO=${JSON.stringify(t.payNo)},M=${JSON.stringify(t.sum)},LOC=${JSON.stringify(L === 'es' ? 'es-US' : 'en-US')},EV=${JSON.stringify(EV)};var cards=[].slice.call(document.querySelectorAll('.pc'));
var qs=new URLSearchParams(location.search),sk=(qs.get('sku')||'').toLowerCase();
cards.forEach(function(c){var i=c.querySelector('input.q');var v=qs.get('qty_'+c.dataset.slug);if(v)i.value=Math.max(0,parseInt(v,10)||0);else if(sk&&c.dataset.slug===sk&&+i.value<1)i.value=1;
c.querySelector('.mn').onclick=function(){i.value=Math.max(0,(parseInt(i.value,10)||0)-1);upd();};c.querySelector('.pl').onclick=function(){i.value=(parseInt(i.value,10)||0)+1;upd();};i.addEventListener('input',upd);});
function upd(){var c=0,u=0,st=0,pr=0,ok=true;cards.forEach(function(k){var q=Math.max(0,parseInt(k.querySelector('input.q').value,10)||0);k.classList.toggle('sel',q>0);if(!q)return;c+=q;u+=q*(+k.dataset.units);var s=Math.min(q,+k.dataset.stock);st+=s;pr+=q-s;if(q>+k.dataset.stock||k.dataset.online!=='1')ok=false;});
document.getElementById('sumMain').textContent=c?c+' '+S.cases+(u?' · '+u.toLocaleString()+' '+S.units:''):S.none;
document.getElementById('sumSub').textContent=c?[st?st+' '+S.stock:'',pr?pr+' '+S.pre:''].filter(Boolean).join(' · '):'';
var b=document.getElementById('payBtn');b.disabled=!c||!ok;document.getElementById('payWhy').textContent=c&&!ok?NO:'';sum(ok);}
function money(c){return (c/100).toLocaleString(LOC,{style:'currency',currency:'USD'});}
function esc(x){return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function sum(ok){var h='<h3>'+M.h+'</h3>',tot=0,miss=false,n=0;cards.forEach(function(k){var q=Math.max(0,parseInt(k.querySelector('input.q').value,10)||0);if(!q)return;n++;var p=+k.dataset.price,pr=Math.max(0,q-(+k.dataset.stock));if(!p)miss=true;tot+=p*q;
h+='<div class="r"><b>'+q+' × '+esc(k.dataset.name)+'</b><span class="v">'+(p?money(p*q):M.na)+'</span><small>'+esc(k.dataset.sku)+(p?' · '+money(p)+' '+M.per:'')+(pr?' · '+pr+' '+M.pre:'')+'</small></div>';});
if(!n){document.getElementById('sum').innerHTML=h+'<p class="m">'+M.none+'</p>';return;}
var nc=0;cards.forEach(function(k){nc+=Math.max(0,parseInt(k.querySelector('input.q').value,10)||0);});var pk=document.getElementById('pick'),pick=pk&&pk.checked,fr=pick||tot/100>=EV.gratis?0:Math.round(nc*EV.caja*100);
h+='<div class="r"><span>'+M.ship+'</span><span class="v">'+(pick?M.pick:fr?money(fr):M.free)+'</span>'+(!pick&&fr&&tot?'<small>'+nc+' × '+money(EV.caja*100)+' / '+M.perC+' · '+money(EV.gratis*100-tot)+' '+M.away+'</small>':'')+'</div><div class="r x"><span>'+M.tax+'</span><span class="v">'+M.taxV+'</span></div>';
h+='<div class="r tot"><span>Total</span><span class="v">'+(tot?money(tot+fr):M.na)+'</span></div>';
if(miss&&tot)h+='<p class="m" style="font-size:13px">'+M.part+'</p>';if(!ok)h+='<p class="warn">'+NO+'</p>';document.getElementById('sum').innerHTML=h;}
var pk=document.getElementById('pick');if(pk)pk.addEventListener('change',upd);upd();})();
</script>
</body>
</html>
`;
}
module.exports = { render };
