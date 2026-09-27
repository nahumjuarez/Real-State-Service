# Modelo de datos — Real Estate OS

> Estado: borrador de diseño  
> Objetivo: traducir la arquitectura a entidades persistentes que puedan vivir inicialmente en Google Sheets y migrar posteriormente a una base relacional.

## 1. Principios

- Una fila representa un registro.
- Cada entidad tiene un ID inmutable.
- Las relaciones usan IDs, no nombres.
- Los valores históricos relevantes no se sobrescriben.
- Los documentos viven fuera de la tabla; la tabla conserva referencias.
- Los datos fiscales se separan de los datos generales de una persona.
- Los cálculos derivados no sustituyen los datos originales.
- El modelo no depende de números de fila ni de nombres de pestañas.

## 2. Relaciones principales

```text
PARTY ──< OWNERSHIP >── PROPERTY ──< UNIT ──< LEASE
  │                                      │        │
  │                                      │        ├──< LEASE_PARTY >── PARTY
  │                                      │        └──< RENT_CHARGE
  │                                      │                  │
  │                                      │                  └──< PAYMENT_ALLOCATION >── PAYMENT
  │                                      │
  │                                      ├──< WORK_ORDER >── PARTY(VENDOR)
  │                                      ├──< EXPENSE
  │                                      └──< CAPEX
  │
  └── FISCAL_PROFILE

PROPERTY ──< LOAN
PROPERTY ──< VALUATION
PROPERTY ──< DOCUMENT
PROPERTY ──< ACCESS_PROFILE
UNIT ──< ACCESS_PROFILE

DEAL ──< DEAL_ASSUMPTION
DEAL ──< SCENARIO
DEAL ──< COMPARABLE

GEOGRAPHY ──< MARKET_OBSERVATION >── DATASET_SOURCE
```

## 3. Tablas núcleo V1

### Properties

| Campo | Tipo | Regla |
|---|---|---|
| property_id | STRING PK | obligatorio, inmutable |
| property_name | STRING | obligatorio |
| property_type | ENUM | obligatorio |
| street | STRING | opcional en demo pública |
| neighborhood | STRING | opcional |
| municipality | STRING | obligatorio |
| state | STRING | obligatorio |
| postal_code | STRING | opcional |
| country | STRING | default `MX` |
| latitude | NUMBER | opcional |
| longitude | NUMBER | opcional |
| acquisition_date | DATE | opcional |
| acquisition_price | MONEY | >= 0 |
| predial_account | STRING | privado |
| status | ENUM | ACTIVE, INACTIVE, SOLD |
| created_at | DATETIME | sistema |
| updated_at | DATETIME | sistema |

### Units

| Campo | Tipo | Regla |
|---|---|---|
| unit_id | STRING PK | obligatorio |
| property_id | STRING FK | Properties |
| unit_name | STRING | obligatorio |
| unit_type | ENUM | APARTMENT, HOUSE, COMMERCIAL, OTHER |
| floor | STRING | opcional |
| bedrooms | INTEGER | >= 0 |
| bathrooms | NUMBER | >= 0 |
| parking_spaces | INTEGER | >= 0 |
| area_m2 | NUMBER | > 0 cuando exista |
| rentable_area_m2 | NUMBER | > 0 cuando exista |
| status | ENUM | VACANT, OCCUPIED, OFF_MARKET |

### AccessProfiles

Metadatos y referencias no secretas para accesos físicos y digitales. No es una bóveda.

| Campo | Tipo | Regla |
|---|---|---|
| access_profile_id | STRING PK | obligatorio |
| property_id | STRING FK | Properties |
| unit_id | STRING FK nullable | Units |
| access_type | ENUM | entrada, Wi-Fi, alarma, lockbox, portal, dispositivo u otro |
| label | STRING | obligatorio |
| login_identifier | STRING | usuario o identificador no secreto |
| vault_provider | ENUM | GOOGLE_PASSWORD_MANAGER, 1PASSWORD, BITWARDEN, OTHER |
| vault_item_reference | STRING | URL o identificador del elemento externo |
| instructions | STRING | solo instrucciones no secretas |
| status | ENUM | ACTIVE, INACTIVE |
| created_at | DATETIME | sistema |
| updated_at | DATETIME | sistema |

Nunca almacenar aquí passwords, PINs, códigos de puerta, códigos Wi-Fi, tokens o secretos equivalentes.

### Parties

Una persona u organización puede actuar en distintos roles.

| Campo | Tipo |
|---|---|
| party_id | STRING PK |
| party_type | ENUM PERSON, ORGANIZATION |
| legal_name | STRING |
| preferred_name | STRING |
| email | STRING |
| phone | STRING |
| status | ENUM |
| created_at | DATETIME |
| updated_at | DATETIME |

### FiscalProfiles

| Campo | Tipo |
|---|---|
| fiscal_profile_id | STRING PK |
| party_id | STRING FK |
| rfc | STRING |
| legal_name | STRING |
| tax_regime | STRING |
| fiscal_zip_code | STRING |
| default_cfdi_use | STRING |
| status | ENUM |

Nunca almacenar contraseñas SAT, e.firma privada o tokens PAC.

### Ownership

| Campo | Tipo |
|---|---|
| ownership_id | STRING PK |
| party_id | STRING FK |
| property_id | STRING FK |
| ownership_percentage | DECIMAL |
| start_date | DATE |
| end_date | DATE nullable |

### Leases

| Campo | Tipo |
|---|---|
| lease_id | STRING PK |
| unit_id | STRING FK |
| start_date | DATE |
| end_date | DATE |
| base_rent | MONEY |
| deposit_required | MONEY |
| payment_due_day | INTEGER 1..31 |
| payment_frequency | ENUM |
| rent_adjustment_rule | STRING |
| status | ENUM DRAFT, ACTIVE, EXPIRING, ENDED, TERMINATED |
| contract_document_id | STRING FK nullable |

### LeaseParties

| Campo | Tipo |
|---|---|
| lease_party_id | STRING PK |
| lease_id | STRING FK |
| party_id | STRING FK |
| role | ENUM TENANT, CO_TENANT, GUARANTOR, LEGAL_REPRESENTATIVE |

### RentCharges

| Campo | Tipo |
|---|---|
| charge_id | STRING PK |
| lease_id | STRING FK |
| charge_type | ENUM RENT, LATE_FEE, UTILITY, REPAIR, OTHER |
| period | YYYY-MM |
| due_date | DATE |
| original_amount | MONEY |
| adjustments | MONEY |
| current_amount | MONEY |
| status | ENUM OPEN, PARTIAL, PAID, VOID |

### Payments

| Campo | Tipo |
|---|---|
| payment_id | STRING PK |
| party_id | STRING FK |
| date_received | DATE |
| amount | MONEY |
| payment_method | ENUM |
| reference | STRING |
| notes | STRING |
| status | ENUM RECEIVED, REVERSED, VOID |

### PaymentAllocations

| Campo | Tipo |
|---|---|
| allocation_id | STRING PK |
| payment_id | STRING FK |
| charge_id | STRING FK |
| allocated_amount | MONEY |

### SecurityDeposits

| Campo | Tipo |
|---|---|
| deposit_id | STRING PK |
| lease_id | STRING FK |
| amount_received | MONEY |
| date_received | DATE |
| amount_held | MONEY |
| amount_returned | MONEY |
| deductions | MONEY |
| return_date | DATE nullable |
| status | ENUM HELD, PARTIALLY_RETURNED, RETURNED, APPLIED |

### Expenses

| Campo | Tipo |
|---|---|
| expense_id | STRING PK |
| property_id | STRING FK |
| unit_id | STRING FK nullable |
| vendor_party_id | STRING FK nullable |
| expense_category | ENUM |
| description | STRING |
| date | DATE |
| amount | MONEY |
| tax_amount | MONEY |
| document_id | STRING FK nullable |
| status | ENUM |

### CapEx

| Campo | Tipo |
|---|---|
| capex_id | STRING PK |
| property_id | STRING FK |
| unit_id | STRING FK nullable |
| project_name | STRING |
| budget | MONEY |
| actual_cost | MONEY |
| start_date | DATE |
| completion_date | DATE nullable |
| expected_useful_life | NUMBER nullable |
| notes | STRING |

### WorkOrders

| Campo | Tipo |
|---|---|
| work_order_id | STRING PK |
| property_id | STRING FK |
| unit_id | STRING FK nullable |
| reported_by | STRING FK |
| reported_at | DATETIME |
| category | ENUM |
| description | STRING |
| priority | ENUM LOW, NORMAL, HIGH, EMERGENCY |
| vendor_party_id | STRING FK nullable |
| estimated_cost | MONEY |
| actual_cost | MONEY |
| status | ENUM |

### Documents

| Campo | Tipo |
|---|---|
| document_id | STRING PK |
| entity_type | ENUM |
| entity_id | STRING |
| document_type | ENUM |
| drive_file_id | STRING |
| file_name | STRING |
| created_at | DATETIME |
| expiration_date | DATE nullable |
| status | ENUM |

### Invoices

| Campo | Tipo |
|---|---|
| invoice_id | STRING PK |
| issuer_party_id | STRING FK |
| receiver_party_id | STRING FK |
| related_property_id | STRING FK |
| related_unit_id | STRING FK nullable |
| issue_date | DATETIME |
| subtotal | MONEY |
| taxes | MONEY |
| withholdings | MONEY |
| total | MONEY |
| currency | STRING default MXN |
| status | ENUM |
| pac_provider | STRING nullable |
| uuid | STRING nullable |
| xml_document_id | STRING FK nullable |
| pdf_document_id | STRING FK nullable |

### Loans

| Campo | Tipo |
|---|---|
| loan_id | STRING PK |
| property_id | STRING FK |
| lender | STRING |
| original_principal | MONEY |
| current_balance | MONEY |
| interest_rate | DECIMAL |
| interest_type | ENUM |
| origination_date | DATE |
| maturity_date | DATE |
| monthly_payment | MONEY |
| status | ENUM |

### Valuations

| Campo | Tipo |
|---|---|
| valuation_id | STRING PK |
| property_id | STRING FK |
| valuation_date | DATE |
| valuation_method | ENUM |
| estimated_value | MONEY |
| source | STRING |
| confidence | DECIMAL nullable |
| notes | STRING |

## 4. Inversión

### Deals

| Campo | Tipo |
|---|---|
| deal_id | STRING PK |
| deal_name | STRING |
| geography_id | STRING FK nullable |
| property_type | ENUM |
| asking_price | MONEY |
| source | STRING |
| listing_url | STRING |
| status | ENUM |
| date_added | DATE |
| decision | ENUM nullable |
| decision_reason | STRING nullable |

Estados: DISCOVERED, SCREENING, UNDERWRITING, DUE_DILIGENCE, NEGOTIATION, REJECTED, ACQUIRED, LOST.

### DealAssumptions

Modelo largo recomendado:

| Campo | Tipo |
|---|---|
| assumption_id | STRING PK |
| deal_id | STRING FK |
| scenario_id | STRING FK |
| metric | STRING |
| value | NUMBER |
| unit | STRING |
| source_type | ENUM OBSERVED, ASSUMPTION, FORECAST |
| source_reference | STRING nullable |

Esto evita agregar una columna nueva cada vez que aparezca un supuesto.

## 5. Mercado

### Geographies

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

### DatasetSources

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

### MarketObservations

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

## 6. Auditoría

### AuditLog

```text
event_id
timestamp
actor
action
entity_type
entity_id
previous_value
new_value
source
```

## 7. Convención de IDs

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
ACCESS-000001
```

Los IDs no deben depender de números de fila.

## 8. Próximo paso

Convertir este documento en un `schema` declarativo que pueda ser leído por `setupRealEstateOS()` para crear automáticamente las hojas, encabezados, validaciones y rangos protegidos.
