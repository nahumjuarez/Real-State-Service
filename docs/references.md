# Repositorios de referencia

Estos proyectos se estudian como referencias de arquitectura y producto. No implican copiar código indiscriminadamente. Antes de reutilizar implementación concreta debe revisarse su licencia.

## 1. GAS-Apartment-Management

Repositorio: https://github.com/teddyumd/GAS-Apartment-Management

### Aporta
- Google Sheets como almacenamiento;
- Apps Script como backend;
- Drive;
- gestión simple de unidades, inquilinos, rentas y mantenimiento.

### Aprendizaje
Valida nuestra V1 sobre el ecosistema Google.

### No copiar
Arquitectura demasiado concentrada/monolítica para el objetivo de largo plazo.

---

## 2. OpenProperty

Repositorio: https://github.com/clawnify/OpenProperty

### Aporta
- Property → Unit → Lease;
- ledger de rentas;
- pagos parciales;
- mantenimiento;
- proveedores;
- modelo relacional más limpio.

### Aprendizaje
Principal referencia para nuestro dominio operativo.

---

## 3. MicroRealEstate

Repositorio: https://github.com/microrealestate/microrealestate

### Aporta
- UX;
- contratos;
- recibos;
- saldos;
- colaboración;
- portal del inquilino.

### Precaución
La licencia vigente debe revisarse antes de reutilizar código. Usar principalmente como referencia de producto/flujo salvo compatibilidad expresa.

---

## 4. real-estate-calculator

Repositorio: https://github.com/maxgfr/real-estate-calculator

### Aporta
- cash flow;
- Cap Rate;
- Cash-on-Cash;
- DSCR;
- LTV;
- break-even;
- amortización;
- escenarios.

### Aprendizaje
Referencia para el motor determinista del Deal Analyzer.

### Regla
Tomar fórmulas y patrones, no benchmarks extranjeros como criterio universal.

---

## 5. Rental Market Analyzer

Repositorio: https://github.com/immuneeb/rental-market-analyzer

### Aporta
- pipeline Python;
- market screening;
- underwriting;
- escenarios;
- integración con Google Sheets.

### Aprendizaje
Referencia principal para Market Intelligence y separación mercado/deal.

---

## 6. AI Real Estate Fund

Repositorio: https://github.com/xhu96/ai-real-estate-fund

### Aporta
- underwriting auditable;
- riesgos;
- métricas;
- investment memo;
- separación cálculo/IA.

### Precaución
Revisar licencia antes de cualquier reutilización de código.

### Aprendizaje
La IA interpreta; el motor financiero calcula.

---

# Patrones que adoptamos

```text
GAS-Apartment-Management → ecosistema Google
OpenProperty             → dominio operacional
MicroRealEstate          → UX y documentos
real-estate-calculator   → motor financiero
Rental Market Analyzer   → market intelligence
AI Real Estate Fund      → riesgo + auditabilidad
```

# Diferenciación de Real Estate OS

Nuestro proyecto integra:

- operación inmobiliaria;
- asset management;
- inversión/underwriting;
- inteligencia de mercado;
- fiscalidad mexicana/CFDI;
- Google Workspace como V1;
- arquitectura migrable;
- repositorio público con datos reales privados.
