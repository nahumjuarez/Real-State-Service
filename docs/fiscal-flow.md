# Flujo fiscal CFDI — Real Estate OS

> Alcance: arquitectura técnica. La configuración fiscal concreta debe revisarse conforme a la normativa vigente y, cuando corresponda, con un profesional fiscal.

## 1. Principio

El núcleo del sistema no debe depender de un PAC específico.

```text
InvoiceService
      │
      ▼
FiscalProvider
 ├── FacturamaProvider
 ├── FinkokProvider
 └── OtroPACProvider
```

## 2. Estados de Invoice

```text
DRAFT
  ↓
VALIDATED
  ↓
READY_TO_STAMP
  ↓
STAMPED
  ↓
CANCEL_PENDING
  ↓
CANCELLED
```

Cualquier paso puede producir ERROR sin borrar el historial.

## 3. Flujo

```text
Pago / obligación fiscal
        ↓
Invoice Draft
        ↓
Validación de emisor
        ↓
Validación de receptor
        ↓
Validación de conceptos
        ↓
Cálculo fiscal
        ↓
READY_TO_STAMP
        ↓
PAC
        ↓
UUID + XML
        ↓
PDF
        ↓
Drive privado
        ↓
Metadata en Sheets
        ↓
Entrega / email
```

## 4. Interfaz conceptual

```text
createInvoice()
validateInvoice()
stampInvoice()
cancelInvoice()
getInvoiceStatus()
downloadXML()
generatePDF()
```

## 5. Datos que deben permanecer privados

- RFC reales;
- constancias fiscales;
- XML;
- PDF;
- e.firma;
- certificados;
- credenciales PAC.

## 6. Reglas

- El UUID es resultado externo, nunca generado localmente.
- El sistema debe poder reintentar fallos de red sin duplicar facturas.
- Las operaciones de timbrado requieren idempotencia.
- El proveedor y respuesta original deben quedar auditados.
- Cambiar de PAC no debe alterar las entidades de negocio.
- Los datos fiscales del receptor se validan antes del timbrado.

## 7. V1

V1 únicamente rastrea:

- factura requerida;
- datos completos/incompletos;
- estado;
- UUID cuando exista;
- links privados a XML/PDF.

## 8. V1.5

- integración API PAC;
- generación automática;
- cancelación;
- envío al inquilino;
- conciliación entre Payment/Charge/Invoice.
