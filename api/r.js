// Router único: Vercel Hobby permite máx. 12 funciones. /api/<fn> → /api/r?fn=<fn> (vercel.json). Handlers en api/_lib/fn/.
const H = { buy: () => require('./_lib/fn/buy'), checkout: () => require('./_lib/fn/checkout'), enviar: () => require('./_lib/fn/enviar'), etiqueta: () => require('./_lib/fn/etiqueta'), feed: () => require('./_lib/fn/feed'), order: () => require('./_lib/fn/order'), panel: () => require('./_lib/fn/panel'), pedido: () => require('./_lib/fn/pedido'), portal: () => require('./_lib/fn/portal'), stock: () => require('./_lib/fn/stock'), tareas: () => require('./_lib/fn/tareas'), test: () => require('./_lib/fn/test') };
module.exports = async (req, res) => {
  const fn = String((req.query || {}).fn || '');
  if (!H[fn]) { res.statusCode = 404; return res.end('Not found'); }
  return H[fn]()(req, res);
};
module.exports.config = { maxDuration: 60, api: { bodyParser: { sizeLimit: '6mb' } } };
