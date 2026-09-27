# Onboarding UI v1 — Real Estate OS

## Objetivo

Cargar el portafolio inicial sin editar las tablas directamente y detectar inconsistencias antes de activar la automatización mensual.

El onboarding vive en una interfaz separada del panel operativo diario:

```text
Real Estate OS
├── Panel operativo
└── Onboarding del portafolio
```

## Flujo cubierto

```text
Parties
  ↓
Properties
  ↓
Ownership
  ↓
Units
  ↓
Leases + LeaseParties
  ↓
SecurityDeposits
  ↓
AccessProfiles
  ↓
validación
  ↓
automatización mensual
```

La interfaz permite:

- crear y corregir personas y organizaciones con auditoría;
- crear una propiedad con ownership inicial opcional;
- corregir metadatos de propiedades y unidades sin editar Sheets directamente;
- agregar ownership adicional;
- cerrar periodos de ownership sin borrar el histórico;
- crear unidades con datos físicos básicos;
- cargar un contrato vigente;
- registrar el depósito inicial en el mismo flujo del contrato;
- registrar un depósito pendiente de un contrato ya creado;
- preparar una renovación como `DRAFT`;
- activar una renovación `DRAFT`;
- registrar y editar referencias de acceso sin guardar secretos;
- revisar automáticamente bloqueos de onboarding.

## Reglas de readiness

El snapshot de onboarding detecta, entre otros:

- propiedades sin 100% de ownership activo;
- ownership concurrente superior a 100%;
- unidades marcadas `OCCUPIED` sin contrato activo;
- contratos activos sin inquilino;
- contratos que requieren depósito y aún no tienen depósito registrado.

`ensureOperationalTriggers()` consulta este readiness en PROD antes de instalar la automatización mensual.

## AccessProfiles y secretos

`AccessProfiles` no es una bóveda de contraseñas.

Guarda únicamente:

- propiedad y unidad relacionadas;
- tipo de acceso;
- etiqueta;
- usuario o identificador no secreto;
- proveedor de bóveda;
- referencia del elemento en la bóveda;
- instrucciones no secretas;
- estado.

No guarda:

- contraseñas;
- PIN;
- códigos de puerta;
- códigos Wi-Fi;
- tokens;
- secretos API.

Los secretos deben residir en un gestor de contraseñas controlado por la familia, por ejemplo Google Password Manager, 1Password o Bitwarden.

El servicio rechaza explícitamente payloads que intenten incluir campos de secreto comunes.

## Schema

Onboarding v1 introduce:

```text
Schema 0.2.0
App 0.3.1
```

Nueva tabla:

```text
AccessProfiles
├── access_profile_id
├── property_id
├── unit_id
├── access_type
├── label
├── login_identifier
├── vault_provider
├── vault_item_reference
├── instructions
├── status
├── created_at
└── updated_at
```

La migración es aditiva. Después de desplegar el código se debe ejecutar `setupRealEstateOS()` una vez en cada instancia para crear la nueva tabla y actualizar Settings.

## Prueba

En DEV:

```text
Real Estate OS
→ Desarrollo
→ Smoke test Onboarding
```

o ejecutar:

```javascript
runOnboardingSmokeTest()
```

La prueba crea únicamente datos sintéticos y valida:

- property bundle;
- 100% ownership;
- rechazo de ownership >100%;
- unidad;
- contrato activo;
- depósito inicial;
- referencia de acceso;
- rechazo de contraseña inline;
- renovación DRAFT;
- snapshot de onboarding.

Nunca ejecutar el smoke test en PROD.
