// Quio landing pública: dos servicios y demostraciones conceptuales.
// No modifica /gestion/ ni /revisiones/.
export default function Home() {
 return (
  <>
<a className="q-skip" href="#contenido">Saltar al contenido</a>
<div className="q-site" id="inicio">
  <header className="q-header" id="cabecera">
    <div className="q-container q-nav">
      <a href="#inicio" className="q-wordmark" aria-label="Quio, inicio">qu<span className="q-letter-i">ı<span className="q-dot" aria-hidden="true"></span></span>o</a>
      <nav className="q-navlinks" id="navegacion" aria-label="Menú principal">
        <a href="#servicios">Servicios</a><a href="#proceso">Cómo trabajamos</a><a href="#precios">Precios</a><a href="#preguntas">Preguntas</a>
      </nav>
      <a href="https://wa.me/526621997803?text=Hola%2C%20Quio.%20Quiero%20informaci%C3%B3n%20sobre%20sus%20servicios." className="q-navcta" target="_blank" rel="noopener noreferrer">Platiquemos <svg className="q-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
      <button className="q-menu-toggle" type="button" aria-controls="navegacion" aria-expanded="false" aria-label="Abrir menú"><span></span><span></span></button>
    </div>
  </header>

  <main id="contenido">
    <section className="q-hero q-container" aria-labelledby="q-hero-heading">
      <div className="q-hero-copy">
        <div className="q-hero-eyebrow"><span aria-hidden="true" className="q-hero-eyebrow-line"></span>ESTUDIO DE DISEÑO WEB · SONORA, MÉXICO</div>
        <h1 id="q-hero-heading"><span className="q-headline-line"><span>Tu negocio merece una web</span></span><span className="q-headline-line q-headline-accent"><span>que esté a su altura.</span></span></h1>
        <p>Diseñamos páginas web con personalidad para que tu negocio inspire confianza desde el primer clic. Diseño a tu medida, atención directa y una puesta en marcha sin enredos.</p>
        <div className="q-hero-actions">
          <a href="https://wa.me/526621997803?text=Hola%2C%20Quio.%20Quiero%20cotizar%20una%20p%C3%A1gina%20web%20para%20mi%20negocio." className="q-button q-button-primary" target="_blank" rel="noopener noreferrer">Quiero mi sitio web <svg className="q-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
          <a href="#servicios" className="q-text-link">Conocer los servicios <svg className="q-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3.5v12M5 10.5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
        </div>
        <div className="q-hero-foot"><span className="q-hero-foot-line" aria-hidden="true"></span><span>Atención directa</span><span aria-hidden="true" className="q-hero-foot-dot">·</span><span>Diseño a medida</span><span aria-hidden="true" className="q-hero-foot-dot">·</span><span>Sin mensualidad obligatoria</span></div>
      </div>
            <div className="q-showcase" aria-label="Dos sitios conceptuales con diseños distintos" data-concept="lino" data-view="desktop">
  <div className="q-demo-toolbar">
    <div className="q-concept-switch" role="group" aria-label="Elegir concepto"><button type="button" className="q-concept-btn is-active" data-concept="lino" aria-pressed={true}>Estudio Lino</button><button type="button" className="q-concept-btn" data-concept="bruma" aria-pressed={false}>Bruma Café</button></div>
    <div className="q-view-switch" role="group" aria-label="Ver diseño en"><button className="q-view-btn is-active" type="button" data-view="desktop" aria-pressed={true}>Escritorio</button><button className="q-view-btn" type="button" data-view="mobile" aria-pressed={false}>Móvil</button></div>
  </div>
  <div className="q-browser">
    <div className="q-browser-bar"><span className="q-browser-url" id="q-demo-name">Estudio Lino · arquitectura e interiorismo</span><span className="q-browser-mini">Vista previa</span></div>
    <a className="q-preview-link" id="q-preview-link" href="conceptos/lino.html" target="_blank" rel="noopener noreferrer" aria-label="Explorar Estudio Lino en otra pestaña">
      <div className="q-screen" id="vista-concepto"><img className="q-demo-preview" id="q-demo-preview" src="conceptos/previews/lino-desktop.webp" alt="Vista previa del sitio conceptual Estudio Lino, con diseño editorial" width={940} height={620} fetchPriority="high"/><span className="q-preview-hint" aria-hidden="true">Explorar sitio ↗</span></div>
    </a>
  </div>
  <div className="q-demo-footer"><p>Imágenes ilustrativas. Dos propuestas de diseño con personalidad propia.</p><a className="q-open-demo" id="q-open-demo" href="conceptos/lino.html" target="_blank" rel="noopener noreferrer">Explorar sitio completo <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>
</div>
    </section>

    <section className="q-manifesto" aria-label="Nuestra forma de trabajar">
      <div className="q-container q-manifesto-inner"><p>Una buena primera impresión no se improvisa.</p><span>Se diseña.</span></div>
    </section>

    <section className="q-section q-services q-container" data-reveal id="servicios" aria-labelledby="servicios-titulo">
      <div className="q-section-lead"><h2 id="servicios-titulo">Dos servicios.<br/><span>Todo lo que necesitas.</span></h2><p>Menos opciones, mejores resultados. Nos enfocamos en lo que de verdad ayuda a presentar tu negocio y generar confianza.</p></div>
      <article className="q-service q-service-web" data-reveal>
        <div className="q-service-copy"><span className="q-service-symbol" aria-hidden="true"><svg viewBox="0 0 42 42" fill="none"><rect x="4" y="7" width="34" height="27" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4 14h34M16 39h10M21 34v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="10.5" r="1" fill="currentColor"/><circle cx="14" cy="10.5" r="1" fill="currentColor"/></svg></span>
          <h3>Diseño web <em>que se siente tuyo.</em></h3><p>Una página clara, rápida y visualmente memorable. Diseñada para explicar qué haces, transmitir confianza y convertir visitas en conversaciones.</p>
          <ul className="q-list"><li>Diseño hecho para tu marca</li><li>Perfecta en celular y computadora</li><li>WhatsApp y contacto en un clic</li><li>Publicación y SEO básico</li></ul>
          <a href="https://wa.me/526621997803?text=Hola%2C%20Quio.%20Quiero%20cotizar%20una%20p%C3%A1gina%20web%20para%20mi%20negocio." className="q-inline-action" target="_blank" rel="noopener noreferrer">Cotizar mi página <svg className="q-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
        </div>
        <div className="q-service-art q-web-art" aria-label="Composición de diseño web">
          <div className="q-design-board"><div className="q-design-caption">Un sitio que cuenta tu historia.</div><div className="q-design-type">Lo especial<br/><i>se nota.</i></div><div className="q-design-bar"><span>Tu marca, tu esencia</span><span><span className="q-inline-logo">qu<span className="q-letter-i">ı<span className="q-dot" aria-hidden="true"></span></span>o</span></span></div></div>
          <span className="q-art-note">Diseño distintivo, sin plantillas genéricas.</span>
        </div>
      </article>
      <article className="q-service q-service-review" data-reveal>
        <div className="q-service-copy"><span className="q-service-symbol" aria-hidden="true"><svg viewBox="0 0 42 42" fill="none"><path d="M21 4.5v6M9.3 9.3l4.3 4.3M4.5 21h6m-1.2 11.7 4.3-4.3M21 37.5v-6m11.7 1.2-4.3-4.3M37.5 21h-6m1.2-11.7-4.3 4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M16 19c3-3 7-3 10 0M18.5 21.5c1.7-1.7 3.3-1.7 5 0M21 25.5v.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg></span>
          <h3>Reseñas de Google <em>sin complicaciones.</em></h3><p>Un kit elegante y listo para usar que permite a tus clientes compartir su opinión real con sólo acercar su celular o escanear un código.</p>
          <ul className="q-list"><li>Una placa NFC configurada</li><li>Código QR y enlace directo</li><li>Diseño del material digital</li><li>Guía de uso, sin mensualidades</li></ul>
          <a href="https://wa.me/526621997803?text=Hola%2C%20Quio.%20Me%20interesa%20el%20kit%20de%20rese%C3%B1as%20de%20Google." className="q-inline-action" target="_blank" rel="noopener noreferrer">Quiero mi kit de reseñas <svg className="q-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
        </div>
        <div className="q-service-art q-review-art"><div className="q-nfc-plaque"><span className="q-plaque-brand"><span className="q-inline-logo">qu<span className="q-letter-i">ı<span className="q-dot" aria-hidden="true"></span></span>o</span></span><div className="q-plaque-copy">Tu opinión<br/>cuenta mucho.</div><div className="q-nfc-mark" aria-hidden="true"><svg viewBox="0 0 110 90" fill="none"><path d="M23 35c16-16 48-16 64 0M32 46c12-12 34-12 46 0M42 57c7-7 19-7 26 0M55 68h.1" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg></div><small>Acerca tu celular o escanea el código</small></div><p className="q-art-disclaimer">Vista ilustrativa del kit. Reseñas auténticas, sin incentivos.</p></div>
      </article>
    </section>

    <section className="q-section q-pricing q-container" data-reveal id="precios" aria-labelledby="q-pricing-title"><div className="q-pricing-heading"><h2 id="q-pricing-title">Gran diseño.<br/><span>Precios sin misterio.</span></h2><p>Sabes qué incluye cada servicio desde el principio. Sin paquetes interminables ni compromisos innecesarios.</p></div>
      <div className="q-price-grid"><article className="q-price-item"><div className="q-price-name">Sitio web</div><p className="q-price-caption">Tu negocio, bien presentado en internet.</p><div className="q-price-number"><span>Desde</span><strong>$8,900</strong><small>MXN · IVA incluido</small></div><p>Una página de presentación con varias secciones, diseño adaptable, WhatsApp, SEO básico y publicación.</p><a href="https://wa.me/526621997803?text=Hola%2C%20Quio.%20Quiero%20cotizar%20una%20p%C3%A1gina%20web%20para%20mi%20negocio." className="q-price-link" target="_blank" rel="noopener noreferrer">Solicitar cotización <svg className="q-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></a></article><article className="q-price-item"><div className="q-price-name">Kit de reseñas</div><p className="q-price-caption">Una forma sencilla de pedir opiniones reales.</p><div className="q-price-number"><span>Desde</span><strong>$1,900</strong><small>MXN · IVA incluido</small></div><p>Placa NFC, QR, enlace de Google y guía para solicitar reseñas genuinas a tus clientes.</p><a href="https://wa.me/526621997803?text=Hola%2C%20Quio.%20Me%20interesa%20el%20kit%20de%20rese%C3%B1as%20de%20Google." className="q-price-link" target="_blank" rel="noopener noreferrer">Solicitar mi kit <svg className="q-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></a></article></div>
      <div className="q-bundle"><div><span>La combinación ideal</span><h3>Quio Completo</h3><p>Tu sitio web y tu kit de reseñas, juntos.</p></div><div className="q-bundle-price"><strong>$9,900</strong><small>MXN · IVA incluido</small></div><a href="https://wa.me/526621997803?text=Hola%2C%20Quio.%20Me%20interesa%20Quio%20Completo%3A%20sitio%20web%20y%20kit%20de%20rese%C3%B1as." className="q-button q-bundle-button" target="_blank" rel="noopener noreferrer">Lo quiero <svg className="q-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></a></div>
      <p className="q-price-note">Precios de lanzamiento de referencia. El alcance se confirma por escrito antes de comenzar. Dominio, renovaciones y servicios adicionales se cotizan aparte.</p>
      <div className="q-choice-assist">
        <p>¿No sabes qué servicio necesitas? <strong>Cuéntanos de tu negocio y te ayudamos a elegir.</strong></p>
        <a href="https://wa.me/526621997803?text=Hola%2C%20Quio.%20Tengo%20un%20negocio%20y%20quisiera%20saber%20qu%C3%A9%20servicio%20me%20conviene.%20%C2%BFMe%20pueden%20orientar%3F" target="_blank" rel="noopener noreferrer">Preguntar por WhatsApp <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
      </div>
    </section>

    <section className="q-process" id="proceso" data-reveal><div className="q-container q-process-content"><div><h2>Así de sencillo.<br/><span>Así de bien.</span></h2><p>Hablas directamente con quien diseña tu página. Tú nos cuentas qué quieres lograr; Quio se encarga de darle forma, afinar los detalles contigo y publicarla.</p></div><ol><li><span>1</span><div><h3>Platicamos</h3><p>Entendemos tu negocio, el estilo que buscas y lo que debe lograr tu página.</p></div></li><li><span>2</span><div><h3>Diseñamos</h3><p>Preparamos una propuesta visual y la refinamos contigo, sin complicarte con términos técnicos.</p></div></li><li><span>3</span><div><h3>Publicamos</h3><p>Revisamos los detalles finales y dejamos tu sitio listo para compartir.</p></div></li></ol></div></section>

    <section className="q-section q-faq q-container" data-reveal id="preguntas"><div className="q-faq-heading"><h2>Por si te lo<br/><span>estabas preguntando.</span></h2><p>Las respuestas claras también son parte de un buen servicio.</p></div><div className="q-faq-items"><details><summary>¿Cuánto tardan en entregar mi página? <span aria-hidden="true"></span></summary><p>Como referencia, de 7 a 10 días hábiles para un sitio informativo sencillo, a partir de que recibimos todo el material necesario y confirmamos el alcance.</p></details><details><summary>¿Tengo que pagar una mensualidad? <span aria-hidden="true"></span></summary><p>No hay una mensualidad obligatoria de Quio para crear tu sitio o adquirir el kit. El dominio y algunos servicios de terceros pueden tener renovaciones periódicas; te explicamos esos costos antes de contratar.</p></details><details><summary>¿Puedo pedir cambios en el diseño? <span aria-hidden="true"></span></summary><p>La propuesta inicial de sitio web contempla dos rondas de ajustes dentro del alcance contratado. Los cambios adicionales se presupuestan antes de realizarlos.</p></details><details><summary>¿El kit garantiza reseñas positivas? <span aria-hidden="true"></span></summary><p>No. El kit facilita que tus clientes dejen opiniones auténticas. No compramos reseñas, no filtramos opiniones negativas ni ofrecemos incentivos por publicar reseñas.</p></details><details><summary>¿Necesito tener listo el logo, las fotos o el contenido? <span aria-hidden="true"></span></summary><p>No necesitas tenerlo todo preparado para escribirnos. Cuéntanos qué negocio tienes y qué quieres comunicar. Si ya cuentas con logo, fotos o referencias, los revisamos contigo.</p></details><details><summary>¿Cómo empezamos? <span aria-hidden="true"></span></summary><p>Escríbenos por WhatsApp y dinos qué negocio tienes y qué servicio te interesa. Te enviaremos los siguientes pasos y una propuesta de alcance.</p></details></div></section>

    <section className="q-origin-section" aria-labelledby="q-origin-title"><div className="q-container q-origin" aria-labelledby="q-origin-title"><h2 id="q-origin-title">Todo empieza<br/><em>por saber ver.</em></h2><p>El nombre Quio se inspira en <em>quihó</em>, palabra de la lengua seri relacionada con «ver». Una raíz sonorense para una idea sencilla: reconocer lo especial de cada negocio y ayudar a mostrarlo.</p></div></section>

    <section className="q-closing" data-reveal aria-labelledby="q-closing-title"><div className="q-container q-closing-inner"><div><h2 id="q-closing-title">¿Hacemos que tu negocio<br/><em>se vea increíble?</em></h2><p>El siguiente gran proyecto podría ser el tuyo.</p></div><a href="https://wa.me/526621997803?text=Hola%2C%20Quio.%20Quiero%20informaci%C3%B3n%20sobre%20sus%20servicios." className="q-button q-button-light" target="_blank" rel="noopener noreferrer">Hablemos de tu idea <svg className="q-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></a></div><div className="q-closing-decor" aria-hidden="true">q</div></section>
  </main>
  <footer className="q-footer">
<div className="q-container q-footer-inner"><div><a href="#inicio" className="q-wordmark q-footer-brand" aria-label="Quio, volver al inicio">qu<span className="q-letter-i">ı<span className="q-dot" aria-hidden="true"></span></span>o</a><p>Diseño web con intención.<br/>Lo simple puede ser extraordinario.</p></div><div className="q-footer-nav"><a href="#servicios">Servicios</a><a href="#proceso">Cómo trabajamos</a><a href="#precios">Precios</a><a href="https://wa.me/526621997803?text=Hola%2C%20Quio.%20Quiero%20informaci%C3%B3n%20sobre%20sus%20servicios." target="_blank" rel="noopener noreferrer">WhatsApp</a></div><span className="q-footer-end">© 2026 Quio · Hecho en Sonora.</span></div></footer>
  <a href="https://wa.me/526621997803?text=Hola%2C%20Quio.%20Quiero%20informaci%C3%B3n%20sobre%20sus%20servicios." className="q-mobile-contact" target="_blank" rel="noopener noreferrer" aria-label="Contactar Quio por WhatsApp">Hablemos <svg className="q-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
</div>
  </>
 );
}
