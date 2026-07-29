# Supabase para Gestión Quio

## Estado actual

La aplicación usa autenticación por correo y contraseña, roles `admin` y `staff`, RLS y sincronización en tiempo real de `workspace_states`. La llave pública de Supabase puede estar en el navegador; la seguridad depende de RLS, no de ocultarla.

## Aplicar V10

1. Abre el proyecto correcto en Supabase.
2. Exporta un respaldo desde Configuración > Respaldo.
3. En SQL Editor, ejecuta en orden:
   - `supabase/migrations/001_gestion_v10_normalized_schema.sql`
   - `supabase/migrations/002_gestion_v10_backfill.sql`
   - `supabase/migrations/003_gestion_v10_migration_report.sql`
4. Ejecuta:

```sql
select * from public.gestion_v10_migration_report;
```

5. Compara cada columna `source_*` con `migrated_*`. Revisa especialmente `orphan_followups`.

Las migraciones crean primero `gestion_v10_state_backups`, no eliminan `workspace_states` y son idempotentes por `(workspace_id, legacy_id)`.

## Roles

- `admin`: administra integrantes del espacio y opera el sistema.
- `staff`: opera datos del espacio, sin administrar membresías.

No se incluye ninguna `service_role` en el frontend. Las migraciones SQL deben ejecutarse desde el SQL Editor por una persona administradora del proyecto.
