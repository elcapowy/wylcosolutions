/* ════════════════════════════════════════════════════════════════
   WYLCO — EmailJS Configuration
   Servicio: https://www.emailjs.com/  (gratis hasta 200 mails/mes)
   Destino:  wylcosolutions@gmail.com
 ════════════════════════════════════════════════════════════════

  PASOS DE CONFIGURACIÓN (una sola vez):
  ─────────────────────────────────────
  1. Creá cuenta gratis en https://www.emailjs.com/
  2. "Add New Service" → Gmail → autorizá wylcosolutions@gmail.com
     → copiá el SERVICE ID (ej: "service_abc123")
  3. Creá 3 plantillas de email en "Email Templates":

     ┌─ Plantilla 1: CONTACTO ──────────────────────────────────┐
     │  Template ID: template_contact_wylco                     │
     │  Subject:  [Wylco Contact] {{inquiry_type}} — {{from_name}}│
     │  Body usar variables:                                     │
     │    Nombre:   {{from_name}}                               │
     │    Email:    {{from_email}}                              │
     │    Empresa:  {{company}}                                 │
     │    Teléfono: {{phone}}                                   │
     │    Tipo:     {{inquiry_type}}                            │
     │    Mensaje:  {{message}}                                 │
     └──────────────────────────────────────────────────────────┘

     ┌─ Plantilla 2: DISTRIBUIDOR ──────────────────────────────┐
     │  Template ID: template_dist_wylco                        │
     │  Subject:  [Wylco Distribuidor] {{company_name}}         │
     │  Body usar variables:                                    │
     │    Empresa:  {{company_name}}                            │
     │    Contacto: {{contact_name}} ({{role}})                 │
     │    Email:    {{email}}                                   │
     │    Teléfono: {{phone}}                                   │
     │    Región:   {{region}}                                  │
     │    Tipo:     {{business_type}}                           │
     │    Mensaje:  {{message}}                                 │
     └──────────────────────────────────────────────────────────┘

     ┌─ Plantilla 3: PRE-ORDER / COTIZACIÓN ────────────────────┐
     │  Template ID: template_preorder_wylco                    │
     │  Subject:  [Wylco Pre-Order] {{name}} — {{company}}      │
     │  Body usar variables:                                    │
     │    Nombre:   {{name}}                                    │
     │    Empresa:  {{company}}                                 │
     │    Email:    {{email}}                                   │
     │    Teléfono: {{phone}}                                   │
     └──────────────────────────────────────────────────────────┘

  4. En Account → General → copiá tu PUBLIC KEY (ej: "abc123XYZ")
  5. Reemplazá los valores de abajo con tus IDs reales y guardá.

 ════════════════════════════════════════════════════════════════ */

window.EJS = {
  publicKey:  'n8YDjj5dTM8FqRYCx',          // ← Account > General ✓
  serviceId:  'service_v2dapm1',            // ← Gmail ✓
  tplContact: 'template_contact_wylco',    // ← Template ID formulario contacto ✓
  tplDist:    'template_dist_wylco',       // ← Template ID formulario distribuidor ✓
  tplPreorder:'template_preorder_wylco',   // ← Template ID pre-order / cotización (pendiente)
};

/* ── Inicialización ─────────────────────────────────────────────
   Se ejecuta automáticamente cuando el script carga.
   Si la Public Key aún no fue configurada, los formularios
   usan mailto: como fallback (abre el cliente de correo).
──────────────────────────────────────────────────────────────── */
(function initEmailJS() {
  if (typeof emailjs === 'undefined') return;
  if (window.EJS.publicKey && window.EJS.publicKey !== 'YOUR_PUBLIC_KEY') {
    emailjs.init({ publicKey: window.EJS.publicKey });
    console.log('[Wylco] EmailJS inicializado ✓');
  } else {
    console.warn('[Wylco] EmailJS no configurado — se usará fallback mailto:');
  }
})();

/* ── Helper global ──────────────────────────────────────────────
   Envía un email via EmailJS; si no está configurado, abre
   mailto: con todos los datos del formulario pre-completados.
──────────────────────────────────────────────────────────────── */
window.wylcoSend = async function(templateId, params) {
  const cfg = window.EJS;
  const isConfigured = cfg.publicKey && cfg.publicKey !== 'YOUR_PUBLIC_KEY'
                    && cfg.serviceId && cfg.serviceId !== 'YOUR_SERVICE_ID';

  if (isConfigured) {
    return emailjs.send(cfg.serviceId, templateId, params, cfg.publicKey);
  }

  // Fallback mailto
  const lines = Object.entries(params)
    .map(([k, v]) => `${k.replace(/_/g,' ').toUpperCase()}: ${v}`)
    .join('\n');
  const subject = encodeURIComponent('[Wylco] ' + (params.inquiry_type || params.company_name || params.name || 'Consulta'));
  const body    = encodeURIComponent(lines);
  window.open(`mailto:wylcosolutions@gmail.com?subject=${subject}&body=${body}`);
  return Promise.resolve({ status: 200, text: 'mailto_fallback' });
};
