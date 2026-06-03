/* ── Nav.jsx ── */
const { useState, useEffect } = React;

function Nav({ page, setPage, lang, setLang, openPreorder }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const T = window.T[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function navTo(p, anchor) {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }

  const links = [
    { key: 'home', label: T.nav.home },
    { key: 'products', label: T.nav.products },
    { key: 'how', label: T.nav.how },
    { key: 'contact', label: T.nav.distributors, anchor: 'distributors' },
    { key: 'docs', label: T.nav.docs },
    { key: 'contact', label: T.nav.contact },
  ];

  return (
    <React.Fragment>
      <div className="top-bar">
        {T.topBar}
        <a onClick={() => openPreorder()}>{T.topBarLink}</a>
      </div>
      <nav className={scrolled ? 'scrolled' : ''} style={{ top: '40px' }}>
        <div className="nav-logo" onClick={() => navTo('home')}>
          <img src="assets/logo-wylco.png" alt="Wylco" className="nav-logo-img" />
          <span className="nav-logo-name">WYLCO</span>
        </div>

        <div className="nav-links">
          {links.map((l, i) => (
            <a
              key={i}
              className={page === l.key && !l.anchor ? 'active' : ''}
              onClick={() => navTo(l.key, l.anchor)}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="nav-right">
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn ${lang === 'es' ? 'active' : ''}`} onClick={() => setLang('es')}>ES</button>
          </div>
          <button className="nav-cta" onClick={() => navTo('contact')}>{T.nav.cta}</button>
        </div>

        <button className="nav-mobile-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-lang">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button>
        </div>
        {links.map((l, i) => (
          <a key={i} onClick={() => navTo(l.key, l.anchor)}>{l.label}</a>
        ))}
        <a onClick={() => navTo('contact')}>{T.nav.cta} →</a>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { Nav });
