function writeDefaultSettings_() {
  var now = new Date();

  var defaults = [
    {
      key: "app_name",
      value: REOS_APP.NAME,
      description: "Nombre de la aplicación.",
      overwrite: true
    },
    {
      key: "app_version",
      value: REOS_APP.VERSION,
      description: "Versión de la aplicación.",
      overwrite: true
    },
    {
      key: "schema_version",
      value: REOS_SCHEMA_VERSION,
      description: "Versión del schema aplicado.",
      overwrite: true
    },
    {
      key: "environment",
      value: REOS_APP.DEFAULT_ENVIRONMENT,
      description: "Entorno de ejecución. Cambiar PROD solo de forma deliberada.",
      overwrite: false
    },
    {
      key: "installed_at",
      value: now,
      description: "Primera instalación del sistema.",
      overwrite: false
    },
    {
      key: "last_bootstrap_at",
      value: now,
      description: "Última sincronización del bootstrap.",
      overwrite: true
    },
    {
      key: "spreadsheet_id",
      value: SpreadsheetApp.getActiveSpreadsheet().getId(),
      description: "ID de la hoja asociada a esta instancia.",
      overwrite: true
    }
  ];

  upsertSettings_(defaults);
}

function upsertSettings_(entries) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  if (!sheet) throw new Error("Settings sheet not found.");

  var values = sheet.getDataRange().getValues();
  var rowByKey = {};

  for (var i = 1; i < values.length; i += 1) {
    var key = String(values[i][0] || "").trim();
    if (key) rowByKey[key] = i + 1;
  }

  entries.forEach(function (entry) {
    var existingRow = rowByKey[entry.key];

    if (existingRow) {
      if (entry.overwrite) {
        sheet.getRange(existingRow, 2, 1, 3).setValues([[
          entry.value,
          entry.description || "",
          new Date()
        ]]);
      }
      return;
    }

    var newRow = [
      entry.key,
      entry.value,
      entry.description || "",
      new Date()
    ];

    sheet.appendRow(newRow);
    rowByKey[entry.key] = sheet.getLastRow();
  });
}

function getSetting_(key) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  if (!sheet || sheet.getLastRow() < 2) return null;

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();

  for (var i = 0; i < values.length; i += 1) {
    if (String(values[i][0]) === key) return values[i][1];
  }

  return null;
}

function assertDevelopmentEnvironment_() {
  var environment = String(getSetting_("environment") || "").toUpperCase();

  if (environment !== "DEV") {
    throw new Error(
      "This operation is restricted to DEV. Current environment: " +
        (environment || "UNSET")
    );
  }
}
