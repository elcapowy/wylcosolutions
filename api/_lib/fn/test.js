const { D, armar, enviar, autorizado, pausa } = require('../core');
module.exports = async (req, res) => {
  if (!autorizado(req)) return res.status(401).json({ error: 'no autorizado' });
  const to = req.query.to || 'miguel@wyler.com.ar';
  // ?todas=1 manda solo las plantillas vigentes (prod*/camp*). ?viejas=1 incluye las de la primera ronda (ya enviadas en nov). ?solo=camp filtra por prefijo.
  const todas = req.query.todas === '1';
  try {
    const ids = [];
    if (!todas) ids.push(await enviar(to, '[TEST] Wylco K11 · Resend', 'Mail de prueba enviado vía Resend desde wylcosolutions.com.\n\nSi lo recibís, el dominio y la clave están OK.'));
    else for (const k of Object.keys(D.tpl).filter(k => req.query.solo ? k.startsWith(req.query.solo) : (req.query.viejas === '1' || /^(prod|camp)/.test(k)))) for (const l of ['en', 'es']) {
      const m = armar(k, l, 'Empresa de prueba', 'Miami', 0);
      ids.push(await enviar(to, '[PRUEBA ' + k + '/' + l + '] ' + m.s, m.b, k === 'dist1', m.h)); await pausa(600);
    }
    res.json({ ok: true, to, ids });
  } catch (e) { res.status(500).json({ ok: false, error: String(e.message || e) }); }
};
module.exports.config = { maxDuration: 60 };
