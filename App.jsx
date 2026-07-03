/* ── App.jsx ── */
const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp } = React;

function App() {
  const [page, setPage] = useStateApp('home');
  const [lang, setLang] = useStateApp(() => localStorage.getItem('wylco_lang') || 'en');
  const preorderRef = useRefApp(null);

  /* persist lang */
  useEffectApp(() => {
    localStorage.setItem('wylco_lang', lang);
    window.LANG = lang;
  }, [lang]);

  /* expose setPage globally (used in DocsPage request banner) */
  useEffectApp(() => { window.setPage = setPage; }, []);

  /* scroll reveal re-init on page change */
  useEffectApp(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('in');
        io.observe(el);
      });
      /* safety net: if the observer ever misses an element (fast scroll,
         re-render, restored scroll position), force-reveal anything still
         hidden so content is never stuck at opacity:0 */
      const safety = setInterval(() => {
        document.querySelectorAll('.reveal:not(.in)').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
        });
      }, 400);
      window.__revealSafety && clearInterval(window.__revealSafety);
      window.__revealSafety = safety;
      return () => { io.disconnect(); clearInterval(safety); };
    }, 60);
  }, [page]);

  /* top-bar + nav offset */
  const TOP_BAR_H = 40;
  const NAV_H = 60;
  const totalOffset = TOP_BAR_H + NAV_H;

  useEffectApp(() => {
    document.documentElement.style.setProperty('--nav-h', `${totalOffset}px`);
  }, []);

  function openPreorder() {
    if (page !== 'home') {
      setPage('home');
      setTimeout(() => {
        const el = document.getElementById('preorder');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } else {
      const el = document.getElementById('preorder');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* handle browser back/forward */
  useEffectApp(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['home','products','how','about','contact','docs','privacy','terms'].includes(hash)) {
      setPage(hash);
    }
  }, []);

  useEffectApp(() => {
    window.history.pushState({ page }, '', '#' + page);
  }, [page]);

  useEffectApp(() => {
    const onPop = (e) => { if (e.state?.page) setPage(e.state.page); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const pages = {
    home:    <HomePage    lang={lang} setPage={setPage} openPreorder={openPreorder} preorderRef={preorderRef}/>,
    products:<ProductsPage lang={lang} setPage={setPage} openPreorder={openPreorder}/>,
    how:     <HowPage     lang={lang} setPage={setPage}/>,
    about:   <AboutPage   lang={lang} setPage={setPage}/>,
    contact: <ContactPage lang={lang} setPage={setPage}/>,
    docs:    <DocsPage    lang={lang} setPage={setPage}/>,
    privacy: (
      <div style={{ paddingTop:'var(--nav-h)' }}>
        <div className="legal-wrap">
          <div className="breadcrumb"><a onClick={() => setPage('home')}>Home</a><span>/</span><span>Privacy Policy</span></div>
          <h1>Privacy Policy</h1>
          <p style={{ color:'rgba(255,255,255,.3)', fontSize:'.85rem', marginBottom:'2rem' }}>Last updated: January 2026</p>
          <p>Wylco LLC ("Wylco", "we", "our") operates the K11 America website. This Privacy Policy describes how we collect, use, and protect your information.</p>
          <h2>Information We Collect</h2>
          <p>We collect information you provide directly: name, email, phone number, company, and message content submitted through our contact forms. We may also collect analytics data about how you use our website.</p>
          <h2>How We Use Your Information</h2>
          <ul><li>To respond to your inquiries and quote requests</li><li>To process distributor applications</li><li>To send relevant product updates (with your consent)</li><li>To improve our website and services</li></ul>
          <h2>Data Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties.</p>
          <h2>Contact</h2>
          <p>For privacy inquiries: <a href="mailto:info@wylcosolutions.com">info@wylcosolutions.com</a></p>
        </div>
      </div>
    ),
    terms: (
      <div style={{ paddingTop:'var(--nav-h)' }}>
        <div className="legal-wrap">
          <div className="breadcrumb"><a onClick={() => setPage('home')}>Home</a><span>/</span><span>Terms of Use</span></div>
          <h1>Terms of Use</h1>
          <p style={{ color:'rgba(255,255,255,.3)', fontSize:'.85rem', marginBottom:'2rem' }}>Last updated: January 2026</p>
          <p>By accessing and using this website, you accept and agree to be bound by the following terms and conditions.</p>
          <h2>Use of Website</h2>
          <p>This website is provided for informational and commercial inquiry purposes. All product information is provided in good faith.</p>
          <h2>Products & Ordering</h2>
          <p>Product availability, pricing, and shipping terms are subject to change. All orders are subject to confirmation by Wylco LLC. B2B pricing requires a formal quote.</p>
          <h2>Intellectual Property</h2>
          <p>All content on this website is the property of Wylco LLC or its licensors and may not be reproduced without written permission.</p>
          <h2>Contact</h2>
          <p>For questions: <a href="mailto:info@wylcosolutions.com">info@wylcosolutions.com</a></p>
        </div>
      </div>
    ),
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Nav
        page={page}
        setPage={setPage}
        lang={lang}
        setLang={setLang}
        openPreorder={openPreorder}
      />

      <main style={{ flex:1, paddingTop:'var(--nav-h)' }}>
        {pages[page] || pages.home}
      </main>

      <Footer setPage={setPage} lang={lang}/>

      {/* WhatsApp float */}
      <a href="https://wa.me/17869035295?text=Hi%2C+I%27d+like+to+know+more+about+K11+products"
         target="_blank" rel="noopener" className="wa-float" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.533 5.849L.057 23.516a.5.5 0 00.609.61l5.805-1.522A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 01-5.187-1.453l-.371-.221-3.845 1.008 1.026-3.741-.242-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
