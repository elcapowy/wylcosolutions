/* ── HomePage.jsx ── */
const { useState, useEffect, useRef } = React;

/* Shared Icons */
const Arr = () => (
  <svg className="arr" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);

/* ---------- HERO ---------- */
function HeroSection({ lang, setPage, openPreorder }) {
  const T = window.T[lang].hero;
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const products = [
    { img:'assets/tile_tapafugas.png',
      tagCls:'tag-orange', tag: lang==='en'?'Bestseller · 2-in-1 Technology':'Bestseller · Tecnología 2-en-1',
      name:'K11 TapaFugas 2-in-1', desc: lang==='en'?'Seals AND detects — simultaneously. The only sealant of its kind in the US market.':'Sella Y detecta — simultáneamente. El único sellador de su tipo en el mercado USA.' },
    { img:'assets/tile_revelafugas.png',
      tagCls:'tag-green', tag: lang==='en'?'UV Detection':'Detección UV',
      name:'K11 Revela Fugas', desc: lang==='en'?'Ultra-high fluorescence UV dye. Find leaks instantly under UV light.':'Tinte UV de ultra-alta fluorescencia. Encuentra fugas instantáneamente.' },
    { img:'assets/tile_sellaplus.png', video:'assets/sella-plus-video.mp4',
      tagCls:'tag-gray', tag: lang==='en'?'Gasket & Thread Sealant':'Sellador de Juntas',
      name:'K11 Sella Plus', desc: lang==='en'?'Maximum adhesion for flanges, threads and gaskets. ASHRAE + NSF certified.':'Máxima adhesión para bridas, roscas y juntas. Certificado ASHRAE + NSF.' },
    { img:'assets/tile_adapter.png',
      tagCls:'tag-gray', tag: lang==='en'?'Accessories':'Accesorios',
      name:'K11 Adapters', desc: lang==='en'?'Anti-backflow injection adapters. 1/4" and 5/16" — fits every US service port.':'Adaptadores anti-retorno. 1/4" y 5/16" — compatibles con todos los puertos.' },
  ];

  function goTo(idx) {
    if (transitioning || idx === current) return;
    setTransitioning(true);
    setTimeout(() => { setCurrent(idx); setTransitioning(false); }, 300);
  }

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % products.length), 4000);
    return () => clearInterval(t);
  }, [current]);

  const p = products[current];

  return (
    <section className="hero">
      <video
        className="hero-video-bg"
        src="assets/hero-video.mp4"
        autoPlay muted loop playsInline
        aria-hidden="true"
      />
      <div className="hero-noise"></div>

      <div className="hero-left">
        <div className="hero-eyebrow">
          <span className="hero-dot"></span>
          {T.eyebrow}
        </div>
        <h1 className="hero-h1">
          {T.h1a}<br/>{T.h1b}<br/>
          <em>{T.h1c}</em>
          {T.h1d}
        </h1>
        <p className="hero-sub">{T.sub}</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={openPreorder}>
            {T.cta1} <Arr/>
          </button>
          <button className="btn btn-ghost-light" onClick={() => setPage('how')}>{T.cta2}</button>
        </div>
        <button className="btn-text white" onClick={() => { setPage('contact'); setTimeout(() => { document.getElementById('distributors')?.scrollIntoView({behavior:'smooth'}); }, 80); }}>
          {T.cta3} <Arr/>
        </button>
        <div className="hero-trust" style={{ marginTop:'32px' }}>
          {T.trust.map((tr, i) => (
            <div key={i} className="trust-pill">
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              {tr}
            </div>
          ))}
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-grid-bg"></div>
        <div className="hero-right-inner">
          <div className="hero-card" style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(8px)' : 'none', transition:'opacity .3s, transform .3s' }}>
            <div className="hero-card-img-wrap">
              {p.video ? (
                <video src={p.video} autoPlay muted loop playsInline
                  style={{ width:'100%', height:'196px', objectFit:'cover', opacity: transitioning ? 0 : 1, transition:'opacity .3s' }}/>
              ) : (
                <img src={p.img} alt={p.name} style={{ opacity: transitioning ? 0 : 1, transition:'opacity .3s' }}/>
              )}
            </div>
            <div className="hero-card-info">
              <span className={`tag ${p.tagCls}`}>{p.tag}</span>
              <div className="hero-card-name">{p.name}</div>
              <p className="hero-card-desc">{p.desc}</p>
            </div>
            <div className="hero-card-dots">
              {products.map((_, i) => (
                <button key={i} className={`hero-card-dot ${i===current?'active':''}`} onClick={() => goTo(i)}/>
              ))}
            </div>
          </div>

          <div className="hero-float hf1">
            <div className="hero-float-num">12<em>+</em></div>
            <div className="hero-float-label">{lang==='en'?'Years OEM Validated':'Años Validado OEM'}</div>
          </div>
          <div className="hero-float hf2">
            <div className="hero-float-num">80<em>%</em></div>
            <div className="hero-float-label">{lang==='en'?'AC Failures from Leaks':'Fallas AC por Fugas'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PROOF BAR ---------- */
function ProofBar({ lang }) {
  const items = window.T[lang].proof;
  const icons = [
    <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  ];
  return (
    <div className="proof-bar">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <div className="proof-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2">{icons[i].props.children}</svg>
            {item}
          </div>
          {i < items.length - 1 && <div className="proof-div"></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- METRICS ---------- */
function MetricsSection({ lang }) {
  const T = window.T[lang].metrics;
  const ref = useRef(null);
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !counted) setCounted(true); }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [counted]);

  return (
    <section className="section section-dark" style={{ borderBottom:'.5px solid var(--bd-dark)' }}>
      <div className="wrap">
        <div className="reveal" style={{ marginBottom:'48px' }}>
          <div className="eyebrow white">{T.eyebrow}</div>
          <div className="display" style={{ color:'#fff' }}>{T.title}</div>
        </div>
        <div className="metrics-grid" ref={ref}>
          {T.items.map((item, i) => (
            <div key={i} className="metric-card reveal" style={{ transitionDelay:`${i*0.08}s` }}>
              <div className="metric-num">{item.num}<em>{item.suf}</em></div>
              <div className="metric-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- HOW IT WORKS (preview) ---------- */
function HowSection({ lang, setPage }) {
  const T = window.T[lang].how;
  const icons = [
    <svg viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
    <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  ];
  return (
    <section className="section section-warm" style={{ borderBottom:'.5px solid var(--bd-light)' }}>
      <div className="wrap">
        <div style={{ textAlign:'center', maxWidth:'560px', margin:'0 auto 64px' }} className="reveal">
          <div className="eyebrow no-line" style={{ justifyContent:'center' }}>{T.eyebrow}</div>
          <div className="display dark-txt" style={{ whiteSpace:'pre-line' }}>{T.title}</div>
          <p className="body-lg muted" style={{ marginTop:'14px' }}>{T.sub}</p>
        </div>
        <div className="steps-grid">
          {T.steps.map((step, i) => (
            <div key={i} className="step-card reveal" style={{ transitionDelay:`${i*0.1}s` }}>
              <div className="step-bg-num">{step.num}</div>
              <div className="step-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.8">{icons[i].props.children}</svg>
              </div>
              <div className="step-title">{step.num} — {step.title}</div>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:'40px' }} className="reveal">
          <button className="btn btn-ghost-dark" onClick={() => { setPage('how'); window.scrollTo({top:0}); }}>
            {T.cta} <Arr/>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- WHY K11 ---------- */
function WhySection({ lang }) {
  const T = window.T[lang].why;
  const icons = [
    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13 1 .37 1.97.72 2.89a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.92.35 1.88.59 2.89.72A2 2 0 0122 16.92z"/></svg>,
    <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  ];
  return (
    <section className="section section-dark" style={{ borderBottom:'.5px solid var(--bd-dark)' }}>
      <div className="wrap">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'64px', alignItems:'end', marginBottom:'56px' }}>
          <div className="reveal">
            <div className="eyebrow white">{T.eyebrow}</div>
            <div className="display" style={{ color:'#fff', whiteSpace:'pre-line' }}>{T.title}</div>
          </div>
          <p className="body-lg white-muted reveal d1" style={{ alignSelf:'flex-end' }}>{T.sub}</p>
        </div>
        <div className="why-grid">
          {T.items.map((item, i) => (
            <div key={i} className="why-card reveal" style={{ transitionDelay:`${i*0.08}s` }}>
              <div className="why-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.8">{icons[i].props.children}</svg>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- PRODUCTS SHOWCASE ---------- */
function ProductsSection({ lang, setPage }) {
  const T = window.T[lang].products;
  const prods = [
    { img:'assets/tile_tapafugas.png', video:'assets/tapafugas-video.mp4', videoEnd:7.6, tagCls:'tag-orange', tag:lang==='en'?'Bestseller · 2-in-1':'Bestseller · 2-en-1', name:lang==='en'?'K11 TapaFugas 2-in-1\nSeal + UV Detect':'K11 TapaFugas 2-en-1\nSella + Detecta UV', desc:lang==='en'?'The only product on the US market that seals micro-leaks AND detects them with UV fluorescence — simultaneously. OEM-validated for 12+ years.':'El único en el mercado USA que sella Y detecta fugas con UV — simultáneamente. Validado por OEM por más de 12 años.', compat:['R22','R410A','R32','R134a','All HVAC-R'], featured:true, page:'products', anchor:'tapafugas' },
    { img:'assets/tile_revelafugas.png', video:'assets/hero-video.mp4', tagCls:'tag-green', tag:lang==='en'?'UV Detection':'Detección UV', name:'K11 Revela Fugas', desc:lang==='en'?'Ultra-high fluorescence UV dye. Find leaks under UV light with zero system impact.':'Tinte UV de ultra-alta fluorescencia. Encuentra fugas sin impactar el sistema.', featured:false, page:'products', anchor:'revelafugas' },
    { img:'assets/tile_sellaplus.png', video:'assets/sella-plus-video.mp4', tagCls:'tag-green', tag:lang==='en'?'Sealant + Lubricant':'Sellador + Lubricante', name:'K11 Sella Plus', desc:lang==='en'?'Premium HVAC-R sealant AND lubricant for flanges, connections, gaskets & O-rings. Blue color for easy ID. Never hardens. ASHRAE 97 certified.':'Sellador Y lubricante HVAC-R premium para bridas, conexiones, juntas y O-rings. Color azul para identificación. Nunca endurece. Certificado ASHRAE 97.', featured:false, page:'products', anchor:'sellaplus' },
    { img:'assets/tile_adapter.png', video:'assets/adapters-video.mp4', tagCls:'tag-gray', tag:lang==='en'?'Accessories':'Accesorios', name:lang==='en'?'K11 Adapters':'Adaptadores K11', desc:lang==='en'?'Anti-backflow injection adapters. 1/4" and 5/16" — fits every US service port.':'Adaptadores anti-retorno. 1/4" y 5/16" — compatibles con todos los puertos.', featured:false, page:'products', anchor:'adapters' },
  ];
  return (
    <section className="section section-warm" style={{ borderBottom:'.5px solid var(--bd-light)' }}>
      <div className="wrap">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'48px', alignItems:'end', marginBottom:'40px' }}>
          <div className="reveal">
            <div className="eyebrow">{T.eyebrow}</div>
            <div className="display dark-txt">{T.title}</div>
          </div>
          <div className="reveal d1">
            <p className="body-md muted">{T.sub}</p>
            <button className="btn btn-ghost-dark" style={{ marginTop:'20px' }} onClick={() => { setPage('products'); window.scrollTo({top:0}); }}>
              {T.cta} <Arr/>
            </button>
          </div>
        </div>
        <div className="prod-grid reveal">
          {prods.map((prod, i) => prod.featured ? (
            <div key={i} className="prod-card featured">
              <div className="prod-card-img" style={{ padding: prod.video ? '0' : undefined, overflow:'hidden' }}>
                {prod.video ? (
                  <video src={prod.video} autoPlay muted loop={!prod.videoEnd} playsInline
                    onTimeUpdate={prod.videoEnd ? (e)=>{ if(e.target.currentTime >= prod.videoEnd) e.target.currentTime = 0; } : undefined}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                ) : (
                  <img src={prod.img} alt={prod.name}/>
                )}
              </div>
              <div className="prod-card-body">
                <span className={`tag ${prod.tagCls}`} style={{ marginBottom:'12px' }}>{prod.tag}</span>
                <div className="prod-card-name" style={{ whiteSpace:'pre-line' }}>{prod.name}</div>
                <p className="prod-card-desc">{prod.desc}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'16px' }}>
                  {prod.compat.map(c => <span key={c} className="compat-pill" style={{ background:'rgba(0,0,0,.06)', border:'.5px solid rgba(0,0,0,.1)', color:'var(--txt-muted)' }}>{c}</span>)}
                </div>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => { setPage(prod.page); }}>{lang==='en'?'Pre-Order Now':'Pre-Ordenar'}</button>
                  <button className="btn btn-ghost-dark btn-sm" onClick={() => { setPage(prod.page); window.scrollTo({top:0}); }}>{lang==='en'?'Learn More':'Ver Más'}</button>
                </div>
              </div>
            </div>
          ) : (
            <div key={i} className="prod-card" onClick={() => { setPage(prod.page); window.scrollTo({top:0}); }}>
              <div className="prod-card-img" style={{ padding: prod.video ? '0' : '28px', overflow:'hidden' }}>
                {prod.video ? (
                  <video src={prod.video} autoPlay muted loop playsInline
                    style={{ width:'100%', height:'140px', objectFit:'cover' }}/>
                ) : (
                  <img src={prod.img} alt={prod.name}/>
                )}
              </div>
              <div className="prod-card-body">
                <span className={`tag ${prod.tagCls}`} style={{ marginBottom:'10px', display:'block' }}>{prod.tag}</span>
                <div className="prod-card-name">{prod.name}</div>
                <p className="prod-card-desc">{prod.desc}</p>
                <button className="btn btn-outline-orange btn-sm">{lang==='en'?'View Product':'Ver Producto'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- COMPARISON ---------- */
function CompSection({ lang }) {
  const T = window.T[lang].comp;
  const rows = [
    { brand:'Wylco / K11 2-in-1', you:true, cols:['✓ Both','✓ All','✓ 10–60ml (0.3–2 oz)','✓ Yes'], cls:'winner' },
    { brand:'Leak Saver Direct Inject', cols:['~ UV add-on','✓','—','—'] },
    { brand:'Nu-Calgon EasySeal', cols:['—','✓','2.5oz only','—'] },
    { brand:'RectorSeal AC Freeze Pro', cols:['—','✓','1.5oz only','—'] },
    { brand:'BlueDevil Red Angel', cols:['—','R134a only','—','—'] },
  ];
  const hdrs = lang==='en'
    ? ['Product','Seal + UV Detect','All Refrigerants','Precision Dose','OEM Validated']
    : ['Producto','Sella + Detecta UV','Todos Refrig.','Dosis Precisa','Validado OEM'];

  return (
    <section className="section section-white" style={{ borderBottom:'.5px solid var(--bd-light)' }}>
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
        <div style={{ textAlign:'center', marginBottom:'48px' }} className="reveal">
          <div className="eyebrow no-line" style={{ justifyContent:'center' }}>{T.eyebrow}</div>
          <div className="display dark-txt">{T.title}</div>
          <p className="body-md muted" style={{ maxWidth:'480px', margin:'16px auto 0', textAlign:'center' }}>{T.sub}</p>
        </div>
        <div className="comp-table reveal">
          <div className="comp-row hdr">
            {hdrs.map((h,i) => <span key={i}>{h}</span>)}
          </div>
          {rows.map((row, i) => (
            <div key={i} className={`comp-row ${row.cls||''}`}>
              <span className={row.you ? 'comp-brand-k11' : 'comp-brand'}>
                {row.brand}
                {row.you && <span className="you-badge">{lang==='en'?'You':'Vos'}</span>}
              </span>
              {row.cols.map((c, j) => (
                <span key={j} className={c.startsWith('✓') ? 'ci' : c==='—' ? 'cx' : 'cp'}>{c}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- DISTRIBUTOR ---------- */
function DistSection({ lang, setPage }) {
  const T = window.T[lang].dist;
  const icons = [
    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  ];
  return (
    <section className="section section-dark" style={{ position:'relative', overflow:'hidden', borderBottom:'.5px solid var(--bd-dark)' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(212,84,26,.06), transparent)', pointerEvents:'none' }}></div>
      <div className="wrap">
        <div className="dist-inner-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'center' }}>
          <div className="reveal">
            <div className="eyebrow white">{T.eyebrow}</div>
            <div className="display" style={{ color:'#fff', whiteSpace:'pre-line', marginBottom:'20px' }}>{T.title}</div>
            <p className="body-md white-muted" style={{ marginBottom:'36px' }}>{T.sub}</p>
            <div style={{ display:'grid', gap:'10px' }}>
              {T.benefits.map((b, i) => (
                <div key={i} className="dist-benefit">
                  <div className="dist-benefit-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2">{icons[i].props.children}</svg>
                  </div>
                  <div><h4>{b.title}</h4><p>{b.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal d2" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div className="dist-stat-grid">
              {T.stats.map((s, i) => (
                <div key={i} className="dist-stat">
                  <div className="dist-stat-num">{s.num}<em>{s.suf}</em></div>
                  <div className="dist-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="dist-cta-card">
              <h3>{T.ctaTitle}</h3>
              <p>{T.ctaSub}</p>
              <button className="btn-white" onClick={() => { setPage('contact'); setTimeout(() => document.getElementById('distributors')?.scrollIntoView({behavior:'smooth'}), 80); }}>
                {T.ctaBtn} <Arr/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- TESTIMONIALS ---------- */
function TestimonialsSection({ lang }) {
  const T = window.T[lang].testimonials;
  return (
    <section className="section section-warm" style={{ borderBottom:'.5px solid var(--bd-light)' }}>
      <div className="wrap">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'48px', alignItems:'end', marginBottom:'48px' }}>
          <div className="reveal">
            <div className="eyebrow">{T.eyebrow}</div>
            <div className="display dark-txt">{T.title}</div>
          </div>
          <p className="body-md muted reveal d1" style={{ alignSelf:'flex-end' }}>{T.sub}</p>
        </div>
        <div className="test-grid">
          {T.items.map((t, i) => (
            <div key={i} className="test-card reveal" style={{ transitionDelay:`${i*0.1}s` }}>
              <div>
                <div className="test-stars">{[1,2,3,4,5].map(s => <span key={s}>★</span>)}</div>
                <p className="test-quote">"{t.quote}"</p>
              </div>
              <div className="test-author">
                <div className="test-avatar">{t.name.split(' ').map(w=>w[0]).join('')}</div>
                <div><div className="test-name">{t.name}</div><div className="test-role">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- MARKET STATS ---------- */
function MarketSection({ lang }) {
  const T = window.T[lang].market;
  return (
    <section className="section section-dark" style={{ textAlign:'center', borderBottom:'.5px solid var(--bd-dark)' }}>
      <div className="wrap">
        <div className="reveal" style={{ marginBottom:'56px' }}>
          <div className="eyebrow white no-line" style={{ justifyContent:'center' }}>{T.eyebrow}</div>
          <div className="display" style={{ color:'#fff' }}>{T.title}</div>
          <p className="body-md white-muted" style={{ maxWidth:'520px', margin:'16px auto 0' }}>{T.sub}</p>
        </div>
        <div className="market-stats reveal">
          {T.items.map((item, i) => (
            <div key={i} className="market-stat">
              <div className="market-stat-num">{item.num}<em>{item.suf}</em></div>
              <div className="market-stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- SDS STRIP ---------- */
function DocsStrip({ lang, setPage }) {
  const T = window.T[lang].docs_strip;
  return (
    <div className="docs-strip reveal">
      <div className="docs-strip-inner">
        <div className="docs-strip-left">
          <h2>{T.title}</h2>
          <p>{T.sub}</p>
        </div>
        <div className="docs-strip-right">
          <button className="btn btn-primary" onClick={() => { setPage('docs'); window.scrollTo({top:0}); }}>{T.btn1}</button>
          <button className="btn btn-ghost-light" onClick={() => { setPage('contact'); window.scrollTo({top:0}); }}>{T.btn2}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- PREORDER ---------- */
function PreorderSection({ lang, preorderRef }) {
  const T = window.T[lang].preorder;
  const [done, setDone] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const origText = btn.textContent;
    btn.textContent = '...';
    btn.disabled = true;
    const fd = new FormData(e.target);
    const params = {
      from_name:    fd.get('name') || '—',
      from_email:   fd.get('email'),
      company:      fd.get('company') || '—',
      phone:        fd.get('phone') || '—',
      inquiry_type: lang === 'en' ? 'Pre-Order / Quote Request' : 'Pre-Order / Cotización',
      message:      '—',
      lang:         lang === 'en' ? 'English' : 'Español',
    };
    try {
      await window.wylcoSend(window.EJS.tplContact, params);
      setDone(true);
    } catch(err) {
      console.error('EmailJS preorder error:', err);
      btn.textContent = origText;
      btn.disabled = false;
    }
  }
  return (
    <section id="preorder" className="preorder-section section" ref={preorderRef}>
      <div className="preorder-bg"></div>
      <div className="preorder-inner">
        <div className="eyebrow no-line" style={{ justifyContent:'center', color:'rgba(255,255,255,.5)' }}>{T.eyebrow}</div>
        <div className="headline" style={{ color:'#fff', marginBottom:'16px', fontSize:'clamp(2rem,4vw,3rem)' }}>{T.title}</div>
        <p className="body-md white-muted" style={{ marginBottom:'36px' }}>{T.sub}</p>
        {done ? (
          <div className="preorder-success" style={{ display:'block' }}>
            <h3>{T.success.title}</h3>
            <p style={{ color:'rgba(255,255,255,.6)', marginTop:'.5rem' }}>{T.success.sub}</p>
          </div>
        ) : (
          <form className="preorder-form" onSubmit={submit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              <input name="name" type="text" placeholder={T.ph1} required/>
              <input name="company" type="text" placeholder={T.ph2}/>
            </div>
            <input name="email" type="email" placeholder={T.ph3} required/>
            <input name="phone" type="tel" placeholder={T.ph4}/>
            <button type="submit">{T.btn}</button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FaqSection({ lang }) {
  const T = window.T[lang].faq;
  const [open, setOpen] = useState(null);
  return (
    <section className="section section-warm" style={{ borderTop:'.5px solid var(--bd-light)' }}>
      <div style={{ maxWidth:'760px', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
        <div className="reveal">
          <div className="eyebrow">{T.eyebrow}</div>
          <div className="display dark-txt" style={{ fontSize:'clamp(2rem,3.5vw,3rem)' }}>{T.title}</div>
        </div>
        <div className="faq-list">
          {T.items.map((item, i) => (
            <div key={i} className={`faq-item reveal ${open===i?'open':''}`} style={{ transitionDelay:`${i*0.06}s` }}>
              <div className="faq-q" onClick={() => setOpen(open===i ? null : i)}>
                {item.q}<div className="faq-icon"></div>
              </div>
              <div className="faq-a"><div className="faq-a-inner">{item.a}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */
function FinalCta({ lang, setPage, openPreorder }) {
  const T = window.T[lang].finalCta;
  return (
    <section className="final-cta section" style={{ borderTop:'.5px solid var(--bd-dark)' }}>
      <div className="final-cta-bg"></div>
      <div style={{ maxWidth:'680px', margin:'0 auto', position:'relative', zIndex:2, textAlign:'center' }} className="reveal">
        <div className="eyebrow no-line" style={{ justifyContent:'center', color:'rgba(255,255,255,.4)' }}>{T.eyebrow}</div>
        <h2 className="final-cta" style={{ fontFamily:'var(--fd)', fontWeight:900, fontSize:'clamp(3rem,7vw,7rem)', lineHeight:.88, letterSpacing:'.02em', textTransform:'uppercase', color:'#fff', marginBottom:'20px' }}>
          {T.h2a}<br/><span style={{ color:'var(--orange)' }}>{T.h2b}</span><br/>{T.h2c}
        </h2>
        <p className="body-md white-muted" style={{ maxWidth:'420px', margin:'0 auto 44px' }}>{T.sub}</p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => { setPage('contact'); window.scrollTo({top:0}); }}>{T.btn1}</button>
          <button className="btn btn-ghost-light btn-lg" onClick={() => { setPage('contact'); setTimeout(() => document.getElementById('distributors')?.scrollIntoView({behavior:'smooth'}), 80); }}>{T.btn2}</button>
          <a href="https://wa.me/17869035295" target="_blank" rel="noopener" className="btn btn-ghost-light btn-lg" style={{ textDecoration:'none' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.533 5.849L.057 23.516a.5.5 0 00.609.61l5.805-1.522A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 01-5.187-1.453l-.371-.221-3.845 1.008 1.026-3.741-.242-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            {T.btn3}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- HOME PAGE ASSEMBLY ---------- */
function HomePage({ lang, setPage, openPreorder, preorderRef }) {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.07, rootMargin:'0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [lang]);

  return (
    <div>
      <HeroSection lang={lang} setPage={setPage} openPreorder={openPreorder}/>
      <ProofBar lang={lang}/>
      <div className="brand-banner">
        <img src="assets/k11-banner.jpg.png" alt="K11 America — HVAC-R technician Miami" className="brand-banner-img"/>
        <div className="brand-banner-overlay"></div>
        <div className="brand-banner-label">
          <span>K11 America</span>
          <span style={{ opacity:.4 }}>·</span>
          <span>{lang==='en'?'Advancing HVAC-R Innovation Across the USA':'Avanzando la Innovación HVAC-R en los EE.UU.'}</span>
        </div>
      </div>
      <MetricsSection lang={lang}/>
      <HowSection lang={lang} setPage={setPage}/>
      <WhySection lang={lang}/>
      <ProductsSection lang={lang} setPage={setPage}/>
      <CompSection lang={lang}/>
      <DistSection lang={lang} setPage={setPage}/>
      <TestimonialsSection lang={lang}/>
      <MarketSection lang={lang}/>
      <DocsStrip lang={lang} setPage={setPage}/>
      <PreorderSection lang={lang} preorderRef={preorderRef}/>
      <FaqSection lang={lang}/>
      <FinalCta lang={lang} setPage={setPage} openPreorder={openPreorder}/>
    </div>
  );
}

Object.assign(window, { HomePage });
