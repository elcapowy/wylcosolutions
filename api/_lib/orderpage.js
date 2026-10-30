const SITE = 'https://wylcosolutions.com';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const T = {
  en: { pre: '', title: 'Buy K11 Wholesale — HVAC-R Distributors & Supply Houses | Wylco, Miami', desc: 'Wholesale K11 TapaFugas, TapaFugas 2-in-1, Sella Plus and adapters by the case, with live stock. For HVAC-R distributors, supply houses and contractors. Minimum 1 case. Card, ACH, wire or Zelle. Ships from Miami.',
    nav: ['Products', 'SDS', 'Distributor program'], other: 'Español', otherHref: '/es/order', home: '/',
    eyebrow: 'Wholesale · Distributors', h1: ['Stock K11', 'for your counter.'], lead: 'Order by the case with live stock from Miami. Pay online now or get a Stripe invoice — whichever fits your purchasing.',
    facts: [['1 case', 'minimum per SKU'], ['2–5 days', 'ships from Miami'], ['Card · ACH · Wire · Zelle', 'payment'], ['Tax-exempt', 'with resale certificate']],
    sec1: 'Choose your cases', sec1s: 'Stock updates live. If you order more than we have, the rest is held as a pre-order.',
    perCase: 'units / case', inStock: n => `${n} case${n === 1 ? '' : 's'} in stock`, preOrder: 'Pre-order', sds: 'Safety Data Sheet',
    cart: { none: 'No cases selected', cases: 'cases', units: 'units', stock: 'from stock', pre: 'pre-order', go: 'Checkout' },
    sec2: 'Checkout', payH: 'Pay now online', payP: 'Card or ACH via Stripe. Stripe asks for your company, address and tax ID. Available when every case in your cart is in stock.', payB: 'Pay now', payNo: 'Not available for this cart — use invoice.',
    invH: 'Get an invoice', invP: 'We email a Stripe invoice within 1 business day. Pay by card, ACH, wire or Zelle. Best for pre-orders, larger orders and tax-exempt resellers.', invB: 'Send order & get invoice',
    f: { company: 'Company', contact: 'Contact name', email: 'Business email', phone: 'Phone', address: 'Shipping address', city: 'City', state: 'State', zip: 'ZIP', type: 'Business type', types: ['HVAC-R dealer / supply house', 'Wholesaler / distributor', 'Contractor', 'Other business'], ein: 'EIN / resale certificate #', pay: 'Preferred payment', notes: 'Notes', biz: 'I am buying on behalf of a business.' },
    terms: 'Terms', tl: [['Buyers', 'Businesses only: HVAC-R distributors, supply houses, wholesalers and contractors in the US.'], ['Minimum', '1 full case per SKU.'], ['Pricing', 'Wholesale price per case, shown at checkout or on your invoice. USD; sales tax added where applicable.'], ['Tax-exempt', 'Resellers: include your resale certificate number and email a copy to be invoiced without sales tax.'], ['Delivery', 'From Miami, FL. In stock: 2–5 business days after payment. Pre-order: when stock arrives. Freight quoted separately.'], ['Documents', '<a href="/docs">Safety Data Sheets (PDF)</a> for every product.']],
    faq: [['Can I buy K11 online?', 'Yes. Businesses can pay online by card or ACH when every case in the cart is in stock, or send the order and pay a Stripe invoice by card, ACH, wire or Zelle.'], ['What is the minimum order?', 'One full case per SKU (48 to 400 units depending on the product).'], ['Do you sell to individuals?', 'No. K11 is sold to HVAC-R businesses only.'], ['What if I order more than is in stock?', 'Available cases are reserved for you and the rest is held as a pre-order that ships when stock arrives.']],
    paid: 'Payment received. Your confirmation is on its way by email. ACH payments ship once cleared (2–4 business days).', err: { stock: 'Some cases in your cart are no longer in stock or not available online. Send the order to get an invoice instead.', empty: 'Your cart is empty.', stripe: 'We could not open the payment page. Please send the order to get an invoice.', method: '' },
    api: 'For software and AI agents: live stock at <a href="/api/stock">/api/stock</a> · catalog and order API at <a href="/catalog.json">/catalog.json</a>.' },
  es: { pre: '/es', title: 'Comprar K11 mayorista — Distribuidores y casas de repuestos HVAC-R | Wylco, Miami', desc: 'K11 TapaFugas, TapaFugas 2-en-1, Sella Plus y adaptadores por caja, con stock en vivo. Para distribuidores HVAC-R, casas de repuestos y contratistas. Mínimo 1 caja. Tarjeta, ACH, transferencia o Zelle. Envío desde Miami.',
    nav: ['Productos', 'SDS', 'Programa distribuidores'], other: 'English', otherHref: '/order', home: '/es',
    eyebrow: 'Mayorista · Distribuidores', h1: ['K11 en tu', 'mostrador.'], lead: 'Pedí por caja con stock en vivo desde Miami. Pagá online ahora o recibí una factura de Stripe, como te quede mejor.',
    facts: [['1 caja', 'mínimo por SKU'], ['2–5 días', 'despacho desde Miami'], ['Tarjeta · ACH · Wire · Zelle', 'formas de pago'], ['Exento', 'con certificado de reventa']],
    sec1: 'Elegí tus cajas', sec1s: 'El stock se actualiza en vivo. Si pedís más de lo que hay, el resto queda en pre-pedido.',
    perCase: 'unidades / caja', inStock: n => `${n} caja${n === 1 ? '' : 's'} en stock`, preOrder: 'Pre-pedido', sds: 'Hoja de seguridad',
    cart: { none: 'Sin cajas elegidas', cases: 'cajas', units: 'unidades', stock: 'de stock', pre: 'pre-pedido', go: 'Finalizar' },
    sec2: 'Finalizar pedido', payH: 'Pagar ahora online', payP: 'Tarjeta o ACH con Stripe. Stripe te pide empresa, dirección y tax ID. Disponible cuando todas las cajas del carrito están en stock.', payB: 'Pagar ahora', payNo: 'No disponible para este carrito: usá factura.',
    invH: 'Recibir factura', invP: 'Te mandamos una factura de Stripe en 1 día hábil. Pagás con tarjeta, ACH, transferencia o Zelle. Ideal para pre-pedidos, pedidos grandes y revendedores exentos.', invB: 'Enviar pedido y recibir factura',
    f: { company: 'Empresa', contact: 'Nombre de contacto', email: 'Email de la empresa', phone: 'Teléfono', address: 'Dirección de entrega', city: 'Ciudad', state: 'Estado', zip: 'ZIP', type: 'Tipo de empresa', types: ['Dealer HVAC-R / casa de repuestos', 'Mayorista / distribuidor', 'Contratista', 'Otra empresa'], ein: 'EIN / nº certificado de reventa', pay: 'Forma de pago preferida', notes: 'Notas', biz: 'Compro en nombre de una empresa.' },
    terms: 'Condiciones', tl: [['Compradores', 'Solo empresas: distribuidores HVAC-R, casas de repuestos, mayoristas y contratistas en EE.UU.'], ['Mínimo', '1 caja cerrada por SKU.'], ['Precio', 'Precio mayorista por caja, visible en el checkout o en tu factura. USD; se suma sales tax donde corresponda.'], ['Exento', 'Revendedores: incluí tu nº de certificado de reventa y mandanos copia para facturar sin sales tax.'], ['Entrega', 'Desde Miami, FL. En stock: 2–5 días hábiles después del pago. Pre-pedido: al llegar el stock. Flete aparte.'], ['Documentos', '<a href="/es/docs">Hojas de seguridad (PDF)</a> de cada producto.']],
    faq: [['¿Se puede comprar K11 online?', 'Sí. Las empresas pagan online con tarjeta o ACH cuando todo el carrito está en stock, o mandan el pedido y pagan la factura de Stripe con tarjeta, ACH, transferencia o Zelle.'], ['¿Cuál es el pedido mínimo?', 'Una caja cerrada por SKU (de 48 a 400 unidades según el producto).'], ['¿Venden a particulares?', 'No. K11 se vende solo a empresas HVAC-R.'], ['¿Qué pasa si pido más de lo que hay?', 'Las cajas disponibles quedan reservadas y el resto queda en pre-pedido, que sale cuando llega el stock.']],
    paid: 'Pago recibido. Te llega la confirmación por mail. Si pagaste con ACH, despachamos cuando se acredite (2–4 días hábiles).', err: { stock: 'Algunas cajas del carrito ya no están en stock o no se venden online. Enviá el pedido para recibir factura.', empty: 'El carrito está vacío.', stripe: 'No pudimos abrir la página de pago. Enviá el pedido para recibir factura.', method: '' },
    api: 'Para software y agentes de IA: stock en vivo en <a href="/api/stock">/api/stock</a> · catálogo y API de pedidos en <a href="/catalog.json">/catalog.json</a>.' }
};

function render(L, products, sel, paid, opts = {}) {
  const t = T[L], url = SITE + t.pre + '/order', f = t.f, pre = opts.qty || {};
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': SITE + '/#organization', name: 'Wylco LLC', alternateName: 'K11 America by Wylco', url: SITE + '/', email: 'info@wylcosolutions.com', telephone: '+1-954-881-8870', address: { '@type': 'PostalAddress', addressLocality: 'Miami', addressRegion: 'FL', addressCountry: 'US' } },
    { '@type': 'WebPage', '@id': url, url, name: t.title, inLanguage: L === 'en' ? 'en-US' : 'es', potentialAction: { '@type': 'OrderAction', target: { '@type': 'EntryPoint', urlTemplate: SITE + '/api/pedido', httpMethod: 'POST', encodingType: 'application/x-www-form-urlencoded', contentType: 'application/x-www-form-urlencoded' } } },
    ...products.map(p => ({ '@type': 'Product', name: p.name, sku: p.sku, description: p.desc, image: SITE + p.img, brand: { '@type': 'Brand', name: 'K11' }, ...(p.sds ? { subjectOf: { '@type': 'DigitalDocument', name: p.name + ' SDS', url: SITE + p.sds } } : {}),
      offers: { '@type': 'Offer', url: p.buy_url || url + '#cart', availability: 'https://schema.org/' + p.status, ...(p.cases_available ? { inventoryLevel: { '@type': 'QuantitativeValue', value: p.cases_available, unitText: 'cases' } } : {}), priceCurrency: 'USD', businessFunction: 'http://purl.org/goodrelations/v1#Sell', eligibleCustomerType: 'http://purl.org/goodrelations/v1#Business', eligibleRegion: { '@type': 'Country', name: 'US' }, ...(p.units ? { eligibleQuantity: { '@type': 'QuantitativeValue', minValue: 1, unitText: 'case of ' + p.units + ' units' } } : {}), seller: { '@id': SITE + '/#organization' } } })),
    { '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] };
  const cards = products.map(p => {
    const v = +pre[p.slug] || (sel === p.slug ? 1 : 0), st = p.cases_available > 0;
    return `<article class="pc" data-slug="${p.slug}" data-units="${p.units || 0}" data-stock="${p.cases_available}" data-online="${p.online ? 1 : 0}">
<div class="pimg"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"><span class="av ${st ? 'in' : 'pre'}">${st ? t.inStock(p.cases_available) : t.preOrder}</span></div>
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
header nav{display:flex;flex-wrap:wrap;gap:20px;font-size:14px}header nav a{color:var(--lm);text-decoration:none}header nav a:hover{color:#fff}
.hero{background:var(--bg);color:#fff;padding:56px 0 64px;position:relative;overflow:hidden}
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
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.pc{background:#fff;border:1px solid var(--w3);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;transition:border-color .2s,box-shadow .2s}
.pc.sel{border-color:var(--o);box-shadow:0 0 0 3px rgba(212,84,26,.14)}
.pimg{background:var(--w2);aspect-ratio:4/3;position:relative;display:grid;place-items:center;padding:22px}.pimg img{max-width:100%;max-height:100%;object-fit:contain}
.av{position:absolute;top:12px;left:12px;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px}.av.in{background:#DCEFE2;color:#1D7A3A}.av.pre{background:#fff;color:var(--mut);border:1px solid var(--w3)}
.pb{padding:18px 20px 20px;display:flex;flex-direction:column;gap:6px;flex:1}
.sku{font:600 12px ui-monospace,Menlo,monospace;color:var(--mut)}h3{font:800 1.55rem/1 var(--fd);text-transform:uppercase;margin:0}.pb p{margin:0;color:var(--mut);font-size:14px}
.meta{display:flex;justify-content:space-between;gap:8px;font-size:13px;color:var(--mut);margin-top:auto;padding-top:10px}
.step{display:grid;grid-template-columns:48px minmax(0,1fr) 48px;border:1px solid var(--w3);border-radius:10px;overflow:hidden;margin-top:10px}
.step button{background:var(--w2);border:0;font:600 22px var(--fb);color:var(--ink);cursor:pointer;min-height:48px}.step button:hover{background:var(--w3)}
.step input{border:0;text-align:center;font:800 1.5rem var(--fd);min-height:48px;width:100%;-moz-appearance:textfield;background:#fff;color:var(--ink)}.step input::-webkit-inner-spin-button{-webkit-appearance:none}.step input:focus{outline:2px solid var(--o);outline-offset:-2px}
.bar{position:sticky;bottom:0;z-index:10;background:var(--bg);color:#fff;border-top:1px solid var(--l)}
.bar .w{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-top:14px;padding-bottom:14px}
.bar b{font:800 1.5rem var(--fd);text-transform:uppercase}.bar small{display:block;color:var(--lm);font-size:13px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 24px;border-radius:10px;background:var(--o);color:#fff;text-decoration:none;font:700 15px var(--fb);border:0;cursor:pointer}.btn:hover{background:var(--od);color:#fff}
.btn.ghost{background:transparent;color:var(--ink);border:1.5px solid var(--ink)}.btn.ghost:hover{background:var(--ink);color:#fff}
.btn[disabled]{opacity:.4;cursor:not-allowed}
.co{background:var(--w2)}
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
<section class="co" id="checkout"><div class="w"><h2>${t.sec2}</h2><p class="ss"></p>
<div class="opts">
<div class="opt pay dk"><h3>${t.payH}</h3><p>${t.payP}</p><label style="color:var(--lm)">${f.email}<input type="email" name="email_pay" autocomplete="email"></label>
<div><button class="btn" id="payBtn" type="submit" formaction="/api/checkout" formnovalidate>${t.payB} →</button></div><p class="why" id="payWhy"></p></div>
<div class="opt"><h3>${t.invH}</h3><p>${t.invP}</p>
<div class="fg">${F('company', f.company, 1, 0, 'organization')}${F('contact', f.contact, 1, 0, 'name')}${F('email', f.email, 1, 'email', 'email')}${F('phone', f.phone, 0, 'tel', 'tel')}</div>
<div class="fg">${F('address', f.address, 1, 0, 'street-address')}${F('city', f.city, 1, 0, 'address-level2')}${F('state', f.state, 1, 0, 'address-level1')}${F('zip', f.zip, 1, 0, 'postal-code')}</div>
<div class="fg"><label>${f.type} *<select name="business_type" required>${f.types.map(x => `<option>${x}</option>`).join('')}</select></label>${F('ein', f.ein)}</div>
<div><label style="margin-bottom:6px">${f.pay}</label><div class="pays">${['Wire', 'ACH', 'Card', 'Zelle'].map((p, i) => `<label><input type="radio" name="payment" value="${p}"${i === 0 ? ' checked' : ''}>${p}</label>`).join('')}</div></div>
<label>${f.notes}<textarea name="notes"></textarea></label>
<label class="chk"><input type="checkbox" name="business" value="yes" required>${f.biz}</label>
<div><button class="btn ghost" type="submit">${t.invB}</button></div></div>
</div></div></section>
</form>
<section><div class="w info"><div><h2 style="font-size:2rem;margin-bottom:20px">${t.terms}</h2><dl>${t.tl.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl></div>
<div><h2 style="font-size:2rem;margin-bottom:20px">FAQ</h2><dl class="faq">${t.faq.map(([q, a]) => `<dt>${q}</dt><dd>${a}</dd>`).join('')}</dl></div></div>
<div class="w"><p class="api">${t.api}</p></div></section>
<footer class="dk"><div class="w">Wylco LLC · Miami, FL, USA · <a href="mailto:info@wylcosolutions.com">info@wylcosolutions.com</a> · <a href="tel:+19548818870">+1 (954) 881-8870</a></div></footer>
<script>
(function(){var S=${JSON.stringify(t.cart)},NO=${JSON.stringify(t.payNo)};var cards=[].slice.call(document.querySelectorAll('.pc'));
var qs=new URLSearchParams(location.search),sk=(qs.get('sku')||'').toLowerCase();
cards.forEach(function(c){var i=c.querySelector('input.q');var v=qs.get('qty_'+c.dataset.slug);if(v)i.value=Math.max(0,parseInt(v,10)||0);else if(sk&&c.dataset.slug===sk&&+i.value<1)i.value=1;
c.querySelector('.mn').onclick=function(){i.value=Math.max(0,(parseInt(i.value,10)||0)-1);upd();};c.querySelector('.pl').onclick=function(){i.value=(parseInt(i.value,10)||0)+1;upd();};i.addEventListener('input',upd);});
function upd(){var c=0,u=0,st=0,pr=0,ok=true;cards.forEach(function(k){var q=Math.max(0,parseInt(k.querySelector('input.q').value,10)||0);k.classList.toggle('sel',q>0);if(!q)return;c+=q;u+=q*(+k.dataset.units);var s=Math.min(q,+k.dataset.stock);st+=s;pr+=q-s;if(q>+k.dataset.stock||k.dataset.online!=='1')ok=false;});
document.getElementById('sumMain').textContent=c?c+' '+S.cases+(u?' · '+u.toLocaleString()+' '+S.units:''):S.none;
document.getElementById('sumSub').textContent=c?[st?st+' '+S.stock:'',pr?pr+' '+S.pre:''].filter(Boolean).join(' · '):'';
var b=document.getElementById('payBtn');b.disabled=!c||!ok;document.getElementById('payWhy').textContent=c&&!ok?NO:'';}
upd();})();
</script>
</body>
</html>
`;
}
module.exports = { render };
