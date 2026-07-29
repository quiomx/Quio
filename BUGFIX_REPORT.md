# Reporte de correcciones — Gestión Quio 10.1

Fecha: 29 de julio de 2026

## Causas encontradas

- El filtro de Clientes llamaba al render completo después de cada pulsación. Esto destruía y recreaba el `input`, causando la pérdida de foco y de la posición del cursor.
- Los botones de la ficha del cliente se buscaban antes de insertar el contenido dinámico del modal; por eso no recibían listeners.
- La acción de alta se generaba simultáneamente en la barra superior global y en el encabezado de cada módulo.
- El módulo documental añadía cuatro botones a la fila de cada proyecto sin un contenedor con ajuste de línea.
- Las cotizaciones siempre usaban una tabla contable y bloques amplios, aunque fueran paquetes, provocando saltos y espacio desaprovechado.
- No existía una operación explícita para eliminar cotizaciones ni una regla de interfaz para proteger proyectos relacionados.

## Correcciones

- El buscador de Clientes actualiza únicamente `#clientResults` con debounce de 180 ms. El buscador global conserva su elemento, foco, valor y cursor.
- Las acciones del cliente usan delegación única por `data-*`; Editar, Seguimiento, Cotización, Proyecto, Pago y WhatsApp comparten relaciones precargadas.
- Los proyectos validan que una cotización no tenga ya otro proyecto. Los movimientos manuales usan una clave de idempotencia.
- Se eliminó la acción global duplicada y cada módulo conserva una sola acción primaria.
- Las tarjetas usan `.project-card__actions`, ajuste de línea y un bloque “Más acciones”.
- La plantilla comercial distingue paquetes de conceptos independientes, personaliza el contexto, muestra beneficios, inversión, anticipo, saldo, vigencia y próximos pasos, y compacta la impresión.
- Se impide generar una cotización o PDF de total cero sin confirmación explícita.
- La eliminación muestra folio y cliente. Sin proyecto elimina; con proyecto cancela y mantiene la relación.
- Los textos nuevos usan únicamente `NFC` como nombre genérico.
- Los modales tienen desplazamiento interno, cierre nativo con Escape/Cancelar y devolución de foco.

## Archivos modificados

- `public/gestion/index.html`
- `public/gestion/styles.css`
- `public/gestion/js/app.js`
- `public/gestion/js/core.js`
- `public/gestion/js/documents.js`
- `public/gestion/js/operations.js`
- `tests/gestion-bugfix.test.mjs`
- `package.json`
- `CHANGELOG.md`
- `GESTION_QUIO.md`

## Supabase

No fue necesaria una migración. Gestión Quio sincroniza el estado completo del espacio de trabajo y la migración `001_gestion_v10_normalized_schema.sql` ya concede `DELETE` a `authenticated` en tablas normalizadas, con RLS por membresía. No se añadió ni utilizó `service_role`.

## Pruebas

- 7 pruebas automatizadas aprobadas, incluyendo total cero, eliminación, buscadores, acciones, diseño de proyectos y nomenclatura NFC.
- JavaScript validado sintácticamente en los cuatro módulos.
- Compilación de producción aprobada.
- Búsqueda continua validada con `Carolina Acuña Martínez`: el foco permaneció en `clientQuery`, con cursor al final y un resultado.
- Búsqueda global validada con `Centro Odontológico`: foco conservado y resultados visibles.
- Responsive validado en 1366×768, 1024×768, 768×1024 y 390×844.
- Modal de cotización contenido dentro del viewport en las cuatro medidas.
- Tablero de proyectos sin desbordamiento del documento; el desplazamiento horizontal queda contenido en el tablero.
- Una sola acción primaria comprobada en Clientes, Revisiones, Cotizaciones, Proyectos y Finanzas.
- Consola revisada sin errores ni advertencias.
