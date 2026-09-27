function seedDemoData() {
  assertDevelopmentEnvironment_();

  var protectedTables = [
    "Properties",
    "Units",
    "Parties",
    "Leases",
    "RentCharges",
    "Payments"
  ];

  protectedTables.forEach(function (tableName) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName);

    if (!sheet) {
      throw new Error(
        "Missing " + tableName + ". Run setupRealEstateOS() first."
      );
    }

    if (getRecordCount_(sheet) > 0) {
      throw new Error(
        "Demo seed aborted because " +
          tableName +
          " already contains data. Demo data never overwrites existing records."
      );
    }
  });

  var demo = buildDemoData_();

  var insertionOrder = [
    "Parties",
    "FiscalProfiles",
    "Properties",
    "Units",
    "Ownership",
    "Leases",
    "LeaseParties",
    "RentCharges",
    "Payments",
    "PaymentAllocations",
    "SecurityDeposits",
    "Expenses",
    "WorkOrders",
    "Invoices",
    "InvoiceLines",
    "Loans",
    "Valuations",
    "Budgets",
    "Deals",
    "Scenarios",
    "DealAssumptions"
  ];

  var inserted = 0;

  insertionOrder.forEach(function (tableName) {
    if (demo[tableName] && demo[tableName].length) {
      inserted += appendRecords_(tableName, demo[tableName]);
    }
  });

  upsertSettings_([
    {
      key: "demo_seeded",
      value: "true",
      description: "Indica que la instancia DEV contiene el dataset sintético.",
      overwrite: true
    },
    {
      key: "demo_seeded_at",
      value: new Date().toISOString(),
      description: "Fecha de carga del dataset sintético.",
      overwrite: true
    }
  ]);

  appendAuditEvent_({
    action: "DEMO_DATA_SEEDED",
    entityType: "SYSTEM",
    entityId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    newValue: {
      insertedRecords: inserted
    }
  });

  SpreadsheetApp.flush();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Datos demo cargados: " + inserted + " registros sintéticos.",
    REOS_APP.NAME,
    8
  );

  return {
    insertedRecords: inserted,
    diagnostics: runSystemDiagnostics({ silent: true })
  };
}
