// Lista de precios K11 — ÚNICA fuente. La usan: Precios K11.html (planilla), admin (costo por caja por defecto) y finanzas.
// c = costo fábrica (EXW San Luis Potosí, por unidad — lista Proxima JJMX 10-nov-2026) · o = origen (CN = no califica T-MEC) · p = precio base a distribuidor · pt = tope del rango · s = venta sugerida al público
(function (root) {
  const SKU = [
    { slug: 'tfk11-10', id: 'TFK11-10', n: 'TapaFugas K11', d: 'Jeringa 10 ml · 3 TR', u: 192, c: 5.00, p: 15.75, pt: 16.85, s: 29.95 },
    { slug: 'tfk11-co', id: 'TFK11-CO', n: 'TapaFugas + Conector', d: 'Jeringa 10 ml + adaptador', u: 192, c: 7.25, p: 19.40, pt: 20.80, s: 34.95 },
    { slug: 'k11-2in1-11', id: 'K11-2:1-11', n: 'TapaFugas 2-en-1', d: 'Jeringa 10 ml', u: 192, c: 7.00, p: 19.60, pt: 21.00, s: 34.95 },
    { slug: 'spk11-b35', id: 'SPK11-B35', n: 'Sella Plus K11', d: 'Botella 35 ml', u: 48, c: 5.00, p: 9.60, pt: 10.20, s: 15.95 },
    { slug: '20002', id: '20002', n: 'Coupler 1/4"', d: 'Acople', u: 400, c: 2.25, o: 'CN', p: 5.95, pt: 6.40, s: 9.95 }
  ];
  // Paquetes Starter (nov 2026): unidades sueltas a precio cerrado (~15% sobre la caja de lista). comp = unidades por SKU; ship = cajas equivalentes para el flete.
  const KITS = [
    { slug: 'starter-tecnico', id: 'STARTER-TECH', n: 'Starter Técnico', en: 'Starter Pack · Technician', comp: { 'tfk11-10': 6, 'k11-2in1-11': 6, 'spk11-b35': 2, '20002': 1 }, price: 275, ship: 0.35 },
    { slug: 'starter-mostrador', id: 'STARTER-COUNTER', n: 'Starter Mostrador', en: 'Starter Pack · Counter', comp: { 'tfk11-10': 24, 'k11-2in1-11': 24, 'spk11-b35': 12, '20002': 4 }, price: 1135, ship: 0.6 },
    { slug: 'starter-plus', id: 'STARTER-PLUS', n: 'Starter Plus', en: 'Starter Pack · Plus', comp: { 'tfk11-10': 48, 'k11-2in1-11': 48, 'spk11-b35': 24, '20002': 8 }, price: 2275, ship: 0.9 }
  ];
  // Supuestos de importación (por embarque) y venta. q = cajas por SKU — primer embarque SO-26-1111-001 (1 pallet, marítimo LCL San Luis Potosí → Veracruz → Miami, cotización 00019834: USD 1.316,90 CFR; ISF 100 aparte). whs=400: reserva ESTIMADA de descarga en Miami + entrega a Hialeah (sin cotizar). usmca=1 supone certificado T-MEC de Proxima; con 0 el arancel pasa de $333 a ~$1.802.
  // cn = arancel total % para origen China (MFN 2 + Sección 301 25 + IEEPA 10) — ESTIMADO, confirmar con el despachante.
  const DEF = { usmca: 1, mfn: 5, s301: 10, cn: 37, freight: 1316.90, isf: 100, hmf: 0.125, mxbroker: 250, ins: 0.5, whs: 400, local: 0, usbroker: 175, bond: 100, rep: 0, pay: 0, disc: 0, itax: 26.5, q: [3, 0, 3, 12, 1] };

  function calcular(S, sku) {
    S = Object.assign({}, DEF, S || {}); sku = sku || SKU;
    const lines = sku.map((s, i) => { const cases = +((S.q || [])[i]) || 0, units = cases * s.u; return { ...s, cases, units, exw: units * s.c }; });
    const V = lines.reduce((a, l) => a + l.exw, 0), u = +S.usmca === 1;
    const dl = l => l.o === 'CN' ? l.exw * (+S.cn || 0) / 100 : u ? 0 : l.exw * (S.mfn + S.s301) / 100; // arancel por línea
    const NO = lines.reduce((a, l) => a + (u && l.o !== 'CN' ? 0 : l.exw), 0); // valor que no califica T-MEC
    const duty = lines.reduce((a, l) => a + dl(l), 0), mpf = !NO ? 0 : Math.min(670.86, Math.max(34.58, NO * 0.003464)), ins = V * S.ins / 100;
    const C = [['Flete México → Miami', +S.freight], ['Despacho de exportación MX', +S.mxbroker], ['Seguro de carga', ins], ['ISF (declaración de seguridad)', +S.isf || 0], ['HMF (tasa de puerto)', V * (+S.hmf || 0) / 100], ['Aranceles (MFN + Sección 301)', duty], ['Tasa MPF', mpf], ['Despachante EE. UU.', +S.usbroker], ['Bono de aduana', +S.bond], ['Recepción y almacenaje Miami', +S.whs]];
    const imp = C.reduce((a, c) => a + c[1], 0), f = V ? imp / V : 0, fx = V ? (imp - duty - mpf) / V : 0, comPct = (S.rep + S.pay + S.local) / 100, disc = S.disc / 100;
    const rows = lines.map(l => {
      const iu = l.c * fx + (l.units ? (dl(l) + (NO && (!u || l.o === 'CN') ? mpf * l.exw / NO : 0)) / l.units : 0), land = l.c + iu, pn = l.p * (1 - disc), com = pn * comPct, g = pn - land - com;
      return { ...l, iu, land, landCase: land * l.u, pn, com, g, gCase: g * l.u, mc: l.p ? (l.p - l.c) / l.p : 0, mr: pn ? g / pn : 0, gd: l.s - l.p, md: l.s ? (l.s - l.p) / l.s : 0 };
    });
    return { S, rows, C, V, imp, f };
  }
  // Costo real por caja (puesto en Miami) con los supuestos por defecto — lo usa el admin si no cargaste uno a mano.
  const costoCaja = () => { const rows = calcular().rows, o = Object.fromEntries(rows.map(r => [r.slug, Math.round(r.landCase * 100) / 100])); for (const k of KITS) o[k.slug] = Math.round(Object.entries(k.comp).reduce((a, [s, q]) => a + q * ((rows.find(r => r.slug === s) || {}).land || 0), 0) * 100) / 100; return o; };
  const API = { SKU, KITS, DEF, calcular, costoCaja, fecha: '2026-11-11' };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.K11P = API;
})(typeof window !== 'undefined' ? window : this);
