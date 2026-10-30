const { redis, toObj } = require('./core');
const PRODUCTS = [
  { slug: 'tfk11-10', sku: 'TFK11-10', name: 'K11 TapaFugas', desc: 'Micro-leak sealant, 10 ml syringe, up to 3 TR', desc_es: 'Sellador de micro-fugas, jeringa 10 ml, hasta 3 TR', units: 192, sds: '/assets/sds/K11-TapaFugas-SDS-EN.pdf' },
  { slug: 'tfk11-co', sku: 'TFK11-CO', name: 'K11 TapaFugas + Adapter', desc: '10 ml syringe + injection adapter', desc_es: 'Jeringa 10 ml + adaptador de inyección', units: 192, sds: '/assets/sds/K11-TapaFugas-SDS-EN.pdf' },
  { slug: 'k11-2in1-11', sku: 'K11-2:1-11', name: 'K11 TapaFugas 2-in-1', desc: 'Sealant + UV tracer, 11 ml syringe', desc_es: 'Sellador + trazador UV, jeringa 11 ml', units: 192, sds: '/assets/sds/K11-TapaFugas-2in1-SDS-EN.pdf' },
  { slug: 'spk11-b35', sku: 'SPK11-B35', name: 'K11 Sella Plus', desc: 'Sealant + lubricant, 35 ml bottle', desc_es: 'Sellador + lubricante, frasco 35 ml', units: 48, sds: '/assets/sds/K11-Sella-Plus-SDS-EN.pdf' },
  { slug: '20002', sku: '20002', name: 'K11 Coupler 1/4"', desc: 'Standard 1/4" service port coupler', desc_es: 'Acople estándar 1/4"', units: 400, sds: null },
  { slug: 'rfk11', sku: 'RFK11', name: 'K11 Revela Fugas', desc: 'UV fluorescent leak detection dye', desc_es: 'Tinte UV fluorescente detector de fugas', units: null, sds: '/assets/sds/K11-Revela-Fugas-SDS-EN.pdf' }
];
const BY = Object.fromEntries(PRODUCTS.map(p => [p.slug, p]));
const SITE = 'https://wylcosolutions.com';
// online: slug→1 si tiene precio en Stripe (lo guarda admin al fijar precio)
async function leerTienda() {
  const [s, o] = await redis([['HGETALL', 'k11:stock'], ['HGETALL', 'k11:online']]);
  const stock = toObj(s), online = toObj(o), sk = !!process.env.STRIPE_SECRET_KEY;
  return PRODUCTS.map(p => {
    const n = Math.max(0, parseInt(stock[p.slug] || '0', 10) || 0), on = sk && online[p.slug] === '1';
    return { ...p, cases_available: n, status: n > 0 ? 'InStock' : 'PreOrder', online: on, buy_url: on && n > 0 ? SITE + '/buy/' + p.slug : null };
  });
}
async function pedidos() {
  const [h] = await redis([['HGETALL', 'k11:pedidos']]);
  return Object.values(toObj(h)).map(x => JSON.parse(x)).sort((a, b) => b.at.localeCompare(a.at));
}
async function pedido(ref) { const [x] = await redis([['HGET', 'k11:pedidos', ref]]); return x ? JSON.parse(x) : null; }
const guardarPedido = o => redis([['HSET', 'k11:pedidos', o.ref, JSON.stringify(o)]]);
// reserva hasta q cajas; devuelve cuántas tomó del stock
async function reservar(slug, q) {
  const [after] = await redis([['HINCRBY', 'k11:stock', slug, -q]]);
  if (after >= 0) return q;
  const back = Math.min(q, -after);
  await redis([['HINCRBY', 'k11:stock', slug, back]]);
  return q - back;
}
const devolver = (slug, q) => q > 0 ? redis([['HINCRBY', 'k11:stock', slug, q]]) : null;
async function devolverPedido(o) { for (const i of o.items || []) await devolver(i.slug, i.reserved || 0); }
module.exports = { PRODUCTS, BY, SITE, leerTienda, pedidos, pedido, guardarPedido, reservar, devolver, devolverPedido };
