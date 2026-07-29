# Gestión Quio V10

Gestión Quio es la vista operativa compartida de Quio. Se publica como aplicación estática en `/Quio/gestion/` y sincroniza un espacio de trabajo privado mediante Supabase.

## Módulos visibles

La navegación tiene exactamente siete módulos:

1. Resumen
2. Clientes
3. Revisiones Quio
4. Cotizaciones
5. Proyectos
6. Finanzas
7. Configuración

Prospectos, negocios y seguimientos se trabajan dentro de Clientes. Tiempo e inventario ya no son módulos independientes; sus datos históricos permanecen disponibles en los proyectos, parámetros y respaldos.

## Modelo operativo

- Un cliente concentra contacto, negocio, estado, revisiones, cotizaciones, proyectos, saldo, seguimientos e historial.
- Finanzas usa `financialMovements` como única fuente operativa. La utilidad de caja es `ingresos cobrados - gastos pagados`.
- Los pagos y gastos anteriores se reflejan de forma idempotente en movimientos y se conservan como datos heredados.
- Las cotizaciones usan folios `QUIO-AAAA-####` y estados Borrador, Enviada, Aceptada, Rechazada, Vencida o Cancelada.
- Los proyectos incluyen fechas, estado, siguiente paso, enlaces y checklist sencillo.

## Estructura del frontend

- `public/gestion/js/core.js`: modelo, migración local, cálculos y persistencia.
- `public/gestion/js/operations.js`: vistas operativas V10.
- `public/gestion/js/documents.js`: cotizaciones y expediente documental.
- `public/gestion/js/sync.js`: autenticación, roles y sincronización Supabase.
- `public/gestion/styles.css`: interfaz responsive.

El logo oficial se encuentra en `public/gestion/assets/images/logo-quio.png`.
