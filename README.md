# Real Estate OS

Sistema open source para operación inmobiliaria, gestión de activos, análisis de inversiones e inteligencia de mercado, diseñado inicialmente para México.

## Estado

Actualmente estamos construyendo **Bootstrap v1**: la base reproducible del sistema sobre Google Sheets + Apps Script.

La documentación vive en [docs/](./docs/README.md).

## Arquitectura inicial

```text
VS Code / GitHub
      ↓
Google Apps Script
      ↓
Google Sheets DEV
      ↓
Real Estate OS
```

Google Sheets es el almacenamiento operativo V1. El dominio está diseñado para poder migrar después a una base relacional sin redefinir el negocio.

## Requisitos

- Node.js 22 o superior
- npm
- Cuenta de Google
- Google Apps Script API habilitada
- Un Google Sheet vacío para el entorno DEV

## Instalación local

```bash
git clone https://github.com/nahumjuarez/Real-State-Service.git
cd Real-State-Service
git checkout feat/boostrap-v1
npm install
npm run clasp:login
```

Crea un Google Sheet, abre **Extensiones → Apps Script → Configuración del proyecto** y copia el Script ID.

Después:

```bash
cp .clasp.example.json .clasp.json
```

Edita `.clasp.json` con el Script ID del proyecto DEV y el ID del Google Sheet contenedor. El ID del Sheet es la parte entre `/d/` y `/edit` de su URL.

Ejemplo:

```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "parentId": "YOUR_SPREADSHEET_ID",
  "rootDir": "src"
}
```

Después ejecuta:

```bash
npm run validate:schema
npm run clasp:push
```

En Apps Script ejecuta una vez:

```text
setupRealEstateOS()
```

Autoriza los permisos solicitados y recarga el Google Sheet.

Aparecerá un menú:

```text
Real Estate OS
├── Inicializar / sincronizar sistema
├── Cargar datos demo
└── Ejecutar diagnóstico
```

## Prueba rápida

1. Ejecuta `setupRealEstateOS()`.
2. Confirma que se crean las tablas definidas en el schema.
3. Ejecuta `runSystemDiagnostics()`.
4. Ejecuta `seedDemoData()` únicamente en DEV.
5. Ejecuta `runDemoSmokeTest()`.
6. El smoke test debe confirmar que dos rentas están cubiertas y que el caso de pago parcial conserva **$6,500 MXN pendientes**.

Los datos demo son sintéticos y no representan el portafolio real.

## Seguridad

Nunca subas al repositorio:

- datos reales de inquilinos;
- contratos;
- RFC reales;
- XML/PDF fiscales;
- e.firma;
- tokens OAuth;
- credenciales PAC;
- claves API;
- `.clasprc.json`;
- `.clasp.json` de entornos reales.

Consulta [docs/security.md](./docs/security.md).

## Licencia

GNU Affero General Public License v3.0 (AGPL-3.0).
