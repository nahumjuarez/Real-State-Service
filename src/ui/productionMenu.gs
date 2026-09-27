function showProductionReadinessFromMenu() {
  var readiness = runProductionReadinessCheck({ forPromotion: false });
  var lines = [
    "Instancia: " + readiness.spreadsheetName,
    "Entorno: " + readiness.environment,
    "App: v" + readiness.appVersion,
    "Schema: " + readiness.schemaVersion,
    "Registros operativos: " + readiness.totalOperationalRecords,
    "",
    readiness.ok ? "READINESS: OK" : "READINESS: BLOQUEADO"
  ];

  if (readiness.blockers.length) {
    lines.push("", "Bloqueos:");
    readiness.blockers.forEach(function (item) {
      lines.push("• " + item);
    });
  }

  if (readiness.warnings.length) {
    lines.push("", "Advertencias:");
    readiness.warnings.forEach(function (item) {
      lines.push("• " + item);
    });
  }

  SpreadsheetApp.getUi().alert(
    REOS_APP.NAME + " — Production Readiness",
    lines.join("\n"),
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  return readiness;
}

function promoteCurrentInstanceToProductionFromMenu() {
  var ui = SpreadsheetApp.getUi();
  var readiness = runProductionReadinessCheck({ forPromotion: true });

  if (!readiness.ok) {
    ui.alert(
      REOS_APP.NAME,
      "No se puede promover esta instancia a PROD:\n\n" +
        readiness.blockers.map(function (item) {
          return "• " + item;
        }).join("\n"),
      ui.ButtonSet.OK
    );
    return readiness;
  }

  var confirmation = ui.prompt(
    "Promover a producción",
    "Instancia: " + readiness.spreadsheetName + "\n\n" +
      "Esta acción marcará permanentemente el entorno como PROD y ocultará las herramientas DEV.\n\n" +
      "Escribe PROD para confirmar:",
    ui.ButtonSet.OK_CANCEL
  );

  if (confirmation.getSelectedButton() !== ui.Button.OK) return null;

  if (String(confirmation.getResponseText() || "").trim().toUpperCase() !== "PROD") {
    ui.alert("Promoción cancelada: confirmación incorrecta.");
    return null;
  }

  var result = promoteInstanceToProduction();

  ui.alert(
    REOS_APP.NAME,
    "Instancia promovida a PROD correctamente.\n\n" +
      "Recarga el Spreadsheet para actualizar el menú.",
    ui.ButtonSet.OK
  );

  return result;
}
