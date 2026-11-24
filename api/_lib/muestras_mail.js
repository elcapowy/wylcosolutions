// Campaña "muestra gratis" (nov 2026): mail HTML + texto, EN/ES, dos variantes.
//   mues1 = grupos B/C/D (sur y resto de Florida): pedir la muestra gratis (cupo 15 por producto).
//   mues2 = grupo E (otros estados): lista de acceso anticipado (las muestras salen primero en Florida).
// El botón lleva a /samples?r=<id> (el id solo identifica la fila para saber el segmento; no lleva datos personales).
const SITE = 'https://wylcosolutions.com';
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const T = {
  en: {
    mues1: {
      s: e => `Free K11 sample for ${e} · only 15 of each`,
      pre: 'Test it on a real job. Takes 2 minutes to request. Ships from Miami.',
      hi: e => `Hi ${e} team,`,
      p1: 'A few weeks ago I wrote to you about K11, the HVAC-R leak line we are launching in the United States. Now you can try it yourself, free.',
      pick: 'Pick one sample:',
      p: [['TapaFugas K11', '10 ml syringe, for systems up to 3 TR. Leak sealant for HVAC-R.'], ['TapaFugas 2-in-1', 'Seals micro-leaks and leaves UV dye at the leak point, in one injection.'], ['Sella Plus', '35 ml sealant for flanges, connections and gaskets.']],
      cta: 'Pick my free sample',
      steps: ['Pick your sample.', 'Tell us where to ship it (2 minutes).', 'Try it on a real job and tell us honestly how it went, good or bad.'],
      lim: 'We only have 15 samples of each product, first come, first served.',
      who: 'For HVAC-R contractors and shops.'
    },
    mues2: {
      s: e => `K11 early access for ${e} · free samples going out now`,
      pre: 'Samples go first to South Florida. Join the list for your area.',
      hi: e => `Hi ${e} team,`,
      p1: 'A few weeks ago I wrote to you about K11, the HVAC-R leak line we are launching in the United States. Our first free samples are going to South Florida, and we are building the list for the next markets.',
      pick: 'Tell us which one you would test first:',
      p: [['TapaFugas K11', '10 ml syringe, for systems up to 3 TR. Leak sealant for HVAC-R.'], ['TapaFugas 2-in-1', 'Seals micro-leaks and leaves UV dye at the leak point, in one injection.'], ['Sella Plus', '35 ml sealant for flanges, connections and gaskets.']],
      cta: 'Join the early-access list',
      steps: ['Pick the product you would test.', 'Tell us where you buy your supplies (2 minutes).', 'We write to you as soon as K11 and samples reach your area.'],
      lim: 'Samples are limited. Joining the list does not guarantee one.',
      who: 'For HVAC-R contractors and shops.'
    },
    foot: e => `You are receiving this because ${e} is listed as an HVAC business. Reply "unsubscribe" and we will not write again.`,
    sig: 'Fernando Lete · Wylco Solutions\n+1 (954) 881-8870 (call / WhatsApp)\ninfo@wylcosolutions.com · wylcosolutions.com',
    hero: 'Free K11 sample: only 15 of each product'
  },
  es: {
    mues1: {
      s: e => `Muestra gratis de K11 para ${e} · solo 15 de cada una`,
      pre: 'Pruébela en un trabajo real. Pedirla toma 2 minutos. Sale de Miami.',
      hi: e => `Hola, equipo de ${e}:`,
      p1: 'Hace unas semanas les escribí sobre K11, la línea de soluciones para fugas HVAC-R que lanzamos en Estados Unidos. Ahora pueden probarla ustedes mismos, gratis.',
      pick: 'Elijan una muestra:',
      p: [['TapaFugas K11', 'Jeringa de 10 ml, para equipos de hasta 3 TR. Sellador de fugas HVAC-R.'], ['TapaFugas 2 en 1', 'Sella micro-fugas y deja tinte UV en el punto de la fuga, en una sola inyección.'], ['Sella Plus', 'Sellador de 35 ml para bridas, conexiones y juntas.']],
      cta: 'Elegir mi muestra gratis',
      steps: ['Elijan su muestra.', 'Díganos adónde enviarla (2 minutos).', 'Pruébenla en un trabajo real y cuéntennos con franqueza cómo les fue, bueno o malo.'],
      lim: 'Tenemos solo 15 muestras de cada producto, por orden de llegada.',
      who: 'Para contratistas y talleres de HVAC-R.'
    },
    mues2: {
      s: e => `Acceso anticipado a K11 para ${e} · muestras gratis`,
      pre: 'Las muestras salen primero al sur de Florida. Súmese a la lista de su zona.',
      hi: e => `Hola, equipo de ${e}:`,
      p1: 'Hace unas semanas les escribí sobre K11, la línea de soluciones para fugas HVAC-R que lanzamos en Estados Unidos. Las primeras muestras gratis salen al sur de Florida y estamos armando la lista para los próximos mercados.',
      pick: 'Cuéntennos cuál probarían primero:',
      p: [['TapaFugas K11', 'Jeringa de 10 ml, para equipos de hasta 3 TR. Sellador de fugas HVAC-R.'], ['TapaFugas 2 en 1', 'Sella micro-fugas y deja tinte UV en el punto de la fuga, en una sola inyección.'], ['Sella Plus', 'Sellador de 35 ml para bridas, conexiones y juntas.']],
      cta: 'Sumarme a la lista de acceso anticipado',
      steps: ['Elijan el producto que probarían.', 'Cuéntennos dónde compran sus insumos (2 minutos).', 'Les escribimos apenas K11 y las muestras lleguen a su zona.'],
      lim: 'Las muestras son limitadas. Sumarse a la lista no garantiza una.',
      who: 'Para contratistas y talleres de HVAC-R.'
    },
    foot: e => `Recibe este mensaje porque ${e} figura como empresa de HVAC. Responda "baja" y no volveremos a escribirle.`,
    sig: 'Fernando Lete · Wylco Solutions\n+1 (954) 881-8870 (llamada / WhatsApp)\ninfo@wylcosolutions.com · wylcosolutions.com',
    hero: 'Muestra gratis de K11: solo 15 de cada producto'
  }
};

const ADDR = 'Wylco Solutions LLC · 2248 W 77th St., Miami, FL 33016';

function build(k, lang, emp, id) {
  const L = lang === 'es' ? 'es' : 'en', c = T[L], t = c[k] || c.mues1;
  const link = `${SITE}/samples?r=${encodeURIComponent(id || '')}&lang=${L}`;
  const heroUrl = `${SITE}/assets/email/hero-${L}.jpg`;
  const imgs = [`${SITE}/assets/email/p-tf.jpg`, `${SITE}/assets/email/p-tf2.jpg`, L === 'es' ? `${SITE}/assets/email/p-sp-es.jpg` : `${SITE}/assets/email/p-sp-en.jpg`];
  const card = (i) => `<td width="33%" valign="top" style="padding:0 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;border-radius:10px"><tr><td align="center" style="padding:14px 10px 6px"><img src="${imgs[i]}" width="120" height="120" alt="${esc(t.p[i][0])}" style="display:block;width:120px;height:120px;object-fit:contain"></td></tr><tr><td style="padding:0 12px 14px;text-align:center"><div style="font:800 15px/1.15 'Barlow Condensed',Arial Narrow,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#0F1117">${esc(t.p[i][0].replace(/-/g, '\u2011'))}</div><div style="font:13px/1.4 Arial,Helvetica,sans-serif;color:#3A3F4D;margin-top:6px">${esc(t.p[i][1])}</div></td></tr></table></td>`;
  const step = (n, s) => `<tr><td width="34" valign="top" style="padding:6px 0"><div style="width:26px;height:26px;border-radius:50%;background:#D4541A;color:#fff;text-align:center;font:700 14px/26px Arial,Helvetica,sans-serif">${n}</div></td><td style="padding:6px 0;font:15px/1.45 Arial,Helvetica,sans-serif;color:#1c1f27">${esc(s)}</td></tr>`;
  const html = `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t.s(emp))}</title></head>
<body style="margin:0;padding:0;background:#EDE6DA"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EDE6DA">${esc(t.pre)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDE6DA"><tr><td align="center" style="padding:18px 10px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td><a href="${link}"><img src="${heroUrl}" width="600" alt="${esc(c.hero)}" style="display:block;width:100%;height:auto;border:0"></a></td></tr>
<tr><td style="padding:26px 28px 6px;font:16px/1.55 Arial,Helvetica,sans-serif;color:#1c1f27"><p style="margin:0 0 12px">${esc(t.hi(emp))}</p><p style="margin:0 0 12px">${esc(t.p1)}</p><p style="margin:0 0 4px;font-weight:700">${esc(t.pick)}</p></td></tr>
<tr><td style="padding:8px 22px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${card(0)}${card(1)}${card(2)}</tr></table></td></tr>
<tr><td align="center" style="padding:20px 28px 6px"><a href="${link}" style="display:inline-block;background:#D4541A;color:#fff;text-decoration:none;font:800 20px/1 'Barlow Condensed',Arial Narrow,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:16px 34px;border-radius:8px">${esc(t.cta)} &rarr;</a><div style="font:700 14px/1.4 Arial,Helvetica,sans-serif;color:#B84417;margin-top:12px">${esc(t.lim)}</div></td></tr>
<tr><td style="padding:14px 28px 6px"><table role="presentation" cellpadding="0" cellspacing="0">${t.steps.map((s, i) => step(i + 1, s)).join('')}</table></td></tr>
<tr><td style="padding:14px 28px 22px;font:14px/1.5 Arial,Helvetica,sans-serif;color:#3A3F4D">${esc(t.who)}<br><br>${esc(c.sig).replace(/\n/g, '<br>')}</td></tr>
<tr><td style="background:#0F1117;padding:16px 28px;font:12px/1.5 Arial,Helvetica,sans-serif;color:#9aa0ab">${esc(c.foot(emp))}<br>${esc(ADDR)}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${t.hi(emp)}\n\n${t.p1}\n\n${t.pick}\n${t.p.map(x => `  - ${x[0]}: ${x[1]}`).join('\n')}\n\n${t.cta}: ${link}\n${t.lim}\n\n${t.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${t.who}\n\n${c.sig}\n\n—\n${c.foot(emp)}\n${ADDR}`;
  return { s: t.s(emp), b: text, h: html };
}
module.exports = { build, SITE };
