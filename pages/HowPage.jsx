/* ── HowPage.jsx ── */
const { useState: useStateH, useEffect: useEffectH } = React;

function HowPage({ lang, setPage }) {
  const [activeStep, setActiveStepH] = useStateH(1);

  const steps = lang === 'en' ? [
    { num:1, title:'Classify the Leak', desc:'Determine if K11 is appropriate based on how quickly the system loses charge. Over 30 days = micro-leak (K11 recommended). 15–30 days = medium. Under 15 days = large (welding required).' },
    { num:2, title:'Run the System', desc:'Operate the AC system normally before injection. The compressor must be running for correct distribution of K11 through the refrigerant circuit.' },
    { num:3, title:'Connect the Adapter', desc:'Attach the K11 anti-backflow adapter to the low-pressure (suction) service port. Load the correct dose of K11 TapaFugas 2-in-1 into the syringe.' },
    { num:4, title:'Inject K11', desc:'Slowly inject the full syringe into the circuit with the system running. The refrigerant flow carries K11 throughout the entire circuit within minutes.' },
    { num:5, title:'Let K11 Circulate', desc:'Run the system for 15–30 minutes. K11 circulates through all components and activates permanently at any leak site it encounters.' },
    { num:6, title:'Verify with UV Light', desc:'Use a UV or violet light to inspect the system. The fluorescent tracer in K11 marks the sealed point visibly. Document it. Show the client. Job complete.' },
  ] : [
    { num:1, title:'Clasificar la Fuga', desc:'Determiná si K11 es adecuado según qué tan rápido el sistema pierde carga. Más de 30 días = micro-fuga (K11 recomendado). 15–30 días = media. Menos de 15 días = grande (requiere soldadura).' },
    { num:2, title:'Encender el Sistema', desc:'Operá el sistema de AC normalmente antes de la inyección. El compresor debe estar en marcha para la correcta distribución de K11 por el circuito de refrigerante.' },
    { num:3, title:'Conectar el Adaptador', desc:'Adjuntá el adaptador anti-retorno K11 al puerto de servicio de baja presión (succión). Cargá la dosis correcta de K11 TapaFugas 2-en-1 en la jeringa.' },
    { num:4, title:'Inyectar K11', desc:'Inyectá lentamente la jeringa completa en el circuito con el sistema en marcha. El flujo de refrigerante lleva K11 por todo el circuito en minutos.' },
    { num:5, title:'Dejar Circular K11', desc:'Corré el sistema por 15–30 minutos. K11 circula por todos los componentes y se activa permanentemente en cualquier punto de fuga que encuentre.' },
    { num:6, title:'Verificar con Luz UV', desc:'Usá una luz UV o violeta para inspeccionar el sistema. El trazador fluorescente en K11 marca el punto sellado visiblemente. Documentalo. Mostráselo al cliente.' },
  ];

  const stepImages = ['assets/k11_step_1.png','assets/k11_step_2.png','assets/k11_step_3.png','assets/k11_step_4.png','assets/k11_step_5.png','assets/k11_step_6.png'];

  const stepMeta = lang === 'en' ? [
    { label:'Step 01', icon:'classify', foot:<span><strong>Rule of thumb:</strong> if the system holds for 30+ days, it's a micro-leak — K11's exact use case.</span> },
    { label:'Step 02', icon:'gauge', foot:<span><strong>Compressor running.</strong> K11 needs active refrigerant flow to distribute correctly.</span> },
    { label:'Step 03', icon:'adapter', foot:<span><strong>Low-pressure port only.</strong> The anti-backflow adapter ensures safe, precise injection.</span> },
    { label:'Step 04', icon:'inject', foot:<span><strong>Slow & steady.</strong> Refrigerant flow carries K11 through the full circuit in minutes.</span> },
    { label:'Step 05', icon:'circulate', foot:<span><strong>15–30 minutes.</strong> K11 activates permanently at every micro-leak it reaches.</span> },
    { label:'Step 06', icon:'uv', foot:<span><strong>UV verification.</strong> The fluorescent tracer marks the sealed point — show the client, document it.</span> },
  ] : [
    { label:'Paso 01', icon:'classify', foot:<span><strong>Regla práctica:</strong> si el sistema aguanta 30+ días, es una micro-fuga — el caso exacto de K11.</span> },
    { label:'Paso 02', icon:'gauge', foot:<span><strong>Compresor en marcha.</strong> K11 necesita flujo de refrigerante activo para distribuirse bien.</span> },
    { label:'Paso 03', icon:'adapter', foot:<span><strong>Solo puerto de baja.</strong> El adaptador anti-retorno asegura inyección segura y precisa.</span> },
    { label:'Paso 04', icon:'inject', foot:<span><strong>Lento y constante.</strong> El flujo de refrigerante lleva K11 por todo el circuito en minutos.</span> },
    { label:'Paso 05', icon:'circulate', foot:<span><strong>15–30 minutos.</strong> K11 se activa permanentemente en cada micro-fuga que alcanza.</span> },
    { label:'Paso 06', icon:'uv', foot:<span><strong>Verificación UV.</strong> El trazador fluorescente marca el punto sellado — mostráselo al cliente, documentalo.</span> },
  ];

  const leakItems = lang === 'en' ? [
    { days:'30+', cls:'lt-green', type:'Micro-Leak', color:'var(--green)', desc:'Days to lose full charge. This is K11\'s target application. Seal it permanently in one injection. No evacuation. No downtime.' },
    { days:'15–30', cls:'lt-yellow', type:'Medium Leak', color:'#C89B14', desc:'Days to lose full charge. K11 may work depending on leak location. Evaluate the circuit. Consider professional diagnosis.' },
    { days:'<15', cls:'lt-red', type:'Large Leak', color:'#C83232', desc:'Days to lose full charge. Welding or physical repair required. K11 is not the right tool. Locate and repair mechanically.' },
  ] : [
    { days:'30+', cls:'lt-green', type:'Micro-Fuga', color:'var(--green)', desc:'Días para perder carga completa. Esta es la aplicación objetivo de K11. Sellar permanentemente en una inyección. Sin evacuación. Sin tiempo muerto.' },
    { days:'15–30', cls:'lt-yellow', type:'Fuga Media', color:'#C89B14', desc:'Días para perder carga completa. K11 puede funcionar dependiendo de la ubicación de la fuga. Evaluá el circuito. Considerá un diagnóstico profesional.' },
    { days:'<15', cls:'lt-red', type:'Fuga Grande', color:'#C83232', desc:'Días para perder carga completa. Se requiere soldadura o reparación física. K11 no es la herramienta adecuada. Localizá y reparás mecánicamente.' },
  ];

  const faqItems = lang === 'en' ? [
    { q:'Is K11 safe for compressors, TXVs, and expansion valves?', a:'Yes. K11 TapaFugas is polymer-free and only activates at leak points when it contacts air and moisture. Safe for all system components — TXVs, TEVs, capillary tubes, and all common seal materials. ASHRAE 97 certified.' },
    { q:'Can K11 be used preventively?', a:'Yes. OEM manufacturers in Latin America now use K11 as a factory preventive treatment on new units. It circulates continuously, protecting against future micro-leaks before they form.' },
    { q:'What refrigerants are compatible?', a:'All common refrigerants: R22, R410A, R32, R134a, R404A, R290, R600a, R1234yf, and all A2L replacements. The only exception is ammonia (R717).' },
    { q:'How long does the seal last?', a:'The seal is permanent and lasts the remaining operational life of the system. Documented cases on record after 5+ years of continuous operation.' },
  ] : [
    { q:'¿Es K11 seguro para compresores, TXV y válvulas de expansión?', a:'Sí. K11 TapaFugas no contiene polímeros y solo se activa en los puntos de fuga al contactar con aire y humedad. Seguro para todos los componentes del sistema. Certificado ASHRAE 97.' },
    { q:'¿Se puede usar K11 de forma preventiva?', a:'Sí. Los fabricantes OEM en Latinoamérica ahora usan K11 como tratamiento preventivo de fábrica en unidades nuevas. Circula continuamente, protegiendo contra futuras micro-fugas.' },
    { q:'¿Con qué refrigerantes es compatible?', a:'Todos los refrigerantes comunes: R22, R410A, R32, R134a, R404A, R290, R600a, R1234yf, y todos los reemplazos A2L. La única excepción es el amoniaco (R717).' },
    { q:'¿Cuánto dura el sellado?', a:'El sellado es permanente y dura la vida operativa restante del sistema. Casos documentados después de más de 5 años de operación continua.' },
  ];

  const [openFaq, setOpenFaq] = useStateH(null);

  const svIcons = {
    classify: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    gauge: <><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 6v6l4 2"/></>,
    adapter: <><path d="M9 3v6m6-6v6M5 9h14l-1 11a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z"/></>,
    inject: <><path d="M19 5L5 19M14 4l6 6M5 13l6 6M3 21l2-6"/></>,
    circulate: <><path d="M21 12a9 9 0 11-9-9"/><polyline points="21 3 21 9 15 9"/></>,
    uv: <><path d="M12 3v2M5.6 5.6l1.4 1.4M3 12h2m14 0h2M17 7l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z"/></>,
  };

  function renderStepVisual(n) {
    const meta = stepMeta[n-1];
    const isEN = lang === 'en';
    let body;
    if (n === 1) {
      const chips = [
        { color:'var(--green)', icon:<polyline points="20 6 9 17 4 12"/>, days:'30+', type:isEN?'Micro-leak':'Micro-fuga' },
        { color:'#C89B14', icon:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, days:'15–30', type:isEN?'Medium':'Media' },
        { color:'#C83232', icon:<><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, days:'<15', type:isEN?'Large':'Grande' },
      ];
      body = (
        <div className="sv-leak-chips">
          {chips.map((c, i) => (
            <div key={i} className="sv-chip">
              <div className="sv-chip-dot" style={{ background:c.color }}>
                <svg viewBox="0 0 24 24">{c.icon}</svg>
              </div>
              <div className="sv-chip-days">{c.days}</div>
              <div className="sv-chip-type">{c.type}</div>
            </div>
          ))}
        </div>
      );
    } else if (n === 2 || n === 5) {
      body = (
        <div className="sv-gauge">
          <div className="sv-gauge-ring" style={n===5 ? { background:'conic-gradient(var(--orange) 0% 100%)' } : {}}>
            <div className="sv-gauge-inner">
              <div className="sv-gauge-val">{n===2 ? 'ON' : '100%'}</div>
              <div className="sv-gauge-label">{n===2 ? (isEN?'Running':'En marcha') : (isEN?'Circulated':'Circulado')}</div>
            </div>
          </div>
          <div className="sv-pills">
            {(n===2 ? ['Compressor','Refrigerant flow','Active'] : ['15–30 min',isEN?'Sealing':'Sellando',isEN?'Permanent':'Permanente']).map(p => <span key={p} className="sv-pill">{p}</span>)}
          </div>
        </div>
      );
    } else if (n === 3 || n === 4) {
      const nodes = n===3
        ? [{l:'Adapter',on:true},{l:'LP Port',on:true},{l:'Syringe',on:false},{l:'Circuit',on:false}]
        : [{l:'Syringe',on:true},{l:'LP Port',on:true},{l:'Circuit',on:true},{l:'Sealed',on:false}];
      body = (
        <div className="sv-flow">
          <div className="sv-flow-track"><div className="sv-flow-fill" style={n===3 ? { animation:'none', width:'35%' } : {}}></div></div>
          <div className="sv-flow-nodes">
            {nodes.map((nd, i) => (
              <div key={i} className={`sv-flow-node ${nd.on?'on':''}`}>
                <div className="sv-flow-node-dot"></div>
                <div className="sv-flow-node-label">{nd.l}</div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      body = (
        <div className="sv-uv">
          <div className="sv-uv-glow"></div>
          <div className="sv-uv-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
        </div>
      );
    }
    return (
      <div className="sv-panel">
        <div className="sv-grid"></div>
        <div className="sv-stepnum">{String(n).padStart(2,'0')}</div>
        <div className="sv-top">
          <div className="sv-icon"><svg viewBox="0 0 24 24">{svIcons[meta.icon]}</svg></div>
          <div>
            <div className="sv-step-label">{meta.label}</div>
            <div className="sv-step-title">{steps[n-1].title}</div>
          </div>
        </div>
        <div className="sv-body">{body}</div>
        <div className="sv-foot"><p className="sv-foot-text">{meta.foot}</p></div>
      </div>
    );
  }

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="breadcrumb"><a onClick={() => setPage('home')}>Home</a><span>/</span><span>{lang==='en'?'How It Works':'Cómo Funciona'}</span></div>
          <div className="eyebrow white">{lang==='en'?'Application Guide':'Guía de Aplicación'}</div>
          <h1 className="page-h1">{lang==='en'?<span>How K11 works<br/><em>in the field.</em></span>:<span>Cómo funciona K11<br/><em>en el campo.</em></span>}</h1>
          <p className="page-sub">{lang==='en'?'Step-by-step guide for HVAC-R technicians. From injection to UV verification — the complete K11 field process.':'Guía paso a paso para técnicos HVAC-R. Desde la inyección hasta la verificación UV — el proceso completo K11 en campo.'}</p>
        </div>
      </section>

      {/* Interactive steps */}
      <section className="section section-dark" style={{ paddingTop:'80px', paddingBottom:'80px' }}>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="steps-wrap">
            <div className="steps-list">
              {steps.map(step => (
                <div key={step.num} className={`step-row ${activeStep===step.num?'active':''}`} onClick={() => setActiveStepH(step.num)}>
                  <div className="step-circle">{step.num}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="step-visual">
              {renderStepVisual(activeStep)}
            </div>
          </div>
        </div>
      </section>

      {/* Leak Guide */}
      <section id="leak-guide" className="section section-dark-2" style={{ background:'var(--dark-2)', borderTop:'.5px solid var(--bd-dark)', borderBottom:'.5px solid var(--bd-dark)' }}>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="eyebrow white">{lang==='en'?'Leak Classification':'Clasificación de Fugas'}</div>
          <div className="display" style={{ color:'#fff', marginBottom:'40px' }}>{lang==='en'?'Know when K11 is\nthe right call.':'Sabé cuándo K11\nes la solución.'}</div>
          <div className="leak-grid">
            {leakItems.map((item, i) => (
              <div key={i} className="leak-card">
                <div className="leak-days" style={{ color:item.color }}>{item.days}</div>
                <span className={`leak-type ${item.cls}`}>{item.type}</span>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-warm" style={{ borderTop:'.5px solid var(--bd-light)' }}>
        <div style={{ maxWidth:'760px', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="eyebrow">{lang==='en'?'Technical FAQ':'FAQ Técnico'}</div>
          <div className="display dark-txt" style={{ fontSize:'clamp(2rem,3.5vw,3rem)', marginBottom:'40px' }}>{lang==='en'?'Technical questions.':'Preguntas técnicas.'}</div>
          <div className="faq-list">
            {faqItems.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq===i?'open':''}`}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq===i ? null : i)}>
                  {item.q}<div className="faq-icon"></div>
                </div>
                <div className="faq-a"><div className="faq-a-inner">{item.a}</div></div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:'36px' }}>
            <button className="btn btn-ghost-dark" onClick={() => { setPage('contact'); window.scrollTo({top:0}); }}>
              {lang==='en'?'Contact Technical Support':'Contactar Soporte Técnico'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { HowPage });
