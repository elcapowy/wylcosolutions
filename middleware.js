// Protege con usuario y contraseña la folletería K11 y cualquier página interna.
// Variables en Vercel: MATERIALES_USER y MATERIALES_PASS.
const PRIVADAS = [
  'materiales k11.html', 'kit impresion k11.html', 'flyer distribuidores.html', 'ficha tecnica k11.html',
  'lista de precios mayorista.html', 'margenes distribuidor k11.html', 'carta de presentacion.html',
  'formulario distribuidor y pedido.html', 'tarjeta personal.html', 'doc-page.js'
];

export const config = { matcher: ['/((?!api/|assets/|css/|js/|favicon).*)'] };

export default function middleware(request) {
  const p = decodeURIComponent(new URL(request.url).pathname).toLowerCase();
  const privada = p === '/k11' || p.startsWith('/k11/') || p === '/materiales' || PRIVADAS.includes(p.slice(1));
  if (!privada) return;
  const U = process.env.MATERIALES_USER || 'wylco', P = process.env.MATERIALES_PASS;
  const h = request.headers.get('authorization') || '';
  if (P && h.startsWith('Basic ')) {
    const [u, ...r] = atob(h.slice(6)).split(':');
    if (u === U && r.join(':') === P) return;
  }
  return new Response('Acceso restringido', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Wylco materiales", charset="UTF-8"', 'X-Robots-Tag': 'noindex' } });
}
