// Mail "dar a conocer el producto" (nov 2026): K11 + datos legales + baja. EN/ES. Sin muestras gratis ni afirmaciones de compatibilidad.
// Diseño inspirado en la ficha Sanhua: portada con título grande, características con íconos, cuadro de datos, barra final.
// Sirve igual para quien ya recibió mails antes y para quien no (no dice "hace unas semanas te escribí").
const SITE = 'https://wylcosolutions.com';
const LEGAL_NAME = 'Wylco Solutions LLC';
const ADDR = '2248 W 77th St., Miami, FL 33016, USA'; // dirección postal del pie (CAN-SPAM). Cambiar acá si cambia.
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NAVY = '#0B2A4A', BLUE = '#1F5FA8', ORANGE = '#D4541A', SOFT = '#EAF1FA';

const T = {
  en: {
    s: e => `K11 HVAC-R leak solutions, now in Miami · for ${e}`,
    pre: 'TapaFugas, TapaFugas 2-in-1 and Sella Plus. Ships from Miami.',
    hero: 'K11 leak solutions for HVAC-R, now in Miami',
    hi: e => `Hi ${e} team,`,
    p1: `${LEGAL_NAME} is the official distributor of K11 HVAC-R leak solutions in the United States. We ship from Miami and we are opening accounts with supply houses and contractors.`,
    featTitle: 'Key features',
    feats: [['syringe', 'TapaFugas K11', '10 ml syringe, for systems up to 3 TR. Leak sealant for HVAC-R.'], ['uv', 'TapaFugas 2-in-1', 'Seals micro-leaks and leaves UV dye at the leak point, in one injection.'], ['gasket', 'Sella Plus', '35 ml sealant for flanges, connections and gaskets.'], ['box', 'Ships from Miami', 'Orders and invoices through our site. Coupler 1/4" also available.']],
    dataTitle: 'Data and resources',
    doseT: 'TapaFugas K11 dose guide',
    doseRows: [['Up to 3 TR', '10 ml'], ['4 TR', '15 ml'], ['5 TR', '20 ml'], ['8 TR', '30 ml'], ['Over 8 TR', '60 ml*']],
    doseNote: '*Dilute in lubricant. Manufacturer guide: always follow the product label.',
    presT: 'Presentations',
    pres: ['TapaFugas K11: 10 ml syringe', 'TapaFugas 2-in-1: 10 ml syringe', 'Sella Plus: 35 ml bottle', 'Coupler 1/4": adapter'],
    buyT: 'How to buy',
    buy: ['Full-case pricing for distributors and supply houses', 'Starter Packs for counters and technicians, from $260', 'Order online, ships from Miami'],
    cta: 'See products and Starter Packs',
    cta2: 'Or reply to this email, or call/WhatsApp +1 (954) 881-8870.',
    bar: [['shield', 'Official U.S. distributor', 'Wylco Solutions LLC'], ['box', 'Ships from Miami', 'Orders and invoices online'], ['clock', '12+ years of field use', 'in Latin America'], ['phone', 'Direct support', 'Call / WhatsApp']],
    sig: 'Fernando Lete · Wylco Solutions\n+1 (954) 881-8870 (call / WhatsApp)\ninfo@wylcosolutions.com · wylcosolutions.com',
    legalTitle: 'Important information',
    legal: [
      'This is a commercial email from ' + LEGAL_NAME + ', ' + ADDR + '.',
      'Product information comes from the manufacturer. Use K11 products only as directed on the label and follow applicable regulations, including EPA Section 608 requirements. Results depend on the condition of each system and are not guaranteed.',
      LEGAL_NAME + ' is an independent distributor. Product names and trademarks belong to their respective owners.'
    ],
    unsub: 'Unsubscribe',
    foot: e => `You are receiving this because ${e} is listed as an HVAC-R business. To stop receiving our emails, reply "unsubscribe" or use the link below and we will remove you right away.`,
    order: SITE + '/order'
  },
  es: {
    s: e => `K11: soluciones para fugas HVAC-R, ahora en Miami · para ${e}`,
    pre: 'TapaFugas, TapaFugas 2 en 1 y Sella Plus. Sale de Miami.',
    hero: 'K11: soluciones para fugas HVAC-R, ahora en Miami',
    hi: e => `Hola, equipo de ${e}:`,
    p1: `${LEGAL_NAME} es el distribuidor oficial de las soluciones K11 para fugas HVAC-R en Estados Unidos. Enviamos desde Miami y estamos abriendo cuentas con casas de repuestos y contratistas.`,
    featTitle: 'Características principales',
    feats: [['syringe', 'TapaFugas K11', 'Jeringa de 10 ml, para equipos de hasta 3 TR. Sellador de fugas HVAC-R.'], ['uv', 'TapaFugas 2 en 1', 'Sella micro-fugas y deja tinte UV en el punto de la fuga, en una sola inyección.'], ['gasket', 'Sella Plus', 'Sellador de 35 ml para bridas, conexiones y juntas.'], ['box', 'Envío desde Miami', 'Pedidos y facturas por nuestro sitio. También hay acople de 1/4".']],
    dataTitle: 'Datos y recursos',
    doseT: 'Guía de dosis TapaFugas K11',
    doseRows: [['Hasta 3 TR', '10 ml'], ['4 TR', '15 ml'], ['5 TR', '20 ml'], ['8 TR', '30 ml'], ['Más de 8 TR', '60 ml*']],
    doseNote: '*Diluir en lubricante. Guía del fabricante: siga siempre la etiqueta del producto.',
    presT: 'Presentaciones',
    pres: ['TapaFugas K11: jeringa de 10 ml', 'TapaFugas 2 en 1: jeringa de 10 ml', 'Sella Plus: botella de 35 ml', 'Acople 1/4": adaptador'],
    buyT: 'Cómo comprar',
    buy: ['Precios por caja para distribuidores y casas de repuestos', 'Paquetes Starter para mostradores y técnicos, desde $260', 'Pedido en línea, con envío desde Miami'],
    cta: 'Ver productos y paquetes Starter',
    cta2: 'O responda este mail, o llame/WhatsApp al +1 (954) 881-8870.',
    bar: [['shield', 'Distribuidor oficial en EE. UU.', 'Wylco Solutions LLC'], ['box', 'Envío desde Miami', 'Pedidos y facturas en línea'], ['clock', '12+ años de uso en campo', 'en Latinoamérica'], ['phone', 'Soporte directo', 'Llamada / WhatsApp']],
    sig: 'Fernando Lete · Wylco Solutions\n+1 (954) 881-8870 (llamada / WhatsApp)\ninfo@wylcosolutions.com · wylcosolutions.com',
    legalTitle: 'Información importante',
    legal: [
      'Este es un mail comercial de ' + LEGAL_NAME + ', ' + ADDR + '.',
      'La información de producto proviene del fabricante. Use los productos K11 solo según la etiqueta y cumpla la normativa aplicable, incluidos los requisitos de la Sección 608 de la EPA. Los resultados dependen del estado de cada sistema y no están garantizados.',
      LEGAL_NAME + ' es un distribuidor independiente. Los nombres de producto y las marcas pertenecen a sus respectivos dueños.'
    ],
    unsub: 'Darse de baja',
    foot: e => `Recibe este mensaje porque ${e} figura como empresa de HVAC-R. Para no recibir más mails, responda "baja" o use el enlace de abajo y la sacaremos de inmediato.`,
    order: SITE + '/es/order'
  }
};

const H = "font-family:'Barlow Condensed',Arial Narrow,Arial,sans-serif";
const B = 'font-family:Arial,Helvetica,sans-serif';

function build(k, lang, emp) {
  const L = lang === 'es' ? 'es' : 'en', t = T[L];
  const ico = n => `${SITE}/assets/email/ico/${n}.png`;
  const unsubHref = `mailto:info@wylcosolutions.com?subject=${L === 'es' ? 'baja' : 'unsubscribe'}`;
  const sec = s => `<div style="${H};font-weight:800;font-size:22px;letter-spacing:.06em;text-transform:uppercase;color:${NAVY};border-bottom:3px solid ${ORANGE};display:inline-block;padding-bottom:4px">${esc(s)}</div>`;
  const feat = f => `<td class="col" width="25%" valign="top" align="center" style="padding:14px 6px 6px"><img src="${ico(f[0])}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;margin:0 auto"><div style="${H};font-weight:800;font-size:17px;letter-spacing:.04em;text-transform:uppercase;color:${NAVY};margin-top:8px">${esc(f[1])}</div><div style="${B};font-size:13px;line-height:1.45;color:#3A3F4D;margin-top:4px">${esc(f[2])}</div></td>`;
  const dose = t.doseRows.map(r => `<tr><td style="padding:4px 0;border-bottom:1px solid #C9D9EE;${B};font-size:13px;color:#1c1f27">${esc(r[0])}</td><td align="right" style="padding:4px 0;border-bottom:1px solid #C9D9EE;${B};font-size:13px;font-weight:700;color:#1c1f27">${esc(r[1])}</td></tr>`).join('');
  const li = a => a.map(x => `<div style="${B};font-size:13px;line-height:1.45;color:#1c1f27;margin:0 0 5px">&bull; ${esc(x)}</div>`).join('');
  const pill = b => `<td class="col" width="25%" valign="top" align="center" style="padding:14px 6px"><img src="${ico('w-' + b[0])}" width="40" height="40" alt="" style="display:block;width:40px;height:40px;margin:0 auto"><div style="${B};font-weight:700;font-size:13px;line-height:1.3;color:#fff;margin-top:8px">${esc(b[1])}</div><div style="${B};font-size:12px;line-height:1.3;color:#9DBBE0;margin-top:2px">${esc(b[2])}</div></td>`;
  const html = `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t.s(emp))}</title>
<style>@media (max-width:520px){.col{display:block!important;width:100%!important}.pad{padding-left:16px!important;padding-right:16px!important}}</style></head>
<body style="margin:0;padding:0;background:#E3EAF3"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#E3EAF3">${esc(t.pre)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E3EAF3"><tr><td align="center" style="padding:18px 10px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td><a href="${t.order}"><img src="${SITE}/assets/email/hero-prod-${L}.jpg" width="600" alt="${esc(t.hero)}" style="display:block;width:100%;height:auto;border:0"></a></td></tr>
<tr><td class="pad" style="padding:24px 28px 4px;${B};font-size:16px;line-height:1.55;color:#1c1f27"><p style="margin:0 0 12px">${esc(t.hi(emp))}</p><p style="margin:0">${esc(t.p1)}</p></td></tr>
<tr><td class="pad" style="padding:14px 28px 0">${sec(t.featTitle)}</td></tr>
<tr><td style="padding:2px 16px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${t.feats.map(feat).join('')}</tr></table></td></tr>
<tr><td class="pad" style="padding:10px 28px 0">${sec(t.dataTitle)}</td></tr>
<tr><td style="padding:12px 22px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SOFT};border-radius:10px"><tr>
<td class="col" width="34%" valign="top" style="padding:14px 14px 12px"><div style="${H};font-weight:800;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:${BLUE};margin-bottom:6px">${esc(t.doseT)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${dose}</table><div style="${B};font-size:11px;line-height:1.4;color:#5b6070;margin-top:6px">${esc(t.doseNote)}</div></td>
<td class="col" width="33%" valign="top" style="padding:14px 14px 12px"><div style="${H};font-weight:800;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:${BLUE};margin-bottom:8px">${esc(t.presT)}</div>${li(t.pres)}</td>
<td class="col" width="33%" valign="top" style="padding:14px 14px 12px"><div style="${H};font-weight:800;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:${BLUE};margin-bottom:8px">${esc(t.buyT)}</div>${li(t.buy)}</td>
</tr></table></td></tr>
<tr><td align="center" style="padding:18px 28px 6px"><a href="${t.order}" style="display:inline-block;background:${ORANGE};color:#fff;text-decoration:none;${H};font-weight:800;font-size:20px;line-height:1;letter-spacing:.08em;text-transform:uppercase;padding:16px 30px;border-radius:8px">${esc(t.cta)} &rarr;</a><div style="${B};font-size:14px;line-height:1.4;color:#3A3F4D;margin-top:12px">${esc(t.cta2)}</div></td></tr>
<tr><td class="pad" style="padding:14px 28px 20px;${B};font-size:14px;line-height:1.5;color:#3A3F4D">${esc(t.sig).replace(/\n/g, '<br>')}</td></tr>
<tr><td style="background:${NAVY};padding:6px 14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${t.bar.map(pill).join('')}</tr></table></td></tr>
<tr><td class="pad" style="background:${SOFT};padding:16px 28px;${B};font-size:12px;line-height:1.55;color:#5b6070"><div style="font-weight:700;margin-bottom:4px">${esc(t.legalTitle)}</div>${t.legal.map(x => `<div style="margin-bottom:4px">${esc(x)}</div>`).join('')}</td></tr>
<tr><td class="pad" style="background:#0F1117;padding:16px 28px;${B};font-size:12px;line-height:1.5;color:#9aa0ab">${esc(t.foot(emp))}<br><a href="${unsubHref}" style="color:#E8743B">${esc(t.unsub)}</a></td></tr>
</table></td></tr></table></body></html>`;
  const text = `${t.hi(emp)}\n\n${t.p1}\n\n${t.featTitle.toUpperCase()}\n${t.feats.map(f => `  - ${f[1]}: ${f[2]}`).join('\n')}\n\n${t.doseT}:\n${t.doseRows.map(r => `  ${r[0]}: ${r[1]}`).join('\n')}\n${t.doseNote}\n\n${t.presT}:\n${t.pres.map(x => `  - ${x}`).join('\n')}\n\n${t.buyT}:\n${t.buy.map(x => `  - ${x}`).join('\n')}\n\n${t.cta}: ${t.order}\n${t.cta2}\n\n${t.sig}\n\n—\n${t.legalTitle}\n${t.legal.join('\n')}\n\n${t.foot(emp)}`;
  return { s: t.s(emp), b: text, h: html };
}
module.exports = { build, SITE, ADDR, LEGAL_NAME };
