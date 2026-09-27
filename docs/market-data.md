# Inteligencia de mercado — Real Estate OS

## 1. Propósito

El módulo Market Intelligence debe ayudar a responder:

- ¿qué ciudades merecen investigación?
- ¿qué municipios/zonas muestran crecimiento?
- ¿cómo se comportan precios y rentas?
- ¿cómo cambian tasas y condiciones de crédito?
- ¿qué infraestructura y actividad económica existe?
- ¿cómo se compara un Deal con su mercado?

No será una sola pestaña de INEGI.

Será un pipeline reproducible.

## 2. Fuentes candidatas

### INEGI

- Censo de Población y Vivienda;
- Censos Económicos;
- BIE / indicadores;
- DENUE;
- cartografía y marcos geoestadísticos.

### Banco de México

- tasas;
- inflación;
- variables financieras;
- crédito y condiciones monetarias.

### SHF

- índices de precios de vivienda;
- información de vivienda/crédito disponible.

### Datos locales

- movilidad;
- infraestructura;
- desarrollo urbano;
- equipamiento;
- servicios.

### Mercado privado

- precios publicados;
- rentas publicadas;
- comparables.

El uso de fuentes privadas debe respetar términos de servicio y licencias.

## 3. Pipeline

```text
SOURCE
  ↓
INGEST
  ↓
RAW
  ↓
VALIDATE
  ↓
NORMALIZE
  ↓
CURATED
  ↓
FEATURES / INDICATORS
  ↓
ANALYSIS
  ↓
DEAL / PORTFOLIO
```

## 4. Tecnología

Para operación diaria:
- Apps Script.

Para datasets:
- Python;
- Pandas;
- DuckDB;
- Parquet.

Google Sheets no debe almacenar datasets masivos raw.

## 5. Estructura propuesta

```text
market/
├── ingestion/
├── transforms/
├── analytics/
└── models/

data/                  # no necesariamente versionado
├── raw/
├── staging/
└── curated/
```

## 6. Entidades

### DatasetSource

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

### Geography

```text
geography_id
geography_type
official_code
country
state
municipality
locality
neighborhood
latitude
longitude
geometry_reference
```

### MarketObservation

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

## 7. Primeras métricas

- venta/m²;
- renta/m²;
- gross yield aproximado;
- apreciación;
- población y crecimiento;
- empleo formal;
- densidad de unidades económicas;
- actividad sectorial;
- tasas hipotecarias / costo del crédito;
- accesibilidad a infraestructura.

## 8. Reglas metodológicas

- preservar periodo;
- preservar fuente;
- no sobrescribir históricos;
- diferenciar asking price de precio de transacción;
- diferenciar dato observado de estimado;
- documentar cambios metodológicos;
- mantener unidades consistentes;
- usar códigos geográficos oficiales donde existan.

## 9. Roadmap del módulo

### MI-0
Catálogo de fuentes y variables.

### MI-1
Descarga reproducible de una fuente oficial.

### MI-2
Normalización geográfica.

### MI-3
Series históricas y panel básico.

### MI-4
Comparables.

### MI-5
Market screening.

### MI-6
Modelos estadísticos y backtesting de hipótesis de inversión.
