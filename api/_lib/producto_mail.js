// Mail "dar a conocer el producto" (nov 2026): K11 + datos legales + baja. EN/ES. Sin muestras gratis ni afirmaciones de compatibilidad.
// Sirve igual para quien ya recibió mails antes y para quien no (no dice "hace unas semanas te escribí").
const SITE = 'https://wylcosolutions.com';
const LEGAL_NAME = 'Wylco Solutions LLC';
const LEGAL_ADDR = '4350 Hillcrest Dr, Apt 220, Hollywood, FL 33021, USA'; // domicilio legal/postal (Sunbiz L26000571912)
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const T = {
  en: {
    s: e => `K11 HVAC-R leak solutions, now in Miami · for ${e}`,
    pre: 'TapaFugas, TapaFugas 2-in-1 and Sella Plus. Ships from Miami.',
    tag: 'HVAC-R LEAK SOLUTIONS · NOW IN MIAMI',
    hi: e => `Hi ${e} team,`,
    p1: `${LEGAL_NAME} is the official distributor of K11 HVAC-R leak solutions in the United States. We ship from Miami and we are opening accounts with supply houses and contractors.`,
    p2: 'K11 is a product line from Latin America with more than 12 years of field use there. This is the line we are bringing to the U.S.:',
    prod: [['TapaFugas K11', '10 ml syringe, for systems up to 3 TR. Leak sealant for HVAC-R.'], ['TapaFugas 2-in-1', 'Seals micro-leaks and leaves UV dye at the leak point, in one injection.'], ['Sella Plus', '35 ml sealant for flanges, connections and gaskets.']],
    cp: 'Also available: Coupler 1/4" (adapter).',
    dose: 'TapaFugas K11 dose guide (manufacturer)',
    doseRows: [['Up to 3 TR', '10 ml'], ['4 TR', '15 ml'], ['5 TR', '20 ml'], ['8 TR', '30 ml'], ['Over 8 TR', '60 ml (dilute in lubricant)']],
    doseNote: 'Always follow the product label and your own technical judgment.',
    buy: 'How to buy',
    buyP: ['Full-case pricing for distributors and supply houses.', 'Starter Packs for counters and technicians, from $260.', 'Orders and invoices through our site, shipped from Miami.'],
    cta: 'See products and Starter Packs',
    cta2: 'Or reply to this email, or call/WhatsApp +1 (954) 881-8870.',
    sig: 'Fernando Lete · Wylco Solutions\n+1 (954) 881-8870 (call / WhatsApp)\ninfo@wylcosolutions.com · wylcosolutions.com',
    legalTitle: 'Important information',
    legal: [
      'This is a commercial email from ' + LEGAL_NAME + ' (' + LEGAL_ADDR + ').',
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
    tag: 'SOLUCIONES PARA FUGAS HVAC-R · AHORA EN MIAMI',
    hi: e => `Hola, equipo de ${e}:`,
    p1: `${LEGAL_NAME} es el distribuidor oficial de las soluciones K11 para fugas HVAC-R en Estados Unidos. Enviamos desde Miami y estamos abriendo cuentas con casas de repuestos y contratistas.`,
    p2: 'K11 es una línea de Latinoamérica con más de 12 años de uso en campo allá. Esta es la línea que traemos a EE. UU.:',
    prod: [['TapaFugas K11', 'Jeringa de 10 ml, para equipos de hasta 3 TR. Sellador de fugas HVAC-R.'], ['TapaFugas 2 en 1', 'Sella micro-fugas y deja tinte UV en el punto de la fuga, en una sola inyección.'], ['Sella Plus', 'Sellador de 35 ml para bridas, conexiones y juntas.']],
    cp: 'También disponible: Acople (coupler) de 1/4".',
    dose: 'Guía de dosis del TapaFugas K11 (fabricante)',
    doseRows: [['Hasta 3 TR', '10 ml'], ['4 TR', '15 ml'], ['5 TR', '20 ml'], ['8 TR', '30 ml'], ['Más de 8 TR', '60 ml (diluir en lubricante)']],
    doseNote: 'Siga siempre la etiqueta del producto y su propio criterio técnico.',
    buy: 'Cómo comprar',
    buyP: ['Precios por caja para distribuidores y casas de repuestos.', 'Paquetes Starter para mostradores y técnicos, desde $260.', 'Pedidos y facturas a través de nuestro sitio, con envío desde Miami.'],
    cta: 'Ver productos y paquetes Starter',
    cta2: 'O responda este mail, o llame/WhatsApp al +1 (954) 881-8870.',
    sig: 'Fernando Lete · Wylco Solutions\n+1 (954) 881-8870 (llamada / WhatsApp)\ninfo@wylcosolutions.com · wylcosolutions.com',
    legalTitle: 'Información importante',
    legal: [
      'Este es un mail comercial de ' + LEGAL_NAME + ' (' + LEGAL_ADDR + ').',
      'La información de producto proviene del fabricante. Use los productos K11 solo según la etiqueta y cumpla la normativa aplicable, incluidos los requisitos de la Sección 608 de la EPA. Los resultados dependen del estado de cada sistema y no están garantizados.',
      LEGAL_NAME + ' es un distribuidor independiente. Los nombres de producto y las marcas pertenecen a sus respectivos dueños.'
    ],
    unsub: 'Darse de baja',
    foot: e => `Recibe este mensaje porque ${e} figura como empresa de HVAC-R. Para no recibir más mails, responda "baja" o use el enlace de abajo y la sacaremos de inmediato.`,
    order: SITE + '/es/order'
  }
};

function build(k, lang, emp) {
  const L = lang === 'es' ? 'es' : 'en', t = T[L];
  const imgs = [`${SITE}/assets/email/p-tf.jpg`, `${SITE}/assets/email/p-tf2.jpg`, L === 'es' ? `${SITE}/assets/email/p-sp-es.jpg` : `${SITE}/assets/email/p-sp-en.jpg`];
  const unsubHref = `mailto:info@wylcosolutions.com?subject=${L === 'es' ? 'baja' : 'unsubscribe'}`;
  const card = i => `<td width="33%" valign="top" style="padding:0 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;border-radius:10px"><tr><td align="center" style="padding:14px 10px 6px"><img src="${imgs[i]}" width="120" height="120" alt="${esc(t.prod[i][0])}" style="display:block;width:120px;height:120px;object-fit:contain"></td></tr><tr><td style="padding:0 12px 14px;text-align:center"><div style="font:800 15px/1.15 'Barlow Condensed',Arial Narrow,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#0F1117">${esc(t.prod[i][0].replace(/-/g, '‑'))}</div><div style="font:13px/1.4 Arial,Helvetica,sans-serif;color:#3A3F4D;margin-top:6px">${esc(t.prod[i][1])}</div></td></tr></table></td>`;
  const dose = t.doseRows.map(r => `<tr><td style="padding:5px 10px;border-bottom:1px solid #E5DED1;font:14px Arial,Helvetica,sans-serif;color:#1c1f27">${esc(r[0])}</td><td style="padding:5px 10px;border-bottom:1px solid #E5DED1;font:700 14px Arial,Helvetica,sans-serif;color:#1c1f27">${esc(r[1])}</td></tr>`).join('');
  const html = `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t.s(emp))}</title></head>
<body style="margin:0;padding:0;background:#EDE6DA"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EDE6DA">${esc(t.pre)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDE6DA"><tr><td align="center" style="padding:18px 10px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0F1117;padding:26px 28px"><div style="font:800 44px/1 'Barlow Condensed',Arial Narrow,Arial,sans-serif;letter-spacing:.06em;color:#fff">K11</div><div style="font:700 13px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.14em;color:#E8743B;margin-top:8px">${esc(t.tag)}</div></td></tr>
<tr><td style="padding:26px 28px 6px;font:16px/1.55 Arial,Helvetica,sans-serif;color:#1c1f27"><p style="margin:0 0 12px">${esc(t.hi(emp))}</p><p style="margin:0 0 12px">${esc(t.p1)}</p><p style="margin:0 0 4px">${esc(t.p2)}</p></td></tr>
<tr><td style="padding:8px 22px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${card(0)}${card(1)}${card(2)}</tr></table></td></tr>
<tr><td style="padding:8px 28px 4px;font:14px/1.5 Arial,Helvetica,sans-serif;color:#3A3F4D">${esc(t.cp)}</td></tr>
<tr><td style="padding:14px 28px 4px"><div style="font:800 16px/1.2 'Barlow Condensed',Arial Narrow,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#0F1117;margin-bottom:6px">${esc(t.dose)}</div><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#F5F0E8;border-radius:8px">${dose}</table><div style="font:12px/1.5 Arial,Helvetica,sans-serif;color:#5b6070;margin-top:6px">${esc(t.doseNote)}</div></td></tr>
<tr><td style="padding:16px 28px 0;font:15px/1.5 Arial,Helvetica,sans-serif;color:#1c1f27"><div style="font:800 16px/1.2 'Barlow Condensed',Arial Narrow,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#0F1117;margin-bottom:6px">${esc(t.buy)}</div>${t.buyP.map(x => `<div style="margin:0 0 4px">&bull; ${esc(x)}</div>`).join('')}</td></tr>
<tr><td align="center" style="padding:20px 28px 6px"><a href="${t.order}" style="display:inline-block;background:#D4541A;color:#fff;text-decoration:none;font:800 20px/1 'Barlow Condensed',Arial Narrow,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:16px 34px;border-radius:8px">${esc(t.cta)} &rarr;</a><div style="font:14px/1.4 Arial,Helvetica,sans-serif;color:#3A3F4D;margin-top:12px">${esc(t.cta2)}</div></td></tr>
<tr><td style="padding:16px 28px 22px;font:14px/1.5 Arial,Helvetica,sans-serif;color:#3A3F4D">${esc(t.sig).replace(/\n/g, '<br>')}</td></tr>
<tr><td style="background:#F5F0E8;padding:16px 28px;font:12px/1.55 Arial,Helvetica,sans-serif;color:#5b6070"><div style="font-weight:700;margin-bottom:4px">${esc(t.legalTitle)}</div>${t.legal.map(x => `<div style="margin-bottom:4px">${esc(x)}</div>`).join('')}</td></tr>
<tr><td style="background:#0F1117;padding:16px 28px;font:12px/1.5 Arial,Helvetica,sans-serif;color:#9aa0ab">${esc(t.foot(emp))}<br><a href="${unsubHref}" style="color:#E8743B">${esc(t.unsub)}</a></td></tr>
</table></td></tr></table></body></html>`;
  const text = `${t.hi(emp)}\n\n${t.p1}\n\n${t.p2}\n${t.prod.map(x => `  - ${x[0]}: ${x[1]}`).join('\n')}\n${t.cp}\n\n${t.dose}:\n${t.doseRows.map(r => `  ${r[0]}: ${r[1]}`).join('\n')}\n${t.doseNote}\n\n${t.buy}:\n${t.buyP.map(x => `  - ${x}`).join('\n')}\n\n${t.cta}: ${t.order}\n${t.cta2}\n\n${t.sig}\n\n—\n${t.legalTitle}\n${t.legal.join('\n')}\n\n${t.foot(emp)}`;
  return { s: t.s(emp), b: text, h: html };
}
module.exports = { build, SITE, LEGAL_ADDR, LEGAL_NAME };
