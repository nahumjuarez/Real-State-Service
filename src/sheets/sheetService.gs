function getTableDef_(tableName) {
  for (var i = 0; i < REOS_SCHEMA.length; i += 1) {
    if (REOS_SCHEMA[i].name === tableName) return REOS_SCHEMA[i];
  }
  throw new Error("Unknown table in schema: " + tableName);
}

function ensureTableSheet_(spreadsheet, tableDef) {
  var sheet = spreadsheet.getSheetByName(tableDef.name);

  if (!sheet && tableDef.name === "Settings") {
    var sheets = spreadsheet.getSheets();
    if (sheets.length === 1 && isSheetCompletelyBlank_(sheets[0])) {
      sheet = sheets[0];
      sheet.setName("Settings");
    }
  }

  if (!sheet) {
    sheet = spreadsheet.insertSheet(tableDef.name);
  }

  ensureSheetCapacity_(sheet, tableDef.columns.length);
  syncHeadersSafely_(sheet, tableDef);
  applyTableFormatting_(sheet, tableDef);
  applyTableValidations_(sheet, tableDef);

  return sheet;
}

function ensureSheetCapacity_(sheet, requiredColumns) {
  var requiredRows = REOS_APP.MIN_DATA_ROWS + 1;

  if (sheet.getMaxRows() < requiredRows) {
    sheet.insertRowsAfter(
      sheet.getMaxRows(),
      requiredRows - sheet.getMaxRows()
    );
  }

  if (sheet.getMaxColumns() < requiredColumns) {
    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      requiredColumns - sheet.getMaxColumns()
    );
  }
}

function syncHeadersSafely_(sheet, tableDef) {
  var expected = tableDef.columns.map(function (column) {
    return column.key;
  });

  var existing = sheet
    .getRange(1, 1, 1, expected.length)
    .getDisplayValues()[0];

  var anyExistingHeader = existing.some(function (value) {
    return String(value).trim() !== "";
  });

  var matches = expected.every(function (header, index) {
    return String(existing[index] || "").trim() === header;
  });

  if (anyExistingHeader && !matches && sheet.getLastRow() > 1) {
    throw new Error(
      "Schema conflict in " +
        tableDef.name +
        ": the sheet contains data and incompatible headers. " +
        "No data was overwritten."
    );
  }

  if (!matches) {
    sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
  }
}

function isSheetCompletelyBlank_(sheet) {
  if (sheet.getLastRow() === 0) return true;
  if (sheet.getLastRow() > 1 || sheet.getLastColumn() > 1) return false;
  return String(sheet.getRange(1, 1).getDisplayValue()).trim() === "";
}

function appendRecords_(tableName, records) {
  if (!records || records.length === 0) return 0;

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(tableName);
  var tableDef = getTableDef_(tableName);

  if (!sheet) {
    throw new Error("Missing sheet " + tableName + ". Run setupRealEstateOS() first.");
  }

  var headers = tableDef.columns.map(function (column) {
    return column.key;
  });

  var values = records.map(function (record) {
    return headers.map(function (header) {
      return normalizeCellValue_(record[header]);
    });
  });

  var startRow = Math.max(sheet.getLastRow() + 1, 2);
  sheet
    .getRange(startRow, 1, values.length, headers.length)
    .setValues(values);

  return values.length;
}

function normalizeCellValue_(value) {
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value;

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
}

function getRecordCount_(sheet) {
  return Math.max(sheet.getLastRow() - 1, 0);
}


function readAllRecords_(tableName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(tableName);
  var tableDef = getTableDef_(tableName);

  if (!sheet) {
    throw new Error("Missing sheet " + tableName + ".");
  }

  var rowCount = getRecordCount_(sheet);
  if (rowCount === 0) return [];

  var headers = tableDef.columns.map(function (column) {
    return column.key;
  });

  var values = sheet
    .getRange(2, 1, rowCount, headers.length)
    .getValues();

  return values.map(function (row) {
    var record = {};
    headers.forEach(function (header, index) {
      record[header] = row[index];
    });
    return record;
  });
}
