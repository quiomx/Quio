const Arrow = () => <span aria-hidden="true">↗</span>;
const whatsappUrl = "https://wa.me/526621997803?text=Hola%20Quio%2C%20quiero%20mi%20revisi%C3%B3n%20gratis.";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Quio, inicio"><img src="/quio-logo.png" alt="Quio" width="245" height="134" /></a>
        <nav aria-label="Navegación principal">
          <a href="#que-hacemos">Qué hacemos</a>
          <a href="#revision">Revisión gratuita</a>
          <a href="#resultado">El resultado</a>
        </nav>
        <a className="header-cta" href={whatsappUrl} target="_blank" rel="noreferrer">Revisión gratis <Arrow /></a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-glow glow-left" /><div className="hero-glow glow-right" />
        <div className="hero-art">
          <div className="hero-slides">
            <img className="hero-slide slide-one" src="/og.png" alt="Quio: que te encuentren, confíen y te elijan" width="1707" height="907" />
            <img className="hero-slide slide-two" src="/hero-consultorio.png" alt="" width="1707" height="907" />
            <img className="hero-slide slide-three" src="/hero-panaderia.png" alt="" width="1707" height="907" />
          </div>
          <div className="float-card found"><i /> Te encontraron</div>
          <div className="float-card growth"><small>Revisión Quio</small><strong>Mejoras detectadas</strong></div>
        </div>
        <div className="hero-bottom">
          <div className="hero-review-copy">
            <strong>Descubre qué puede mejorar tu negocio en internet</strong>
            <p>Vemos cómo aparece tu negocio en internet y te decimos, en palabras simples, qué puedes mejorar.</p>
          </div>
          <a className="button" href={whatsappUrl} target="_blank" rel="noreferrer">Quiero mi revisión gratis <Arrow /></a>
          <div className="hero-review-benefits" aria-label="Beneficios de la revisión">
            <span><i>✓</i> 30 minutos</span>
            <span><i>✓</i> Sin costo</span>
            <span><i>✓</i> Sin compromiso</span>
          </div>
        </div>
      </section>

      <div className="marquee" aria-label="Te encuentran, confían y te eligen">
        <div>
          <span className="marquee-group"><span>TE ENCUENTRAN</span><b>✦</b><span>CONFÍAN</span><b>✦</b><span>TE ELIGEN</span><b>✦</b></span>
          <span className="marquee-group" aria-hidden="true"><span>TE ENCUENTRAN</span><b>✦</b><span>CONFÍAN</span><b>✦</b><span>TE ELIGEN</span><b>✦</b></span>
        </div>
      </div>

      <section className="plain-intro" id="que-hacemos">
        <p className="eyebrow">Quio, explicado fácil</p>
        <h2>Ayudamos a que más personas<br /><em>encuentren y contacten</em> tu negocio.</h2>
        <p className="big-copy">Cuando alguien busca lo que vendes, queremos que vea información correcta, buenas opiniones y una forma sencilla de hablar contigo.</p>
        <div className="business-types" aria-label="Negocios que ayudamos">
          <span>Consultorios</span>
          <span>Barberías</span>
          <span>Panaderías</span>
          <span>Talleres</span>
          <span>Restaurantes</span>
          <span>Otros negocios locales</span>
        </div>
        <div className="work-method">
          <article>
            <span>01</span><b className="method-stage">Entender</b>
            <h3>Revisamos</h3>
            <p>Vemos qué encuentra hoy una persona cuando busca tu negocio.</p>
            <small>Revisión gratuita de 30 minutos</small>
          </article>
          <article>
            <span>02</span><b className="method-stage">Decidir</b>
            <h3>Priorizamos</h3>
            <p>Te mostramos qué está bien y qué conviene mejorar primero.</p>
            <small>Reporte claro y sin tecnicismos</small>
          </article>
          <article>
            <span>03</span><b className="method-stage">Mejorar</b>
            <h3>Implementamos</h3>
            <p>Si decides trabajar con Quio, hacemos las mejoras por ti.</p>
            <small>Solo los servicios que necesitas</small>
          </article>
        </div>
        <div className="section-cta">
          <div><strong>¿Quieres saber qué encuentra la gente sobre tu negocio?</strong><span>Lo revisamos contigo en 30 minutos.</span></div>
          <a className="button" href={whatsappUrl} target="_blank" rel="noreferrer">Quiero mi revisión gratis <Arrow /></a>
        </div>
      </section>

      <section className="free-review" id="revision">
        <div className="review-copy">
          <p className="eyebrow">Empezamos gratis</p>
          <h2>Primero revisamos.<br />Después te explicamos.</h2>
          <p>Visitamos tu negocio y, en 30 minutos, revisamos contigo cómo aparece en internet. No necesitas saber de tecnología.</p>
          <small className="visit-coverage">Visitas disponibles en Sonora.</small>
          <a className="button review-button" href={whatsappUrl} target="_blank" rel="noreferrer">Quiero mi revisión gratis <Arrow /></a>
        </div>
        <div className="check-card">
          <div className="check-head"><span>Tu revisión Quio</span><b>30 min</b></div>
          {[
            ["¿Aparece en Google?", "Revisamos dirección, horario y teléfono."],
            ["¿Da confianza?", "Vemos fotos, calificación y reseñas."],
            ["¿Se entiende lo que vendes?", "Comprobamos que tu mensaje sea claro."],
            ["¿Es fácil contactarte?", "Probamos llamadas, mensajes y reservas."],
          ].map(([title, copy]) => (
            <div className="check-row" key={title}><i>✓</i><div><strong>{title}</strong><small>{copy}</small></div></div>
          ))}
          <div className="report-pill">Recibes un reporte claro. Después tú decides si quieres implementar alguna mejora.</div>
        </div>
      </section>

      <section className="before-after" id="resultado">
        <div className="before">
          <span>Antes</span>
          <h3>Tu cliente tiene dudas.</h3>
          <ul><li>Información incompleta</li><li>Pocas reseñas</li><li>No sabe cómo contactarte</li></ul>
        </div>
        <div className="change-arrow">→</div>
        <div className="after">
          <span>Después</span>
          <h3>Tu cliente sabe qué hacer.</h3>
          <ul><li>Te encuentra fácilmente</li><li>Confía en tu negocio</li><li>Te llama, escribe o reserva</li></ul>
        </div>
      </section>

      <section className="only-needed">
        <div className="section-title">
          <p className="eyebrow">Servicios Quio</p>
          <h2>Esto es lo que podemos<br /><em>hacer por tu negocio.</em></h2>
          <p>La revisión nos ayuda a recomendar solo lo que realmente necesitas.</p>
        </div>
        <div className="services-list">
          <article><span>01</span><div><strong>Perfil de Google y Maps</strong><p>Corregimos y optimizamos dirección, horarios, teléfono y servicios.</p></div><b>Para que te encuentren</b></article>
          <article><span>02</span><div><strong>Sistema para conseguir reseñas</strong><p>Instalamos placas NFC y códigos QR para que tus clientes opinen fácilmente.</p></div><b>Para generar confianza</b></article>
          <article><span>03</span><div><strong>Página web profesional</strong><p>Creamos una página clara, rápida y adaptada a celulares para explicar qué haces.</p></div><b>Para presentar tu negocio</b></article>
          <article><span>04</span><div><strong>Contacto por WhatsApp</strong><p>Facilitamos que las personas te escriban desde Google o desde tu página.</p></div><b>Para recibir consultas</b></article>
          <article><span>05</span><div><strong>Agenda de citas en línea</strong><p>Permitimos que tus clientes elijan un día y una hora disponibles.</p></div><b>Para recibir reservas</b></article>
        </div>
      </section>

      <section className="final-cta" id="agenda">
        <div className="cta-orbit one" /><div className="cta-orbit two" />
        <p className="eyebrow">Tu primer paso no cuesta</p>
        <h2>Descubre qué está viendo<br />la gente cuando busca <em>tu negocio.</em></h2>
        <p>En 30 minutos tendrás una respuesta clara.</p>
        <a className="button light-button" href={whatsappUrl} target="_blank" rel="noreferrer">Quiero mi revisión gratis <Arrow /></a>
        <small>Sin costo · Sin compromiso · Reporte incluido</small>
      </section>

      <footer>
        <a className="brand" href="#inicio" aria-label="Quio, inicio"><img src="/quio-logo.png" alt="Quio" width="245" height="134" /></a>
        <p>Presencia digital para negocios locales.</p>
        <a className="footer-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp · 662 199 7803</a>
        <span>© 2026 Quio · México</span>
      </footer>
    </main>
  );
}
