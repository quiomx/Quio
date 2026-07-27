(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.QuioDecisionEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const GOOGLE_OPERATIONAL_IDS=new Set(['profile_exists','category','search_name','search_service','map_pin','hours','description','consistency','directions']);
  const REVIEW_GROWTH_IDS=new Set(['review_tool_missing','review_system','review_volume','review_recency','rating']);
  const BOOKING_IDS=new Set(['booking_missing','booking','booking_confirmation']);

  const SERVICE_ACTIONS={
    profile_missing:{text:'Crearemos o reclamaremos el Perfil de Negocio en Google para que el negocio controle la información que ven sus clientes.',capability:'googleCreate',group:'google_create',order:20},
    profile_exists:{text:'Dejar correctamente configurado el Perfil de Negocio en Google.',capability:'googleImprove',group:'google_profile',order:30},
    category:{text:'Corregir la categoría principal del negocio en Google.',capability:'googleImprove',group:'google_category',order:31},
    search_name:{text:'Corregir la información que dificulta encontrar el negocio por su nombre.',capability:'googleImprove',group:'google_search',order:32},
    search_service:{text:'Explicaremos mejor qué hace su negocio para que sea más fácil encontrarlo y comprenderlo en Google.',capability:'googleImprove',group:'google_information',order:32},
    map_pin:{text:'Corregir la ubicación y el punto del negocio en Google Maps.',capability:'googleImprove',group:'google_maps',order:33},
    directions:{text:'Revisar la ubicación y las indicaciones visibles en Google Maps.',capability:'googleImprove',group:'google_maps',order:33},
    consistency:{text:'Hacer coincidir el nombre, domicilio y teléfono del Perfil de Google con los datos oficiales.',capability:'googleImprove',group:'google_data',order:34},
    description:{text:'Explicaremos mejor qué hace su negocio para que sea más fácil encontrarlo y comprenderlo en Google.',capability:'googleImprove',group:'google_information',order:32},
    hours:{text:'Actualizar los horarios normales y especiales en Google.',capability:'googleImprove',group:'google_hours',order:36},
    review_tool_missing:{text:'Facilitaremos una forma rápida para que sus clientes puedan dejar una reseña después de su atención.',capability:'reviews',group:'reviews',order:40},
    review_system:{text:'Facilitaremos una forma rápida y constante para solicitar reseñas después de cada atención.',capability:'reviews',group:'reviews',order:40},
    review_volume:{text:'Facilitaremos una forma rápida y constante para solicitar reseñas después de cada atención.',capability:'reviews',group:'reviews',order:40},
    review_recency:{text:'Facilitaremos una forma rápida y constante para solicitar reseñas después de cada atención.',capability:'reviews',group:'reviews',order:40},
    website_missing:{text:'Crearemos un sitio web sencillo donde las personas conozcan sus servicios y puedan contactarlo fácilmente.',capability:'websiteCreate',group:'website',order:10},
    booking_missing:{text:'Incorporaremos una agenda sencilla para que las personas puedan solicitar una cita sin depender de varios mensajes o llamadas.',capability:'bookingCreate',group:'booking',order:15},
    booking:{text:'Incorporaremos una agenda sencilla para que las personas puedan solicitar una cita sin depender de varios mensajes o llamadas.',capability:'bookingCreate',group:'booking',order:15},
    booking_confirmation:{text:'Configurar una confirmación clara después de cada cita o solicitud.',capability:'bookingCreate',group:'booking_confirmation',order:16}
  };

  const FUTURE_LABELS={
    rating:'La calificación pública puede seguir fortaleciéndose con una atención consistente y nuevas reseñas.',
    review_response:'Conviene responder las reseñas recientes de manera amable y constante.',
    website_clarity:'El sitio web actual puede explicar con mayor claridad qué ofrece el negocio.',
    services:'Los servicios del sitio web actual pueden presentarse de forma más clara y completa.',
    differentiator:'Conviene explicar con mayor claridad por qué una persona podría elegir este negocio.',
    mobile:'El sitio web actual puede mejorar su funcionamiento en teléfonos celulares.',
    phone:'Conviene comprobar que el teléfono publicado funcione y sea atendido.',
    whatsapp:'Conviene hacer más claro para el cliente dónde puede escribir.',
    directions:'Conviene revisar referencias de acceso o indicaciones adicionales para llegar.',
    consistency:'Conviene corregir las diferencias entre los datos publicados en Google y en el sitio web.',
  };

  // Hallazgos visibles que no generan automáticamente servicios ni complementos.
  const OBSERVATION_ONLY_IDS=new Set(['photos']);

  function opportunityIds(findings){return new Set((findings?.opportunities||[]).map(x=>x.id));}

  function detectNeeds(inventory,findings){
    const inv=inventory||{};const ids=opportunityIds(findings);
    const googleCreate=inv.googleProfile==='no'||ids.has('profile_missing');
    const googleImprove=!googleCreate&&(inv.googleProfile==='partial'||[...GOOGLE_OPERATIONAL_IDS].some(id=>ids.has(id)));
    const reviews=inv.reviewTool==='no'||inv.reviewTool==='partial'||[...REVIEW_GROWTH_IDS].some(id=>ids.has(id));
    const websiteCreate=inv.website==='no'||ids.has('website_missing');
    const appointmentApplies=inv.appointmentBusiness==='yes';
    const bookingCreate=appointmentApplies&&(inv.booking==='no'||inv.booking==='partial'||[...BOOKING_IDS].some(id=>ids.has(id)));
    return {googleCreate,googleImprove,reviews,websiteCreate,bookingCreate,appointmentApplies};
  }

  function recommend(inventory,findings){
    const needs=detectNeeds(inventory,findings);
    const essential=needs.googleCreate||needs.googleImprove||needs.reviews;
    const website=needs.websiteCreate;
    const booking=needs.bookingCreate;
    const capabilities=[];
    if(needs.googleCreate)capabilities.push('googleCreate');
    else if(needs.googleImprove)capabilities.push('googleImprove');
    if(needs.reviews)capabilities.push('reviews');
    if(website)capabilities.push('websiteCreate');
    if(booking)capabilities.push('bookingCreate');

    let name,level,reason;
    if(essential&&website&&booking){name='Avanzado';level='Plan recomendado';reason='Recomendamos Quio Avanzado porque el negocio necesita fortalecer su presencia en Google, contar con un sitio web y facilitar las citas en línea.';}
    else if(essential&&website){name='Profesional';level='Plan recomendado';reason='Recomendamos Quio Profesional porque el negocio necesita fortalecer su presencia en Google y contar con un sitio web claro.';}
    else if(essential&&booking){name='Esencial + agenda en línea';level='Solución recomendada';reason='El negocio no necesita un sitio web nuevo. Recomendamos fortalecer Google y las reseñas, además de incorporar una agenda en línea.';}
    else if(website&&booking){name='Sitio web + agenda en línea';level='Solución recomendada';reason='El negocio necesita un sitio web y una agenda en línea, sin agregar trabajos de Google que no requiere actualmente.';}
    else if(essential){name='Esencial';level='Plan recomendado';reason='Recomendamos Quio Esencial para mejorar cómo aparece el negocio en Google y facilitar que más clientes dejen una reseña.';}
    else if(website){name='Sitio web';level='Solución recomendada';reason='La principal necesidad es contar con un sitio web claro que explique el negocio y facilite el contacto.';}
    else if(booking){name='Agenda en línea';level='Solución recomendada';reason='La principal necesidad es ofrecer una forma sencilla de recibir y confirmar solicitudes de cita.';}
    else{name='Mejoras puntuales';level='Siguiente paso sugerido';reason='La base funciona bien. Conviene atender únicamente los puntos específicos detectados y revisar nuevamente los resultados más adelante.';}
    return {name,level,reason,capabilities,needs};
  }

  function coveredFindingIds(capabilities){
    const caps=new Set(capabilities||[]),ids=new Set();
    if(caps.has('googleCreate'))['profile_missing','profile_exists','category','search_name','search_service','map_pin','directions','hours','description','consistency','whatsapp'].forEach(x=>ids.add(x));
    if(caps.has('googleImprove'))['profile_exists','category','search_name','search_service','map_pin','directions','hours','description','consistency','whatsapp'].forEach(x=>ids.add(x));
    if(caps.has('reviews'))['review_tool_missing','review_system','review_volume','review_recency','rating'].forEach(x=>ids.add(x));
    if(caps.has('websiteCreate'))['website_missing','website_clarity','services','differentiator','mobile','consistency','whatsapp','cta'].forEach(x=>ids.add(x));
    if(caps.has('bookingCreate'))['booking_missing','booking','booking_confirmation','whatsapp'].forEach(x=>ids.add(x));
    return ids;
  }

  function buildPlan(findings,recommendation){
    const caps=new Set(recommendation?.capabilities||[]),covered=coveredFindingIds([...caps]);
    const included=new Map(),future=new Map();
    for(const finding of findings?.opportunities||[]){
      const action=SERVICE_ACTIONS[finding.id];
      if(action&&caps.has(action.capability)){
        // Crear un perfil nuevo absorbe todas las optimizaciones menores de Google.
        if(caps.has('googleCreate')&&action.capability==='googleImprove')continue;
        const key=action.group;
        const candidate={...action,id:finding.id,priority:finding.priority||'Media',weight:finding.weight||0};
        const current=included.get(key);
        if(!current||candidate.weight>current.weight)included.set(key,candidate);
      }else if(!covered.has(finding.id)&&!OBSERVATION_ONLY_IDS.has(finding.id)){
        const text=FUTURE_LABELS[finding.id]||finding.title;
        if(text&&!future.has(finding.id))future.set(finding.id,{id:finding.id,text,priority:finding.priority||'Media'});
      }
    }
    if(included.has('booking'))included.delete('booking_confirmation');
    const sorted=[...included.values()].sort((a,b)=>a.order-b.order||b.weight-a.weight);
    const decorate=sorted.slice(0,6).map((x,i)=>({phase:i<2?'Primero':i<4?'Después':'Más adelante',time:i<2?'0–15 días':i<4?'16–30 días':'31–60 días',text:x.text,impact:x.priority,id:x.id,group:x.group}));
    return {included:decorate,future:[...future.values()].slice(0,3),covered:[...covered]};
  }

  function capabilityCoverage(recommendation,plan){
    const caps=new Set(recommendation?.capabilities||[]);
    const groups=new Set((plan?.included||[]).map(x=>x.group));
    const rows=[];
    if(caps.has('googleCreate'))rows.push({key:'google_create',aspect:'Encontrar el negocio',today:'Sin Perfil de Google administrable',target:'Perfil creado, completo y listo para administrar'});
    else {
      if(groups.has('google_information')||groups.has('google_search'))rows.push({key:'google_information',aspect:'Explicar el negocio en Google',today:'Información poco clara o incompleta',target:'Descripción y servicios claros'});
      if(groups.has('google_hours'))rows.push({key:'google_hours',aspect:'Mostrar horarios',today:'Horarios incompletos o desactualizados',target:'Horarios claros y actualizados'});
      if(groups.has('google_maps'))rows.push({key:'google_maps',aspect:'Llegar al negocio',today:'Ubicación o indicaciones por corregir',target:'Ubicación e indicaciones correctas'});
      if(groups.has('google_category'))rows.push({key:'google_category',aspect:'Mostrar el giro correcto',today:'Categoría por corregir',target:'Categoría correcta en Google'});
      if(groups.has('google_data'))rows.push({key:'google_data',aspect:'Mantener datos consistentes',today:'Datos diferentes entre canales',target:'Nombre, domicilio y teléfono coincidentes'});
    }
    if(caps.has('websiteCreate'))rows.push({key:'website',aspect:'Conocer los servicios',today:'Sin sitio web',target:'Sitio claro y disponible'});
    if(caps.has('bookingCreate'))rows.push({key:'booking',aspect:'Solicitar una cita',today:'Sin agenda en línea',target:'Agenda visible con confirmación'});
    if(caps.has('reviews'))rows.push({key:'reviews',aspect:'Facilitar reseñas',today:'Sin una forma sencilla y constante',target:'Proceso sencillo para dejar una reseña'});
    return rows;
  }

  function validateResult(inventory,findings,recommendation,plan){
    const errors=[],caps=new Set(recommendation.capabilities||[]),futureIds=new Set((plan.future||[]).map(x=>x.id));
    for(const id of plan.covered||[])if(futureIds.has(id))errors.push(`El hallazgo ${id} aparece como cubierto y futuro.`);
    const groups=(plan.included||[]).map(x=>x.group).filter(Boolean);if(new Set(groups).size!==groups.length)errors.push('Hay acciones duplicadas por grupo.');
    if(inventory.appointmentBusiness!=='yes'&&caps.has('bookingCreate'))errors.push('Se recomendó agenda para un negocio que no trabaja mediante citas.');
    if(inventory.website!=='no'&&caps.has('websiteCreate'))errors.push('Se recomendó crear sitio web aunque ya existe.');
    if(inventory.googleProfile==='no'&&!caps.has('googleCreate'))errors.push('Falta la capacidad de crear/reclamar Perfil de Google.');
    return errors;
  }

  return {detectNeeds,recommend,buildPlan,coveredFindingIds,capabilityCoverage,validateResult,SERVICE_ACTIONS,FUTURE_LABELS,OBSERVATION_ONLY_IDS};
});
