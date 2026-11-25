# Wylco — notas persistentes

## Tienda / stock (oct 2026)
- Redis: k11:stock (slug→cajas), k11:online (slug→1 = vende online), k11:pedidos (ref→JSON), k11:sess (checkout session→ref), k11:evt:* (idempotencia webhooks).
- Admin: /admin?k=ADMIN_TOKEN — stock, precio por caja (crea Product id k11_<slug> + Price lookup_key k11_<slug>_case en Stripe), crear/enviar factura, exento de tax, Zelle manual, estados. Cancelar devuelve stock y anula factura.
- /order y /es/order se renderizan en servidor (api/order.js + api/_lib/orderpage.js). order.html raíz = solo vista previa (en .vercelignore).
- /buy/{slug} → api/buy.js crea Checkout Session (cantidad 1..stock, automatic_tax si STRIPE_TAX=1, dirección y tax ID).
- Webhook /api/stripe: checkout.session.completed / async_payment_succeeded / async_payment_failed, invoice.paid / invoice.payment_failed.
- Vars: STRIPE_SECRET_KEY (sk_test_… o rk_…), STRIPE_WEBHOOK_SECRET, STRIPE_TAX=1 (tras activar Stripe Tax), ORDER_TO opcional. La pk_ no se usa.
- Productos/SKUs en api/_lib/tienda.js; helper Stripe en api/_lib/stripe.js.
- Admin v2 (oct 2026): /admin con login por cookie (k11adm). Secciones Ventas / Clientes / Stock (+ detalle venta, cliente, producto, nueva venta). UI en api/_lib/adminui.js.
- Redis extra: k11:clientes (email→JSON, exento por cliente), k11:mov (movimientos de stock). Ventas guardan campo cliente=email. crearVenta() en tienda.js es el único alta de ventas.
- Landing compra distribuidores = /order (api/_lib/orderpage.js): tarjetas con stepper, carrito; "Pagar ahora" → POST /api/checkout (multi-SKU), "Recibir factura" → POST /api/pedido.
- Ganancia (oct 2026): costo por caja en Redis k11:costo (slug→USD, interno, se carga en Stock). Ventas muestra KPI Ganancia = (total − tax) − cajas×costo de ventas pagadas/enviadas, y columna por venta.
- Finanzas (oct 2026): /admin?v=finanzas (api/_lib/finanzas.js) — estado de resultados, por producto/mes/cliente, pendientes, CSV (&csv=1). Períodos p=todo|mes|mesant|trim|anio. Card Ganancia de Ventas linkea acá.
- Pre-pedidos (oct 2026): sumarStock/fijarStock llaman cubrirPrepedidos(slug) → asigna stock FIFO a ventas abiertas, actualiza items (reserved/preorder), historial y mail a ORDER_TO.
- Etiquetas de envío 4×6" (una por caja): /api/etiqueta?ref=… (requiere login admin). Remitente en var SHIP_FROM (líneas separadas por \n).

## Claims suavizados (oct 2026) — temporal hasta tener stock en Miami
Al llegar el producto, revisar con el usuario cuáles se pueden restaurar (solo con respaldo documental):
- "Same-day dispatch before 2 PM EST" → hoy: "Ships from Miami, 2–5 days"
- "Exclusive distributor" → hoy: "Official distributor" (restaurar si hay contrato de exclusividad)
- "NSF approved" → quitado (restaurar solo con certificado NSF)
- "OEM validated 12+ years" → hoy: "12+ years of field use in Latin America" (restaurar con cartas/documentos OEM)
- "ASHRAE 97 certified" → hoy: "Tested per ASHRAE 97" (mantener: es método de ensayo, no certificación)
- "The only 2-in-1 on the US market", "#1", "best", "outperforms [competidor]", tabla con marcas competidoras → quitados (no restaurar sin estudio de mercado/ensayos comparativos)
- "Permanent seal" → "long-lasting seal"
- About 2025: "nationwide distribution, 50 states" → "Miami distribution base"
Archivos: js/i18n.js, pages/*.jsx, páginas estáticas (index.html, products.html, es/*), llms.txt.

## Redes sociales (oct 2026)
- Portal /admin?v=redes: 3 posts/semana (lun tip, mié caso, vie promo) 10:00 ET, bilingüe EN+ES, link a /order con UTM. Se aprueba la semana entera.
- api/_lib/social.js: banco de contenido (12 posts), Redis k11:social (lunes→semana). Publica vía Upload-Post (api.upload-post.com, /api/upload_photos con scheduled_date; vars UPLOADPOST_API_KEY, UPLOADPOST_USER=perfil (default wylco), opc. UPLOADPOST_FB_PAGE, UPLOADPOST_LI_PAGE) a instagram, facebook, linkedin, google_business (interno gmb). Post guarda job_id en p.job. TikTok/YouTube requieren video (pendiente).
- Imágenes 1080×1350 en assets/social/{tip1..4,case1..4,promo1..4}.png. Casos = escenarios típicos, reemplazar por casos reales.
- Usuario aún no tiene cuentas de la marca (30 oct 2026).

## Envío (oct 2026)
- api/_lib/envio.js: Redis k11:envio {caja, gratis} (default 35 USD/caja, gratis desde 2000 USD subtotal). EE.UU. continental + retiro en Miami gratis.
- Checkout Stripe: shipping_options (envío calculado + retiro). Factura: línea de flete (o.flete_manual pisa). Webhook guarda o.flete y o.retiro.
- o.envio_costo = lo que pagó a UPS/FedEx (se carga en detalle de venta) → se resta de la ganancia.

## Mejoras (oct 2026)
- api/_lib/extras.js: mails al cliente (confirmacion, tracking, listo, recordatorio, abandono), portalUrl firmado (HMAC ADMIN_TOKEN), descuento(), chequearMinimo(), feeStripe(). Config en Redis hash k11:cfg (minimo, llegada, desc, gastos, ultimo_mensual).
- api/_lib/adminui2.js: tarjetas despacho/tracking, stockCfg, clienteExtra (cert, desc_pct, repetir), mensual (newsletter), gastos.
- api/portal.js: portal cliente (?e=&t=), sube certificado (mail con adjunto a ORDER_TO), &baja=1 → cliente.nomail.
- api/tareas.js: cron diario 14 UTC, recordatorios de facturas día 3 y 7 (o.recordatorios). Var CRON_SECRET.
- Webhook: checkout.session.expired → mail carrito abandonado (1 por email/semana). o.fee = comisión Stripe real. o.utm desde /order.
- Finanzas: comisiones Stripe, gastos fijos × meses, ganancia neta, tax por estado, origen UTM.

## Precios (oct 2026)
- Fuente única: api/_lib/precios.js (UMD: require en Node, window.K11P en browser). SKU {c costo fábrica/un, p precio base distribuidor, pt tope, s venta sugerida}, DEF supuestos de importación, calcular(), costoCaja().
- Planilla interna: Precios K11.html (reemplaza Costo de importacion + Cuadro de margenes). Ediciones ahí = solo localStorage.
- Admin: si k11:costo no tiene valor, usa costoCaja() (costo real en Miami). Finanzas EXW sale de precios.js.
- 31 oct 2026: Sella Plus = costo dist. $7.20 (caja $345.60), tope $7.70, sugerido $12 (40%). Actualizado en todos los papeles (Margenes, Lista mayorista, Kit, Formulario, Comparativo, Cuadro 08) y copias Sitio completo/para-github/Subir a GitHub/Papeleria. Los papeles siguen con valores escritos (no leen precios.js).

## Proveedor / primer embarque (11 nov 2026)
- Proveedor: Proxima Chemical LLC (Austin) / Proxima MX Products (San Luis Potosí). Importador: JJMX Enterprises LLC, 2248 W 77th St, Hialeah FL 33016.
- SO-26-1111-001 (10/11/2026, Net 30, EXW SLP): 12×TFK11-P, 12×SPK11EN-PK48, 12×TFK11 2en1-P (48 pack, $240/$240/$336), 4×CO K11 1/4 (100 pack, $225, origen China). Total $10,692. 1 pallet 114×114×79 cm, 93,5 kg, 10 master cartons 40×29×32 cm (4 inner × 48 = 192 un.).
- precios.js: c = EXW/u Proxima (TF 5.00, 2en1 7.00, Sella 5.00, acople 2.25, TF-CO 7.25); o:'CN' acople → DEF.cn % arancel (estimado 37). Flete/impuestos ESTIMADOS hasta cotización real. Vista: Costo landed SO-26-1111-001.html.
- 11 nov 2026 precios subidos: Sella Plus dist $9.60 (caja $460.80), tope $10.20, sugerido $15.95 · Acople dist $5.95 (caja $2,380), tope $6.40, sugerido $9.95. Ambos ~40% margen Wylco y 40% distribuidor. Actualizado en precios.js y papeles (Kit, Lista, Márgenes, Formulario, Comparativo, Análisis). Stripe: recargar precio por caja en admin Stock.

## Empresa
- 11 nov 2026: Wylco LLC dada de baja. Nueva entidad: Wylco Solutions LLC (Sunbiz en trámite, EIN nuevo pendiente). Factura y opera todo. Web/papelería/facturas/API ya dicen "Wylco Solutions LLC". Marca visible sigue "Wylco · K11 America". Pendiente: Stripe cuenta nueva, banco, DR-1 FL, CBP 5106, Proxima rehacer docs a Wylco Solutions LLC (hoy JJMX).

## Compras (oct 2026)
- /admin?v=compras (api/_lib/compras.js): pedidos a fábrica P1, P2… Redis k11:compras + k11:compras_n. Mix por SKU (cajas + costo fábrica), costos reales del embarque (vacío = estimado de precios.js), estados borrador→pedido→en camino (ETA → cfg llegada)→recibido.
- Recibir: sumarStock (cubre pre-pedidos) + k11:costo = promedio ponderado (stock previo × costo previo + lote).

## Mejoras v3 (31 oct 2026) — api/_lib/mejoras.js
- /admin?v=sistema: chequeo de lanzamiento (Stripe live, webhook, Tax, dominio Resend, CRON_SECRET, backup, stock, precios, prueba e2e, Shippo), backup (descargar/mail/restaurar con RESTAURAR), niveles de precio, origen y caja de envío, registro de cambios.
- Backup diario por mail (cron tareas) → cfg backup_at. Log de auditoría Redis k11:log (LPUSH, 1000).
- Roles: ADMIN_TOKEN_DEPOSITO → solo ventas/stock/tracking/etiquetas, sin costos. depPuede() en mejoras.js.
- Niveles: c.nivel (distribuidor/mayorista/cuenta) + cfg niveles {nivel: pct}; X.descuento toma el mayor.
- Reposición en Stock: ritmo de venta, cfg reorden {transito, cobertura}; alerta semanal (k11:alerta:reorden). Recompra: mail cuando el cliente pasa su frecuencia (c.recompra).
- Shippo (SHIPPO_API_KEY): /admin?v=venta_envio&ref= cotiza, ship_buy compra etiqueta 4×6 → o.label_url, tracking, envio_costo, estado enviado. cfg origen + cfg cajas {slug:{l,w,h,lb}} (medido); si falta usa CAJA_DEF (estimados) en mejoras.js.
- Feed Google Merchant: /merchant.xml (api/_lib/fn/feed.js).

## Funciones Vercel (oct 2026)
- Hobby = máx. 12 funciones. Solo 3: api/admin.js, api/stripe.js (bodyParser false), api/r.js (router). Handlers en api/_lib/fn/*.js (require('../x')). vercel.json: rewrite /api/:fn(buy|checkout|…) → /api/r?fn=:fn; /order, /buy, /catalog.json apuntan directo a /api/r?fn=…
- .vercelignore lista los api/*.js viejos por si siguen en GitHub. Nuevos endpoints: agregarlos a api/_lib/fn + router + rewrite, NO como archivo en api/.

## Muestras (12 nov 2026) — api/_lib/muestras.js
- /admin?v=muestras y bloque remarcado arriba en Inicio (Portal): envío de muestras a prospectos con transportista + tracking (link UPS/FedEx/USPS), estados Preparando→Enviada→En camino→Entregada→Probando→Le gustó→Compró/No interesa.
- Redis hash k11:muestras (id→JSON). Stock de muestras aparte del de venta (30/30/30 iniciales, constante INI).
- Seguimiento: al entregarse (manual o por Shippo) "llamar" = +3 días; "Ya hablé" lo corre +7. Botón Mandar tracking por mail al destinatario.
- Cron tareas.js: actualiza tracking en camino (si hay SHIPPO_API_KEY) y manda mail a ORDER_TO con quién llamar hoy.
- Rol depósito no ve ni toca muestras. La planilla local Muestras.html (localStorage) queda como herramienta de campo.
- Muestras con origen Dealer/Podcast (campo origen + ep = episodio/invitado): filtro y contador Podcast en el bloque de Inicio; mail de tracking en español para Podcast.
- Podcasts AHR Expo 2027 (Podcast Pavilion): origen=Podcast, botón "Cargar podcasts del AHR Expo (9)" en /admin?v=muestras crea los 9 (ids POD-*, idempotente) en estado "Por contactar" con texto del mail en inglés para copiar a mano (Miguel envía desde otro Gmail). Flujo: Por contactar → Mail enviado (seguir en 5 días) → Respondió → Preparando → Enviada → En camino → Entregada (llamar en 3 días) → Probando/Le gustó/Compró/No interesa. Mail de tracking siempre en inglés.
- Visitas planeadas (rutas Doral y Dolphin Mall, 9 locales de Muestras.html): botón "Cargar visitas planeadas" crea VIS-* en estado "Por visitar" (1 TapaFugas + 1 2 en 1 + 1 Sella Plus, entrega en mano) + la entrega a Fernando del 11/11. "Entregué muestras" → Entregada y llamar en 3 días.
- Primera apertura de Muestras/Inicio auto-carga (una vez, flag k11:muestras_seed) visitas planeadas + podcasts; vista por defecto "Todo junto".
- Ruta jue 12 nov Hialeah: página Ruta 12 nov Hialeah.html + 6 locales agregados a visitas planeadas (VIS-9..14) y a Muestras.html; flag de autocarga pasó a k11:muestras_seed2.
- Preventa 15% (12 nov): "Propuesta preventa K11.html" (oferta al cliente, EN/ES, cierre 30 nov, pago total ACH/wire/Zelle, reembolsable hasta despacho) y "Preventa 15 K11 analisis.html" (interno, recalcula con el landed). Precios preventa = lista x 0.85.
- Visitas planeadas se cargan en "Por visitar" con 0 muestras (no descuentan stock); "Entregué muestras" las pasa a Entregada con 1/1/1 si estaban en 0. Migración única k11:muestras_fix1 deja en 0 las VIS-* que seguían Por visitar.
- Sin comisión de representante en el negocio Wylco: precios.js DEF.rep = 0 (antes 5) y las páginas Costo landed / Preventa fuerzan rep=0.
- Flete SO-26-1111-001 cotizado (17-nov-2026): marítimo LCL SLP→Veracruz→Miami USD 1.316,90 CFR, 14 días (cot. 00019834, vence 30/11); Altamira USD 1.302,30, 51 días. Más ISF 100 y HMF 0,125% (en precios.js). Falta cotizar descarga/entrega Miami (whs=0). Valores en api/_lib/precios.js.
- Wylco Solutions LLC (Sunbiz): Document Number L26000571912, presentada 12-nov-2026, vigente desde 11-nov-2026, estado ACTIVE. Dirección legal, postal y del agente registrado (Miguel Wyler): 4350 Hillcrest Dr, Apt 220, Hollywood, FL 33021. Sunbiz muestra FEI/EIN 'NONE' (normal: no lo publica). El EIN ya fue obtenido; cargarlo en Stripe, facturas y formularios.
- Managers (MGR) de Wylco Solutions LLC según los artículos de organización: Miguel Wyler y Fernando M Lete. Dirección legal usada en facturas, mails de pedido y documentos comerciales; el sitio público y la etiqueta de envío siguen diciendo Miami.
- Posts post-gira (nov-2026): imágenes en social/pg1..pg6.png (1080×1350), textos en BANK (pg1..pg6) y fechas fijas en FIXED de api/_lib/social.js (20/23/25/27/30-nov y 2-dic, 10:00 ET). El borrador de cada mes se regenera solo cuando cambia PLAN_VER; un mes ya aprobado no se toca.

- Calculadora de dosis: /calculator (EN) y /calculadora (ES), archivo calculator.html. Tabla de dosis del fabricante (k11america.com/productos/tapa-fugas-k11): hasta 3 TR 10 ml, 4 TR 15 ml, 5 TR 20 ml, 8 TR 30 ml, mas de 8 TR 60 ml (diluir en lubricante). Refrigerantes que lista el fabricante para TapaFugas: R-134a, R-404A, R-452A, R-1234yf (el FAQ del sitio dice mas: revisar).

## Paquetes Starter (23 nov 2026)
- Kits en api/_lib/precios.js (KITS: starter-tecnico $260 · starter-mostrador $1,080 · starter-plus $2,150; ~10% sobre el precio por unidad de la caja; ship = cajas equivalentes para el flete). Se venden por /preorder (sección Starter, sin 15%) y Nueva venta del admin; NO en /order ni Stripe Checkout (factura manual: línea con price_data).
- Stock: pool de unidades sueltas Redis k11:sueltas (slug→unidades). tienda.js: reservarKit abre cajas cerradas si faltan sueltas, devolverKit las devuelve al pool, cubrirKits completa pre-pedidos al entrar stock. Items de venta llevan kit:true y precio. Los Starter consumen stock antes que pre-pedidos de cajas completas.
- Costo por paquete: costoCaja() incluye kits. Cajas de envío Shippo estimadas en mejoras.js (CAJA_DEF starter-*).

## Campaña de muestras gratis (24 nov 2026)
- Mail HTML con imagen (api/_lib/muestras_mail.js, plantillas mues1 = grupos B/C/D, mues2 = grupo E lista de acceso anticipado), EN/ES. core.js: armar() delega en muestras_mail para claves mues*, enviar() acepta html. Filas nuevas en data.json (ids 573–1042, una por email único de cont1/nac1; grupo A excluido): B+C 25-nov, D 1-dic, E 4-dic (MAX_POR_DIA 60). Bajas y "respondió" se respetan como siempre.
- Página /samples (y /muestras en español) = api/_lib/fn/muestra.js: elige 1 producto (cupo 15 por SKU, Redis k11:camp con HINCRBY; CAMP_CAP para cambiarlo), datos de envío + encuesta (rol, dónde compra, refrigerantes, fugas/mes, OK para llamar). Un pedido por email (k11:camp_mail). Agotado o grupo E → lista de espera (sin descontar). Guarda en k11:muestras con origen "Campaña" (estado Respondió, seg +2 días), encuesta en notas y en m.camp; marca k11:stop "respondió"; mail de aviso a ORDER_TO y confirmación al cliente.
- Imágenes del mail en assets/email/ (hero-en/es.jpg, p-tf, p-tf2, p-sp-en/es). Sin afirmaciones de refrigerantes (pendiente confirmar con Luca). El cupo de la campaña es aparte del stock INI de muestras (30 por SKU): revisar que 15 + visitas + podcasts no pasen del stock real.
- 24 nov 2026: 14 contactos nuevos en data.json (ids 1043–1056, fecha 2027-01-04 = en espera, no salen solos): 5 distribuidores (Tropic Supply, United Refrigeration F9 y S4, Johnstone #299, Johnstone Ware Group) con dist1, y 9 contratistas de Hialeah con cont1 en español. Para enviarlos, cambiar la fecha `f` en el panel o en data.json. Las plantillas dist1/cont1 son viejas (gira de noviembre): actualizar el texto antes de enviar. Johnstone #247 y los de Grainger/Carrier/A&A/HD Supply no tienen mail confirmado.
- 25 nov 2026: se descartó el mail de muestras gratis. Nuevo mail de presentación de producto prod1 (api/_lib/producto_mail.js, EN/ES, HTML + texto, con datos legales de Wylco Solutions LLC, aviso EPA 608, guía de dosis del fabricante y baja). core.js armar() delega en producto_mail para claves prod*. Las 480 filas con id > 572 (campaña + 14 contactos nuevos) pasaron a k='prod1' y fecha 2027-01-04 (EN ESPERA: cambiar `f` para programar). La página /samples sigue existiendo pero ningún mail la usa. Dirección postal del pie: constante ADDR en producto_mail.js (2248 W 77th St, Miami; se sacó la de Hollywood a pedido). Diseño inspirado en la ficha Sanhua: portada assets/email/hero-prod-en/es.jpg, íconos en assets/email/ico/. Base definitiva y registro de envíos: planilla "Base definitiva Wylco.xlsx" (bajas: newyorkcoolingcorp, moonlightersmail, prestigeairconditioning, driverhvac).

## Campaña diciembre 2026 (25-nov)
- `api/_lib/campana_mail.js`: mails 2-4 (camp2 prevención, camp3 dosis/BTU, camp4 Starter); sufijo a = distribuidores (A), c = contratistas. Heroes `assets/email/camp-hero-{2,3,4}-{en,es}.jpg`.
- Secuencia por contacto (≥7 días entre mails): A/B/C = prod1,camp2,camp6,camp3,camp5,camp4; D = prod1,camp6,camp5,camp4; E = prod1,camp3. camp5 = Sella Plus azul; camp6 = TapaFugas 2 en 1 con foto de campo bajo luz UV (assets/email/uv-field.jpg). 480 contactos, 1570 envíos, 1-dic-2026 a 19-ene-2027, máx 60/día.
- Interruptor: los rows prod*/camp* NO se envían hasta poner `CAMP_ON=1` en Vercel. camp* se omite si el contacto respondió o se dio de baja.
- Rows históricos (cont/dist/nac) intactos. Calendario completo en data.json.
