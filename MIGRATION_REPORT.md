# Reporte de migración V10

## Estrategia

La migración se divide en dos capas compatibles:

- Frontend: al abrir una base anterior, crea un respaldo local `quio_management_pre_v10_backup`, unifica prospectos con clientes, enlaza seguimientos y refleja pagos/gastos como movimientos financieros idempotentes.
- Supabase: las migraciones numeradas crean tablas normalizadas, copian primero el payload original y realizan un backfill sin eliminar la fuente.

## Controles

- No se elimina ninguna tabla ni registro.
- `workspace_states` permanece como fuente compatible durante la transición.
- Cada registro conserva `legacy_id` y `raw_payload`.
- Los movimientos heredados usan `idempotency_key`.
- La vista `gestion_v10_migration_report` compara conteos de origen y destino.

## Resultado local verificado

- Esquema de aplicación: `4.0.0`.
- Menú: siete módulos.
- Pruebas automáticas: migración, finanzas, folios, cotizaciones, proyectos y documentos.
- Responsive: 375 px sin desbordamiento horizontal.
- Consola del navegador: sin errores.

## Pendiente administrativo

Las migraciones normalizadas no se aplican automáticamente desde GitHub Pages. Deben ejecutarse en Supabase con una sesión administradora y validarse con la vista de reporte antes de considerar completada la transición del backend.
