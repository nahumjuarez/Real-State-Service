function generateId_(prefix) {
  var raw = Utilities.getUuid().replace(/-/g, "").substring(0, 12).toUpperCase();
  return prefix + "-" + raw;
}
