-- Gestión Quio V10 · respaldo y backfill idempotente desde workspace_states.
-- Ejecutar después de 001. No borra ni modifica el payload original.
begin;

insert into public.gestion_v10_state_backups(workspace_id,payload,source_revision)
select workspace_id,coalesce(payload,'{}'::jsonb),revision
from public.workspace_states
on conflict(workspace_id) do nothing;

insert into public.clients(workspace_id,legacy_id,name,business_name,phone,email,status,source,preferred_contact,last_contact,next_followup,notes,raw_payload,archived,created_at,updated_at)
select s.workspace_id,x->>'id',coalesce(nullif(x->>'name',''),nullif(x->>'contactName',''),'Contacto sin nombre'),x->>'businessName',x->>'phone',x->>'email',coalesce(nullif(x->>'status',''),'Prospecto'),x->>'source',x->>'preferredContact',nullif(x->>'lastContact','')::date,nullif(x->>'nextFollowup','')::date,x->>'notes',x,coalesce((x->>'archived')::boolean,false),coalesce(nullif(x->>'createdAt','')::timestamptz,now()),coalesce(nullif(x->>'updatedAt','')::timestamptz,now())
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'clients','[]'::jsonb)) x
where x ? 'id'
on conflict(workspace_id,legacy_id) do update set name=excluded.name,business_name=excluded.business_name,phone=excluded.phone,email=excluded.email,status=excluded.status,raw_payload=excluded.raw_payload,updated_at=excluded.updated_at;

-- Compatibilidad directa con payloads anteriores a V10 que todavía separan prospectos.
insert into public.clients(workspace_id,legacy_id,name,business_name,phone,email,status,source,last_contact,next_followup,notes,raw_payload,archived,created_at,updated_at)
select s.workspace_id,'prospect:'||(x->>'id'),coalesce(nullif(x->>'contactName',''),'Contacto de '||coalesce(nullif(x->>'businessName',''),'negocio')),x->>'businessName',x->>'phone',x->>'email',
case
  when x->>'stage' in ('Ganado') then 'Cliente activo'
  when x->>'stage' in ('Propuesta enviada','En decisión') then 'Cotización enviada'
  when x->>'stage'='Revisión realizada' then 'Revisión realizada'
  when x->>'stage'='Revisión agendada' then 'Revisión agendada'
  when x->>'stage'='No continuó' then 'No interesado'
  when x->>'stage'='Contactado' then 'Prospecto'
  else 'Prospecto'
end,
x->>'source',nullif(x->>'lastContact','')::date,nullif(x->>'nextFollowup','')::date,x->>'notes',x,coalesce((x->>'archived')::boolean,false),coalesce(nullif(x->>'createdAt','')::timestamptz,now()),coalesce(nullif(x->>'updatedAt','')::timestamptz,now())
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'prospects','[]'::jsonb)) x
where x ? 'id'
  and not exists (
    select 1 from public.clients c
    where c.workspace_id=s.workspace_id
      and (
        (coalesce(x->>'email','')<>'' and lower(c.email)=lower(x->>'email'))
        or (coalesce(x->>'phone','')<>'' and c.phone=x->>'phone')
        or c.legacy_id='prospect:'||(x->>'id')
      )
  )
on conflict(workspace_id,legacy_id) do nothing;

insert into public.businesses(workspace_id,legacy_id,name,industry,phone,email,maps_url,website_url,status,raw_payload,archived,created_at,updated_at)
select s.workspace_id,x->>'id',coalesce(nullif(x->>'name',''),'Negocio sin nombre'),x->>'industry',x->>'phone',x->>'email',x->>'mapsUrl',x->>'websiteUrl',x->>'status',x,coalesce((x->>'archived')::boolean,false),coalesce(nullif(x->>'createdAt','')::timestamptz,now()),coalesce(nullif(x->>'updatedAt','')::timestamptz,now())
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'businesses','[]'::jsonb)) x where x ? 'id'
on conflict(workspace_id,legacy_id) do update set name=excluded.name,industry=excluded.industry,phone=excluded.phone,email=excluded.email,maps_url=excluded.maps_url,website_url=excluded.website_url,status=excluded.status,raw_payload=excluded.raw_payload,updated_at=excluded.updated_at;

insert into public.followups(workspace_id,legacy_id,client_legacy_id,project_legacy_id,due_date,reason,channel,status,result,notes,raw_payload,archived,created_at,updated_at)
select s.workspace_id,x->>'id',x->>'clientId',x->>'projectId',nullif(x->>'date','')::date,x->>'reason',x->>'channel',coalesce(x->>'status','Pendiente'),x->>'result',x->>'notes',x,coalesce((x->>'archived')::boolean,false),coalesce(nullif(x->>'createdAt','')::timestamptz,now()),coalesce(nullif(x->>'updatedAt','')::timestamptz,now())
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'followups','[]'::jsonb)) x where x ? 'id'
on conflict(workspace_id,legacy_id) do update set client_legacy_id=excluded.client_legacy_id,project_legacy_id=excluded.project_legacy_id,due_date=excluded.due_date,reason=excluded.reason,channel=excluded.channel,status=excluded.status,result=excluded.result,notes=excluded.notes,raw_payload=excluded.raw_payload,updated_at=excluded.updated_at;

insert into public.reviews(workspace_id,legacy_id,business_legacy_id,review_date,iqpd,level,raw_payload,archived,created_at,updated_at)
select s.workspace_id,x->>'id',x->>'businessId',nullif(x->>'reviewDate','')::date,nullif(x->>'iqpd','')::numeric,x->>'level',x,coalesce((x->>'archived')::boolean,false),coalesce(nullif(x->>'createdAt','')::timestamptz,now()),coalesce(nullif(x->>'updatedAt','')::timestamptz,now())
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'reviews','[]'::jsonb)) x where x ? 'id'
on conflict(workspace_id,legacy_id) do update set business_legacy_id=excluded.business_legacy_id,review_date=excluded.review_date,iqpd=excluded.iqpd,level=excluded.level,raw_payload=excluded.raw_payload,updated_at=excluded.updated_at;

insert into public.quotes(workspace_id,legacy_id,folio,client_legacy_id,business_legacy_id,package_legacy_id,status,valid_until,total,raw_payload,archived,created_at,updated_at)
select s.workspace_id,x->>'id',coalesce(nullif(x->>'folio',''),'QUIO-MIGRADO-'||(x->>'id')),x->>'clientId',x->>'businessId',x->>'packageId',coalesce(x->>'status','Borrador'),nullif(x->>'validUntil','')::date,coalesce(nullif(x#>>'{financialSnapshot,total}','')::numeric,nullif(x#>>'{financialSnapshot,netPrice}','')::numeric,0),x,coalesce((x->>'archived')::boolean,false),coalesce(nullif(x->>'createdAt','')::timestamptz,now()),coalesce(nullif(x->>'updatedAt','')::timestamptz,now())
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'quotes','[]'::jsonb)) x where x ? 'id'
on conflict(workspace_id,legacy_id) do update set folio=excluded.folio,client_legacy_id=excluded.client_legacy_id,business_legacy_id=excluded.business_legacy_id,status=excluded.status,valid_until=excluded.valid_until,total=excluded.total,raw_payload=excluded.raw_payload,updated_at=excluded.updated_at;

insert into public.projects(workspace_id,legacy_id,client_legacy_id,business_legacy_id,quote_legacy_id,package_legacy_id,name,status,start_date,due_date,progress,next_step,checklist,raw_payload,archived,created_at,updated_at)
select s.workspace_id,x->>'id',x->>'clientId',x->>'businessId',x->>'quoteId',x->>'packageId',coalesce(nullif(x->>'name',''),'Proyecto sin nombre'),coalesce(x->>'status','Pendiente de iniciar'),nullif(x->>'startDate','')::date,nullif(x->>'dueDate','')::date,least(100,greatest(0,coalesce(nullif(x->>'progress','')::integer,0))),x->>'nextStep',coalesce(x->'checklist','[]'::jsonb),x,coalesce((x->>'archived')::boolean,false),coalesce(nullif(x->>'createdAt','')::timestamptz,now()),coalesce(nullif(x->>'updatedAt','')::timestamptz,now())
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'projects','[]'::jsonb)) x where x ? 'id'
on conflict(workspace_id,legacy_id) do update set client_legacy_id=excluded.client_legacy_id,business_legacy_id=excluded.business_legacy_id,quote_legacy_id=excluded.quote_legacy_id,name=excluded.name,status=excluded.status,start_date=excluded.start_date,due_date=excluded.due_date,progress=excluded.progress,next_step=excluded.next_step,checklist=excluded.checklist,raw_payload=excluded.raw_payload,updated_at=excluded.updated_at;

insert into public.financial_movements(workspace_id,legacy_id,idempotency_key,movement_type,client_legacy_id,project_legacy_id,quote_legacy_id,category,concept,amount,paid_amount,status,movement_date,due_date,payment_method,reference,raw_payload,archived,created_at,updated_at)
select s.workspace_id,x->>'id',nullif(x->>'idempotencyKey',''),case when x->>'movementType'='Gasto' then 'Gasto' else 'Ingreso' end,x->>'clientId',x->>'projectId',x->>'quoteId',x->>'category',coalesce(nullif(x->>'concept',''),nullif(x->>'category',''),'Movimiento'),coalesce(nullif(x->>'amount','')::numeric,0),coalesce(nullif(x->>'paidAmount','')::numeric,case when x->>'status'='Pagado' then coalesce(nullif(x->>'amount','')::numeric,0) else 0 end),case when x->>'status' in ('Pagado','Parcial','Cancelado') then x->>'status' else 'Pendiente' end,coalesce(nullif(x->>'date','')::date,current_date),nullif(x->>'dueDate','')::date,x->>'paymentMethod',x->>'reference',x,coalesce((x->>'archived')::boolean,false),coalesce(nullif(x->>'createdAt','')::timestamptz,now()),coalesce(nullif(x->>'updatedAt','')::timestamptz,now())
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'financialMovements','[]'::jsonb)) x where x ? 'id'
on conflict(workspace_id,legacy_id) do update set status=excluded.status,amount=excluded.amount,paid_amount=excluded.paid_amount,movement_date=excluded.movement_date,due_date=excluded.due_date,raw_payload=excluded.raw_payload,updated_at=excluded.updated_at;

-- Compatibilidad con pagos/gastos heredados cuando financialMovements aún está vacío.
insert into public.financial_movements(workspace_id,legacy_id,idempotency_key,movement_type,client_legacy_id,project_legacy_id,category,concept,amount,paid_amount,status,movement_date,due_date,payment_method,raw_payload,archived,created_at,updated_at)
select s.workspace_id,'payment:'||(x->>'id'),'legacy:payments:'||(x->>'id'),'Ingreso',x->>'clientId',x->>'projectId',coalesce(nullif(x->>'type',''),'Venta'),coalesce(nullif(x->>'notes',''),nullif(x->>'type',''),'Ingreso'),coalesce(nullif(x->>'amount','')::numeric,0),
case when x->>'status'='Cobrado' then coalesce(nullif(x->>'amount','')::numeric,0) else 0 end,
case when x->>'status'='Cobrado' then 'Pagado' when x->>'status'='Cancelado' then 'Cancelado' else 'Pendiente' end,
coalesce(nullif(x->>'actualDate','')::date,nullif(x->>'expectedDate','')::date,current_date),nullif(x->>'expectedDate','')::date,x->>'method',x,coalesce((x->>'archived')::boolean,false),coalesce(nullif(x->>'createdAt','')::timestamptz,now()),coalesce(nullif(x->>'updatedAt','')::timestamptz,now())
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'payments','[]'::jsonb)) x where x ? 'id'
on conflict(workspace_id,legacy_id) do nothing;

insert into public.financial_movements(workspace_id,legacy_id,idempotency_key,movement_type,project_legacy_id,category,concept,amount,paid_amount,status,movement_date,raw_payload,archived,created_at,updated_at)
select s.workspace_id,'expense:'||(x->>'id'),'legacy:expenses:'||(x->>'id'),'Gasto',x->>'projectId',coalesce(nullif(x->>'category',''),'Otro gasto'),coalesce(nullif(x->>'notes',''),nullif(x->>'category',''),'Gasto'),coalesce(nullif(x->>'amount','')::numeric,0),
case when coalesce(x->>'status','Pagado') in ('Pagado','Pagada') then coalesce(nullif(x->>'amount','')::numeric,0) else 0 end,
case when coalesce(x->>'status','Pagado') in ('Pagado','Pagada') then 'Pagado' when x->>'status' in ('Cancelado','Cancelada') then 'Cancelado' else 'Pendiente' end,
coalesce(nullif(x->>'date','')::date,current_date),x,coalesce((x->>'archived')::boolean,false),coalesce(nullif(x->>'createdAt','')::timestamptz,now()),coalesce(nullif(x->>'updatedAt','')::timestamptz,now())
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'expenses','[]'::jsonb)) x where x ? 'id'
on conflict(workspace_id,legacy_id) do nothing;

insert into public.packages(workspace_id,legacy_id,name,price,estimated_hours,contents,raw_payload,archived,created_at,updated_at)
select s.workspace_id,x->>'id',coalesce(nullif(x->>'name',''),'Paquete'),coalesce(nullif(x->>'price','')::numeric,0),coalesce(nullif(x->>'estimatedHours','')::numeric,0),coalesce(x->'contents','[]'::jsonb),x,coalesce((x->>'archived')::boolean,false),coalesce(nullif(x->>'createdAt','')::timestamptz,now()),coalesce(nullif(x->>'updatedAt','')::timestamptz,now())
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'packages','[]'::jsonb)) x where x ? 'id'
on conflict(workspace_id,legacy_id) do update set name=excluded.name,price=excluded.price,estimated_hours=excluded.estimated_hours,contents=excluded.contents,raw_payload=excluded.raw_payload,updated_at=excluded.updated_at;

insert into public.gestion_settings(workspace_id,settings)
select workspace_id,coalesce(payload->'settings','{}'::jsonb) from public.workspace_states
on conflict(workspace_id) do update set settings=excluded.settings,updated_at=now();

insert into public.activity_log_v10(workspace_id,legacy_id,client_legacy_id,project_legacy_id,entity,record_legacy_id,action,detail,happened_at,raw_payload)
select s.workspace_id,x->>'id',x->>'clientId',x->>'projectId',x->>'entity',x->>'recordId',coalesce(nullif(x->>'action',''),'Actividad'),x->>'detail',coalesce(nullif(x->>'createdAt','')::timestamptz,now()),x
from public.workspace_states s cross join lateral jsonb_array_elements(coalesce(s.payload->'activityLog','[]'::jsonb)) x where x ? 'id'
on conflict(workspace_id,legacy_id) do update set action=excluded.action,detail=excluded.detail,happened_at=excluded.happened_at,raw_payload=excluded.raw_payload;

commit;
