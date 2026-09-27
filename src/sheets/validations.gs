function applyTableValidations_(sheet, tableDef) {
  var rowCount = Math.max(sheet.getMaxRows() - 1, REOS_APP.MIN_DATA_ROWS);

  tableDef.columns.forEach(function (column, index) {
    var range = sheet.getRange(2, index + 1, rowCount, 1);

    if (column.type === "ENUM" && column.enumValues) {
      var enumRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(column.enumValues, true)
        .setAllowInvalid(false)
        .setHelpText("Selecciona un valor válido para " + column.key + ".")
        .build();

      range.setDataValidation(enumRule);
      return;
    }

    if (column.type === "BOOLEAN") {
      var booleanRule = SpreadsheetApp.newDataValidation()
        .requireCheckbox()
        .setAllowInvalid(false)
        .build();

      range.setDataValidation(booleanRule);
    }
  });
}
