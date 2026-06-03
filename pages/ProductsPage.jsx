/* ── ProductsPage.jsx ── */
const { useState: useStateP } = React;

function ProductsPage({ lang, setPage, openPreorder }) {
  const [filter, setFilter] = useStateP('all');
  const [activeThumb, setActiveThumb] = useStateP({});

  const cats = lang === 'en'
    ? [['all','All Products'],['sealant','Sealants'],['detection','Detection'],['accessories','Accessories']]
    : [['all','Todos'],['sealant','Selladores'],['detection','Detección'],['accessories','Accesorios']];

  const products = [
    {
      id:'tapafugas', cat:'sealant',
      badge: lang==='en' ? 'Bestseller' : 'Más Vendido',
      num:'01', title:'K11 TAPAFUGAS 2-IN-1',
      video: 'assets/tapafugas-video.mp4', videoEnd: 7.6,
      desc: lang==='en'
        ? 'The professional HVAC-R micro-leak sealant with integrated UV fluorescent tracer. The only product on the US market that permanently seals leaks AND detects them — simultaneously, in a single injection.'
        : 'El sellador profesional de micro-fugas HVAC-R con trazador UV fluorescente integrado. El único en el mercado USA que sella Y detecta — simultáneamente, en una sola inyección.',
      features: lang==='en'
        ? ['Polymer-free formula — safe for all components','Activates ONLY at leak contact with air/moisture','UV tracer marks exact sealed location','No system evacuation or downtime required','OEM manufacturer validated for 12+ years','ASHRAE 97 certified · NSF food grade approved']
        : ['Fórmula sin polímeros — segura para todos los componentes','Se activa SOLO en el punto de fuga al contactar aire/humedad','El trazador UV marca la ubicación exacta sellada','Sin evacuación del sistema ni tiempo muerto','Validado por OEM por más de 12 años','Certificado ASHRAE 97 · Aprobado NSF grado alimentario'],
      compat:['R22','R32','R410A','R134a','R404A','R290','R600a','R1234yf','R448A','R449A','R454B'],
      imgs:[
        'assets/tile_tapafugas.png',
        'assets/tapafugas-action.png',
        'assets/tile_revelafugas.png',
        'assets/tile_adapter.png',
      ]
    },
    {
      id:'revelafugas', cat:'detection',
      badge: lang==='en' ? 'UV Detection' : 'Detección UV',
      num:'02', title:'K11 REVELA FUGAS',
      video: 'assets/hero-video.mp4',
      desc: lang==='en'
        ? 'Ultra-high fluorescence UV dye for rapid leak location in any HVAC-R system. Compatible with all refrigerant types and oil formulations. Zero system impact — circulates and detects without affecting performance.'
        : 'Tinte UV de ultra-alta fluorescencia para localización rápida de fugas en cualquier sistema HVAC-R. Compatible con todos los tipos de refrigerante y aceite. Sin impacto en el sistema.',
      features: lang==='en'
        ? ['Ultra-high UV fluorescence intensity','Compatible with all refrigerant types','Compatible with mineral, POE, PAG oils','Zero impact on system performance','Visible under standard UV/violet light','Stays active in circuit for long-term monitoring']
        : ['Ultra-alta intensidad de fluorescencia UV','Compatible con todos los tipos de refrigerante','Compatible con aceites mineral, POE, PAG','Sin impacto en el rendimiento del sistema','Visible bajo luz UV/violeta estándar','Permanece activo en el circuito para monitoreo'],
      compat:['R22','R32','R410A','R134a','R404A','R407C','R290','All refrigerants'],
      imgs:[
        'assets/tile_revelafugas.png',
        'assets/tile_tapafugas.png',
      ]
    },
    {
      id:'sellaplus', cat:'sealant',
      badge: lang==='en' ? 'Sealant + Lubricant' : 'Sellador + Lubricante',
      num:'03', title:'K11 SELLA PLUS',
      video: 'assets/sella-plus-video.mp4',
      desc: lang==='en'
        ? 'Premium HVAC-R sealant AND lubricant. High-performance formulation designed to guarantee reliable sealing and superior lubrication for flanges, joints, connections, and O-rings. Blue in color for easy identification. Never hardens or crystallizes.'
        : 'Sellador Y lubricante HVAC-R premium. Fórmula de alto rendimiento diseñada para garantizar un sellado confiable y una lubricación superior en bridas, juntas, conexiones y O-rings. Color azul para fácil identificación. Nunca endurece ni cristaliza.',
      features: lang==='en'
        ? [
            'Seals flanges, connections, gaskets and O-rings',
            'Integrated lubricant — easy application',
            'Never hardens or crystallizes — stays flexible',
            'Blue color: easy control during installation and future maintenance',
            'Safe for all refrigerant systems and fluids',
            'ASHRAE 97 certified — Guaranteed Chemical Stability',
            '35ml precision applicator bottle (Code: SPK11)'
          ]
        : [
            'Sella bridas, conexiones, juntas y O-rings',
            'Lubricante integrado — aplicación fácil',
            'Nunca endurece ni cristaliza — permanece flexible',
            'Color azul: fácil control durante instalación e identificación futura',
            'Seguro para todos los sistemas y fluidos de refrigeración',
            'Certificado ASHRAE 97 — Estabilidad Química Garantizada',
            'Botella aplicadora de precisión 35ml (Cód: SPK11)'
          ],
      compat:['All refrigerants','All fluids','Flanges','Connections','Gaskets','O-rings'],
      imgs:['assets/tile_sellaplus.png']
    },
    {
      id:'adapters', cat:'accessories',
      badge: lang==='en' ? 'Accessories' : 'Accesorios',
      num:'04', title:'K11 ADAPTERS',
      video: 'assets/adapters-video.mp4',
      desc: lang==='en'
        ? 'Professional anti-backflow injection adapters for safe, precise K11 product injection into live refrigerant circuits. Available in 1/4" (standard) and 5/16" (mini-split) sizes. Reusable and durable.'
        : 'Adaptadores de inyección anti-retorno profesionales para inyección segura y precisa de productos K11 en circuitos de refrigerante activos. Disponibles en 1/4" (estándar) y 5/16" (mini-split). Reutilizables.',
      features: lang==='en'
        ? ['Anti-backflow safety valve design','1/4" standard (residential/commercial)','5/16" for mini-split systems','Reusable — built for multiple service calls','Required for correct K11 TapaFugas application','Compatible with all common service tools']
        : ['Diseño de válvula de seguridad anti-retorno','1/4" estándar (residencial/comercial)','5/16" para sistemas mini-split','Reutilizable — para múltiples llamadas de servicio','Requerido para aplicación correcta de K11 TapaFugas','Compatible con todas las herramientas de servicio comunes'],
      compat:['1/4" standard','5/16" mini-split','Reusable'],
      imgs:['assets/tile_adapter.png','assets/tile_tapafugas.png']
    },
  ];

  const filtered = filter === 'all' ? products : products.filter(p => p.cat === filter);

  const dosingItems = [
    { img:'assets/tile_tapafugas.png', dosage:'3 tons / 36,000 BTU', action: lang==='en'?'Seals micro-leaks':'Sella micro-fugas', usage: lang==='en'?'System maintains performance for +30 days':'Equipo mantiene rendimiento por +30 días', time: lang==='en'?'2h – 3h residential':'2h – 3h residencial' },
    { img:'assets/tile_revelafugas.png', dosage: lang==='en'?'3 liters of oil':'3 litros de aceite', action: lang==='en'?'Reveals all leaks':'Revela todas las fugas', usage: lang==='en'?'Preventive · Corrective':'Preventivo · Correctivo', time:'15 – 20 min' },
    { img:'assets/tile_tapafugas.png', dosage:'3 tons / 10.5 HP', action: lang==='en'?'Reveals + Seals':'Revela + Sella', usage: lang==='en'?'Ideal for 24/7 loops':'Ideal para circuitos 24/7', time: lang==='en'?'REVEALS: 20min · SEALS: 2–3h':'REVELA: 20min · SELLA: 2–3h' },
    { img:'assets/tile_sellaplus.png', dosage: lang==='en'?'Apply as needed\nto surface':'Aplicar según\nnecesidad', action: lang==='en'?'Seals &\nLubricates':'Sella y\nLubrica', usage: lang==='en'?'Flanges · Connections\nGaskets · O-rings':'Bridas · Conexiones\nJuntas · O-rings', time: lang==='en'?'Instant\napplication':'Aplicación\ninmediata' },
  ];

  const refCodes = ['R22','R32','R410A','R134a','R404A','R407C','R290','R600a','R1234yf','R448A','R449A','R454B'];
  const refNames = lang==='en'
    ? ['Legacy systems','New standard','Split systems','Auto / chiller','Refrigeration','Drop-in R22','Propane A3','Isobutane A3','New auto','R22 replacement','R404A replacement','R410A A2L sub.']
    : ['Sistemas legacy','Nuevo estándar','Sistemas split','Auto / chiller','Refrigeración','Reemplazo R22','Propano A3','Isobutano A3','Auto nuevo','Reemplazo R22','Reemplazo R404A','Sub. A2L R410A'];

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="breadcrumb">
            <a onClick={() => setPage('home')}>Home</a><span>/</span><span>{lang==='en'?'Products':'Productos'}</span>
          </div>
          <div className="eyebrow white">{lang==='en'?'Product Line':'Línea de Productos'}</div>
          <h1 className="page-h1">{lang==='en'?<span>The Complete<br/><em>K11 Toolkit.</em></span>:<span>El Kit<br/><em>Completo K11.</em></span>}</h1>
          <p className="page-sub">{lang==='en'?'Professional-grade solutions for every HVAC-R leak management need. All products ship from Miami, FL.':'Soluciones profesionales para cada necesidad de gestión de fugas HVAC-R. Todos los productos se envían desde Miami, FL.'}</p>
        </div>
      </section>

      <section className="section section-dark" style={{ paddingTop:'48px' }}>
        <div className="wrap">
          <div className="filter-row">
            {cats.map(([val, label]) => (
              <button key={val} className={`filter-btn ${filter===val?'active':''}`} onClick={() => setFilter(val)}>{label}</button>
            ))}
          </div>
          <div className="pf-grid">
            {filtered.map((prod) => {
              const thumbIdx = activeThumb[prod.id] || 0;
              return (
                <div key={prod.id} id={prod.id} className="pf-card" data-cat={prod.cat}>
                  <div className="pf-img-wrap">
                    <div className="pf-img-main">
                      {prod.video ? (
                        <video
                          src={prod.video}
                          autoPlay muted loop={!prod.videoEnd} playsInline
                          onTimeUpdate={prod.videoEnd ? (e)=>{ if(e.target.currentTime >= prod.videoEnd) e.target.currentTime = 0; } : undefined}
                          style={{ width:'100%', height:'100%', maxHeight:'360px', objectFit:'cover', borderRadius:'4px', filter:'drop-shadow(0 16px 40px rgba(0,0,0,.25))' }}
                        />
                      ) : (
                        <img id={`img-${prod.id}`} src={prod.imgs[thumbIdx]} alt={prod.title}/>
                      )}
                    </div>
                    {prod.video && (
                      <div style={{ position:'absolute', top:'14px', right:'14px', zIndex:3,
                        background:'rgba(212,84,26,.9)', color:'#fff', fontSize:'10px',
                        fontWeight:700, letterSpacing:'.08em', padding:'4px 10px',
                        borderRadius:'var(--r-pill)', backdropFilter:'blur(8px)' }}>
                        ▶ LIVE
                      </div>
                    )}
                    <span className="pf-img-badge">{prod.badge}</span>
                    {prod.imgs.length > 1 && (
                      <div className="pf-img-thumbs">
                        {prod.imgs.map((src, ti) => (
                          <div key={ti} className={`pf-img-thumb ${thumbIdx===ti?'active':''}`}
                               onClick={() => setActiveThumb(prev => ({...prev, [prod.id]: ti}))}>
                            <img src={src} alt={`${prod.title} view ${ti+1}`}/>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="pf-content">
                    <div className="pf-num">{prod.num}</div>
                    <div className="pf-title">{prod.title}</div>
                    <p className="pf-desc">{prod.desc}</p>
                    <ul className="pf-features">
                      {prod.features.map((f, fi) => <li key={fi}>{f}</li>)}
                    </ul>
                    <div className="pf-compat">
                      {prod.compat.map(c => <span key={c} className="compat-pill">{c}</span>)}
                    </div>
                    <div className="pf-actions">
                      <button className="btn btn-primary btn-sm" onClick={openPreorder}>
                        {lang==='en'?'Pre-Order Now':'Pre-Ordenar'} <svg className="arr" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </button>
                      <a href="https://wa.me/17869035295" target="_blank" rel="noopener" className="btn btn-outline-orange btn-sm">
                        {lang==='en'?'WhatsApp Order':'Pedir por WhatsApp'}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dosing Table */}
      <section className="dosing-section" id="dosing">
        <div className="wrap">
          <div className="dt-title">{lang==='en'?'Refrigerant Leak Solutions':'Soluciones para Fugas de Refrigerante'}</div>
          <div className="dosing-table">
            <div className="dtn-row hdr">
              <div className="dtn-col" style={{ border:'none' }}>&nbsp;</div>
              <div className="dtn-col">{lang==='en'?'Dosage':'Dosificación'}</div>
              <div className="dtn-col">{lang==='en'?'Action':'Acción'}</div>
              <div className="dtn-col">{lang==='en'?'Usage':'Uso'}</div>
              <div className="dtn-col">{lang==='en'?'Time':'Tiempo'}</div>
            </div>
            {dosingItems.map((d, i) => (
              <div key={i} className="dtn-row">
                <div className="dtn-col" style={{ border:'none' }}>
                  <img src={d.img} alt="K11 product" className="dtn-img"/>
                </div>
                <div className="dtn-col">{d.dosage}</div>
                <div className="dtn-col dt-orange">{d.action}</div>
                <div className="dtn-col">{d.usage}</div>
                <div className="dtn-col">{d.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatibility */}
      <section className="compat-full" id="compat">
        <div className="wrap">
          <div className="eyebrow white">{lang==='en'?'Compatibility':'Compatibilidad'}</div>
          <div className="headline" style={{ color:'#fff' }}>{lang==='en'?'Works with every refrigerant\nyou carry':'Compatible con cada refrigerante\nque usás'}</div>
          <div className="compat-grid">
            {refCodes.map((code, i) => (
              <div key={code} className="compat-card">
                <div className="compat-ref">{code}</div>
                <div className="compat-name">{refNames[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { ProductsPage });
