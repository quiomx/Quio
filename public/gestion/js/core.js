'use strict';
window.QuioCore=(()=>{
  const KEY='quio_management_v1';
  const PRE_V8_BACKUP_KEY='quio_management_pre_v8_backup';
  const PRE_V9_BACKUP_KEY='quio_management_pre_v9_backup';
  const PRE_V10_BACKUP_KEY='quio_management_pre_v10_backup';
  const SCHEMA='4.0.0';
  const ENTITIES=['prospects','clients','businesses','contacts','reviews','quotes','services','packages','projects','documents','financialMovements','activityLog','activities','deliverables','payments','expenses','timeEntries','inventoryProducts','inventoryMovements','followups','files'];
  const now=()=>new Date().toISOString();
  const id=(prefix='q')=>`${prefix}_${crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}`;
  const base=(prefix,data={})=>({id:id(prefix),createdAt:now(),updatedAt:now(),status:'active',archived:false,...data});
  const n=value=>Number(value)||0;
  const round=(value,digits=2)=>Number(n(value).toFixed(digits));

  const defaultServices=[
    ['Mejora de presencia en Google Business y Google Maps',2500,250],
    ['Configuración y corrección de información del negocio',1500,125],
    ['Sistema físico sencillo para facilitar reseñas',1200,286],
    ['Sitio web informativo de una página',3500,0],
    ['Agenda de citas en línea',2500,0],
    ['Mejoras de contactabilidad',900,0],
    ['Seguimiento y nueva revisión',1000,0],
    ['Soluciones personalizadas',0,0]
  ].map(([name,basePrice,directCost],i)=>base('svc',{name,basePrice,directCost,status:'active',order:i+1}));

  const defaultPackages=()=>[
    {
      id:'pkg_esencial',name:'Esencial',price:3500,estimatedHours:.5,stands:1,nfcCards:0,trips:1,
      software:0,providers:0,otherCosts:0,status:'Activo',order:1,color:'#6f4cff',
      description:'Mejorar la presencia del negocio en Google.',
      contents:['Revisión Quio','Mejora de Google Business y Google Maps','Corrección de información del perfil','NFC + QR para facilitar reseñas','Guía sencilla de uso']
    },
    {
      id:'pkg_intermedio',name:'Profesional',price:8000,estimatedHours:2,stands:1,nfcCards:0,trips:1,
      software:0,providers:0,otherCosts:0,status:'Activo',order:2,color:'#149b81',
      description:'Presencia digital completa con sitio web y conexión de dominio.',
      contents:['Todo lo incluido en Esencial','Sitio web profesional informativo','Formulario o medio claro de contacto','Botón o enlace de WhatsApp','Publicación inicial','Configuración del dominio adquirido por el cliente'],
      note:'El dominio lo compra y paga directamente el cliente.'
    },
    {
      id:'pkg_avanzado',name:'Avanzado',price:10000,estimatedHours:3,stands:1,nfcCards:0,trips:1,
      software:0,providers:0,otherCosts:0,status:'Activo',order:3,color:'#d87920',
      description:'Facilitar contactos y citas mediante Calendly, Google Calendar y medios digitales de contacto.',
      contents:['Todo lo incluido en Profesional','Agenda de citas en línea','Configuración de Calendly o Google Calendar','Flujo digital de contacto','Configuración y entrega']
    }
  ].map(p=>({...p,createdAt:now(),updatedAt:now(),archived:false}));

  function defaultSettings(){
    return {
      companyName:'Quio',currency:'MXN',monthlyGoal:18000,annualGoal:216000,
      founderEmploymentIncome:22000,totalMonthlyIncomeGoal:40000,hourlyTarget:500,
      standUnitCost:143,nfcCardUnitCost:143,averageTripCost:150,healthyMargin:55,
      warningMargin:45,monthlyCapacityHours:80,effectiveHourlyBasis:'income',taxRate:16,
      expenseCategories:['NFC y materiales','Gasolina y traslado','Dominio','Software','Contadora','Publicidad','Papelería','Comisiones','Otros gastos'],
      incomeCategories:['Anticipo','Liquidación','Pago completo','Ingreso adicional','Otro ingreso'],
      paymentMethods:['Transferencia','Efectivo','Tarjeta','Otro'],
      followupTypes:['WhatsApp','Llamada','Correo','Presencial','Otro'],
      inventoryCategories:['NFC','Elementos QR','Materiales de entrega','Otros'],
      prospectStages:['Nuevo','Contactado','Revisión agendada','Revisión realizada','Propuesta enviada','En decisión','Ganado','No continuó'],
      clientStatuses:['Prospecto','Revisión agendada','Revisión realizada','Cotización enviada','Cotización aceptada','Cliente activo','Proyecto en desarrollo','Proyecto entregado','Cliente inactivo','No interesado'],
      quoteStatuses:['Borrador','Enviada','Aceptada','Rechazada','Vencida','Cancelada'],
      projectStatuses:['Por iniciar','En curso','En espera del cliente','En revisión','Entregado','Seguimiento','Cerrado','Cancelado'],
      activityTemplates:['Información recibida','Logo recibido','Contenido recibido','Perfil de Google revisado','Sitio construido','Revisión del cliente','Dominio conectado','NFC configurado','Entrega realizada','Pago liquidado'],
      lowStockThreshold:1,
      quoteValidityDays:15,defaultDepositPct:50,defaultPaymentMethod:'Transferencia',
      defaultAdjustmentRounds:1,defaultSupportDays:15,
      baseTerms:'Los tiempos comienzan cuando Quio recibe la información y los accesos necesarios. Los cambios fuera del alcance se cotizan por separado.',
      quioResponsible:'',quioLegalName:'',quioRfc:'',quioEmail:'',quioPhone:'',quioWhatsapp:'',quioWebsite:'https://quio.mx',quioAddress:'',quoteFooter:'Gracias por confiar en Quio.',
      showTaxes:true,showDiscounts:true,
      folioPrefixes:{quote:'QUIO',serviceOrder:'OS',implementation:'IMP',delivery:'AE',change:'CA'},
      folioCounters:{quote:1,serviceOrder:1,implementation:1,delivery:1,change:1},
      accountantMonthly:700,chatgptMonthly:400,domainMonthly:50,fixedMonthlyCosts:1150,
      nfcPerClient:234,fuelPerClient:100,variablePerClient:334,nfcStock:0
    };
  }
  function emptyDB(){
    const db={schemaVersion:SCHEMA,createdAt:now(),updatedAt:now(),meta:{demo:false,migratedToV8At:null,migratedToV9At:null,migratedToV10At:null},settings:defaultSettings(),services:defaultServices,packages:defaultPackages()};
    ENTITIES.forEach(k=>{if(!db[k])db[k]=[]});
    return db;
  }
  function ensureInventory(db){
    const wanted=[
      {name:'NFC',sku:'NFC-STAND',category:'NFC',unitCost:n(db.settings.standUnitCost),stock:0,minStock:2},
      {name:'NFC',sku:'NFC-CARD',category:'NFC',unitCost:n(db.settings.nfcCardUnitCost),stock:0,minStock:2}
    ];
    wanted.forEach(product=>{
      const current=db.inventoryProducts.find(x=>x.sku===product.sku);
      if(!current)db.inventoryProducts.push(base('inv',{...product,status:'Activo'}));
      else if(!n(current.unitCost))current.unitCost=product.unitCost;
    });
  }
  function migrate(raw){
    const source=raw&&typeof raw==='object'?raw:null;
    const previousSchema=source?.schemaVersion||'0.0.0';
    const major=Number(String(previousSchema).split('.')[0])||0;
    const wasPreV8=source&&major<2;
    const wasPreV9=source&&major<3;
    const wasPreV10=source&&major<4;
    if(wasPreV8&&!localStorage.getItem(PRE_V8_BACKUP_KEY)){
      try{localStorage.setItem(PRE_V8_BACKUP_KEY,JSON.stringify({...source,automaticBackupAt:now()}))}catch(error){console.warn('No fue posible crear el respaldo previo a v8.',error)}
    }
    if(wasPreV9&&!localStorage.getItem(PRE_V9_BACKUP_KEY)){
      try{localStorage.setItem(PRE_V9_BACKUP_KEY,JSON.stringify({...source,automaticBackupAt:now()}))}catch(error){console.warn('No fue posible crear el respaldo previo a v9.',error)}
    }
    if(wasPreV10&&!localStorage.getItem(PRE_V10_BACKUP_KEY)){
      try{localStorage.setItem(PRE_V10_BACKUP_KEY,JSON.stringify({...source,automaticBackupAt:now()}))}catch(error){console.warn('No fue posible crear el respaldo previo a v10.',error)}
    }
    const db={...emptyDB(),...(source||{})};
    ENTITIES.forEach(k=>db[k]=Array.isArray(db[k])?db[k]:[]);
    const beforeCounts={prospects:db.prospects.length,clients:db.clients.length,businesses:db.businesses.length,followups:db.followups.length,payments:db.payments.length,expenses:db.expenses.length,financialMovements:db.financialMovements.length};
    const inheritedSettings={...(source?.settings||{})};
    if(inheritedSettings.hourlyTarget==null||n(inheritedSettings.hourlyTarget)===350)inheritedSettings.hourlyTarget=500;
    db.settings={...defaultSettings(),...inheritedSettings};
    db.settings.folioPrefixes={...defaultSettings().folioPrefixes,...(inheritedSettings.folioPrefixes||{})};
    if(db.settings.folioPrefixes.quote==='COT')db.settings.folioPrefixes.quote='QUIO';
    db.settings.folioCounters={...defaultSettings().folioCounters,...(inheritedSettings.folioCounters||{})};
    defaultServices.forEach(service=>{
      const existing=db.services.find(item=>item.name===service.name||item.id===service.id);
      if(!existing){db.services.push({...service});return}
      if(n(existing.basePrice)===0&&n(service.basePrice)>0)existing.basePrice=service.basePrice;
      if(n(existing.directCost)===0&&n(service.directCost)>0)existing.directCost=service.directCost;
    });
    const initialPackages=defaultPackages();
    initialPackages.forEach(pkg=>{
      const existing=db.packages.find(x=>x.id===pkg.id);
      if(!existing){db.packages.push(pkg);return}
      const inheritedDefaults={pkg_esencial:3990,pkg_intermedio:6990,pkg_avanzado:11990};
      if(wasPreV10&&n(existing.price)===inheritedDefaults[pkg.id])Object.assign(existing,{...pkg,createdAt:existing.createdAt,updatedAt:now()});
    });
    const normalize=value=>String(value||'').trim().toLowerCase();
    const phoneKey=value=>String(value||'').replace(/\D/g,'').slice(-10);
    const clientStatus=status=>({
      Activo:'Cliente activo',Inactivo:'Cliente inactivo',Potencial:'Prospecto',Nuevo:'Prospecto',Contactado:'Prospecto',
      'Revisión agendada':'Revisión agendada','Revisión realizada':'Revisión realizada','Propuesta enviada':'Cotización enviada',
      'En decisión':'Cotización enviada',Ganado:'Cliente activo','No continuó':'No interesado'
    }[status]||status||'Prospecto');
    const findBusiness=name=>db.businesses.find(item=>normalize(item.name)===normalize(name));
    const findClient=input=>db.clients.find(item=>{
      const sameEmail=input.email&&item.email&&normalize(input.email)===normalize(item.email);
      const samePhone=phoneKey(input.phone)&&phoneKey(input.phone)===phoneKey(item.phone);
      const sameSource=input.id&&item.sourceProspectId===input.id;
      return sameEmail||samePhone||sameSource;
    });
    db.clients.forEach(client=>{
      const linked=db.businesses.find(business=>(client.businessIds||[]).includes(business.id))||db.businesses.find(business=>business.id===client.businessId);
      client.status=clientStatus(client.status);
      client.businessId=client.businessId||linked?.id||'';
      client.businessName=client.businessName||linked?.name||'';
      client.industry=client.industry||linked?.industry||'';
      client.address=client.address||linked?.address||'';
      client.mapsUrl=client.mapsUrl||linked?.mapsUrl||'';
      client.websiteUrl=client.websiteUrl||linked?.websiteUrl||'';
      client.whatsapp=client.whatsapp||client.phone||linked?.phone||'';
      client.source=client.source||'Registro existente';
      client.registeredAt=client.registeredAt||client.createdAt||now();
    });
    db.prospects.forEach(prospect=>{
      let business=findBusiness(prospect.businessName);
      if(!business){business=base('biz',{name:prospect.businessName||'Negocio sin nombre',industry:prospect.industry||'',phone:prospect.phone||'',email:prospect.email||'',status:'Prospecto',sourceProspectId:prospect.id});db.businesses.push(business)}
      let client=findClient(prospect);
      if(!client){
        client=base('cli',{name:prospect.contactName||`Contacto de ${prospect.businessName||'negocio'}`,businessId:business.id,businessIds:[business.id],businessName:business.name,phone:prospect.phone||'',whatsapp:prospect.phone||'',email:prospect.email||'',industry:prospect.industry||business.industry||'',source:prospect.source||'Prospecto migrado',status:clientStatus(prospect.stage),registeredAt:prospect.createdAt||now(),nextFollowup:prospect.nextFollowup||'',notes:prospect.notes||'',sourceProspectId:prospect.id});
        db.clients.push(client);
      }else{
        client.businessId=client.businessId||business.id;client.businessIds=[...new Set([...(client.businessIds||[]),business.id])];
        client.businessName=client.businessName||business.name;client.status=clientStatus(prospect.stage||client.status);client.sourceProspectId=client.sourceProspectId||prospect.id;
      }
      prospect.migratedClientId=client.id;prospect.migratedAt=prospect.migratedAt||now();prospect.archived=true;
      db.followups.filter(followup=>followup.prospectId===prospect.id&&!followup.clientId).forEach(followup=>{followup.clientId=client.id;followup.migratedFromProspectId=prospect.id});
    });
    const hasMovement=(sourceType,sourceId)=>db.financialMovements.some(item=>item.sourceType===sourceType&&item.sourceId===sourceId);
    db.payments.forEach(payment=>{
      if(hasMovement('payment',payment.id))return;
      db.financialMovements.push(base('mov',{date:payment.actualDate||payment.expectedDate||payment.date||now().slice(0,10),movementType:'Ingreso',category:payment.type||'Otro ingreso',clientId:payment.clientId||'',projectId:payment.projectId||'',quoteId:payment.quoteId||'',concept:payment.notes||payment.type||'Ingreso',amount:n(payment.amount),method:payment.method||'',status:payment.status==='Cobrado'?'Pagado':payment.status||'Pendiente',receiptUrl:payment.receiptUrl||'',notes:payment.notes||'',sourceType:'payment',sourceId:payment.id,idempotencyKey:`legacy-payment-${payment.id}`}));
    });
    db.expenses.forEach(expense=>{
      if(hasMovement('expense',expense.id))return;
      db.financialMovements.push(base('mov',{date:expense.date||now().slice(0,10),movementType:'Gasto',category:expense.category||'Otros gastos',clientId:expense.clientId||'',projectId:expense.projectId||'',quoteId:expense.quoteId||'',concept:expense.notes||expense.category||'Gasto',amount:n(expense.amount),method:expense.method||'',status:['Pagado','Pagada'].includes(expense.status)||!expense.status?'Pagado':expense.status,receiptUrl:expense.receiptUrl||'',notes:expense.notes||'',sourceType:'expense',sourceId:expense.id,idempotencyKey:`legacy-expense-${expense.id}`}));
    });
    const plusDays=(days=15)=>new Date(Date.now()+Math.max(0,n(days))*86400000).toISOString().slice(0,10);
    db.quotes.forEach((quote,index)=>{
      quote.folio=quote.folio||`QUIO-${new Date(quote.createdAt||Date.now()).getFullYear()}-${String(index+1).padStart(4,'0')}`;
      quote.status=quote.status==='Lista para enviar'?'Borrador':quote.status==='Convertida en proyecto'?'Aceptada':quote.status||'Borrador';
      quote.issuedAt=quote.issuedAt||quote.createdAt||now();
      quote.validUntil=quote.validUntil||plusDays(db.settings.quoteValidityDays);
      quote.depositPct=quote.depositPct==null?n(db.settings.defaultDepositPct):n(quote.depositPct);
      quote.paymentMethod=quote.paymentMethod||db.settings.defaultPaymentMethod;
      quote.items=Array.isArray(quote.items)?quote.items:[];
      quote.extras=Array.isArray(quote.extras)?quote.extras:[];
      quote.version=Math.max(1,n(quote.version)||1);
      quote.history=Array.isArray(quote.history)?quote.history:[];
    });
    db.documents.forEach(document=>{
      document.documentType=document.documentType||'serviceOrder';
      document.status=document.status||'Borrador';
      document.version=Math.max(1,n(document.version)||1);
      document.history=Array.isArray(document.history)?document.history:[];
      document.versions=Array.isArray(document.versions)?document.versions:[];
      document.payload=document.payload&&typeof document.payload==='object'?document.payload:{};
    });
    const projectStatusMap={'Pendiente de iniciar':'Por iniciar','En desarrollo':'En curso','Esperando información':'En espera del cliente','Esperando aprobación':'En revisión','Listo para entregar':'En revisión','Terminado':'Cerrado','Completado':'Cerrado'};
    db.settings.projectStatuses=defaultSettings().projectStatuses;
    db.projects.forEach(project=>{
      project.status=projectStatusMap[project.status]||project.status||'Por iniciar';
      project.deliveryDate=project.deliveryDate||project.deliveredAt||'';
      project.siteUrl=project.siteUrl||project.deliverableUrl||'';
      project.repositoryUrl=project.repositoryUrl||'';
      project.filesUrl=project.filesUrl||'';
      project.checklist=Array.isArray(project.checklist)&&project.checklist.length?project.checklist:(db.settings.activityTemplates||[]).map(text=>({text,done:false}));
    });
    const counterFrom=(prefix,records)=>records.reduce((max,record)=>{
      const match=String(record.folio||'').match(new RegExp(`^${prefix}-\\d{4}-(\\d+)$`));
      return match?Math.max(max,n(match[1])+1):max;
    },1);
    db.settings.folioCounters.quote=Math.max(n(db.settings.folioCounters.quote)||1,counterFrom(db.settings.folioPrefixes.quote,db.quotes));
    [['serviceOrder','serviceOrder'],['implementation','implementation'],['delivery','delivery'],['change','change']].forEach(([key,type])=>{
      db.settings.folioCounters[key]=Math.max(n(db.settings.folioCounters[key])||1,counterFrom(db.settings.folioPrefixes[key],db.documents.filter(x=>x.documentType===type)));
    });
    ensureInventory(db);
    const afterCounts={clients:db.clients.length,businesses:db.businesses.length,followups:db.followups.length,financialMovements:db.financialMovements.length};
    const orphanedFollowups=db.followups.filter(item=>!item.clientId&&!item.projectId).length;
    if(wasPreV10)db.activityLog.unshift(base('act',{action:'Migración V10 completada',entity:'system',detail:`${beforeCounts.prospects} prospectos y ${beforeCounts.payments+beforeCounts.expenses} movimientos históricos procesados.`}));
    db.meta={demo:false,...(db.meta||{}),migratedToV8At:db.meta?.migratedToV8At||(wasPreV8?now():null),preV8BackupKey:wasPreV8?PRE_V8_BACKUP_KEY:db.meta?.preV8BackupKey,migratedToV9At:db.meta?.migratedToV9At||(wasPreV9?now():null),preV9BackupKey:wasPreV9?PRE_V9_BACKUP_KEY:db.meta?.preV9BackupKey,migratedToV10At:db.meta?.migratedToV10At||(wasPreV10?now():null),preV10BackupKey:wasPreV10?PRE_V10_BACKUP_KEY:db.meta?.preV10BackupKey,v10MigrationReport:db.meta?.v10MigrationReport||(wasPreV10?{ranAt:now(),before:beforeCounts,after:afterCounts,orphanedFollowups}:null)};
    db.schemaVersion=SCHEMA;db.updatedAt=now();return db;
  }
  function load(){try{return migrate(JSON.parse(localStorage.getItem(KEY)||'null'))}catch(e){console.warn('Respaldo local inválido',e);return emptyDB()}}
  let db=load();
  try{localStorage.setItem(KEY,JSON.stringify(db))}catch(error){console.warn('No fue posible persistir automáticamente la migración de Quio V8.',error)}
  function save(options={}){db.updatedAt=now();localStorage.setItem(KEY,JSON.stringify(db));if(!options.silent)window.dispatchEvent(new CustomEvent('quio:change'));return db}
  function list(entity,{includeArchived=false}={}){return(db[entity]||[]).filter(x=>includeArchived||!x.archived)}
  function get(entity,recordId){return(db[entity]||[]).find(x=>x.id===recordId)}
  function upsert(entity,data,prefix=entity.slice(0,3)){
    if(!Array.isArray(db[entity]))throw new Error(`Entidad desconocida: ${entity}`);
    const ix=data.id?db[entity].findIndex(x=>x.id===data.id):-1;
    if(ix>=0)db[entity][ix]={...db[entity][ix],...data,updatedAt:now()};
    else db[entity].unshift(base(prefix,data));
    const record=ix>=0?db[entity][ix]:db[entity][0];
    if(entity==='payments'||entity==='expenses')mirrorLegacyMovement(entity,record);
    save();return ix>=0?db[entity][ix]:db[entity][0];
  }
  function archive(entity,recordId){const r=get(entity,recordId);if(!r)return false;if(!r.archived)r.statusBeforeArchive=r.status;r.archived=true;r.status='archived';r.updatedAt=now();save();return true}
  function restore(entity,recordId){const r=get(entity,recordId);if(!r)return false;r.archived=false;r.status=r.statusBeforeArchive||(entity==='followups'?'Pendiente':'Activo');delete r.statusBeforeArchive;r.updatedAt=now();save();return true}
  function remove(entity,recordId){
    if(!Array.isArray(db[entity]))throw new Error(`Entidad desconocida: ${entity}`);
    const index=db[entity].findIndex(record=>record.id===recordId);
    if(index<0)return false;
    db[entity].splice(index,1);
    save();
    return true;
  }
  function replace(next,options={}){db=migrate(next);save(options);return db}
  function merge(next,options={}){const incoming=migrate(next);ENTITIES.forEach(k=>incoming[k].forEach(r=>{const ix=db[k].findIndex(x=>x.id===r.id);if(ix<0)db[k].push(r);else if((r.updatedAt||'')>(db[k][ix].updatedAt||''))db[k][ix]=r}));db.settings={...db.settings,...incoming.settings};save(options);return db}
  const money=value=>new Intl.NumberFormat('es-MX',{style:'currency',currency:db.settings.currency||'MXN',maximumFractionDigits:2}).format(n(value));
  const date=value=>value?new Intl.DateTimeFormat('es-MX',{dateStyle:'medium'}).format(new Date(value)):'—';
  const monthKey=(value=new Date())=>{const d=new Date(value);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`};

  function estimate(input={},settings=db.settings){
    const price=Math.max(0,n(input.price));
    const discount=Math.max(0,n(input.discount));
    const netPrice=Math.max(0,price-discount);
    const hours=Math.max(0,n(input.estimatedHours));
    const hourlyValue=Math.max(0,n(input.hourlyValue??settings.hourlyTarget));
    const standCost=Math.max(0,n(input.standUnitCost??settings.standUnitCost));
    const cardCost=Math.max(0,n(input.nfcCardUnitCost??settings.nfcCardUnitCost));
    const tripCost=Math.max(0,n(input.tripUnitCost??settings.averageTripCost));
    const labor=hours*hourlyValue;
    const materials=Math.max(0,n(input.stands))*standCost+Math.max(0,n(input.nfcCards))*cardCost;
    const trips=Math.max(0,n(input.trips))*tripCost;
    const software=Math.max(0,n(input.software)),providers=Math.max(0,n(input.providers)),otherCosts=Math.max(0,n(input.otherCosts));
    const directCost=materials+trips+software+providers+otherCosts;
    const economicCost=labor+directCost;
    const profit=netPrice-economicCost;
    const margin=netPrice?profit/netPrice*100:0;
    const taxRate=Math.max(0,n(input.taxRate??settings.taxRate));
    const taxes=netPrice*taxRate/100;
    const total=netPrice+taxes;
    const minPrice=target=>target>=100?Infinity:economicCost/(1-target/100);
    const targetMargin=n(input.targetMargin??settings.healthyMargin);
    const maxHours=hourlyValue?Math.max(0,(netPrice*(1-targetMargin/100)-directCost)/hourlyValue):0;
    return{price,discount,netPrice,hours,hourlyValue,labor,materials,trips,software,providers,otherCosts,directCost,economicCost,profit,margin,taxRate,taxes,total,minPrice45:minPrice(45),minPrice55:minPrice(55),minPrice60:minPrice(60),maxHours};
  }
  function packageCost(pkg,settings=db.settings){return estimate({...pkg,hourlyValue:settings.hourlyTarget,standUnitCost:settings.standUnitCost,nfcCardUnitCost:settings.nfcCardUnitCost,tripUnitCost:settings.averageTripCost,taxRate:settings.taxRate},settings)}
  function marginSignal(margin,settings=db.settings){
    const value=n(margin),healthy=n(settings.healthyMargin)||55,warning=n(settings.warningMargin)||45;
    if(value>=healthy)return{tone:'green',icon:'✓',label:'Margen saludable.'};
    if(value>=warning)return{tone:'amber',icon:'!',label:'Margen ajustado. Revise precio, horas o costos.'};
    return{tone:'red',icon:'×',label:'Este trabajo puede no ser rentable.'};
  }
  function financialSnapshot(input){
    const result=estimate(input);
    return{capturedAt:now(),price:result.price,discount:result.discount,netPrice:result.netPrice,taxRate:result.taxRate,taxes:result.taxes,total:result.total,estimatedHours:result.hours,hourlyValue:result.hourlyValue,stands:n(input.stands),nfcCards:n(input.nfcCards),trips:n(input.trips),standUnitCost:n(input.standUnitCost??db.settings.standUnitCost),nfcCardUnitCost:n(input.nfcCardUnitCost??db.settings.nfcCardUnitCost),tripUnitCost:n(input.tripUnitCost??db.settings.averageTripCost),software:result.software,providers:result.providers,otherCosts:result.otherCosts,estimatedLaborCost:result.labor,estimatedDirectCost:result.directCost,estimatedEconomicCost:result.economicCost,estimatedProfit:result.profit,estimatedMargin:result.margin};
  }
  function quoteEconomics(q){
    if(q.financialSnapshot)return{...estimate({price:q.financialSnapshot.price,discount:q.financialSnapshot.discount,estimatedHours:q.financialSnapshot.estimatedHours,hourlyValue:q.financialSnapshot.hourlyValue,stands:q.financialSnapshot.stands,nfcCards:q.financialSnapshot.nfcCards,trips:q.financialSnapshot.trips,standUnitCost:q.financialSnapshot.standUnitCost,nfcCardUnitCost:q.financialSnapshot.nfcCardUnitCost,tripUnitCost:q.financialSnapshot.tripUnitCost,software:q.financialSnapshot.software,providers:q.financialSnapshot.providers,otherCosts:q.financialSnapshot.otherCosts,taxRate:q.financialSnapshot.taxRate}),snapshot:q.financialSnapshot};
    const items=q.items||[];
    const price=items.reduce((sum,item)=>sum+n(item.quantity||1)*n(item.price),0);
    const directFromItems=items.reduce((sum,item)=>sum+n(item.quantity||1)*n(item.directCost),0);
    return estimate({price,discount:q.discount,taxRate:q.taxRate,estimatedHours:q.estimatedHours,hourlyValue:q.hourlyValue,stands:q.stands,nfcCards:q.nfcCards,trips:q.trips,software:q.software,providers:q.providers,otherCosts:n(q.otherCosts)+directFromItems});
  }
  function quoteTotals(q){const e=quoteEconomics(q);return{subtotal:e.price,discount:e.discount,beforeTax:e.netPrice,tax:e.taxes,total:e.total,directCost:e.directCost,laborCost:e.labor,economicCost:e.economicCost,profit:e.profit,margin:e.margin}}
  function paymentNet(payment){const amount=n(payment.amount);if(n(payment.taxAmount))return Math.max(0,amount-n(payment.taxAmount));return payment.includesTax?amount/(1+n(payment.taxRate||db.settings.taxRate)/100):amount}
  function normalizeMovementStatus(status){
    const value=String(status||'Pendiente').toLowerCase();
    if(['cobrado','pagado','pagada'].includes(value))return'Pagado';
    if(value==='parcial')return'Parcial';
    if(['cancelado','cancelada'].includes(value))return'Cancelado';
    return'Pendiente';
  }
  function mirrorLegacyMovement(entity,record){
    if(!record?.id)return null;
    const movementType=entity==='payments'?'Ingreso':'Gasto';
    const key=`legacy:${entity}:${record.id}`;
    const data={movementType,sourceType:entity,sourceId:record.id,idempotencyKey:key,clientId:record.clientId||'',projectId:record.projectId||'',quoteId:record.quoteId||'',category:record.category||record.type||(movementType==='Ingreso'?'Venta':'Gasto operativo'),concept:record.concept||record.notes||record.type||record.category||movementType,amount:n(record.amount),status:normalizeMovementStatus(record.status),date:record.actualDate||record.date||record.expectedDate||now().slice(0,10),dueDate:record.expectedDate||record.dueDate||'',paymentMethod:record.method||'',reference:record.reference||'',includesTax:Boolean(record.includesTax),taxAmount:n(record.taxAmount),taxRate:n(record.taxRate||db.settings.taxRate),archived:Boolean(record.archived),demo:Boolean(record.demo)};
    const ix=db.financialMovements.findIndex(item=>item.idempotencyKey===key);
    if(ix>=0)db.financialMovements[ix]={...db.financialMovements[ix],...data,updatedAt:now()};
    else db.financialMovements.unshift(base('mov',data));
    return ix>=0?db.financialMovements[ix]:db.financialMovements[0];
  }
  function upsertFinancialMovement(data){
    const clean={...data,movementType:data.movementType==='Gasto'?'Gasto':'Ingreso',status:normalizeMovementStatus(data.status),amount:Math.max(0,n(data.amount)),date:data.date||now().slice(0,10)};
    if(!clean.amount)throw new Error('Captura un monto mayor a cero.');
    if(clean.idempotencyKey){
      const duplicate=db.financialMovements.find(item=>item.idempotencyKey===clean.idempotencyKey&&item.id!==clean.id);
      if(duplicate)return duplicate;
    }
    return upsert('financialMovements',clean,'mov');
  }
  function movementPaidAmount(movement){
    if(normalizeMovementStatus(movement.status)==='Pagado')return n(movement.amount);
    if(normalizeMovementStatus(movement.status)==='Parcial')return Math.min(n(movement.amount),Math.max(0,n(movement.paidAmount)));
    return 0;
  }
  function financialList(filters={}){
    return list('financialMovements').filter(item=>{
      if(filters.movementType&&item.movementType!==filters.movementType)return false;
      if(filters.status&&normalizeMovementStatus(item.status)!==filters.status)return false;
      if(filters.projectId&&item.projectId!==filters.projectId)return false;
      if(filters.clientId&&item.clientId!==filters.clientId)return false;
      if(filters.month&&monthKey(item.date)!==filters.month)return false;
      return true;
    });
  }
  function financialSummary(month=monthKey()){
    const rows=financialList({month}).filter(item=>normalizeMovementStatus(item.status)!=='Cancelado');
    const incomeRows=rows.filter(item=>item.movementType==='Ingreso');
    const expenseRows=rows.filter(item=>item.movementType==='Gasto');
    const income=incomeRows.reduce((sum,item)=>sum+movementPaidAmount(item),0);
    const expenses=expenseRows.reduce((sum,item)=>sum+movementPaidAmount(item),0);
    const receivable=incomeRows.reduce((sum,item)=>sum+Math.max(0,n(item.amount)-movementPaidAmount(item)),0);
    const payable=expenseRows.reduce((sum,item)=>sum+Math.max(0,n(item.amount)-movementPaidAmount(item)),0);
    const paidSales=incomeRows.filter(item=>movementPaidAmount(item)>0);
    const goal=n(db.settings.monthlyGoal)||18000;
    return{month,income,expenses,profit:income-expenses,receivable,payable,averageTicket:paidSales.length?income/paidSales.length:0,goal,goalPct:goal?Math.min(100,income/goal*100):0,count:rows.length};
  }
  function clientRecord(clientId){
    const client=get('clients',clientId);if(!client)return null;
    const business=get('businesses',client.primaryBusinessId||(client.businessIds||[])[0]);
    return{...business,...client,businessId:business?.id||'',businessName:client.businessName||business?.name||''};
  }
  function clientBalance(clientId){
    const movements=financialList({clientId}).filter(item=>normalizeMovementStatus(item.status)!=='Cancelado');
    const charged=movements.filter(item=>item.movementType==='Ingreso').reduce((sum,item)=>sum+n(item.amount),0);
    const paid=movements.filter(item=>item.movementType==='Ingreso').reduce((sum,item)=>sum+movementPaidAmount(item),0);
    return{charged,paid,pending:Math.max(0,charged-paid)};
  }
  function findClientDuplicate(candidate={},excludeId=''){
    const email=String(candidate.email||'').trim().toLowerCase();
    const phone=String(candidate.phone||'').replace(/\D/g,'');
    return list('clients').find(item=>item.id!==excludeId&&((email&&String(item.email||'').trim().toLowerCase()===email)||(phone&&String(item.phone||'').replace(/\D/g,'')===phone)))||null;
  }
  function recordActivity(action,entity,record,detail=''){
    const item=base('act',{action,entity,recordId:record?.id||'',clientId:record?.clientId||(entity==='clients'?record?.id:''),projectId:record?.projectId||(entity==='projects'?record?.id:''),detail});
    db.activityLog.unshift(item);save();return item;
  }
  function projectEconomics(projectId){
    const project=get('projects',projectId);if(!project)return null;
    const snapshot=project.financialSnapshot||{};
    const agreedNet=n(snapshot.netPrice||project.agreedNetPrice||project.quotedAmount);
    const movements=financialList({projectId}).filter(x=>normalizeMovementStatus(x.status)!=='Cancelado');
    const payments=movements.filter(x=>x.movementType==='Ingreso');
    const collectedGross=payments.reduce((s,x)=>s+movementPaidAmount(x),0);
    const collectedNet=payments.reduce((s,x)=>s+paymentNet({...x,amount:movementPaidAmount(x)}),0);
    const pending=payments.reduce((s,x)=>s+Math.max(0,n(x.amount)-movementPaidAmount(x)),0);
    const entries=list('timeEntries').filter(x=>x.projectId===projectId);
    const actualHours=entries.reduce((s,x)=>s+n(x.minutes)/60,0);
    const actualLaborCost=entries.reduce((s,x)=>s+n(x.minutes)/60*n(x.hourlyRate||snapshot.hourlyValue||db.settings.hourlyTarget),0);
    const expenses=movements.filter(x=>x.movementType==='Gasto');
    const actualExpenses=expenses.reduce((s,x)=>s+n(x.amount),0);
    const paidExpenses=expenses.reduce((s,x)=>s+movementPaidAmount(x),0);
    const inventoryUsage=list('inventoryMovements').filter(x=>x.projectId===projectId&&n(x.quantity)<0);
    const actualMaterials=inventoryUsage.reduce((s,x)=>s+Math.abs(n(x.quantity))*n(x.unitCostSnapshot),0);
    const actualDirectCost=actualExpenses+actualMaterials;
    const actualEconomicCost=actualLaborCost+actualDirectCost;
    const recognizedNet=Math.min(agreedNet||collectedNet,collectedNet);
    const actualProfit=recognizedNet-actualEconomicCost;
    const actualMargin=recognizedNet?actualProfit/recognizedNet*100:0;
    const estimatedHours=n(snapshot.estimatedHours||project.estimatedHours);
    const estimatedLaborCost=n(snapshot.estimatedLaborCost||project.estimatedLaborCost);
    const estimatedDirectCost=n(snapshot.estimatedDirectCost||project.estimatedDirectCost);
    const estimatedEconomicCost=n(snapshot.estimatedEconomicCost||estimatedLaborCost+estimatedDirectCost);
    const estimatedProfit=n(snapshot.estimatedProfit||agreedNet-estimatedEconomicCost);
    const estimatedMargin=n(snapshot.estimatedMargin||(agreedNet?estimatedProfit/agreedNet*100:0));
    return{agreedNet,collectedGross,collectedNet,pending,estimatedHours,estimatedLaborCost,estimatedDirectCost,estimatedEconomicCost,estimatedProfit,estimatedMargin,actualHours,actualLaborCost,actualExpenses,actualMaterials,actualDirectCost,actualEconomicCost,recognizedNet,actualProfit,actualMargin,flowReal:collectedGross-paidExpenses,hourDeviation:actualHours-estimatedHours,costDeviation:actualEconomicCost-estimatedEconomicCost,profitDeviation:actualProfit-estimatedProfit,marginDeviation:actualMargin-estimatedMargin,effectiveHourlyIncome:actualHours?recognizedNet/actualHours:0,effectiveHourlyProfit:actualHours?actualProfit/actualHours:0};
  }
  const projectProfit=projectId=>projectEconomics(projectId);

  function calculations(){
    const mk=monthKey();
    const financial=financialSummary(mk);
    const paid=financialList({month:mk,movementType:'Ingreso'}).filter(item=>movementPaidAmount(item)>0);
    const times=list('timeEntries').filter(x=>monthKey(x.date)===mk);
    const income=financial.income,incomeNet=paid.reduce((s,x)=>s+paymentNet({...x,amount:movementPaidAmount(x)}),0),spent=financial.expenses,hours=times.reduce((s,x)=>s+n(x.minutes)/60,0);
    const receivable=financial.receivable;
    const projectResults=list('projects').map(p=>projectEconomics(p.id)).filter(Boolean);
    const estimatedProfit=projectResults.reduce((s,x)=>s+x.estimatedProfit,0),actualProfit=projectResults.reduce((s,x)=>s+x.actualProfit,0);
    const margins=projectResults.filter(x=>x.recognizedNet>0).map(x=>x.actualMargin);
    const marginAverage=margins.length?margins.reduce((s,x)=>s+x,0)/margins.length:0;
    const signals=projectResults.map(x=>marginSignal(x.actualMargin));
    const goal=n(db.settings.monthlyGoal)||18000,totalGoal=n(db.settings.totalMonthlyIncomeGoal)||40000,employment=n(db.settings.founderEmploymentIncome)||22000;
    const effectiveBase=db.settings.effectiveHourlyBasis==='profit'?actualProfit:incomeNet;
    return{income,incomeNet,spent,net:income-spent,hours,effectiveHourly:hours?effectiveBase/hours:0,receivable,goal,goalPct:Math.min(100,income/goal*100),estimatedProfit,actualProfit:income-spent,projectActualProfit:actualProfit,marginAverage,greenProjects:signals.filter(x=>x.tone==='green').length,amberProjects:signals.filter(x=>x.tone==='amber').length,redProjects:signals.filter(x=>x.tone==='red').length,averageTicket:financial.averageTicket,totalPersonalIncome:employment+income,totalGoal,totalGoalPct:Math.min(100,(employment+income)/totalGoal*100),packagesSold:list('projects').filter(p=>p.packageId).length};
  }
  function projection(mix={}){
    let projects=0,revenue=0,hours=0,directCost=0,economicCost=0,profit=0,trips=0,stands=0,nfcCards=0;
    list('packages').forEach(pkg=>{const quantity=Math.max(0,n(mix[pkg.id]));if(!quantity)return;const cost=packageCost(pkg);projects+=quantity;revenue+=cost.netPrice*quantity;hours+=cost.hours*quantity;directCost+=cost.directCost*quantity;economicCost+=cost.economicCost*quantity;profit+=cost.profit*quantity;trips+=n(pkg.trips)*quantity;stands+=n(pkg.stands)*quantity;nfcCards+=n(pkg.nfcCards)*quantity});
    return{projects,revenue,hours,directCost,economicCost,profit,margin:revenue?profit/revenue*100:0,trips,stands,nfcCards,capacity:n(db.settings.monthlyCapacityHours),overCapacity:hours>n(db.settings.monthlyCapacityHours)};
  }
  function validateV50(value){const arr=Array.isArray(value)?value:[value];if(!arr.length)throw new Error('El archivo no contiene revisiones.');arr.forEach((r,i)=>{if(!r||typeof r!=='object'||!r.id||!r.business?.name||typeof r.iqpd!=='number'||!r.pillars)throw new Error(`La revisión ${i+1} no coincide con la exportación de Diagnóstico Quio v50.`)});return arr}
  function importReview(r,businessId){if(db.reviews.some(x=>x.sourceId===r.id||x.id===r.id))throw new Error('Esta revisión ya fue importada.');return upsert('reviews',{sourceId:r.id,sourceSchemaVersion:r.schemaVersion||'18.0',businessId,reviewDate:r.date,iqpd:r.iqpd,level:r.level,pillars:r.pillars,findings:r.findings,recommendation:r.recommendation,plan:r.plan||[],future:r.future||[],verification:r.verification,inventory:r.inventory,answers:r.answers,answerNotes:r.answerNotes,original:r,status:'Registrada'},'rev')}
  function seed(){
    db=emptyDB();db.meta.demo=true;
    const stand=db.inventoryProducts.find(x=>x.sku==='NFC-STAND');stand.stock=8;stand.minStock=3;
    const card=db.inventoryProducts.find(x=>x.sku==='NFC-CARD');card.stock=10;card.minStock=3;
    const business=upsert('businesses',{name:'Café Mirador · EJEMPLO',industry:'Cafetería',city:'Hermosillo',state:'Sonora',phone:'662 000 0000',email:'ejemplo@quio.mx',status:'Activo',demo:true},'biz');
    const customer=upsert('clients',{name:'Mariana Torres · EJEMPLO',businessIds:[business.id],phone:'662 000 0000',email:'ejemplo@quio.mx',preferredContact:'WhatsApp',status:'Activo',demo:true},'cli');
    upsert('prospects',{businessName:'Taller Norte · EJEMPLO',contactName:'Luis Pérez',industry:'Servicio automotriz',stage:'Contactado',phone:'662 000 1111',nextFollowup:new Date(Date.now()+86400000).toISOString().slice(0,10),status:'Activo',demo:true},'pro');
    const pkg=get('packages','pkg_esencial'),snapshot=financialSnapshot(pkg);
    const quote=upsert('quotes',{folio:'COT-001-EJEMPLO',clientId:customer.id,businessId:business.id,packageId:pkg.id,status:'Aceptada',validUntil:new Date(Date.now()+7*86400000).toISOString().slice(0,10),taxRate:16,discount:0,items:[{description:pkg.name,quantity:1,price:pkg.price,directCost:snapshot.estimatedDirectCost}],financialSnapshot:snapshot,demo:true},'quo');
    const project=upsert('projects',{name:'Presencia digital Café Mirador · EJEMPLO',clientId:customer.id,businessId:business.id,quoteId:quote.id,packageId:pkg.id,financialSnapshot:snapshot,status:'En curso',startDate:new Date().toISOString().slice(0,10),dueDate:new Date(Date.now()+14*86400000).toISOString().slice(0,10),progress:35,nextStep:'Confirmar accesos',checklist:[{text:'Confirmar alcance',done:true},{text:'Solicitar accesos',done:false}],demo:true},'prj');
    upsert('payments',{clientId:customer.id,projectId:project.id,type:'Anticipo',amount:1995,status:'Cobrado',actualDate:new Date().toISOString().slice(0,10),method:'Transferencia',includesTax:false,demo:true},'pay');
    upsert('payments',{clientId:customer.id,projectId:project.id,type:'Saldo',amount:1995,status:'Pendiente',expectedDate:new Date(Date.now()+10*86400000).toISOString().slice(0,10),demo:true},'pay');
    upsert('expenses',{projectId:project.id,category:'Transporte',amount:150,date:new Date().toISOString().slice(0,10),status:'Pagado',notes:'Traslado de ejemplo',demo:true},'exp');
    upsert('timeEntries',{projectId:project.id,clientId:customer.id,date:new Date().toISOString().slice(0,10),minutes:120,description:'Optimización inicial · EJEMPLO',hourlyRate:500,demo:true},'tim');
    upsert('followups',{clientId:customer.id,date:new Date(Date.now()-86400000).toISOString().slice(0,10),reason:'Confirmar accesos',channel:'WhatsApp',status:'Pendiente',demo:true},'fol');
    save();return db;
  }
  return{KEY,PRE_V8_BACKUP_KEY,PRE_V9_BACKUP_KEY,PRE_V10_BACKUP_KEY,SCHEMA,ENTITIES,now,id,base,db:()=>db,save,list,get,upsert,archive,restore,remove,replace,merge,money,date,monthKey,round,estimate,packageCost,marginSignal,financialSnapshot,quoteEconomics,quoteTotals,projectEconomics,projectProfit,calculations,projection,paymentNet,normalizeMovementStatus,upsertFinancialMovement,movementPaidAmount,financialList,financialSummary,clientRecord,clientBalance,findClientDuplicate,recordActivity,validateV50,importReview,seed,emptyDB,migrate};
})();
