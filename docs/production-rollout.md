# Production rollout — Real Estate OS

## Principio

PROD debe ser una instancia separada. DEV nunca debe convertirse simplemente en PROD porque contiene datos sintéticos y smoke tests.

```text
GitHub
  └── mismo código
       ├── Google Sheet DEV
       │    └── Apps Script DEV
       └── Google Sheet PROD
            └── Apps Script PROD
```

## Datos que nunca deben ir a GitHub

- nombres reales de inquilinos;
- RFC;
- contratos;
- documentos de identidad;
- cuentas prediales;
- referencias bancarias reales;
- CFDI reales;
- direcciones privadas cuando no deban publicarse;
- credenciales o secretos.

## Creación de PROD

1. Crear un Spreadsheet nuevo y privado, por ejemplo `Real Estate OS — PROD`.
2. Crear/vincular un proyecto Apps Script exclusivo para ese Sheet.
3. Conservar el proyecto DEV actual intacto.
4. Configurar localmente el nuevo `scriptId` y `parentId` sin subirlos a Git.
5. Ejecutar `setupRealEstateOS()`.
6. Confirmar que Settings contiene el Spreadsheet correcto.
7. Cambiar `environment` deliberadamente de DEV a PROD.
8. No ejecutar seedDemoData ni smoke tests de DEV en PROD.
9. Instalar la automatización mensual desde el menú.
10. Cargar el portafolio real por la Operator UI.

## Orden de carga inicial

```text
Parties propietarios
    ↓
Properties
    ↓
Units
    ↓
Ownership
    ↓
Parties inquilinos
    ↓
Leases
    ↓
SecurityDeposits
    ↓
saldos/cargos históricos que se decida migrar
```

## Cutover recomendado

Elegir una fecha de corte. A partir de esa fecha:

- nuevos cobros se registran solo en Real Estate OS;
- no mantener dos fuentes de verdad paralelas;
- cualquier saldo inicial debe documentarse;
- conservar respaldos de la fuente anterior.

## Antes del primer mes automático

Verificar por cada contrato:

- unidad correcta;
- inquilino;
- renta base;
- día de pago;
- fechas;
- estado ACTIVE;
- depósito;
- cargo del mes actual si corresponde.

Después ejecutar manualmente `generateRentChargesForPeriod()` una vez y revisar resultados antes de depender del trigger mensual.

## Acceso

En PROD usar el mínimo conjunto de editores necesarios. Los operadores deben entrar con una sola sesión Google compatible con HtmlService para evitar el problema conocido de multi-login.
