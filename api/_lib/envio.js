// Flete: gratis desde un monto; debajo, tarifa fija por caja. Retiro en Miami = sin flete. Config en Redis k11:envio.
const { redis } = require('./core');
// Envío gratis DESACTIVADO (23 nov 2026): el umbral se fija en un monto inalcanzable. Para reactivarlo, poné GRATIS_OFF en false.
const GRATIS_OFF = true, SIN = 1e9;
const DEF = { caja: 35, gratis: GRATIS_OFF ? SIN : 2000 };
async function config() { try { const [x] = await redis([['HGETALL', 'k11:envio']]); const o = {}; if (Array.isArray(x)) for (let i = 0; i < x.length; i += 2) o[x[i]] = +x[i + 1]; else if (x) Object.assign(o, x); return { caja: o.caja >= 0 && o.caja !== undefined && !isNaN(o.caja) ? +o.caja : DEF.caja, gratis: GRATIS_OFF ? SIN : o.gratis > 0 ? +o.gratis : DEF.gratis }; } catch { return { ...DEF }; } }
const guardar = (caja, gratis) => redis([['HSET', 'k11:envio', 'caja', String(caja), 'gratis', String(gratis)]]);
// subtotal en USD, cajas = total de cajas
const flete = (cfg, subtotal, cajas, retiro) => retiro || subtotal >= cfg.gratis ? 0 : Math.round(cajas * cfg.caja * 100) / 100;
module.exports = { config, guardar, flete, DEF };
