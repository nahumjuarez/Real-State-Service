# Core Operations v1

## Objetivo

Convertir el bootstrap técnico en un núcleo operativo capaz de administrar el ciclo básico de una renta residencial:

```text
Property
  ↓
Unit
  ↓
Lease
  ↓
RentCharge
  ↓
Payment
  ↓
PaymentAllocation
  ↓
Balance
```

## Servicios implementados

### Propiedades y partes

- `createProperty(input)`
- `createUnit(input)`
- `createParty(input)`
- `createOwnership(input)`

### Contratos

- `createLease(input)`
- validación de fechas;
- validación de inquilinos ACTIVE;
- bloqueo de contratos ACTIVE/EXPIRING traslapados;
- cambio de unidad a OCCUPIED cuando corresponde.

### Depósitos

- `recordSecurityDeposit(input)`
- evita más de un depósito activo por contrato.

### Ledger de renta

- `generateRentCharge(input)`
- `generateRentChargesForPeriod(period)`
- `getChargeBalance(chargeId)`
- `getLeaseBalance(leaseId)`

Reglas:

- no se duplica un cargo RENT para el mismo lease + periodo;
- unidades OFF_MARKET no generan renta;
- v1 genera cargos automáticos únicamente para contratos MONTHLY;
- `OPEN/PARTIAL/PAID` se deriva de PaymentAllocations activas.

### Pagos

- `registerPayment(input)`
- `allocatePayment(paymentId, chargeId, amount)`

Reglas:

- Payment y PaymentAllocation son entidades independientes;
- un pago puede quedar parcialmente sin asignar;
- las asignaciones no pueden superar el monto del pago;
- las asignaciones no pueden superar el saldo pendiente del cargo;
- el estado del cargo se reconcilia automáticamente.

### Gastos, mantenimiento y documentos

- `createExpense(input)`
- `createWorkOrder(input)`
- `transitionWorkOrder(id, status, options)`
- `registerDocumentMetadata(input)`

Flujo estándar de mantenimiento:

```text
REPORTED → TRIAGED → APPROVED → SCHEDULED/IN_PROGRESS → COMPLETED
```

Las órdenes EMERGENCY pueden saltar etapas operativas, pero siguen generando auditoría.

## Repositorio de datos

`src/repositories/sheetRepository.gs` centraliza:

- búsqueda por PK;
- inserción;
- actualización;
- defaults de schema;
- validación de required;
- enums;
- tipos numéricos;
- foreign keys;
- inmutabilidad de PK.

La lógica de dominio no debe trabajar con números de fila.

## Menú

Después de `clasp push` y recargar el Sheet:

```text
Real Estate OS
├── Inicializar / sincronizar sistema
├── Operación
│   ├── Generar cargos del mes actual
│   └── Ver resumen del mes actual
└── Desarrollo
    ├── Cargar datos demo
    ├── Smoke test Bootstrap
    ├── Smoke test Core Operations
    └── Ejecutar diagnóstico
```

## Smoke test

`runCoreOperationsSmokeTest()` crea un escenario sintético aislado:

1. propietario;
2. inquilino;
3. proveedor;
4. propiedad;
5. ownership 100%;
6. unidad;
7. contrato ACTIVE;
8. depósito;
9. cargo mensual de $15,000;
10. pago de $10,000;
11. verifica PARTIAL y saldo $5,000;
12. intenta sobreasignar y exige rechazo;
13. pago final de $5,000;
14. verifica PAID y saldo $0;
15. intenta cargo duplicado y exige rechazo;
16. registra gasto;
17. crea y completa mantenimiento;
18. verifica saldo total del contrato.

El test no borra los registros generados: forman parte de la trazabilidad del entorno DEV y cada ejecución usa IDs únicos.

## Pendiente para capas posteriores

Core Operations v1 no incluye todavía:

- formularios familiares;
- AppSheet;
- conciliación bancaria;
- pagos revertidos completos;
- prorrateo de primer/último mes;
- ajustes de renta avanzados;
- CFDI/PAC;
- dashboard visual;
- Market Intelligence.

Estas capacidades deben construirse encima del ledger, no sustituirlo.
