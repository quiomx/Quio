'use strict';
window.QuioOperations=(()=>{
  const C=window.QuioCore;
  const $=selector=>document.querySelector(selector);
  const $$=selector=>[...document.querySelectorAll(selector)];
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const today=()=>new Date().toISOString().slice(0,10);
  let clientQuery='',clientStatus='',clientFollowup='',financeTab='movements',settingsTab='quio',clientDelegationBound=false;
  const badge=(value,tone='')=>`<span class="badge ${tone||statusTone(value)}">${esc(value||'Sin estado')}</span>`;
  const statusTone=value=>/venc|rechaz|cancel|bloquead/i.test(value||'')?'red':/pagad|aceptad|complet|activo|ganad/i.test(value||'')?'green':/pend|parcial|espera|prospect|contact/i.test(value||'')?'amber':'';
  const metric=(label,value,note='',tone='')=>`<article class="metric operational-metric ${tone}"><span>${esc(label)}</span><strong>${value}</strong>${note?`<small>${esc(note)}</small>`:''}</article>`;
  const head=(title,description,actions='')=>`<div class="page-head"><div><h2>${esc(title)}</h2><p>${esc(description)}</p></div><div class="toolbar no-print">${actions}</div></div>`;
  const empty=(title='No hay registros todavía.',text='Crea el primero para comenzar.')=>`<div class="empty"><strong>${esc(title)}</strong><span>${esc(text)}</span></div>`;
  const field=(name,label,value='',type='text',attrs='',full=false)=>`<div class="field ${full?'full':''}"><label for="f_${name}">${esc(label)}</label><input id="f_${name}" name="${esc(name)}" type="${type}" value="${esc(value)}" ${attrs}></div>`;
  const textarea=(name,label,value='',rows=3)=>`<div class="field full"><label for="f_${name}">${esc(label)}</label><textarea id="f_${name}" name="${esc(name)}" rows="${rows}">${esc(value)}</textarea></div>`;
  const select=(name,label,values,value='',full=false)=>`<div class="field ${full?'full':''}"><label for="f_${name}">${esc(label)}</label><select id="f_${name}" name="${esc(name)}">${values.map(option=>{const item=typeof option==='object'?option:{value:option,label:option};return`<option value="${esc(item.value)}" ${String(item.value)===String(value)?'selected':''}>${esc(item.label)}</option>`}).join('')}</select></div>`;
  const options=(entity,label='name')=>[{value:'',label:'Sin asociar'},...C.list(entity).map(item=>({value:item.id,label:item[label]||item.businessName||item.folio||item.id}))];
  const clientName=id=>C.clientRecord(id)?.name||'Sin cliente';
  const businessName=id=>C.get('businesses',id)?.name||'Sin negocio';

  function renderDashboard(app){
    const summary=C.financialSummary(),now=today(),soon=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
    const clients=C.list('clients'),quotes=C.list('quotes'),projects=C.list('projects');
    const overdue=C.list('followups').filter(item=>item.status==='Pendiente'&&item.date&&item.date<now);
    const deliveries=projects.filter(item=>item.dueDate&&item.dueDate>=now&&item.dueDate<=soon&&!['Cerrado','Cancelado'].includes(item.status));
    const activeProjects=projects.filter(item=>!['Cerrado','Cancelado'].includes(item.status));
    const pendingQuotes=quotes.filter(item=>['Borrador','Enviada'].includes(item.status));
    const months=[...Array(6)].map((_,index)=>{const date=new Date();date.setMonth(date.getMonth()-(5-index));return C.monthKey(date)});
    const series=months.map(month=>C.financialSummary(month)),max=Math.max(1,...series.flatMap(item=>[item.income,item.expenses]));
    const activities=C.list('activityLog').slice(0,8);
    app.innerHTML=`<section class="page operational-page">${head('Resumen operativo','Lo que necesita tu atención y cómo va Quio hoy.')}
      <div class="metrics metrics-12">
        ${metric('Prospectos',clients.filter(item=>['Prospecto','Contactado'].includes(item.status)).length,'en conversación')}
        ${metric('Clientes activos',clients.filter(item=>item.status==='Cliente activo').length)}
        ${metric('Revisiones',C.list('reviews').length,'historial total')}
        ${metric('Cotizaciones pendientes',pendingQuotes.length,'borrador o enviadas',pendingQuotes.length?'attention':'')}
        ${metric('Proyectos activos',activeProjects.length)}
        ${metric('Por cobrar',C.money(summary.receivable),'saldo pendiente',summary.receivable?'attention':'')}
        ${metric('Ingresos cobrados',C.money(summary.income),'este mes')}
        ${metric('Gastos pagados',C.money(summary.expenses),'este mes')}
        ${metric('Utilidad real',C.money(summary.profit),'cobrado − pagado',summary.profit<0?'attention':'')}
        ${metric('Seguimientos vencidos',overdue.length,'requieren contacto',overdue.length?'attention':'')}
        ${metric('Entregas próximas',deliveries.length,'siguientes 7 días')}
        ${metric('Meta mensual',`${Math.round(summary.goalPct)}%`,`${C.money(summary.income)} de ${C.money(summary.goal)}`)}
      </div>
      <article class="panel quick-panel"><div class="panel-head"><div><h3>Acciones rápidas</h3><p>Lo cotidiano, sin cambiar de módulo.</p></div></div><div class="quick-grid">
        <button class="quick-card" data-new="client"><b>＋</b><span>Nuevo cliente</span></button>
        <button class="quick-card" data-new="followup"><b>↗</b><span>Seguimiento</span></button>
        <button class="quick-card" data-new="quote"><b>◇</b><span>Cotización</span></button>
        <button class="quick-card" data-new="project"><b>□</b><span>Proyecto</span></button>
        <button class="quick-card" data-new="financialMovement"><b>$</b><span>Movimiento</span></button>
      </div></article>
      <div class="dashboard-grid">
        <article class="panel"><div class="panel-head"><div><h3>Ingresos y gastos</h3><p>Últimos seis meses, movimientos pagados.</p></div></div><div class="month-chart">${series.map(item=>`<div class="month-column"><div class="month-bars"><i class="income-bar" style="height:${Math.max(3,item.income/max*100)}%" title="Ingresos ${C.money(item.income)}"></i><i class="expense-bar" style="height:${Math.max(3,item.expenses/max*100)}%" title="Gastos ${C.money(item.expenses)}"></i></div><small>${item.month.slice(5)}</small></div>`).join('')}</div><div class="chart-legend"><span><i class="income-dot"></i> Ingresos</span><span><i class="expense-dot"></i> Gastos</span></div></article>
        <article class="panel"><div class="panel-head"><div><h3>Actividad reciente</h3><p>Cambios importantes en el espacio de trabajo.</p></div></div>${activities.length?activities.map(item=>`<div class="activity-row"><span class="activity-icon">•</span><div><strong>${esc(item.action)}</strong><small>${esc(item.detail||item.entity||'')} · ${C.date(item.createdAt)}</small></div></div>`).join(''):empty('Sin actividad registrada','Los nuevos cambios aparecerán aquí.')}</article>
      </div>
    </section>`;
  }

  function filteredClients(){
    const query=clientQuery.trim().toLowerCase(),now=today();
    return C.list('clients').filter(item=>{
      const record=C.clientRecord(item.id)||item;
      if(clientStatus&&item.status!==clientStatus)return false;
      if(query&&!JSON.stringify(record).toLowerCase().includes(query))return false;
      const followups=C.list('followups').filter(row=>row.clientId===item.id&&row.status==='Pendiente');
      if(clientFollowup==='overdue'&&!followups.some(row=>row.date<now))return false;
      if(clientFollowup==='upcoming'&&!followups.some(row=>row.date>=now))return false;
      if(clientFollowup==='none'&&followups.length)return false;
      return true;
    });
  }
  function clientRowsMarkup(rows=filteredClients()){
    return rows.length?rows.map(item=>{
      const record=C.clientRecord(item.id),balance=C.clientBalance(item.id);
      const next=C.list('followups').filter(row=>row.clientId===item.id&&row.status==='Pendiente').sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];
      return`<button class="client-row" data-client-detail="${item.id}"><span class="client-avatar">${esc((item.name||'?').slice(0,1).toUpperCase())}</span><span><strong>${esc(item.name)}</strong><small>${esc(record?.businessName||'Sin negocio')} · ${esc(item.phone||item.email||'Sin contacto')}</small></span><span>${badge(item.status)}</span><span><strong>${C.money(balance.pending)}</strong><small>pendiente</small></span><span><strong>${next?C.date(next.date):'Al día'}</strong><small>${esc(next?.reason||'sin seguimiento')}</small></span><span aria-hidden="true">→</span></button>`;
    }).join(''):empty('No encontramos clientes','Prueba otros filtros o crea un nuevo registro.');
  }
  function renderClients(app){
    const statuses=C.db().settings.clientStatuses||[];
    app.innerHTML=`<section class="page operational-page">${head('Clientes','Prospectos, clientes, negocios y seguimientos en una sola vista.','<button class="btn primary btn-primary" data-new="client">+ Cliente</button>')}
      <article class="panel filter-panel"><div class="client-filters">
        <label class="filter-search"><span>Buscar</span><input id="clientQuery" value="${esc(clientQuery)}" placeholder="Nombre, negocio, teléfono o correo"></label>
        <label><span>Estado</span><select id="clientStatus"><option value="">Todos</option>${statuses.map(value=>`<option ${value===clientStatus?'selected':''}>${esc(value)}</option>`).join('')}</select></label>
        <label><span>Seguimiento</span><select id="clientFollowup"><option value="">Todos</option><option value="overdue" ${clientFollowup==='overdue'?'selected':''}>Vencido</option><option value="upcoming" ${clientFollowup==='upcoming'?'selected':''}>Próximo</option><option value="none" ${clientFollowup==='none'?'selected':''}>Sin seguimiento</option></select></label>
      </div></article>
      <article class="panel" id="clientResults" aria-live="polite">${clientRowsMarkup()}</article>
    </section>`;
    $('#clientResults').onclick=event=>{const row=event.target.closest('[data-client-detail]');if(row)showClient(row.dataset.clientDetail)};
  }
  function showClient(id){
    const client=C.clientRecord(id);if(!client)return;
    const balance=C.clientBalance(id);
    const reviews=C.list('reviews').filter(item=>item.businessId===client.businessId);
    const quotes=C.list('quotes').filter(item=>item.clientId===id);
    const projects=C.list('projects').filter(item=>item.clientId===id);
    const followups=C.list('followups',{includeArchived:true}).filter(item=>item.clientId===id).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    const activities=C.list('activityLog').filter(item=>item.clientId===id).slice(0,10);
    const dialog=$('#recordDialog');dialog.returnFocus=document.activeElement;$('#recordForm').dataset.kind='read-only';$('#dialogTitle').textContent=client.name;
    $('#dialogBody').innerHTML=`<div class="client-detail-head"><div><p class="eyebrow">${esc(client.status||'CLIENTE')}</p><h3>${esc(client.businessName||'Sin negocio')}</h3><p>${esc(client.phone||'Sin teléfono')} · ${esc(client.email||'Sin correo')}</p></div><div class="client-balance"><span>Saldo pendiente</span><strong>${C.money(balance.pending)}</strong></div></div>
      <div class="toolbar client-actions">
        <button type="button" class="btn" data-client-action="edit:${id}">Editar</button>
        <button type="button" class="btn" data-client-action="followup:${id}">Seguimiento</button>
        <button type="button" class="btn" data-client-action="quote:${id}">Cotización</button>
        <button type="button" class="btn" data-client-action="project:${id}">Proyecto</button>
        <button type="button" class="btn" data-client-action="payment:${id}">Registrar pago</button>
        <button type="button" class="btn primary btn-primary" data-client-action="whatsapp:${id}">WhatsApp</button>
      </div>
      <div class="detail-grid">
        <section><h4>Revisiones (${reviews.length})</h4>${reviews.map(item=>`<p>${C.date(item.reviewDate)} · IQPD <strong>${item.iqpd}/100</strong></p>`).join('')||'<p class="muted">Sin revisiones.</p>'}</section>
        <section><h4>Cotizaciones (${quotes.length})</h4>${quotes.map(item=>`<p><strong>${esc(item.folio)}</strong> · ${badge(item.status)}</p>`).join('')||'<p class="muted">Sin cotizaciones.</p>'}</section>
        <section><h4>Proyectos (${projects.length})</h4>${projects.map(item=>`<p><strong>${esc(item.name)}</strong> · ${badge(item.status)}</p>`).join('')||'<p class="muted">Sin proyectos.</p>'}</section>
        <section><h4>Seguimientos</h4>${followups.slice(0,6).map(item=>`<p>${C.date(item.date)} · ${esc(item.reason)} · ${badge(item.status)}</p>`).join('')||'<p class="muted">Sin seguimientos.</p>'}</section>
      </div>
      <section class="detail-history"><h4>Historial</h4>${activities.map(item=>`<p><strong>${esc(item.action)}</strong><small>${C.date(item.createdAt)} · ${esc(item.detail||'')}</small></p>`).join('')||'<p class="muted">Sin actividad adicional.</p>'}</section>`;
    dialog.showModal();
  }

  function renderProjects(app){
    const rows=C.list('projects').sort((a,b)=>String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999')));
    app.innerHTML=`<section class="page operational-page">${head('Proyectos','Entregables, fechas y siguiente paso sin ruido administrativo.','<button class="btn primary" data-new="project">+ Proyecto</button>')}
      <div class="project-board">${(C.db().settings.projectStatuses||[]).map(status=>`<section class="project-column"><h3>${esc(status)} <span>${rows.filter(item=>item.status===status).length}</span></h3>${rows.filter(item=>item.status===status).map(item=>{const done=(item.checklist||[]).filter(row=>row.done).length,total=(item.checklist||[]).length;return`<article class="project-card"><div>${badge(item.status)}<small>${C.date(item.dueDate)}</small></div><h4>${esc(item.name)}</h4><p>${esc(clientName(item.clientId))}</p><div class="progress"><i style="width:${total?done/total*100:Number(item.progress)||0}%"></i></div><small>${done}/${total} tareas · ${esc(item.nextStep||'Sin próximo paso')}</small><div class="project-card__actions"><button class="btn small btn-sm" data-project="${item.id}">Ver</button><button class="btn small btn-sm" data-edit="projects:${item.id}">Editar</button><button class="btn small btn-sm" data-expedient="project:${item.id}">Documentos</button><details class="project-more"><summary class="btn small btn-sm">Más acciones</summary><div class="project-more__menu"></div></details></div></article>`}).join('')||'<p class="column-empty">Sin proyectos</p>'}</section>`).join('')}</div>
    </section>`;
  }

  function renderFinance(app){
    const summary=C.financialSummary(),movements=C.financialList().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    const receivable=movements.filter(item=>item.movementType==='Ingreso'&&['Pendiente','Parcial'].includes(C.normalizeMovementStatus(item.status)));
    const months=[...Array(12)].map((_,index)=>{const date=new Date();date.setMonth(date.getMonth()-index);return C.financialSummary(C.monthKey(date))});
    const tabs=`<div class="tabs"><button data-finance-tab="movements" class="${financeTab==='movements'?'active':''}">Movimientos</button><button data-finance-tab="receivable" class="${financeTab==='receivable'?'active':''}">Cuentas por cobrar</button><button data-finance-tab="monthly" class="${financeTab==='monthly'?'active':''}">Resumen mensual</button></div>`;
    let body='';
    if(financeTab==='movements')body=`<article class="panel">${movements.length?movements.map(item=>`<div class="finance-movement"><span class="movement-icon ${item.movementType==='Ingreso'?'income':'expense'}">${item.movementType==='Ingreso'?'＋':'−'}</span><span><strong>${esc(item.concept||item.category)}</strong><small>${C.date(item.date)} · ${esc(clientName(item.clientId))}</small></span><span>${badge(C.normalizeMovementStatus(item.status))}</span><span class="${item.movementType==='Ingreso'?'money-in':'money-out'}">${item.movementType==='Ingreso'?'+':'−'}${C.money(item.amount)}</span><span class="row-actions"><button class="btn small" data-edit="financialMovements:${item.id}">Editar</button><button class="btn small" data-archive="financialMovements:${item.id}">Archivar</button></span></div>`).join(''):empty('Sin movimientos','Registra el primer ingreso o gasto.')}</article>`;
    if(financeTab==='receivable')body=`<article class="panel">${receivable.length?receivable.map(item=>`<div class="list-row"><div><strong>${esc(item.concept||'Cobro pendiente')}</strong><small>${esc(clientName(item.clientId))} · vence ${C.date(item.dueDate||item.date)}</small></div>${badge(C.normalizeMovementStatus(item.status))}<strong>${C.money(Math.max(0,Number(item.amount)-C.movementPaidAmount(item)))}</strong><button class="btn small" data-edit="financialMovements:${item.id}">Registrar pago</button></div>`).join(''):empty('No hay cuentas pendientes','Todos los cobros están al día.')}</article>`;
    if(financeTab==='monthly')body=`<article class="panel"><div class="list"><div class="list-row list-heading"><strong>Mes</strong><strong>Ingresos</strong><strong>Gastos</strong><strong>Utilidad</strong></div>${months.map(item=>`<div class="list-row"><strong>${item.month}</strong><span class="money-in">${C.money(item.income)}</span><span class="money-out">${C.money(item.expenses)}</span><strong>${C.money(item.profit)}</strong></div>`).join('')}</div></article>`;
    app.innerHTML=`<section class="page operational-page">${head('Finanzas','Una sola fuente para ingresos, gastos y cuentas pendientes.','<button class="btn primary" data-new="financialMovement">+ Movimiento</button>')}
      <div class="metrics finance-summary">${metric('Ingresos cobrados',C.money(summary.income),'este mes')}${metric('Gastos pagados',C.money(summary.expenses),'este mes')}${metric('Utilidad',C.money(summary.profit),'ingresos − gastos')}${metric('Por cobrar',C.money(summary.receivable),'saldo pendiente')}</div>
      ${tabs}${body}
    </section>`;
  }

  function renderSettings(app){
    const settings=C.db().settings,packages=C.list('packages').sort((a,b)=>a.order-b.order);
    const tabs=[['quio','Datos de Quio'],['packages','Paquetes'],['catalogs','Catálogos'],['financial','Parámetros financieros'],['backup','Respaldo']];
    let body='';
    if(settingsTab==='quio')body=`<form class="panel settings-form" data-settings-form="quio"><div class="form-grid">${field('companyName','Nombre comercial',settings.companyName,'text','required')}${field('legalName','Razón social',settings.legalName)}${field('taxId','RFC',settings.taxId)}${field('quioResponsible','Responsable',settings.quioResponsible)}${field('quioEmail','Correo',settings.quioEmail,'email')}${field('quioPhone','Teléfono',settings.quioPhone,'tel')}${field('quioWebsite','Sitio web',settings.quioWebsite,'url')}${textarea('quioAddress','Dirección',settings.quioAddress)}${textarea('quoteFooter','Pie de cotización',settings.quoteFooter)}</div><div class="dialog-actions"><button class="btn primary">Guardar datos</button></div></form>`;
    if(settingsTab==='packages')body=`<div class="package-grid">${packages.map(item=>`<article class="panel package-card"><p class="eyebrow">PAQUETE QUIO</p><h3>${esc(item.name)}</h3><strong class="package-price">${C.money(item.price)} MXN</strong><p>${esc(item.description||'')}</p><small>${item.estimatedHours||0} h · ${Number(item.stands||0)+Number(item.nfcCards||0)} NFC</small><button class="btn full-btn" data-edit="packages:${item.id}">Editar</button></article>`).join('')}</div>`;
    if(settingsTab==='catalogs')body=`<form class="panel settings-form" data-settings-form="catalogs"><div class="form-grid">${textarea('clientStatuses','Estados de cliente',(settings.clientStatuses||[]).join('\n'),7)}${textarea('projectStatuses','Estados de proyecto',(settings.projectStatuses||[]).join('\n'),7)}${textarea('incomeCategories','Categorías de ingreso',(settings.incomeCategories||[]).join('\n'),7)}${textarea('expenseCategories','Categorías de gasto',(settings.expenseCategories||[]).join('\n'),7)}${textarea('paymentMethods','Métodos de pago',(settings.paymentMethods||[]).join('\n'),6)}${textarea('followupTypes','Tipos de seguimiento',(settings.followupTypes||[]).join('\n'),6)}</div><div class="dialog-actions"><button class="btn primary">Guardar catálogos</button></div></form>`;
    if(settingsTab==='financial')body=`<form class="panel settings-form" data-settings-form="financial"><div class="form-grid">${field('monthlyGoal','Meta mensual',settings.monthlyGoal,'number','min="0"')}${field('taxRate','IVA predeterminado (%)',settings.taxRate,'number','min="0" step="0.01"')}${field('hourlyTarget','Valor por hora',settings.hourlyTarget,'number','min="0"')}${field('accountantMonthly','Contador mensual',settings.accountantMonthly,'number','min="0"')}${field('chatgptMonthly','ChatGPT mensual',settings.chatgptMonthly,'number','min="0"')}${field('domainMonthly','Dominio mensual',settings.domainMonthly,'number','min="0"')}${field('fixedMonthlyCosts','Costos fijos mensuales',settings.fixedMonthlyCosts,'number','min="0"')}${field('nfcPerClient','NFC por cliente',settings.nfcPerClient,'number','min="0"')}${field('fuelPerClient','Combustible por cliente',settings.fuelPerClient,'number','min="0"')}${field('variablePerClient','Costo variable por cliente',settings.variablePerClient,'number','min="0"')}${field('nfcStock','Stock NFC disponible',settings.nfcStock,'number','min="0"')}</div><div class="dialog-actions"><button class="btn primary">Guardar parámetros</button></div></form>`;
    if(settingsTab==='backup'){const report=C.db().meta?.v10MigrationReport;body=`<div class="dashboard-grid"><article class="panel"><h3>Respaldo e intercambio</h3><p>Exporta una copia completa antes de cambios importantes.</p><div class="toolbar"><button class="btn primary" data-action="backup">Exportar JSON</button><button class="btn" data-action="restore">Restaurar</button><button class="btn" data-action="merge">Fusionar</button><button class="btn" data-action="csv">Exportar CSV</button></div></article><article class="panel"><h3>Migración V10</h3>${report?`<p>Procesada ${C.date(report.ranAt)}.</p><div class="migration-summary"><span>Clientes <b>${report.before.clients} → ${report.after.clients}</b></span><span>Movimientos <b>${report.before.payments+report.before.expenses} → ${report.after.financialMovements}</b></span><span>Seguimientos huérfanos <b>${report.orphanedFollowups}</b></span></div>`:'<p class="muted">Esta base ya inició en el esquema V10.</p>'}<p class="helper">Los datos históricos de tiempo e inventario permanecen en el respaldo y en los proyectos relacionados.</p></article></div>`}
    app.innerHTML=`<section class="page operational-page">${head('Configuración','Solo las decisiones que realmente necesitas mantener.')}<div class="tabs settings-tabs">${tabs.map(([key,label])=>`<button data-settings-tab="${key}" class="${settingsTab===key?'active':''}">${label}</button>`).join('')}</div>${body}</section>`;
  }

  function formDefinition(kind,record={}){
    if(kind==='client')return{entity:'clients',kind:'client-unified',title:'Cliente',html:()=>field('name','Nombre de contacto',record.name,'text','required',true)+field('businessName','Nombre del negocio',record.businessName||(record.primaryBusinessId||(record.businessIds||[])[0]?businessName(record.primaryBusinessId||(record.businessIds||[])[0]):''),'text','required',true)+field('industry','Giro',record.industry)+field('phone','Teléfono',record.phone,'tel')+field('email','Correo',record.email,'email')+select('preferredContact','Contacto preferido',['WhatsApp','Llamada','Correo','Otro'],record.preferredContact||'WhatsApp')+select('status','Estado',C.db().settings.clientStatuses||[],record.status||'Prospecto')+field('source','Origen',record.source)+field('lastContact','Último contacto',record.lastContact,'date')+field('nextFollowup','Próximo seguimiento',record.nextFollowup,'date')+field('mapsUrl','Google Maps',record.mapsUrl,'url')+field('websiteUrl','Sitio web',record.websiteUrl,'url')+textarea('notes','Notas',record.notes)};
    if(kind==='followup')return{entity:'followups',kind:'followup',title:'Seguimiento',html:()=>select('clientId','Cliente',options('clients'),record.clientId,'',true)+select('projectId','Proyecto',options('projects'),record.projectId)+field('contactDate','Fecha de contacto',record.contactDate||today(),'date','required')+field('date','Próxima fecha',record.date||today(),'date','required')+field('reason','Motivo',record.reason,'text','required',true)+select('channel','Canal',C.db().settings.followupTypes||[],record.channel||'WhatsApp')+select('status','Estado',['Pendiente','Realizado'],record.status||'Pendiente')+field('result','Resultado',record.result,'text','',true)+textarea('notes','Notas',record.notes)};
    if(kind==='project')return{entity:'projects',kind:'project-simple',title:'Proyecto',html:()=>field('name','Nombre del proyecto',record.name,'text','required',true)+select('clientId','Cliente',options('clients'),record.clientId,'',true)+select('quoteId','Cotización',options('quotes','folio'),record.quoteId)+select('packageId','Paquete',options('packages'),record.packageId)+select('status','Estado',C.db().settings.projectStatuses||[],record.status||'Por iniciar')+field('startDate','Inicio',record.startDate||today(),'date')+field('dueDate','Fecha compromiso',record.dueDate,'date')+field('nextStep','Próximo paso',record.nextStep,'text','',true)+field('googleBusinessUrl','Google Business',record.googleBusinessUrl,'url')+field('websiteUrl','Sitio web',record.websiteUrl,'url')+field('reviewRequestUrl','Enlace para reseñas',record.reviewRequestUrl,'url')+textarea('checklistText','Checklist',(record.checklist||C.db().settings.activityTemplates||[]).map(item=>typeof item==='string'?item:item.text).join('\n'),8)+textarea('notes','Notas',record.notes)};
    if(kind==='financialMovement')return{entity:'financialMovements',kind:'financial-movement',title:'Movimiento',html:()=>select('movementType','Tipo',['Ingreso','Gasto'],record.movementType||'Ingreso')+field('concept','Concepto',record.concept||'Pago de cliente','text','required',true)+select('category','Categoría',[...(C.db().settings.incomeCategories||[]),...(C.db().settings.expenseCategories||[])],record.category)+field('amount','Monto',record.amount||0,'number','required min="0.01" step="0.01"')+select('status','Estado',['Pendiente','Parcial','Pagado','Cancelado'],C.normalizeMovementStatus(record.status))+field('paidAmount','Monto pagado',record.paidAmount||0,'number','min="0" step="0.01"')+field('date','Fecha',record.date||today(),'date','required')+field('dueDate','Fecha límite',record.dueDate,'date')+select('paymentMethod','Método',C.db().settings.paymentMethods||[],record.paymentMethod)+select('clientId','Cliente',options('clients'),record.clientId)+select('projectId','Proyecto',options('projects'),record.projectId)+select('quoteId','Cotización',options('quotes','folio'),record.quoteId)+field('reference','Referencia',record.reference)+textarea('notes','Notas',record.notes)};
    return null;
  }
  function handleForm(kind,data,id){
    if(kind==='client-unified'){
      const duplicate=C.findClientDuplicate(data,id);
      if(duplicate)throw new Error(`Ya existe un cliente con ese correo o teléfono: ${duplicate.name}.`);
      const current=id?C.get('clients',id):null;
      let business=C.get('businesses',current?.primaryBusinessId||(current?.businessIds||[])[0]);
      const businessData={id:business?.id,name:data.businessName,industry:data.industry,phone:data.phone,email:data.email,mapsUrl:data.mapsUrl,websiteUrl:data.websiteUrl,status:data.status==='Cliente perdido'?'Inactivo':'Activo'};
      business=C.upsert('businesses',businessData,'biz');
      const client=C.upsert('clients',{id:id||undefined,name:data.name,businessName:data.businessName,industry:data.industry,phone:data.phone,email:data.email,preferredContact:data.preferredContact,status:data.status,source:data.source,lastContact:data.lastContact,nextFollowup:data.nextFollowup,mapsUrl:data.mapsUrl,websiteUrl:data.websiteUrl,notes:data.notes,primaryBusinessId:business.id,businessIds:[...new Set([...(current?.businessIds||[]),business.id])]},'cli');
      C.recordActivity(id?'Cliente actualizado':'Cliente creado','clients',client,data.businessName);
      if(data.nextFollowup&&!C.list('followups').some(item=>item.clientId===client.id&&item.date===data.nextFollowup&&item.status==='Pendiente'))C.upsert('followups',{clientId:client.id,date:data.nextFollowup,reason:'Seguimiento general',channel:data.preferredContact||'WhatsApp',status:'Pendiente'},'fol');
      return true;
    }
    if(kind==='followup'){
      if(id)data.id=id;
      const followup=C.upsert('followups',data,'fol');
      if(data.clientId){
        C.upsert('clients',{id:data.clientId,lastContact:data.contactDate||today(),nextFollowup:data.date||''});
        C.recordActivity(id?'Seguimiento actualizado':'Seguimiento registrado','followups',followup,data.result||data.reason);
      }
      return true;
    }
    if(kind==='financial-movement'){
      if(id)data.id=id;
      ['amount','paidAmount'].forEach(key=>data[key]=Number(data[key])||0);
      if(!id)data.idempotencyKey=data.idempotencyKey||`manual:${data.clientId||'none'}:${data.projectId||'none'}:${data.quoteId||'none'}:${data.amount}:${data.date}:${String(data.reference||data.concept).trim().toLowerCase()}`;
      const movement=C.upsertFinancialMovement(data);
      C.recordActivity(id?'Movimiento actualizado':'Movimiento registrado','financialMovements',movement,`${movement.movementType}: ${C.money(movement.amount)}`);
      return true;
    }
    if(kind==='project-simple'){
      if(id)data.id=id;
      if(!id&&data.quoteId&&C.list('projects').some(project=>project.quoteId===data.quoteId))throw new Error('Esta cotización ya tiene un proyecto relacionado.');
      const current=id?C.get('projects',id):null;
      const lines=String(data.checklistText||'').split(/\r?\n/).map(value=>value.trim()).filter(Boolean);
      data.checklist=lines.map(text=>({text,done:Boolean((current?.checklist||[]).find(item=>item.text===text)?.done)}));
      data.progress=data.checklist.length?Math.round(data.checklist.filter(item=>item.done).length/data.checklist.length*100):0;
      delete data.checklistText;
      const client=C.clientRecord(data.clientId);data.businessId=client?.businessId||current?.businessId||'';
      const project=C.upsert('projects',data,'prj');
      C.recordActivity(id?'Proyecto actualizado':'Proyecto creado','projects',project,project.name);
      if(project.clientId)C.upsert('clients',{id:project.clientId,status:['Entregado','Seguimiento','Cerrado'].includes(project.status)?'Proyecto entregado':'Proyecto en desarrollo'});
      return true;
    }
    return false;
  }

  function saveSettings(form){
    const data=Object.fromEntries(new FormData(form).entries()),settings=C.db().settings,type=form.dataset.settingsForm;
    if(type==='catalogs')Object.keys(data).forEach(key=>settings[key]=String(data[key]).split(/\r?\n/).map(value=>value.trim()).filter(Boolean));
    else{Object.entries(data).forEach(([key,value])=>settings[key]=type==='financial'?Number(value)||0:value)}
    C.save();return true;
  }
  function bindActions(context){
    const {render,openForm,toast}=context;
    $('#clientQuery')?.addEventListener('input',event=>{clientQuery=event.target.value;clearTimeout(event.target.timer);event.target.timer=setTimeout(()=>{const results=$('#clientResults');if(results)results.innerHTML=clientRowsMarkup();$$('[data-client-detail]').forEach(button=>button.onclick=()=>showClient(button.dataset.clientDetail))},180)});
    $('#clientStatus')?.addEventListener('change',event=>{clientStatus=event.target.value;render()});
    $('#clientFollowup')?.addEventListener('change',event=>{clientFollowup=event.target.value;render()});
    $$('[data-client-detail]').forEach(button=>button.onclick=()=>showClient(button.dataset.clientDetail));
    if(!clientDelegationBound){clientDelegationBound=true;document.addEventListener('click',event=>{
      const detail=event.target.closest('[data-client-detail]');if(detail){showClient(detail.dataset.clientDetail);return}
      const button=event.target.closest('[data-client-action]');if(!button)return;
      const [action,id]=button.dataset.clientAction.split(':'),client=C.clientRecord(id);if(!client)return;
      if(action==='whatsapp'){const digits=String(client.whatsapp||client.phone||'').replace(/\D/g,'');if(!digits){toast('Este cliente no tiene teléfono para WhatsApp.');return}const international=digits.startsWith('52')?digits:`52${digits.slice(-10)}`;window.open(`https://wa.me/${international}`,'_blank','noopener');return}
      $('#recordDialog').close();
      if(action==='edit')openForm('client',client);
      if(action==='followup')openForm('followup',{clientId:id,contactDate:today(),date:client.nextFollowup||today()});
      if(action==='quote')openForm('quote',{clientId:id,businessId:client.businessId,status:'Borrador'});
      if(action==='project')openForm('project',{clientId:id,businessId:client.businessId,status:'Por iniciar'});
      if(action==='payment')openForm('financialMovement',{clientId:id,movementType:'Ingreso',status:'Pagado'});
    })}
    $$('[data-finance-tab]').forEach(button=>button.onclick=()=>{financeTab=button.dataset.financeTab;render()});
    $$('[data-settings-tab]').forEach(button=>button.onclick=()=>{settingsTab=button.dataset.settingsTab;render()});
    $$('[data-settings-form]').forEach(form=>form.onsubmit=event=>{event.preventDefault();saveSettings(form);toast('Configuración guardada.');render()});
  }
  function searchRoute(entity){return({clients:'clients',businesses:'clients',prospects:'clients',followups:'clients',reviews:'reviews',quotes:'quotes',projects:'projects',documents:'projects',payments:'finance',expenses:'finance',financialMovements:'finance',timeEntries:'projects',inventoryProducts:'settings',inventoryMovements:'projects',packages:'settings',services:'settings'}[entity]||'dashboard')}

  return{renderDashboard,renderClients,renderProjects,renderFinance,renderSettings,formDefinition,handleForm,bindActions,showClient,searchRoute};
})();
