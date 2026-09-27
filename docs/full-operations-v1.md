# Full Operations v1

## Objetivo

Cerrar los huecos que impiden operar el portafolio de forma cotidiana y preparar el salto de DEV a PROD.

## Ciclos cubiertos

### Contratos

- crear contrato;
- marcar EXPIRING;
- cerrar como ENDED;
- terminar anticipadamente como TERMINATED;
- liberar la unidad a VACANT cuando ya no exista otro contrato activo;
- crear renovación DRAFT;
- activar renovación validando traslapes.

Funciones:

- `closeLease(input)`
- `markLeaseExpiring(leaseId)`
- `createLeaseRenewal(input)`
- `activateLease(leaseId)`

### Pagos

- registrar;
- asignar;
- pago parcial/completo;
- revertir un pago recibido sin borrar trazabilidad;
- anular un pago no asignado;
- recalcular automáticamente los cargos afectados.

Funciones:

- `reversePayment(input)`
- `voidPayment(input)`

Una reversa cambia Payment a REVERSED. PaymentAllocation se conserva como evidencia histórica, pero deja de contar en el saldo porque el ledger solo considera pagos RECEIVED.

### Depósitos

- registrar;
- conservar monto retenido;
- registrar devolución;
- registrar deducciones;
- liquidar total o parcialmente.

Función:

- `settleSecurityDeposit(input)`

### Mantenimiento

Se mantiene el flujo:

```text
REPORTED → TRIAGED → APPROVED → SCHEDULED / IN_PROGRESS → COMPLETED
```

La UI permite avanzar las órdenes existentes y registrar costo real al completar.

### CapEx

`createCapEx(input)` conserva inversiones de capital separadas de Expense.

### Automatización mensual

`ensureOperationalTriggers()` instala un trigger Apps Script para ejecutar `runScheduledRentChargeGeneration()` el día 1 de cada mes.

La generación continúa siendo idempotente: si el cargo RENT del periodo ya existe, se omite.

## Operator UI

Full Operations extiende el panel existente con:

- reversa de pagos recientes;
- cierre de contratos;
- liquidación de depósitos;
- avance/cierre de mantenimiento;
- registro y consulta de CapEx.

Las acciones destructivas o contables requieren confirmación del operador.

## Smoke test

`runFullOperationsSmokeTest()` verifica:

1. contrato ACTIVE;
2. depósito;
3. cargo mensual;
4. pago completo;
5. reversa;
6. saldo reabierto;
7. liquidación de depósito;
8. mantenimiento hasta COMPLETED;
9. CapEx;
10. terminación de contrato;
11. unidad VACANT.

## Condición para PROD

No cargar información real hasta que:

- `runFullOperationsSmokeTest()` pase;
- el panel abra con una única sesión Google autorizada;
- una operación manual de cada ciclo crítico se valide en DEV;
- el entorno PROD se cree en un Spreadsheet separado.
