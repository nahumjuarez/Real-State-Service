function normalizePeriod_(period) {
  var value = String(period || "").trim();

  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw new Error("Period must use YYYY-MM format.");
  }

  var parts = value.split("-");
  var year = Number(parts[0]);
  var month = Number(parts[1]);

  if (month < 1 || month > 12) {
    throw new Error("Period month must be between 01 and 12.");
  }

  return year + "-" + ("0" + month).slice(-2);
}

function currentPeriod_() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || "America/Mexico_City",
    "yyyy-MM"
  );
}

function dueDateForPeriod_(period, dueDay) {
  var normalized = normalizePeriod_(period);
  var parts = normalized.split("-");
  var year = Number(parts[0]);
  var monthIndex = Number(parts[1]) - 1;
  var requestedDay = requireIntegerBetween_(dueDay, 1, 31, "Payment due day");
  var lastDay = new Date(year, monthIndex + 1, 0).getDate();

  return new Date(year, monthIndex, Math.min(requestedDay, lastDay), 12, 0, 0);
}

function periodsOverlap_(startA, endA, startB, endB) {
  var aStart = requireValidDate_(startA, "First start date").getTime();
  var aEnd = requireValidDate_(endA, "First end date").getTime();
  var bStart = requireValidDate_(startB, "Second start date").getTime();
  var bEnd = requireValidDate_(endB, "Second end date").getTime();

  return aStart <= bEnd && bStart <= aEnd;
}
