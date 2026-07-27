'use strict';

const METHODOLOGY = [
  {id:'google',name:'Perfil de Negocio en Google',short:'Perfil de Google',weight:45,desc:'Revisamos en un solo lugar cómo aparece el negocio en Google y Google Maps: información, ubicación, fotos, reseñas y facilidad para encontrarlo.',questions:[
    {id:'profile_exists',text:'¿El Perfil de Negocio en Google está reclamado y se puede administrar?',help:'Confirma que el propietario tenga acceso y que la información sea oficial.',weight:5,requires:'googleProfile'},
    {id:'category',text:'¿Google muestra correctamente el tipo de negocio?',help:'La categoría principal debe describir lo que realmente hace el negocio.',weight:4,requires:'googleProfile'},
    {id:'search_name',text:'¿El negocio aparece al buscar su nombre exacto?',help:'Compruébalo tanto en Google como en Google Maps.',weight:4,requires:'googleProfile'},
    {id:'search_service',text:'¿Aparece cuando alguien busca su servicio principal en la zona?',help:'Busca el servicio más importante junto con la colonia o ciudad.',weight:6,requires:'googleProfile'},
    {id:'map_pin',text:'¿La ubicación marcada en Google Maps lleva al lugar correcto?',help:'La ruta debe llevar a la entrada adecuada sin confundir al cliente.',weight:5,requires:'googleProfile'},
    {id:'hours',text:'¿Los horarios publicados están completos y actualizados?',help:'Incluye horarios especiales cuando sea necesario.',weight:3,requires:'googleProfile'},
    {id:'description',text:'¿La información de Google explica con claridad qué ofrece el negocio?',help:'Una persona debe entenderlo rápidamente y sin palabras técnicas.',weight:3,requires:'googleProfile'},
    {id:'rating',text:'¿La calificación del negocio genera confianza?',help:'Valora si la puntuación visible da una buena primera impresión.',weight:3,requires:'googleProfile'},
    {id:'review_volume',text:'¿Tiene una cantidad de reseñas adecuada para su tipo de negocio?',help:'Considera el giro, la antigüedad y los negocios similares de la zona.',weight:4,requires:'googleProfile'},
    {id:'review_recency',text:'¿Ha recibido reseñas nuevas durante los últimos meses?',help:'Una actividad constante transmite que el negocio sigue atendiendo.',weight:3,requires:'googleProfile'},
    {id:'review_response',text:'¿Responde las reseñas de manera amable y profesional?',help:'Revisa especialmente los comentarios recientes y las quejas.',weight:2,requires:'googleProfile'},
    {id:'photos',text:'¿Las fotos ayudan a conocer el negocio, el lugar o su trabajo?',help:'Deben ser reales, claras y relativamente recientes.',weight:3,requires:'googleProfile'}
  ]},
  {id:'website',name:'Sitio web',short:'Sitio web',weight:25,desc:'Esta sección aparece únicamente cuando el negocio tiene sitio web. Revisamos si explica lo que ofrece, funciona bien en celular y facilita el contacto.',questions:[
    {id:'website_clarity',text:'¿Al entrar al sitio se entiende rápidamente qué ofrece el negocio?',help:'La persona debe comprender los servicios o productos en pocos segundos.',weight:7,requires:'website'},
    {id:'services',text:'¿Los principales servicios o productos aparecen completos y fáciles de entender?',help:'Deben estar ordenados y nombrados como los conoce el cliente.',weight:5,requires:'website'},
    {id:'differentiator',text:'¿El sitio muestra una razón concreta para elegir este negocio?',help:'Por ejemplo: experiencia, especialidad, rapidez, ubicación o forma de atención.',weight:4,requires:'website'},
    {id:'mobile',text:'¿El sitio funciona correctamente desde un celular?',help:'Revisa textos, botones, enlaces y facilidad para navegar.',weight:5,requires:'website'},
    {id:'consistency',text:'¿El nombre, domicilio y teléfono coinciden con los datos de Google?',help:'Los mismos datos deben aparecer de forma consistente.',weight:4,requiresAll:['googleProfile','website']}
  ]},
  {id:'contact',name:'Formas de contacto',short:'Contacto',weight:20,desc:'Revisamos si una persona puede llamar, escribir o llegar al negocio sin perder tiempo ni confundirse.',questions:[
    {id:'phone',text:'¿El teléfono publicado funciona y alguien lo atiende correctamente?',help:'Comprueba el número visible en Google y en el sitio, cuando exista.',weight:5},
    {id:'whatsapp',text:'¿Está claro dónde escribir para pedir información?',help:'Puede ser WhatsApp u otro medio directo que el negocio utilice.',weight:5},
    {id:'directions',text:'¿Google Maps facilita llegar al negocio sin confusiones?',help:'Valida ruta, acceso, estacionamiento o referencias importantes.',weight:4,requires:'googleProfile'},
    {id:'review_system',text:'¿La herramienta para solicitar reseñas se utiliza de forma sencilla y constante?',help:'Revisa si el enlace, QR, tarjeta o dispositivo realmente se usa después de atender.',weight:6,requires:'reviewTool'}
  ]},
  {id:'booking',name:'Agenda en línea',short:'Agenda',weight:10,desc:'Esta sección aparece únicamente cuando el negocio trabaja mediante citas. Revisamos si agendar es sencillo y si el cliente recibe claridad sobre el siguiente paso.',questions:[
    {id:'booking',text:'¿El cliente puede agendar o enviar una solicitud en línea fácilmente?',help:'La opción debe ser visible, sencilla y funcionar desde el celular.',weight:7,requires:'booking',requiresAppointment:true},
    {id:'booking_confirmation',text:'¿El cliente recibe una confirmación clara después de agendar o enviar su solicitud?',help:'Puede ser una pantalla, correo o mensaje que confirme que la solicitud fue recibida.',weight:3,requires:'booking',requiresAppointment:true}
  ]}
];

const BASE_STEPS=[
  {id:'business',name:'Información del negocio'},
  {id:'inventory',name:'Inventario del negocio'},
  {id:'google',name:'Perfil de Google'},
  {id:'website',name:'Sitio web'},
  {id:'contact',name:'Formas de contacto'},
  {id:'booking',name:'Agenda en línea'},
  {id:'summary',name:'Resumen'},
  {id:'results',name:'Resultados'}
];
function getSteps(){
  const inv=state.data.inventory||{};
  return BASE_STEPS.filter(s=>{
    if(s.id==='google')return inv.googleProfile!=='no';
    if(s.id==='website')return inv.website!=='no';
    if(s.id==='booking')return inv.appointmentBusiness==='yes';
    return true;
  });
}

const STORAGE_KEY='quio_diagnostics_v6';
const SCHEMA_VERSION='18.0';
const DRAFT_KEY='quio_draft_v6';
const UI_VERSION='18.0.0-rc';
const UI_VERSION_KEY='quio_ui_version';
const SIDEBAR_KEY='quio_ui_sidebar_collapsed';
const LEGACY_SIDEBAR_KEYS=[
  'quio_sidebar_collapsed',
  'quio_sidebar_collapsed_v52',
  'quio_sidebar_collapsed_v53',
  'quio_sidebar_collapsed_v54',
  'quio_sidebar_collapsed_v55',
  'quio_sidebar_collapsed_v611'
];
const state={step:0,data:{business:{},inventory:{},answers:{},answerNotes:{}},result:null,editingId:null};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function init(){migrateStoredData();migrateUiPreferences();restoreSidebarPreference();bindNav();renderStepRail();renderDashboard();renderMethodology();renderHistory();bindGlobal();updateSidebarContext('dashboard');}

function normalizeBusinessType(value=''){
  const map={
    'Belleza y cuidado personal':'Barbería o estética',
    'Alimentos y bebidas':'Restaurante, cafetería o alimentos',
    'Servicios profesionales':'Servicio profesional',
    'Comercio local':'Comercio o tienda',
    'Hospedaje o turismo':'Otro negocio local',
    'Educación o capacitación':'Servicio profesional'
  };
  return map[value]||value||'';
}
function migrateRecord(record={}){
  const migrated={...record,schemaVersion:SCHEMA_VERSION};
  migrated.id=migrated.id||`q-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  migrated.business={...(migrated.business||{})};
  migrated.business.type=normalizeBusinessType(migrated.business.type||migrated.business.businessType||migrated.type)||'Otro negocio local';
  migrated.business.otherType=migrated.business.otherType||migrated.business.customType||'';
  migrated.inventory={...(migrated.inventory||{})};
  migrated.answers={...(migrated.answers||{})};
  migrated.answerNotes={...(migrated.answerNotes||migrated.notesByQuestion||{})};
  return migrated;
}
function migrateStoredData(){
  try{
    const records=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    if(Array.isArray(records))localStorage.setItem(STORAGE_KEY,JSON.stringify(records.map(migrateRecord)));
    const draft=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');
    if(draft)localStorage.setItem(DRAFT_KEY,JSON.stringify(migrateRecord(draft)));
  }catch(error){console.warn('No fue posible migrar datos anteriores.',error)}
}
function migrateUiPreferences(){
  const storedVersion=localStorage.getItem(UI_VERSION_KEY);
  if(storedVersion===UI_VERSION)return;

  // Reinicia únicamente preferencias visuales heredadas. Las revisiones y
  // los borradores permanecen intactos porque utilizan claves independientes.
  LEGACY_SIDEBAR_KEYS.forEach(key=>localStorage.removeItem(key));
  localStorage.setItem(SIDEBAR_KEY,'false');
  localStorage.setItem(UI_VERSION_KEY,UI_VERSION);
}
function restoreSidebarPreference(){
  const saved=localStorage.getItem(SIDEBAR_KEY);
  const collapsed=saved==='true';
  setSidebarCollapsed(collapsed,false);
}
function toggleSidebar(){
  const shell=document.querySelector('.app-shell');
  setSidebarCollapsed(!shell.classList.contains('sidebar-collapsed'),true);
}
function setSidebarCollapsed(collapsed,announce){
  const shell=document.querySelector('.app-shell');
  const toggle=$('#sidebarToggle');
  if(!shell||!toggle)return;
  shell.classList.toggle('sidebar-collapsed',collapsed);
  toggle.setAttribute('aria-expanded',String(!collapsed));
  toggle.setAttribute('aria-label',collapsed?'Mostrar menú lateral':'Ocultar menú lateral');
  toggle.title=collapsed?'Mostrar menú lateral':'Ocultar menú lateral';
  const label=toggle.querySelector('.sidebar-toggle-label');
  if(label)label.textContent=collapsed?'Mostrar menú':'Ocultar menú';
  localStorage.setItem(SIDEBAR_KEY,String(collapsed));
  if(announce)toast(collapsed?'Menú lateral oculto.':'Menú lateral visible.');
}

function updateSidebarContext(view='wizard') {
  const title=$('#sidebarNoteTitle'), text=$('#sidebarNoteText');
  if(!title||!text)return;
  if(view!=='wizard'){
    const contexts={dashboard:['Enfoque Quio','Este módulo sirve para realizar, consultar y entregar revisiones. No incluye funciones de ventas, proyectos ni administración general.'],history:['Revisiones guardadas','Abre, edita, descarga o elimina las revisiones realizadas.'],methodology:['Criterio de revisión','Cada sección corresponde a un activo que Quio puede ayudar a mejorar.']};
    const current=contexts[view]||contexts.dashboard;title.textContent=current[0];text.textContent=current[1];return;
  }
  const id=(getSteps()[state.step]||getSteps()[0]).id;
  const contexts={
    business:['Consejo para la reunión','Escucha primero qué preocupa al dueño y registra sólo la información necesaria.'],
    inventory:['Inventario del negocio','Confirma qué herramientas existen para mostrar únicamente las secciones que aplican.'],
    google:['Perfil de Google','Revisa Google y Maps en un solo bloque: ubicación, información, fotos y reseñas.'],
    website:['Sitio web','Esta sección sólo aparece cuando el negocio tiene un sitio web.'],
    contact:['Formas de contacto','Prueba teléfono, mensajes y rutas antes de calificarlos.'],
    booking:['Agenda en línea','Evalúa la agenda únicamente cuando el negocio trabaja mediante citas.'],
    summary:['Resumen','Confirma qué partes se revisaron antes de mostrar los resultados.'],
    results:['Presenta con claridad','Explica primero lo que ya funciona y después lo que conviene mejorar.']
  };
  const current=contexts[id]||contexts.business;title.textContent=current[0];text.textContent=current[1];
}

function bindNav(){
  $$('.nav-item').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
  $$('[data-view-target]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.viewTarget)));
}
function bindGlobal(){
  const sidebarToggle=$('#sidebarToggle');
  if(sidebarToggle)sidebarToggle.addEventListener('click',toggleSidebar);
  $$('[data-start]').forEach(b=>b.addEventListener('click',startNew));
  $('#prevBtn').onclick=prevStep; $('#nextBtn').onclick=nextStep; $('#saveDraftBtn').onclick=saveDraft;
  $('#helpBtn').onclick=()=>$('#helpDialog').showModal(); $('.dialog-close').onclick=()=>$('#helpDialog').close();
  $('#historySearch').oninput=renderHistory; $('#historyFilter').onchange=renderHistory; $('#exportAllBtn').onclick=exportAll;
}
function showView(name){
  $$('.view').forEach(v=>v.classList.remove('active'));
  $$('.nav-item').forEach(v=>{v.classList.toggle('active',v.dataset.view===name);v.removeAttribute('aria-current')});
  const nav=$(`.nav-item[data-view="${name}"]`); if(nav)nav.setAttribute('aria-current','page');
  $(`#${name}View`).classList.add('active');
  const map={dashboard:['MÓDULO DE REVISIONES','Diagnóstico Quio'],wizard:['REVISIÓN UNO A UNO','Revisión guiada'],history:['REVISIONES GUARDADAS','Todas las revisiones'],methodology:['MARCO DE REVISIÓN','Cómo revisa Quio']};
  $('#sectionEyebrow').textContent=map[name][0]; $('#sectionTitle').textContent=map[name][1];
  if(name==='history')renderHistory(); updateSidebarContext(name); scrollToWizardTop(false);
}
function startNew(){
  const saved=localStorage.getItem(DRAFT_KEY);
  if(saved&&confirm('Hay una revisión sin terminar. ¿Deseas continuarla?')){state.data=migrateRecord(JSON.parse(saved))}
  else{state.data={business:{},inventory:{},answers:{},answerNotes:{}};state.result=null;state.editingId=null}
  state.step=0;showView('wizard');renderWizard();
}
function renderStepRail(){const steps=getSteps();$('#stepRail').innerHTML=steps.map((s,i)=>`<li data-step="${i}">${i+1}. ${s.name}</li>`).join('')}
function updateRail(){
  const steps=getSteps();renderStepRail();
  $$('#stepRail li').forEach((li,i)=>{li.classList.toggle('active',i===state.step);li.classList.toggle('done',i<state.step)});
  $('#progressBar').style.width=`${((state.step+1)/steps.length)*100}%`;
  $('#prevBtn').disabled=false;
  $('#prevBtn').textContent=state.step===0?'Volver a revisiones':'Anterior';
  $('#saveDraftBtn').style.display=state.step===steps.length-1?'none':'inline-flex';
  $('#nextBtn').textContent=steps[state.step].id==='summary'?'Ver resultados':steps[state.step].id==='results'?'Volver a revisiones':'Continuar';
}
function renderWizard(){
  const steps=getSteps();
  if(state.step<0)state.step=0;
  if(state.step>=steps.length)state.step=steps.length-1;
  const id=steps[state.step].id;
  state.currentStepId=id;
  updateRail();
  updateSidebarContext('wizard');
  if(id==='business')renderBusiness();
  else if(id==='inventory')renderInventory();
  else if(id==='summary')renderSummary();
  else if(id==='results')renderResults();
  else renderPillar(id);
}
function renderBusiness(){
  const b=state.data.business;
  $('#wizardContent').innerHTML=`<div class="wizard-copy"><p class="eyebrow">INFORMACIÓN DEL NEGOCIO</p><h2>Empecemos por conocer el negocio.</h2><p>Estos datos te ayudarán a conducir la conversación y a interpretar correctamente la revisión.</p></div><div class="meeting-note"><strong>Modo reunión uno a uno</strong><span>Haz las preguntas de forma natural mientras conversas con el dueño o responsable del negocio.</span></div><div class="form-grid">
  ${field('name','Nombre del negocio',b.name,'text','Ej. Consultorio Dental Rivera','full')}
  ${field('owner','Nombre de la persona con quien realizas la revisión',b.owner,'text','Nombre completo')}
  ${field('city','Ciudad o municipio',b.city,'text','Hermosillo, Sonora')}
  <div class="field"><label for="businessType">Tipo de negocio</label><select id="businessType"><option value="">Seleccionar</option>${['Barbería o estética','Consultorio o servicio de salud','Consultorio dental','Restaurante, cafetería o alimentos','Taller o servicio automotriz','Veterinaria','Comercio o tienda','Servicio profesional','Otro negocio local'].map(x=>`<option value="${x}" ${normalizeBusinessType(b.type)===x?'selected':''}>${x}</option>`).join('')}</select><small>Selecciona el giro capturado; el sistema no lo deduce del nombre.</small></div>${normalizeBusinessType(b.type)==='Otro negocio local'?field('otherBusinessType','Giro específico',b.otherType,'text','Ej. Cerrajería o imprenta'):''}
  ${field('mainService','Servicio o producto principal',b.mainService,'text','Ej. Limpieza dental')}
  ${field('address','Domicilio que aparece públicamente',b.address,'text','Calle, número y colonia','full')}
  ${field('notes','Notas de la reunión',b.notes,'textarea','Situación, dudas o prioridades que comentó el dueño del negocio','full')}</div>`;
}
function field(id,label,value='',type='text',placeholder='',cls=''){return `<div class="field ${cls}"><label for="${id}">${label}</label>${type==='textarea'?`<textarea id="${id}" rows="3" placeholder="${placeholder}">${esc(value||'')}</textarea>`:`<input id="${id}" type="${type}" value="${esc(value||'')}" placeholder="${placeholder}">`}</div>`}
function renderInventory(){
  const i=state.data.inventory;
  $('#wizardContent').innerHTML=`<div class="wizard-copy"><p class="eyebrow">INVENTARIO DEL NEGOCIO</p><h2>¿Con qué cuenta actualmente?</h2><p>Con estas respuestas el sistema mostrará únicamente las secciones que realmente aplican.</p></div><div class="form-grid">
  ${assetField('googleProfile','Perfil de Negocio en Google',i.googleProfile,'Es la ficha que aparece en Google y Google Maps.')}
  ${assetField('website','Sitio web propio',i.website,'No incluye perfiles de redes sociales.')}
  ${assetField('whatsappBusiness','WhatsApp o medio directo para mensajes',i.whatsappBusiness,'Registra si el negocio ofrece una forma clara de escribirle.')}
  ${yesNoField('appointmentBusiness','¿El negocio atiende mediante citas o reservaciones?',i.appointmentBusiness,'Por ejemplo: consultorios, estéticas, talleres o servicios que reservan un horario para atender.')}
  ${assetField('booking','Agenda o formulario en línea',i.booking,'Sólo se utilizará cuando el negocio trabaje mediante citas.')}
  ${assetField('reviewTool','Alguna forma para facilitar reseñas',i.reviewTool,'Por ejemplo: enlace, QR, tarjeta o dispositivo sencillo.')}
  ${field('profileUrl','Enlace de Google o Maps',i.profileUrl,'url','https://...','full')}
  ${field('websiteUrl','Enlace del sitio web',i.websiteUrl,'url','https://...','full')}
  ${field('reviewCount','Cantidad actual de reseñas',i.reviewCount,'number','0')}
  ${field('ratingValue','Calificación actual',i.ratingValue,'number','0.0')}
  </div>
  <div class="insight-box scope-box"><strong>Lo que Quio no revisa</strong><p>No se evalúan Facebook, Instagram, TikTok, LinkedIn, YouTube, publicaciones, campañas ni administración de redes sociales.</p></div>`;
}
function assetField(id,label,val,help){return `<div class="field asset-field"><label for="${id}">${label}</label><select id="${id}"><option value="">Seleccionar</option><option value="yes" ${val==='yes'?'selected':''}>Sí, existe</option><option value="partial" ${val==='partial'?'selected':''}>Existe, pero necesita mejoras</option><option value="no" ${val==='no'?'selected':''}>No existe</option></select><small>${help}</small></div>`}
function yesNoField(id,label,val,help){
  const normalized=val==='partial'?'':val;
  return `<div class="field asset-field"><label for="${id}">${label}</label><select id="${id}"><option value="">Seleccionar</option><option value="yes" ${normalized==='yes'?'selected':''}>Sí</option><option value="no" ${normalized==='no'?'selected':''}>No</option></select><small>${help}</small></div>`
}
function isApplicable(q){
  const inv=state.data.inventory;
  if(q.requires&&inv[q.requires]==='no')return false;
  if(q.requiresAll&&q.requiresAll.some(k=>inv[k]==='no'))return false;
  if(q.requiresAppointment&&inv.appointmentBusiness!=='yes')return false;
  return true;
}
function renderPillar(id){
  const p=METHODOLOGY.find(x=>x.id===id),steps=getSteps(),n=steps.findIndex(x=>x.id===id)+1;
  const visible=p.questions.filter(isApplicable);
  const answered=visible.filter(q=>state.data.answers[q.id]).length;
  $('#wizardContent').innerHTML=`<div class="wizard-copy"><p class="eyebrow">${p.name.toUpperCase()} · ${p.weight} PUNTOS</p><h2>${p.name}</h2><p>${p.desc}</p></div>${visible.length?`<div class="question-progress" role="status"><strong>Respondidas: ${answered} de ${visible.length}</strong><span>${answered===visible.length?'Esta parte está completa.':`Faltan ${visible.length-answered} por revisar.`}</span></div><div class="question-list">${visible.map((q,index)=>questionCard(q,index,visible.length)).join('')}</div>`:`<div class="not-applicable"><strong>Esta parte no necesita preguntas.</strong><p>El negocio no cuenta todavía con el activo necesario. El sistema ya registró esa oportunidad y la tomará en cuenta en la recomendación.</p></div>`}`;
  $$('.answer-btn').forEach(b=>b.onclick=()=>{const card=b.closest('.question-card');card.querySelectorAll('.answer-btn').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});b.classList.add('selected');b.setAttribute('aria-pressed','true');state.data.answers[card.dataset.id]=b.dataset.value;const note=card.querySelector('.question-note');if(note){note.hidden=b.dataset.value==='yes';note.querySelector('label').textContent=b.dataset.value==='not_checked'?'¿Qué faltó comprobar? (opcional)':'¿Qué observaste? (opcional)'}const completed=visible.filter(q=>state.data.answers[q.id]).length,status=$('.question-progress');if(status)status.innerHTML=`<strong>Respondidas: ${completed} de ${visible.length}</strong><span>${completed===visible.length?'Esta parte está completa.':`Faltan ${visible.length-completed} por revisar.`}</span>`;markDirty()});
  $$('.question-note textarea').forEach(input=>input.addEventListener('input',()=>{state.data.answerNotes[input.dataset.noteId]=input.value.trim();markDirty()}));
}

function renderSummary(){
  const inv=state.data.inventory, reviewed=[];
  reviewed.push({name:'Perfil de Negocio en Google',status:inv.googleProfile==='no'?'No existe; se registró como oportunidad':'Revisado'});
  reviewed.push({name:'Sitio web',status:inv.website==='no'?'No existe; se registró como oportunidad':'Revisado'});
  reviewed.push({name:'Formas de contacto',status:'Revisado'});
  reviewed.push({name:'Agenda en línea',status:inv.appointmentBusiness!=='yes'?'No aplica para este negocio':inv.booking==='no'?'No existe; se registró como oportunidad':'Revisada'});
  const quality=verificationSummary(state.data.answers);
  $('#wizardContent').innerHTML=`<div class="wizard-copy"><p class="eyebrow">RESUMEN DE LA REVISIÓN</p><h2>La revisión está lista.</h2><p>Confirma las partes revisadas antes de mostrar los resultados al cliente.</p></div><div class="quality-summary"><div><strong>${quality.checked}</strong><span>aspectos comprobados</span></div><div><strong>${quality.unverified}</strong><span>no se pudieron comprobar</span></div></div><div class="summary-review-grid">${reviewed.map(x=>`<article class="panel summary-review-item"><span>${x.status.startsWith('Revis')?'✓':'—'}</span><div><strong>${x.name}</strong><p>${x.status}</p></div></article>`).join('')}</div><div class="meeting-note"><strong>Siguiente paso</strong><span>Primero explicaremos lo que ya funciona; después, las oportunidades comprobadas y lo que Quio puede atender.</span></div>`;
  $('#nextBtn').textContent='Generar resultados';
  $('#nextBtn').setAttribute('aria-label','Generar y mostrar los resultados de la revisión');
  $('#prevBtn').textContent='Anterior';
  $('#saveDraftBtn').style.display='none';
}

function questionCard(q,index,total){
  const a=state.data.answers[q.id];
  const number=Number.isInteger(index)?index+1:1,count=Number.isInteger(total)?total:1;
  const note=state.data.answerNotes?.[q.id]||'';
  return `<article class="question-card" data-id="${q.id}"><div class="question-top"><div><span class="question-number">Pregunta ${number} de ${count}</span><h3>${q.text}</h3><p>${q.help}</p></div><span class="weight">${q.weight} pts</span></div><div class="answer-group" role="group" aria-label="Respuesta a la pregunta ${number}"><button type="button" class="answer-btn ${a==='yes'?'selected':''}" data-value="yes" aria-pressed="${a==='yes'}"><span class="signal yes"></span>Sí</button><button type="button" class="answer-btn ${a==='partial'?'selected':''}" data-value="partial" aria-pressed="${a==='partial'}"><span class="signal partial"></span>En parte</button><button type="button" class="answer-btn ${a==='no'?'selected':''}" data-value="no" aria-pressed="${a==='no'}"><span class="signal no"></span>No</button><button type="button" class="answer-btn answer-btn--unknown ${a==='not_checked'?'selected':''}" data-value="not_checked" aria-pressed="${a==='not_checked'}">No pudimos comprobarlo</button></div><div class="question-note" ${!a||a==='yes'?'hidden':''}><label for="note-${q.id}">${a==='not_checked'?'¿Qué faltó comprobar? (opcional)':'¿Qué observaste? (opcional)'}</label><textarea id="note-${q.id}" data-note-id="${q.id}" rows="2" maxlength="240" placeholder="Nota interna para recordar lo conversado; no aparece en el informe.">${esc(note)}</textarea></div></article>`;
}
function clearValidation(){
  $$('.field-error,.question-error').forEach(el=>el.classList.remove('field-error','question-error'));
  $$('[aria-invalid="true"]').forEach(el=>el.removeAttribute('aria-invalid'));
  $$('.inline-error').forEach(el=>el.remove());
  const summary=$('#validationSummary');if(summary)summary.remove();
}
function addFieldError(id,message){
  const control=$(`#${id}`);if(!control)return;
  control.setAttribute('aria-invalid','true');
  const field=control.closest('.field');if(field)field.classList.add('field-error');
  if(field&&!field.querySelector('.inline-error'))field.insertAdjacentHTML('beforeend',`<small class="inline-error">${message}</small>`);
}
function addQuestionError(id){
  const card=$(`.question-card[data-id="${id}"]`);if(!card)return;
  card.classList.add('question-error');
  if(!card.querySelector('.inline-error'))card.insertAdjacentHTML('beforeend','<p class="inline-error">Selecciona una respuesta para continuar.</p>');
}
function showValidationSummary(messages){
  const unique=[...new Set(messages)];
  const html=`<div id="validationSummary" class="validation-summary" role="alert" tabindex="-1"><strong>Falta completar ${unique.length===1?'un dato':'algunos datos'}.</strong><p>Revisa los campos marcados en rojo antes de continuar.</p><ul>${unique.map(m=>`<li>${m}</li>`).join('')}</ul></div>`;
  $('#wizardContent').insertAdjacentHTML('afterbegin',html);
  const summary=$('#validationSummary');summary.scrollIntoView({behavior:'smooth',block:'start'});summary.focus({preventScroll:true});
  toast('Faltan datos obligatorios. Revisa los campos marcados en rojo.','error');
}
function collectCurrent(){
  clearValidation();
  const id=getSteps()[state.step].id,errors=[];
  if(id==='business'){
    state.data.business={name:$('#name').value.trim(),owner:$('#owner').value.trim(),city:$('#city').value.trim(),type:normalizeBusinessType($('#businessType').value),otherType:$('#otherBusinessType')?$('#otherBusinessType').value.trim():'',mainService:$('#mainService').value.trim(),address:$('#address').value.trim(),notes:$('#notes').value.trim()};
    if(!state.data.business.name){addFieldError('name','Escribe el nombre del negocio.');errors.push('Nombre del negocio')}
    if(!state.data.business.type){addFieldError('businessType','Selecciona el tipo de negocio.');errors.push('Tipo de negocio')} if(state.data.business.type==='Otro negocio local'&&!state.data.business.otherType){addFieldError('otherBusinessType','Escribe el giro específico.');errors.push('Giro específico')}
    if(errors.length){showValidationSummary(errors);return false}return true;
  }
  if(id==='inventory'){
    state.data.inventory={googleProfile:$('#googleProfile').value,website:$('#website').value,whatsappBusiness:$('#whatsappBusiness').value,appointmentBusiness:$('#appointmentBusiness').value,booking:$('#booking').value,reviewTool:$('#reviewTool').value,profileUrl:$('#profileUrl').value.trim(),websiteUrl:$('#websiteUrl').value.trim(),reviewCount:Number($('#reviewCount').value||0),ratingValue:Number($('#ratingValue').value||0)};
    const required=[['googleProfile','Perfil de Negocio en Google'],['website','Sitio web propio'],['whatsappBusiness','WhatsApp o medio directo'],['appointmentBusiness','El negocio atiende mediante citas o reservaciones'],['reviewTool','Forma para facilitar reseñas']];
    if(state.data.inventory.appointmentBusiness==='yes')required.push(['booking','Agenda o formulario en línea']);
    else state.data.inventory.booking='no';
    required.forEach(([key,label])=>{if(!state.data.inventory[key]){addFieldError(key,'Selecciona una opción.');errors.push(label)}});
    if(errors.length){showValidationSummary(errors);return false}return true;
  }
  if(id!=='results'&&id!=='summary'){
    const p=METHODOLOGY.find(x=>x.id===id),missing=p.questions.filter(isApplicable).filter(q=>!state.data.answers[q.id]);
    missing.forEach(q=>addQuestionError(q.id));
    if(missing.length){showValidationSummary(missing.map(q=>q.text));return false}return true;
  }
  return true;
}
function nextStep(){
  const steps=getSteps(),current=state.currentStepId||steps[state.step].id;
  if(current==='results'){showView('dashboard');return}
  if(!collectCurrent())return;
  if(current==='summary'){state.result=calculate();saveResult(state.result)}
  state.step++;state.currentStepId=null;renderWizard();markSaved();scrollToWizardTop(true);focusFirstControl();
}
function prevStep(){
  collectCurrent();
  state.currentStepId=null;
  if(state.step===0){
    localStorage.setItem(DRAFT_KEY,JSON.stringify(state.data));
    showView('dashboard');
    renderDashboard();
    toast('Borrador guardado. Puedes continuar la revisión más tarde.');
    return;
  }
  state.step--;
  renderWizard();
  scrollToWizardTop(true);
  focusFirstControl();
}
function scrollToWizardTop(smooth=true){const target=$('.wizard-main')||$('#main');if(target)target.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'});else window.scrollTo({top:0,behavior:smooth?'smooth':'auto'})}
function focusFirstControl(){setTimeout(()=>{const el=$('#wizardContent input,#wizardContent select,#wizardContent textarea,#wizardContent button');if(el)el.focus({preventScroll:true})},350)}
function saveDraft(){collectCurrent();localStorage.setItem(DRAFT_KEY,JSON.stringify(state.data));markSaved();toast('La revisión quedó guardada en este dispositivo.')}
function markDirty(){$('#saveText').textContent='Cambios sin guardar';$('#saveDot').style.background='var(--amber)'}
function markSaved(){$('#saveText').textContent='Guardado local';$('#saveDot').style.background='var(--green)'}

function verificationSummary(answers={}){const values=Object.values(answers);return {checked:values.filter(value=>['yes','partial','no'].includes(value)).length,unverified:values.filter(value=>value==='not_checked').length}}
function calculate(){
  const values={yes:1,partial:.5,no:0},pillars={};let earnedTotal=0,weightTotal=0;
  METHODOLOGY.forEach(p=>{
    const inv=state.data.inventory;
    const excluded=p.id==='booking'&&inv.appointmentBusiness!=='yes';
    if(excluded){pillars[p.id]=null;return}
    const applicable=p.questions.filter(isApplicable);let earned=0,possible=0;
    applicable.filter(q=>state.data.answers[q.id]!=='not_checked').forEach(q=>{possible+=q.weight;earned+=q.weight*(values[state.data.answers[q.id]]||0)});
    let normalized=0;
    const absent=(p.id==='google'&&inv.googleProfile==='no')||(p.id==='website'&&inv.website==='no')||(p.id==='booking'&&inv.appointmentBusiness==='yes'&&inv.booking==='no');
    if(absent){normalized=0;weightTotal+=p.weight}
    else if(!possible){pillars[p.id]=null;return}
    else{normalized=earned/possible*p.weight;weightTotal+=p.weight}
    pillars[p.id]=Math.round(normalized);earnedTotal+=normalized;
  });
  const iqpd=Math.round(weightTotal?earnedTotal/weightTotal*100:0),level=iqpd<40?'critical':iqpd<60?'basic':iqpd<80?'functional':'strong';
  const findings=buildFindings(),recommendation=recommendPackage(pillars,findings);
  const actionPlan=buildPlan(findings,recommendation);
  const engineWarnings=QuioDecisionEngine.validateResult(state.data.inventory,findings,recommendation,actionPlan);
  if(engineWarnings.length)console.warn('Quio Decision Engine:',engineWarnings);
  return {id:state.editingId||(crypto.randomUUID?crypto.randomUUID():String(Date.now())),date:new Date().toISOString(),updatedAt:new Date().toISOString(),business:{...state.data.business},inventory:{...state.data.inventory},answers:{...state.data.answers},answerNotes:{...(state.data.answerNotes||{})},verification:verificationSummary(state.data.answers),iqpd,level,pillars,findings,recommendation,plan:actionPlan.included,future:actionPlan.future,engineWarnings};
}
const POSITIVE={
 profile_exists:'El Perfil de Negocio en Google existe y puede administrarse.',category:'Google muestra correctamente el tipo de negocio.',search_name:'El negocio aparece al buscar su nombre exacto.',search_service:'El negocio aparece al buscar su servicio principal en la zona.',map_pin:'La ubicación en Google Maps lleva al lugar correcto.',rating:'La calificación pública genera confianza.',review_volume:'La cantidad de reseñas transmite experiencia y actividad.',review_recency:'El negocio recibe reseñas nuevas de manera constante.',review_response:'Las reseñas reciben respuestas amables y profesionales.',photos:'Las fotos ayudan a conocer el negocio y su trabajo.',consistency:'Los datos del negocio coinciden en Google y en el sitio.',description:'La ficha de Google explica claramente qué ofrece.',services:'Los servicios principales aparecen completos y fáciles de entender.',hours:'Los horarios están completos y actualizados.',website_clarity:'El sitio web explica claramente servicios, ubicación y contacto.',differentiator:'Se entiende una razón concreta para elegir el negocio.',phone:'El teléfono publicado funciona y se atiende correctamente.',whatsapp:'Está claro dónde escribir para pedir información.',directions:'Google Maps facilita llegar sin confusiones.',cta:'Los botones de contacto son fáciles de encontrar.',mobile:'El sitio funciona correctamente desde un celular.',booking:'El cliente puede agendar o solicitar en línea fácilmente.',review_system:'Existe una forma sencilla de pedir reseñas.',booking_confirmation:'El cliente recibe una confirmación clara después de agendar.'
};
const NEGATIVE={
 profile_exists:'No cuenta con un Perfil de Negocio en Google listo para administrarse.',category:'Google no muestra con claridad el tipo correcto de negocio.',search_name:'No aparece con facilidad al buscar su nombre exacto.',search_service:'No aparece al buscar su servicio principal en la zona.',map_pin:'La ubicación o el punto de Google Maps puede confundir al cliente.',rating:'La calificación actual todavía no transmite suficiente confianza.',review_volume:'Tiene pocas reseñas frente a negocios similares.',review_recency:'No recibe reseñas nuevas de manera constante.',review_response:'No responde las reseñas de sus clientes de forma constante.',photos:'Las fotos actuales no muestran suficientemente el negocio o su trabajo.',consistency:'El nombre, domicilio o teléfono no coinciden en todos sus espacios.',description:'La información de Google no explica con claridad qué ofrece.',services:'Sus principales servicios o productos no aparecen completos o claros.',hours:'Los horarios publicados están incompletos o desactualizados.',website_clarity:'El sitio no explica claramente servicios, ubicación y formas de contacto.',differentiator:'No se entiende una razón concreta para elegir el negocio.',phone:'El teléfono publicado no funciona o no se atiende correctamente.',whatsapp:'No está claro dónde escribir para pedir información.',directions:'Llegar desde Google Maps puede resultar confuso.',cta:'Los botones para llamar, escribir, llegar o agendar no son fáciles de encontrar.',mobile:'El sitio presenta dificultades al usarlo desde un celular.',booking:'Hoy las personas no tienen una forma sencilla de agendar una cita o enviar una solicitud desde internet.',review_system:'No existe una forma sencilla y constante de pedir reseñas.',booking_confirmation:'El cliente no recibe una confirmación clara después de agendar o enviar su solicitud.'
};
function findingModule(id){
  const googleIds=new Set(['profile_missing','profile_exists','category','search_name','search_service','map_pin','rating','review_volume','review_recency','review_response','photos','description','hours']);
  const websiteIds=new Set(['website_missing','website_clarity','services','differentiator','mobile','consistency']);
  const contactIds=new Set(['phone','whatsapp','directions','review_tool_missing','review_system']);
  const bookingIds=new Set(['booking_missing','booking','booking_confirmation']);
  if(googleIds.has(id))return 'google';
  if(websiteIds.has(id))return 'website';
  if(contactIds.has(id))return 'contact';
  if(bookingIds.has(id))return 'booking';
  return 'contact';
}
function findingGroup(id){
  if(['booking_missing','booking'].includes(id))return 'booking_access';
  if(['review_tool_missing','review_system','review_volume','review_recency'].includes(id))return id==='review_tool_missing'||id==='review_system'?'reviews_tool':'reviews_activity';
  return id;
}
function buildFindings(){
  const strengths=[],opportunities=[],inv=state.data.inventory;
  if(inv.googleProfile==='no')opportunities.push({id:'profile_missing',module:'google',title:'El negocio no cuenta con un Perfil de Negocio en Google listo para trabajar.',priority:'Alta',weight:8});
  if(inv.website==='no')opportunities.push({id:'website_missing',module:'website',title:'El negocio no cuenta con un sitio web propio.',priority:'Alta',weight:7});
  if(inv.booking==='no'&&inv.appointmentBusiness==='yes')opportunities.push({id:'booking_missing',module:'booking',title:'Los clientes no pueden agendar o enviar una solicitud en línea.',priority:'Alta',weight:6});
  if(inv.reviewTool==='no')opportunities.push({id:'review_tool_missing',module:'contact',title:'No existe una herramienta sencilla para facilitar que los clientes dejen reseñas.',priority:'Media',weight:5});
  const allQuestions=METHODOLOGY.flatMap(p=>p.questions.map(q=>({...q,pillar:p.name,module:p.id})));
  const applicableIds=new Set(allQuestions.filter(isApplicable).map(q=>q.id));
  // Descarta respuestas heredadas de activos que ya no existen o dejaron de aplicar.
  Object.keys(state.data.answers).forEach(id=>{if(!applicableIds.has(id))delete state.data.answers[id]});
  allQuestions.filter(isApplicable).forEach(q=>{
    const a=state.data.answers[q.id];
    if(a==='yes'&&POSITIVE[q.id])strengths.push({id:q.id,module:q.module,text:POSITIVE[q.id]});
    if((a==='no'||a==='partial')&&NEGATIVE[q.id])opportunities.push({id:q.id,module:q.module,title:a==='partial'?NEGATIVE[q.id].replace(/^No /,'Todavía no '):NEGATIVE[q.id],priority:q.weight>=5?'Alta':'Media',weight:q.weight});
  });
  const unique=[];const seenGroups=new Set();
  opportunities.sort((a,b)=>b.weight-a.weight).forEach(x=>{const key=findingGroup(x.id);if(!seenGroups.has(key)){seenGroups.add(key);unique.push(x)}});
  return {strengths:strengths.slice(0,12),opportunities:unique.slice(0,12)};
}
function recommendPackage(scores,findings){return QuioDecisionEngine.recommend(state.data.inventory,findings);}
function buildPlan(findings,recommendation){return QuioDecisionEngine.buildPlan(findings,recommendation);}
function moduleStatus(r,p){
  if(p.id==='google'&&r.inventory.googleProfile==='no')return {label:'No existe',pct:null};
  if(p.id==='website'&&r.inventory.website==='no')return {label:'No existe',pct:null};
  if(p.id==='booking'&&r.inventory.appointmentBusiness!=='yes')return {label:'No aplica',pct:null};
  if(p.id==='booking'&&r.inventory.booking==='no')return {label:'No existe',pct:null};
  const val=r.pillars[p.id];
  return val===null||val===undefined?{label:'No comprobado',pct:null}:{label:`${Math.round(val/p.weight*100)}%`,pct:Math.max(0,Math.min(1,val/p.weight))};
}
function moduleTitle(id){return {google:'Perfil de Google',website:'Sitio web',contact:'Formas de contacto',booking:'Agenda en línea'}[id]||'Otros';}
function displayBusinessType(business={}){return business.type==='Otro negocio local'&&business.otherType?business.otherType:(business.type||'Negocio local')}
function absentModuleInfo(r,id){
  const inv=r.inventory||{};
  if(id==='google'&&inv.googleProfile==='no')return {id:'profile_missing',title:'El negocio no cuenta con un Perfil de Negocio en Google listo para administrar.',action:QuioDecisionEngine.SERVICE_ACTIONS.profile_missing.text};
  if(id==='website'&&inv.website==='no')return {id:'website_missing',title:'El negocio no cuenta con un sitio web propio.',action:QuioDecisionEngine.SERVICE_ACTIONS.website_missing.text};
  if(id==='booking'&&inv.appointmentBusiness==='yes'&&inv.booking==='no')return {id:'booking_missing',title:'Las personas no tienen una forma sencilla de agendar una cita o enviar una solicitud desde internet.',action:QuioDecisionEngine.SERVICE_ACTIONS.booking_missing.text};
  return null;
}
function actionForMissingModule(recommendation,id){
  const caps=new Set(recommendation?.capabilities||[]);
  if(id==='google')return caps.has('googleCreate');
  if(id==='website')return caps.has('websiteCreate');
  if(id==='booking')return caps.has('bookingCreate');
  return false;
}
function actionForFinding(r,item){
  const action=QuioDecisionEngine.SERVICE_ACTIONS?.[item?.id];
  if(!action)return '';
  const caps=new Set(r.recommendation?.capabilities||[]);
  if(!caps.has(action.capability))return '';
  // Cuando se crea un Perfil nuevo, las optimizaciones menores quedan absorbidas por esa acción principal.
  if(caps.has('googleCreate')&&action.capability==='googleImprove')return '';
  // Evita repetir una misma acción en varios hallazgos relacionados (por ejemplo, reseñas).
  // La acción se explica únicamente en el hallazgo que originó la acción incluida en el plan.
  const included=(r.plan||[]).find(x=>x.id===item.id);
  return included?.text||action.text||'';
}
function whyImportant(id){
  return ({
    profile_missing:'Sin una ficha administrable, el negocio pierde control sobre la información que ven sus clientes.',
    website_missing:'Muchas personas buscan más información antes de decidir. Sin un sitio web pueden quedarse con dudas o buscar otra opción.',
    booking_missing:'Cuando agendar requiere varios mensajes o llamadas, algunas personas abandonan antes de confirmar.',
    review_tool_missing:'Pedir una reseña debe ser sencillo; mientras más pasos existan, menos clientes completan el proceso.',
    search_service:'Si el negocio no aparece al buscar el servicio, puede perder oportunidades frente a opciones más visibles.',
    review_volume:'Las reseñas ayudan a generar confianza. Cuando hay pocas, algunas personas prefieren comparar antes de decidir.',
    review_recency:'Las opiniones recientes muestran que el negocio sigue activo y atendiendo clientes.',
    rating:'La calificación es una de las primeras señales que muchas personas revisan antes de contactar.',
    photos:'Las fotografías ayudan a imaginar la experiencia y a reconocer el lugar antes de visitarlo.',
    mobile:'La mayoría de las búsquedas locales se realizan desde el teléfono; una experiencia difícil puede frenar el contacto.',
    whatsapp:'Si no está claro dónde escribir, el cliente puede posponer el contacto o elegir otra opción.',
    phone:'Un teléfono incorrecto o sin atención puede cerrar por completo una oportunidad de contacto.',
    review_system:'Una rutina sencilla ayuda a recibir opiniones nuevas de manera constante.',
    booking:'Una forma visible de agendar reduce pasos y facilita que el interés se convierta en una solicitud.',
    booking_confirmation:'La confirmación da tranquilidad al cliente y evita dudas sobre si su solicitud fue recibida.',
    differentiator:'Una razón clara para elegir el negocio facilita la decisión cuando el cliente compara opciones.',
    website_clarity:'El sitio debe responder rápidamente qué ofrece el negocio y cómo puede ayudar al cliente.'
  })[id]||'Este punto puede influir en la confianza del cliente o en la facilidad para dar el siguiente paso.';
}


const FINDING_TITLES={
  profile_missing:'Perfil de Google no disponible',profile_exists:'Perfil de Google',category:'Categoría del negocio',search_name:'Búsqueda por nombre',search_service:'Visibilidad por servicio',map_pin:'Ubicación en Google Maps',rating:'Calificación pública',review_volume:'Cantidad de reseñas',review_recency:'Reseñas recientes',review_response:'Respuesta a reseñas',photos:'Fotografías del negocio',description:'Descripción del perfil',hours:'Horarios publicados',
  website_missing:'Sitio web propio',website_clarity:'Claridad del sitio web',services:'Servicios publicados',differentiator:'Razón para elegir el negocio',mobile:'Experiencia en celular',consistency:'Datos del negocio',
  phone:'Teléfono de contacto',whatsapp:'Contacto por mensaje',directions:'Cómo llegar al negocio',review_tool_missing:'Herramienta para solicitar reseñas',review_system:'Proceso para pedir reseñas',
  booking_missing:'Agenda en línea',booking:'Solicitud de citas en línea',booking_confirmation:'Confirmación de la cita'
};
function findingTitle(id){return FINDING_TITLES[id]||'Aspecto por mejorar';}
const FINDING_ICON_GROUPS={
  search:['search_name','search_service'],pin:['map_pin','directions'],star:['rating','review_volume','review_recency','review_response','review_tool_missing','review_system'],camera:['photos'],clock:['hours'],tag:['category','services'],file:['description','differentiator','website_clarity'],google:['profile_missing','profile_exists'],globe:['website_missing','mobile','consistency'],phone:['phone'],message:['whatsapp'],calendar:['booking_missing','booking','booking_confirmation']
};
function findingIconName(id){for(const [name,ids] of Object.entries(FINDING_ICON_GROUPS))if(ids.includes(id))return name;return 'check';}
function findingIconSVG(id){
  const paths={
    search:'<circle cx="10.5" cy="10.5" r="5.5"></circle><path d="m15 15 4 4"></path>',
    pin:'<path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"></path><circle cx="12" cy="10" r="2"></circle>',
    star:'<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"></path>',
    camera:'<path d="M4 8h3l1.4-2h7.2L17 8h3v11H4Z"></path><circle cx="12" cy="13" r="3"></circle>',
    clock:'<circle cx="12" cy="12" r="8"></circle><path d="M12 7v5l3 2"></path>',
    tag:'<path d="M4 5h7l9 9-6 6-9-9Z"></path><circle cx="8.5" cy="8.5" r="1"></circle>',
    file:'<path d="M6 3h8l4 4v14H6Z"></path><path d="M14 3v5h5M9 12h6M9 16h6"></path>',
    google:'<circle cx="12" cy="12" r="8"></circle><path d="M12 8a4 4 0 1 0 3.5 6H12v-3h8"></path>',
    globe:'<circle cx="12" cy="12" r="8"></circle><path d="M4 12h16M12 4c2.2 2.2 3.3 4.9 3.3 8S14.2 17.8 12 20c-2.2-2.2-3.3-4.9-3.3-8S9.8 6.2 12 4Z"></path>',
    phone:'<path d="M7 4 4.5 6.5c1.6 6.4 6.6 11.4 13 13L20 17l-4-2-2 2c-3-1.3-5.7-4-7-7l2-2Z"></path>',
    message:'<path d="M4 5h16v11H9l-5 4Z"></path><path d="M8 10h8M8 13h5"></path>',
    calendar:'<rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 9h16M8 13h3M13 13h3M8 16h3"></path>',
    check:'<circle cx="12" cy="12" r="8"></circle><path d="m8.5 12 2.2 2.2 4.8-5"></path>'
  };
  const name=findingIconName(id);
  return `<span class="finding-title-icon finding-title-icon--${name}" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">${paths[name]}</svg></span>`;
}
function findingHeadingHTML(id){return `<div class="finding-heading"><span class="finding-heading-accent" aria-hidden="true"></span>${findingIconSVG(id)}<h4>${esc(findingTitle(id))}</h4></div>`;}
function findingCaseHTML(r,item){
  const action=actionForFinding(r,item);
  if(!action)return '';
  return `<div class="finding-case">${findingHeadingHTML(item.id)}<div class="finding-body"><p class="finding-opportunity"><strong>Hoy</strong><span>${esc(item.title)}</span></p><p class="finding-solution"><strong>Con Quio</strong><span>${esc(action)}</span></p></div></div>`;
}
function groupedFindingsHTML(r){
  const order=['google','website','contact','booking'];
  return order.map(id=>{
    const absent=absentModuleInfo(r,id);
    if(absent){
      if(!actionForMissingModule(r.recommendation,id))return '';
      return `<article class="module-findings module-findings--absent"><h3>${moduleTitle(id)}</h3>${findingHeadingHTML(absent.id||({google:'profile_missing',website:'website_missing',booking:'booking_missing',contact:'review_tool_missing'}[id]))}<div class="finding-body"><p class="finding-opportunity"><strong>Hoy</strong><span>${esc(absent.title)}</span></p><p class="finding-solution"><strong>Con Quio</strong><span>${esc(absent.action)}</span></p></div></article>`;
    }
    const good=(r.findings.strengths||[]).filter(x=>(typeof x==='string'?findingModule(Object.keys(POSITIVE).find(k=>POSITIVE[k]===x)||''):x.module)===id).map(x=>typeof x==='string'?x:x.text);
    const improve=(r.findings.opportunities||[]).filter(x=>(x.module||findingModule(x.id))===id && actionForFinding(r,x));
    if(!good.length&&!improve.length)return '';
    return `<article class="module-findings"><h3>${moduleTitle(id)}</h3>${good.length?`<div class="module-good"><strong>Lo que está funcionando</strong><ul>${good.slice(0,3).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}${improve.length?`<div class="module-cases">${improve.map(item=>findingCaseHTML(r,item)).join('')}</div>`:''}</article>`;
  }).join('');
}
function renderResults(){
  const r=state.result||calculate();state.result=r;
  $('#wizardContent').innerHTML=`<div class="wizard-copy"><p class="eyebrow">RESULTADO DE LA REVISIÓN</p><h2>${esc(r.business.name)}</h2><p>Utiliza esta pantalla para explicar los hallazgos al cliente durante la reunión.</p></div>
  <div class="result-header"><div class="score-ring" style="--score:${r.iqpd}"><div><small>ÍNDICE QUIO</small><strong>${r.iqpd}</strong><span>de 100</span></div></div><div class="result-summary"><span class="score-chip level-${r.level}">${levelLabel(r.level)}</span><h2>${resultHeadline(r)}</h2><p>${resultExplanation(r)}</p><div class="result-actions no-print"><button class="btn btn-primary" id="pdfBtn">Descargar informe PDF</button><button class="btn btn-secondary" id="presentBtn">Presentar resultados</button><button class="btn btn-secondary" id="jsonBtn">Exportar datos</button></div></div></div>
  <article class="meeting-evidence"><div><p class="eyebrow">LO QUE COMPROBAMOS EN LA REUNIÓN</p><strong>${verificationLine(r)}</strong></div><p>El Índice Quio utiliza únicamente los aspectos que sí pudieron comprobarse. Lo no comprobado queda pendiente y no reduce la calificación.</p></article>
  <div class="result-charts"><article class="chart-card"><div><p class="eyebrow">VISTA GENERAL</p><h3>Resultado por cada parte revisada</h3></div><canvas id="pillarChart" width="760" height="300" aria-label="Gráfica de resultados por categoría"></canvas></article><article class="chart-card"><div><p class="eyebrow">PRIORIDADES</p><h3>Semáforo de resultados</h3></div><div id="trafficGrid" class="traffic-grid"></div></article></div>
  <div class="pillar-grid">${METHODOLOGY.map(p=>{const status=moduleStatus(r,p),val=r.pillars[p.id],pct=status.pct===null?0:Math.round(status.pct*100);return `<article class="pillar-card ${status.pct===null?'pillar-card--unavailable':''}"><span>${p.short}</span><strong>${status.pct===null?status.label:val}</strong>${status.pct===null?'':`<small>de ${p.weight} puntos</small><div class="mini-bar"><i style="width:${pct}%"></i></div>`}</article>`}).join('')}</div>
  <article class="recommendation"><p class="eyebrow">RECOMENDACIÓN QUIO</p><span class="recommendation-label">${r.recommendation.level}</span><h3>${r.recommendation.name}</h3><p>${r.recommendation.reason}</p></article>
  <article class="panel plan-panel"><div class="panel-head"><div><p class="eyebrow">INCLUIDO EN LA RECOMENDACIÓN</p><h3>Su plan incluye</h3><p class="helper">Estas son las acciones que Quio puede atender en esta etapa.</p></div></div><div class="timeline timeline--simple">${r.plan.length?r.plan.map(x=>`<div class="timeline-item timeline-item--simple"><div class="timeline-check" aria-hidden="true">✓</div><strong>${esc(x.text)}</strong></div>`).join(''):'<p class="helper">No se requiere agregar un servicio en esta etapa.</p>'}</div></article>
  <section class="findings-by-module findings-by-module--clean">${groupedFindingsHTML(r)}</section>
  ${r.future&&r.future.length?`<article class="panel future-panel"><div class="panel-head"><div><p class="eyebrow">SIGUIENTE ETAPA</p><h3>Mejoras que pueden evaluarse más adelante</h3><p class="helper">También encontramos estos puntos. No forman parte del plan recomendado actualmente, pero pueden revisarse después si el cliente lo considera conveniente.</p></div></div><ul class="future-list">${r.future.map(x=>`<li>${esc(x.text)}</li>`).join('')}</ul></article>`:''}
  <div class="bottom-actions no-print"><button class="btn btn-primary" id="pdfBtnBottom">Descargar informe PDF</button><button class="btn btn-secondary" id="newReviewBtn">Iniciar otra revisión</button></div>`;
  $('#pdfBtn').onclick=$('#pdfBtnBottom').onclick=()=>generatePDF(r);$('#jsonBtn').onclick=()=>downloadJSON(r,`${slug(r.business.name)}-revision-quio.json`);$('#presentBtn').onclick=togglePresentation;$('#newReviewBtn').onclick=startNew;
  drawPillarChart(r);renderTraffic(r);
}
function resultHeadline(r){
  const inv=r.inventory||{},answers=r.answers||{},parts=[];
  if(inv.googleProfile!=='no')parts.push('ya puede encontrarse en Google');
  if(answers.phone==='yes'||answers.whatsapp==='yes')parts.push('ofrece una forma clara de contacto');
  const positive=parts.length?`El negocio ${parts.slice(0,2).join(' y ')}`:'El negocio cuenta con una base que ya pudimos revisar';
  if(inv.website==='no')return `${positive}, pero todavía no cuenta con un sitio web propio donde explique sus servicios.`;
  if(inv.appointmentBusiness==='yes'&&inv.booking==='no')return `${positive}, pero todavía no ofrece una forma sencilla de solicitar una cita en línea.`;
  const top=(r.findings?.opportunities||[])[0];
  if(top)return `${positive}, aunque encontramos una oportunidad importante: ${top.title.charAt(0).toLowerCase()+top.title.slice(1)}`;
  return `${positive} y los aspectos comprobados muestran una presencia digital sólida.`;
}
function resultExplanation(r){return `El Índice Quio resume qué tan fácil es encontrar, comprender y contactar actualmente al negocio a partir de los aspectos revisados. Con base en los hallazgos, recomendamos ${r.recommendation.name==='Mejoras puntuales'?'atender mejoras puntuales':r.recommendation.name.startsWith('Esencial +')||r.recommendation.name==='Agenda en línea'?r.recommendation.name:`comenzar con Quio ${r.recommendation.name}`}.`}
function verificationLine(r){const summary=r.verification||verificationSummary(r.answers);return `${summary.checked} aspectos comprobados${summary.unverified?` y ${summary.unverified} pendiente${summary.unverified===1?'':'s'} de comprobar`:''}.`}
function drawPillarChart(r){
  const c=$('#pillarChart');if(!c)return;const ctx=c.getContext('2d'),W=c.width,H=c.height;ctx.clearRect(0,0,W,H);ctx.font='14px system-ui';
  METHODOLOGY.forEach((p,i)=>{const y=38+i*50,status=moduleStatus(r,p),pct=status.pct??0;ctx.fillStyle='#657086';ctx.textAlign='left';ctx.fillText(p.short,10,y+15);ctx.fillStyle='#edf0f4';roundRect(ctx,180,y,500,20,10);ctx.fill();if(status.pct!==null){ctx.fillStyle=pct<.4?'#d65757':pct<.7?'#d99522':'#2d9b68';roundRect(ctx,180,y,500*pct,20,10);ctx.fill()}ctx.fillStyle='#0b1020';ctx.textAlign='right';ctx.font='700 14px system-ui';ctx.fillText(status.label,745,y+15);ctx.font='14px system-ui'});
}
function roundRect(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath()}
function renderTraffic(r){
  $('#trafficGrid').innerHTML=METHODOLOGY.map(p=>{
    const status=moduleStatus(r,p),val=r.pillars[p.id];
    if(status.pct===null)return `<div class="traffic-item"><span class="traffic-light neutral"></span><div><strong>${p.short}</strong><small>${status.label}</small></div></div>`;
    const pct=Math.round(status.pct*100),tone=pct<40?'red':pct<70?'amber':'green',label=pct<40?'Necesita atención':pct<70?'Puede mejorar':'Va bien';
    return `<div class="traffic-item"><span class="traffic-light ${tone}"></span><div><strong>${p.short}</strong><small>${label} · ${pct}%</small></div></div>`;
  }).join('');
}
function togglePresentation(){document.body.classList.toggle('presentation-mode');scrollToWizardTop(true);toast(document.body.classList.contains('presentation-mode')?'Modo presentación activado. Presiona Escape para salir.':'Modo presentación desactivado.')}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('presentation-mode'))document.body.classList.remove('presentation-mode')});

function saveResult(r){r=migrateRecord({...r,schemaVersion:SCHEMA_VERSION});let arr=getRecords();const ix=arr.findIndex(x=>x.id===r.id);if(ix>=0)arr[ix]=r;else arr.unshift(r);localStorage.setItem(STORAGE_KEY,JSON.stringify(arr));localStorage.removeItem(DRAFT_KEY);renderDashboard();renderHistory();window.dispatchEvent(new CustomEvent('quio:reviews-change',{detail:{reviewId:r.id}}))}
function getRecords(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]').map(migrateRecord)}catch{return []}}
function renderDashboard(){const arr=getRecords();$('#heroAvg').textContent=arr.length;renderRecent(arr.slice(0,6))}
function recordActions(r,compact=false){const id=esc(r.id);const name=esc(r.business.name);return `<div class="record-actions ${compact?'compact':''}"><button class="action-btn" data-record-action="open" data-record-id="${id}" title="Ver resultados" aria-label="Ver resultados de ${name}">Ver</button><button class="action-btn" data-record-action="edit" data-record-id="${id}" title="Editar revisión" aria-label="Editar revisión de ${name}">Editar</button><button class="action-btn" data-record-action="pdf" data-record-id="${id}" title="Descargar PDF" aria-label="Descargar PDF de ${name}">PDF</button><button class="action-btn danger" data-record-action="delete" data-record-id="${id}" title="Eliminar revisión" aria-label="Eliminar revisión de ${name}">Eliminar</button></div>`}
function bindRecordActions(root=document){root.querySelectorAll('[data-record-action]').forEach(button=>button.addEventListener('click',()=>({open:openRecord,edit:editRecord,pdf:pdfRecord,delete:deleteRecord})[button.dataset.recordAction]?.(button.dataset.recordId)))}
function renderRecent(arr){$('#recentList').innerHTML=arr.length?arr.map(r=>`<div class="record"><div class="record-title"><strong>${esc(r.business.name)}</strong><span>${esc(displayBusinessType(r.business))} · ${fmtDate(r.date)}</span></div><span class="score-chip level-${r.level}">${r.iqpd}</span>${recordActions(r,true)}</div>`).join(''):'<div class="empty-state"><strong>Aún no hay revisiones.</strong><span>Comienza una nueva revisión durante tu reunión con el cliente.</span><button class="btn btn-primary" data-start-empty>Nueva revisión</button></div>';const b=$('[data-start-empty]');if(b)b.onclick=startNew;bindRecordActions($('#recentList'))}
function drawTrend(arr){const c=$('#trendChart'),empty=$('#emptyTrend');if(!arr.length){c.style.display='none';empty.style.display='block';return}c.style.display='block';empty.style.display='none';const ctx=c.getContext('2d'),data=[...arr].reverse().slice(-10);ctx.clearRect(0,0,c.width,c.height);ctx.strokeStyle='#e4e8ee';for(let y=40;y<=240;y+=50){ctx.beginPath();ctx.moveTo(45,y);ctx.lineTo(735,y);ctx.stroke()}ctx.strokeStyle='#1a8f7e';ctx.lineWidth=3;ctx.beginPath();data.forEach((r,i)=>{const x=55+i*(660/Math.max(1,data.length-1)),y=255-r.iqpd*2.05;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.fillStyle='#0b1020';data.forEach((r,i)=>{const x=55+i*(660/Math.max(1,data.length-1)),y=255-r.iqpd*2.05;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill()})}
function drawDistribution(arr){const c=$('#distributionChart'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);const keys=['critical','basic','functional','strong'],colors=['#d65757','#d99522','#5267e8','#2d9b68'],counts=keys.map(k=>arr.filter(x=>x.level===k).length),total=Math.max(1,arr.length);let start=-Math.PI/2;counts.forEach((v,i)=>{const a=v/total*Math.PI*2;ctx.beginPath();ctx.moveTo(170,120);ctx.arc(170,120,90,start,start+a);ctx.fillStyle=colors[i];ctx.fill();start+=a});ctx.beginPath();ctx.arc(170,120,54,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.fillStyle='#0b1020';ctx.font='700 28px sans-serif';ctx.textAlign='center';ctx.fillText(String(arr.length),170,126);$('#distributionLegend').innerHTML=keys.map((k,i)=>`<div class="legend-row"><span>${['Atención urgente','Base inicial','Va funcionando','Sólido'][i]}</span><strong>${counts[i]}</strong></div>`).join('')}
function renderHistory(){const q=($('#historySearch')?.value||'').toLowerCase(),f=$('#historyFilter')?.value||'all',arr=getRecords().filter(r=>(f==='all'||r.level===f)&&(`${r.business.name} ${r.business.owner||''} ${displayBusinessType(r.business)} ${r.business.city}`.toLowerCase().includes(q)));$('#historyBody').innerHTML=arr.length?arr.map(r=>`<tr><td><strong>${esc(r.business.name)}</strong><small class="table-sub">${esc(r.business.owner||'Sin responsable registrado')}</small></td><td>${esc(displayBusinessType(r.business))}</td><td>${fmtDate(r.date)}</td><td><span class="score-chip level-${r.level}">${r.iqpd??'—'}</span></td><td>${levelLabel(r.level)||'Sin nivel'}</td><td>${esc(r.recommendation?.name||'Pendiente de recalcular')}</td><td>${recordActions(r)}</td></tr>`).join(''):'<tr><td colspan="7"><div class="empty-table">No hay revisiones que coincidan con la búsqueda.</div></td></tr>';bindRecordActions($('#historyBody'))}
function prepareStoredResult(r){state.editingId=r.id;state.data={business:{...r.business},inventory:{...r.inventory},answers:{...r.answers},answerNotes:{...(r.answerNotes||{})}};return r.recommendation&&r.findings&&r.pillars&&Array.isArray(r.plan)?{...r,verification:r.verification||verificationSummary(r.answers)}:calculate()}
window.openRecord=id=>{const r=getRecords().find(x=>x.id===id);if(!r)return;state.result=prepareStoredResult(r);state.step=getSteps().findIndex(s=>s.id==='results');showView('wizard');renderWizard();scrollToWizardTop(false)};
window.editRecord=id=>{const r=getRecords().find(x=>x.id===id);if(!r)return;state.result=r;state.editingId=r.id;state.data={business:{...r.business},inventory:{...r.inventory},answers:{...r.answers},answerNotes:{...(r.answerNotes||{})}};state.step=0;showView('wizard');renderWizard();scrollToWizardTop(false);toast('Revisión abierta para edición.')};
window.pdfRecord=id=>{const r=getRecords().find(x=>x.id===id);if(r)generatePDF(prepareStoredResult(r))};
window.deleteRecord=id=>{const r=getRecords().find(x=>x.id===id);if(!r)return;if(!confirm(`¿Eliminar la revisión de “${r.business.name}”? Esta acción no se puede deshacer.`))return;const arr=getRecords().filter(x=>x.id!==id);localStorage.setItem(STORAGE_KEY,JSON.stringify(arr));if(state.editingId===id){state.editingId=null;state.result=null}renderDashboard();renderHistory();window.dispatchEvent(new CustomEvent('quio:reviews-change',{detail:{deletedId:id}}));toast('Revisión eliminada.')};
function renderMethodology(){$('#methodologyCards').innerHTML=METHODOLOGY.map((p,i)=>`<article class="method-card"><span class="num">0${i+1}</span><h3>${p.name}</h3><p>${p.desc}</p><strong>${p.weight} pts</strong><p>${p.questions.length} puntos de revisión, sólo cuando aplican.</p></article>`).join('');$('#rulesList').innerHTML=['La revisión se realiza junto con el cliente durante la primera reunión.','Primero se registra lo que el negocio ya tiene; después sólo aparecen preguntas que realmente aplican.','Sí suma el total del punto, En parte suma la mitad y No no suma puntos.','Cada sección corresponde a un activo concreto. Si no existe, se registra una oportunidad y sus preguntas se omiten.','Las oportunidades se redactan de forma directa: muestran exactamente qué falta o qué está dificultando la llegada de clientes.','La recomendación depende de las necesidades detectadas, no únicamente de la calificación total.','No se revisan redes sociales, campañas, publicaciones ni administración de comunidades.'].map(x=>`<div class="rule">${x}</div>`).join('')}

async function generatePDF(r){
  const PAGE_W=595, PAGE_H=842, M=52, CONTENT_W=491;
  const cp1252={8364:128,8218:130,402:131,8222:132,8230:133,8224:134,8225:135,710:136,8240:137,352:138,8249:139,338:140,381:142,8216:145,8217:146,8220:147,8221:148,8226:149,8211:150,8212:151,732:152,8482:153,353:154,8250:155,339:156,382:158,376:159};
  const byteFor=ch=>{const c=ch.codePointAt(0);if(c<=255)return c;return cp1252[c]||63};
  const pdfText=value=>{let out='';for(const ch of String(value??'')){const b=byteFor(ch);if(b===40||b===41||b===92)out+='\\'+String.fromCharCode(b);else if(b<32||b>126)out+='\\'+b.toString(8).padStart(3,'0');else out+=String.fromCharCode(b)}return out};
  const approxWidth=(value,size,bold=false)=>String(value??'').length*size*(bold?.54:.50);
  const wrap=(value,maxWidth,size=10,bold=false)=>{const words=String(value??'').trim().split(/\s+/).filter(Boolean),lines=[];let line='';for(const word of words){const test=line?`${line} ${word}`:word;if(approxWidth(test,size,bold)>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);return lines.length?lines:['']};
  const pages=[]; let ops;
  const addPage=()=>{ops=['1 1 1 rg 0 0 595 842 re f'];pages.push(ops);return ops};
  const fill=(rr,gg,bb)=>ops.push(`${rr} ${gg} ${bb} rg`);
  const stroke=(rr,gg,bb)=>ops.push(`${rr} ${gg} ${bb} RG`);
  const rect=(x,y,w,h,rr=1,gg=1,bb=1)=>{fill(rr,gg,bb);ops.push(`${x} ${y} ${w} ${h} re f`)};
  const outline=(x,y,w,h,rr=.84,gg=.87,bb=.91)=>{stroke(rr,gg,bb);ops.push(`1 w ${x} ${y} ${w} ${h} re S`)};
  const line=(x1,y1,x2,y2,rr=.84,gg=.87,bb=.91)=>{stroke(rr,gg,bb);ops.push(`1 w ${x1} ${y1} m ${x2} ${y2} l S`)};
  const circle=(cx,cy,r,rr=.08,gg=.60,bb=.52)=>{const k=.55228475*r;fill(rr,gg,bb);ops.push(`${cx+r} ${cy} m ${cx+r} ${cy+k} ${cx+k} ${cy+r} ${cx} ${cy+r} c ${cx-k} ${cy+r} ${cx-r} ${cy+k} ${cx-r} ${cy} c ${cx-r} ${cy-k} ${cx-k} ${cy-r} ${cx} ${cy-r} c ${cx+k} ${cy-r} ${cx+r} ${cy-k} ${cx+r} ${cy} c f`)};
  const check=(cx,cy)=>{stroke(1,1,1);ops.push(`2 w ${cx-5} ${cy} m ${cx-1} ${cy-4} l ${cx+6} ${cy+5} l S`)};
  const text=(x,y,size,value,bold=false,rr=.04,gg=.07,bb=.13)=>{fill(rr,gg,bb);ops.push(`BT /F${bold?2:1} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`)};
  const paragraph=(x,y,value,maxWidth=CONTENT_W,size=10,lineHeight=14,bold=false,color=[.32,.38,.48])=>{const lines=wrap(value,maxWidth,size,bold);lines.forEach((t,i)=>text(x,y-i*lineHeight,size,t,bold,...color));return {lines,height:lines.length*lineHeight,bottom:y-(lines.length-1)*lineHeight}};
  const footer=n=>{line(M,42,PAGE_W-M,42);text(M,27,8,'Quio · Informe de revisión para negocios locales',false,.34,.39,.48);text(PAGE_W-M-12,27,8,String(n),true,.34,.39,.48)};
  const titleBlock=(title,subtitle='')=>{text(M,790,22,title,true);rect(M,768,54,5,.08,.60,.52);if(subtitle)paragraph(M,746,subtitle,CONTENT_W,10,14,false)};
  const ensurePage=(needed,y,title)=>{if(y-needed<62){footer(pages.length);addPage();titleBlock(title);return 730}return y};
  const whyImportant=id=>({
    profile_missing:'Sin una ficha administrable, el negocio pierde control sobre la información que ven sus clientes.',
    website_missing:'Muchas personas buscan más información antes de decidir. Sin un sitio web pueden quedarse con dudas o buscar otra opción.',
    booking_missing:'Cuando agendar requiere varios mensajes o llamadas, algunas personas abandonan antes de confirmar.',
    search_service:'Si el negocio no aparece al buscar el servicio, puede perder oportunidades frente a opciones más visibles.',
    review_volume:'Las reseñas ayudan a generar confianza. Cuando hay pocas, algunas personas prefieren comparar antes de decidir.',
    review_recency:'Las opiniones recientes muestran que el negocio sigue activo y atendiendo clientes.',
    rating:'La calificación es una de las primeras señales que muchas personas revisan antes de contactar.',
    photos:'Las fotografías ayudan a imaginar la experiencia y a reconocer el lugar antes de visitarlo.',
    mobile:'La mayoría de las búsquedas locales se realizan desde el teléfono; una experiencia difícil puede frenar el contacto.',
    whatsapp:'Si no está claro dónde escribir, el cliente puede posponer el contacto o elegir otra opción.',
    phone:'Un teléfono incorrecto o sin atención puede cerrar por completo una oportunidad de contacto.',
    review_tool_missing:'Pedir una reseña debe ser sencillo; mientras más pasos existan, menos clientes completan el proceso.',
    review_system:'Una rutina sencilla ayuda a recibir opiniones nuevas de manera constante.',
    booking:'Una forma visible de agendar reduce pasos y facilita que el interés se convierta en una solicitud.',
    booking_confirmation:'La confirmación da tranquilidad al cliente y evita dudas sobre si su solicitud fue recibida.',
    differentiator:'Una razón clara para elegir el negocio facilita la decisión cuando el cliente compara opciones.',
    website_clarity:'El sitio debe responder rápidamente qué ofrece el negocio y cómo puede ayudar al cliente.',
  })[id]||'Este punto puede influir en la confianza del cliente o en la facilidad para dar el siguiente paso.';
  const moduleCurrent=(id)=>{
    const m=METHODOLOGY.find(x=>x.id===id),st=moduleStatus(r,m);
    return st.pct===null?st.label:`${Math.round(st.pct*100)}%`;
  };
  const plannedImpact=()=>{
    const rows=QuioDecisionEngine.capabilityCoverage(r.recommendation,{included:r.plan||[]});
    return rows.map(row=>[row.aspect,row.today,row.target]);
  };
  addPage();
  rect(0,774,PAGE_W,68,.03,.06,.12);text(M,800,14,'QUIO',true,.42,.91,.82);
  rect(M,704,54,6,.08,.60,.52);
  text(M,650,34,'Revisión Quio',true);
  paragraph(M,610,r.business.name,330,21,25,true,[.04,.07,.13]);
  paragraph(M,570,`${displayBusinessType(r.business)} · ${r.business.city || 'Ubicación no registrada'}`,330,11,15,false);
  rect(402,594,128,134,.94,.99,.98);outline(402,594,128,134,.08,.60,.52);
  text(433,665,46,String(r.iqpd),true);text(414,633,9,'ÍNDICE QUIO · DE 100',true,.08,.60,.52);
  rect(M,462,CONTENT_W,74,.98,.99,1);outline(M,462,CONTENT_W,74,.88,.91,.94);
  text(M+16,514,8,'FECHA',true,.34,.39,.48);text(M+16,494,10,fmtDate(r.date),true);
  text(M+174,514,8,'CIUDAD',true,.34,.39,.48);paragraph(M+174,494,r.business.city||'No registrada',135,10,13,true,[.04,.07,.13]);
  text(M+340,514,8,'GIRO',true,.34,.39,.48);paragraph(M+340,494,displayBusinessType(r.business),135,10,13,true,[.04,.07,.13]);
  paragraph(M,158,'El Índice Quio resume qué tan fácil es encontrar, comprender y contactar actualmente al negocio a partir de los aspectos revisados.',400,11,16,false);
  footer(1);

  addPage(); titleBlock('Resumen de la revisión');
  let y=724;
  rect(M,y-88,CONTENT_W,88,.94,.99,.98);outline(M,y-88,CONTENT_W,88,.70,.88,.83);
  text(M+16,y-22,9,'EN UNA FRASE',true,.08,.60,.52);
  const summaryLines=wrap(resultHeadline(r),CONTENT_W-32,13,true);summaryLines.forEach((t,i)=>text(M+16,y-48-i*18,13,t,true));
  y-=112;
  const exp=paragraph(M,y,resultExplanation(r),CONTENT_W,10,14,false);y-=exp.height+24;
  text(M,y,9,verificationLine(r),true,.08,.60,.52);y-=24;
  const cardW=(CONTENT_W-18)/4;
  METHODOLOGY.forEach((m,i)=>{
    const status=moduleStatus(r,m),x=M+i*(cardW+6);
    rect(x,y-100,cardW,100,.99,.995,1);outline(x,y-100,cardW,100,.88,.91,.94);
    text(x+12,y-23,9,m.short,true);
    text(x+12,y-62,status.pct===null?13:21,status.label,true);
    if(status.pct!==null){rect(x+12,y-85,cardW-24,6,.92,.94,.96);rect(x+12,y-85,(cardW-24)*status.pct,6,.08,.60,.52)}
  });
  y-=126;
  const reasonLines=wrap(r.recommendation.reason,CONTENT_W-32,9,false);const cardH=62+reasonLines.length*12;
  rect(M,y-cardH,CONTENT_W,cardH,.94,.99,.98);outline(M,y-cardH,CONTENT_W,cardH,.70,.88,.83);text(M+16,y-23,10,'RECOMENDACIÓN QUIO',true,.08,.60,.52);text(M+16,y-48,15,r.recommendation.name,true);reasonLines.forEach((t,i)=>text(M+16,y-68-i*12,9,t,false,.32,.38,.48));footer(2);

  addPage(); titleBlock('Resultados de la revisión');
  y=700;
  const moduleOrder=['google','website','contact','booking'];
  for(const moduleId of moduleOrder){
    const absent=absentModuleInfo(r,moduleId);
    const good=(r.findings.strengths||[]).filter(x=>(typeof x==='string'?findingModule(Object.keys(POSITIVE).find(k=>POSITIVE[k]===x)||''):x.module)===moduleId).map(x=>typeof x==='string'?x:x.text);
    const improve=(r.findings.opportunities||[]).filter(x=>(x.module||findingModule(x.id))===moduleId && actionForFinding(r,x));
    if(!absent&&!good.length&&!improve.length)continue;
    y=ensurePage(absent?210:90,y,moduleTitle(moduleId));
    rect(M,y-38,CONTENT_W,42,.97,.99,.99);outline(M,y-38,CONTENT_W,42,.82,.91,.89);
    text(M+16,y-21,15,moduleTitle(moduleId),true);y-=58;
    if(absent){
      if(!actionForMissingModule(r.recommendation,moduleId))continue;
      const absentId=absent.id||({google:'profile_missing',website:'website_missing',booking:'booking_missing',contact:'review_tool_missing'}[moduleId]);
      y=ensurePage(48,y,moduleTitle(moduleId));rect(M,y-38,CONTENT_W,40,.975,.985,.99);outline(M,y-38,CONTENT_W,40,.86,.90,.93);rect(M,y-38,4,40,.08,.60,.52);text(M+16,y-24,11,findingTitle(absentId),true);y-=50;
      const sections=[['HOY',absent.title,[.60,.38,.06]],['CON QUIO',absent.action,[.08,.60,.52]]];
      for(const [label,body,color] of sections){const lines=wrap(body,CONTENT_W-42,9,label==='CON QUIO');const h=Math.max(42,lines.length*11+23);y=ensurePage(h+5,y,moduleTitle(moduleId));rect(M,y-h+4,CONTENT_W,h,.99,.995,1);outline(M,y-h+4,CONTENT_W,h,.90,.92,.94);rect(M,y-h+4,3,h,...(label==='CON QUIO'?[.08,.60,.52]:[.85,.55,.12]));text(M+14,y-13,7.2,label,true,...color);lines.forEach((t,i)=>text(M+14,y-29-i*11,9,t,label==='CON QUIO',.20,.24,.30));y-=h+3}
    }else{
      if(good.length){text(M,y,10,'Lo que está funcionando',true,.08,.60,.52);y-=20;for(const item of good.slice(0,4)){const lines=wrap(item,CONTENT_W-38,9,false);const h=lines.length*12+14;y=ensurePage(h+8,y,moduleTitle(moduleId));rect(M,y-h+6,CONTENT_W,h,.96,.99,.98);outline(M,y-h+6,CONTENT_W,h,.76,.90,.85);text(M+12,y-13,10,'+',true,.08,.60,.52);lines.forEach((t,i)=>text(M+28,y-13-i*12,9,t));y-=h+8}}
      if(improve.length){for(const item of improve.slice(0,4)){
        y=ensurePage(48,y,moduleTitle(moduleId));rect(M,y-38,CONTENT_W,40,.975,.985,.99);outline(M,y-38,CONTENT_W,40,.86,.90,.93);rect(M,y-38,4,40,.08,.60,.52);text(M+16,y-24,11,findingTitle(item.id),true);y-=50;
        const action=actionForFinding(r,item);
        if(!action)continue;
        const sections=[['HOY',item.title,[.60,.38,.06]],['CON QUIO',action,[.08,.60,.52]]];
        for(const [label,body,color] of sections){
          const lines=wrap(body,CONTENT_W-42,9,label==='CON QUIO');
          const h=Math.max(42,lines.length*11+23);
          y=ensurePage(h+5,y,moduleTitle(moduleId));
          rect(M,y-h+4,CONTENT_W,h,.99,.995,1);outline(M,y-h+4,CONTENT_W,h,.90,.92,.94);rect(M,y-h+4,3,h,...(label==='CON QUIO'?[.08,.60,.52]:[.85,.55,.12]));
          text(M+14,y-13,7.2,label,true,...color);lines.forEach((t,i)=>text(M+14,y-29-i*11,9,t,label==='CON QUIO',.20,.24,.30));y-=h+3;
        }
        y-=2;
      }}
    }
    y-=12;
  }
  footer(pages.length);

  addPage(); titleBlock('Su plan incluye','Acciones que Quio puede atender en esta etapa.');y=700;
  r.plan.forEach(item=>{
    const lines=wrap(item.text,CONTENT_W-82,10,false),h=Math.max(54,lines.length*14+24);
    y=ensurePage(h+12,y,'Su plan incluye');
    rect(M,y-h,CONTENT_W,h,.98,.995,.99);outline(M,y-h,CONTENT_W,h,.82,.90,.88);rect(M,y-h,4,h,.08,.60,.52);
    circle(M+28,y-h/2,12);check(M+28,y-h/2);
    lines.forEach((t,j)=>text(M+54,y-21-j*14,10,t,j===0,.13,.18,.25));
    y-=h+10;
  });
  if(r.future&&r.future.length){
    y-=16;y=ensurePage(100,y,'Mejoras para una siguiente etapa');text(M,y,14,'Mejoras que pueden evaluarse más adelante',true);y-=28;
    const futureIntro=paragraph(M,y,'También encontramos estos puntos. No forman parte del plan recomendado actualmente, pero pueden revisarse después si el cliente lo considera conveniente.',CONTENT_W,9,13,false);y-=futureIntro.height+18;
    for(const item of r.future){const lines=wrap(item.text,CONTENT_W-30,9,false);const h=lines.length*12+16;y=ensurePage(h+8,y,'Mejoras para una siguiente etapa');rect(M,y-h+6,CONTENT_W,h,.98,.99,1);outline(M,y-h+6,CONTENT_W,h,.88,.91,.94);text(M+14,y-14,10,'•',true,.08,.60,.52);lines.forEach((t,i)=>text(M+30,y-14-i*12,9,t));y-=h+8}
  }
  footer(pages.length);

  addPage(); titleBlock('¿Qué sigue?','El siguiente paso se decide junto con el cliente.');y=700;
  text(M,y,17,'Comenzamos cuando usted decida.',true);y-=42;
  const closing=paragraph(M,y,'Ahora ya conoce qué está funcionando, qué conviene mejorar y las acciones que Quio puede atender.',CONTENT_W,11,17,false);y-=closing.height+34;
  const nextItems=['Resolver cualquier duda.','Confirmar el plan recomendado.','Acordar cómo y cuándo comenzar.'];
  nextItems.forEach((item,i)=>{rect(M,y-36,CONTENT_W,44,.98,.99,1);outline(M,y-36,CONTENT_W,44,.88,.91,.94);rect(M+14,y-22,22,22,.03,.06,.12);text(M+21,y-15,9,String(i+1),true,1,1,1);paragraph(M+50,y-11,item,CONTENT_W-66,10,14,false);y-=58});
  y-=18;rect(M,y-82,CONTENT_W,82,.94,.99,.98);outline(M,y-82,CONTENT_W,82,.70,.88,.83);paragraph(M+18,y-28,'La meta es facilitar que más personas encuentren el negocio, confíen en él y den el siguiente paso.',CONTENT_W-36,11,16,true,[.04,.07,.13]);
  text(M,y-128,16,'Quio',true,.03,.06,.12);text(M,y-149,10,'Ver mejor. Decidir mejor.',false,.34,.39,.48);footer(pages.length);

  const objects=[];const add=o=>{objects.push(o);return objects.length};
  const font1=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const font2=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const contentIds=pages.map(pageOps=>{const content=pageOps.join('\n');return add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)});
  const pageIds=[];const pagesId=objects.length+pages.length+1;
  pages.forEach((_,i)=>pageIds.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`)));
  add(`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
  const catalog=add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  let pdf='%PDF-1.4\n',offsets=[0];objects.forEach((o,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${o}\nendobj\n`});const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const blob=new Blob([pdf],{type:'application/pdf'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${slug(r.business.name)}-informe-quio.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Informe PDF generado correctamente.');
}
function exportAll(){downloadJSON(getRecords(),'revisiones-quio.json')}
function downloadJSON(data,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function fmtDate(d){return new Intl.DateTimeFormat('es-MX',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(d))}
function levelLabel(l){return({critical:'Atención urgente',basic:'Base inicial',functional:'Va funcionando',strong:'Sólido'})[l]}
function slug(s){return String(s||'negocio').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function toast(t,type='default'){const el=$('#toast');el.textContent=t;el.classList.toggle('error',type==='error');el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>{el.classList.remove('show','error')},3200)}
init();
