const { redis, toObj } = require('./core');
const PRODUCTS = [
  { slug: 'tfk11-10', sku: 'TFK11-10', name: 'K11 TapaFugas', desc: 'Micro-leak sealant, 10 ml syringe, up to 3 TR', desc_es: 'Sellador de micro-fugas, jeringa 10 ml, hasta 3 TR', units: 192, img: '/assets/products/tfk11-box.png', sds: '/assets/sds/K11-TapaFugas-SDS-EN.pdf' },
  { slug: 'tfk11-co', sku: 'TFK11-CO', name: 'K11 TapaFugas + Adapter', desc: '10 ml syringe + injection adapter', desc_es: 'Jeringa 10 ml + adaptador de inyección', units: 192, img: '/assets/tile_adapter.png', sds: '/assets/sds/K11-TapaFugas-SDS-EN.pdf' },
  { slug: 'k11-2in1-11', sku: 'K11-2:1-11', name: 'K11 TapaFugas 2-in-1', desc: 'Sealant + UV tracer, 11 ml syringe', desc_es: 'Sellador + trazador UV, jeringa 11 ml', units: 192, img: '/assets/products/tfk11-2in1-box.png', sds: '/assets/sds/K11-TapaFugas-2in1-SDS-EN.pdf' },
  { slug: 'spk11-b35', sku: 'SPK11-B35', name: 'K11 Sella Plus', desc: 'Sealant + lubricant, 35 ml bottle', desc_es: 'Sellador + lubricante, frasco 35 ml', units: 48, img: '/assets/products/sella-plus-en.png', sds: '/assets/sds/K11-Sella-Plus-SDS-EN.pdf' },
  { slug: '20002', sku: '20002', name: 'K11 Coupler 1/4"', desc: 'Standard 1/4" service port coupler', desc_es: 'Acople estándar 1/4"', units: 400, img: '/assets/tile_adapter.png', sds: null },
  { slug: 'rfk11', sku: 'RFK11', name: 'K11 Revela Fugas', desc: 'UV fluorescent leak detection dye', desc_es: 'Tinte UV fluorescente detector de fugas', units: null, img: '/assets/products/rfk11-box.png', sds: '/assets/sds/K11-Revela-Fugas-SDS-EN.pdf' }
];
const BY = Object.fromEntries(PRODUCTS.map(p => [p.slug, p]));
const SITE = 'https://wylcosolutions.com';
const now = () => new Date().toISOString();
const cid = e => String(e || '').trim().toLowerCase();
const CAMPOS_CLIENTE = ['email', 'company', 'contact', 'phone', 'address', 'city', 'state', 'zip', 'business_type', 'ein', 'stripe_customer'];
const parseAll = h => Object.values(toObj(h)).map(x => { try { return JSON.parse(x); } catch { return null; } }).filter(Boolean);

// ── Stock ──
async function leerTienda() {
  const [s, o] = await redis([['HGETALL', 'k11:stock'], ['HGETALL', 'k11:online']]);
  const stock = toObj(s), online = toObj(o), sk = !!process.env.STRIPE_SECRET_KEY;
  return PRODUCTS.map(p => {
    const n = Math.max(0, parseInt(stock[p.slug] || '0', 10) || 0), on = sk && online[p.slug] === '1';
    return { ...p, cases_available: n, status: n > 0 ? 'InStock' : 'PreOrder', online: on, buy_url: on && n > 0 ? SITE + '/buy/' + p.slug : null };
  });
}
async function mov(slug, delta, motivo, ref) {
  if (!delta) return;
  await redis([['LPUSH', 'k11:mov', JSON.stringify({ at: now(), slug, delta, motivo, ref: ref || '' })], ['LTRIM', 'k11:mov', '0', '1999']]);
}
async function movimientos(slug, n = 300) {
  const [l] = await redis([['LRANGE', 'k11:mov', '0', String(n - 1)]]);
  return (l || []).map(x => JSON.parse(x)).filter(m => !slug || m.slug === slug);
}
async function fijarStock(slug, v) {
  const [old] = await redis([['HGET', 'k11:stock', slug]]);
  await redis([['HSET', 'k11:stock', slug, String(v)]]);
  await mov(slug, v - (parseInt(old || '0', 10) || 0), 'inventario');
  return cubrirPrepedidos(slug);
}
async function sumarStock(slug, v, motivo) { await redis([['HINCRBY', 'k11:stock', slug, v]]); await mov(slug, v, motivo || (v > 0 ? 'ingreso' : 'ajuste')); return v > 0 ? cubrirPrepedidos(slug) : []; }
// Al entrar stock: asigna cajas a los pre-pedidos abiertos, del más viejo al más nuevo
async function cubrirPrepedidos(slug) {
  const ps = (await pedidos()).filter(o => !['enviado', 'cancelado'].includes(o.estado) && (o.items || []).some(i => i.slug === slug && i.preorder > 0)).sort((a, b) => a.at.localeCompare(b.at));
  const out = [];
  for (const o of ps) {
    const i = o.items.find(x => x.slug === slug && x.preorder > 0);
    const r = await reservar(slug, i.preorder, o.ref); if (!r) break;
    i.reserved = (i.reserved || 0) + r; i.preorder -= r;
    const listo = o.items.every(x => !x.preorder);
    hist(o, `Stock asignado: ${r} caja(s) ${i.sku} de pre-pedido${listo ? ' · pedido completo, listo para despachar' : ''}`);
    await guardarPedido(o); out.push({ ref: o.ref, company: o.company, email: o.email, sku: i.sku, cajas: r, listo });
    if (i.preorder) break;
  }
  return out;
}
// reserva hasta q cajas; devuelve cuántas tomó del stock
async function reservar(slug, q, ref) {
  const [after] = await redis([['HINCRBY', 'k11:stock', slug, -q]]);
  let r = q;
  if (after < 0) { const back = Math.min(q, -after); await redis([['HINCRBY', 'k11:stock', slug, back]]); r = q - back; }
  await mov(slug, -r, 'venta', ref);
  return r;
}
async function devolver(slug, q, ref) { if (q > 0) { await redis([['HINCRBY', 'k11:stock', slug, q]]); await mov(slug, q, 'devolución', ref); } }
async function devolverPedido(o) { for (const i of o.items || []) await devolver(i.slug, i.reserved || 0, o.ref); }

// ── Clientes ──
async function clientes() { const [h] = await redis([['HGETALL', 'k11:clientes']]); return parseAll(h); }
async function cliente(id) { const [x] = await redis([['HGET', 'k11:clientes', cid(id)]]); return x ? JSON.parse(x) : null; }
const guardarCliente = c => redis([['HSET', 'k11:clientes', c.id, JSON.stringify(c)]]);
async function upsertCliente(d) {
  const id = cid(d.email); if (!id) return null;
  const c = (await cliente(id)) || { id, alta: now(), exento: false, notas: '' };
  for (const k of CAMPOS_CLIENTE) if (d[k] != null && String(d[k]).trim() !== '') c[k] = String(d[k]).trim();
  c.email = id;
  await guardarCliente(c);
  return c;
}

// ── Ventas ──
async function pedidos() { const [h] = await redis([['HGETALL', 'k11:pedidos']]); return parseAll(h).sort((a, b) => b.at.localeCompare(a.at)); }
async function pedido(ref) { if (!ref) return null; const [x] = await redis([['HGET', 'k11:pedidos', ref]]); return x ? JSON.parse(x) : null; }
const guardarPedido = o => redis([['HSET', 'k11:pedidos', o.ref, JSON.stringify(o)]]);
const hist = (o, txt) => { (o.hist = o.hist || []).push({ at: now(), txt }); };
// Crea una venta: alta/actualiza cliente, reserva stock, guarda pedido
async function crearVenta({ datos, items, origen, estado, ref, extra }) {
  const c = await upsertCliente(datos);
  ref = ref || 'K11-' + Date.now().toString(36).toUpperCase();
  const out = [];
  for (const { slug, q } of items) { const p = BY[slug]; if (!p || !q) continue; const r = await reservar(slug, q, ref); out.push({ slug, sku: p.sku, name: p.name, cases: q, reserved: r, preorder: q - r }); }
  const o = { ref, at: now(), estado: estado || 'nuevo', origen, cliente: c ? c.id : '', ...pick(datos, ['company', 'contact', 'email', 'phone', 'address', 'city', 'state', 'zip', 'business_type', 'ein', 'payment', 'notes']), items: out, ...(extra || {}) };
  if (c && c.stripe_customer && !o.stripe_customer) o.stripe_customer = c.stripe_customer;
  hist(o, 'Venta creada (' + origen + ')' + (out.some(i => i.preorder) ? ' · incluye pre-pedido' : ''));
  await guardarPedido(o);
  return o;
}
const pick = (o, ks) => { const r = {}; for (const k of ks) if (o && o[k] != null && o[k] !== '') r[k] = o[k]; return r; };

module.exports = { cubrirPrepedidos, PRODUCTS, BY, SITE, cid, leerTienda, mov, movimientos, fijarStock, sumarStock, reservar, devolver, devolverPedido, clientes, cliente, guardarCliente, upsertCliente, pedidos, pedido, guardarPedido, hist, crearVenta };
