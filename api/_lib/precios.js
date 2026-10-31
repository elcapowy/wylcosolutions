// Lista de precios K11 — ÚNICA fuente. La usan: Precios K11.html (planilla), admin (costo por caja por defecto) y finanzas.
// c = costo fábrica (EXW México, por unidad) · p = precio base a distribuidor · pt = tope del rango · s = venta sugerida al público
(function (root) {
  const SKU = [
    { slug: 'tfk11-10', id: 'TFK11-10', n: 'TapaFugas K11', d: 'Jeringa 10 ml · 3 TR', u: 192, c: 6.30, p: 15.75, pt: 16.85, s: 29.95 },
    { slug: 'tfk11-co', id: 'TFK11-CO', n: 'TapaFugas + Conector', d: 'Jeringa 10 ml + adaptador', u: 192, c: 7.80, p: 19.40, pt: 20.80, s: 34.95 },
    { slug: 'k11-2in1-11', id: 'K11-2:1-11', n: 'TapaFugas 2-en-1', d: 'Jeringa 11 ml', u: 192, c: 7.80, p: 19.60, pt: 21.00, s: 34.95 },
    { slug: 'spk11-b35', id: 'SPK11-B35', n: 'Sella Plus K11', d: 'Botella 35 ml', u: 48, c: 5.00, p: 7.20, pt: 7.70, s: 12.00 },
    { slug: '20002', id: '20002', n: 'Coupler 1/4"', d: 'Acople', u: 400, c: 1.50, p: 1.50, pt: 1.50, s: 3.95 }
  ];
  // Supuestos de importación (por embarque) y venta. q = cajas por SKU en el embarque tipo.
  const DEF = { usmca: 1, mfn: 5, s301: 10, freight: 1500, mxbroker: 250, ins: 0.5, whs: 200, local: 0, usbroker: 175, bond: 125, rep: 5, pay: 0, disc: 0, itax: 26.5, q: [10, 5, 10, 20, 2] };

  function calcular(S, sku) {
    S = Object.assign({}, DEF, S || {}); sku = sku || SKU;
    const lines = sku.map((s, i) => { const cases = +((S.q || [])[i]) || 0, units = cases * s.u; return { ...s, cases, units, exw: units * s.c }; });
    const V = lines.reduce((a, l) => a + l.exw, 0), u = +S.usmca === 1;
    const duty = u ? 0 : V * (S.mfn + S.s301) / 100, mpf = u || !V ? 0 : Math.min(670.86, Math.max(34.58, V * 0.003464)), ins = V * S.ins / 100;
    const C = [['Flete México → Miami', +S.freight], ['Despacho de exportación MX', +S.mxbroker], ['Seguro de carga', ins], ['Aranceles (MFN + Sección 301)', duty], ['Tasa MPF', mpf], ['Despachante EE. UU.', +S.usbroker], ['Bono de aduana', +S.bond], ['Recepción y almacenaje Miami', +S.whs]];
    const imp = C.reduce((a, c) => a + c[1], 0), f = V ? imp / V : 0, comPct = (S.rep + S.pay + S.local) / 100, disc = S.disc / 100;
    const rows = lines.map(l => {
      const iu = l.c * f, land = l.c + iu, pn = l.p * (1 - disc), com = pn * comPct, g = pn - land - com;
      return { ...l, iu, land, landCase: land * l.u, pn, com, g, gCase: g * l.u, mc: l.p ? (l.p - l.c) / l.p : 0, mr: pn ? g / pn : 0, gd: l.s - l.p, md: l.s ? (l.s - l.p) / l.s : 0 };
    });
    return { S, rows, C, V, imp, f };
  }
  // Costo real por caja (puesto en Miami) con los supuestos por defecto — lo usa el admin si no cargaste uno a mano.
  const costoCaja = () => Object.fromEntries(calcular().rows.map(r => [r.slug, Math.round(r.landCase * 100) / 100]));
  const API = { SKU, DEF, calcular, costoCaja, fecha: '2026-10-31' };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.K11P = API;
})(typeof window !== 'undefined' ? window : this);
