/* ── ContactPage.jsx ── */
const { useState: useStateC } = React;

function ContactPage({ lang, setPage }) {
  const [contactDone, setContactDone] = useStateC(false);
  const [distDone, setDistDone] = useStateC(false);

  async function submitContact(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.textContent = lang === 'en' ? 'Sending...' : 'Enviando...';
    btn.disabled = true;
    const fd = new FormData(e.target);
    const params = {
      from_name:    `${fd.get('first_name')} ${fd.get('last_name')}`.trim(),
      from_email:   fd.get('from_email'),
      company:      fd.get('company') || '—',
      phone:        fd.get('phone') || '—',
      inquiry_type: fd.get('inquiry_type'),
      message:      fd.get('message'),
      lang:         lang === 'en' ? 'English' : 'Español',
    };
    try {
      await window.wylcoSend(window.EJS.tplContact, params);
      setContactDone(true);
    } catch(err) {
      console.error('EmailJS contact error:', err);
      btn.textContent = lang === 'en' ? 'Error — try again' : 'Error — intentá de nuevo';
      btn.disabled = false;
    }
  }

  async function submitDist(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.textContent = lang === 'en' ? 'Sending...' : 'Enviando...';
    btn.disabled = true;
    const fd = new FormData(e.target);
    const params = {
      company_name:  fd.get('company_name'),
      contact_name:  fd.get('contact_name'),
      role:          fd.get('role') || '—',
      email:         fd.get('dist_email'),
      phone:         fd.get('dist_phone') || '—',
      region:        fd.get('region') || '—',
      business_type: fd.get('business_type'),
      message:       fd.get('dist_message') || '—',
    };
    try {
      await window.wylcoSend(window.EJS.tplDist, params);
      setDistDone(true);
    } catch(err) {
      console.error('EmailJS dist error:', err);
      btn.textContent = lang === 'en' ? 'Error — try again' : 'Error — intentá de nuevo';
      btn.disabled = false;
    }
  }

  const distBenefits = lang === 'en' ? [
    { num:'01', title:'Exclusive Territory', desc:'We work with a limited number of distributors per region to protect your investment and market position.' },
    { num:'02', title:'Competitive Wholesale Pricing', desc:'Volume-based pricing tiers for supply houses, contractor fleets, and regional wholesalers.' },
    { num:'03', title:'Technical Onboarding', desc:'Full product training, datasheets, SDS documents, and application guides for your team and customers.' },
    { num:'04', title:'Marketing Support', desc:'Product materials, demos, and Wylco support to help you sell K11 in your market effectively.' },
    { num:'05', title:'Fast Restocking', desc:'Miami-based inventory with same-day shipping ensures your shelves are never empty.' },
  ] : [
    { num:'01', title:'Territorio Exclusivo', desc:'Trabajamos con un número limitado de distribuidores por región para proteger tu inversión y posición en el mercado.' },
    { num:'02', title:'Precios al por Mayor Competitivos', desc:'Niveles de precios basados en volumen para casas de suministros, flotas de contratistas y mayoristas regionales.' },
    { num:'03', title:'Onboarding Técnico', desc:'Capacitación completa del producto, fichas técnicas, documentos SDS y guías de aplicación para tu equipo y clientes.' },
    { num:'04', title:'Soporte de Marketing', desc:'Materiales de producto, demostraciones y soporte de Wylco para ayudarte a vender K11 en tu mercado eficazmente.' },
    { num:'05', title:'Reposición Rápida', desc:'Inventario con base en Miami con envío el mismo día garantiza que tus estantes nunca estén vacíos.' },
  ];

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="breadcrumb"><a onClick={() => setPage('home')}>Home</a><span>/</span><span>{lang==='en'?'Contact':'Contacto'}</span></div>
          <div className="eyebrow white">{lang==='en'?'Get in Touch':'Ponete en Contacto'}</div>
          <h1 className="page-h1">{lang==='en'?<span>Let's talk<br/><em>K11.</em></span>:<span>Hablemos<br/><em>de K11.</em></span>}</h1>
          <p className="page-sub">{lang==='en'?'B2B inquiries, wholesale pricing, distributor applications, and technical support. Our Miami team responds within 24 hours.':'Consultas B2B, precios al por mayor, solicitudes de distribución y soporte técnico. Nuestro equipo de Miami responde en 24 horas.'}</p>
        </div>
      </section>

      {/* Contact form + info */}
      <section className="section section-dark" style={{ paddingTop:'80px', paddingBottom:'80px' }}>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="contact-layout">
            <div className="cform">
              <div className="cform-title">{lang==='en'?'Contact Wylco':'Contactar Wylco'}</div>
              <p className="cform-sub">{lang==='en'?'Fill out the form and our team will get back to you within 24 hours.':'Completá el formulario y nuestro equipo te responderá en 24 horas.'}</p>
              {contactDone ? (
                <div className="success-msg" style={{ display:'block', fontSize:'1rem', padding:'1.5rem', marginTop:0 }}>
                  ✓ {lang==='en'?'Message sent! We\'ll get back to you within 24 hours.':'¡Mensaje enviado! Te responderemos en 24 horas.'}
                </div>
              ) : (
                <form onSubmit={submitContact}>
                  <div className="fr">
                    <div className="fg"><label>{lang==='en'?'First Name':'Nombre'}</label><input name="first_name" type="text" placeholder={lang==='en'?'John':'Juan'} required/></div>
                    <div className="fg"><label>{lang==='en'?'Last Name':'Apellido'}</label><input name="last_name" type="text" placeholder={lang==='en'?'Smith':'García'} required/></div>
                  </div>
                  <div className="fg"><label>Email</label><input name="from_email" type="email" placeholder="john@company.com" required/></div>
                  <div className="fg"><label>{lang==='en'?'Company':'Empresa'}</label><input name="company" type="text" placeholder="HVAC Services LLC"/></div>
                  <div className="fg"><label>{lang==='en'?'Phone':'Teléfono'}</label><input name="phone" type="tel" placeholder="+1 (555) 000-0000"/></div>
                  <div className="fg">
                    <label>{lang==='en'?'Inquiry Type':'Tipo de Consulta'}</label>
                    <select name="inquiry_type">
                      {(lang==='en'
                        ? ['General Inquiry','Order / Quote Request','Distributor Application','Technical Support','SDS / Document Request']
                        : ['Consulta General','Pedido / Cotización','Solicitud de Distribución','Soporte Técnico','Solicitud de Documentos SDS']
                      ).map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>{lang==='en'?'Message':'Mensaje'}</label><textarea name="message" placeholder={lang==='en'?'Tell us about your business and how we can help...':'Contanos sobre tu negocio y cómo podemos ayudar...'}></textarea></div>
                  <button type="submit" className="sbtn">{lang==='en'?'Send Message':'Enviar Mensaje'}</button>
                  <p style={{ fontSize:'.72rem', color:'rgba(255,255,255,.25)', marginTop:'.8rem', textAlign:'center' }}>{lang==='en'?'Your information is never shared. We respond within 24 business hours.':'Tu información nunca se comparte. Respondemos dentro de 24 horas hábiles.'}</p>
                </form>
              )}
            </div>

            <div className="info-cards">
              {[
                { icon:<><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>, title:lang==='en'?'Miami, Florida':'Miami, Florida', lines:['Wylco LLC · Miami, FL · United States', lang==='en'?'Operations Mon–Fri, 9 AM – 6 PM EST':'Operaciones Lun–Vie, 9 AM – 6 PM EST'] },
                { icon:<path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13 1 .37 1.97.72 2.89a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.92.35 1.88.59 2.89.72A2 2 0 0122 16.92z"/>, title:lang==='en'?'Phone & WhatsApp':'Teléfono y WhatsApp', lines:['+1 (954) 881-8870', lang==='en'?'WhatsApp available for quick inquiries':'WhatsApp disponible para consultas rápidas'], link:'https://wa.me/19548818870' },
                { icon:<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, title:'Email', lines:['info@wylcosolutions.com', lang==='en'?'We respond within 24 business hours':'Respondemos en 24 horas hábiles'], mailto:'info@wylcosolutions.com' },
                { icon:<><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>, title:lang==='en'?'Shipping':'Envíos', lines:[lang==='en'?'Stock not yet available in Miami — arriving soon.':'Aún sin stock en Miami — llega pronto.',lang==='en'?'Pre-order now to reserve launch pricing.':'Pre-ordená ahora y asegurá el precio de lanzamiento.'] },
              ].map((card, i) => (
                <div key={i} className="icard">
                  <div className="icard-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--orange)" strokeWidth="2">{card.icon}</svg>
                  </div>
                  <h3>{card.title}</h3>
                  {card.lines.map((line, j) => (
                    card.link && j===0 ? <p key={j}><a href={card.link} target="_blank" rel="noopener">{line}</a></p> :
                    card.mailto && j===0 ? <p key={j}><a href={`mailto:${card.mailto}`}>{line}</a></p> :
                    <p key={j}>{line}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Distributor section */}
      <section id="distributors" className="section section-dark-2" style={{ background:'var(--dark-2)', borderTop:'.5px solid var(--bd-dark)' }}>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="eyebrow green">{lang==='en'?'Distributor Program':'Programa de Distribuidores'}</div>
          <div className="display" style={{ color:'#fff', fontSize:'clamp(2rem,3.5vw,3rem)', marginBottom:'12px' }}>{lang==='en'?'Become a K11 distributor.':'Convertite en distribuidor K11.'}</div>
          <p className="body-md white-muted" style={{ maxWidth:'560px', marginBottom:'40px' }}>{lang==='en'?'We\'re building the K11 network across the US. HVAC supply houses, contractor fleets, regional wholesalers — let\'s talk about your territory and opportunity.':'Estamos construyendo la red K11 en todo EE.UU. Casas de suministros HVAC, flotas de contratistas, mayoristas regionales — hablemos de tu territorio y oportunidad.'}</p>
          <div className="dist-layout">
            <div style={{ display:'grid', gap:'.8rem' }}>
              {distBenefits.map((b, i) => (
                <div key={i} className="dist-item">
                  <div className="dist-num">{b.num}</div>
                  <div><h4>{b.title}</h4><p>{b.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="dist-form-card">
              <div className="dist-form-title">{lang==='en'?'Apply to Distribute':'Aplicar para Distribuir'}</div>
              <p className="dist-form-sub">{lang==='en'?'Tell us about your business. Our team will review your application and follow up within 2 business days.':'Contanos sobre tu negocio. Nuestro equipo revisará tu solicitud y se comunicará en 2 días hábiles.'}</p>
              {distDone ? (
                <div className="success-msg" style={{ display:'block', fontSize:'1rem', padding:'1.5rem', marginTop:0 }}>
                  ✓ {lang==='en'?'Application received! We\'ll contact you within 2 business days.':'¡Solicitud recibida! Te contactaremos en 2 días hábiles.'}
                </div>
              ) : (
                <form onSubmit={submitDist}>
                  <div className="fg"><label>{lang==='en'?'Company Name':'Nombre de Empresa'}</label><input name="company_name" type="text" placeholder="HVAC Supply House LLC" required/></div>
                  <div className="fr">
                    <div className="fg"><label>{lang==='en'?'Contact Name':'Nombre de Contacto'}</label><input name="contact_name" type="text" placeholder="John Smith" required/></div>
                    <div className="fg"><label>{lang==='en'?'Role / Title':'Rol / Cargo'}</label><input name="role" type="text" placeholder="Owner / Purchasing Mgr"/></div>
                  </div>
                  <div className="fg"><label>Email</label><input name="dist_email" type="email" placeholder="john@company.com" required/></div>
                  <div className="fg"><label>{lang==='en'?'Phone':'Teléfono'}</label><input name="dist_phone" type="tel" placeholder="+1 (555) 000-0000"/></div>
                  <div className="fg"><label>{lang==='en'?'State / Region':'Estado / Región'}</label><input name="region" type="text" placeholder="Florida, Southeast US..."/></div>
                  <div className="fg">
                    <label>{lang==='en'?'Business Type':'Tipo de Negocio'}</label>
                    <select name="business_type">
                      {(lang==='en'
                        ? ['HVAC Supply House','HVAC Contractor Fleet','Regional Wholesaler','Online Retailer','Other']
                        : ['Casa de Suministros HVAC','Flota de Contratistas HVAC','Mayorista Regional','Minorista Online','Otro']
                      ).map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>{lang==='en'?'Message (Optional)':'Mensaje (Opcional)'}</label><textarea name="dist_message" placeholder={lang==='en'?'Tell us about your business, territory, and monthly volume estimates...':'Contanos sobre tu negocio, territorio y estimaciones de volumen mensual...'} style={{ minHeight:'90px' }}></textarea></div>
                  <button type="submit" className="dsbtn">{lang==='en'?'Submit Application':'Enviar Solicitud'}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { ContactPage });
