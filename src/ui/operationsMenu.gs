function generateCurrentPeriodRentChargesFromMenu() {
  var ui = SpreadsheetApp.getUi();
  var period = currentPeriod_();

  var response = ui.alert(
    REOS_APP.NAME,
    "¿Generar cargos de renta para " + period + "?\n\n" +
      "El sistema omitirá contratos que ya tengan un cargo RENT para ese periodo.",
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return null;

  var result = generateRentChargesForPeriod(period);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Periodo " +
      period +
      ": " +
      result.created.length +
      " cargo(s) creado(s), " +
      result.skipped.length +
      " omitido(s).",
    REOS_APP.NAME,
    10
  );

  return result;
}

function showCurrentPeriodSummaryFromMenu() {
  var summary = getOperationalSummary(currentPeriod_());
  var currency = String(getSetting_("currency") || "MXN");

  SpreadsheetApp.getUi().alert(
    REOS_APP.NAME + " — " + summary.period,
    [
      "Contratos activos: " + summary.activeLeases,
      "Unidades ocupadas: " + summary.occupiedUnits,
      "Cargos: " + summary.charges,
      "Cargado: " + currency + " " + summary.totalCharged.toFixed(2),
      "Cobrado/asignado: " + currency + " " + summary.totalAllocated.toFixed(2),
      "Pendiente: " + currency + " " + summary.outstanding.toFixed(2),
      "",
      "OPEN: " + summary.statusCounts.OPEN,
      "PARTIAL: " + summary.statusCounts.PARTIAL,
      "PAID: " + summary.statusCounts.PAID
    ].join("\n"),
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  return summary;
}
