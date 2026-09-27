function validateRuntimeSchema_() {
  var names = {};
  var allowedTypes = {};

  REOS_TYPES.forEach(function (type) {
    allowedTypes[type] = true;
  });

  REOS_SCHEMA.forEach(function (table) {
    if (names[table.name]) {
      throw new Error("Duplicate table in schema: " + table.name);
    }
    names[table.name] = true;

    var columnKeys = {};
    table.columns.forEach(function (column) {
      if (columnKeys[column.key]) {
        throw new Error(
          "Duplicate column " + table.name + "." + column.key
        );
      }

      if (!allowedTypes[column.type]) {
        throw new Error(
          "Unsupported type " + table.name + "." + column.key + ": " + column.type
        );
      }

      if (
        column.type === "ENUM" &&
        (!column.enumValues || column.enumValues.length === 0)
      ) {
        throw new Error(
          "ENUM without values: " + table.name + "." + column.key
        );
      }

      columnKeys[column.key] = true;
    });

    if (table.primaryKey && !columnKeys[table.primaryKey]) {
      throw new Error(
        "Primary key not found: " + table.name + "." + table.primaryKey
      );
    }
  });

  REOS_SCHEMA.forEach(function (table) {
    table.columns.forEach(function (column) {
      if (!column.foreignKey) return;

      var parts = column.foreignKey.split(".");
      var targetTable = null;

      for (var i = 0; i < REOS_SCHEMA.length; i += 1) {
        if (REOS_SCHEMA[i].name === parts[0]) {
          targetTable = REOS_SCHEMA[i];
          break;
        }
      }

      if (!targetTable) {
        throw new Error("Missing FK table: " + column.foreignKey);
      }

      var targetExists = targetTable.columns.some(function (targetColumn) {
        return targetColumn.key === parts[1];
      });

      if (!targetExists) {
        throw new Error("Missing FK column: " + column.foreignKey);
      }
    });
  });

  return true;
}

function runSystemDiagnostics(options) {
  var opts = options || {};
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var errors = [];
  var tables = [];

  REOS_SCHEMA.forEach(function (tableDef) {
    var sheet = spreadsheet.getSheetByName(tableDef.name);

    if (!sheet) {
      errors.push("Missing sheet: " + tableDef.name);
      tables.push({
        name: tableDef.name,
        exists: false,
        headersOk: false,
        records: 0
      });
      return;
    }

    var expectedHeaders = tableDef.columns.map(function (column) {
      return column.key;
    });

    var actualHeaders = sheet
      .getRange(1, 1, 1, expectedHeaders.length)
      .getDisplayValues()[0];

    var headersOk = expectedHeaders.every(function (header, index) {
      return String(actualHeaders[index] || "").trim() === header;
    });

    if (!headersOk) {
      errors.push("Header mismatch: " + tableDef.name);
    }

    tables.push({
      name: tableDef.name,
      exists: true,
      headersOk: headersOk,
      records: getRecordCount_(sheet)
    });
  });

  var schemaVersion = getSetting_("schema_version");
  var environment = getSetting_("environment");

  if (String(schemaVersion || "") !== REOS_SCHEMA_VERSION) {
    errors.push(
      "Schema version mismatch. Expected " +
        REOS_SCHEMA_VERSION +
        ", got " +
        schemaVersion
    );
  }

  var result = {
    ok: errors.length === 0,
    appVersion: REOS_APP.VERSION,
    schemaVersion: schemaVersion || null,
    expectedSchemaVersion: REOS_SCHEMA_VERSION,
    environment: environment || null,
    spreadsheetId: spreadsheet.getId(),
    checkedAt: new Date().toISOString(),
    tables: tables,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!opts.silent) {
    spreadsheet.toast(
      result.ok
        ? "Diagnóstico correcto: " + tables.length + " tablas verificadas."
        : "Diagnóstico con " + errors.length + " problema(s). Revisa ejecuciones.",
      REOS_APP.NAME,
      8
    );
  }

  return result;
}
