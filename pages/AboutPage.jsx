/* ── AboutPage.jsx ── */
function AboutPage({ lang, setPage }) {
  const tl = lang === 'en' ? [
    { year:'2012', title:'K11 Developed in Brazil', desc:'The K11 formula is developed in Brazil and begins validation testing with refrigeration equipment manufacturers.' },
    { year:'2015', title:'First OEM Partnerships', desc:'Three major HVAC OEM manufacturers in Latin America adopt K11 as a preventive factory treatment on new units.' },
    { year:'2019', title:'ASHRAE Certification', desc:'K11 TapaFugas receives ASHRAE 97 certification — the critical standard for HVAC refrigerant additive safety.' },
    { year:'2023', title:'K11 America Launches', desc:'The US rollout begins. Wylco LLC is established in Miami, FL as the exclusive K11 distributor for the United States market.' },
    { year:'2025', title:'Nationwide Distribution', desc:'Full US distribution infrastructure operational. Same-day dispatch from Miami. Distributor partnerships expanding across all 50 states.' },
    { year:'2026', title:'US Launch & Growth', desc:'K11 officially launches across the US market. Pre-orders open with launch pricing. The K11 distributor network continues to expand nationwide.' },
  ] : [
    { year:'2012', title:'K11 Desarrollado en Brasil', desc:'La fórmula K11 se desarrolla en Brasil y comienza las pruebas de validación con fabricantes de equipos de refrigeración.' },
    { year:'2015', title:'Primeras Asociaciones OEM', desc:'Tres grandes fabricantes OEM de HVAC en Latinoamérica adoptan K11 como tratamiento preventivo de fábrica en nuevas unidades.' },
    { year:'2019', title:'Certificación ASHRAE', desc:'K11 TapaFugas recibe la certificación ASHRAE 97 — el estándar crítico para la seguridad de aditivos de refrigerante HVAC.' },
    { year:'2023', title:'Lanzamiento K11 America', desc:'Comienza el despliegue en EE.UU. Wylco LLC se establece en Miami, FL como el distribuidor exclusivo K11 para el mercado estadounidense.' },
    { year:'2025', title:'Distribución Nacional', desc:'Infraestructura de distribución completa en EE.UU. Despacho el mismo día desde Miami. Asociaciones de distribuidores expandiéndose por los 50 estados.' },
    { year:'2026', title:'Lanzamiento y Crecimiento USA', desc:'K11 se lanza oficialmente en el mercado de EE.UU. Pre-órdenes abiertas con precios de lanzamiento. La red de distribuidores K11 sigue expandiéndose a nivel nacional.' },
  ];

  const vals = lang === 'en' ? [
    { title:'Professional Grade', desc:'Every product we distribute meets the rigorous standards expected by US HVAC professionals — ASHRAE certified, field-validated, and safe for all system components.' },
    { title:'Local Support', desc:'Miami-based. US-based inventory. Real people answering the phone. We understand the South Florida HVAC market because we operate in it every day.' },
    { title:'Proven Technology', desc:'We don\'t distribute anything we don\'t believe in. K11 has 12+ years of OEM validation, real-world case studies, and documented results across thousands of systems.' },
  ] : [
    { title:'Grado Profesional', desc:'Cada producto que distribuimos cumple con los estándares rigurosos que esperan los profesionales HVAC en EE.UU. — certificado ASHRAE, validado en campo.' },
    { title:'Soporte Local', desc:'Base en Miami. Inventario en EE.UU. Personas reales atendiendo el teléfono. Entendemos el mercado HVAC del sur de Florida porque operamos en él cada día.' },
    { title:'Tecnología Comprobada', desc:'No distribuimos nada en lo que no creemos. K11 tiene más de 12 años de validación OEM, estudios de casos reales y resultados documentados en miles de sistemas.' },
  ];

  const k11Stats = [
    { num:'12+', label: lang==='en'?'Years OEM Validated':'Años Validado OEM' },
    { num:'3+',  label: lang==='en'?'OEM Partnerships':'Asociaciones OEM' },
    { num:'ASHRAE', label: lang==='en'?'97 Certified':'Certificado 97' },
    { num:'NSF', label: lang==='en'?'Food Grade Approved':'Aprobado Grado Alim.' },
  ];

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="breadcrumb"><a onClick={() => setPage('home')}>Home</a><span>/</span><span>{lang==='en'?'About':'Nosotros'}</span></div>
          <div className="eyebrow white">{lang==='en'?'Our Story':'Nuestra Historia'}</div>
          <h1 className="page-h1">{lang==='en'?<span>Miami-based.<br/><em>Built for the US.</em></span>:<span>Base en Miami.<br/><em>Hecho para EE.UU.</em></span>}</h1>
          <p className="page-sub">{lang==='en'?'Wylco is the official K11 distributor for the United States — bringing the world\'s most advanced HVAC-R leak solution to American professionals.':'Wylco es el distribuidor oficial K11 para los Estados Unidos — llevando la solución de fugas HVAC-R más avanzada del mundo a los profesionales americanos.'}</p>
        </div>
      </section>

      {/* About layout */}
      <section className="section section-dark" style={{ borderBottom:'.5px solid var(--bd-dark)' }}>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="about-layout">
            <div className="about-photo">
              <img src="assets/k11-banner.jpg.png" alt="Wylco Miami K11 America" style={{ aspectRatio:'4/3', objectFit:'cover' }}/>
            </div>
            <div className="about-text">
              <div className="eyebrow white">{lang==='en'?'About Wylco':'Sobre Wylco'}</div>
              <div className="display" style={{ color:'#fff', fontSize:'clamp(2rem,3.5vw,3rem)', marginBottom:'24px' }}>{lang==='en'?<span>The US home<br/>of K11.</span>:<span>El hogar de K11<br/>en EE.UU.</span>}</div>
              <p>{lang==='en'?<span><strong>Wylco LLC</strong> is the exclusive official distributor of K11 products in the United States, operating from Miami, Florida — the epicenter of the American HVAC-R market.</span>:<span><strong>Wylco LLC</strong> es el distribuidor oficial exclusivo de productos K11 en los Estados Unidos, operando desde Miami, Florida — el epicentro del mercado HVAC-R americano.</span>}</p>
              <p>{lang==='en'?'We exist because American HVAC contractors deserve access to the most advanced refrigerant leak solutions on the market. K11 has been validated by OEM manufacturers across Latin America for over 12 years. We\'re bringing that proven technology to the United States.':'Existimos porque los contratistas HVAC americanos merecen acceso a las soluciones de fugas de refrigerante más avanzadas del mercado. K11 ha sido validado por fabricantes OEM en toda Latinoamérica por más de 12 años.'}</p>
              <p>{lang==='en'?'Based in Miami, we understand the demands of year-round AC operation, high-density commercial systems, and the fast-paced nature of field service. Our team provides technical support, same-day shipping, and direct partnership opportunities.':'Con base en Miami, entendemos las exigencias de la operación de AC todo el año, los sistemas comerciales de alta densidad y el ritmo acelerado del servicio en campo.'}</p>
              <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginTop:'24px' }}>
                <button className="btn btn-primary" onClick={() => { setPage('contact'); window.scrollTo({top:0}); }}>{lang==='en'?'Contact Us':'Contactanos'}</button>
                <button className="btn btn-ghost-light" onClick={() => { setPage('contact'); setTimeout(() => document.getElementById('distributors')?.scrollIntoView({behavior:'smooth'}), 80); }}>{lang==='en'?'Distributor Program':'Programa de Distribuidores'}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <div className="tl-wrap">
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="eyebrow white">{lang==='en'?'Timeline':'Cronología'}</div>
          <div className="display" style={{ color:'#fff', fontSize:'clamp(2rem,3.5vw,3rem)' }}>{lang==='en'?'K11: 12+ Years of Proof':'K11: Más de 12 años de prueba.'}</div>
          <div className="tl-list">
            {tl.map((item, i) => (
              <div key={i} className="tl-item">
                <div className="tl-dot"></div>
                <div className="tl-year">{item.year}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* K11 technology */}
      <section className="section section-dark" style={{ borderTop:'.5px solid var(--bd-dark)', borderBottom:'.5px solid var(--bd-dark)' }}>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="eyebrow white">{lang==='en'?'About K11':'Sobre K11'}</div>
          <div className="k11-layout">
            <div>
              <div className="display" style={{ color:'#fff', fontSize:'clamp(2rem,3.5vw,3rem)', marginBottom:'20px' }}>{lang==='en'?<span>The technology<br/>behind the seal.</span>:<span>La tecnología<br/>detrás del sello.</span>}</div>
              <p style={{ fontSize:'.95rem', color:'rgba(255,255,255,.5)', lineHeight:1.8, marginBottom:'1rem' }}>{lang==='en'?'K11 TapaFugas uses a unique polymer-free chemistry that remains inert in the refrigerant circuit until it reaches a leak site. On contact with air and moisture at the point of escape, it activates and forms a durable permanent seal.':'K11 TapaFugas usa una química única sin polímeros que permanece inerte en el circuito de refrigerante hasta que llega a un punto de fuga. Al contactar con aire y humedad en el punto de escape, se activa y forma un sello permanente y duradero.'}</p>
              <p style={{ fontSize:'.95rem', color:'rgba(255,255,255,.5)', lineHeight:1.8, marginBottom:'1rem' }}>{lang==='en'?'The integrated UV fluorescent tracer travels with the sealant, marking the exact sealed location for verification and documentation — completing two jobs in one product, one injection.':'El trazador UV fluorescente integrado viaja con el sellador, marcando la ubicación exacta sellada para verificación y documentación — completando dos trabajos en un producto, una inyección.'}</p>
              <button className="btn btn-primary" style={{ marginTop:'8px' }} onClick={() => { setPage('products'); window.scrollTo({top:0}); }}>{lang==='en'?'View TapaFugas 2-in-1':'Ver TapaFugas 2-en-1'}</button>
            </div>
            <div className="k11-stats">
              {k11Stats.map((s, i) => (
                <div key={i} className="k11-stat">
                  <div className="k11-stat-num">{s.num}</div>
                  <div className="k11-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section section-dark-2" style={{ background:'var(--dark-2)', borderBottom:'.5px solid var(--bd-dark)' }}>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="eyebrow white">{lang==='en'?'Our Values':'Nuestros Valores'}</div>
          <div className="display" style={{ color:'#fff', fontSize:'clamp(2rem,3.5vw,3rem)', marginBottom:'40px' }}>{lang==='en'?'What we stand for.':'En lo que creemos.'}</div>
          <div className="vals-grid">
            {vals.map((v, i) => (
              <div key={i} className="val-card">
                <div className="val-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--orange)" strokeWidth="1.8">
                    {i===0 && <polyline points="20 6 9 17 4 12"/>}
                    {i===1 && <><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>}
                    {i===2 && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
                  </svg>
                </div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { AboutPage });
