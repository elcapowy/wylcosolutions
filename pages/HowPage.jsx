/* ── HowPage.jsx ── */
const { useState: useStateH, useEffect: useEffectH } = React;

function HowPage({ lang, setPage }) {
  const isEN = lang === 'en';
  const [activeProd, setActiveProd] = useStateH(0);
  const [activeStep, setActiveStepH] = useStateH(1);
  const [openFaq, setOpenFaq] = useStateH(null);

  const svIcons = {
    classify: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    gauge: <><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 6v6l4 2"/></>,
    adapter: <><path d="M9 3v6m6-6v6M5 9h14l-1 11a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z"/></>,
    inject: <><path d="M19 5L5 19M14 4l6 6M5 13l6 6M3 21l2-6"/></>,
    circulate: <><path d="M21 12a9 9 0 11-9-9"/><polyline points="21 3 21 9 15 9"/></>,
    uv: <><path d="M12 3v2M5.6 5.6l1.4 1.4M3 12h2m14 0h2M17 7l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z"/></>,
    drop: <><path d="M12 2s6 7 6 12a6 6 0 01-12 0c0-5 6-12 6-12z"/></>,
    oring: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></>,
    clean: <><path d="M3 21l6-6"/><path d="M14 4l6 6-9 9H5v-6z"/></>,
    wrench: <><path d="M14 6a4 4 0 00-5.3 5.3L3 17v4h4l5.7-5.7A4 4 0 0014 6z"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    shield: <><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/></>,
    ruler: <><path d="M3 8l5-5 13 13-5 5z"/><path d="M8 9l1 1M11 12l1 1M14 15l1 1"/></>,
    unplug: <><path d="M6 6l12 12M9 3v4M15 3v4M4 9h6M20 9h-6M8 12l-4 4v4h4l4-4"/></>,
  };

  /* ── Per-product application flows ── */
  const products = [
    {
      id:'tapafugas',
      tab:'TapaFugas 2-en-1',
      sub: isEN
        ? 'Step-by-step guide for HVAC-R technicians. From injection to UV verification — the complete K11 TapaFugas field process.'
        : 'Guía paso a paso para técnicos HVAC-R. Desde la inyección hasta la verificación UV — el proceso completo de K11 TapaFugas en campo.',
      leakGuide: true,
      pills: isEN ? ['Inject','Circulate','UV verify'] : ['Inyectar','Circular','Verificar UV'],
      steps: isEN ? [
        { num:1, title:'Classify the Leak', desc:'Determine if K11 is appropriate based on how quickly the system loses charge. Over 30 days = micro-leak (K11 recommended). 15–30 days = medium. Under 15 days = large (welding required).', label:'Step 01', icon:'classify', foot:<span><strong>Rule of thumb:</strong> if the system holds for 30+ days, it's a micro-leak — K11's exact use case.</span> },
        { num:2, title:'Run the System', desc:'Operate the AC system normally before injection. The compressor must be running for correct distribution of K11 through the refrigerant circuit.', label:'Step 02', icon:'gauge', foot:<span><strong>Compressor running.</strong> K11 needs active refrigerant flow to distribute correctly.</span> },
        { num:3, title:'Connect the Adapter', desc:'Attach the K11 anti-backflow adapter to the low-pressure (suction) service port. Load the correct dose of K11 TapaFugas 2-in-1 into the syringe.', label:'Step 03', icon:'adapter', foot:<span><strong>Low-pressure port only.</strong> The anti-backflow adapter ensures safe, precise injection.</span> },
        { num:4, title:'Inject K11', desc:'Slowly inject the full syringe into the circuit with the system running. The refrigerant flow carries K11 throughout the entire circuit within minutes.', label:'Step 04', icon:'inject', foot:<span><strong>Slow & steady.</strong> Refrigerant flow carries K11 through the full circuit in minutes.</span> },
        { num:5, title:'Let K11 Circulate', desc:'Run the system for 15–30 minutes. K11 circulates through all components and activates permanently at any leak site it encounters.', label:'Step 05', icon:'circulate', foot:<span><strong>15–30 minutes.</strong> K11 activates permanently at every micro-leak it reaches.</span> },
        { num:6, title:'Verify with UV Light', desc:'Use a UV or violet light to inspect the system. The fluorescent tracer in K11 marks the sealed point visibly. Document it. Show the client. Job complete.', label:'Step 06', icon:'uv', foot:<span><strong>UV verification.</strong> The fluorescent tracer marks the sealed point — show the client, document it.</span> },
      ] : [
        { num:1, title:'Clasificar la Fuga', desc:'Determiná si K11 es adecuado según qué tan rápido el sistema pierde carga. Más de 30 días = micro-fuga (K11 recomendado). 15–30 días = media. Menos de 15 días = grande (requiere soldadura).', label:'Paso 01', icon:'classify', foot:<span><strong>Regla práctica:</strong> si el sistema aguanta 30+ días, es una micro-fuga — el caso exacto de K11.</span> },
        { num:2, title:'Encender el Sistema', desc:'Operá el sistema de AC normalmente antes de la inyección. El compresor debe estar en marcha para la correcta distribución de K11 por el circuito de refrigerante.', label:'Paso 02', icon:'gauge', foot:<span><strong>Compresor en marcha.</strong> K11 necesita flujo de refrigerante activo para distribuirse bien.</span> },
        { num:3, title:'Conectar el Adaptador', desc:'Adjuntá el adaptador anti-retorno K11 al puerto de servicio de baja presión (succión). Cargá la dosis correcta de K11 TapaFugas 2-en-1 en la jeringa.', label:'Paso 03', icon:'adapter', foot:<span><strong>Solo puerto de baja.</strong> El adaptador anti-retorno asegura inyección segura y precisa.</span> },
        { num:4, title:'Inyectar K11', desc:'Inyectá lentamente la jeringa completa en el circuito con el sistema en marcha. El flujo de refrigerante lleva K11 por todo el circuito en minutos.', label:'Paso 04', icon:'inject', foot:<span><strong>Lento y constante.</strong> El flujo de refrigerante lleva K11 por todo el circuito en minutos.</span> },
        { num:5, title:'Dejar Circular K11', desc:'Corré el sistema por 15–30 minutos. K11 circula por todos los componentes y se activa permanentemente en cualquier punto de fuga que encuentre.', label:'Paso 05', icon:'circulate', foot:<span><strong>15–30 minutos.</strong> K11 se activa permanentemente en cada micro-fuga que alcanza.</span> },
        { num:6, title:'Verificar con Luz UV', desc:'Usá una luz UV o violeta para inspeccionar el sistema. El trazador fluorescente en K11 marca el punto sellado visiblemente. Documentalo. Mostráselo al cliente.', label:'Paso 06', icon:'uv', foot:<span><strong>Verificación UV.</strong> El trazador fluorescente marca el punto sellado — mostráselo al cliente, documentalo.</span> },
      ],
    },
    {
      id:'sellaplus',
      tab:'Sella Plus',
      sub: isEN
        ? 'How to seal and lubricate flanges, connections, gaskets and O-rings with the premium blue sealant-lubricant.'
        : 'Cómo sellar y lubricar bridas, conexiones, juntas y O-rings con el sellador-lubricante azul premium.',
      leakGuide: false,
      pills: isEN ? ['Clean','Apply','Assemble'] : ['Limpiar','Aplicar','Ensamblar'],
      steps: isEN ? [
        { num:1, title:'Identify the Joint', desc:'Locate the flange, threaded connection, gasket or O-ring that needs sealing and lubrication. Sella Plus is a surface-applied product — no injection into the circuit.', label:'Step 01', icon:'oring', foot:<span><strong>Surface-applied.</strong> Built for flanges, connections, gaskets and O-rings.</span> },
        { num:2, title:'Clean & Prep', desc:'Clean the joint surface. Remove old residue, debris and moisture so the sealant bonds and lubricates evenly.', label:'Step 02', icon:'clean', foot:<span><strong>Clean surface first.</strong> A prepped joint gives a reliable, leak-free seal.</span> },
        { num:3, title:'Apply Sella Plus', desc:'Apply the blue sealant-lubricant to the connection or O-ring from the 35ml precision applicator (Code: SPK11). The blue color lets you control coverage.', label:'Step 03', icon:'drop', foot:<span><strong>35ml applicator.</strong> Blue color = easy visual control of coverage.</span> },
        { num:4, title:'Assemble & Torque', desc:'Mate and tighten the joint to spec. Sella Plus lubricates as you assemble and seals the connection at the same time.', label:'Step 04', icon:'wrench', foot:<span><strong>Seals + lubricates.</strong> One product does both as you torque the joint.</span> },
        { num:5, title:'Verify the Seal', desc:'The blue color confirms full coverage. Check for a clean, leak-free connection before returning the system to service.', label:'Step 05', icon:'check', foot:<span><strong>Blue = covered.</strong> Visual confirmation of a sealed, lubricated joint.</span> },
        { num:6, title:'Built to Last', desc:'Sella Plus never hardens or crystallizes — it stays flexible for the life of the joint and eases any future maintenance. ASHRAE 97 certified.', label:'Step 06', icon:'shield', foot:<span><strong>Never hardens.</strong> Stays flexible — joints remain serviceable. ASHRAE 97 certified.</span> },
      ] : [
        { num:1, title:'Identificar la Junta', desc:'Ubicá la brida, conexión roscada, junta u O-ring que necesita sellado y lubricación. Sella Plus se aplica en superficie — no se inyecta en el circuito.', label:'Paso 01', icon:'oring', foot:<span><strong>Aplicación en superficie.</strong> Para bridas, conexiones, juntas y O-rings.</span> },
        { num:2, title:'Limpiar y Preparar', desc:'Limpiá la superficie de la junta. Quitá residuos viejos, suciedad y humedad para que el sellador adhiera y lubrique de forma pareja.', label:'Paso 02', icon:'clean', foot:<span><strong>Superficie limpia primero.</strong> Una junta preparada da un sellado confiable y sin fugas.</span> },
        { num:3, title:'Aplicar Sella Plus', desc:'Aplicá el sellador-lubricante azul a la conexión u O-ring desde la botella aplicadora de precisión de 35ml (Cód: SPK11). El color azul te permite controlar la cobertura.', label:'Paso 03', icon:'drop', foot:<span><strong>Aplicador 35ml.</strong> Color azul = control visual fácil de la cobertura.</span> },
        { num:4, title:'Ensamblar y Ajustar', desc:'Uní y ajustá la junta al torque especificado. Sella Plus lubrica mientras ensamblás y sella la conexión al mismo tiempo.', label:'Paso 04', icon:'wrench', foot:<span><strong>Sella + lubrica.</strong> Un solo producto hace ambos mientras ajustás la junta.</span> },
        { num:5, title:'Verificar el Sellado', desc:'El color azul confirma cobertura completa. Verificá una conexión limpia y sin fugas antes de devolver el sistema a servicio.', label:'Paso 05', icon:'check', foot:<span><strong>Azul = cubierto.</strong> Confirmación visual de una junta sellada y lubricada.</span> },
        { num:6, title:'Hecho para Durar', desc:'Sella Plus nunca endurece ni cristaliza — permanece flexible por la vida de la junta y facilita cualquier mantenimiento futuro. Certificado ASHRAE 97.', label:'Paso 06', icon:'shield', foot:<span><strong>Nunca endurece.</strong> Permanece flexible — las juntas siguen desmontables. Certificado ASHRAE 97.</span> },
      ],
    },
    {
      id:'revelafugas',
      tab:'Revela Fugas',
      sub: isEN
        ? 'How to locate any leak with the ultra-high fluorescence UV dye — from injection to inspection under UV light.'
        : 'Cómo localizar cualquier fuga con el tinte UV de ultra-alta fluorescencia — desde la inyección hasta la inspección bajo luz UV.',
      leakGuide: false,
      pills: isEN ? ['Inject dye','Circulate','UV scan'] : ['Inyectar tinte','Circular','Escaneo UV'],
      steps: isEN ? [
        { num:1, title:'Confirm the Fault', desc:'The system is losing charge but the leak point is unknown. Revela Fugas is designed to pinpoint the exact location, even on multiple simultaneous leaks.', label:'Step 01', icon:'classify', foot:<span><strong>Unknown leak?</strong> This is what the UV dye is for — it finds what pressure tests miss.</span> },
        { num:2, title:'Connect the Adapter', desc:'Attach the K11 anti-backflow adapter to the low-pressure service port and load the correct dose of Revela Fugas UV dye.', label:'Step 02', icon:'adapter', foot:<span><strong>Anti-backflow adapter.</strong> Safe, precise injection into a live circuit.</span> },
        { num:3, title:'Inject the Dye', desc:'Inject the dye into the running circuit. It is compatible with all refrigerants and with mineral, POE and PAG oils — zero impact on system performance.', label:'Step 03', icon:'drop', foot:<span><strong>All oils & refrigerants.</strong> Mineral, POE, PAG — no effect on pressures or capacity.</span> },
        { num:4, title:'Let It Circulate', desc:'Run the system for 15–30 minutes so the dye reaches every component, joint and fitting in the circuit.', label:'Step 04', icon:'circulate', foot:<span><strong>15–30 minutes.</strong> The dye travels to every leak point in the system.</span> },
        { num:5, title:'Inspect with UV Light', desc:'Scan coils, joints, valves and fittings with a standard UV or violet lamp. The dye glows brightly at each leak point.', label:'Step 05', icon:'uv', foot:<span><strong>Standard UV lamp.</strong> No special equipment — the fluorescence does the work.</span> },
        { num:6, title:'Mark & Act', desc:'Mark every glowing leak. Repair mechanically where needed, or keep the dye in circuit for ongoing long-term leak monitoring.', label:'Step 06', icon:'check', foot:<span><strong>Stays active.</strong> Leave it in circuit for long-term monitoring on future service calls.</span> },
      ] : [
        { num:1, title:'Confirmar la Falla', desc:'El sistema pierde carga pero no se sabe dónde. Revela Fugas está diseñado para señalar la ubicación exacta, incluso con varias fugas simultáneas.', label:'Paso 01', icon:'classify', foot:<span><strong>¿Fuga desconocida?</strong> Para eso está el tinte UV — encuentra lo que las pruebas de presión no ven.</span> },
        { num:2, title:'Conectar el Adaptador', desc:'Adjuntá el adaptador anti-retorno K11 al puerto de servicio de baja presión y cargá la dosis correcta de tinte UV Revela Fugas.', label:'Paso 02', icon:'adapter', foot:<span><strong>Adaptador anti-retorno.</strong> Inyección segura y precisa en circuito activo.</span> },
        { num:3, title:'Inyectar el Tinte', desc:'Inyectá el tinte en el circuito en marcha. Es compatible con todos los refrigerantes y con aceites mineral, POE y PAG — sin impacto en el rendimiento del sistema.', label:'Paso 03', icon:'drop', foot:<span><strong>Todos los aceites y refrigerantes.</strong> Mineral, POE, PAG — sin afectar presiones ni capacidad.</span> },
        { num:4, title:'Dejar Circular', desc:'Corré el sistema por 15–30 minutos para que el tinte llegue a cada componente, junta y conexión del circuito.', label:'Paso 04', icon:'circulate', foot:<span><strong>15–30 minutos.</strong> El tinte viaja a cada punto de fuga del sistema.</span> },
        { num:5, title:'Inspeccionar con Luz UV', desc:'Escaneá serpentinas, juntas, válvulas y conexiones con una lámpara UV o violeta estándar. El tinte brilla intensamente en cada punto de fuga.', label:'Paso 05', icon:'uv', foot:<span><strong>Lámpara UV estándar.</strong> Sin equipo especial — la fluorescencia hace el trabajo.</span> },
        { num:6, title:'Marcar y Actuar', desc:'Marcá cada fuga que brilla. Reparás mecánicamente donde haga falta, o dejá el tinte en el circuito para monitoreo de fugas a largo plazo.', label:'Paso 06', icon:'check', foot:<span><strong>Permanece activo.</strong> Dejalo en el circuito para monitoreo en futuras visitas de servicio.</span> },
      ],
    },
    {
      id:'adapters',
      tab:'Adaptadores',
      sub: isEN
        ? 'How to use the anti-backflow injection adapters to load any K11 product safely into a live refrigerant circuit.'
        : 'Cómo usar los adaptadores de inyección anti-retorno para cargar cualquier producto K11 de forma segura en un circuito activo.',
      leakGuide: false,
      pills: isEN ? ['1/4" & 5/16"','Anti-backflow','Reusable'] : ['1/4" y 5/16"','Anti-retorno','Reutilizable'],
      steps: isEN ? [
        { num:1, title:'Pick the Size', desc:'Choose 1/4" standard for residential and commercial systems, or 5/16" for mini-split systems. The adapter is the required tool for correct K11 application.', label:'Step 01', icon:'ruler', foot:<span><strong>Two sizes.</strong> 1/4" standard · 5/16" mini-split.</span> },
        { num:2, title:'Connect to the LP Port', desc:'Thread the anti-backflow adapter onto the low-pressure (suction) service port with the system running.', label:'Step 02', icon:'adapter', foot:<span><strong>Low-pressure port.</strong> The anti-backflow valve keeps the connection safe.</span> },
        { num:3, title:'Load the K11 Product', desc:'Attach the syringe with the correct dose of K11 TapaFugas, Revela Fugas or Sella Plus to the adapter.', label:'Step 03', icon:'inject', foot:<span><strong>Any K11 product.</strong> One adapter for the full injection line.</span> },
        { num:4, title:'Inject Safely', desc:'Inject the product into the live circuit. The anti-backflow valve lets it in while preventing refrigerant from escaping back through the tool.', label:'Step 04', icon:'gauge', foot:<span><strong>Anti-backflow.</strong> Product goes in — refrigerant never comes back out.</span> },
        { num:5, title:'Disconnect Cleanly', desc:'Remove the adapter from the service port. The port stays sealed and the system keeps running.', label:'Step 05', icon:'unplug', foot:<span><strong>No charge loss.</strong> Disconnect with the system still running.</span> },
        { num:6, title:'Clean & Reuse', desc:'The adapter is durable and reusable. Clean it and store it for the next service call.', label:'Step 06', icon:'circulate', foot:<span><strong>Reusable.</strong> Built to last across many service calls.</span> },
      ] : [
        { num:1, title:'Elegir la Medida', desc:'Elegí 1/4" estándar para sistemas residenciales y comerciales, o 5/16" para sistemas mini-split. El adaptador es la herramienta requerida para la aplicación correcta de K11.', label:'Paso 01', icon:'ruler', foot:<span><strong>Dos medidas.</strong> 1/4" estándar · 5/16" mini-split.</span> },
        { num:2, title:'Conectar al Puerto de Baja', desc:'Enroscá el adaptador anti-retorno al puerto de servicio de baja presión (succión) con el sistema en marcha.', label:'Paso 02', icon:'adapter', foot:<span><strong>Puerto de baja.</strong> La válvula anti-retorno mantiene la conexión segura.</span> },
        { num:3, title:'Cargar el Producto K11', desc:'Adjuntá la jeringa con la dosis correcta de K11 TapaFugas, Revela Fugas o Sella Plus al adaptador.', label:'Paso 03', icon:'inject', foot:<span><strong>Cualquier producto K11.</strong> Un adaptador para toda la línea de inyección.</span> },
        { num:4, title:'Inyectar con Seguridad', desc:'Inyectá el producto en el circuito activo. La válvula anti-retorno lo deja entrar y evita que el refrigerante escape de vuelta por la herramienta.', label:'Paso 04', icon:'gauge', foot:<span><strong>Anti-retorno.</strong> El producto entra — el refrigerante nunca vuelve a salir.</span> },
        { num:5, title:'Desconectar Limpio', desc:'Retirá el adaptador del puerto de servicio. El puerto queda sellado y el sistema sigue en marcha.', label:'Paso 05', icon:'unplug', foot:<span><strong>Sin pérdida de carga.</strong> Desconectá con el sistema aún en marcha.</span> },
        { num:6, title:'Limpiar y Reutilizar', desc:'El adaptador es durable y reutilizable. Limpialo y guardalo para la próxima llamada de servicio.', label:'Paso 06', icon:'circulate', foot:<span><strong>Reutilizable.</strong> Hecho para durar en muchas visitas de servicio.</span> },
      ],
    },
  ];

  const prod = products[activeProd];
  const steps = prod.steps;

  function pickProd(i) { setActiveProd(i); setActiveStepH(1); setOpenFaq(null); }

  const leakItems = isEN ? [
    { days:'30+', cls:'lt-green', type:'Micro-Leak', color:'var(--green)', desc:'Days to lose full charge. This is K11\'s target application. Seal it permanently in one injection. No evacuation. No downtime.' },
    { days:'15–30', cls:'lt-yellow', type:'Medium Leak', color:'#C89B14', desc:'Days to lose full charge. K11 may work depending on leak location. Evaluate the circuit. Consider professional diagnosis.' },
    { days:'<15', cls:'lt-red', type:'Large Leak', color:'#C83232', desc:'Days to lose full charge. Welding or physical repair required. K11 is not the right tool. Locate and repair mechanically.' },
  ] : [
    { days:'30+', cls:'lt-green', type:'Micro-Fuga', color:'var(--green)', desc:'Días para perder carga completa. Esta es la aplicación objetivo de K11. Sellar permanentemente en una inyección. Sin evacuación. Sin tiempo muerto.' },
    { days:'15–30', cls:'lt-yellow', type:'Fuga Media', color:'#C89B14', desc:'Días para perder carga completa. K11 puede funcionar dependiendo de la ubicación de la fuga. Evaluá el circuito. Considerá un diagnóstico profesional.' },
    { days:'<15', cls:'lt-red', type:'Fuga Grande', color:'#C83232', desc:'Días para perder carga completa. Se requiere soldadura o reparación física. K11 no es la herramienta adecuada. Localizá y reparás mecánicamente.' },
  ];

  const faqGroup = ((window.PRODUCT_FAQ && window.PRODUCT_FAQ[lang]) || []).find(g => g.id === prod.id);
  const faqItems = faqGroup ? faqGroup.items : [];

  /* ── Rich visual (TapaFugas only) ── */
  function renderRichVisual(n) {
    const step = steps[n-1];
    const body = renderRichBody(n);
    return (
      <div className="sv-panel">
        <div className="sv-grid"></div>
        <div className="sv-stepnum">{String(n).padStart(2,'0')}</div>
        <div className="sv-top">
          <div className="sv-icon"><svg viewBox="0 0 24 24">{svIcons[step.icon]}</svg></div>
          <div>
            <div className="sv-step-label">{step.label}</div>
            <div className="sv-step-title">{step.title}</div>
          </div>
        </div>
        <div className="sv-body">{body}</div>
        <div className="sv-foot"><p className="sv-foot-text">{step.foot}</p></div>
      </div>
    );
  }

  function renderRichBody(n) {
    if (n === 1) {
      const chips = [
        { color:'var(--green)', icon:<polyline points="20 6 9 17 4 12"/>, days:'30+', type:isEN?'Micro-leak':'Micro-fuga' },
        { color:'#C89B14', icon:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, days:'15–30', type:isEN?'Medium':'Media' },
        { color:'#C83232', icon:<><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, days:'<15', type:isEN?'Large':'Grande' },
      ];
      return (
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
      return (
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
      return (
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
    }
    return (
      <div className="sv-uv">
        <div className="sv-uv-glow"></div>
        <div className="sv-uv-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
      </div>
    );
  }

  /* ── Generic visual (other products) ── */
  function renderGenericVisual(n) {
    const step = steps[n-1];
    const total = steps.length;
    const pct = Math.round((n / total) * 100);
    return (
      <div className="sv-panel">
        <div className="sv-grid"></div>
        <div className="sv-stepnum">{String(n).padStart(2,'0')}</div>
        <div className="sv-top">
          <div className="sv-icon"><svg viewBox="0 0 24 24">{svIcons[step.icon]}</svg></div>
          <div>
            <div className="sv-step-label">{step.label}</div>
            <div className="sv-step-title">{step.title}</div>
          </div>
        </div>
        <div className="sv-body">
          <div className="sv-gauge">
            <div className="sv-gauge-ring" style={{ background:`conic-gradient(var(--orange) ${pct}%, rgba(255,255,255,.08) ${pct}%)` }}>
              <div className="sv-gauge-inner">
                <div className="sv-gauge-val">{n}/{total}</div>
                <div className="sv-gauge-label">{isEN?'Step':'Paso'}</div>
              </div>
            </div>
            <div className="sv-pills">
              {prod.pills.map(p => <span key={p} className="sv-pill">{p}</span>)}
            </div>
          </div>
        </div>
        <div className="sv-foot"><p className="sv-foot-text">{step.foot}</p></div>
      </div>
    );
  }

  function renderStepVisual(n) {
    return prod.id === 'tapafugas' ? renderRichVisual(n) : renderGenericVisual(n);
  }

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="breadcrumb"><a onClick={() => setPage('home')}>Home</a><span>/</span><span>{lang==='en'?'How It Works':'Cómo Funciona'}</span></div>
          <div className="eyebrow white">{lang==='en'?'Application Guide':'Guía de Aplicación'}</div>
          <h1 className="page-h1">{lang==='en'?<span>How K11 works<br/><em>in the field.</em></span>:<span>Cómo funciona K11<br/><em>en el campo.</em></span>}</h1>
          <p className="page-sub">{prod.sub}</p>
        </div>
      </section>

      {/* Product switcher */}
      <section className="section-dark" style={{ paddingTop:'40px', paddingBottom:'0' }}>
        <div style={{ maxWidth:'var(--mw)', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="how-tabs" role="tablist" aria-label={lang==='en'?'Product':'Producto'}>
            {products.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={activeProd===i}
                className={`how-tab ${activeProd===i ? 'active' : ''}`}
                onClick={() => pickProd(i)}
              >
                K11 {p.tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive steps */}
      <section className="section section-dark" style={{ paddingTop:'40px', paddingBottom:'80px' }}>
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

      {/* Leak Guide (TapaFugas only) */}
      {prod.leakGuide && (
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
      )}

      {/* FAQ (per product) */}
      <section className="section section-warm" style={{ borderTop:'.5px solid var(--bd-light)' }}>
        <div style={{ maxWidth:'760px', margin:'0 auto', padding:'0 max(24px,5vw)' }}>
          <div className="eyebrow">{lang==='en'?'Product FAQ':'FAQ del Producto'}</div>
          <div className="display dark-txt" style={{ fontSize:'clamp(2rem,3.5vw,3rem)', marginBottom:'32px' }}>K11 {prod.tab}.</div>
          <div className="faq-list" key={prod.id} style={{ marginTop:0 }}>
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
