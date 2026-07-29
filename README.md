# Quio

Sitio público de Quio con dos aplicaciones operativas:

- `/Quio/gestion/`: Gestión Quio V10.
- `/Quio/revisiones/`: Revisiones Quio.

La publicación principal se realiza con GitHub Pages mediante GitHub Actions. Gestión y Revisiones usan autenticación de Supabase y comparten un espacio de trabajo con roles `admin` y `staff`.

## Desarrollo

Requiere Node.js 22.13 o superior.

```bash
npm install
npm run dev
npm test
npm run build:pages
```

## Gestión Quio

La interfaz V10 tiene siete módulos: Resumen, Clientes, Revisiones Quio, Cotizaciones, Proyectos, Finanzas y Configuración. Los activos estáticos están en `public/gestion/`.

Documentación:

- [Producto y arquitectura](GESTION_QUIO.md)
- [Configuración Supabase](SUPABASE_SETUP.md)
- [Reporte de migración](MIGRATION_REPORT.md)
- [Cambios](CHANGELOG.md)

## Migraciones

Los scripts de `supabase/migrations/` son consecutivos e idempotentes. Crean un respaldo del estado JSON antes del backfill, no eliminan `workspace_states` y mantienen RLS por espacio de trabajo.

No debe publicarse una llave `service_role`. La llave pública de Supabase es apta para navegador cuando todas las tablas y funciones mantienen RLS.
