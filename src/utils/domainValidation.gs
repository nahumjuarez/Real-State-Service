function requireNonEmpty_(value, label) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error((label || "Value") + " is required.");
  }
  return value;
}

function requirePositiveNumber_(value, label, allowZero) {
  var number = Number(value);

  if (!isFinite(number)) {
    throw new Error((label || "Value") + " must be a valid number.");
  }

  if (allowZero ? number < 0 : number <= 0) {
    throw new Error(
      (label || "Value") + (allowZero ? " must be >= 0." : " must be > 0.")
    );
  }

  return number;
}

function requireIntegerBetween_(value, min, max, label) {
  var number = Number(value);

  if (
    !isFinite(number) ||
    Math.floor(number) !== number ||
    number < min ||
    number > max
  ) {
    throw new Error(
      (label || "Value") + " must be an integer between " + min + " and " + max + "."
    );
  }

  return number;
}

function requireEnumValue_(value, allowed, label) {
  requireNonEmpty_(value, label);

  if (allowed.indexOf(String(value)) === -1) {
    throw new Error(
      (label || "Value") + " must be one of: " + allowed.join(", ")
    );
  }

  return String(value);
}

function requireValidDate_(value, label) {
  var date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (isNaN(date.getTime())) {
    throw new Error((label || "Date") + " is invalid.");
  }

  return date;
}

function normalizeOptionalString_(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}
