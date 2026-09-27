function runOperatorUiSmokeTest() {
  assertDevelopmentEnvironment_();

  var failures = [];

  function check(condition, message) {
    if (!condition) failures.push(message);
  }

  var templateContent = "";
  try {
    templateContent = HtmlService
      .createTemplateFromFile("OperatorPanel")
      .evaluate()
      .getContent();
  } catch (error) {
    failures.push("OperatorPanel template failed to evaluate: " + error.message);
  }

  check(
    templateContent.indexOf("Panel operativo") !== -1,
    "Rendered template should contain the operator panel."
  );

  check(
    templateContent.indexOf("google.script.run") !== -1,
    "Rendered template should include client/server communication."
  );

  var state = getOperatorUiState(currentPeriod_());

  check(!!state.app, "UI state must include app metadata.");
  check(!!state.summary, "UI state must include summary.");
  check(Array.isArray(state.charges), "UI state charges must be an array.");
  check(Array.isArray(state.pendingCharges), "UI state pendingCharges must be an array.");
  check(Array.isArray(state.outstandingCharges), "UI state outstandingCharges must be an array.");
  check(Array.isArray(state.activeLeases), "UI state activeLeases must be an array.");
  check(Array.isArray(state.properties), "UI state properties must be an array.");
  check(Array.isArray(state.units), "UI state units must be an array.");
  check(Array.isArray(state.parties), "UI state parties must be an array.");
  check(Array.isArray(state.recentExpenses), "UI state recentExpenses must be an array.");
  check(Array.isArray(state.openWorkOrders), "UI state openWorkOrders must be an array.");

  var datePaths = [];
  collectDatePaths_(state, "state", datePaths);
  check(
    datePaths.length === 0,
    "UI payload must not contain Date objects: " + datePaths.join(", ")
  );

  var serialized = serializeUiValue_({
    date: new Date("2026-09-26T12:00:00"),
    nested: [{ date: new Date("2026-09-27T12:00:00") }]
  });

  check(
    typeof serialized.date === "string",
    "serializeUiValue_ must convert top-level Date to string."
  );
  check(
    typeof serialized.nested[0].date === "string",
    "serializeUiValue_ must convert nested Date to string."
  );

  var result = {
    ok: failures.length === 0,
    checkedAt: new Date().toISOString(),
    period: state.summary.period,
    templateLength: templateContent.length,
    counts: {
      properties: state.properties.length,
      units: state.units.length,
      parties: state.parties.length,
      activeLeases: state.activeLeases.length,
      charges: state.charges.length,
      pendingCharges: state.pendingCharges.length,
      outstandingCharges: state.outstandingCharges.length
    },
    failures: failures
  };

  console.log(JSON.stringify(result, null, 2));

  SpreadsheetApp.getActiveSpreadsheet().toast(
    result.ok
      ? "Operator UI OK: plantilla y payload validados."
      : "Operator UI smoke test falló con " + failures.length + " problema(s).",
    REOS_APP.NAME,
    10
  );

  if (!result.ok) {
    throw new Error("Operator UI smoke test failed: " + failures.join("; "));
  }

  return result;
}

function collectDatePaths_(value, path, output) {
  if (value instanceof Date) {
    output.push(path);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(function (item, index) {
      collectDatePaths_(item, path + "[" + index + "]", output);
    });
    return;
  }

  if (value && typeof value === "object") {
    Object.keys(value).forEach(function (key) {
      collectDatePaths_(value[key], path + "." + key, output);
    });
  }
}
