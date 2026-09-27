# Reglas de negocio — Real Estate OS

> Estado: borrador inicial

## 1. Propiedades y unidades

- Una unidad pertenece exactamente a una propiedad.
- Una propiedad puede tener una o muchas unidades.
- Una unidad no puede tener dos contratos ACTIVE que se traslapen en fechas.
- Una unidad OFF_MARKET no debe generar nuevos cargos de renta.

## 2. Contratos

- `end_date` debe ser posterior a `start_date`.
- Un contrato ACTIVE requiere al menos un LeaseParty con rol TENANT.
- `base_rent >= 0`.
- El depósito en garantía se registra por separado del ingreso por renta.
- Los cambios de renta deben conservar historial o generar un evento auditable.
- El vencimiento de contrato debe generar una alerta configurable.

## 3. Cargos

- Los cargos son obligaciones por cobrar; los pagos son movimientos de efectivo. Nunca son la misma entidad.
- Un contrato ACTIVE puede generar automáticamente un cargo de renta por periodo.
- No deben generarse dos cargos RENT para el mismo `lease_id + period`, salvo ajuste explícito.
- Un cargo puede estar OPEN, PARTIAL, PAID o VOID.
- `current_amount = original_amount + adjustments`.

## 4. Pagos y asignaciones

- Un Payment no implica que una renta esté pagada hasta que exista PaymentAllocation.
- La suma de asignaciones de un pago no puede exceder el monto disponible del pago.
- La suma de asignaciones a un cargo no debe exceder el monto del cargo salvo que exista una regla explícita de sobrepago.
- Los pagos parciales deben mantener el cargo en PARTIAL.
- Reversiones nunca borran el movimiento original; crean trazabilidad.

## 5. Gastos y CapEx

- Un gasto operativo y un CapEx no deben mezclarse.
- Los gastos deben asociarse a Property y, cuando sea posible, a Unit.
- Una reparación recurrente o menor puede clasificarse como Expense.
- Una mejora de vida útil prolongada o inversión material debe evaluarse como CapEx.
- La clasificación final podrá requerir revisión contable/fiscal.

## 6. Mantenimiento

Flujo válido:

```text
REPORTED → TRIAGED → APPROVED → SCHEDULED → IN_PROGRESS → COMPLETED
```

También puede terminar en CANCELLED.

- EMERGENCY puede saltarse etapas operativas, pero no la auditoría.
- Al completar una orden debe registrarse costo real cuando exista.
- Una orden puede originar Expense o CapEx.

## 7. CFDI

- Un CFDI no puede timbrarse si faltan datos fiscales obligatorios.
- El tratamiento fiscal no se deduce únicamente del tipo de propiedad; debe usar configuración fiscal vigente.
- El UUID se registra únicamente después de respuesta exitosa del PAC.
- XML y PDF reales se almacenan en Drive privado, no en GitHub.
- Cancelaciones deben conservar el comprobante y su estado histórico.

## 8. Valuaciones

- Nunca sobrescribir una valuación anterior.
- Cada Valuation debe tener fecha y método.
- Una estimación del propietario debe identificarse como OWNER_ESTIMATE.
- Los dashboards deben indicar qué valuación se utiliza.

## 9. Investment Management

- Un Deal no es Property hasta que se marque ACQUIRED.
- Los deals REJECTED y LOST no se eliminan.
- Los supuestos deben distinguirse de datos observados.
- Cada underwriting debe señalar el escenario utilizado.
- Métricas financieras deben ser deterministas y reproducibles.
- La IA puede explicar resultados, no inventar entradas financieras silenciosamente.

## 10. Mercado

- Cada observación debe preservar fuente, periodo y geografía.
- Los datos raw no se modifican manualmente.
- Los comparables tienen fecha de observación.
- No debe compararse información de periodos distintos sin hacerlo explícito.

## 11. Auditoría

Deben generar AuditEvent, como mínimo:

- cambios de renta;
- creación/terminación de contratos;
- pagos;
- reversiones;
- modificaciones de asignaciones;
- CFDI timbrado/cancelado;
- cambios de valuación;
- cambios de supuestos de un Deal;
- decisión ACQUIRE/REJECT;
- cambios de roles y permisos.
