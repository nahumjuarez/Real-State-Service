var REOS_SCHEMA_VERSION = "0.1.0";

var REOS_TYPES = [
  "ID", "STRING", "ENUM", "DATE", "DATETIME", "MONEY",
  "NUMBER", "INTEGER", "PERCENT", "BOOLEAN", "URL", "EMAIL", "JSON"
];

function reosColumn_(key, label, type, options) {
  var opts = options || {};
  var column = {
    key: key,
    label: label,
    type: type,
    required: opts.required === true,
    description: opts.description || ""
  };

  if (opts.enumValues) column.enumValues = opts.enumValues;
  if (opts.foreignKey) column.foreignKey = opts.foreignKey;
  if (opts.defaultValue !== undefined) column.defaultValue = opts.defaultValue;
  if (opts.width) column.width = opts.width;

  return column;
}

var REOS_ENUMS = {
  propertyType: ["APARTMENT", "HOUSE", "BUILDING", "COMMERCIAL", "OTHER"],
  propertyStatus: ["ACTIVE", "INACTIVE", "SOLD"],
  unitType: ["APARTMENT", "HOUSE", "COMMERCIAL", "PARKING", "STORAGE", "OTHER"],
  unitStatus: ["VACANT", "OCCUPIED", "OFF_MARKET"],
  partyType: ["PERSON", "ORGANIZATION"],
  partyStatus: ["ACTIVE", "INACTIVE"],
  leaseStatus: ["DRAFT", "ACTIVE", "EXPIRING", "ENDED", "TERMINATED"],
  leaseRole: ["TENANT", "CO_TENANT", "GUARANTOR", "LEGAL_REPRESENTATIVE"],
  paymentFrequency: ["MONTHLY", "BIMONTHLY", "QUARTERLY", "OTHER"],
  chargeType: ["RENT", "LATE_FEE", "UTILITY", "REPAIR", "OTHER"],
  chargeStatus: ["OPEN", "PARTIAL", "PAID", "VOID"],
  paymentStatus: ["RECEIVED", "REVERSED", "VOID"],
  paymentMethod: ["TRANSFER", "CASH", "CARD", "CHECK", "OTHER"],
  depositStatus: ["HELD", "PARTIALLY_RETURNED", "RETURNED", "APPLIED"],
  expenseStatus: ["PENDING", "PAID", "VOID"],
  expenseCategory: [
    "HOA", "WATER", "ELECTRICITY", "INSURANCE", "ADMINISTRATION",
    "REPAIR", "CLEANING", "ACCOUNTING", "LEGAL", "PROPERTY_TAX", "OTHER"
  ],
  workOrderPriority: ["LOW", "NORMAL", "HIGH", "EMERGENCY"],
  workOrderStatus: [
    "REPORTED", "TRIAGED", "APPROVED", "SCHEDULED",
    "IN_PROGRESS", "COMPLETED", "CANCELLED"
  ],
  documentType: [
    "LEASE", "ID", "FISCAL_DOCUMENT", "CFDI_XML", "CFDI_PDF",
    "PROPERTY_TITLE", "PREDIAL", "INSURANCE", "MAINTENANCE_RECEIPT",
    "EXPENSE_RECEIPT", "VALUATION", "OTHER"
  ],
  documentStatus: ["ACTIVE", "EXPIRED", "ARCHIVED"],
  invoiceStatus: [
    "DRAFT", "VALIDATED", "READY_TO_STAMP", "STAMPED",
    "CANCEL_PENDING", "CANCELLED", "ERROR"
  ],
  loanStatus: ["ACTIVE", "PAID", "REFINANCED", "CANCELLED"],
  interestType: ["FIXED", "VARIABLE", "MIXED"],
  valuationMethod: [
    "APPRAISAL", "MARKET_COMPARABLES", "CAP_RATE",
    "OWNER_ESTIMATE", "MODEL_ESTIMATE", "PURCHASE_PRICE"
  ],
  budgetType: ["INCOME", "OPERATING_EXPENSE", "CAPEX", "DEBT_SERVICE"],
  dealStatus: [
    "DISCOVERED", "SCREENING", "UNDERWRITING", "DUE_DILIGENCE",
    "NEGOTIATION", "REJECTED", "ACQUIRED", "LOST"
  ],
  dealDecision: ["ACQUIRE", "REJECT", "HOLD", "LOST"],
  sourceType: ["OBSERVED", "ASSUMPTION", "FORECAST"],
  scenarioType: ["BEAR", "BASE", "BULL", "CUSTOM"]
};

var REOS_SCHEMA = [
  {
    name: "Settings",
    description: "Configuración no secreta y metadatos de la instancia.",
    primaryKey: "setting_key",
    columns: [
      reosColumn_("setting_key", "Clave", "ID", { required: true }),
      reosColumn_("setting_value", "Valor", "STRING", { required: true }),
      reosColumn_("description", "Descripción", "STRING"),
      reosColumn_("updated_at", "Actualizado", "DATETIME", { required: true })
    ]
  },
  {
    name: "Properties",
    description: "Activos inmobiliarios físicos o legales.",
    primaryKey: "property_id",
    columns: [
      reosColumn_("property_id", "ID propiedad", "ID", { required: true }),
      reosColumn_("property_name", "Nombre", "STRING", { required: true }),
      reosColumn_("property_type", "Tipo", "ENUM", { required: true, enumValues: REOS_ENUMS.propertyType }),
      reosColumn_("street", "Calle", "STRING"),
      reosColumn_("neighborhood", "Colonia", "STRING"),
      reosColumn_("municipality", "Municipio / alcaldía", "STRING", { required: true }),
      reosColumn_("state", "Estado", "STRING", { required: true }),
      reosColumn_("postal_code", "Código postal", "STRING"),
      reosColumn_("country", "País", "STRING", { required: true, defaultValue: "MX" }),
      reosColumn_("latitude", "Latitud", "NUMBER"),
      reosColumn_("longitude", "Longitud", "NUMBER"),
      reosColumn_("acquisition_date", "Fecha de adquisición", "DATE"),
      reosColumn_("acquisition_price", "Precio de adquisición", "MONEY"),
      reosColumn_("predial_account", "Cuenta predial", "STRING"),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.propertyStatus }),
      reosColumn_("created_at", "Creado", "DATETIME", { required: true }),
      reosColumn_("updated_at", "Actualizado", "DATETIME", { required: true })
    ]
  },
  {
    name: "Units",
    description: "Unidades rentables pertenecientes a una propiedad.",
    primaryKey: "unit_id",
    columns: [
      reosColumn_("unit_id", "ID unidad", "ID", { required: true }),
      reosColumn_("property_id", "Propiedad", "ID", { required: true, foreignKey: "Properties.property_id" }),
      reosColumn_("unit_name", "Nombre", "STRING", { required: true }),
      reosColumn_("unit_type", "Tipo", "ENUM", { required: true, enumValues: REOS_ENUMS.unitType }),
      reosColumn_("floor", "Piso", "STRING"),
      reosColumn_("bedrooms", "Recámaras", "INTEGER"),
      reosColumn_("bathrooms", "Baños", "NUMBER"),
      reosColumn_("parking_spaces", "Estacionamientos", "INTEGER"),
      reosColumn_("area_m2", "Área m²", "NUMBER"),
      reosColumn_("rentable_area_m2", "Área rentable m²", "NUMBER"),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.unitStatus }),
      reosColumn_("created_at", "Creado", "DATETIME", { required: true }),
      reosColumn_("updated_at", "Actualizado", "DATETIME", { required: true })
    ]
  },
  {
    name: "Parties",
    description: "Personas y organizaciones que participan en la operación.",
    primaryKey: "party_id",
    columns: [
      reosColumn_("party_id", "ID parte", "ID", { required: true }),
      reosColumn_("party_type", "Tipo", "ENUM", { required: true, enumValues: REOS_ENUMS.partyType }),
      reosColumn_("legal_name", "Nombre legal", "STRING", { required: true }),
      reosColumn_("preferred_name", "Nombre preferido", "STRING"),
      reosColumn_("email", "Correo", "EMAIL"),
      reosColumn_("phone", "Teléfono", "STRING"),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.partyStatus }),
      reosColumn_("created_at", "Creado", "DATETIME", { required: true }),
      reosColumn_("updated_at", "Actualizado", "DATETIME", { required: true })
    ]
  },
  {
    name: "FiscalProfiles",
    description: "Datos fiscales separados de los datos generales de una parte.",
    primaryKey: "fiscal_profile_id",
    columns: [
      reosColumn_("fiscal_profile_id", "ID perfil fiscal", "ID", { required: true }),
      reosColumn_("party_id", "Parte", "ID", { required: true, foreignKey: "Parties.party_id" }),
      reosColumn_("rfc", "RFC", "STRING", { required: true }),
      reosColumn_("legal_name", "Razón social / nombre", "STRING", { required: true }),
      reosColumn_("tax_regime", "Régimen fiscal", "STRING", { required: true }),
      reosColumn_("fiscal_zip_code", "CP fiscal", "STRING", { required: true }),
      reosColumn_("default_cfdi_use", "Uso CFDI predeterminado", "STRING"),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.partyStatus }),
      reosColumn_("updated_at", "Actualizado", "DATETIME", { required: true })
    ]
  },
  {
    name: "Ownership",
    description: "Relación de propiedad entre Parties y Properties.",
    primaryKey: "ownership_id",
    columns: [
      reosColumn_("ownership_id", "ID propiedad-participación", "ID", { required: true }),
      reosColumn_("party_id", "Propietario", "ID", { required: true, foreignKey: "Parties.party_id" }),
      reosColumn_("property_id", "Propiedad", "ID", { required: true, foreignKey: "Properties.property_id" }),
      reosColumn_("ownership_percentage", "Participación", "PERCENT", { required: true }),
      reosColumn_("start_date", "Inicio", "DATE", { required: true }),
      reosColumn_("end_date", "Fin", "DATE")
    ]
  },
  {
    name: "Leases",
    description: "Contratos de arrendamiento de unidades.",
    primaryKey: "lease_id",
    columns: [
      reosColumn_("lease_id", "ID contrato", "ID", { required: true }),
      reosColumn_("unit_id", "Unidad", "ID", { required: true, foreignKey: "Units.unit_id" }),
      reosColumn_("start_date", "Inicio", "DATE", { required: true }),
      reosColumn_("end_date", "Fin", "DATE", { required: true }),
      reosColumn_("base_rent", "Renta base", "MONEY", { required: true }),
      reosColumn_("deposit_required", "Depósito requerido", "MONEY"),
      reosColumn_("payment_due_day", "Día límite", "INTEGER", { required: true }),
      reosColumn_("payment_frequency", "Frecuencia", "ENUM", { required: true, enumValues: REOS_ENUMS.paymentFrequency }),
      reosColumn_("rent_adjustment_rule", "Regla de ajuste", "STRING"),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.leaseStatus }),
      reosColumn_("contract_document_id", "Documento contrato", "ID", { foreignKey: "Documents.document_id" }),
      reosColumn_("created_at", "Creado", "DATETIME", { required: true }),
      reosColumn_("updated_at", "Actualizado", "DATETIME", { required: true })
    ]
  },
  {
    name: "LeaseParties",
    description: "Participantes y roles de cada contrato.",
    primaryKey: "lease_party_id",
    columns: [
      reosColumn_("lease_party_id", "ID participante", "ID", { required: true }),
      reosColumn_("lease_id", "Contrato", "ID", { required: true, foreignKey: "Leases.lease_id" }),
      reosColumn_("party_id", "Parte", "ID", { required: true, foreignKey: "Parties.party_id" }),
      reosColumn_("role", "Rol", "ENUM", { required: true, enumValues: REOS_ENUMS.leaseRole })
    ]
  },
  {
    name: "RentCharges",
    description: "Obligaciones por cobrar generadas por contratos.",
    primaryKey: "charge_id",
    columns: [
      reosColumn_("charge_id", "ID cargo", "ID", { required: true }),
      reosColumn_("lease_id", "Contrato", "ID", { required: true, foreignKey: "Leases.lease_id" }),
      reosColumn_("charge_type", "Tipo", "ENUM", { required: true, enumValues: REOS_ENUMS.chargeType }),
      reosColumn_("period", "Periodo", "STRING", { required: true }),
      reosColumn_("due_date", "Vencimiento", "DATE", { required: true }),
      reosColumn_("original_amount", "Monto original", "MONEY", { required: true }),
      reosColumn_("adjustments", "Ajustes", "MONEY", { required: true, defaultValue: 0 }),
      reosColumn_("current_amount", "Monto vigente", "MONEY", { required: true }),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.chargeStatus }),
      reosColumn_("created_at", "Creado", "DATETIME", { required: true })
    ]
  },
  {
    name: "Payments",
    description: "Entradas de efectivo recibidas.",
    primaryKey: "payment_id",
    columns: [
      reosColumn_("payment_id", "ID pago", "ID", { required: true }),
      reosColumn_("party_id", "Pagador", "ID", { required: true, foreignKey: "Parties.party_id" }),
      reosColumn_("date_received", "Fecha recibida", "DATE", { required: true }),
      reosColumn_("amount", "Monto", "MONEY", { required: true }),
      reosColumn_("payment_method", "Método", "ENUM", { required: true, enumValues: REOS_ENUMS.paymentMethod }),
      reosColumn_("reference", "Referencia", "STRING"),
      reosColumn_("bank_account_reference", "Referencia bancaria", "STRING"),
      reosColumn_("notes", "Notas", "STRING"),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.paymentStatus }),
      reosColumn_("created_at", "Creado", "DATETIME", { required: true })
    ]
  },
  {
    name: "PaymentAllocations",
    description: "Asignación de pagos a cargos.",
    primaryKey: "allocation_id",
    columns: [
      reosColumn_("allocation_id", "ID asignación", "ID", { required: true }),
      reosColumn_("payment_id", "Pago", "ID", { required: true, foreignKey: "Payments.payment_id" }),
      reosColumn_("charge_id", "Cargo", "ID", { required: true, foreignKey: "RentCharges.charge_id" }),
      reosColumn_("allocated_amount", "Monto asignado", "MONEY", { required: true }),
      reosColumn_("created_at", "Creado", "DATETIME", { required: true })
    ]
  },
  {
    name: "SecurityDeposits",
    description: "Depósitos en garantía separados del ingreso por renta.",
    primaryKey: "deposit_id",
    columns: [
      reosColumn_("deposit_id", "ID depósito", "ID", { required: true }),
      reosColumn_("lease_id", "Contrato", "ID", { required: true, foreignKey: "Leases.lease_id" }),
      reosColumn_("amount_received", "Monto recibido", "MONEY", { required: true }),
      reosColumn_("date_received", "Fecha", "DATE", { required: true }),
      reosColumn_("amount_held", "Monto retenido", "MONEY", { required: true }),
      reosColumn_("amount_returned", "Monto devuelto", "MONEY", { required: true, defaultValue: 0 }),
      reosColumn_("deductions", "Deducciones", "MONEY", { required: true, defaultValue: 0 }),
      reosColumn_("return_date", "Fecha devolución", "DATE"),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.depositStatus })
    ]
  },
  {
    name: "Expenses",
    description: "Gastos operativos.",
    primaryKey: "expense_id",
    columns: [
      reosColumn_("expense_id", "ID gasto", "ID", { required: true }),
      reosColumn_("property_id", "Propiedad", "ID", { required: true, foreignKey: "Properties.property_id" }),
      reosColumn_("unit_id", "Unidad", "ID", { foreignKey: "Units.unit_id" }),
      reosColumn_("vendor_party_id", "Proveedor", "ID", { foreignKey: "Parties.party_id" }),
      reosColumn_("expense_category", "Categoría", "ENUM", { required: true, enumValues: REOS_ENUMS.expenseCategory }),
      reosColumn_("description", "Descripción", "STRING", { required: true }),
      reosColumn_("date", "Fecha", "DATE", { required: true }),
      reosColumn_("amount", "Monto", "MONEY", { required: true }),
      reosColumn_("tax_amount", "Impuestos", "MONEY", { required: true, defaultValue: 0 }),
      reosColumn_("payment_method", "Método", "ENUM", { enumValues: REOS_ENUMS.paymentMethod }),
      reosColumn_("document_id", "Documento", "ID", { foreignKey: "Documents.document_id" }),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.expenseStatus }),
      reosColumn_("created_at", "Creado", "DATETIME", { required: true })
    ]
  },
  {
    name: "CapEx",
    description: "Inversiones de capital separadas de gastos operativos.",
    primaryKey: "capex_id",
    columns: [
      reosColumn_("capex_id", "ID CapEx", "ID", { required: true }),
      reosColumn_("property_id", "Propiedad", "ID", { required: true, foreignKey: "Properties.property_id" }),
      reosColumn_("unit_id", "Unidad", "ID", { foreignKey: "Units.unit_id" }),
      reosColumn_("project_name", "Proyecto", "STRING", { required: true }),
      reosColumn_("budget", "Presupuesto", "MONEY"),
      reosColumn_("actual_cost", "Costo real", "MONEY"),
      reosColumn_("start_date", "Inicio", "DATE"),
      reosColumn_("completion_date", "Fin", "DATE"),
      reosColumn_("expected_useful_life", "Vida útil esperada (años)", "NUMBER"),
      reosColumn_("notes", "Notas", "STRING")
    ]
  },
  {
    name: "WorkOrders",
    description: "Órdenes de mantenimiento.",
    primaryKey: "work_order_id",
    columns: [
      reosColumn_("work_order_id", "ID orden", "ID", { required: true }),
      reosColumn_("property_id", "Propiedad", "ID", { required: true, foreignKey: "Properties.property_id" }),
      reosColumn_("unit_id", "Unidad", "ID", { foreignKey: "Units.unit_id" }),
      reosColumn_("reported_by", "Reportado por", "ID", { foreignKey: "Parties.party_id" }),
      reosColumn_("reported_at", "Reportado", "DATETIME", { required: true }),
      reosColumn_("category", "Categoría", "STRING", { required: true }),
      reosColumn_("description", "Descripción", "STRING", { required: true }),
      reosColumn_("priority", "Prioridad", "ENUM", { required: true, enumValues: REOS_ENUMS.workOrderPriority }),
      reosColumn_("vendor_party_id", "Proveedor", "ID", { foreignKey: "Parties.party_id" }),
      reosColumn_("estimated_cost", "Costo estimado", "MONEY"),
      reosColumn_("actual_cost", "Costo real", "MONEY"),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.workOrderStatus }),
      reosColumn_("completed_at", "Completado", "DATETIME")
    ]
  },
  {
    name: "Documents",
    description: "Metadatos y referencias a archivos privados en Drive.",
    primaryKey: "document_id",
    columns: [
      reosColumn_("document_id", "ID documento", "ID", { required: true }),
      reosColumn_("entity_type", "Tipo de entidad", "STRING", { required: true }),
      reosColumn_("entity_id", "ID entidad", "ID", { required: true }),
      reosColumn_("document_type", "Tipo documento", "ENUM", { required: true, enumValues: REOS_ENUMS.documentType }),
      reosColumn_("drive_file_id", "ID archivo Drive", "STRING", { required: true }),
      reosColumn_("file_name", "Nombre de archivo", "STRING", { required: true }),
      reosColumn_("created_at", "Creado", "DATETIME", { required: true }),
      reosColumn_("expiration_date", "Vencimiento", "DATE"),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.documentStatus })
    ]
  },
  {
    name: "Invoices",
    description: "Metadatos y estado de CFDI/facturas.",
    primaryKey: "invoice_id",
    columns: [
      reosColumn_("invoice_id", "ID factura", "ID", { required: true }),
      reosColumn_("issuer_party_id", "Emisor", "ID", { required: true, foreignKey: "Parties.party_id" }),
      reosColumn_("receiver_party_id", "Receptor", "ID", { required: true, foreignKey: "Parties.party_id" }),
      reosColumn_("related_property_id", "Propiedad", "ID", { required: true, foreignKey: "Properties.property_id" }),
      reosColumn_("related_unit_id", "Unidad", "ID", { foreignKey: "Units.unit_id" }),
      reosColumn_("issue_date", "Fecha emisión", "DATETIME"),
      reosColumn_("subtotal", "Subtotal", "MONEY", { required: true }),
      reosColumn_("taxes", "Impuestos", "MONEY", { required: true, defaultValue: 0 }),
      reosColumn_("withholdings", "Retenciones", "MONEY", { required: true, defaultValue: 0 }),
      reosColumn_("total", "Total", "MONEY", { required: true }),
      reosColumn_("currency", "Moneda", "STRING", { required: true, defaultValue: "MXN" }),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.invoiceStatus }),
      reosColumn_("pac_provider", "PAC", "STRING"),
      reosColumn_("uuid", "UUID", "STRING"),
      reosColumn_("xml_document_id", "XML", "ID", { foreignKey: "Documents.document_id" }),
      reosColumn_("pdf_document_id", "PDF", "ID", { foreignKey: "Documents.document_id" }),
      reosColumn_("created_at", "Creado", "DATETIME", { required: true })
    ]
  },
  {
    name: "InvoiceLines",
    description: "Conceptos individuales de una factura.",
    primaryKey: "invoice_line_id",
    columns: [
      reosColumn_("invoice_line_id", "ID concepto", "ID", { required: true }),
      reosColumn_("invoice_id", "Factura", "ID", { required: true, foreignKey: "Invoices.invoice_id" }),
      reosColumn_("concept", "Concepto", "STRING", { required: true }),
      reosColumn_("sat_product_code", "Clave producto SAT", "STRING"),
      reosColumn_("unit_code", "Clave unidad", "STRING"),
      reosColumn_("quantity", "Cantidad", "NUMBER", { required: true }),
      reosColumn_("unit_price", "Precio unitario", "MONEY", { required: true }),
      reosColumn_("amount", "Importe", "MONEY", { required: true }),
      reosColumn_("tax_object", "Objeto impuesto", "STRING")
    ]
  },
  {
    name: "Loans",
    description: "Financiamiento asociado a propiedades.",
    primaryKey: "loan_id",
    columns: [
      reosColumn_("loan_id", "ID crédito", "ID", { required: true }),
      reosColumn_("property_id", "Propiedad", "ID", { required: true, foreignKey: "Properties.property_id" }),
      reosColumn_("lender", "Acreedor", "STRING", { required: true }),
      reosColumn_("original_principal", "Principal original", "MONEY", { required: true }),
      reosColumn_("current_balance", "Saldo actual", "MONEY", { required: true }),
      reosColumn_("interest_rate", "Tasa", "PERCENT", { required: true }),
      reosColumn_("interest_type", "Tipo tasa", "ENUM", { required: true, enumValues: REOS_ENUMS.interestType }),
      reosColumn_("origination_date", "Originación", "DATE", { required: true }),
      reosColumn_("maturity_date", "Vencimiento", "DATE", { required: true }),
      reosColumn_("payment_frequency", "Frecuencia", "ENUM", { required: true, enumValues: REOS_ENUMS.paymentFrequency }),
      reosColumn_("monthly_payment", "Pago mensual", "MONEY"),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.loanStatus })
    ]
  },
  {
    name: "Valuations",
    description: "Historial de valuaciones; nunca se sobrescribe el pasado.",
    primaryKey: "valuation_id",
    columns: [
      reosColumn_("valuation_id", "ID valuación", "ID", { required: true }),
      reosColumn_("property_id", "Propiedad", "ID", { required: true, foreignKey: "Properties.property_id" }),
      reosColumn_("valuation_date", "Fecha", "DATE", { required: true }),
      reosColumn_("valuation_method", "Método", "ENUM", { required: true, enumValues: REOS_ENUMS.valuationMethod }),
      reosColumn_("estimated_value", "Valor estimado", "MONEY", { required: true }),
      reosColumn_("source", "Fuente", "STRING", { required: true }),
      reosColumn_("confidence", "Confianza", "PERCENT"),
      reosColumn_("notes", "Notas", "STRING")
    ]
  },
  {
    name: "Budgets",
    description: "Presupuesto por propiedad, periodo y categoría.",
    primaryKey: "budget_id",
    columns: [
      reosColumn_("budget_id", "ID presupuesto", "ID", { required: true }),
      reosColumn_("property_id", "Propiedad", "ID", { required: true, foreignKey: "Properties.property_id" }),
      reosColumn_("period", "Periodo", "STRING", { required: true }),
      reosColumn_("budget_type", "Tipo", "ENUM", { required: true, enumValues: REOS_ENUMS.budgetType }),
      reosColumn_("category", "Categoría", "STRING", { required: true }),
      reosColumn_("amount", "Monto", "MONEY", { required: true }),
      reosColumn_("notes", "Notas", "STRING")
    ]
  },
  {
    name: "Deals",
    description: "Oportunidades de inversión, incluidas las rechazadas.",
    primaryKey: "deal_id",
    columns: [
      reosColumn_("deal_id", "ID oportunidad", "ID", { required: true }),
      reosColumn_("deal_name", "Nombre", "STRING", { required: true }),
      reosColumn_("city", "Ciudad", "STRING"),
      reosColumn_("neighborhood", "Colonia", "STRING"),
      reosColumn_("property_type", "Tipo propiedad", "ENUM", { enumValues: REOS_ENUMS.propertyType }),
      reosColumn_("asking_price", "Precio publicado", "MONEY"),
      reosColumn_("source", "Fuente", "STRING"),
      reosColumn_("listing_url", "URL", "URL"),
      reosColumn_("status", "Estado", "ENUM", { required: true, enumValues: REOS_ENUMS.dealStatus }),
      reosColumn_("date_added", "Fecha agregada", "DATE", { required: true }),
      reosColumn_("decision", "Decisión", "ENUM", { enumValues: REOS_ENUMS.dealDecision }),
      reosColumn_("decision_reason", "Motivo", "STRING")
    ]
  },
  {
    name: "Scenarios",
    description: "Escenarios de underwriting por oportunidad.",
    primaryKey: "scenario_id",
    columns: [
      reosColumn_("scenario_id", "ID escenario", "ID", { required: true }),
      reosColumn_("deal_id", "Oportunidad", "ID", { required: true, foreignKey: "Deals.deal_id" }),
      reosColumn_("scenario_type", "Tipo", "ENUM", { required: true, enumValues: REOS_ENUMS.scenarioType }),
      reosColumn_("name", "Nombre", "STRING", { required: true }),
      reosColumn_("description", "Descripción", "STRING"),
      reosColumn_("created_at", "Creado", "DATETIME", { required: true })
    ]
  },
  {
    name: "DealAssumptions",
    description: "Supuestos observados, asumidos y pronosticados para underwriting.",
    primaryKey: "assumption_id",
    columns: [
      reosColumn_("assumption_id", "ID supuesto", "ID", { required: true }),
      reosColumn_("deal_id", "Oportunidad", "ID", { required: true, foreignKey: "Deals.deal_id" }),
      reosColumn_("scenario_id", "Escenario", "ID", { foreignKey: "Scenarios.scenario_id" }),
      reosColumn_("metric", "Métrica", "STRING", { required: true }),
      reosColumn_("value", "Valor", "NUMBER", { required: true }),
      reosColumn_("unit", "Unidad", "STRING", { required: true }),
      reosColumn_("source_type", "Tipo fuente", "ENUM", { required: true, enumValues: REOS_ENUMS.sourceType }),
      reosColumn_("source_reference", "Referencia", "STRING")
    ]
  },
  {
    name: "AuditLog",
    description: "Registro append-only de eventos importantes.",
    primaryKey: "event_id",
    columns: [
      reosColumn_("event_id", "ID evento", "ID", { required: true }),
      reosColumn_("timestamp", "Timestamp", "DATETIME", { required: true }),
      reosColumn_("actor", "Actor", "STRING", { required: true }),
      reosColumn_("action", "Acción", "STRING", { required: true }),
      reosColumn_("entity_type", "Tipo entidad", "STRING"),
      reosColumn_("entity_id", "ID entidad", "ID"),
      reosColumn_("previous_value", "Valor anterior", "JSON"),
      reosColumn_("new_value", "Valor nuevo", "JSON"),
      reosColumn_("source", "Fuente", "STRING", { required: true })
    ]
  }
];

var REOS_EXPECTED_SHEET_NAMES = REOS_SCHEMA.map(function (table) {
  return table.name;
});
