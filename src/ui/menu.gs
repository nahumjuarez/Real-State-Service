function onOpen() {
  var ui = SpreadsheetApp.getUi();

  var operationsMenu = ui
    .createMenu("Operación")
    .addItem("Abrir panel operativo", "openOperatorPanel")
    .addSeparator()
    .addItem("Generar cargos del mes actual", "generateCurrentPeriodRentChargesFromMenu")
    .addItem("Ver resumen del mes actual", "showCurrentPeriodSummaryFromMenu");

  var developmentMenu = ui
    .createMenu("Desarrollo")
    .addItem("Cargar datos demo (DEV)", "seedDemoData")
    .addItem("Smoke test Bootstrap", "runDemoSmokeTest")
    .addItem("Smoke test Core Operations", "runCoreOperationsSmokeTest")
    .addItem("Smoke test Operator UI", "runOperatorUiSmokeTest")
    .addItem("Ejecutar diagnóstico", "runSystemDiagnostics");

  ui.createMenu(REOS_APP.NAME)
    .addItem("Abrir panel operativo", "openOperatorPanel")
    .addSeparator()
    .addItem("Inicializar / sincronizar sistema", "setupRealEstateOS")
    .addSubMenu(operationsMenu)
    .addSubMenu(developmentMenu)
    .addToUi();
}

function onInstall() {
  onOpen();
}
