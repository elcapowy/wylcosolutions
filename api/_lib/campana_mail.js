// Campaña de diciembre 2026 (mails 2-4 tras prod1). Claves: camp{2,3,4}{a,c}  a = distribuidores/casas de repuestos, c = contratistas.
// Mismo marco visual que producto_mail (legal, baja, dirección). Sin afirmaciones técnicas fuera de la guía del fabricante.
const P = require('./producto_mail');
const { SITE, ADDR, LEGAL_NAME } = P;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NAVY = '#0B2A4A', BLUE = '#1F5FA8', ORANGE = '#D4541A', SOFT = '#EAF1FA';
const H = "font-family:'Barlow Condensed',Arial Narrow,Arial,sans-serif", B = 'font-family:Arial,Helvetica,sans-serif';
const PHONE = '+1 (954) 881-8870';

const COMMON = {
  en: {
    hi: e => `Hi ${e} team,`,
    sig: `Fernando Lete · Wylco Solutions\n${PHONE} (call / WhatsApp)\ninfo@wylcosolutions.com · wylcosolutions.com`,
    bar: [['shield', 'Official U.S. distributor', 'Wylco Solutions LLC'], ['box', 'Ships from Miami', 'Orders and invoices online'], ['clock', '12+ years of field use', 'in Latin America'], ['phone', 'Direct support', 'Call / WhatsApp']],
    legalTitle: 'Important information',
    legal: ['This is a commercial email from ' + LEGAL_NAME + ', ' + ADDR + '.', 'Product information comes from the manufacturer. Use K11 products only as directed on the label and follow applicable regulations, including EPA Section 608 requirements. Results depend on the condition of each system and are not guaranteed.', LEGAL_NAME + ' is an independent distributor. Product names and trademarks belong to their respective owners.'],
    unsub: 'Unsubscribe', un: 'unsubscribe',
    foot: e => `You are receiving this because ${e} is listed as an HVAC-R business. To stop receiving our emails, reply "unsubscribe" or use the link below and we will remove you right away.`,
    contact: `Questions? Reply to this email, or call/WhatsApp ${PHONE}.`,
    sds: 'Safety Data Sheets', pre: SITE + '/order', docs: SITE + '/docs', h: SITE + '/order', st: SITE + '/order#starter'
  },
  es: {
    hi: e => `Hola, equipo de ${e}:`,
    sig: `Fernando Lete · Wylco Solutions\n${PHONE} (llamada / WhatsApp)\ninfo@wylcosolutions.com · wylcosolutions.com`,
    bar: [['shield', 'Distribuidor oficial en EE. UU.', 'Wylco Solutions LLC'], ['box', 'Envío desde Miami', 'Pedidos y facturas en línea'], ['clock', '12+ años de uso en campo', 'en Latinoamérica'], ['phone', 'Soporte directo', 'Llamada / WhatsApp']],
    legalTitle: 'Información importante',
    legal: ['Este es un mail comercial de ' + LEGAL_NAME + ', ' + ADDR + '.', 'La información de producto proviene del fabricante. Use los productos K11 solo según la etiqueta y cumpla la normativa aplicable, incluidos los requisitos de la Sección 608 de la EPA. Los resultados dependen del estado de cada sistema y no están garantizados.', LEGAL_NAME + ' es un distribuidor independiente. Los nombres de producto y las marcas pertenecen a sus respectivos dueños.'],
    unsub: 'Darse de baja', un: 'baja',
    foot: e => `Recibe este mensaje porque ${e} figura como empresa de HVAC-R. Para no recibir más mails, responda "baja" o use el enlace de abajo y la sacaremos de inmediato.`,
    contact: `¿Consultas? Responda este mail, o llame/WhatsApp al ${PHONE}.`,
    sds: 'Hojas de seguridad', pre: SITE + '/es/order', docs: SITE + '/es/docs', h: SITE + '/es/order', st: SITE + '/es/order#starter'
  }
};

// Contenido de cada mail. n = 2 prevención, 3 dosis, 4 starter. aud: a | c
const M = {
  en: {
    2: { s: e => `Prevention beats the callback · K11 for ${e}`, pre: 'In HVAC-R, the difference shows up after the service ends.',
      hero: 'The technician who prevents is worth more than the one who only puts out fires.',
      p: { c: ['Customers remember the technician who fixes the problem so it does not come back. Adding a leak sealant to your service routine is one practical way to work on that.', 'K11 is a compact line made for HVAC-R technicians: three products, each one for a specific job.'],
           a: ['Your contractors want products that help them avoid callbacks. K11 gives your counter a compact line to offer: three products, each one for a specific job.'] },
      listT: 'Three products, three jobs', list: [['TapaFugas K11', '10 ml syringe. Leak sealant for HVAC-R systems, up to 3 TR per syringe.'], ['TapaFugas 2-in-1', 'Seals micro-leaks and leaves UV dye at the leak point, in one injection.'], ['Sella Plus', '35 ml sealant for flanges, connections and gaskets.']],
      cta: 'See the K11 line', ctaHref: 'h' },
    3: { s: e => `10 ml, up to 36,000 BTU: compare the dose, not just the price · ${e}`, pre: 'Manufacturer dose guide for TapaFugas K11.',
      hero: '10 ml can treat systems up to 36,000 BTU. Are you comparing dose, or just price?',
      p: { c: ['When you compare sealants, compare what each system needs. Per the manufacturer guide, one 10 ml TapaFugas K11 syringe is the dose for systems up to 3 TR (36,000 BTU).', 'Here is the full guide, so you can plan by system size.'],
           a: ['When your customers compare sealants, the dose per system is the number that matters. Per the manufacturer guide, one 10 ml TapaFugas K11 syringe is the dose for systems up to 3 TR (36,000 BTU).', 'Here is the full guide, to help your counter staff answer quickly.'] },
      table: { t: 'TapaFugas K11 dose guide', head: ['System size', 'Capacity', 'Dose'], rows: [['Up to 3 TR', 'up to 36,000 BTU/h', '10 ml'], ['4 TR', '48,000 BTU/h', '15 ml'], ['5 TR', '60,000 BTU/h', '20 ml'], ['8 TR', '96,000 BTU/h', '30 ml'], ['Over 8 TR', 'over 96,000 BTU/h', '60 ml*']], note: '*Dilute in lubricant. 1 TR = 12,000 BTU/h. Manufacturer guide: always follow the product label.' },
      cta: 'See products and sizes', ctaHref: 'h' },
    5: { s: e => `Why is Sella Plus blue? · K11 for ${e}`, pre: 'That detail is no accident.',
      hero: 'Why is Sella Plus blue? That detail is no accident.',
      p: { c: ['Sella Plus comes with a blue liquid, and it is there on purpose: it makes the product easier to see at the moment of application.', 'K11 explains it this way: the technician can see better where the product was applied, which adds control to the process.'],
           a: ['Sella Plus comes with a blue liquid, and it is there on purpose: it makes the product easier to see at the moment of application. A good point to share with the technicians who buy at your counter.', 'K11 explains it this way: the technician can see better where the product was applied, which adds control to the process.'] },
      listT: 'Why the color matters', list: [['Visible at application', 'The blue liquid makes it easier to see the product as you apply it.'], ['More control', 'You can see better where the product went.'], ['Easier future service', 'When opening or checking a unit, the technician can tell whether a sealant was applied before.'], ['Made for the routine', 'A choice made for those who apply, check and maintain the system.']],
      cta: 'See Sella Plus', ctaHref: 'h' },
    4: { s: e => `Start small. Stock what moves. K11 Starter Packs · ${e}`, pre: 'Mixed units at one fixed price. Ships from Miami.',
      hero: 'Start small. Stock what moves.',
      p: { c: ['Not ready for a full case? K11 Starter Packs are mixed units at one fixed price: the same products and the same terms, to try the line on your own trucks and jobs.'],
           a: ['Not ready for a full case of every product? K11 Starter Packs are mixed units at one fixed price: the same products and the same terms, to test how the line moves at your counter.'] },
      listT: 'How Starter Packs work', list: [['Mixed units', 'TapaFugas K11, TapaFugas 2-in-1 and Sella Plus in one pack.'], ['One fixed price', 'Packs start at $260.'], ['Order by invoice', 'Order on our site, we invoice you. Ships from Miami at a lower rate quoted on your invoice.'], ['Documents ready', 'Safety Data Sheets for every product are on our site.']],
      cta: 'See Starter Packs', ctaHref: 'st' }
  },
  es: {
    2: { s: e => `Prevenir vale más que volver a la obra · K11 para ${e}`, pre: 'En HVAC-R, la diferencia aparece después de que el servicio termina.',
      hero: 'El técnico que previene vale más que el técnico que solo apaga incendios.',
      p: { c: ['El cliente recuerda al técnico que resuelve el problema para que no vuelva. Sumar un sellador de fugas a su rutina de servicio es una forma práctica de trabajar en eso.', 'K11 es una línea compacta pensada para técnicos de HVAC-R: tres productos, cada uno para una tarea concreta.'],
           a: ['Sus contratistas buscan productos que les ayuden a evitar las visitas de retorno. K11 le da a su mostrador una línea compacta para ofrecer: tres productos, cada uno para una tarea concreta.'] },
      listT: 'Tres productos, tres tareas', list: [['TapaFugas K11', 'Jeringa de 10 ml. Sellador de fugas HVAC-R, hasta 3 TR por jeringa.'], ['TapaFugas 2 en 1', 'Sella micro-fugas y deja tinte UV en el punto de la fuga, en una sola inyección.'], ['Sella Plus', 'Sellador de 35 ml para bridas, conexiones y juntas.']],
      cta: 'Ver la línea K11', ctaHref: 'h' },
    3: { s: e => `10 ml, hasta 36,000 BTU: compare la dosis, no solo el precio · ${e}`, pre: 'Guía de dosis del fabricante para TapaFugas K11.',
      hero: '10 ml alcanzan para equipos de hasta 36,000 BTU. ¿Compara la dosis, o solo el precio?',
      p: { c: ['Al comparar selladores, compare lo que necesita cada equipo. Según la guía del fabricante, una jeringa de 10 ml de TapaFugas K11 es la dosis para equipos de hasta 3 TR (36,000 BTU).', 'Acá está la guía completa, para planificar según el tamaño del equipo.'],
           a: ['Cuando sus clientes comparan selladores, la dosis por equipo es el número que importa. Según la guía del fabricante, una jeringa de 10 ml de TapaFugas K11 es la dosis para equipos de hasta 3 TR (36,000 BTU).', 'Acá está la guía completa, para que su mostrador responda rápido.'] },
      table: { t: 'Guía de dosis TapaFugas K11', head: ['Tamaño del equipo', 'Capacidad', 'Dosis'], rows: [['Hasta 3 TR', 'hasta 36,000 BTU/h', '10 ml'], ['4 TR', '48,000 BTU/h', '15 ml'], ['5 TR', '60,000 BTU/h', '20 ml'], ['8 TR', '96,000 BTU/h', '30 ml'], ['Más de 8 TR', 'más de 96,000 BTU/h', '60 ml*']], note: '*Diluir en lubricante. 1 TR = 12,000 BTU/h. Guía del fabricante: siga siempre la etiqueta del producto.' },
      cta: 'Ver productos y tamaños', ctaHref: 'h' },
    5: { s: e => `¿Por qué Sella Plus es azul? · K11 para ${e}`, pre: 'Ese detalle no es casualidad.',
      hero: '¿Por qué Sella Plus es azul? Ese detalle no es casualidad.',
      p: { c: ['Sella Plus viene con un líquido azul, y está ahí a propósito: facilita ver el producto en el momento de la aplicación.', 'K11 lo explica así: el profesional puede ver mejor dónde fue aplicado el producto, lo que aporta más control al proceso.'],
           a: ['Sella Plus viene con un líquido azul, y está ahí a propósito: facilita ver el producto en el momento de la aplicación. Un buen dato para compartir con los técnicos que compran en su mostrador.', 'K11 lo explica así: el profesional puede ver mejor dónde fue aplicado el producto, lo que aporta más control al proceso.'] },
      listT: 'Por qué importa el color', list: [['Visible al aplicar', 'El líquido azul facilita ver el producto mientras se aplica.'], ['Más control', 'Se ve mejor dónde fue el producto.'], ['Servicio futuro más simple', 'Al abrir o revisar un equipo, el técnico puede identificar si ya hubo aplicación de sellador anteriormente.'], ['Pensado para la rutina', 'Una elección pensada para quienes aplican, revisan y mantienen el sistema.']],
      cta: 'Ver Sella Plus', ctaHref: 'h' },
    4: { s: e => `Empiece de a poco. Surta lo que se mueve. Paquetes Starter K11 · ${e}`, pre: 'Unidades mixtas a precio cerrado. Envío desde Miami.',
      hero: 'Empiece de a poco. Surta lo que se mueve.',
      p: { c: ['¿Todavía no necesita una caja completa? Los paquetes Starter K11 son unidades mixtas a precio cerrado: los mismos productos y las mismas condiciones, para probar la línea en sus propios trabajos.'],
           a: ['¿Todavía no necesita una caja completa de cada producto? Los paquetes Starter K11 son unidades mixtas a precio cerrado: los mismos productos y las mismas condiciones, para probar cómo se mueve la línea en su mostrador.'] },
      listT: 'Cómo funcionan los paquetes Starter', list: [['Unidades mixtas', 'TapaFugas K11, TapaFugas 2 en 1 y Sella Plus en un mismo paquete.'], ['Un precio cerrado', 'Los paquetes arrancan en $260.'], ['Pedido por factura', 'Pide en nuestro sitio y le facturamos. Sale de Miami con una tarifa de envío menor, indicada en la factura.'], ['Documentos listos', 'Las hojas de seguridad de cada producto están en nuestro sitio.']],
      cta: 'Ver paquetes Starter', ctaHref: 'st' }
  }
};

function build(k, lang, emp) {
  const m = /^camp(\d)([ac])/.exec(k);
  if (!m) throw new Error('clave de campaña inválida: ' + k);
  const L = lang === 'es' ? 'es' : 'en', n = +m[1], aud = m[2], C = COMMON[L], t = M[L][n];
  const ico = x => `${SITE}/assets/email/ico/${x}.png`;
  const href = C[t.ctaHref];
  const unsubHref = `mailto:info@wylcosolutions.com?subject=${C.un}`;
  const sec = s => `<div style="${H};font-weight:800;font-size:22px;letter-spacing:.06em;text-transform:uppercase;color:${NAVY};border-bottom:3px solid ${ORANGE};display:inline-block;padding-bottom:4px">${esc(s)}</div>`;
  const paras = t.p[aud] || t.p.c;
  let mid = '';
  if (t.list) mid = `<tr><td class="pad" style="padding:14px 28px 0">${sec(t.listT)}</td></tr><tr><td style="padding:12px 22px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SOFT};border-radius:10px"><tr><td style="padding:14px 18px 8px">${t.list.map(x => `<div style="${B};font-size:14px;line-height:1.5;color:#1c1f27;margin:0 0 9px"><span style="${H};font-weight:800;font-size:17px;letter-spacing:.04em;text-transform:uppercase;color:${BLUE}">${esc(x[0])}</span><br>${esc(x[1])}</div>`).join('')}</td></tr></table></td></tr>`;
  if (t.table) {
    const th = t.table.head.map((x, i) => `<td${i === 2 ? ' align="right"' : ''} style="padding:5px 0;border-bottom:2px solid ${BLUE};${H};font-weight:800;font-size:15px;letter-spacing:.05em;text-transform:uppercase;color:${BLUE}">${esc(x)}</td>`).join('');
    const tr = t.table.rows.map(r => `<tr><td style="padding:7px 0;border-bottom:1px solid #C9D9EE;${B};font-size:14px;font-weight:700;color:#1c1f27">${esc(r[0])}</td><td style="padding:7px 0;border-bottom:1px solid #C9D9EE;${B};font-size:14px;color:#3A3F4D">${esc(r[1])}</td><td align="right" style="padding:7px 0;border-bottom:1px solid #C9D9EE;${B};font-size:15px;font-weight:700;color:#1c1f27">${esc(r[2])}</td></tr>`).join('');
    mid = `<tr><td class="pad" style="padding:14px 28px 0">${sec(t.table.t)}</td></tr><tr><td style="padding:12px 22px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SOFT};border-radius:10px"><tr><td style="padding:12px 18px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${th}</tr>${tr}</table><div style="${B};font-size:11px;line-height:1.4;color:#5b6070;margin-top:8px">${esc(t.table.note)}</div></td></tr></table></td></tr>`;
  }
  const pill = b => `<td class="col" width="25%" valign="top" align="center" style="padding:14px 6px"><img src="${ico('w-' + b[0])}" width="40" height="40" alt="" style="display:block;width:40px;height:40px;margin:0 auto"><div style="${B};font-weight:700;font-size:13px;line-height:1.3;color:#fff;margin-top:8px">${esc(b[1])}</div><div style="${B};font-size:12px;line-height:1.3;color:#9DBBE0;margin-top:2px">${esc(b[2])}</div></td>`;
  const html = `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t.s(emp))}</title>
<style>@media (max-width:520px){.col{display:block!important;width:100%!important}.pad{padding-left:16px!important;padding-right:16px!important}}</style></head>
<body style="margin:0;padding:0;background:#E3EAF3"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#E3EAF3">${esc(t.pre)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E3EAF3"><tr><td align="center" style="padding:18px 10px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td><a href="${href}"><img src="${SITE}/assets/email/camp-hero-${n}-${L}.jpg" width="600" alt="${esc(t.hero)}" style="display:block;width:100%;height:auto;border:0"></a></td></tr>
<tr><td class="pad" style="padding:24px 28px 4px;${B};font-size:16px;line-height:1.55;color:#1c1f27"><p style="margin:0 0 12px">${esc(C.hi(emp))}</p>${paras.map(x => `<p style="margin:0 0 12px">${esc(x)}</p>`).join('')}</td></tr>
${mid}
<tr><td align="center" style="padding:18px 28px 6px"><a href="${href}" style="display:inline-block;background:${ORANGE};color:#fff;text-decoration:none;${H};font-weight:800;font-size:20px;line-height:1;letter-spacing:.08em;text-transform:uppercase;padding:16px 30px;border-radius:8px">${esc(t.cta)} &rarr;</a><div style="${B};font-size:14px;line-height:1.4;color:#3A3F4D;margin-top:12px">${esc(C.contact)} <a href="${C.docs}" style="color:${BLUE}">${esc(C.sds)}</a></div></td></tr>
<tr><td class="pad" style="padding:14px 28px 20px;${B};font-size:14px;line-height:1.5;color:#3A3F4D">${esc(C.sig).replace(/\n/g, '<br>')}</td></tr>
<tr><td style="background:${NAVY};padding:6px 14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${C.bar.map(pill).join('')}</tr></table></td></tr>
<tr><td class="pad" style="background:${SOFT};padding:16px 28px;${B};font-size:12px;line-height:1.55;color:#5b6070"><div style="font-weight:700;margin-bottom:4px">${esc(C.legalTitle)}</div>${C.legal.map(x => `<div style="margin-bottom:4px">${esc(x)}</div>`).join('')}</td></tr>
<tr><td class="pad" style="background:#0F1117;padding:16px 28px;${B};font-size:12px;line-height:1.5;color:#9aa0ab">${esc(C.foot(emp))}<br><a href="${unsubHref}" style="color:#E8743B">${esc(C.unsub)}</a></td></tr>
</table></td></tr></table></body></html>`;
  const body = (t.list ? `${t.listT.toUpperCase()}\n${t.list.map(x => `  - ${x[0]}: ${x[1]}`).join('\n')}\n\n` : '') + (t.table ? `${t.table.t}:\n${t.table.rows.map(r => `  ${r[0]} (${r[1]}): ${r[2]}`).join('\n')}\n${t.table.note}\n\n` : '');
  const text = `${C.hi(emp)}\n\n${paras.join('\n\n')}\n\n${body}${t.cta}: ${href}\n${C.contact} ${C.sds}: ${C.docs}\n\n${C.sig}\n\n—\n${C.legalTitle}\n${C.legal.join('\n')}\n\n${C.foot(emp)}`;
  return { s: t.s(emp), b: text, h: html };
}
module.exports = { build };
