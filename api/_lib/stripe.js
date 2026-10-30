// Stripe REST sin SDK. Claves solo en variables de Vercel.
const SK = process.env.STRIPE_SECRET_KEY || '';
const TAX = process.env.STRIPE_TAX === '1';
const MODE = SK.startsWith('sk_live') || SK.startsWith('rk_live') ? 'live' : SK ? 'test' : 'off';
const TAX_CODE = process.env.STRIPE_TAX_CODE || 'txcd_99999999'; // bienes tangibles generales

function flat(o, pre, out = []) {
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null) continue;
    const key = pre ? `${pre}[${k}]` : k;
    if (typeof v === 'object') flat(v, key, out); else out.push([key, String(v)]);
  }
  return out;
}
async function stripe(path, params, method) {
  if (!SK) throw new Error('Falta STRIPE_SECRET_KEY en Vercel');
  const m = method || (params ? 'POST' : 'GET');
  let url = 'https://api.stripe.com/v1/' + path, body;
  const qs = params ? new URLSearchParams(flat(params)).toString() : '';
  if (m === 'GET' && qs) url += (url.includes('?') ? '&' : '?') + qs; else if (qs) body = qs;
  const r = await fetch(url, { method: m, body, headers: { Authorization: 'Bearer ' + SK, 'Content-Type': 'application/x-www-form-urlencoded', 'Stripe-Version': '2024-06-20' } });
  const j = await r.json();
  if (j.error) { const e = new Error(j.error.message); e.code = j.error.code; throw e; }
  return j;
}
const lookup = slug => 'k11_' + slug + '_case';
async function precios(slugs) {
  if (!SK) return {};
  const p = {}; slugs.forEach((s, i) => p[`lookup_keys[${i}]`] = lookup(s));
  const r = await stripe('prices?active=true&limit=20&' + new URLSearchParams(p).toString());
  const out = {}; for (const x of r.data) out[x.lookup_key.replace(/^k11_|_case$/g, '')] = x;
  return out;
}
// Crea/actualiza producto (id fijo) y un precio nuevo por caja; el anterior queda archivado
async function fijarPrecio(prod, usd) {
  const id = 'k11_' + prod.slug.replace(/[^a-z0-9]/g, '_');
  const info = { name: `${prod.name} — case${prod.units ? ' of ' + prod.units : ''}`, description: `${prod.sku} · ${prod.desc}`, tax_code: TAX_CODE, metadata: { sku: prod.sku, slug: prod.slug } };
  try { await stripe('products', { id, ...info }); } catch (e) { if (e.code === 'resource_already_exists') await stripe('products/' + id, info); else throw e; }
  return stripe('prices', { product: id, currency: 'usd', unit_amount: Math.round(usd * 100), tax_behavior: 'exclusive', lookup_key: lookup(prod.slug), transfer_lookup_key: true, metadata: { slug: prod.slug } });
}
module.exports = { stripe, precios, fijarPrecio, lookup, SK, TAX, MODE };
