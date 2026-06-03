/* ── DocsPage.jsx ── */
function DocsPage({ lang, setPage }) {
  const docs = [
    { featured:true, icon:'orange', iconSvg:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
      badge:'SDS', product:'K11 TapaFugas 2-in-1',
      title: lang==='en'?'Safety Data Sheet — K11 TapaFugas 2-in-1':'Hoja de Seguridad — K11 TapaFugas 2-en-1',
      desc: lang==='en'?'Complete OSHA-compliant Safety Data Sheet for K11 TapaFugas 2-in-1. Includes composition, hazard identification, handling procedures, PPE requirements, and disposal guidance. GHS formatted, US English.':'Hoja de Seguridad completa conforme OSHA para K11 TapaFugas 2-en-1. Incluye composición, identificación de peligros, procedimientos de manejo, PPE y orientación de eliminación. Formato GHS, inglés americano.',
      meta: lang==='en'?['Updated 2026','PDF available','GHS compliant']:['Actualizado 2026','PDF disponible','Conforme GHS'],
      download:true },
    { icon:'gold', iconSvg:<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
      badge:'SDS', product:'K11 Sella Plus',
      title: lang==='en'?'Safety Data Sheet — K11 Sella Plus':'Hoja de Seguridad — K11 Sella Plus',
      desc: lang==='en'?'OSHA-compliant SDS for K11 Sella Plus HVAC-R Sealant + Lubricant. Includes hazard classification, handling, first aid, and disposal guidance. ASHRAE 97 certified product.':'SDS conforme OSHA para K11 Sella Plus Sellador + Lubricante HVAC-R. Incluye clasificación de peligros, manejo, primeros auxilios y orientación de eliminación. Producto certificado ASHRAE 97.',
      meta: lang==='en'?['Updated 2026','ASHRAE 97 certified']:['Actualizado 2026','Certificado ASHRAE 97'],
      download:false },
    { icon:'orange', iconSvg:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
      badge:'SDS', product:'K11 Revela Fugas',
      title: lang==='en'?'Safety Data Sheet — UV Fluorescent Dye':'Hoja de Seguridad — Tinte UV Fluorescente',
      desc: lang==='en'?'OSHA-compliant SDS for K11 Revela Fugas UV detection dye. Includes full hazard classification, handling, and first aid information.':'SDS conforme OSHA para el tinte de detección UV K11 Revela Fugas. Incluye clasificación completa de peligros, manejo e información de primeros auxilios.',
      meta: lang==='en'?['Updated 2026','GHS compliant']:['Actualizado 2026','Conforme GHS'],
      download:false },
    { icon:'green', iconSvg:<><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
      badge:'CERT', product:'K11 TapaFugas',
      title: lang==='en'?'ASHRAE 97 Certification':'Certificación ASHRAE 97',
      desc: lang==='en'?'Official ASHRAE Standard 97 certification document confirming K11 TapaFugas safety for use in sealed refrigerant circuits. Required for professional validation.':'Documento oficial de certificación ASHRAE Estándar 97 que confirma la seguridad de K11 TapaFugas para uso en circuitos de refrigerante sellados.',
      meta: lang==='en'?['ASHRAE certified']:['Certificado ASHRAE'],
      download:false },
    { icon:'gray', iconSvg:<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
      badge:'GUIDE', product: lang==='en'?'All K11 Products':'Todos los Productos K11',
      title: lang==='en'?'Application & Dosing Guide':'Guía de Aplicación y Dosificación',
      desc: lang==='en'?'Step-by-step application guide for field technicians. Includes leak classification, dosing table, injection procedure, and UV verification process.':'Guía de aplicación paso a paso para técnicos de campo. Incluye clasificación de fugas, tabla de dosificación, procedimiento de inyección y proceso de verificación UV.',
      meta: lang==='en'?['PDF download']:['Descarga PDF'],
      download:true },
  ];

  const sdsSections = lang === 'en' ? [
    { num:'Section 1', title:'Product Identification', desc:'Product name, manufacturer details, and intended use classification.' },
    { num:'Section 2', title:'Hazard Identification', desc:'GHS hazard classification, signal words, pictograms, and precautionary statements.' },
    { num:'Section 3', title:'Composition', desc:'Chemical ingredients, CAS numbers, concentration ranges, and trade secret protections.' },
    { num:'Section 4', title:'First Aid Measures', desc:'Treatment procedures for inhalation, skin contact, eye contact, and ingestion.' },
    { num:'Sections 5–8', title:'Fire, Reactivity & Handling', desc:'Fire-fighting measures, accidental release, exposure controls, and PPE requirements.' },
    { num:'Sections 9–16', title:'Physical & Regulatory', desc:'Physical properties, stability, toxicological data, disposal, transport, and regulatory info.' },
    { num:'Appendix', title:'Compatibility Data', desc:'Refrigerant compatibility matrix, oil compatibility data, and system component safety table.' },
    { num:'Addendum', title:'ASHRAE Certification', desc:'Reference to ASHRAE Standard 97 certification for sealed refrigerant system safety.' },
  ] : [
    { num:'Sección 1', title:'Identificación del Producto', desc:'Nombre del producto, datos del fabricante y clasificación del uso previsto.' },
    { num:'Sección 2', title:'Identificación de Peligros', desc:'Clasificación de peligros GHS, palabras de señal, pictogramas y declaraciones de precaución.' },
    { num:'Sección 3', title:'Composición', desc:'Ingredientes químicos, números CAS, rangos de concentración y protecciones de secretos comerciales.' },
    { num:'Sección 4', title:'Primeros Auxilios', desc:'Procedimientos de tratamiento para inhalación, contacto con la piel, contacto con los ojos e ingestión.' },
    { num:'Secciones 5–8', title:'Incendio, Reactividad y Manejo', desc:'Medidas contra incendios, liberación accidental, controles de exposición y requisitos de EPP.' },
    { num:'Secciones 9–16', title:'Físico y Regulatorio', desc:'Propiedades físicas, estabilidad, datos toxicológicos, eliminación, transporte e información regulatoria.' },
    { num:'Apéndice', title:'Datos de Compatibilidad', desc:'Matriz de compatibilidad de refrigerantes, datos de compatibilidad de aceite y tabla de seguridad de componentes.' },
    { num:'Adendum', title:'Certificación ASHRAE', desc:'Referencia a la certificación ASHRAE Estándar 97 para seguridad en sistemas de refrigerante sellados.' },
  ];

  const tagMap = { SDS:'tag-orange', TDS:'tag-gold', CERT:'tag-green', GUIDE:'tag-gray' };

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="breadcrumb">
            <a onClick={() => setPage('home')}>Home</a><span>/</span>
            <a onClick={() => setPage('products')}>{lang==='en'?'Products':'Productos'}</a><span>/</span>
            <span>{lang==='en'?'Documentation':'Documentación'}</span>
          </div>
          <div className="eyebrow white">{lang==='en'?'Technical Documentation':'Documentación Técnica'}</div>
          <h1 className="page-h1">{lang==='en'?<span>SDS Docs &<br/><em>Technical Files.</em></span>:<span>Documentos SDS &<br/><em>Fichas Técnicas.</em></span>}</h1>
          <p className="page-sub">{lang==='en'?'Safety Data Sheets, Technical Data Sheets, and compliance documents for all K11 products. OSHA-compliant. GHS formatted.':'Hojas de Seguridad, Fichas Técnicas y documentos de cumplimiento para todos los productos K11. Conforme OSHA. Formato GHS.'}</p>
        </div>
      </section>

      <section className="docs-section">
        <div className="docs-inner" style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div className="docs-note">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--orange)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {lang==='en'
              ? 'All K11 products comply with OSHA Hazard Communication Standard (29 CFR 1910.1200) and the Globally Harmonized System (GHS). Safety Data Sheets are available in English for all US customers and distributors.'
              : 'Todos los productos K11 cumplen con el Estándar de Comunicación de Peligros de OSHA (29 CFR 1910.1200) y el Sistema Globalmente Armonizado (GHS). Las Hojas de Seguridad están disponibles en inglés para todos los clientes y distribuidores de EE.UU.'}
          </div>

          <div className="docs-grid">
            {docs.map((doc, i) => doc.featured ? (
              <div key={i} className="doc-card featured">
                <div className="featured-stripe">
                  <div className="featured-stripe-text">{lang==='en'?'Safety Data Sheet':'Hoja de Seguridad'}</div>
                  <div className="featured-stripe-dot"></div>
                </div>
                <div className="featured-content">
                  <div className="doc-card-header">
                    <div className={`doc-icon ${doc.icon}`}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" strokeWidth="1.8">{doc.iconSvg}</svg>
                    </div>
                    <span className={`tag ${tagMap[doc.badge]||'tag-gray'}`}>{doc.badge}</span>
                  </div>
                  <div className="doc-product">{doc.product}</div>
                  <div className="doc-title">{doc.title}</div>
                  <p className="doc-desc">{doc.desc}</p>
                  <div className="doc-meta">
                    {doc.meta.map((m, j) => (
                      <div key={j} className="doc-meta-item">
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        {m}
                      </div>
                    ))}
                  </div>
                  <div className="doc-actions">
                    <a href="#" className="btn-download">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      {lang==='en'?'Download SDS':'Descargar SDS'}
                    </a>
                    <a href="https://wa.me/17869035295?text=Hi%2C+I+need+SDS+for+K11+TapaFugas" target="_blank" rel="noopener" className="btn-request">
                      {lang==='en'?'Request via WhatsApp':'Solicitar por WhatsApp'}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div key={i} className="doc-card">
                <div className="doc-card-header">
                  <div className={`doc-icon ${doc.icon}`}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" strokeWidth="1.8">{doc.iconSvg}</svg>
                  </div>
                  <span className={`tag ${tagMap[doc.badge]||'tag-gray'}`}>{doc.badge}</span>
                </div>
                <div className="doc-product">{doc.product}</div>
                <div className="doc-title">{doc.title}</div>
                <p className="doc-desc">{doc.desc}</p>
                <div className="doc-meta">
                  {doc.meta.map((m, j) => (
                    <div key={j} className="doc-meta-item">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      {m}
                    </div>
                  ))}
                </div>
                <div className="doc-actions">
                  {doc.download
                    ? <a href="#" className="btn-download" style={{ fontSize:'12px', padding:'8px 14px' }}>
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        {lang==='en'?'Download':'Descargar'}
                      </a>
                    : <a href="https://wa.me/17869035295?text=Hi%2C+I+need+K11+documentation" target="_blank" rel="noopener" className="btn-request">{lang==='en'?'Request Document':'Solicitar Documento'}</a>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDS Sections */}
      <section className="sds-sections">
        <div className="sds-inner" style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div className="eyebrow white">{lang==='en'?'GHS SDS Sections':'Secciones GHS SDS'}</div>
          <div className="display" style={{ color:'#fff', fontSize:'clamp(2rem,3vw,2.8rem)' }}>{lang==='en'?'What our SDS covers.':'Qué cubre nuestra SDS.'}</div>
          <p className="body-md white-muted" style={{ marginTop:'12px' }}>{lang==='en'?'All K11 Safety Data Sheets comply with OSHA 29 CFR 1910.1200 and include all 16 GHS sections required for US commercial use.':'Todas las Hojas de Seguridad K11 cumplen con OSHA 29 CFR 1910.1200 e incluyen las 16 secciones GHS requeridas para uso comercial en EE.UU.'}</p>
          <div className="sds-grid">
            {sdsSections.map((s, i) => (
              <div key={i} className="sds-item">
                <div className="sds-num">{s.num}</div>
                <div className="sds-title">{s.title}</div>
                <div className="sds-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request banner */}
      <div className="request-banner">
        <h2>{lang==='en'?'Need a specific document?':'¿Necesitás un documento específico?'}</h2>
        <p>{lang==='en'?'Contact our technical support team. We\'ll provide the correct SDS, TDS, or certification documentation within 24 hours.':'Contactá a nuestro equipo de soporte técnico. Te proporcionaremos la SDS, TDS o documentación de certificación correcta en 24 horas.'}</p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn btn-dark btn-lg" onClick={() => { window.setPage('contact'); window.scrollTo({top:0}); }}>
            {lang==='en'?'Contact Technical Support':'Contactar Soporte Técnico'}
          </button>
          <a href="https://wa.me/17869035295?text=Hi%2C+I+need+technical+documentation+for+K11" target="_blank" rel="noopener"
             className="btn btn-ghost-light btn-lg" style={{ textDecoration:'none' }}>
            {lang==='en'?'WhatsApp Request':'Solicitud por WhatsApp'}
          </a>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DocsPage });
