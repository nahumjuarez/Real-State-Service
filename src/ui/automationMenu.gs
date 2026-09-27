function ensureOperationalTriggersFromMenu() {
  var result = ensureOperationalTriggers();

  SpreadsheetApp.getUi().alert(
    REOS_APP.NAME,
    result.installed
      ? "Automatización mensual activa.\n\n" +
        "Handler: " + result.handler + "\n" +
        "Triggers instalados: " + result.count
      : "No se pudo confirmar la automatización.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  return result;
}

function showOperationalTriggerStatusFromMenu() {
  var result = getOperationalTriggerStatus();

  SpreadsheetApp.getUi().alert(
    REOS_APP.NAME,
    [
      "Generación mensual de cargos",
      "",
      "Estado: " + (result.installed ? "ACTIVA" : "INACTIVA"),
      "Handler: " + result.handler,
      "Triggers encontrados: " + result.count
    ].join("\n"),
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  return result;
}
