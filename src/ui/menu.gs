function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(REOS_APP.NAME)
    .addItem("Inicializar / sincronizar sistema", "setupRealEstateOS")
    .addSeparator()
    .addItem("Cargar datos demo (DEV)", "seedDemoData")
    .addItem("Ejecutar diagnóstico", "runSystemDiagnostics")
    .addToUi();
}

function onInstall() {
  onOpen();
}
