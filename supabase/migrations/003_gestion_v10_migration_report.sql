-- Gestión Quio V10 · reporte de verificación. Solo lectura.
create or replace view public.gestion_v10_migration_report
with (security_invoker=true)
as
select
  w.id as workspace_id,
  w.name as workspace_name,
  s.revision as source_revision,
  jsonb_array_length(coalesce(s.payload->'clients','[]'::jsonb)) as source_clients,
  (select count(*) from public.clients x where x.workspace_id=w.id) as migrated_clients,
  jsonb_array_length(coalesce(s.payload->'followups','[]'::jsonb)) as source_followups,
  (select count(*) from public.followups x where x.workspace_id=w.id) as migrated_followups,
  jsonb_array_length(coalesce(s.payload->'quotes','[]'::jsonb)) as source_quotes,
  (select count(*) from public.quotes x where x.workspace_id=w.id) as migrated_quotes,
  jsonb_array_length(coalesce(s.payload->'projects','[]'::jsonb)) as source_projects,
  (select count(*) from public.projects x where x.workspace_id=w.id) as migrated_projects,
  jsonb_array_length(coalesce(s.payload->'financialMovements','[]'::jsonb)) as source_movements,
  (select count(*) from public.financial_movements x where x.workspace_id=w.id) as migrated_movements,
  (select count(*) from public.followups x where x.workspace_id=w.id and coalesce(x.client_legacy_id,'')='' and coalesce(x.project_legacy_id,'')='') as orphan_followups,
  b.backed_up_at
from public.workspaces w
join public.workspace_states s on s.workspace_id=w.id
left join public.gestion_v10_state_backups b on b.workspace_id=w.id;

grant select on public.gestion_v10_migration_report to authenticated;
