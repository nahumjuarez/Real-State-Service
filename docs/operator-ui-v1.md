# Operator UI v1

## Objetivo

Convertir Core Operations v1 en una interfaz operativa usable desde Google Sheets sin editar directamente las tablas.

La interfaz se sirve con Apps Script HtmlService como diálogo modeless dentro del Sheet.

## Acceso

Después de `clasp push` y recargar el Sheet:

```text
Real Estate OS
└── Abrir panel operativo
```

También está disponible en:

```text
Real Estate OS
└── Operación
    └── Abrir panel operativo
```

## Secciones

### Resumen

Muestra para el periodo seleccionado:

- contratos activos;
- unidades ocupadas;
- renta cargada;
- renta cobrada/asignada;
- saldo pendiente;
- cargos OPEN / PARTIAL / PAID;
- pendientes de cobro;
- contratos activos.

Los saldos se calculan desde `PaymentAllocations`, no desde una bandera manual.

### Cobros

Permite:

- seleccionar un cargo pendiente;
- ver cargo, pagado y saldo;
- registrar monto;
- fecha;
- método;
- referencia;
- notas.

El formulario llama a `registerPaymentFromOperatorUi()`, que delega en `registerPayment()`.

### Contratos

Permite crear un contrato ACTIVE seleccionando:

- propiedad;
- unidad VACANT;
- inquilino;
- fecha inicial;
- fecha final;
- renta;
- depósito requerido;
- día de pago;
- regla de ajuste.

La UI no escribe en Sheets directamente: llama a `createLease()`.

### Gastos

Permite registrar Expense por:

- propiedad;
- unidad opcional;
- categoría;
- descripción;
- fecha;
- monto;
- impuestos;
- método de pago.

### Mantenimiento

Permite crear WorkOrder con:

- propiedad;
- unidad opcional;
- quién reportó;
- categoría;
- prioridad;
- descripción;
- costo estimado.

### Datos base

Incluye altas iniciales para:

- Party;
- Property;
- Unit.

Esto permite preparar un portafolio desde la UI antes de crear contratos.

## Arquitectura

```text
OperatorPanel.html
        ↓
OperatorClient.html
        ↓ google.script.run
operatorUiService.gs
        ↓
Domain Services
        ↓
sheetRepository.gs
        ↓
Google Sheets
```

La lógica de negocio permanece fuera del navegador.

## Seguridad y transporte

- no se envían números de fila al cliente;
- los IDs internos sí se usan como claves técnicas;
- el cliente escapa texto antes de insertarlo en HTML;
- las fechas se convierten a strings antes de viajar por `google.script.run`;
- errores del servidor se muestran al operador sin saltarse validaciones del dominio.

## Pruebas

`runOperatorUiSmokeTest()` valida:

- que la plantilla HtmlService puede evaluarse;
- que CSS/JS se incluyen;
- que existe comunicación `google.script.run`;
- que el payload contiene las colecciones esperadas;
- que no viajan objetos `Date`;
- que la serialización funciona también en objetos anidados.

La aceptación visual requiere además abrir el panel y probar manualmente los formularios principales.

## Fuera de alcance de v1

- autenticación multiusuario avanzada;
- permisos finos por pantalla;
- AppSheet;
- portal de inquilinos;
- subida de documentos;
- conciliación bancaria;
- reversión completa de pagos;
- CFDI/PAC;
- dashboards financieros de Asset Management.
