/* ── Footer.jsx ── */
function Footer({ setPage, lang }) {
  const T = window.T[lang];
  const F = T.footer;

  function navTo(p, anchor) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (anchor) setTimeout(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  const pageMap = [
    ['products','tapafugas'],['products','revelafugas'],
    ['products','sellaplus'],['products','adapters']
  ];
  const compMap = [['about'],['how'],['docs'],['contact']];
  const distMap = [['contact','distributors'],['contact','distributors'],
                   ['contact','distributors'],['contact']];

  return (
    <footer style={{ background:'var(--dark)', padding:'64px max(24px,5vw) 32px', borderTop:'.5px solid var(--bd-dark)' }}>
      <div style={{ maxWidth:'var(--mw)', margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'48px', marginBottom:'48px' }}>

          {/* Brand col */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px', cursor:'pointer' }}
                 onClick={() => navTo('home')}>
              <img src="assets/logo-wylco.png" alt="Wylco"
                   style={{ width:'32px', height:'32px', objectFit:'contain' }} />
              <span style={{ fontFamily:'var(--fd)', fontSize:'1.1rem', fontWeight:800,
                             letterSpacing:'.14em', color:'#fff', textTransform:'uppercase' }}>
                WYLCO
              </span>
            </div>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,.35)', lineHeight:1.65,
                        maxWidth:'220px', marginBottom:'20px' }}>
              {F.tagline}
            </p>
            <div style={{ display:'flex', gap:'8px' }}>
              {/* WhatsApp */}
              <a href="https://wa.me/17869035295" target="_blank" rel="noopener"
                 style={{ width:'30px', height:'30px', borderRadius:'50%',
                          background:'rgba(255,255,255,.08)', border:'.5px solid rgba(255,255,255,.1)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          color:'rgba(255,255,255,.5)', transition:'all .2s', textDecoration:'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.533 5.849L.057 23.516a.5.5 0 00.609.61l5.805-1.522A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 01-5.187-1.453l-.371-.221-3.845 1.008 1.026-3.741-.242-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product col */}
          <div>
            <h4 style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.1em',
                         textTransform:'uppercase', color:'rgba(255,255,255,.25)', marginBottom:'16px' }}>
              {F.cols[0].title}
            </h4>
            <ul style={{ display:'grid', gap:'10px' }}>
              {F.cols[0].links.map((lk, i) => (
                <li key={i}>
                  <button onClick={() => navTo(pageMap[i][0], pageMap[i][1])}
                          style={{ fontSize:'13px', color:'rgba(255,255,255,.5)', background:'none',
                                   border:'none', fontFamily:'var(--fb)', padding:0, cursor:'pointer',
                                   transition:'color .2s', textAlign:'left' }}>
                    {lk}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company col */}
          <div>
            <h4 style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.1em',
                         textTransform:'uppercase', color:'rgba(255,255,255,.25)', marginBottom:'16px' }}>
              {F.cols[1].title}
            </h4>
            <ul style={{ display:'grid', gap:'10px' }}>
              {F.cols[1].links.map((lk, i) => (
                <li key={i}>
                  <button onClick={() => navTo(compMap[i][0], compMap[i][1])}
                          style={{ fontSize:'13px', color:'rgba(255,255,255,.5)', background:'none',
                                   border:'none', fontFamily:'var(--fb)', padding:0, cursor:'pointer',
                                   transition:'color .2s', textAlign:'left' }}>
                    {lk}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Distributors col */}
          <div>
            <h4 style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.1em',
                         textTransform:'uppercase', color:'rgba(255,255,255,.25)', marginBottom:'16px' }}>
              {F.cols[2].title}
            </h4>
            <ul style={{ display:'grid', gap:'10px' }}>
              {F.cols[2].links.map((lk, i) => (
                <li key={i}>
                  <button onClick={() => navTo(distMap[i][0], distMap[i][1])}
                          style={{ fontSize:'13px', color:'rgba(255,255,255,.5)', background:'none',
                                   border:'none', fontFamily:'var(--fb)', padding:0, cursor:'pointer',
                                   transition:'color .2s', textAlign:'left' }}>
                    {lk}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                      paddingTop:'24px', borderTop:'.5px solid rgba(255,255,255,.1)',
                      fontSize:'12px', color:'rgba(255,255,255,.25)', flexWrap:'wrap', gap:'12px' }}>
          <span>{F.legal}</span>
          <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
            <button onClick={() => navTo('privacy')}
                    style={{ color:'rgba(255,255,255,.35)', background:'none', border:'none',
                             fontFamily:'var(--fb)', fontSize:'12px', cursor:'pointer' }}>
              {F.privacy}
            </button>
            <button onClick={() => navTo('terms')}
                    style={{ color:'rgba(255,255,255,.35)', background:'none', border:'none',
                             fontFamily:'var(--fb)', fontSize:'12px', cursor:'pointer' }}>
              {F.terms}
            </button>
            <span style={{ background:'rgba(212,84,26,.2)', border:'.5px solid rgba(212,84,26,.3)',
                           color:'rgba(255,255,255,.6)', fontSize:'10px', fontWeight:700,
                           letterSpacing:'.04em', padding:'3px 9px', borderRadius:'var(--r-pill)' }}>
              {F.badge}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
