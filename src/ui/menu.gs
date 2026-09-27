function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var environment = String(getSetting_("environment") || "UNINITIALIZED").toUpperCase();

  var operationsMenu = ui
    .createMenu("Operación")
    .addItem("Abrir panel operativo", "openOperatorPanel")
    .addSeparator()
    .addItem("Registrar pago (modo nativo)", "registerPaymentNative")
    .addItem("Resumen de cobranza (modo nativo)", "showNativeReceivablesSummary")
    .addSeparator()
    .addItem("Generar cargos del mes actual", "generateCurrentPeriodRentChargesFromMenu")
    .addItem("Ver resumen del mes actual", "showCurrentPeriodSummaryFromMenu")
    .addSeparator()
    .addItem("Activar automatización mensual", "ensureOperationalTriggersFromMenu")
    .addItem("Ver estado de automatización", "showOperationalTriggerStatusFromMenu");

  var administrationMenu = ui
    .createMenu("Administración")
    .addItem("Production Readiness", "showProductionReadinessFromMenu")
    .addItem("Ejecutar diagnóstico", "runSystemDiagnostics");

  if (environment === "DEV") {
    administrationMenu.addItem(
      "Promover esta instancia a PROD",
      "promoteCurrentInstanceToProductionFromMenu"
    );
  }

  var rootMenu = ui
    .createMenu(REOS_APP.NAME)
    .addItem("Abrir panel operativo", "openOperatorPanel")
    .addSeparator()
    .addItem("Inicializar / sincronizar sistema", "setupRealEstateOS")
    .addSubMenu(operationsMenu)
    .addSubMenu(administrationMenu);

  if (environment === "DEV") {
    var developmentMenu = ui
      .createMenu("Desarrollo")
      .addItem("Cargar datos demo (DEV)", "seedDemoData")
      .addItem("Smoke test Bootstrap", "runDemoSmokeTest")
      .addItem("Smoke test Core Operations", "runCoreOperationsSmokeTest")
      .addItem("Smoke test Operator UI", "runOperatorUiSmokeTest")
      .addItem("Smoke test Full Operations", "runFullOperationsSmokeTest");

    rootMenu.addSubMenu(developmentMenu);
  }

  rootMenu.addToUi();
}

function onInstall() {
  onOpen();
}
