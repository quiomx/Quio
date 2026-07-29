'use strict';
window.QuioDocuments=(()=>{
  const C=window.QuioCore;
  const $=selector=>document.querySelector(selector);
  const $$=selector=>[...document.querySelectorAll(selector)];
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const clone=value=>JSON.parse(JSON.stringify(value));
  const today=()=>new Date().toISOString().slice(0,10);
  const plusDays=days=>new Date(Date.now()+Number(days||0)*86400000).toISOString().slice(0,10);
  const lines=value=>String(value||'').split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
  const actor=()=>C.db().settings.quioResponsible||'Usuario Quio';
  const TYPES={
    serviceOrder:{label:'Orden de servicio',short:'Orden',icon:'▣',key:'serviceOrder'},
    implementation:{label:'Información para implementación',short:'Implementación',icon:'◫',key:'implementation'},
    delivery:{label:'Acta de entrega',short:'Acta',icon:'✓',key:'delivery'},
    change:{label:'Cambio adicional',short:'Cambio',icon:'↻',key:'change'}
  };
  const ACCEPTED={
    serviceOrder:['Aceptada'],
    implementation:['Completo'],
    delivery:['Aceptada','Aceptada con pendientes'],
    change:['Autorizado','Completado']
  };
  const STATUSES={
    serviceOrder:['Borrador','Pendiente de aceptación','Aceptada','Rechazada','Cancelada'],
    implementation:['Incompleto','Completo','Reabierto'],
    delivery:['Borrador','Pendiente de aceptación','Aceptada','Aceptada con pendientes','Rechazada','Cancelada'],
    change:['Borrador','Pendiente de autorización','Autorizado','Rechazado','En proceso','Completado','Cancelado']
  };
  const TYPE_FIELDS={
    google:[
      ['commercialName','Nombre comercial exacto','text',true],['primaryCategory','Categoría principal','text',true],
      ['additionalCategories','Categorías adicionales'],['address','Dirección'],['serviceArea','Zona de servicio'],
      ['phone','Teléfono','tel'],['whatsapp','WhatsApp','tel'],['normalHours','Horarios normales'],['specialHours','Horarios especiales'],
      ['services','Servicios','textarea',true],['mainProducts','Productos principales','textarea'],['description','Descripción del negocio','textarea',true],
      ['startYear','Año de inicio'],['logoReference','Logotipo / referencia de archivo'],['photoReferences','Fotografías / referencias','textarea'],
      ['profileUrl','Enlace actual del perfil','url'],['authorizedPerson','Persona autorizada para conceder acceso','text',true],
      ['accessStatus','Estado del acceso']
    ],
    website:[
      ['commercialName','Nombre comercial','text',true],['headline','Frase principal','text',true],['description','Descripción del negocio','textarea',true],
      ['history','Historia breve','textarea'],['services','Servicios','textarea',true],['differentiators','Diferenciadores','textarea'],
      ['audience','Público principal'],['hours','Horarios'],['address','Dirección'],['phone','Teléfono','tel'],['whatsapp','WhatsApp','tel'],
      ['email','Correo','email'],['links','Redes o enlaces a mostrar','textarea'],['logoReference','Logotipo / referencia de archivo'],
      ['photoReferences','Fotografías / referencias','textarea'],['testimonials','Testimonios','textarea'],['faq','Preguntas frecuentes','textarea'],
      ['primaryAction','Llamado a la acción principal','text',true],['domain','Dominio'],['domainStatus','Situación del dominio'],
      ['privacyNotice','Aviso de privacidad proporcionado por el cliente','textarea'],['observations','Observaciones','textarea']
    ],
    appointments:[
      ['bookableServices','Servicios agendables','textarea',true],['serviceDurations','Duración de cada servicio','textarea',true],
      ['availableHours','Horarios disponibles','textarea',true],['nonWorkingDays','Días no laborables'],['minimumNotice','Anticipación mínima'],
      ['bufferTime','Tiempo entre citas'],['requestedData','Datos solicitados al usuario','textarea'],['receiverEmail','Correo receptor','email',true],
      ['cancellationPolicy','Política de cancelación','textarea'],['confirmationMessage','Mensaje de confirmación','textarea'],
      ['calendlyUrl','Enlace o cuenta de Calendly','url'],['configurationStatus','Estado de configuración']
    ],
    reviews:[
      ['quantity','Cantidad contratada','number',true],['materialType','Tipo de dispositivo o material','text',true],
      ['googleProfile','Perfil de Google vinculado','url',true],['reviewUrl','URL final de reseña','url',true],
      ['installationLocations','Ubicación de cada punto','textarea',true],['receiver','Persona que recibirá los materiales','text',true],
      ['deliveryDate','Fecha prevista de entrega','date'],['installationDate','Fecha prevista de instalación','date'],
      ['inventoryIds','Identificadores de inventario asignados','textarea'],['deliveryStatus','Estado de entrega']
    ]
  };
  const SECTION_LABELS={google:'Perfil de negocio en Google',website:'Sitio web',appointments:'Agenda de citas',reviews:'Puntos para facilitar reseñas'};
  const DELIVERY_CHECKS=[
    'Entregables completados','Enlaces probados','Versión móvil revisada','Información final validada',
    'Material físico entregado','Accesos transferidos','Capacitación realizada','Saldo registrado o pendiente identificado',
    'Pendientes documentados','Periodo de soporte definido'
  ];

  function historyEntry(action,detail=''){
    return{at:C.now(),action,detail,user:actor()};
  }
  function nextFolio(type,consume=true){
    const settings=C.db().settings;
    settings.folioPrefixes=settings.folioPrefixes||{quote:'COT',serviceOrder:'OS',implementation:'IMP',delivery:'AE',change:'CA'};
    settings.folioCounters=settings.folioCounters||{quote:1,serviceOrder:1,implementation:1,delivery:1,change:1};
    const number=Math.max(1,Number(settings.folioCounters[type])||1);
    const folio=`${settings.folioPrefixes[type]||TYPES[type]?.short||type}-${new Date().getFullYear()}-${String(number).padStart(4,'0')}`;
    if(consume)settings.folioCounters[type]=number+1;
    return folio;
  }
  function snapshotFor(refs){
    const quote=C.get('quotes',refs.quotationId);
    const project=C.get('projects',refs.projectId);
    const client=C.get('clients',refs.clientId||quote?.clientId||project?.clientId);
    const business=C.get('businesses',refs.businessId||quote?.businessId||project?.businessId);
    const review=C.get('reviews',refs.reviewId||quote?.reviewId||project?.reviewId);
    return{
      capturedAt:C.now(),
      client:client?{id:client.id,name:client.name,email:client.email||'',phone:client.phone||'',preferredContact:client.preferredContact||''}:null,
      business:business?{id:business.id,name:business.name,industry:business.industry||'',address:business.address||'',city:business.city||'',state:business.state||'',email:business.email||'',phone:business.phone||''}:null,
      review:review?{id:review.id,reviewDate:review.reviewDate,iqpd:review.iqpd,level:review.level}:null,
      quotation:quote?{id:quote.id,folio:quote.folio,items:clone(quote.items||[]),extras:clone(quote.extras||[]),discount:quote.discount||0,depositPct:quote.depositPct||0,paymentMethod:quote.paymentMethod||'',implementationTime:quote.implementationTime||'',totals:C.quoteTotals(quote)}:null,
      project:project?{id:project.id,name:project.name,status:project.status,dueDate:project.dueDate||'',deliverables:clone(project.deliverables||project.checklist||[])}:null,
      quio:{companyName:C.db().settings.companyName||'Quio',responsible:C.db().settings.quioResponsible||'',email:C.db().settings.quioEmail||'',phone:C.db().settings.quioPhone||'',address:C.db().settings.quioAddress||''}
    };
  }
  function referencesFrom(input={}){
    const quote=C.get('quotes',input.quotationId||input.quoteId);
    const project=C.get('projects',input.projectId)||C.list('projects').find(item=>quote&&item.quoteId===quote.id);
    return{
      clientId:input.clientId||quote?.clientId||project?.clientId||'',
      businessId:input.businessId||quote?.businessId||project?.businessId||'',
      reviewId:input.reviewId||quote?.reviewId||project?.reviewId||'',
      quotationId:input.quotationId||input.quoteId||project?.quoteId||'',
      projectId:input.projectId||project?.id||''
    };
  }
  function inferSections(project){
    const quote=C.get('quotes',project?.quoteId);
    const pkg=C.get('packages',project?.packageId);
    const text=[project?.name,...(project?.deliverables||[]).map(item=>item.text||item.description||item),...(quote?.items||[]).map(item=>item.description),...(pkg?.contents||[])].join(' ').toLowerCase();
    const found=[];
    if(/google|maps|perfil/.test(text))found.push('google');
    if(/sitio|web|dominio/.test(text))found.push('website');
    if(/agenda|cita|calendly/.test(text))found.push('appointments');
    if(/reseña|nfc|stand|tarjeta|qr/.test(text))found.push('reviews');
    return found.length?found:['google'];
  }
  function requiredProgress(sections={}){
    const missing=[];
    let total=0,complete=0;
    Object.entries(sections).forEach(([key,values])=>{
      (TYPE_FIELDS[key]||[]).forEach(([name,label,,required])=>{
        if(!required)return;
        total++;
        if(String(values?.[name]??'').trim())complete++;
        else missing.push(`${SECTION_LABELS[key]}: ${label}`);
      });
    });
    return{completionPercentage:total?Math.round(complete/total*100):100,missingFields:missing};
  }
  function defaultPayload(type,refs){
    const quote=C.get('quotes',refs.quotationId);
    const project=C.get('projects',refs.projectId);
    const settings=C.db().settings;
    if(type==='serviceOrder'){
      const totals=quote?C.quoteTotals(quote):{};
      return{
        startDate:project?.startDate||'',estimatedDeliveryDate:project?.dueDate||'',responsible:settings.quioResponsible||'',
        finalScope:quote?.context||'',deliverables:clone(quote?.items||project?.deliverables||[]),
        pendingClientInfo:quote?.clientNeeds||'',includedRevisions:Number(settings.defaultAdjustmentRounds)||1,
        supportDays:Number(settings.defaultSupportDays)||15,price:totals.total||0,depositPct:quote?.depositPct??settings.defaultDepositPct,
        balance:quote?Math.max(0,(totals.total||0)*(1-Number(quote.depositPct??settings.defaultDepositPct)/100)):0,
        paymentMethod:quote?.paymentMethod||settings.defaultPaymentMethod,estimatedTime:quote?.implementationTime||'',
        clientResponsibilities:'Proporcionar información, materiales y accesos autorizados; revisar avances y responder en tiempo razonable.',
        quioResponsibilities:'Realizar el alcance acordado, proteger los accesos recibidos y comunicar avances o bloqueos.',
        materialAuthorization:'El cliente declara contar con autorización para usar los logotipos, fotografías, textos y materiales proporcionados.',
        accessAuthorization:'Los accesos se concederán de forma segura. Quio no solicita ni almacena contraseñas del cliente.',
        observations:''
      };
    }
    if(type==='implementation'){
      const sections={};
      inferSections(project).forEach(key=>sections[key]={});
      const progress=requiredProgress(sections);
      return{sections,...progress,fileReferences:[],completedAt:null,reopenedAt:null,lastAutosaveAt:C.now()};
    }
    if(type==='delivery'){
      return{
        checklist:DELIVERY_CHECKS.map(text=>({text,done:false})),deliveredItems:clone(project?.deliverables||quote?.items||[]),
        finalLinks:'',transferredAccesses:'',physicalItems:'',trainingProvided:false,pendingItems:'',
        pendingDeadline:'',supportDays:Number(settings.defaultSupportDays)||15,supportContact:settings.quioEmail||settings.quioPhone||'',
        receiverName:'',responsible:settings.quioResponsible||'',observations:''
      };
    }
    return{date:today(),requester:'',requestedChange:'',reason:'',affectedDeliverable:'',scopeClassification:'Fuera del alcance',additionalHours:0,additionalCost:0,newEstimatedDate:'',observations:'',authorizationData:null,financeChargeId:''};
  }
  function createDocument(type,input={}){
    if(!TYPES[type])throw new Error('Tipo de documento no válido.');
    const refs=referencesFrom(input);
    const quote=C.get('quotes',refs.quotationId);
    if(type==='serviceOrder'&&quote?.status!=='Aceptada'&&!input.allowException)throw new Error('La cotización debe estar aceptada antes de generar la orden de servicio.');
    const existing=C.list('documents').find(item=>item.documentType===type&&((refs.projectId&&item.projectId===refs.projectId)||(refs.quotationId&&item.quotationId===refs.quotationId))&&!['Cancelada','Cancelado'].includes(item.status));
    if(existing&&!input.allowDuplicate)return existing;
    const status=type==='implementation'?'Incompleto':'Borrador';
    const document={
      documentType:type,folio:nextFolio(type),...refs,status,notes:input.notes||'',version:1,
      issuedAt:null,acceptedAt:null,cancelledAt:null,pdfGeneratedAt:null,snapshot:null,versions:[],
      history:[historyEntry('Documento creado',`Versión 1 · ${TYPES[type].label}`)],
      payload:{...defaultPayload(type,refs),...(input.payload||{})}
    };
    return C.upsert('documents',document,'doc');
  }
  function substantialChange(document,patch){
    if(!ACCEPTED[document.documentType]?.includes(document.status))return false;
    return Object.keys(patch).some(key=>!['notes','updatedAt','history','issuedAt','pdfGeneratedAt','snapshot','status','acceptedAt','acceptanceData','cancelledAt'].includes(key));
  }
  function updateDocument(id,patch={},action='Documento actualizado'){
    const current=C.get('documents',id);
    if(!current)throw new Error('No se encontró el documento.');
    const next=clone(current);
    if(substantialChange(current,patch)){
      next.versions=[...(next.versions||[]),{version:next.version,savedAt:C.now(),status:next.status,snapshot:clone(next.snapshot),payload:clone(next.payload),acceptedAt:next.acceptedAt}];
      next.version=Number(next.version||1)+1;
      next.status=next.documentType==='implementation'?'Reabierto':'Borrador';
      next.acceptedAt=null;
      next.history=[...(next.history||[]),historyEntry('Nueva versión',`Se conservó la versión aceptada ${next.version-1}.`)];
    }
    Object.assign(next,patch);
    next.history=[...(next.history||[]),historyEntry(action,patch.status?`Estado: ${patch.status}`:'')];
    return C.upsert('documents',next,'doc');
  }
  function issueDocument(id){
    const document=C.get('documents',id);
    if(!document)throw new Error('No se encontró el documento.');
    return updateDocument(id,{issuedAt:document.issuedAt||C.now(),pdfGeneratedAt:C.now(),snapshot:document.snapshot||snapshotFor(document)},'PDF generado');
  }
  function setDocumentStatus(id,status,acceptanceData=null){
    const document=C.get('documents',id);
    if(!document||!STATUSES[document.documentType]?.includes(status))throw new Error('La transición solicitada no es válida.');
    const patch={status};
    if(/Aceptada|Autorizado|Completo/.test(status)){
      patch.acceptedAt=acceptanceData?.date?new Date(`${acceptanceData.date}T12:00:00`).toISOString():C.now();
      patch.acceptanceData=acceptanceData||document.acceptanceData||null;
      patch.snapshot=document.snapshot||snapshotFor(document);
      patch.issuedAt=document.issuedAt||C.now();
    }
    if(/Cancelad/.test(status))patch.cancelledAt=C.now();
    const saved=updateDocument(id,patch,'Cambio de estado');
    if(saved.documentType==='implementation'&&status==='Completo'&&saved.projectId){
      C.upsert('projects',{id:saved.projectId,nextStep:'Información completa: iniciar o continuar implementación'});
    }
    if(saved.documentType==='change'&&status==='Autorizado'&&saved.projectId){
      const project=C.get('projects',saved.projectId);
      C.upsert('projects',{id:project.id,changeRequestIds:[...(project.changeRequestIds||[]).filter(value=>value!==saved.id),saved.id]});
    }
    return saved;
  }
  function prepareQuote(data,recordId=''){
    const current=recordId?C.get('quotes',recordId):null;
    const parseItems=value=>lines(value).map(row=>{
      const [description,quantity='1',price='0']=row.split('|').map(part=>part.trim());
      return{description,quantity:Math.max(1,Number(quantity)||1),price:Math.max(0,Number(price)||0),directCost:0};
    }).filter(item=>item.description);
    const items=parseItems(data.deliverablesText);
    const extras=parseItems(data.extrasText);
    const all=[...items,...extras];
    if(recordId)data.id=recordId;else delete data.id;
    data.folio=current?.folio||nextFolio('quote');
    data.items=items.length?items:[{description:data.description||'Servicio Quio',quantity:Number(data.quantity)||1,price:Number(data.price)||0,directCost:0}];
    data.extras=extras;
    data.price=all.length?all.reduce((sum,item)=>sum+item.quantity*item.price,0):Number(data.price)||0;
    ['taxRate','discount','depositPct','estimatedHours','hourlyValue','stands','nfcCards','trips','software','providers','otherCosts'].forEach(key=>data[key]=Number(data[key])||0);
    data.version=Number(current?.version||1);
    data.issuedAt=current?.issuedAt||data.issuedAt||C.now();
    data.history=[...(current?.history||[]),historyEntry(current?'Cotización actualizada':'Cotización creada',data.status)];
    data.financialSnapshot=C.financialSnapshot(data);
    const totals=C.quoteTotals({...data,financialSnapshot:data.financialSnapshot});
    if(totals.total<=0&&data.freeService!=='on')throw new Error('La cotización tiene total $0.00. Captura un precio o confirma expresamente que el servicio será gratuito.');
    data.freeService=data.freeService==='on';
    data.depositAmount=totals.total*data.depositPct/100;
    data.balanceAmount=totals.total-data.depositAmount;
    delete data.deliverablesText;delete data.extrasText;delete data.description;delete data.quantity;
    return data;
  }
  function duplicateQuote(id){
    const source=C.get('quotes',id);
    if(!source)throw new Error('No se encontró la cotización.');
    const copy=clone(source);
    delete copy.id;delete copy.createdAt;delete copy.updatedAt;delete copy.acceptedAt;delete copy.snapshot;
    copy.folio=nextFolio('quote');copy.status='Borrador';copy.version=1;copy.history=[historyEntry('Cotización duplicada',`Origen: ${source.folio}`)];
    return C.upsert('quotes',copy,'quo');
  }
  function setQuoteStatus(id,status){
    const quote=C.get('quotes',id);
    if(!quote)throw new Error('No se encontró la cotización.');
    const patch={id,status,history:[...(quote.history||[]),historyEntry('Cambio de estado',status)]};
    if(status==='Aceptada')patch.acceptedAt=C.now();
    if(['Enviada','Aceptada'].includes(status))patch.snapshot=quote.snapshot||snapshotFor({clientId:quote.clientId,businessId:quote.businessId,reviewId:quote.reviewId,quotationId:quote.id});
    const saved=C.upsert('quotes',patch,'quo');
    if(status==='Aceptada'&&quote.clientId)C.upsert('clients',{id:quote.clientId,status:'Cotización aceptada'});
    C.recordActivity('Estado de cotización','quotes',saved,`${quote.folio}: ${status}`);
    return saved;
  }
  function projectFromQuote(id){
    const q=C.get('quotes',id);
    if(!q)throw new Error('No se encontró la cotización.');
    if(q.status!=='Aceptada')throw new Error('Solo una cotización aceptada puede convertirse en proyecto.');
    const existing=C.list('projects').find(project=>project.quoteId===q.id);
    if(existing)return existing;
    const totals=C.quoteTotals(q);
    const snapshot=q.financialSnapshot||C.financialSnapshot({price:totals.subtotal,discount:totals.discount,taxRate:q.taxRate,estimatedHours:q.estimatedHours,hourlyValue:q.hourlyValue,stands:q.stands,nfcCards:q.nfcCards,trips:q.trips,software:q.software,providers:q.providers,otherCosts:q.otherCosts});
    const deliverables=[...(q.items||[]),...(q.extras||[])].map(item=>({text:item.description,done:false}));
    const project=C.upsert('projects',{
      name:`Proyecto ${C.get('businesses',q.businessId)?.name||q.folio}`,clientId:q.clientId,businessId:q.businessId,reviewId:q.reviewId||'',
      quoteId:q.id,packageId:q.packageId,financialSnapshot:clone(snapshot),agreedNetPrice:snapshot.netPrice,status:'Por iniciar',progress:0,
      deliverables,checklist:deliverables.length?clone(deliverables):(C.db().settings.activityTemplates||[]).map(text=>({text,done:false})),
      nextStep:'Generar y aceptar orden de servicio'
    },'prj');
    C.list('documents').filter(document=>document.quotationId===q.id&&!document.projectId).forEach(document=>C.upsert('documents',{id:document.id,projectId:project.id}));
    if(q.clientId)C.upsert('clients',{id:q.clientId,status:'Proyecto en curso'});
    return project;
  }
  function closeProject(projectId){
    const project=C.get('projects',projectId);
    if(!project)throw new Error('No se encontró el proyecto.');
    const act=C.list('documents').find(doc=>doc.projectId===projectId&&doc.documentType==='delivery'&&ACCEPTED.delivery.includes(doc.status));
    const unfinished=(project.checklist||[]).filter(item=>!item.done);
    const pendingPayments=C.financialList({projectId,movementType:'Ingreso'}).filter(payment=>!['Pagado','Cancelado'].includes(C.normalizeMovementStatus(payment.status)));
    if(!act)throw new Error('Primero registra la aceptación del acta de entrega.');
    if(unfinished.length)throw new Error(`Faltan ${unfinished.length} entregable(s) por completar.`);
    if(pendingPayments.length)throw new Error(`Hay ${pendingPayments.length} pago(s) pendiente(s). Registra o cancela el saldo antes de cerrar.`);
    return C.upsert('projects',{id:projectId,status:'Cerrado',progress:100,nextStep:'Proyecto cerrado',closedAt:C.now()});
  }
  function chargeChange(id){
    const document=C.get('documents',id);
    if(!document||document.documentType!=='change'||document.status!=='Autorizado')throw new Error('El cambio debe estar autorizado.');
    if(document.payload.financeChargeId)return C.get('financialMovements',document.payload.financeChargeId);
    const amount=Number(document.payload.additionalCost)||0;
    if(!amount)throw new Error('El cambio no tiene costo adicional.');
    const payment=C.upsertFinancialMovement({movementType:'Ingreso',clientId:document.clientId,projectId:document.projectId,concept:`Cambio adicional ${document.folio}`,category:'Venta de servicio',amount,status:'Pendiente',dueDate:document.payload.newEstimatedDate||today(),date:today(),notes:document.payload.requestedChange,idempotencyKey:`change:${document.id}`});
    updateDocument(id,{payload:{...document.payload,financeChargeId:payment.id}},'Cargo confirmado en Finanzas');
    return payment;
  }

  const field=(name,label,value='',type='text',required=false,full=false,attrs='')=>`<div class="field ${full?'full':''}"><label for="f_${name}">${esc(label)}${required?' *':''}</label><input id="f_${name}" name="${esc(name)}" type="${type}" value="${esc(value)}" ${required?'required':''} ${attrs}></div>`;
  const textarea=(name,label,value='',required=false,rows=3)=>`<div class="field full"><label for="f_${name}">${esc(label)}${required?' *':''}</label><textarea id="f_${name}" name="${esc(name)}" rows="${rows}" ${required?'required':''}>${esc(value)}</textarea></div>`;
  const select=(name,label,values,value='',required=false)=>`<div class="field"><label for="f_${name}">${esc(label)}${required?' *':''}</label><select id="f_${name}" name="${esc(name)}" ${required?'required':''}>${values.map(option=>{const normalized=typeof option==='object'?option:{value:option,label:option};return`<option value="${esc(normalized.value)}" ${String(normalized.value)===String(value)?'selected':''}>${esc(normalized.label)}</option>`}).join('')}</select></div>`;
  const entityOptions=(entity,label='name')=>[{value:'',label:'Sin asociar'},...C.list(entity).map(item=>({value:item.id,label:item[label]||item.businessName||item.folio||item.id}))];
  const badge=(status)=>{
    const tone=/Aceptad|Autorizado|Completo/.test(status)?'green':/Rechaz|Cancelad|Vencid/.test(status)?'red':/Pendiente|Incompleto|Reabierto/.test(status)?'amber':'';
    const icon=tone==='green'?'✓':tone==='red'?'×':tone==='amber'?'!':'•';
    return`<span class="badge ${tone}"><span aria-hidden="true">${icon}</span> ${esc(status||'Sin estado')}</span>`;
  };
  const empty=(title='Aún no hay documentos.',text='Los documentos se generan desde una cotización o un proyecto.')=>`<div class="empty"><strong>${esc(title)}</strong><span>${esc(text)}</span></div>`;
  function quoteForm(record={}){
    const settings=C.db().settings;
    const pkg=C.get('packages',record.packageId);
    const baseItems=record.items?.length?record.items:(pkg?.contents||[]).map(description=>({description,quantity:1,price:0}));
    const itemText=baseItems.map(item=>`${item.description} | ${item.quantity||1} | ${Number(item.price)||0}`).join('\n');
    const extraText=(record.extras||[]).map(item=>`${item.description} | ${item.quantity||1} | ${Number(item.price)||0}`).join('\n');
    const defaultValidity=record.validUntil||plusDays(settings.quoteValidityDays);
    return`<div class="form-section full"><h3>Relaciones</h3><p class="helper">Selecciona registros existentes; Quio reutilizará sus datos.</p></div>
      ${field('folio','Folio',record.folio||nextFolio('quote',false),'text',true)}
      ${select('status','Estado',['Borrador','Enviada','Aceptada','Rechazada','Vencida','Cancelada'],record.status||'Borrador',true)}
      ${select('packageId','Paquete de origen',[{value:'',label:'Cotización personalizada'},...entityOptions('packages').slice(1)],record.packageId||'')}
      ${select('reviewId','Revisión Quio',entityOptions('reviews','folio').map(option=>option.value?{value:option.value,label:`Revisión · ${C.get('reviews',option.value)?.iqpd??'—'}/100`}:option),record.reviewId||'')}
      ${select('clientId','Cliente',entityOptions('clients'),record.clientId||'',true)}
      ${select('businessId','Negocio',entityOptions('businesses'),record.businessId||'',true)}
      <div class="form-section full"><h3>Propuesta comercial</h3><p class="helper">Un concepto por línea: descripción | cantidad | precio.</p></div>
      ${textarea('deliverablesText','Entregables',itemText,true,6)}
      ${textarea('extrasText','Conceptos extraordinarios',extraText,false,3)}
      ${field('price','Precio calculado',record.financialSnapshot?.price??record.price??baseItems.reduce((sum,item)=>sum+Number(item.quantity||1)*Number(item.price||0),0),'number',true,false,'min="0" step="0.01"')}
      <label class="check-option full"><input type="checkbox" name="freeService" ${record.freeService?'checked':''}> Confirmo expresamente que este servicio será gratuito</label>
      ${field('discount','Descuento',record.financialSnapshot?.discount??record.discount??0,'number',false,false,'min="0" step="0.01"')}
      ${field('taxRate','Impuesto (%)',record.financialSnapshot?.taxRate??record.taxRate??settings.taxRate,'number',false,false,'min="0" step="0.01"')}
      ${field('depositPct','Anticipo (%)',record.depositPct??settings.defaultDepositPct,'number',true,false,'min="0" max="100"')}
      ${select('paymentMethod','Forma de pago',['Transferencia','Efectivo','Tarjeta','Otro'],record.paymentMethod||settings.defaultPaymentMethod,true)}
      ${field('validUntil','Vigencia',defaultValidity,'date',true)}
      ${field('implementationTime','Tiempo estimado de implementación',record.implementationTime||'','text',true)}
      ${textarea('context','Contexto de la necesidad detectada',record.context||'')}
      ${textarea('clientNeeds','Qué necesita proporcionar el cliente',record.clientNeeds||'')}
      ${textarea('conditions','Condiciones',record.conditions||settings.baseTerms)}
      ${textarea('exclusions','Servicios no incluidos',record.exclusions||'Todo servicio no descrito expresamente en los entregables.')}
      ${textarea('notes','Observaciones',record.notes||'')}
      <details class="full form-section"><summary>Costeo interno</summary><div class="form-grid compact-fields">
        ${field('estimatedHours','Horas estimadas',record.financialSnapshot?.estimatedHours??record.estimatedHours??pkg?.estimatedHours??0,'number')}
        ${field('hourlyValue','Valor por hora',record.financialSnapshot?.hourlyValue??record.hourlyValue??settings.hourlyTarget,'number')}
        ${field('stands','Unidades NFC',record.financialSnapshot?.stands??record.stands??pkg?.stands??0,'number')}
        ${field('nfcCards','NFC adicional',record.financialSnapshot?.nfcCards??record.nfcCards??pkg?.nfcCards??0,'number')}
        ${field('trips','Traslados',record.financialSnapshot?.trips??record.trips??pkg?.trips??0,'number')}
        ${field('software','Software',record.financialSnapshot?.software??record.software??pkg?.software??0,'number')}
        ${field('providers','Proveedores',record.financialSnapshot?.providers??record.providers??pkg?.providers??0,'number')}
        ${field('otherCosts','Otros costos',record.financialSnapshot?.otherCosts??record.otherCosts??pkg?.otherCosts??0,'number')}
      </div></details><div id="quoteCostPreview" class="full quote-cost-preview"></div>`;
  }
  function renderQuotes(app){
    const quotes=C.list('quotes');
    app.innerHTML=`<section class="page"><div class="page-head"><div><h2>Cotizaciones</h2><p>Propuestas claras, versionadas y conectadas con el trabajo real.</p></div><div class="toolbar no-print"><button class="btn primary" data-new="quote">+ Cotización</button></div></div>
      <article class="panel">${quotes.length?quotes.map(quote=>{
        const totals=C.quoteTotals(quote);
        const hasProject=C.list('projects').some(project=>project.quoteId===quote.id);
        const hasOrder=C.list('documents').some(doc=>doc.quotationId===quote.id&&doc.documentType==='serviceOrder');
        return`<div class="document-row"><div class="document-icon">◇</div><div><strong>${esc(quote.folio)}</strong><small>${esc(C.get('businesses',quote.businessId)?.name||'Sin negocio')} · vence ${C.date(quote.validUntil)}</small></div><div><strong>${C.money(totals.total)}</strong><small>Anticipo ${Number(quote.depositPct||0)}%</small></div><div>${badge(quote.status)}</div><div class="row-actions">
          <button class="btn small" data-quote="${quote.id}">Vista previa</button>
          <button class="btn small" data-edit="quotes:${quote.id}">Editar</button>
          <button class="btn small" data-quote-duplicate="${quote.id}">Duplicar</button>
          ${quote.status==='Borrador'?`<button class="btn small" data-quote-status="${quote.id}:Enviada">Enviar</button>`:''}
          ${quote.status==='Enviada'?`<button class="btn small primary" data-quote-status="${quote.id}:Aceptada">Aceptar</button>`:''}
          ${quote.status==='Enviada'?`<button class="btn small" data-quote-status="${quote.id}:Rechazada">Rechazar</button>`:''}
          ${quote.status==='Aceptada'&&!hasProject?`<button class="btn small primary" data-project-from="${quote.id}">Crear proyecto</button>`:''}
          ${quote.status==='Aceptada'&&!hasOrder?`<button class="btn small" data-order-from-quote="${quote.id}">Orden de servicio</button>`:''}
          <button class="btn small danger btn-danger" data-delete-quote="${quote.id}">Eliminar</button>
        </div></div>`;
      }).join(''):empty('Aún no hay cotizaciones.','Crea la primera a partir de un cliente, revisión o paquete.')}</article></section>`;
  }
  function documentFilter(document,filter){
    if(filter==='all')return true;
    if(filter==='pending')return /Pendiente|Incompleto|Reabierto/.test(document.status);
    if(filter==='complete')return ACCEPTED[document.documentType]?.includes(document.status);
    return document.documentType===filter;
  }
  function renderDocuments(app,filter='all'){
    const filters=[
      ['all','Todos'],['serviceOrder','Órdenes'],['implementation','Implementación'],['delivery','Actas'],
      ['change','Cambios'],['pending','Pendientes'],['complete','Completados']
    ];
    const documents=C.list('documents').filter(document=>documentFilter(document,filter));
    app.innerHTML=`<section class="page"><div class="page-head"><div><h2>Documentos</h2><p>El expediente comercial y operativo de cada cliente, en un solo lugar.</p></div><div class="toolbar no-print"><button class="btn" data-document-generator="serviceOrder">+ Orden</button><button class="btn primary" data-document-generator="change">+ Cambio</button></div></div>
      <div class="metrics document-metrics">${Object.entries(TYPES).map(([key,type])=>`<article class="metric"><span>${type.label}</span><strong>${C.list('documents').filter(item=>item.documentType===key).length}</strong></article>`).join('')}</div>
      <div class="tabs document-tabs">${filters.map(([key,label])=>`<button class="${key===filter?'active':''}" data-document-filter="${key}">${label}</button>`).join('')}</div>
      <article class="panel">${documents.length?documents.map(document=>documentRow(document)).join(''):empty()}</article></section>`;
    app.dataset.documentFilter=filter;
  }
  function documentRow(document){
    const type=TYPES[document.documentType]||TYPES.serviceOrder;
    const project=C.get('projects',document.projectId);
    const business=C.get('businesses',document.businessId);
    const progress=document.documentType==='implementation'?` · ${Number(document.payload?.completionPercentage)||0}%`:'';
    const pendingStatus=document.documentType==='change'?'Pendiente de autorización':document.documentType==='implementation'?'Incompleto':'Pendiente de aceptación';
    return`<div class="document-row"><div class="document-icon">${type.icon}</div><div><strong>${esc(document.folio)}</strong><small>${esc(type.label)} · ${esc(business?.name||'Sin negocio')}</small></div><div><strong>${esc(project?.name||'Sin proyecto')}</strong><small>Versión ${Number(document.version)||1}${progress}</small></div><div>${badge(document.status)}</div><div><small>${C.date(document.updatedAt)}</small></div><div class="row-actions"><button class="btn small" data-doc-view="${document.id}">Ver</button><button class="btn small" data-doc-edit="${document.id}">${document.documentType==='implementation'&&document.status==='Completo'?'Reabrir':'Editar'}</button><button class="btn small" data-doc-print="${document.id}">PDF</button><button class="btn small" data-doc-history="${document.id}">Historial</button>${document.status==='Borrador'?`<button class="btn small" data-doc-status="${document.id}:${pendingStatus}">Enviar</button>`:''}${!ACCEPTED[document.documentType]?.includes(document.status)&&!/Cancelad/.test(document.status)?`<button class="btn small primary" data-doc-accept="${document.id}">${document.documentType==='implementation'?'Completar':document.documentType==='change'?'Autorizar':'Aceptar'}</button>`:''}${document.documentType!=='implementation'&&!/Cancelad|Completo/.test(document.status)?`<button class="btn small" data-doc-status="${document.id}:${document.documentType==='change'?'Cancelado':'Cancelada'}">Cancelar</button>`:''}</div></div>`;
  }
  function renderExpedient(referenceType,id){
    const records=C.list('documents').filter(document=>document[`${referenceType}Id`]===id);
    const quotes=referenceType==='client'?C.list('quotes').filter(quote=>quote.clientId===id):referenceType==='business'?C.list('quotes').filter(quote=>quote.businessId===id):C.list('quotes').filter(quote=>quote.id===C.get('projects',id)?.quoteId);
    const reference=C.get(referenceType==='project'?'projects':referenceType==='business'?'businesses':'clients',id);
    $('#recordForm').dataset.kind='read-only';
    $('#dialogTitle').textContent=`Expediente · ${reference?.name||'Registro'}`;
    $('#dialogBody').innerHTML=`<div class="expedient-summary"><div>${badge(quotes.length?quotes[0].status:'Sin cotización')}<small>Cotización</small></div>${Object.entries(TYPES).map(([key,type])=>{const doc=records.find(item=>item.documentType===key);return`<div>${badge(doc?.status||'No disponible')}<small>${esc(type.short)}</small></div>`}).join('')}</div><article class="panel inset">${quotes.map(quote=>`<div class="document-row"><div class="document-icon">◇</div><div><strong>${esc(quote.folio)}</strong><small>Cotización</small></div><div>${badge(quote.status)}</div><button class="btn small" data-quote="${quote.id}">Ver</button></div>`).join('')}${records.length?records.map(document=>documentRow(document)).join(''):empty('Sin documentos operativos.','Se crearán desde la cotización y el proyecto.')}</article>`;
    $('#recordDialog').showModal();
  }
  function enhance(route,app){
    if(route==='clients'){
      $$('[data-edit^="clients:"]').forEach(button=>button.parentElement?.insertAdjacentHTML('beforeend',`<button class="btn small" data-expedient="client:${button.dataset.edit.split(':')[1]}">Expediente</button>`));
      $$('[data-edit^="businesses:"]').forEach(button=>button.parentElement?.insertAdjacentHTML('beforeend',`<button class="btn small" data-expedient="business:${button.dataset.edit.split(':')[1]}">Expediente</button>`));
    }
    if(route==='projects'){
      $$('.project-card').forEach(card=>{
        const id=card.querySelector('[data-project]')?.dataset.project;if(!id)return;
        const menu=card.querySelector('.project-more__menu');
        if(menu)menu.innerHTML=`<button class="btn small btn-sm" data-project-doc="${id}:implementation">Implementación</button><button class="btn small btn-sm" data-project-doc="${id}:change">Registrar cambio</button><button class="btn small btn-sm" data-project-doc="${id}:delivery">Generar acta</button>`;
      });
    }
    if(route==='settings'){
      const settings=C.db().settings;
      const panel=document.createElement('form');
      panel.className='panel document-settings';
      panel.id='documentSettingsForm';
      panel.innerHTML=`<div class="panel-head"><div><h3>Documentos comerciales</h3><p>Folios, condiciones y datos visibles en propuestas y actas.</p></div></div><div class="form-grid">
        ${field('quoteValidityDays','Vigencia predeterminada (días)',settings.quoteValidityDays,'number')}
        ${field('defaultDepositPct','Anticipo predeterminado (%)',settings.defaultDepositPct,'number')}
        ${field('defaultAdjustmentRounds','Rondas de ajustes',settings.defaultAdjustmentRounds,'number')}
        ${field('defaultSupportDays','Soporte predeterminado (días)',settings.defaultSupportDays,'number')}
        ${select('defaultPaymentMethod','Forma de pago',['Transferencia','Efectivo','Tarjeta','Otro'],settings.defaultPaymentMethod)}
        ${field('quioResponsible','Responsable Quio',settings.quioResponsible)}
        ${field('quioEmail','Correo Quio',settings.quioEmail,'email')}
        ${field('quioPhone','Teléfono Quio',settings.quioPhone,'tel')}
        ${field('prefixQuote','Prefijo cotización',settings.folioPrefixes?.quote||'COT')}
        ${field('nextQuote','Siguiente cotización',settings.folioCounters?.quote||1,'number')}
        ${field('prefixServiceOrder','Prefijo orden',settings.folioPrefixes?.serviceOrder||'OS')}
        ${field('nextServiceOrder','Siguiente orden',settings.folioCounters?.serviceOrder||1,'number')}
        ${field('prefixImplementation','Prefijo implementación',settings.folioPrefixes?.implementation||'IMP')}
        ${field('nextImplementation','Siguiente implementación',settings.folioCounters?.implementation||1,'number')}
        ${field('prefixDelivery','Prefijo acta',settings.folioPrefixes?.delivery||'AE')}
        ${field('nextDelivery','Siguiente acta',settings.folioCounters?.delivery||1,'number')}
        ${field('prefixChange','Prefijo cambio',settings.folioPrefixes?.change||'CA')}
        ${field('nextChange','Siguiente cambio',settings.folioCounters?.change||1,'number')}
        ${textarea('baseTerms','Condiciones base',settings.baseTerms)}
        <label class="check-option full"><input type="checkbox" name="showTaxes" ${settings.showTaxes!==false?'checked':''}> Mostrar impuestos en documentos</label>
        <label class="check-option full"><input type="checkbox" name="showDiscounts" ${settings.showDiscounts!==false?'checked':''}> Mostrar descuentos cuando existan</label>
      </div><div class="dialog-actions"><button class="btn primary" type="submit">Guardar documentos</button></div>`;
      app.querySelector('.dashboard-grid')?.append(panel);
    }
    if(route==='dashboard')enhanceDashboard();
  }
  function alerts(){
    const result=[];
    const soon=plusDays(5);
    C.list('quotes').filter(quote=>quote.status==='Enviada'&&quote.validUntil&&quote.validUntil<=soon).forEach(quote=>result.push({title:'Cotización por vencer',detail:quote.folio,route:'quotes',tone:'amber',icon:'◇'}));
    C.list('quotes').filter(quote=>quote.status==='Aceptada'&&!C.list('projects').some(project=>project.quoteId===quote.id)).forEach(quote=>result.push({title:'Cotización aceptada sin proyecto',detail:quote.folio,route:'quotes',tone:'red',icon:'!'}));
    C.list('documents').forEach(document=>{
      if(document.documentType==='serviceOrder'&&document.status==='Pendiente de aceptación')result.push({title:'Orden pendiente de aceptación',detail:document.folio,route:'documents',tone:'amber',icon:'▣'});
      if(document.documentType==='serviceOrder'&&document.status==='Aceptada'&&document.projectId&&!C.financialList({projectId:document.projectId,movementType:'Ingreso'}).some(payment=>/anticipo/i.test(payment.concept||payment.category||'')&&C.normalizeMovementStatus(payment.status)==='Pagado'))result.push({title:'Orden aceptada sin anticipo cobrado',detail:document.folio,route:'finance',tone:'amber',icon:'$'});
      if(document.documentType==='implementation'&&document.status!=='Completo')result.push({title:'Información de implementación incompleta',detail:`${document.folio} · ${document.payload?.completionPercentage||0}%`,route:'documents',tone:'amber',icon:'◫'});
      if(document.documentType==='delivery'&&document.status==='Pendiente de aceptación')result.push({title:'Acta pendiente de aceptación',detail:document.folio,route:'documents',tone:'amber',icon:'✓'});
      if(document.documentType==='change'&&document.status==='Pendiente de autorización')result.push({title:'Cambio pendiente de autorización',detail:document.folio,route:'documents',tone:'red',icon:'↻'});
    });
    C.list('projects').filter(project=>(project.checklist||[]).length&&(project.checklist||[]).every(item=>item.done)&&!C.list('documents').some(document=>document.projectId===project.id&&document.documentType==='delivery')).forEach(project=>result.push({title:'Proyecto listo para acta',detail:project.name,route:'projects',tone:'amber',icon:'✓'}));
    return result;
  }
  function enhanceDashboard(){
    const panel=$('.attention-panel');
    const list=panel?.querySelector('.alert-list');
    const extra=alerts();
    if(!panel||!extra.length)return;
    if(list)list.insertAdjacentHTML('beforeend',extra.slice(0,Math.max(0,8-list.children.length)).map(item=>`<a class="alert-row ${item.tone}" href="#${item.route}"><span class="alert-icon" aria-hidden="true">${item.icon}</span><div><strong>${esc(item.title)}</strong><small>${esc(item.detail)}</small></div><span class="alert-arrow">→</span></a>`).join(''));
    else panel.querySelector('.empty')?.replaceWith(Object.assign(document.createElement('div'),{className:'alert-list',innerHTML:extra.slice(0,8).map(item=>`<a class="alert-row ${item.tone}" href="#${item.route}"><span class="alert-icon">${item.icon}</span><div><strong>${esc(item.title)}</strong><small>${esc(item.detail)}</small></div><span class="alert-arrow">→</span></a>`).join('')}));
    const count=panel.querySelector('.attention-count');if(count)count.textContent=String((list?.children.length||0)+extra.length);
  }
  function implementationFields(document){
    return Object.entries(document.payload.sections||{}).map(([key,values])=>`<details class="implementation-section full" open><summary><span>${esc(SECTION_LABELS[key])}</span><strong>${requiredProgress({[key]:values}).completionPercentage}%</strong></summary><div class="form-grid">${(TYPE_FIELDS[key]||[]).map(([name,label,type='text',required])=>{
      const full=type==='textarea';
      return type==='textarea'?textarea(`section__${key}__${name}`,label,values[name]||'',required):field(`section__${key}__${name}`,label,values[name]||'',type,required,full);
    }).join('')}</div></details>`).join('');
  }
  function openDocumentForm(documentOrType,input={}){
    const document=typeof documentOrType==='string'?createDocument(documentOrType,input):documentOrType;
    const type=document.documentType,payload=document.payload||{};
    $('#recordForm').dataset.kind=`document-${type}`;
    $('#recordForm').dataset.entity='documents';
    $('#recordForm').dataset.id=document.id;
    $('#dialogTitle').textContent=`${TYPES[type].label} · ${document.folio}`;
    $('#dialogEyebrow').textContent=`VERSIÓN ${document.version||1}`;
    let html=`<div class="document-context full"><strong>${esc(C.get('businesses',document.businessId)?.name||'Negocio sin asociar')}</strong><span>${esc(C.get('projects',document.projectId)?.name||C.get('quotes',document.quotationId)?.folio||'Sin proyecto')}</span>${badge(document.status)}</div>`;
    if(type==='serviceOrder'){
      html+=`${field('startDate','Fecha de inicio',payload.startDate,'date',true)}${field('estimatedDeliveryDate','Entrega estimada',payload.estimatedDeliveryDate,'date',true)}
        ${field('responsible','Responsable Quio',payload.responsible,'text',true)}${field('includedRevisions','Rondas de ajustes',payload.includedRevisions,'number',true)}
        ${field('supportDays','Periodo de soporte (días)',payload.supportDays,'number',true)}${field('estimatedTime','Tiempo estimado',payload.estimatedTime)}
        ${textarea('finalScope','Objeto y alcance',payload.finalScope,true)}${textarea('deliverablesText','Entregables definitivos',(payload.deliverables||[]).map(item=>item.description||item.text||item).join('\n'),true,5)}
        ${textarea('pendingClientInfo','Información pendiente del cliente',payload.pendingClientInfo)}${textarea('clientResponsibilities','Responsabilidades del cliente',payload.clientResponsibilities)}
        ${textarea('quioResponsibilities','Responsabilidades de Quio',payload.quioResponsibilities)}${textarea('materialAuthorization','Autorización de materiales',payload.materialAuthorization)}
        ${textarea('accessAuthorization','Accesos y seguridad',payload.accessAuthorization)}${textarea('observations','Observaciones particulares',payload.observations)}`;
    }
    if(type==='implementation'){
      const progress=requiredProgress(payload.sections);
      html+=`<div class="implementation-progress full"><div><strong id="implementationPercent">${progress.completionPercentage}%</strong><span>Información completada</span></div><div class="progress"><i id="implementationBar" style="width:${progress.completionPercentage}%"></i></div><p id="implementationMissing">${progress.missingFields.length?`${progress.missingFields.length} campo(s) obligatorio(s) pendiente(s).`:'Todo lo obligatorio está completo.'}</p><small>Guardado automático activo · nunca solicitamos contraseñas.</small></div>${implementationFields(document)}${textarea('fileReferences','Referencias a archivos, una por línea',(payload.fileReferences||[]).join('\n'))}`;
    }
    if(type==='delivery'){
      html+=`<div class="form-section full"><h3>Checklist previo</h3><p class="helper">Confirma cada punto aplicable antes de solicitar aceptación.</p></div>
        <div class="checklist-grid full">${(payload.checklist||DELIVERY_CHECKS.map(text=>({text,done:false}))).map((item,index)=>`<label class="check-option"><input type="checkbox" name="check__${index}" ${item.done?'checked':''}> ${esc(item.text)}</label>`).join('')}</div>
        ${textarea('deliveredItemsText','Entregables terminados',(payload.deliveredItems||[]).map(item=>item.description||item.text||item).join('\n'),true)}
        ${textarea('finalLinks','Enlaces finales',payload.finalLinks)}${textarea('transferredAccesses','Accesos transferidos (sin contraseñas)',payload.transferredAccesses)}
        ${textarea('physicalItems','Materiales de inventario entregados',payload.physicalItems)}${select('trainingProvided','Capacitación realizada',[{value:'false',label:'No'},{value:'true',label:'Sí'}],String(Boolean(payload.trainingProvided)))}
        ${textarea('pendingItems','Pendientes aceptados',payload.pendingItems)}${field('pendingDeadline','Fecha límite de pendientes',payload.pendingDeadline,'date')}
        ${field('supportDays','Periodo de soporte (días)',payload.supportDays,'number')}${field('supportContact','Medio de contacto durante soporte',payload.supportContact)}
        ${field('receiverName','Nombre de quien recibe',payload.receiverName)}${field('responsible','Responsable Quio',payload.responsible)}
        ${textarea('observations','Observaciones',payload.observations)}`;
    }
    if(type==='change'){
      html+=`${field('date','Fecha',payload.date||today(),'date',true)}${field('requester','Solicitante',payload.requester,'text',true)}
        ${textarea('requestedChange','Descripción del cambio',payload.requestedChange,true)}${textarea('reason','Motivo',payload.reason,true)}
        ${field('affectedDeliverable','Entregable afectado',payload.affectedDeliverable,'text',true)}
        ${select('scopeClassification','Clasificación',['Dentro del alcance','Fuera del alcance'],payload.scopeClassification||'Fuera del alcance',true)}
        ${field('additionalHours','Horas adicionales estimadas',payload.additionalHours,'number')}${field('additionalCost','Costo adicional',payload.additionalCost,'number')}
        ${field('newEstimatedDate','Nueva fecha estimada',payload.newEstimatedDate,'date')}${textarea('observations','Observaciones',payload.observations)}`;
    }
    $('#dialogBody').innerHTML=`<div class="form-grid">${html}</div>`;
    $('#dialogSave').textContent=type==='implementation'?'Guardar información':'Guardar documento';
    $('#recordDialog').showModal();
    if(type==='implementation')bindImplementationAutosave(document.id);
    return document;
  }
  function collectPayload(type,data,form,document){
    const payload={...(document.payload||{})};
    if(type==='implementation'){
      const sections=clone(payload.sections||{});
      Object.entries(data).forEach(([key,value])=>{if(!key.startsWith('section__'))return;const[,section,name]=key.split('__');sections[section]=sections[section]||{};sections[section][name]=value});
      const progress=requiredProgress(sections);
      return{...payload,sections,...progress,fileReferences:lines(data.fileReferences),lastAutosaveAt:C.now()};
    }
    if(type==='serviceOrder'){
      return{...payload,...data,deliverables:lines(data.deliverablesText).map(description=>({description})),includedRevisions:Number(data.includedRevisions)||0,supportDays:Number(data.supportDays)||0};
    }
    if(type==='delivery'){
      return{...payload,...data,checklist:(payload.checklist||DELIVERY_CHECKS.map(text=>({text,done:false}))).map((item,index)=>({...item,done:Boolean(form.elements[`check__${index}`]?.checked)})),deliveredItems:lines(data.deliveredItemsText).map(description=>({description})),trainingProvided:data.trainingProvided==='true',supportDays:Number(data.supportDays)||0};
    }
    return{...payload,...data,additionalHours:Number(data.additionalHours)||0,additionalCost:Number(data.additionalCost)||0};
  }
  function handleForm(kind,data,form,{autosave=false}={}){
    const type=kind.replace('document-','');
    if(!TYPES[type])return false;
    const document=C.get('documents',form.dataset.id);
    if(!document)throw new Error('No se encontró el documento.');
    const payload=collectPayload(type,data,form,document);
    updateDocument(document.id,{payload},autosave?'Guardado automático':'Formulario actualizado');
    return true;
  }
  function bindImplementationAutosave(id){
    const form=$('#recordForm');
    let timer;
    form.querySelectorAll('input,textarea,select').forEach(control=>control.addEventListener('input',()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        const data=Object.fromEntries(new FormData(form).entries());
        handleForm('document-implementation',data,form,{autosave:true});
        const document=C.get('documents',id),progress=requiredProgress(document.payload.sections);
        $('#implementationPercent').textContent=`${progress.completionPercentage}%`;
        $('#implementationBar').style.width=`${progress.completionPercentage}%`;
        $('#implementationMissing').textContent=progress.missingFields.length?`${progress.missingFields.length} campo(s) obligatorio(s) pendiente(s).`:'Todo lo obligatorio está completo.';
        const toast=$('#toast');if(toast){toast.textContent='Borrador guardado automáticamente.';toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>toast.classList.remove('show'),1800)}
      },700);
    }));
  }
  function acceptanceForm(document){
    $('#recordForm').dataset.kind='document-acceptance';
    $('#recordForm').dataset.entity='documents';
    $('#recordForm').dataset.id=document.id;
    $('#dialogTitle').textContent=`Registrar ${document.documentType==='change'?'autorización':'aceptación'}`;
    $('#dialogBody').innerHTML=`<div class="alert full"><strong>Aceptación administrativa</strong><p>Este registro documenta la confirmación recibida; no se presenta como firma electrónica certificada.</p></div><div class="form-grid">
      ${select('targetStatus','Estado',document.documentType==='implementation'?['Completo']:document.documentType==='change'?['Autorizado','Rechazado']:document.documentType==='delivery'?['Aceptada','Aceptada con pendientes','Rechazada']:['Aceptada','Rechazada'],document.documentType==='implementation'?'Completo':document.documentType==='change'?'Autorizado':'Aceptada',true)}
      ${field('name','Nombre de quien acepta','','text',document.documentType!=='implementation')}
      ${field('role','Cargo o relación con el negocio')}
      ${field('date','Fecha',today(),'date',true)}
      ${select('medium','Medio',['Firma presencial','Confirmación por correo','Confirmación por WhatsApp','Firma en pantalla','Otro'],'Confirmación por WhatsApp',document.documentType!=='implementation')}
      ${textarea('notes','Observaciones')}</div>`;
    $('#dialogSave').textContent='Registrar';
    $('#recordDialog').showModal();
  }
  function handleAcceptance(data,form){
    const document=C.get('documents',form.dataset.id);
    if(!document)throw new Error('No se encontró el documento.');
    if(document.documentType!=='implementation'&&!data.name)throw new Error('Indica quién aceptó o autorizó.');
    if(document.documentType==='implementation'){
      const progress=requiredProgress(document.payload.sections);
      if(progress.missingFields.length)throw new Error(`Faltan ${progress.missingFields.length} campo(s) obligatorio(s).`);
      updateDocument(document.id,{payload:{...document.payload,...progress,completedAt:C.now()}},'Información validada');
    }
    return setDocumentStatus(document.id,data.targetStatus,{name:data.name||actor(),role:data.role||'',date:data.date,medium:data.medium||'Registro interno',notes:data.notes||''});
  }
  function showHistory(id){
    const document=C.get('documents',id);
    $('#recordForm').dataset.kind='read-only';
    $('#dialogTitle').textContent=`Historial · ${document.folio}`;
    $('#dialogBody').innerHTML=`<div class="timeline">${[...(document.history||[])].reverse().map(item=>`<div class="timeline-item"><span></span><div><strong>${esc(item.action)}</strong><small>${C.date(item.at)} · ${esc(item.user||'Usuario Quio')}</small>${item.detail?`<p>${esc(item.detail)}</p>`:''}</div></div>`).join('')||empty('Sin historial')}</div>${(document.versions||[]).length?`<h3>Versiones anteriores</h3>${document.versions.map(version=>`<div class="list-row"><strong>Versión ${version.version}</strong>${badge(version.status)}<span>${C.date(version.savedAt)}</span></div>`).join('')}</div>`:''}`;
    $('#recordDialog').showModal();
  }
  function printHeader(title,folio,version,dateValue=new Date()){
    return`<header class="commercial-header"><div class="commercial-brand"><span class="document-logo-crop"><img src="assets/images/logo-quio.png" alt="Quio"></span><div><small>Presencia digital clara para negocios locales</small></div></div><div><p>${esc(title)}</p><strong>${esc(folio)}</strong><small>Versión ${version||1} · ${C.date(dateValue)}</small></div></header>`;
  }
  function printCurrent(filename){
    const previous=document.title;
    document.title=filename;
    setTimeout(()=>{window.print();setTimeout(()=>{document.title=previous},500)},120);
  }
  function partyBlock(snapshot){
    const business=snapshot?.business||{},client=snapshot?.client||{};
    return`<section class="commercial-parties"><div><small>CLIENTE</small><strong>${esc(client.name||'Sin registrar')}</strong><span>${esc(client.email||client.phone||'')}</span></div><div><small>NEGOCIO</small><strong>${esc(business.name||'Sin registrar')}</strong><span>${esc([business.address,business.city,business.state].filter(Boolean).join(', '))}</span></div></section>`;
  }
  function quoteHtml(quote){
    const snapshot=quote.snapshot||snapshotFor({clientId:quote.clientId,businessId:quote.businessId,reviewId:quote.reviewId,quotationId:quote.id});
    const totals=C.quoteTotals(quote),settings=C.db().settings,pkg=C.get('packages',quote.packageId),business=snapshot?.business?.name||C.get('businesses',quote.businessId)?.name||'tu negocio',review=C.get('reviews',quote.reviewId);
    const allItems=[...(quote.items||[]),...(quote.extras||[])],isPackage=Boolean(pkg)&&!(quote.extras||[]).some(item=>Number(item.price)>0);
    const context=quote.context||`Durante la revisión identificamos oportunidades para fortalecer la presencia de ${business} en Google y facilitar que nuevos clientes encuentren información clara y medios de contacto.${review?.iqpd!=null?` El punto de partida registrado fue ${review.iqpd}/100.`:''}`;
    const benefits=(pkg?.contents||allItems.map(item=>item.description)).slice(0,5);
    const deliverables=isPackage?`<ul class="commercial-checklist">${allItems.map(item=>`<li><span>✓</span>${esc(item.description)}</li>`).join('')}</ul>`:`<table class="data-table"><thead><tr><th>Concepto</th><th>Cant.</th><th>Precio</th><th>Importe</th></tr></thead><tbody>${allItems.map(item=>`<tr><td>${esc(item.description)}</td><td>${item.quantity}</td><td>${C.money(item.price)}</td><td>${C.money(item.quantity*item.price)}</td></tr>`).join('')}</tbody></table>`;
    return`<article class="commercial-document quote-print">${printHeader('Propuesta de servicio',quote.folio,quote.version,quote.issuedAt)}${partyBlock(snapshot)}
      ${quote.reviewId?`<p class="commercial-reference">Referencia: Revisión Quio · ${esc(C.get('reviews',quote.reviewId)?.iqpd??'—')}/100</p>`:''}
      <section class="commercial-intro"><p class="eyebrow">CONTEXTO</p><h2>Una propuesta clara para ${esc(business)}</h2><p>${esc(context)}</p></section>
      ${pkg?`<section class="package-highlight"><small>PAQUETE RECOMENDADO</small><strong>Quio ${esc(pkg.name)}</strong><span>${esc(pkg.description||'')}</span></section>`:''}
      <section class="quote-split"><div><h3>Tu proyecto incluye</h3>${deliverables}</div><div><h3>Al finalizar este proyecto tendrás:</h3><ul>${benefits.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></div></section>
      <section class="investment-block"><p>INVERSIÓN</p><h3>${esc(pkg?`Quio ${pkg.name}`:'Propuesta personalizada')}</h3><strong>${C.money(totals.total)} MXN</strong><div><span>Anticipo: <b>${C.money(quote.depositAmount??totals.total*Number(quote.depositPct||0)/100)}</b></span><span>Saldo: <b>${C.money(quote.balanceAmount??totals.total*(1-Number(quote.depositPct||0)/100))}</b></span></div>${settings.showDiscounts!==false&&totals.discount?`<small>Incluye descuento de ${C.money(totals.discount)}.</small>`:''}</section>
      <section class="commercial-grid"><div><small>FORMA DE PAGO</small><strong>${esc(quote.paymentMethod||settings.defaultPaymentMethod)}</strong></div><div><small>IMPLEMENTACIÓN</small><strong>${esc(quote.implementationTime||'Por acordar')}</strong></div><div><small>VIGENCIA</small><strong>${C.date(quote.validUntil)}</strong></div><div><small>IMPUESTOS</small><strong>${settings.showTaxes!==false?C.money(totals.tax):'Incluidos según acuerdo'}</strong></div></section>
      <section class="commercial-two"><div><h3>Información necesaria</h3><p>${esc(quote.clientNeeds||'Información, materiales y accesos autorizados relacionados con el alcance.')}</p></div><div><h3>Vigencia</h3><p>Esta propuesta es válida hasta el ${C.date(quote.validUntil)}.</p></div></section>
      <section class="commercial-two"><div><h3>Condiciones</h3><p>${esc(quote.conditions||settings.baseTerms)}</p></div><div><h3>No incluido</h3><p>${esc(quote.exclusions||'Cualquier servicio no descrito en los entregables.')}</p></div></section>
      <section class="next-steps"><h3>Próximos pasos</h3><ol><li>Aprobación de la propuesta.</li><li>Pago del anticipo.</li><li>Entrega de información y accesos.</li><li>Implementación.</li><li>Revisión y entrega.</li></ol></section>
      ${quote.notes?`<section><h3>Observaciones</h3><p>${esc(quote.notes)}</p></section>`:''}
      <section class="acceptance-box"><h3>Aceptación de la propuesta</h3><div><span>Nombre y cargo</span><span>Fecha</span><span>Confirmación</span></div><p>La aceptación puede registrarse administrativamente en Quio. No constituye una firma electrónica certificada.</p></section>
      <footer class="commercial-footer"><span>${esc(settings.companyName||'Quio')} · ${esc(settings.quioEmail||'')} · ${esc(settings.quioPhone||'')}</span><span>${esc(quote.folio)}</span></footer></article>`;
  }
  function documentHtml(document){
    const snapshot=document.snapshot||snapshotFor(document),payload=document.payload||{},type=TYPES[document.documentType];
    let content='';
    if(document.documentType==='serviceOrder'){
      content=`<section><h2>Objeto y alcance del servicio</h2><p>${esc(payload.finalScope||'Prestación de los servicios y entregables descritos en esta orden.')}</p></section>
      <section><h3>Entregables definitivos</h3><ul>${(payload.deliverables||[]).map(item=>`<li>${esc(item.description||item.text||item)}</li>`).join('')}</ul></section>
      <section class="commercial-grid"><div><small>INICIO</small><strong>${C.date(payload.startDate)}</strong></div><div><small>ENTREGA ESTIMADA</small><strong>${C.date(payload.estimatedDeliveryDate)}</strong></div><div><small>AJUSTES</small><strong>${Number(payload.includedRevisions)||0} ronda(s)</strong></div><div><small>SOPORTE</small><strong>${Number(payload.supportDays)||0} días</strong></div></section>
      <section class="commercial-two"><div><h3>Precio y forma de pago</h3><p>Total: ${C.money(payload.price)}. Anticipo ${Number(payload.depositPct)||0}%. Saldo ${C.money(payload.balance)}. ${esc(payload.paymentMethod||'')}</p></div><div><h3>Información pendiente</h3><p>${esc(payload.pendingClientInfo||'Sin pendientes registrados.')}</p></div></section>
      <section class="commercial-two"><div><h3>Responsabilidades de Quio</h3><p>${esc(payload.quioResponsibilities)}</p></div><div><h3>Responsabilidades del cliente</h3><p>${esc(payload.clientResponsibilities)}</p></div></section>
      <section><h3>Cambios fuera del alcance, accesos y materiales</h3><p>Los cambios no incluidos se documentan y autorizan por separado. ${esc(payload.materialAuthorization)} ${esc(payload.accessAuthorization)}</p></section>`;
    }
    if(document.documentType==='implementation'){
      content=`<section><h2>Información para ejecutar el proyecto</h2><p>Avance registrado: <strong>${payload.completionPercentage||0}%</strong>. No contiene contraseñas.</p></section>${Object.entries(payload.sections||{}).map(([key,values])=>`<section><h3>${esc(SECTION_LABELS[key])}</h3><dl class="document-definition">${(TYPE_FIELDS[key]||[]).map(([name,label])=>`<div><dt>${esc(label)}</dt><dd>${esc(values[name]||'Pendiente')}</dd></div>`).join('')}</dl></section>`).join('')}`;
    }
    if(document.documentType==='delivery'){
      content=`<section><h2>Entrega y conformidad</h2><p>Se documentan los entregables, materiales y accesos transferidos del proyecto.</p></section>
      <section><h3>Verificación previa</h3><ul>${(payload.checklist||[]).map(item=>`<li>${item.done?'✓':'○'} ${esc(item.text)}</li>`).join('')}</ul></section>
      <section class="commercial-two"><div><h3>Entregables terminados</h3><ul>${(payload.deliveredItems||[]).map(item=>`<li>${esc(item.description||item.text||item)}</li>`).join('')}</ul></div><div><h3>Enlaces finales</h3><p>${esc(payload.finalLinks||'Sin enlaces registrados.')}</p></div></section>
      <section class="commercial-two"><div><h3>Accesos y materiales</h3><p>${esc(payload.transferredAccesses||'Sin accesos registrados.')}</p><p>${esc(payload.physicalItems||'Sin materiales físicos registrados.')}</p></div><div><h3>Soporte</h3><p>${Number(payload.supportDays)||0} días · ${esc(payload.supportContact||'Medio por acordar')}</p></div></section>
      <section><h3>Pendientes aceptados</h3><p>${esc(payload.pendingItems||'Sin pendientes.')}${payload.pendingDeadline?` Fecha límite: ${C.date(payload.pendingDeadline)}.`:''}</p></section>`;
    }
    if(document.documentType==='change'){
      content=`<section><h2>Solicitud de cambio adicional</h2><p>${esc(payload.requestedChange)}</p></section>
      <section class="commercial-grid"><div><small>SOLICITANTE</small><strong>${esc(payload.requester)}</strong></div><div><small>ENTREGABLE</small><strong>${esc(payload.affectedDeliverable)}</strong></div><div><small>ALCANCE</small><strong>${esc(payload.scopeClassification)}</strong></div><div><small>NUEVA FECHA</small><strong>${C.date(payload.newEstimatedDate)}</strong></div></section>
      <section class="commercial-two"><div><h3>Motivo</h3><p>${esc(payload.reason)}</p></div><div><h3>Impacto estimado</h3><p>${Number(payload.additionalHours)||0} hora(s) adicionales · ${C.money(payload.additionalCost)}</p></div></section>`;
    }
    const acceptance=document.acceptanceData;
    return`<article class="commercial-document">${printHeader(type.label,document.folio,document.version)}${partyBlock(snapshot)}${content}${payload.observations?`<section><h3>Observaciones</h3><p>${esc(payload.observations)}</p></section>`:''}
      <section class="acceptance-box"><h3>${document.documentType==='change'?'Autorización':'Aceptación'}</h3>${acceptance?`<p><strong>${esc(acceptance.name)}</strong> · ${esc(acceptance.role||'')}</p><p>${C.date(acceptance.date)} · ${esc(acceptance.medium)}</p><p>${esc(acceptance.notes||'')}</p>`:'<div><span>Nombre y cargo</span><span>Fecha</span><span>Confirmación</span></div>'}<p>Registro administrativo; no se presenta como firma electrónica certificada.</p></section>
      <footer class="commercial-footer"><span>Quio · ${esc(snapshot?.quio?.email||'')} · ${esc(snapshot?.quio?.phone||'')}</span><span>${esc(document.folio)}</span></footer></article>`;
  }
  function showQuote(id,print=false){
    const quote=C.get('quotes',id);
    if(!quote)return;
    if(print){
      const totals=C.quoteTotals(quote);if(totals.total<=0&&!quote.freeService)throw new Error('No se puede generar el PDF: el total es $0.00 y no se confirmó un servicio gratuito.');
      if(!quote.snapshot&&['Enviada','Aceptada'].includes(quote.status))C.upsert('quotes',{id:quote.id,snapshot:snapshotFor({clientId:quote.clientId,businessId:quote.businessId,reviewId:quote.reviewId,quotationId:quote.id}),pdfGeneratedAt:C.now(),history:[...(quote.history||[]),historyEntry('PDF generado')]});
    }
    $('#recordForm').dataset.kind='read-only';
    $('#dialogTitle').textContent=`Cotización ${quote.folio}`;
    const totals=C.quoteTotals(quote);
    $('#dialogBody').innerHTML=`${quoteHtml(quote)}<div class="internal-cost no-print"><h3>Costeo interno</h3><div class="cost-stack"><span><small>Costo económico</small><b>${C.money(totals.economicCost)}</b></span><span><small>Utilidad estimada</small><b>${C.money(totals.profit)}</b></span><span><small>Margen</small><b>${totals.margin.toFixed(1)}%</b></span></div></div><div class="dialog-actions no-print"><button type="button" class="btn" data-edit="quotes:${quote.id}">Editar</button><button type="button" class="btn danger btn-danger" data-delete-quote="${quote.id}">Eliminar</button><button type="button" class="btn primary btn-primary" data-print-quote="${quote.id}">Descargar PDF / Imprimir</button></div>`;
    $('#recordDialog').showModal();
    if(print)printCurrent(`cotizacion-quio-${quote.folio}`);
  }
  function showDocument(id,print=false){
    const document=print?issueDocument(id):C.get('documents',id);
    if(!document)return;
    $('#recordForm').dataset.kind='read-only';
    $('#dialogTitle').textContent=`${TYPES[document.documentType].label} · ${document.folio}`;
    const canClose=document.documentType==='delivery'&&ACCEPTED.delivery.includes(document.status)&&document.projectId;
    const canCharge=document.documentType==='change'&&document.status==='Autorizado'&&Number(document.payload?.additionalCost)>0&&!document.payload?.financeChargeId;
    $('#dialogBody').innerHTML=`${documentHtml(document)}<div class="dialog-actions no-print"><button type="button" class="btn" data-doc-edit="${document.id}">Editar</button><button type="button" class="btn primary" data-doc-print="${document.id}">Descargar PDF / Imprimir</button>${canClose?`<button type="button" class="btn primary" data-close-project="${document.projectId}">Cerrar proyecto</button>`:''}${canCharge?`<button type="button" class="btn" data-charge-change="${document.id}">Crear cargo en Finanzas</button>`:''}</div>`;
    $('#recordDialog').showModal();
    if(print){
      const prefix={serviceOrder:'orden-servicio-quio',implementation:'informacion-implementacion',delivery:'acta-entrega-quio',change:'cambio-adicional-quio'}[document.documentType];
      printCurrent(`${prefix}-${document.folio}`);
    }
  }
  function generatorForm(type){
    $('#recordForm').dataset.kind='document-generator';
    $('#recordForm').dataset.entity='documents';
    $('#recordForm').dataset.id='';
    $('#recordForm').dataset.documentType=type;
    $('#dialogTitle').textContent=`Nueva ${TYPES[type].label.toLowerCase()}`;
    const source=type==='serviceOrder'?select('quotationId','Cotización',entityOptions('quotes','folio').filter(option=>!option.value||C.get('quotes',option.value)?.status==='Aceptada'),'',true):select('projectId','Proyecto',entityOptions('projects'),'',true);
    $('#dialogBody').innerHTML=`<div class="form-grid">${source}</div>`;
    $('#dialogSave').textContent='Continuar';
    $('#recordDialog').showModal();
  }
  function handleGenerator(data,form){
    const type=form.dataset.documentType;
    if(type==='serviceOrder')return openDocumentForm(type,{quotationId:data.quotationId});
    return openDocumentForm(type,{projectId:data.projectId});
  }
  function bindActions(context){
    const {render,toast,confirmAction}=context;
    $$('[data-document-filter]').forEach(button=>button.onclick=()=>{renderDocuments($('#app'),button.dataset.documentFilter);bindActions(context)});
    $$('[data-document-generator]').forEach(button=>button.onclick=()=>generatorForm(button.dataset.documentGenerator));
    $$('[data-expedient]').forEach(button=>button.onclick=()=>{const[type,id]=button.dataset.expedient.split(':');renderExpedient(type,id);bindActions(context)});
    $$('[data-doc-view]').forEach(button=>button.onclick=()=>{showDocument(button.dataset.docView);bindActions(context)});
    $$('[data-doc-edit]').forEach(button=>button.onclick=()=>openDocumentForm(C.get('documents',button.dataset.docEdit)));
    $$('[data-doc-print]').forEach(button=>button.onclick=()=>showDocument(button.dataset.docPrint,true));
    $$('[data-doc-history]').forEach(button=>button.onclick=()=>showHistory(button.dataset.docHistory));
    $$('[data-doc-accept]').forEach(button=>button.onclick=()=>acceptanceForm(C.get('documents',button.dataset.docAccept)));
    $$('[data-doc-status]').forEach(button=>button.onclick=()=>{const separator=button.dataset.docStatus.indexOf(':'),id=button.dataset.docStatus.slice(0,separator),status=button.dataset.docStatus.slice(separator+1);try{setDocumentStatus(id,status);toast(`Documento marcado como ${status.toLowerCase()}.`);render()}catch(error){toast(error.message)}});
    $$('[data-print-quote]').forEach(button=>button.onclick=()=>{try{showQuote(button.dataset.printQuote,true)}catch(error){toast(error.message)}});
    $$('[data-quote-status]').forEach(button=>button.onclick=()=>{const separator=button.dataset.quoteStatus.indexOf(':'),id=button.dataset.quoteStatus.slice(0,separator),status=button.dataset.quoteStatus.slice(separator+1);setQuoteStatus(id,status);toast(`Cotización marcada como ${status.toLowerCase()}.`);render()});
    $$('[data-quote-duplicate]').forEach(button=>button.onclick=()=>{duplicateQuote(button.dataset.quoteDuplicate);toast('Cotización duplicada como borrador.');render()});
    $$('[data-delete-quote]').forEach(button=>button.onclick=()=>{
      const quote=C.get('quotes',button.dataset.deleteQuote);if(!quote)return;
      const client=C.clientRecord(quote.clientId),project=C.list('projects').find(item=>item.quoteId===quote.id);
      if($('#recordDialog').open)$('#recordDialog').close();
      if(project){confirmAction('Cotización vinculada a un proyecto',`${quote.folio} · ${client?.name||'Sin cliente'} está relacionada con “${project.name}”. Para conservar la integridad, confirma para cancelar la cotización sin eliminarla.`,()=>{setQuoteStatus(quote.id,'Cancelada');toast('Cotización cancelada; el proyecto conserva su relación.');render()});return}
      confirmAction('Eliminar cotización',`Se eliminará ${quote.folio} de ${client?.name||'Sin cliente'}. Esta acción no se puede deshacer.`,()=>{C.remove('quotes',quote.id);C.recordActivity('Cotización eliminada','quotes',quote,`${quote.folio} · ${client?.name||'Sin cliente'}`);toast('Cotización eliminada correctamente.');render()});
    });
    $$('[data-order-from-quote]').forEach(button=>button.onclick=()=>{const doc=createDocument('serviceOrder',{quotationId:button.dataset.orderFromQuote});openDocumentForm(doc)});
    $$('[data-project-doc]').forEach(button=>button.onclick=()=>{
      const [projectId,type]=button.dataset.projectDoc.split(':');
      try{
        if(type==='implementation'){
          const order=C.list('documents').find(doc=>doc.projectId===projectId&&doc.documentType==='serviceOrder'&&doc.status==='Aceptada');
          if(!order)throw new Error('Primero debe aceptarse la orden de servicio.');
        }
        if(type==='delivery'){
          const project=C.get('projects',projectId),pending=(project.checklist||[]).filter(item=>!item.done);
          if(pending.length)throw new Error(`Faltan ${pending.length} entregable(s) por completar antes del acta.`);
        }
        const existing=C.list('documents').find(doc=>doc.projectId===projectId&&doc.documentType===type&&!/Cancelad/.test(doc.status));
        openDocumentForm(existing||type,{projectId});
      }catch(error){toast(error.message)}
    });
    $$('[data-close-project]').forEach(button=>button.onclick=()=>confirmAction('Cerrar proyecto','Se validarán acta, entregables y pagos antes de cerrar.',()=>{try{closeProject(button.dataset.closeProject);toast('Proyecto cerrado correctamente.');$('#recordDialog').close();render()}catch(error){toast(error.message)}}));
    $$('[data-charge-change]').forEach(button=>button.onclick=()=>confirmAction('Crear cargo en Finanzas','El cargo pendiente se creará una sola vez y quedará relacionado con este cambio.',()=>{try{chargeChange(button.dataset.chargeChange);toast('Cargo creado en Finanzas.');showDocument(button.dataset.chargeChange)}catch(error){toast(error.message)}}));
    const settingsForm=$('#documentSettingsForm');
    if(settingsForm)settingsForm.onsubmit=event=>{
      event.preventDefault();
      const data=Object.fromEntries(new FormData(settingsForm).entries()),settings=C.db().settings;
      ['quoteValidityDays','defaultDepositPct','defaultAdjustmentRounds','defaultSupportDays'].forEach(key=>settings[key]=Number(data[key])||0);
      Object.assign(settings,{defaultPaymentMethod:data.defaultPaymentMethod,quioResponsible:data.quioResponsible,quioEmail:data.quioEmail,quioPhone:data.quioPhone,baseTerms:data.baseTerms,showTaxes:Boolean(data.showTaxes),showDiscounts:Boolean(data.showDiscounts)});
      settings.folioPrefixes={quote:data.prefixQuote,serviceOrder:data.prefixServiceOrder,implementation:data.prefixImplementation,delivery:data.prefixDelivery,change:data.prefixChange};
      settings.folioCounters={quote:Number(data.nextQuote)||1,serviceOrder:Number(data.nextServiceOrder)||1,implementation:Number(data.nextImplementation)||1,delivery:Number(data.nextDelivery)||1,change:Number(data.nextChange)||1};
      C.save();toast('Configuración documental guardada.');
    };
  }
  function handleSpecialForm(kind,data,form){
    if(kind==='document-generator'){handleGenerator(data,form);return{handled:true,keepOpen:true}}
    if(kind==='document-acceptance'){handleAcceptance(data,form);return{handled:true}}
    if(kind.startsWith('document-')){handleForm(kind,data,form);return{handled:true}}
    return{handled:false};
  }
  return{
    TYPES,STATUSES,DELIVERY_CHECKS,nextFolio,snapshotFor,requiredProgress,createDocument,updateDocument,issueDocument,setDocumentStatus,
    prepareQuote,duplicateQuote,setQuoteStatus,projectFromQuote,closeProject,chargeChange,quoteForm,renderQuotes,renderDocuments,
    renderExpedient,enhance,alerts,openDocumentForm,handleForm,handleAcceptance,handleSpecialForm,showQuote,showDocument,showHistory,
    generatorForm,handleGenerator,bindActions,quoteHtml,documentHtml
  };
})();
