/* Quio: motion is quiet, demo changes are intentional, controls work with keyboard. */
(()=>{
 const nav=document.querySelector('.q-nav');
 const toggle=document.querySelector('.q-menu-toggle');
 if(nav&&toggle){
  const close=()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menú');};
  toggle.addEventListener('click',()=>{const isOpen=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(isOpen));toggle.setAttribute('aria-label',isOpen?'Cerrar menú':'Abrir menú');});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!toggle.contains(e.target))close();});
 }
 const showcase=document.querySelector('.q-showcase');
 if(showcase){
  const preview=document.querySelector('#q-demo-preview');
  const previewLink=document.querySelector('#q-preview-link');
  const demoName=document.querySelector('#q-demo-name');
  const openDemo=document.querySelector('#q-open-demo');
  const views=[...document.querySelectorAll('.q-view-btn')];
  const concepts=[...document.querySelectorAll('.q-concept-btn')];
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let sequence=0;
  const render=async()=>{
   const version=++sequence;
   const concept=showcase.dataset.concept;
   const view=showcase.dataset.view;
   const newSrc=new URL(`${concept}-${view}.webp`,preview.src).href;
   const newHref=new URL(`${concept}.html`,openDemo.href).href;
   demoName.textContent=concept==='lino'?'Estudio Lino · arquitectura e interiorismo':'Bruma Café · café de especialidad';
   preview.alt=`Vista previa ${view==='mobile'?'móvil':'de escritorio'} del concepto ficticio ${concept==='lino'?'Estudio Lino':'Bruma Café'}`;
   openDemo.href=newHref;
   previewLink.href=newHref;
   previewLink.setAttribute('aria-label',`Explorar ${concept==='lino'?'Estudio Lino':'Bruma Café'} en otra pestaña`);
   if(newSrc===preview.src)return;
   const loaded=new Image();
   loaded.src=newSrc;
   try {await loaded.decode();} catch {return;}
   if(version!==sequence)return;
   if(!reduced)preview.classList.add('is-switching');
   if(!reduced)await new Promise(resolve=>setTimeout(resolve,115));
   if(version!==sequence)return;
   preview.src=newSrc;
   preview.classList.remove('is-switching');
  };
  views.forEach(btn=>btn.addEventListener('click',()=>{
   if(showcase.dataset.view===btn.dataset.view)return;
   showcase.dataset.view=btn.dataset.view;
   views.forEach(item=>{const active=item===btn;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));});
   render();
  }));
  concepts.forEach(btn=>btn.addEventListener('click',()=>{
   if(showcase.dataset.concept===btn.dataset.concept)return;
   showcase.dataset.concept=btn.dataset.concept;
   concepts.forEach(item=>{const active=item===btn;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));});
   render();
  }));
 }
 const header=document.querySelector('.q-header');
 const contact=document.querySelector('.q-mobile-contact');
 const onScroll=()=>{header?.classList.toggle('is-scrolled',scrollY>14);contact?.classList.toggle('is-visible',scrollY>570);};
 onScroll();addEventListener('scroll',onScroll,{passive:true});
 if('IntersectionObserver' in window){
  const manifesto=document.querySelector('.q-manifesto');
  if(manifesto){const observer=new IntersectionObserver((entries)=>{if(entries[0]?.isIntersecting){manifesto.classList.add('q-inview');observer.disconnect();}},{threshold:.3});observer.observe(manifesto);}
 }else{document.querySelector('.q-manifesto')?.classList.add('q-inview');}
})();
