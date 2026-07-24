const header=document.querySelector('[data-header]');
const toggle=document.querySelector('[data-menu-toggle]');
const nav=document.querySelector('[data-nav]');
const toast=document.querySelector('[data-toast]');

window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>24),{passive:true});

toggle?.addEventListener('click',()=>{
  const open=toggle.getAttribute('aria-expanded')==='true';
  toggle.setAttribute('aria-expanded',String(!open));
  nav.classList.toggle('open',!open);
});

nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded','false');
}));

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const form=document.querySelector('#diagnostic-form');
form?.addEventListener('submit',event=>{
  event.preventDefault();
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),4200);
});

// Movimiento sutil del hero, desactivado en pantallas táctiles y para usuarios que reducen movimiento.
const stage=document.querySelector('.hero-stage');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(stage && !reduceMotion && window.matchMedia('(pointer:fine)').matches){
  stage.addEventListener('pointermove',event=>{
    const rect=stage.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width-.5;
    const y=(event.clientY-rect.top)/rect.height-.5;
    stage.style.transform=`perspective(1200px) rotateY(${x*2.5}deg) rotateX(${y*-2.5}deg)`;
  });
  stage.addEventListener('pointerleave',()=>stage.style.transform='');
}


document.querySelectorAll('[data-calendly-open]').forEach(btn=>{
 btn.addEventListener('click',e=>{
  e.preventDefault();
  if(window.Calendly){
    Calendly.initPopupWidget({url:'https://calendly.com/quio/revision'});
  } else {
    window.open('https://calendly.com/quio/revision','_blank','noopener');
  }
 });
});
