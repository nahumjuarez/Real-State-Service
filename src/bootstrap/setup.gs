function setupRealEstateOS() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error(
      "Real Estate OS bootstrap must run from a spreadsheet-bound Apps Script project."
    );
  }

  var lock = LockService.getDocumentLock();

  if (!lock.tryLock(30000)) {
    throw new Error("Could not acquire bootstrap lock. Try again.");
  }

  try {
    validateRuntimeSchema_();

    REOS_SCHEMA.forEach(function (tableDef) {
      ensureTableSheet_(spreadsheet, tableDef);
    });

    writeDefaultSettings_();

    appendAuditEvent_({
      action: "SYSTEM_BOOTSTRAP_SYNC",
      entityType: "SYSTEM",
      entityId: spreadsheet.getId(),
      newValue: {
        appVersion: REOS_APP.VERSION,
        schemaVersion: REOS_SCHEMA_VERSION
      }
    });

    SpreadsheetApp.flush();

    var diagnostics = runSystemDiagnostics({ silent: true });

    if (!diagnostics.ok) {
      throw new Error(
        "Bootstrap completed but diagnostics found problems: " +
          diagnostics.errors.join("; ")
      );
    }

    spreadsheet.toast(
      "Sistema listo: " +
        REOS_SCHEMA.length +
        " tablas sincronizadas. Schema " +
        REOS_SCHEMA_VERSION +
        ".",
      REOS_APP.NAME,
      8
    );

    return diagnostics;
  } finally {
    lock.releaseLock();
  }
}
