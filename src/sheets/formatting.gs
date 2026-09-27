function applyTableFormatting_(sheet, tableDef) {
  var columnCount = tableDef.columns.length;
  var maxRows = Math.max(sheet.getMaxRows(), REOS_APP.MIN_DATA_ROWS + 1);
  var headerRange = sheet.getRange(REOS_APP.HEADER_ROW, 1, 1, columnCount);

  headerRange
    .setBackground("#1f2937")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setVerticalAlignment("middle")
    .setWrap(true);

  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 34);

  tableDef.columns.forEach(function (column, index) {
    var columnNumber = index + 1;
    var width = column.width || defaultColumnWidth_(column.type);
    sheet.setColumnWidth(columnNumber, width);

    var dataRange = sheet.getRange(
      2,
      columnNumber,
      Math.max(maxRows - 1, 1),
      1
    );

    var numberFormat = REOS_FORMATS[column.type] || "General";
    dataRange.setNumberFormat(numberFormat);
  });

  var notes = tableDef.columns.map(function (column) {
    var lines = [column.label || column.key, "Tipo: " + column.type];
    if (column.required) lines.push("Obligatorio");
    if (column.foreignKey) lines.push("FK: " + column.foreignKey);
    if (column.description) lines.push(column.description);
    return lines.join("\n");
  });

  headerRange.setNotes([notes]);
}

function defaultColumnWidth_(type) {
  if (type === "DATETIME") return 160;
  if (type === "DATE") return 110;
  if (type === "MONEY") return 120;
  if (type === "JSON") return 220;
  if (type === "URL") return 220;
  if (type === "EMAIL") return 190;
  if (type === "STRING") return 170;
  return 130;
}
