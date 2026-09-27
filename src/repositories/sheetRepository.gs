function getPrimaryKey_(tableName) {
  var tableDef = getTableDef_(tableName);
  if (!tableDef.primaryKey) {
    throw new Error("Table " + tableName + " has no primary key.");
  }
  return tableDef.primaryKey;
}

function findRecordById_(tableName, id) {
  var primaryKey = getPrimaryKey_(tableName);
  var records = readAllRecords_(tableName);

  for (var i = 0; i < records.length; i += 1) {
    if (String(records[i][primaryKey]) === String(id)) {
      return records[i];
    }
  }

  return null;
}

function findRecordsByField_(tableName, field, value) {
  return readAllRecords_(tableName).filter(function (record) {
    return String(record[field]) === String(value);
  });
}

function recordExists_(tableName, id) {
  return findRecordById_(tableName, id) !== null;
}

function assertRecordExists_(tableName, id, label) {
  var record = findRecordById_(tableName, id);

  if (!record) {
    throw new Error((label || tableName) + " not found: " + id);
  }

  return record;
}

function insertRecord_(tableName, record) {
  var tableDef = getTableDef_(tableName);
  var primaryKey = getPrimaryKey_(tableName);
  var normalized = applySchemaDefaults_(tableDef, record || {});

  validateRecordAgainstSchema_(tableDef, normalized);

  if (recordExists_(tableName, normalized[primaryKey])) {
    throw new Error(
      tableName + " already contains " + primaryKey + "=" + normalized[primaryKey]
    );
  }

  appendRecords_(tableName, [normalized]);
  return findRecordById_(tableName, normalized[primaryKey]);
}

function updateRecordById_(tableName, id, patch) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(tableName);
  var tableDef = getTableDef_(tableName);
  var primaryKey = getPrimaryKey_(tableName);

  if (!sheet) throw new Error("Missing sheet " + tableName + ".");

  var current = findRecordById_(tableName, id);
  if (!current) throw new Error(tableName + " record not found: " + id);

  if (
    patch &&
    patch[primaryKey] !== undefined &&
    String(patch[primaryKey]) !== String(id)
  ) {
    throw new Error("Primary keys are immutable: " + tableName + "." + primaryKey);
  }

  var next = {};
  tableDef.columns.forEach(function (column) {
    next[column.key] =
      patch && patch[column.key] !== undefined
        ? patch[column.key]
        : current[column.key];
  });

  validateRecordAgainstSchema_(tableDef, next);

  var headers = tableDef.columns.map(function (column) {
    return column.key;
  });

  var pkIndex = headers.indexOf(primaryKey);
  var rowCount = getRecordCount_(sheet);
  var ids = rowCount > 0
    ? sheet.getRange(2, pkIndex + 1, rowCount, 1).getValues()
    : [];

  var targetRow = -1;
  for (var i = 0; i < ids.length; i += 1) {
    if (String(ids[i][0]) === String(id)) {
      targetRow = i + 2;
      break;
    }
  }

  if (targetRow === -1) {
    throw new Error(tableName + " record disappeared during update: " + id);
  }

  var values = headers.map(function (header) {
    return normalizeCellValue_(next[header]);
  });

  sheet.getRange(targetRow, 1, 1, values.length).setValues([values]);
  return findRecordById_(tableName, id);
}

function applySchemaDefaults_(tableDef, record) {
  var result = {};

  tableDef.columns.forEach(function (column) {
    if (record[column.key] !== undefined) {
      result[column.key] = record[column.key];
    } else if (column.defaultValue !== undefined) {
      result[column.key] = column.defaultValue;
    } else {
      result[column.key] = "";
    }
  });

  return result;
}

function validateRecordAgainstSchema_(tableDef, record) {
  tableDef.columns.forEach(function (column) {
    var value = record[column.key];
    var empty = value === "" || value === null || value === undefined;

    if (column.required && empty) {
      throw new Error(tableDef.name + "." + column.key + " is required.");
    }

    if (empty) return;

    if (
      column.type === "ENUM" &&
      column.enumValues &&
      column.enumValues.indexOf(String(value)) === -1
    ) {
      throw new Error(
        tableDef.name +
          "." +
          column.key +
          " must be one of: " +
          column.enumValues.join(", ")
      );
    }

    if (
      ["MONEY", "NUMBER", "INTEGER", "PERCENT"].indexOf(column.type) !== -1 &&
      (typeof value !== "number" || !isFinite(value))
    ) {
      throw new Error(
        tableDef.name + "." + column.key + " must be a finite number."
      );
    }

    if (column.type === "INTEGER" && Math.floor(value) !== value) {
      throw new Error(tableDef.name + "." + column.key + " must be an integer.");
    }

    if (column.foreignKey) {
      var parts = column.foreignKey.split(".");
      var targetTable = parts[0];
      var targetColumn = parts[1];

      if (targetColumn !== getPrimaryKey_(targetTable)) {
        throw new Error(
          "Repository only supports FK validation against primary keys: " +
            column.foreignKey
        );
      }

      if (!recordExists_(targetTable, value)) {
        throw new Error(
          tableDef.name +
            "." +
            column.key +
            " references missing " +
            column.foreignKey +
            "=" +
            value
        );
      }
    }
  });

  return true;
}
