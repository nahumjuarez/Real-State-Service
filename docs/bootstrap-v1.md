# Bootstrap v1

## Objetivo

Crear un entorno DEV reproducible para Real Estate OS usando Google Sheets y Apps Script.

La prueba de aceptación es sencilla:

> Un Google Sheet vacío debe poder convertirse en una instancia funcional de desarrollo ejecutando `setupRealEstateOS()`.

## Entregables

- configuración local con npm + clasp;
- manifest de Apps Script;
- schema declarativo;
- creación idempotente de tablas;
- encabezados y metadatos;
- validaciones de enums;
- formatos por tipo de dato;
- Settings con versión del schema;
- menú de administración;
- diagnóstico del sistema;
- datos demo sintéticos;
- validador local del schema.

## Flujo

```text
schema.gs
   ↓
setupRealEstateOS()
   ↓
Google Sheet DEV
   ├── tablas
   ├── headers
   ├── validaciones
   ├── formatos
   └── Settings
```

## Criterios de aceptación

### Setup

- Puede ejecutarse más de una vez sin duplicar tablas.
- Nunca borra datos existentes.
- Si una tabla con datos tiene headers incompatibles, se detiene en vez de sobrescribirlos.
- Registra la versión del schema.
- Registra un evento de bootstrap en AuditLog.

### Diagnóstico

Debe verificar:

- tablas esperadas;
- encabezados;
- schema version;
- entorno;
- conteos de registros.

### Demo

`seedDemoData()`:

- solo funciona con `environment=DEV`;
- se niega a ejecutarse si ya existen datos operativos;
- carga exclusivamente información sintética;
- genera un caso con pago completo y otro con pago parcial.

## Lo que deliberadamente NO incluye

- timbrado PAC;
- lógica fiscal final;
- conciliación bancaria;
- dashboard de producción;
- Market Intelligence;
- CRUD completo;
- autenticación/roles de AppSheet.

Esas funcionalidades pertenecen a fases posteriores.
