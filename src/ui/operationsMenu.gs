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
