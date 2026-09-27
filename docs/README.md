# Documentación — Real Estate OS

Esta carpeta contiene la especificación funcional, técnica y estratégica del sistema.

La documentación es la fuente de verdad para las decisiones de arquitectura. El código debe implementar estas decisiones; no redefinirlas silenciosamente.

## Orden de lectura

1. [architecture-v1.md](./architecture-v1.md) — visión, principios, dominios y arquitectura general.
2. [bootstrap-v1.md](./bootstrap-v1.md) — cómo desplegar y probar la primera base técnica.
3. [core-operations-v1.md](./core-operations-v1.md) — servicios operativos, ledger y prueba integral.
11. [data-model.md](./data-model.md) — entidades, relaciones y estructura de datos.
4. [business-rules.md](./business-rules.md) — reglas que gobiernan contratos, cargos, pagos, gastos y estados.
5. [security.md](./security.md) — privacidad, secretos, roles y separación público/privado.
6. [fiscal-flow.md](./fiscal-flow.md) — diseño de la integración CFDI/PAC para México.
7. [market-data.md](./market-data.md) — fuentes, pipeline e inteligencia de mercado.
8. [roadmap.md](./roadmap.md) — orden de construcción y definición de hitos.
9. [references.md](./references.md) — repositorios estudiados y patrones reutilizados.
10. [adr/README.md](./adr/README.md) — decisiones de arquitectura que deben quedar registradas.

## Principio rector

> Operar cada inmueble como un negocio, evaluar cada activo como una inversión, analizar cada adquisición como una decisión de asignación de capital y conservar los datos para que las decisiones futuras sean mejores.

## Capas del sistema

```text
Real Estate OS
├── Property Management
├── Asset Management
├── Investment Management
├── Market Intelligence
└── Automation & Integrations
```

## Fuente de verdad por ámbito

| Ámbito | Fuente de verdad |
|---|---|
| Código | GitHub |
| Arquitectura y reglas | `docs/` |
| Datos operativos V1 | Google Sheets privado |
| Documentos reales | Google Drive privado |
| Secretos | Script Properties / gestor seguro |
| Datos de demostración | Repositorio público |
| Datos de mercado raw | almacenamiento separado |
| Métricas calculadas | motor analítico reproducible |

## Regla para cambios

Un cambio que altere entidades, reglas fiscales, seguridad, arquitectura o fuentes de verdad debe actualizar primero la documentación correspondiente y, cuando sea relevante, agregar un ADR.
