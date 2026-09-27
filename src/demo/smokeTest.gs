function runDemoSmokeTest() {
  assertDevelopmentEnvironment_();

  var diagnostics = runSystemDiagnostics({ silent: true });
  var failures = [];

  if (!diagnostics.ok) {
    failures.push("System diagnostics failed.");
  }

  if (String(getSetting_("demo_seeded")) !== "true") {
    failures.push("Demo dataset has not been seeded.");
  }

  var expectedCounts = {
    Properties: 3,
    Units: 3,
    Leases: 3,
    RentCharges: 3,
    Payments: 3,
    PaymentAllocations: 3
  };

  Object.keys(expectedCounts).forEach(function (tableName) {
    var actual = readAllRecords_(tableName).length;
    if (actual !== expectedCounts[tableName]) {
      failures.push(
        tableName +
          " expected " +
          expectedCounts[tableName] +
          " records, got " +
          actual +
          "."
      );
    }
  });

  var charges = readAllRecords_("RentCharges");
  var allocations = readAllRecords_("PaymentAllocations");
  var allocatedByCharge = {};

  allocations.forEach(function (allocation) {
    var chargeId = String(allocation.charge_id);
    allocatedByCharge[chargeId] =
      (allocatedByCharge[chargeId] || 0) +
      Number(allocation.allocated_amount || 0);
  });

  var outstanding = {};

  charges.forEach(function (charge) {
    var chargeId = String(charge.charge_id);
    outstanding[chargeId] =
      Number(charge.current_amount || 0) -
      Number(allocatedByCharge[chargeId] || 0);
  });

  var expectedOutstanding = {
    "CHARGE-202609-DEMO-001": 0,
    "CHARGE-202609-DEMO-002": 0,
    "CHARGE-202609-DEMO-003": 6500
  };

  Object.keys(expectedOutstanding).forEach(function (chargeId) {
    if (Number(outstanding[chargeId]) !== expectedOutstanding[chargeId]) {
      failures.push(
        chargeId +
          " expected outstanding " +
          expectedOutstanding[chargeId] +
          ", got " +
          outstanding[chargeId] +
          "."
      );
    }
  });

  var result = {
    ok: failures.length === 0,
    checkedAt: new Date().toISOString(),
    outstandingByCharge: outstanding,
    failures: failures
  };

  console.log(JSON.stringify(result, null, 2));

  SpreadsheetApp.getActiveSpreadsheet().toast(
    result.ok
      ? "Smoke test OK. El caso parcial conserva $6,500 pendientes."
      : "Smoke test falló con " + failures.length + " problema(s).",
    REOS_APP.NAME,
    10
  );

  if (!result.ok) {
    throw new Error("Demo smoke test failed: " + failures.join("; "));
  }

  return result;
}
