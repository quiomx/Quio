'use strict';
window.QuioCore=(()=>{
  const KEY='quio_management_v1';
  const PRE_V8_BACKUP_KEY='quio_management_pre_v8_backup';
  const SCHEMA='2.0.0';
  const ENTITIES=['prospects','clients','businesses','contacts','reviews','quotes','services','packages','projects','activities','deliverables','payments','expenses','timeEntries','inventoryProducts','inventoryMovements','followups','files'];
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
      id:'pkg_esencial',name:'Quio Esencial',price:3990,estimatedHours:2.5,stands:1,nfcCards:1,trips:1,
      software:0,providers:0,otherCosts:0,status:'Activo',order:1,
      contents:['Revisión Quio','Informe Quio','Mejora de Google Business y Google Maps','Corrección y optimización de información del perfil','Mejora del proceso para solicitar reseñas','Un stand NFC','Una tarjeta NFC','Guía sencilla de uso','Un traslado promedio']
    },
    {
      id:'pkg_intermedio',name:'Quio Intermedio',price:6990,estimatedHours:5.5,stands:1,nfcCards:1,trips:1,
      software:0,providers:0,otherCosts:0,status:'Activo',order:2,
      contents:['Todo lo incluido en Quio Esencial','Sitio web profesional informativo de una página','Formulario o medio claro de contacto','Botón o enlace de WhatsApp','Publicación inicial en GitHub Pages o equivalente','Configuración inicial del dominio adquirido por el cliente'],
      note:'El dominio lo compra y paga directamente el cliente.'
    },
    {
      id:'pkg_avanzado',name:'Quio Avanzado',price:11990,estimatedHours:8,stands:1,nfcCards:1,trips:1,
      software:0,providers:0,otherCosts:0,status:'Activo',order:3,
      contents:['Todo lo incluido en Quio Intermedio','Agenda de citas en línea','Configuración y adaptación del flujo de citas','Quio Control o solución sencilla acordada','Configuración y entrega']
    }
  ].map(p=>({...p,createdAt:now(),updatedAt:now(),archived:false}));

  function defaultSettings(){
    return {
      companyName:'Quio',currency:'MXN',monthlyGoal:18000,annualGoal:216000,
      founderEmploymentIncome:22000,totalMonthlyIncomeGoal:40000,hourlyTarget:500,
      standUnitCost:143,nfcCardUnitCost:143,averageTripCost:150,healthyMargin:55,
      warningMargin:45,monthlyCapacityHours:80,effectiveHourlyBasis:'income',taxRate:16,
      expenseCategories:['Materiales','Software','Transporte','Servicios','Proveedores','Otros'],
      inventoryCategories:['Stands','Tarjetas NFC','Elementos QR','Materiales de entrega','Otros'],
      prospectStages:['Nuevo','Contactado','Revisión agendada','Revisión realizada','Propuesta enviada','En decisión','Ganado','No continuó'],
      projectStatuses:['Por iniciar','En curso','En espera del cliente','En revisión','Entregado','Seguimiento','Cerrado','Cancelado'],
      activityTemplates:['Confirmar alcance','Solicitar accesos','Implementar mejoras','Revisión interna','Entrega al cliente'],
      lowStockThreshold:1
    };
  }
  function emptyDB(){
    const db={schemaVersion:SCHEMA,createdAt:now(),updatedAt:now(),meta:{demo:false,migratedToV8At:null},settings:defaultSettings(),services:defaultServices,packages:defaultPackages()};
    ENTITIES.forEach(k=>{if(!db[k])db[k]=[]});
    return db;
  }
  function ensureInventory(db){
    const wanted=[
      {name:'Stand NFC',sku:'NFC-STAND',category:'Stands',unitCost:n(db.settings.standUnitCost),stock:0,minStock:2},
      {name:'Tarjeta NFC',sku:'NFC-CARD',category:'Tarjetas NFC',unitCost:n(db.settings.nfcCardUnitCost),stock:0,minStock:2}
    ];
    wanted.forEach(product=>{
      const current=db.inventoryProducts.find(x=>x.sku===product.sku);
      if(!current)db.inventoryProducts.push(base('inv',{...product,status:'Activo'}));
      else if(!n(current.unitCost))current.unitCost=product.unitCost;
    });
  }
  function migrate(raw){
    const source=raw&&typeof raw==='object'?raw:null;
    const wasPreV8=source&&source.schemaVersion!==SCHEMA;
    if(wasPreV8&&!localStorage.getItem(PRE_V8_BACKUP_KEY)){
      try{localStorage.setItem(PRE_V8_BACKUP_KEY,JSON.stringify({...source,automaticBackupAt:now()}))}catch(error){console.warn('No fue posible crear el respaldo previo a v8.',error)}
    }
    const db={...emptyDB(),...(source||{})};
    ENTITIES.forEach(k=>db[k]=Array.isArray(db[k])?db[k]:[]);
    const inheritedSettings={...(source?.settings||{})};
    if(inheritedSettings.hourlyTarget==null||n(inheritedSettings.hourlyTarget)===350)inheritedSettings.hourlyTarget=500;
    db.settings={...defaultSettings(),...inheritedSettings};
    defaultServices.forEach(service=>{
      const existing=db.services.find(item=>item.name===service.name||item.id===service.id);
      if(!existing){db.services.push({...service});return}
      if(n(existing.basePrice)===0&&n(service.basePrice)>0)existing.basePrice=service.basePrice;
      if(n(existing.directCost)===0&&n(service.directCost)>0)existing.directCost=service.directCost;
    });
    const initialPackages=defaultPackages();
    initialPackages.forEach(pkg=>{if(!db.packages.some(x=>x.id===pkg.id))db.packages.push(pkg)});
    ensureInventory(db);
    db.meta={demo:false,...(db.meta||{}),migratedToV8At:db.meta?.migratedToV8At||(wasPreV8?now():null),preV8BackupKey:wasPreV8?PRE_V8_BACKUP_KEY:db.meta?.preV8BackupKey};
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
    save();return ix>=0?db[entity][ix]:db[entity][0];
  }
  function archive(entity,recordId){const r=get(entity,recordId);if(!r)return false;if(!r.archived)r.statusBeforeArchive=r.status;r.archived=true;r.status='archived';r.updatedAt=now();save();return true}
  function restore(entity,recordId){const r=get(entity,recordId);if(!r)return false;r.archived=false;r.status=r.statusBeforeArchive||(entity==='followups'?'Pendiente':'Activo');delete r.statusBeforeArchive;r.updatedAt=now();save();return true}
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
  function projectEconomics(projectId){
    const project=get('projects',projectId);if(!project)return null;
    const snapshot=project.financialSnapshot||{};
    const agreedNet=n(snapshot.netPrice||project.agreedNetPrice||project.quotedAmount);
    const payments=list('payments').filter(x=>x.projectId===projectId&&x.status!=='Cancelado');
    const collectedGross=payments.filter(x=>x.status==='Cobrado').reduce((s,x)=>s+n(x.amount),0);
    const collectedNet=payments.filter(x=>x.status==='Cobrado').reduce((s,x)=>s+paymentNet(x),0);
    const pending=payments.filter(x=>x.status!=='Cobrado').reduce((s,x)=>s+n(x.amount),0);
    const entries=list('timeEntries').filter(x=>x.projectId===projectId);
    const actualHours=entries.reduce((s,x)=>s+n(x.minutes)/60,0);
    const actualLaborCost=entries.reduce((s,x)=>s+n(x.minutes)/60*n(x.hourlyRate||snapshot.hourlyValue||db.settings.hourlyTarget),0);
    const expenses=list('expenses').filter(x=>x.projectId===projectId);
    const actualExpenses=expenses.reduce((s,x)=>s+n(x.amount),0);
    const paidExpenses=expenses.filter(x=>!x.status||x.status==='Pagado'||x.status==='Pagada').reduce((s,x)=>s+n(x.amount),0);
    const movements=list('inventoryMovements').filter(x=>x.projectId===projectId&&n(x.quantity)<0);
    const actualMaterials=movements.reduce((s,x)=>s+Math.abs(n(x.quantity))*n(x.unitCostSnapshot),0);
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
    const paid=list('payments').filter(p=>p.status==='Cobrado'&&monthKey(p.actualDate||p.date)===mk);
    const expenses=list('expenses').filter(x=>monthKey(x.date)===mk&&(!x.status||x.status==='Pagado'||x.status==='Pagada'));
    const times=list('timeEntries').filter(x=>monthKey(x.date)===mk);
    const income=paid.reduce((s,x)=>s+n(x.amount),0),incomeNet=paid.reduce((s,x)=>s+paymentNet(x),0),spent=expenses.reduce((s,x)=>s+n(x.amount),0),hours=times.reduce((s,x)=>s+n(x.minutes)/60,0);
    const receivable=list('payments').filter(p=>p.status!=='Cobrado'&&p.status!=='Cancelado').reduce((s,x)=>s+n(x.amount),0);
    const projectResults=list('projects').map(p=>projectEconomics(p.id)).filter(Boolean);
    const estimatedProfit=projectResults.reduce((s,x)=>s+x.estimatedProfit,0),actualProfit=projectResults.reduce((s,x)=>s+x.actualProfit,0);
    const margins=projectResults.filter(x=>x.recognizedNet>0).map(x=>x.actualMargin);
    const marginAverage=margins.length?margins.reduce((s,x)=>s+x,0)/margins.length:0;
    const signals=projectResults.map(x=>marginSignal(x.actualMargin));
    const goal=n(db.settings.monthlyGoal)||18000,totalGoal=n(db.settings.totalMonthlyIncomeGoal)||40000,employment=n(db.settings.founderEmploymentIncome)||22000;
    const effectiveBase=db.settings.effectiveHourlyBasis==='profit'?actualProfit:incomeNet;
    return{income,incomeNet,spent,net:income-spent,hours,effectiveHourly:hours?effectiveBase/hours:0,receivable,goal,goalPct:Math.min(100,incomeNet/goal*100),estimatedProfit,actualProfit,marginAverage,greenProjects:signals.filter(x=>x.tone==='green').length,amberProjects:signals.filter(x=>x.tone==='amber').length,redProjects:signals.filter(x=>x.tone==='red').length,averageTicket:paid.length?incomeNet/paid.length:0,totalPersonalIncome:employment+incomeNet,totalGoal,totalGoalPct:Math.min(100,(employment+incomeNet)/totalGoal*100),packagesSold:list('projects').filter(p=>p.packageId).length};
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
  return{KEY,PRE_V8_BACKUP_KEY,SCHEMA,ENTITIES,now,id,base,db:()=>db,save,list,get,upsert,archive,restore,replace,merge,money,date,monthKey,round,estimate,packageCost,marginSignal,financialSnapshot,quoteEconomics,quoteTotals,projectEconomics,projectProfit,calculations,projection,paymentNet,validateV50,importReview,seed,emptyDB,migrate};
})();
