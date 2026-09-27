# Real Estate OS — Arquitectura v1

> **Estado:** Borrador inicial  
> **Versión:** 1.0  
> **Mercado inicial:** México  
> **Portafolio inicial:** Departamentos residenciales en renta  
> **Objetivo:** Diseñar un sistema profesional para administrar inmuebles, medir su desempeño, analizar nuevas inversiones y construir inteligencia de mercado con datos históricos.

---

# 1. Visión

**Real Estate OS** será un sistema de gestión inmobiliaria diseñado inicialmente para administrar un pequeño portafolio familiar de departamentos, pero con una arquitectura suficientemente sólida para crecer hacia una operación inmobiliaria más grande.

El sistema no debe limitarse a:

- registrar rentas,
- emitir CFDI,
- guardar contratos,
- o llevar una lista de inquilinos.

Debe funcionar como una plataforma que permita responder cuatro preguntas principales:

## 1.1 Property Management — Operación

- ¿Quién ocupa cada unidad?
- ¿Cuánto debe pagar?
- ¿Cuándo debe pagar?
- ¿Qué pagos se han recibido?
- ¿Qué contratos están por vencer?
- ¿Qué mantenimientos están pendientes?
- ¿Qué CFDI deben generarse?
- ¿Qué documentos pertenecen a cada inmueble?

## 1.2 Asset Management — Gestión del activo

- ¿Cuánto produce realmente cada propiedad?
- ¿Cuál es su NOI?
- ¿Cuánto cuesta mantenerla?
- ¿Cuánto capital se ha invertido?
- ¿Cuál es el equity actual?
- ¿La renta está alineada con el mercado?
- ¿Conviene remodelar, refinanciar, mantener o vender?

## 1.3 Investment Management — Inversión

- ¿Conviene comprar una nueva propiedad?
- ¿A qué precio?
- ¿Con qué financiamiento?
- ¿Qué rendimiento esperamos?
- ¿Qué ocurre en un escenario pesimista, base u optimista?
- ¿Cómo se compara una oportunidad contra el portafolio actual?

## 1.4 Market Intelligence — Inteligencia de mercado

- ¿Qué ciudades o zonas están creciendo?
- ¿Cómo evolucionan los precios y rentas?
- ¿Dónde aumenta el empleo?
- ¿Dónde crece la población?
- ¿Qué zonas tienen más actividad económica?
- ¿Qué efecto tienen las tasas de interés?
- ¿Dónde se están concentrando nuevos negocios?
- ¿Qué mercados parecen atractivos para investigación adicional?

El objetivo no es construir una hoja de cálculo.

El objetivo es construir un:

> **Real Estate Operating System**

Google Sheets será únicamente una de sus primeras capas.

---

# 2. Principios de arquitectura

## 2.1 Datos antes que intuición

Las decisiones de inversión deben apoyarse en información observable y métricas reproducibles.

El sistema deberá distinguir claramente entre:

- datos observados,
- cálculos,
- supuestos,
- estimaciones,
- escenarios,
- pronósticos,
- análisis cualitativo,
- decisiones humanas.

Ejemplo:

```text
Renta observada actual:       $18,000
Vacancia histórica:              4.7%
Vacancia asumida futura:          6.0%
Apreciación esperada:             3.5%
```

Nunca deben mezclarse sin indicar su origen.

---

## 2.2 Cálculos deterministas antes que IA

La inteligencia artificial puede:

- explicar,
- resumir,
- comparar,
- detectar anomalías,
- proponer preguntas,
- preparar reportes.

No debe ser la fuente silenciosa de cálculos financieros.

Flujo preferido:

```text
DATOS
  ↓
VALIDACIÓN
  ↓
CÁLCULOS DETERMINISTAS
  ↓
MÉTRICAS
  ↓
ESCENARIOS
  ↓
RIESGOS
  ↓
INTERPRETACIÓN CON IA
  ↓
DECISIÓN HUMANA
```

---

## 2.3 Simplicidad operativa

Una persona no técnica debe poder usar el sistema sin entender:

- fórmulas,
- Apps Script,
- relaciones de bases de datos,
- CFDI internamente,
- APIs,
- código.

Ejemplo de experiencia:

```text
Departamento: Roma 2
Mes: Septiembre 2026
Pago recibido: $18,000
Fecha: 05/09/2026

[ REGISTRAR PAGO ]
```

La complejidad debe quedar detrás de la interfaz.

---

## 2.4 El modelo no debe depender de Google Sheets

Google Sheets será la base operativa inicial.

Sin embargo, las entidades deben poder migrarse posteriormente a:

- PostgreSQL,
- Cloud SQL,
- Supabase,
- BigQuery,
- u otra base relacional.

El negocio debe definirse mediante entidades y relaciones, no por coordenadas como:

```text
Hoja1!A2:Z500
```

---

## 2.5 Auditoría

Los movimientos importantes deben dejar huella.

Ejemplos:

- cambio de renta,
- registro de pago,
- modificación de contrato,
- emisión de CFDI,
- cancelación de CFDI,
- cambio de supuestos de inversión,
- actualización de valuación,
- decisión de compra o rechazo.

---

# 3. Dominios principales

```text
REAL ESTATE OS
│
├── 1. OPERACIÓN INMOBILIARIA
│
├── 2. GESTIÓN DEL ACTIVO
│
├── 3. GESTIÓN DE INVERSIONES
│
├── 4. INTELIGENCIA DE MERCADO
│
└── 5. AUTOMATIZACIÓN E INTEGRACIONES
```

---

# 4. Perfiles de usuario

## 4.1 Operador familiar

Interfaz extremadamente sencilla.

Funciones:

- ver departamentos,
- registrar pagos,
- consultar pendientes,
- reportar mantenimiento,
- revisar contratos próximos a vencer,
- consultar facturas.

No debería editar directamente tablas complejas.

---

## 4.2 Administrador del portafolio

Puede gestionar:

- propiedades,
- unidades,
- contratos,
- inquilinos,
- cobros,
- gastos,
- mantenimiento,
- documentos,
- CFDI.

---

## 4.3 Asset manager / inversionista

Accede a:

- NOI,
- cash flow,
- presupuestos,
- deuda,
- valuaciones,
- escenarios,
- oportunidades,
- mercado,
- rendimiento del portafolio.

---

## 4.4 Contador / colaborador fiscal

Acceso limitado a:

- perfiles fiscales,
- CFDI,
- pagos,
- comprobantes,
- reportes fiscales.

Debe aplicar el principio de menor privilegio.

---

# 5. Arquitectura general

```text
USUARIOS
   │
   ├── Interfaz familiar
   ├── Interfaz administrativa
   └── Interfaz analítica
            │
            ▼
      CAPA DE APLICACIÓN
            │
            ▼
      SERVICIOS DE DOMINIO
            │
     ┌──────┼──────────┐
     │      │          │
     ▼      ▼          ▼
 Operación Finanzas   Fiscal
     │      │          │
     ▼      ▼          ▼
 Sheets  Analítica    PAC
     │
     ├── Drive
     ├── Gmail
     ├── Calendar
     └── Market Intelligence
            │
            ├── INEGI
            ├── Banxico
            ├── SHF
            ├── DENUE
            └── otras fuentes
```

---

# 6. Fuentes de verdad

| Información | Fuente de verdad inicial |
|---|---|
| Código | GitHub |
| Arquitectura | GitHub |
| Propiedades | Google Sheets |
| Unidades | Google Sheets |
| Personas | Google Sheets |
| Contratos | Google Sheets |
| Cargos | Google Sheets |
| Pagos | Google Sheets |
| Gastos | Google Sheets |
| Mantenimiento | Google Sheets |
| Deuda | Google Sheets |
| Valuaciones | Google Sheets |
| Metadatos CFDI | Google Sheets |
| XML/PDF CFDI | Google Drive |
| Contratos y documentos | Google Drive |
| Datos de mercado raw | almacenamiento externo/local |
| Datos de mercado procesados | Sheets inicialmente |
| Secretos | gestor seguro / Script Properties |
| Código y configuración pública | GitHub |

---

# 7. Modelo de dominio

## 7.1 Party

Representa una persona u organización.

Roles posibles:

- propietario,
- inquilino,
- obligado solidario,
- proveedor,
- corredor,
- administrador,
- contador.

Campos conceptuales:

```text
party_id
party_type
legal_name
preferred_name
email
phone
status
created_at
updated_at
```

---

## 7.2 FiscalProfile

Separado de Party.

```text
fiscal_profile_id
party_id
rfc
legal_name
tax_regime
fiscal_zip_code
default_cfdi_use
status
```

Nunca almacenar aquí:

- contraseña SAT,
- e.firma privada,
- archivos `.key`,
- claves de PAC.

---

## 7.3 Property

Representa el inmueble o activo físico.

```text
property_id
property_name
property_type
street
neighborhood
municipality
state
postal_code
country
latitude
longitude
acquisition_date
acquisition_price
predial_account
status
notes
```

---

## 7.4 Unit

Representa la unidad rentable.

```text
unit_id
property_id
unit_name
unit_type
floor
bedrooms
bathrooms
parking_spaces
area_m2
rentable_area_m2
status
```

Una propiedad puede contener una o muchas unidades.

---

## 7.5 Ownership

Permite copropiedad.

```text
ownership_id
party_id
property_id
ownership_percentage
start_date
end_date
```

---

# 8. Contratos

## Lease

```text
lease_id
unit_id
start_date
end_date
base_rent
deposit_required
payment_due_day
payment_frequency
rent_adjustment_rule
status
contract_document_id
```

Estados:

```text
DRAFT
ACTIVE
EXPIRING
ENDED
TERMINATED
```

---

## LeaseParty

Permite varios participantes en un mismo contrato.

```text
lease_party_id
lease_id
party_id
role
```

Roles:

```text
TENANT
CO_TENANT
GUARANTOR
LEGAL_REPRESENTATIVE
```

---

# 9. Ledger de rentas

El sistema no debe utilizar únicamente:

```text
Septiembre = Pagado
```

Debe utilizar cargos y pagos.

## RentCharge

Representa dinero que se debe.

```text
charge_id
lease_id
charge_type
period
due_date
original_amount
adjustments
current_amount
status
```

Tipos:

```text
RENT
LATE_FEE
UTILITY
REPAIR
OTHER
```

---

## Payment

Representa dinero recibido.

```text
payment_id
party_id
date_received
amount
payment_method
reference
bank_account_reference
notes
status
```

---

## PaymentAllocation

Relaciona un pago con uno o varios cargos.

```text
allocation_id
payment_id
charge_id
allocated_amount
```

Ejemplo:

```text
Renta septiembre: $20,000

Pago 03/09:        $12,000
Pago 09/09:         $8,000
Saldo:                  $0
```

Esto permite:

- pagos parciales,
- anticipos,
- varios pagos por renta,
- un pago para varios cargos.

---

# 10. Depósitos en garantía

El depósito no debe registrarse como renta.

```text
deposit_id
lease_id
amount_received
date_received
amount_held
amount_returned
deductions
return_date
status
```

---

# 11. Gastos y CapEx

Se deben separar:

```text
Gasto operativo
CapEx
Servicio de deuda
Impuestos
```

## Expense

```text
expense_id
property_id
unit_id
vendor_party_id
expense_category
description
date
amount
tax_amount
invoice_reference
payment_method
document_id
status
```

Ejemplos:

- cuota de mantenimiento,
- agua,
- electricidad,
- seguro,
- administración,
- reparaciones menores,
- limpieza,
- contabilidad,
- gastos legales.

---

## CapitalExpenditure

```text
capex_id
property_id
unit_id
project_name
budget
actual_cost
start_date
completion_date
expected_useful_life
notes
```

Ejemplos:

- remodelación integral,
- cambio de cocina,
- instalación eléctrica mayor,
- impermeabilización importante,
- renovación estructural.

---

# 12. Mantenimiento

## WorkOrder

```text
work_order_id
property_id
unit_id
reported_by
reported_at
category
description
priority
vendor_party_id
estimated_cost
actual_cost
status
completed_at
```

Estados:

```text
REPORTED
TRIAGED
APPROVED
SCHEDULED
IN_PROGRESS
COMPLETED
CANCELLED
```

---

# 13. Documentos

Los archivos deben vivir en Google Drive.

La base almacena referencias.

## Document

```text
document_id
entity_type
entity_id
document_type
drive_file_id
file_name
created_at
expiration_date
status
```

Tipos:

```text
LEASE
ID
FISCAL_DOCUMENT
CFDI_XML
CFDI_PDF
PROPERTY_TITLE
PREDIAL
INSURANCE
MAINTENANCE_RECEIPT
EXPENSE_RECEIPT
VALUATION
OTHER
```

---

# 14. Estructura de Drive

```text
Real Estate OS/
│
├── Properties/
│   ├── CDMX-P001/
│   │   ├── Legal/
│   │   ├── Contracts/
│   │   ├── CFDI/
│   │   │   ├── 2026/
│   │   │   └── 2027/
│   │   ├── Maintenance/
│   │   ├── Expenses/
│   │   └── Valuations/
│   │
│   └── CDMX-P002/
│
├── Portfolio/
│   ├── Reports/
│   ├── Budgets/
│   └── Tax/
│
├── Market Data/
│   ├── Raw/
│   ├── Processed/
│   └── Reports/
│
└── Deals/
```

---

# 15. Dominio fiscal / CFDI

La lógica fiscal debe estar separada del resto del sistema.

Definir una interfaz conceptual:

```text
FiscalProvider
```

Operaciones:

```text
createInvoice()
validateInvoice()
stampInvoice()
cancelInvoice()
getInvoiceStatus()
downloadXML()
generatePDF()
```

Implementaciones futuras:

```text
FacturamaProvider
FinkokProvider
OtherPACProvider
```

El sistema no debe depender permanentemente de un PAC específico.

---

## Invoice

```text
invoice_id
issuer_party_id
receiver_party_id
related_property_id
related_unit_id
issue_date
subtotal
taxes
withholdings
total
currency
status
pac_provider
uuid
xml_document_id
pdf_document_id
```

Estados:

```text
DRAFT
VALIDATED
READY_TO_STAMP
STAMPED
CANCEL_PENDING
CANCELLED
ERROR
```

---

# 16. Gestión del activo

## Ingreso potencial

\[
GSR = \sum RentasContratadas
\]

## Ingreso efectivo

\[
ERI = GSR - Vacancia - Incobrables - Concesiones
\]

## NOI

\[
NOI = IngresoOperativo - GastosOperativos
\]

El servicio de deuda y CapEx no forman parte del NOI.

## Cap Rate

\[
CapRate = \frac{NOI}{ValorDelInmueble}
\]

## Cash-on-Cash

\[
CoC =
\frac{FlujoAnualAntesDeImpuestos}
{CapitalInvertido}
\]

## LTV

\[
LTV =
\frac{SaldoDeuda}
{ValorInmueble}
\]

## DSCR

\[
DSCR =
\frac{NOI}
{ServicioDeDeuda}
\]

## OER

\[
OER =
\frac{GastosOperativos}
{IngresoBrutoEfectivo}
\]

## Renta por m²

\[
RentaPorM2 =
\frac{RentaMensual}
{AreaRentable}
\]

---

# 17. Presupuesto

Cada propiedad deberá manejar:

```text
Actual
Budget
Forecast
Variance
```

\[
Variance = Actual - Budget
\]

---

# 18. Deuda

## Loan

```text
loan_id
property_id
lender
original_principal
current_balance
interest_rate
interest_type
origination_date
maturity_date
payment_frequency
monthly_payment
status
```

Futuro:

- amortización,
- refinanciamiento,
- DSCR,
- LTV,
- debt yield,
- alertas de vencimiento.

---

# 19. Valuaciones

Nunca sobrescribir simplemente el valor actual.

Usar historial.

## Valuation

```text
valuation_id
property_id
valuation_date
valuation_method
estimated_value
source
confidence
notes
```

Métodos:

```text
APPRAISAL
MARKET_COMPARABLES
CAP_RATE
OWNER_ESTIMATE
MODEL_ESTIMATE
PURCHASE_PRICE
```

---

# 20. Gestión de oportunidades

Una oportunidad no debe convertirse en Property hasta ser adquirida.

## Deal

```text
deal_id
deal_name
city
neighborhood
property_type
asking_price
source
listing_url
status
date_added
decision
decision_reason
```

Estados:

```text
DISCOVERED
SCREENING
UNDERWRITING
DUE_DILIGENCE
NEGOTIATION
REJECTED
ACQUIRED
LOST
```

Los deals rechazados deben conservarse.

Son datos de mercado útiles.

---

# 21. Underwriting

## Adquisición

```text
purchase_price
closing_costs
taxes
broker_fees
renovation
initial_capex
```

## Financiamiento

```text
down_payment
loan_amount
interest_rate
loan_term
origination_cost
```

## Operación

```text
market_rent
vacancy_rate
rent_growth
maintenance
management
insurance
property_tax
HOA
utilities
capex_reserve
```

## Salida

```text
holding_period
appreciation
exit_cap_rate
selling_cost
```

---

# 22. Escenarios

Como mínimo:

```text
BEAR
BASE
BULL
```

Cada supuesto debe ser visible.

---

# 23. Métricas de inversión

El Deal Analyzer deberá calcular progresivamente:

```text
NOI
Cap Rate
Cash Flow
Cash-on-Cash
DSCR
LTV
Debt Yield
IRR / TIR
Equity Multiple
Break-even Occupancy
Break-even Rent
NPV / VPN
Total Return
Equity Build-up
```

No debe existir una calificación opaca del estilo:

```text
Esta propiedad es 8.7/10
```

sin explicar cómo se obtuvo.

---

# 24. Registro de decisiones

Cada oportunidad debería guardar:

```text
Decisión
Fecha
Responsable
Motivo
Métricas observadas
Supuestos
Riesgos
Condiciones de mercado
```

Esto permitirá evaluar en el futuro si nuestras decisiones fueron correctas.

---

# 25. Inteligencia de mercado

La inteligencia de mercado debe ser un subsistema independiente.

Debe trabajar a diferentes niveles:

```text
País
Estado
Zona metropolitana
Municipio
Colonia
Microlocalización
```

---

# 26. Datos potenciales

## Vivienda

- precio de venta,
- precio por m²,
- renta,
- renta por m²,
- apreciación,
- inventario,
- construcción,
- crédito hipotecario,
- oferta.

## Demografía

- población,
- crecimiento,
- hogares,
- migración,
- edad,
- educación,
- tamaño del hogar.

## Economía

- empleo,
- desempleo,
- empleo formal,
- ingreso,
- unidades económicas,
- sectores productivos,
- actividad económica.

## Estructura urbana

- transporte,
- universidades,
- hospitales,
- centros comerciales,
- zonas laborales,
- parques,
- infraestructura.

## Finanzas

- tasas de interés,
- tasas hipotecarias,
- inflación,
- condiciones crediticias.

---

# 27. Fuentes mexicanas

Fuentes candidatas iniciales:

```text
INEGI
├── Censo de Población
├── Censos Económicos
├── BIE / indicadores
├── DENUE
└── cartografía

Banxico
├── tasas de interés
├── inflación
├── crédito
└── indicadores macrofinancieros

SHF
├── índice de precios de vivienda
└── información hipotecaria

Portales de datos abiertos
├── movilidad
├── infraestructura
├── servicios
└── desarrollo urbano
```

Cada fuente deberá documentar:

- URL,
- institución,
- frecuencia,
- licencia,
- método de descarga,
- granularidad,
- fecha de recuperación,
- confiabilidad.

---

# 28. Pipeline de datos de mercado

```text
FUENTE
  ↓
DESCARGA
  ↓
RAW
  ↓
VALIDACIÓN
  ↓
NORMALIZACIÓN
  ↓
CURATED
  ↓
INDICADORES
  ↓
ANÁLISIS
```

Los datos raw nunca se modifican manualmente.

---

# 29. MarketObservation

```text
observation_id
geography_id
metric_id
period
value
unit
source_id
retrieved_at
```

---

# 30. Geography

```text
geography_id
geography_type
country
state
municipality
locality
neighborhood
official_code
latitude
longitude
geometry_reference
```

Cuando exista un código oficial, debe preferirse sobre nombres.

---

# 31. DatasetSource

```text
source_id
institution
dataset_name
url
license
update_frequency
retrieved_at
notes
```

---

# 32. Comparables

## Comparable

```text
comparable_id
deal_id
observation_date
transaction_or_listing
sale_or_rent
price
rent
area_m2
price_per_m2
bedrooms
bathrooms
parking
distance
source
location
```

Todo comparable debe tener fecha.

---

# 33. Tecnología V1

## Operación

```text
Google Sheets
Google Apps Script
Google Drive
GitHub
```

## Interfaz

Posible:

```text
AppSheet
```

## Desarrollo

```text
VS Code
Git
GitHub
clasp
```

## Datos de mercado

Inicialmente:

```text
Python
Pandas
DuckDB
Parquet
```

Futuro:

```text
PostgreSQL
BigQuery
Cloud SQL
Supabase
```

---

# 34. Repositorio

```text
real-estate-os/
│
├── README.md
├── LICENSE
├── .gitignore
├── package.json
├── .claspignore
│
├── docs/
│   ├── architecture-v1.md
│   ├── data-model.md
│   ├── business-rules.md
│   ├── fiscal-flow.md
│   ├── market-data.md
│   ├── security.md
│   ├── roadmap.md
│   └── adr/
│
├── src/
│   ├── bootstrap/
│   ├── domain/
│   ├── repositories/
│   ├── services/
│   ├── analytics/
│   ├── integrations/
│   ├── ui/
│   └── utils/
│
├── market/
│   ├── ingestion/
│   ├── transforms/
│   ├── analytics/
│   └── models/
│
├── tests/
│
├── examples/
│   └── synthetic-data/
│
└── scripts/
```

---

# 35. Repositorio público y privacidad

El repositorio **puede ser público**.

De hecho, hacerlo público puede tener varias ventajas:

- demostrar capacidad técnica,
- mostrar arquitectura de sistemas,
- documentar conocimiento inmobiliario,
- mostrar análisis financiero,
- enseñar integración con APIs,
- recibir contribuciones externas,
- construir reputación profesional,
- crear un proyecto interesante de portafolio.

Sin embargo, el repositorio público debe contener únicamente:

```text
Código
Documentación
Esquemas
Datos sintéticos
Ejemplos ficticios
Pruebas
Plantillas
```

Nunca debe contener información real del portafolio.

---

# 36. Información que nunca debe subirse a GitHub

```text
RFC reales
CURP
INE
pasaportes
contratos reales
direcciones privadas sensibles
teléfonos
emails personales
cuentas bancarias
estados de cuenta
XML fiscales reales
PDF de CFDI reales
archivos .key
archivos .cer privados
contraseñas SAT
tokens OAuth
API keys
credenciales PAC
datos de inquilinos
datos financieros privados
IDs internos de documentos sensibles
```

---

# 37. Datos sintéticos

Para demostrar el sistema públicamente utilizaremos datos ficticios.

Ejemplo:

```text
PROP-000001
Departamento Demo Roma

Tenant:
María Ejemplo

RFC:
XAXX010101000

Renta:
$18,500

Pago:
Septiembre 2026
```

El repositorio debe incluir un dataset demostrativo suficientemente completo para que cualquier persona pueda probar el sistema sin tener acceso a información privada.

---

# 38. Separación código / datos

Arquitectura recomendada:

```text
GitHub Público
     │
     ├── código
     ├── documentación
     ├── tests
     └── datos sintéticos

Google Workspace Privado
     │
     ├── Sheets reales
     ├── Drive real
     ├── contratos
     ├── CFDI
     └── información de inquilinos

Secret Manager / Properties
     │
     └── credenciales
```

El código sabe cómo conectarse.

Los datos privados nunca viven en el repositorio.

---

# 39. Configuración y secretos

Ejemplo público:

```text
config.example.json
```

Puede contener:

```json
{
  "spreadsheet_id": "YOUR_SPREADSHEET_ID",
  "drive_root_folder": "YOUR_DRIVE_FOLDER_ID",
  "environment": "DEV"
}
```

El archivo real:

```text
config.local.json
```

debe estar ignorado por Git.

---

# 40. .gitignore inicial

```gitignore
# Credenciales
.env
.env.*
*.key
*.pem
*.p12
*.pfx
*.cer

# Google / clasp local auth
.clasprc.json

# Configuración privada
config.local.json
secrets.json

# Datos reales
data/private/
data/raw/private/
exports/private/
backups/

# Documentos
*.xml
private-documents/

# Sistema
.DS_Store
Thumbs.db

# Node
node_modules/
```

---

# 41. Open source

Si el repositorio será público, deberá definirse una licencia.

Opciones candidatas:

## MIT

Muy permisiva.

Permite:

- uso personal,
- uso comercial,
- modificación,
- distribución.

Adecuada si se busca máxima adopción.

## Apache 2.0

También permisiva.

Añade disposiciones explícitas relacionadas con patentes.

## AGPL

Requiere compartir modificaciones cuando el software modificado se ofrece como servicio.

Puede ser interesante si se desea proteger que futuras plataformas SaaS mantengan abierto el código.

La licencia deberá decidirse mediante un ADR antes de publicar una versión estable.

---

# 42. Marca y datos

El código puede ser abierto.

Los siguientes activos no necesariamente tienen que serlo:

```text
datos privados
datasets propios
modelos propietarios
marca
logos
estrategias internas
documentos fiscales
bases históricas reales
```

Una arquitectura abierta no implica publicar el patrimonio familiar.

---

# 43. Arquitectura por capas

## Domain

Define:

```text
Property
Unit
Party
Lease
RentCharge
Payment
Expense
Deal
```

No debe conocer Google Sheets directamente.

---

## Repositories

Interfaces:

```text
PropertyRepository
LeaseRepository
PaymentRepository
```

Implementación V1:

```text
SheetsPropertyRepository
```

Futuro:

```text
PostgresPropertyRepository
```

---

## Services

Ejemplos:

```text
LeaseService
PaymentService
InvoiceService
MaintenanceService
PortfolioService
DealService
MarketService
```

---

## Analytics

Funciones puras cuando sea posible:

```text
calculateNOI()
calculateCapRate()
calculateCashOnCash()
calculateDSCR()
calculateIRR()
calculateEquity()
```

---

# 44. Entornos

Mínimo:

```text
DEV
PROD
```

## DEV

- datos sintéticos,
- pruebas,
- experimentación,
- operaciones destructivas.

## PROD

- datos reales,
- acceso restringido,
- backups,
- auditoría.

Nunca desarrollar directamente contra producción.

---

# 45. Google Sheets como base inicial

Cada pestaña representa conceptualmente una tabla.

Posibles tablas:

```text
Properties
Units
Parties
FiscalProfiles
Ownership
Leases
LeaseParties
RentCharges
Payments
PaymentAllocations
SecurityDeposits
Expenses
CapEx
WorkOrders
Documents
Invoices
InvoiceLines
Loans
Valuations
Budgets
Deals
DealAssumptions
Scenarios
MarketObservations
DatasetSources
AuditLog
Settings
```

---

# 46. Reglas de Sheets

1. Una fila = un registro.
2. Nunca usar celdas combinadas en tablas.
3. Cada registro tiene ID inmutable.
4. Relaciones mediante IDs.
5. Dinero como número.
6. Fechas consistentes.
7. Enums controlados.
8. Dashboards separados de datos raw.
9. Nunca usar números de fila como ID.
10. No editar manualmente columnas calculadas protegidas.

---

# 47. IDs

Ejemplos:

```text
PROP-000001
UNIT-000001
PARTY-000001
LEASE-000001
CHARGE-202609-000001
PAY-202609-000001
EXP-202609-000001
WO-000001
INV-202609-000001
DEAL-000001
DOC-000001
```

---

# 48. Audit Log

```text
event_id
timestamp
user
action
entity_type
entity_id
previous_value
new_value
source
```

Ejemplo:

```text
LEASE_RENT_UPDATED
LEASE-000004
17000
18000
ADMIN_UI
```

---

# 49. Seguridad

Clasificación:

## Baja sensibilidad

- métricas públicas,
- nombres ficticios,
- datasets abiertos.

## Interna

- rentas,
- gastos,
- presupuestos,
- valuaciones.

## Datos personales

- nombres,
- RFC,
- contratos,
- correos,
- teléfonos.

## Secretos

- passwords,
- e.firma,
- tokens,
- API keys,
- credenciales bancarias.

Los secretos nunca deben almacenarse:

```text
GitHub
Google Sheets
código fuente
```

---

# 50. Dashboards

## Familiar

- rentas cobradas,
- rentas pendientes,
- mantenimientos,
- contratos próximos,
- facturas pendientes.

## Operaciones

- ocupación,
- morosidad,
- cargos,
- cobros,
- vencimientos,
- órdenes abiertas.

## Asset Management

- NOI,
- cash flow,
- Budget vs Actual,
- CapEx,
- equity,
- deuda,
- valuación.

## Inversiones

- deals,
- IRR,
- CoC,
- DSCR,
- Cap Rate,
- escenarios.

## Mercado

- renta/m²,
- venta/m²,
- apreciación,
- población,
- empleo,
- tasas,
- actividad económica.

---

# 51. IA futura

La IA podrá ayudar a:

- resumir desempeño,
- detectar gastos anómalos,
- explicar variaciones,
- comparar propiedades,
- preparar investment memos,
- leer contratos,
- clasificar gastos,
- generar preguntas de due diligence.

No debe modificar registros críticos sin confirmación.

---

# 52. Risk Register

Entidad futura:

```text
risk_id
entity_type
entity_id
category
description
probability
impact
mitigation
status
```

Categorías:

- vacancia,
- legal,
- estructural,
- mantenimiento,
- tasa,
- mercado,
- liquidez,
- regulación,
- ubicación,
- ambiental.

---

# 53. ADR — Architecture Decision Records

Directorio:

```text
docs/adr/
```

Primeros ADR sugeridos:

```text
ADR-001-use-google-sheets-v1.md
ADR-002-use-ledger-model.md
ADR-003-separate-market-pipeline.md
ADR-004-pac-provider-abstraction.md
ADR-005-public-repository-private-data.md
ADR-006-open-source-license.md
```

Cada ADR debe contener:

```text
Contexto
Decisión
Alternativas
Consecuencias
```

---

# 54. Pruebas

## Unit tests

Para:

- NOI,
- Cap Rate,
- IRR,
- DSCR,
- asignación de pagos,
- saldos,
- validaciones.

## Integration tests

Para:

- Sheets,
- Drive,
- PAC,
- importación de datos.

## Dataset demo

DEV debe poder funcionar con datos 100% sintéticos.

---

# 55. Observabilidad

Los errores deben ser claros.

Ejemplo:

```text
INVOICE_VALIDATION_FAILED

Invoice: INV-202609-00017
Reason: Missing receiver fiscal ZIP code
Timestamp: ...
```

---

# 56. Roadmap técnico

## Etapa 1

```text
Sheets
Apps Script
Drive
GitHub
```

## Etapa 2

```text
AppSheet
PAC
automatización documental
dashboards
```

## Etapa 3

```text
market ingestion
INEGI
Banxico
SHF
DENUE
```

## Etapa 4

```text
PostgreSQL / equivalente
API
aplicación web
```

---

# 57. Alcance V1

Debe incluir:

```text
Properties
Units
Parties
Ownership
Leases
RentCharges
Payments
PaymentAllocations
Expenses
Maintenance
Documents
Basic CFDI Tracking
Loans
Valuations
Audit Log
Dashboard básico
Deal Registry
Deal Analyzer básico
Settings
```

---

# 58. V1.5

```text
PAC
CFDI automatizado
Drive automation
Email
alertas
Budget vs Actual
dashboard avanzado
```

---

# 59. V2

```text
INEGI
Banxico
SHF
DENUE
comparables
market dashboards
market screening
```

---

# 60. V3

```text
IRR
NPV
debt scenarios
portfolio analytics
risk models
investment memos
AI research assistant
```

---

# 61. Lo que NO será V1

No intentar construir inmediatamente:

- ERP contable completo,
- conciliación bancaria completa,
- sustituto del contador,
- marketplace inmobiliario,
- CRM masivo,
- plataforma de construcción,
- gestor autónomo de inversiones,
- sistema institucional completo.

Primero debemos construir una base sólida.

---

# 62. Flujos principales

## Renta

```text
Contrato activo
  ↓
Cargo de renta
  ↓
Pago esperado
  ↓
Pago recibido
  ↓
Asignación
  ↓
Saldo
  ↓
Validación fiscal
  ↓
CFDI
  ↓
Drive
  ↓
Dashboard
```

## Mantenimiento

```text
Reporte
  ↓
Work Order
  ↓
Prioridad
  ↓
Proveedor
  ↓
Cotización
  ↓
Aprobación
  ↓
Trabajo
  ↓
Expense / CapEx
```

## Deal

```text
Oportunidad
  ↓
Screening
  ↓
Underwriting
  ↓
Escenarios
  ↓
Riesgo
  ↓
Due diligence
  ↓
Negociación
  ↓
Decisión

ACQUIRE → Property
REJECT  → histórico
```

---

# 63. Ventaja estratégica

El activo más importante de Real Estate OS no será el software.

Será la base histórica.

Con el tiempo se acumularán:

```text
rentas reales
vacancia
morosidad
mantenimiento
CapEx
gastos
valuaciones
apreciación
deuda
supuestos
deals
errores de pronóstico
decisiones
mercado
```

Esto permitirá responder preguntas como:

- ¿Qué tipo de inmueble ha producido mejor rendimiento?
- ¿Qué gastos solemos subestimar?
- ¿Qué zonas superaron nuestras expectativas?
- ¿Qué supuestos fueron demasiado optimistas?
- ¿Qué variables anticiparon crecimiento en rentas?
- ¿Cuáles fueron nuestros mejores momentos para comprar?

Ese historial puede convertirse en una ventaja competitiva.

---

# 64. Definición de éxito

El sistema será exitoso si:

## Operación

Una persona no técnica entiende qué sucede.

## Administración

Cada pago, contrato, gasto y mantenimiento es rastreable.

## Finanzas

Cada inmueble tiene métricas claras.

## Inversión

Cada compra se analiza bajo una metodología consistente.

## Mercado

Cada decisión futura depende progresivamente más de datos y menos de intuición.

## Tecnología

El sistema puede crecer sin redefinir completamente el dominio.

## Open Source

El código puede mostrarse públicamente sin exponer información privada del portafolio.

---

# 65. Próximos documentos

```text
docs/
├── architecture-v1.md
├── data-model.md
├── business-rules.md
├── fiscal-flow.md
├── market-data.md
├── security.md
├── roadmap.md
└── adr/
```

Orden recomendado:

```text
1. architecture-v1.md
2. data-model.md
3. business-rules.md
4. security.md
5. fiscal-flow.md
6. market-data.md
7. roadmap.md
```

---

# 66. Declaración final

Real Estate OS se diseñará bajo esta idea:

> **Operar cada inmueble como un negocio, evaluar cada activo como una inversión, analizar cada adquisición como una decisión de asignación de capital y conservar los datos generados para que cada decisión futura sea mejor que la anterior.**

Google Sheets será el punto de partida.

El verdadero valor será el sistema de información, la disciplina de análisis y el historial acumulado.
