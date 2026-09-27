function generateId_(prefix) {
  var raw = Utilities.getUuid().replace(/-/g, "").substring(0, 12).toUpperCase();
  return prefix + "-" + raw;
}

function generatePeriodId_(prefix, period) {
  var normalized = normalizePeriod_(period).replace("-", "");
  var raw = Utilities.getUuid().replace(/-/g, "").substring(0, 10).toUpperCase();
  return prefix + "-" + normalized + "-" + raw;
}
