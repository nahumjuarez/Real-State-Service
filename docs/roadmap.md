# Roadmap — Real Estate OS

El objetivo es evitar construir muchas funciones inconexas. Cada fase debe terminar con algo utilizable.

## Fase 0 — Fundación documental

**Objetivo:** saber qué estamos construyendo antes de programarlo.

- [x] Arquitectura v1
- [x] Modelo de datos inicial
- [x] Reglas de negocio iniciales
- [x] Seguridad y privacidad
- [x] Diseño fiscal
- [x] Diseño Market Intelligence
- [x] Repositorios de referencia
- [ ] ADRs iniciales
- [x] README público del proyecto

**Salida:** documentación coherente y versionada.

---

## Fase 1 — Bootstrap técnico

**Objetivo:** poder crear un entorno DEV reproducible.

- [x] package.json
- [x] clasp
- [x] appsscript.json
- [x] .gitignore
- [x] .claspignore
- [x] configuración de ejemplo (.clasp.example.json)
- [x] estructura src/
- [x] pruebas básicas (schema validator + demo smoke test)
- [x] Google Sheet DEV — prueba integrada completada

Implementar:

```text
setupRealEstateOS()
```

Debe crear pestañas, headers, validaciones, formatos y Settings.

**Estado de implementación:** Bootstrap v1 validado contra Google Sheet DEV real.

**Salida:** un Sheet DEV regenerable desde código.

---

## Fase 2 — Núcleo operacional

**Objetivo:** administrar correctamente los departamentos actuales.

Orden:

1. Properties
2. Units
3. Parties
4. Ownership
5. Leases
6. LeaseParties
7. RentCharges
8. Payments
9. PaymentAllocations
10. SecurityDeposits
11. Expenses
12. WorkOrders
13. Documents
14. AuditLog

**Definition of Done:**

- [x] registrar propiedades;
- [x] registrar contrato;
- [x] generar cargo mensual;
- [x] registrar pago parcial/completo;
- [x] ver saldo;
- [x] registrar gasto;
- [x] registrar mantenimiento;
- [x] auditar cambios;
- [x] prueba integrada en Google Sheet DEV.

**Estado de implementación:** Core Operations v1 validado en Google Sheet DEV mediante smoke test integrado.

**Salida:** Real Estate OS v0.1 operativo.

---

## Fase 3A — Operator UI

**Objetivo:** operar el núcleo sin editar tablas manualmente.

- [x] panel HtmlService;
- [x] resumen mensual;
- [x] pendientes de cobro;
- [x] registrar pago;
- [x] crear contrato;
- [x] registrar gasto;
- [x] registrar mantenimiento;
- [x] altas base de Party, Property y Unit;
- [x] smoke test de plantilla/payload;
- [x] prueba visual integrada en Google Sheet DEV.

**Estado de implementación:** Operator UI v1 validado en DEV. HtmlService requiere evitar multi-login de Google; existe fallback nativo para cobranza.

**Salida:** interfaz operativa v0.2-alpha.

---

## Fase 3C — Full Operations + Production Readiness

**Objetivo:** poder operar el portafolio real de punta a punta.

- [x] cierre y terminación de contratos;
- [x] liberación de unidades;
- [x] renovación/activación de contrato;
- [x] reversa y anulación de pagos;
- [x] liquidación de depósitos;
- [x] ciclo completo de mantenimiento;
- [x] CapEx separado de Expense;
- [x] generación mensual automática idempotente;
- [x] controles correspondientes en Operator UI;
- [x] fallback nativo de cobranza;
- [x] guía de rollout PROD;
- [ ] smoke test Full Operations en Google Sheet DEV;
- [ ] prueba manual de acciones críticas;
- [ ] creación de instancia PROD;
- [ ] carga inicial del portafolio real.

**Estado de implementación:** backend/UI completos en `feat/full-operations-v1`; pendiente validación integrada y rollout.

**Salida:** Real Estate OS v0.3 listo para operación real.

---

## Fase 3B — Interfaz familiar

**Objetivo:** que una persona no técnica pueda operar con todavía menos complejidad.

Evaluar AppSheet después de validar Operator UI.

Pantallas mínimas:

- Inicio;
- Propiedades;
- Registrar pago;
- Pendientes;
- Mantenimiento;
- Facturas;
- Contratos.

**Salida:** v0.2.

---

## Fase 4 — Documentos y automatización

- crear estructura Drive;
- asociar documentos;
- alertas de contratos;
- emails;
- generación de recibos internos;
- backups.

**Salida:** v0.3.

---

## Fase 5 — CFDI

### 5A — tracking

- Invoice;
- estado fiscal;
- validación de datos;
- links XML/PDF.

### 5B — API PAC

- FiscalProvider;
- proveedor sandbox;
- idempotencia;
- timbrado;
- cancelación;
- PDF;
- Drive;
- envío.

**Salida:** v0.4.

---

## Fase 6 — Asset Management

Implementar motor:

- GSR;
- ERI;
- NOI;
- cash flow;
- occupancy;
- economic occupancy;
- rent/m²;
- OER;
- LTV;
- DSCR;
- equity;
- Budget vs Actual.

Dashboard por propiedad y portafolio.

**Salida:** v0.5.

---

## Fase 7 — Deal Analyzer

- Deal;
- acquisition assumptions;
- debt;
- operating assumptions;
- exit;
- BEAR/BASE/BULL;
- Cap Rate;
- CoC;
- DSCR;
- IRR;
- NPV;
- Equity Multiple;
- break-even.

Guardar deals rechazados.

**Salida:** v0.6.

---

## Fase 8 — Market Intelligence

### 8A
Catálogo de fuentes oficiales.

### 8B
Primer downloader reproducible.

### 8C
Geografía normalizada.

### 8D
INEGI + Banxico + SHF + DENUE.

### 8E
Comparables.

### 8F
Market screening.

**Salida:** v0.7.

---

## Fase 9 — Investigación y aprendizaje

Con suficiente histórico:

- forecast vs actual;
- errores de underwriting;
- mantenimiento real;
- vacancia;
- apreciación;
- desempeño por zona;
- hipótesis de mercado;
- backtesting.

**Salida:** sistema que aprende del propio portafolio.

---

## Fase 10 — Escalamiento tecnológico

Solo cuando la complejidad lo justifique:

```text
Sheets → PostgreSQL / equivalente
Apps Script → API / servicios
AppSheet → web/mobile dedicada si aporta valor
```

El dominio y reglas no deberían cambiar por esta migración.

---

# Prioridad inmediata

```text
Full Operations DEV
 ↓
smoke test + aceptación manual
 ↓
Google Sheet PROD
 ↓
carga inicial del portafolio
 ↓
operación diaria
 ↓
documentos / backups / CFDI
```

No iniciar Market Intelligence avanzada ni PAC antes de que el ledger operativo sea confiable.
