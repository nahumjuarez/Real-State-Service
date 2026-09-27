# Seguridad y privacidad — Real Estate OS

## 1. Modelo

El repositorio es público; la operación real es privada.

```text
GITHUB PÚBLICO
├── código
├── documentación
├── tests
└── datos sintéticos

GOOGLE WORKSPACE PRIVADO
├── datos reales
├── contratos
├── CFDI
├── documentos
└── información de inquilinos

SECRETOS
├── credenciales PAC
├── OAuth
├── API keys
└── credenciales fiscales
```

## 2. Nunca versionar

- RFC reales;
- CURP;
- identificaciones;
- contratos reales;
- correos/teléfonos personales;
- cuentas bancarias;
- XML/PDF fiscales reales;
- archivos .key, .pfx, .p12, .pem;
- contraseñas SAT;
- tokens OAuth;
- credenciales PAC;
- IDs o URLs privadas que expongan documentos;
- backups reales.

## 3. Clasificación de información

### Pública

Código, documentación, esquemas, datos abiertos, ejemplos ficticios.

### Interna

Rentas, gastos, presupuestos, valuaciones, deuda, análisis de inversión.

### Datos personales

Nombre, teléfono, email, RFC, contratos, referencias.

### Secretos

Passwords, tokens, e.firma, API keys, credenciales bancarias.

## 4. Principio de menor privilegio

Roles iniciales:

- OWNER_ADMIN
- PORTFOLIO_MANAGER
- FAMILY_OPERATOR
- ACCOUNTANT
- MAINTENANCE
- READ_ONLY

Cada usuario recibe únicamente permisos necesarios.

## 5. Entornos

### DEV

- datos sintéticos;
- credenciales de pruebas;
- operaciones destructivas permitidas.

### PROD

- datos reales;
- acceso restringido;
- backups;
- auditoría.

Nunca probar funciones destructivas contra PROD.

## 6. Secretos

V1:
- Apps Script Properties solo para secretos técnicos compatibles con el runtime y nunca para contraseñas de inmuebles;
- contraseñas, PINs, códigos de puerta, códigos Wi-Fi y tokens de acceso fuera de Sheets;
- `AccessProfiles` guarda únicamente referencias a un gestor de contraseñas, no el secreto;
- archivos locales privados incluidos en .gitignore.

Futuro:
- Secret Manager o equivalente.

## 7. .gitignore mínimo

```gitignore
.env
.env.*
*.key
*.pem
*.p12
*.pfx
*.cer
.clasprc.json
config.local.json
secrets.json
data/private/
exports/private/
backups/
private-documents/
node_modules/
.DS_Store
Thumbs.db
```

## 8. Datos sintéticos

El sistema público debe poder arrancar con un dataset ficticio completo.

Nunca anonimizar parcialmente una copia real si existe riesgo de reidentificación; preferir generar datos sintéticos desde cero.


## 9. Accesos de inmuebles

Los accesos físicos y digitales del portafolio se consideran secretos cuando permiten entrar a una propiedad o autenticarse en un servicio.

Ejemplos:

- contraseña Wi-Fi;
- PIN de cerradura;
- código de portón;
- código de lockbox;
- contraseña de portal de condominio;
- token de alarma.

Real Estate OS no debe guardar esos valores en Google Sheets, GitHub, notas de auditoría ni campos libres. La tabla `AccessProfiles` solo conserva una referencia al elemento almacenado en una bóveda externa controlada por la familia.
