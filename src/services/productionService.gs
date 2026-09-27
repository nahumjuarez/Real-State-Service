function runProductionReadinessCheck(options) {
  var opts = options || {};
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var environment = String(getSetting_("environment") || "").toUpperCase();
  var blockers = [];
  var warnings = [];
  var diagnostics = runSystemDiagnostics({ silent: true });

  if (!diagnostics.ok) {
    blockers.push(
      "System diagnostics failed: " + diagnostics.errors.join("; ")
    );
  }

  var configuredSpreadsheetId = String(getSetting_("spreadsheet_id") || "");
  if (!configuredSpreadsheetId) {
    blockers.push("Settings.spreadsheet_id is missing.");
  } else if (configuredSpreadsheetId !== spreadsheet.getId()) {
    blockers.push("Settings.spreadsheet_id does not match the active Spreadsheet.");
  }

  if (String(getSetting_("demo_seeded") || "").toLowerCase() === "true") {
    blockers.push("This instance contains the demo seed.");
  }

  var operationalTables = [
    "Properties",
    "Units",
    "AccessProfiles",
    "Parties",
    "FiscalProfiles",
    "Ownership",
    "Leases",
    "LeaseParties",
    "RentCharges",
    "Payments",
    "PaymentAllocations",
    "SecurityDeposits",
    "Expenses",
    "CapEx",
    "WorkOrders",
    "Documents",
    "Invoices",
    "InvoiceLines",
    "Loans",
    "Valuations",
    "Budgets",
    "Deals",
    "Scenarios",
    "DealAssumptions"
  ];

  var counts = {};
  var totalOperationalRecords = 0;

  operationalTables.forEach(function (tableName) {
    var sheet = spreadsheet.getSheetByName(tableName);
    var count = sheet ? getRecordCount_(sheet) : -1;
    counts[tableName] = count;

    if (count < 0) {
      blockers.push("Missing table: " + tableName);
      return;
    }

    totalOperationalRecords += count;
  });

  if (opts.forPromotion && environment !== "PROD" && totalOperationalRecords > 0) {
    blockers.push(
      "A new PROD instance must be empty before promotion. Operational records found: " +
        totalOperationalRecords
    );
  }

  if (environment && ["DEV", "PROD"].indexOf(environment) === -1) {
    blockers.push("Unsupported environment: " + environment);
  }

  if (!environment) {
    blockers.push("Environment is not configured.");
  }

  if (String(getSetting_("app_version") || "") !== REOS_APP.VERSION) {
    warnings.push(
      "Settings app_version differs from code version " + REOS_APP.VERSION + "."
    );
  }

  if (environment === "PROD" && String(getSetting_("production_promoted_at") || "") === "") {
    warnings.push("Instance is PROD but production_promoted_at is missing.");
  }

  return {
    ok: blockers.length === 0,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    environment: environment,
    appVersion: REOS_APP.VERSION,
    schemaVersion: REOS_SCHEMA_VERSION,
    totalOperationalRecords: totalOperationalRecords,
    counts: counts,
    diagnosticsOk: diagnostics.ok,
    blockers: blockers,
    warnings: warnings
  };
}

function promoteInstanceToProduction() {
  var readiness = runProductionReadinessCheck({ forPromotion: true });

  if (!readiness.ok) {
    throw new Error(
      "Production promotion blocked: " + readiness.blockers.join("; ")
    );
  }

  var currentEnvironment = String(
    getSetting_("environment") || ""
  ).toUpperCase();

  if (currentEnvironment === "PROD") {
    return readiness;
  }

  if (currentEnvironment !== "DEV") {
    throw new Error(
      "Only a clean DEV bootstrap instance can be promoted. Current environment: " +
        currentEnvironment
    );
  }

  var now = new Date();
  var actor = currentActor_();

  upsertSettings_([
    {
      key: "environment",
      value: "PROD",
      description: "Entorno de ejecución. Producción.",
      overwrite: true
    },
    {
      key: "production_promoted_at",
      value: now.toISOString(),
      description: "Fecha de promoción de esta instancia a PROD.",
      overwrite: true
    },
    {
      key: "production_promoted_by",
      value: actor,
      description: "Actor que promovió la instancia a PROD.",
      overwrite: true
    }
  ]);

  appendAuditEvent_({
    action: "INSTANCE_PROMOTED_TO_PROD",
    entityType: "SYSTEM",
    entityId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    newValue: {
      environment: "PROD",
      appVersion: REOS_APP.VERSION,
      schemaVersion: REOS_SCHEMA_VERSION,
      promotedBy: actor
    }
  });

  SpreadsheetApp.flush();

  return runProductionReadinessCheck();
}

function assertProductionEnvironment_() {
  var environment = String(getSetting_("environment") || "").toUpperCase();

  if (environment !== "PROD") {
    throw new Error(
      "This operation requires PROD. Current environment: " +
        (environment || "UNSET")
    );
  }
}
