function runFullOperationsSmokeTest() {
  assertDevelopmentEnvironment_();

  var token = Utilities.getUuid().replace(/-/g, "").substring(0, 8).toUpperCase();
  var period = currentPeriod_();
  var parts = period.split("-");
  var year = Number(parts[0]);
  var monthIndex = Number(parts[1]) - 1;
  var start = new Date(year, monthIndex, 1, 12, 0, 0);
  var end = new Date(year + 1, monthIndex, 0, 12, 0, 0);
  var failures = [];

  function check(condition, message) {
    if (!condition) failures.push(message);
  }

  var owner = createParty({
    partyType: "PERSON",
    legalName: "Full Ops Owner " + token,
    preferredName: "Owner " + token
  });

  var tenant = createParty({
    partyType: "PERSON",
    legalName: "Full Ops Tenant " + token,
    preferredName: "Tenant " + token
  });

  var vendor = createParty({
    partyType: "ORGANIZATION",
    legalName: "Full Ops Vendor " + token,
    preferredName: "Vendor " + token
  });

  var property = createProperty({
    propertyName: "Full Ops Property " + token,
    propertyType: "APARTMENT",
    municipality: "Demo",
    state: "Ciudad de México",
    country: "MX",
    status: "ACTIVE"
  });

  createOwnership({
    partyId: owner.party_id,
    propertyId: property.property_id,
    ownershipPercentage: 1,
    startDate: start
  });

  var unit = createUnit({
    propertyId: property.property_id,
    unitName: "Full Ops Unit " + token,
    unitType: "APARTMENT",
    status: "VACANT"
  });

  var lease = createLease({
    unitId: unit.unit_id,
    startDate: start,
    endDate: end,
    baseRent: 12000,
    depositRequired: 15000,
    paymentDueDay: 5,
    paymentFrequency: "MONTHLY",
    tenantPartyIds: [tenant.party_id],
    status: "ACTIVE"
  });

  var deposit = recordSecurityDeposit({
    leaseId: lease.lease_id,
    amountReceived: 15000,
    dateReceived: start
  });

  var charge = generateRentCharge({
    leaseId: lease.lease_id,
    period: period
  });

  var payment = registerPayment({
    partyId: tenant.party_id,
    dateReceived: new Date(),
    amount: 12000,
    paymentMethod: "TRANSFER",
    reference: "FULL-OPS-" + token,
    allocations: [{ chargeId: charge.charge_id, amount: 12000 }]
  });

  var paid = getChargeBalance(charge.charge_id);
  check(paid.status === "PAID", "Charge must be PAID before reversal.");

  reversePayment({
    paymentId: payment.payment.payment_id,
    reason: "Full operations smoke reversal"
  });

  var reopened = getChargeBalance(charge.charge_id);
  check(reopened.status === "OPEN", "Reversed payment must reopen charge.");
  check(reopened.outstandingAmount === 12000, "Reversed payment must restore full balance.");

  var settledDeposit = settleSecurityDeposit({
    depositId: deposit.deposit_id,
    returnAmount: 10000,
    deductions: 5000,
    returnDate: new Date(),
    reason: "Smoke settlement"
  });

  check(Number(settledDeposit.amount_held) === 0, "Deposit must have zero held after settlement.");
  check(Number(settledDeposit.amount_returned) === 10000, "Deposit returned amount must be 10000.");
  check(Number(settledDeposit.deductions) === 5000, "Deposit deductions must be 5000.");

  var workOrder = createWorkOrder({
    propertyId: property.property_id,
    unitId: unit.unit_id,
    reportedBy: tenant.party_id,
    vendorPartyId: vendor.party_id,
    category: "PLUMBING",
    description: "Full operations smoke maintenance",
    priority: "NORMAL",
    estimatedCost: 1250
  });

  transitionWorkOrder(workOrder.work_order_id, "TRIAGED");
  transitionWorkOrder(workOrder.work_order_id, "APPROVED");
  transitionWorkOrder(workOrder.work_order_id, "IN_PROGRESS");
  var completedWork = transitionWorkOrder(
    workOrder.work_order_id,
    "COMPLETED",
    { actualCost: 1300, completedAt: new Date() }
  );

  check(completedWork.status === "COMPLETED", "Work order must reach COMPLETED.");
  check(Number(completedWork.actual_cost) === 1300, "Work order actual cost must persist.");

  var capex = createCapEx({
    propertyId: property.property_id,
    unitId: unit.unit_id,
    projectName: "Full Ops CapEx " + token,
    budget: 25000,
    actualCost: 24000,
    startDate: start,
    completionDate: new Date(),
    expectedUsefulLife: 10,
    notes: "Synthetic smoke CapEx"
  });

  check(Number(capex.actual_cost) === 24000, "CapEx actual cost must persist.");

  var closed = closeLease({
    leaseId: lease.lease_id,
    status: "TERMINATED",
    effectiveDate: new Date(),
    reason: "Full operations smoke close"
  });

  check(closed.lease.status === "TERMINATED", "Lease must be TERMINATED.");
  check(closed.unit.status === "VACANT", "Closed lease must release unit to VACANT.");

  var result = {
    ok: failures.length === 0,
    token: token,
    period: period,
    leaseId: lease.lease_id,
    paymentId: payment.payment.payment_id,
    depositId: deposit.deposit_id,
    workOrderId: workOrder.work_order_id,
    capexId: capex.capex_id,
    finalChargeBalance: reopened,
    finalUnitStatus: closed.unit.status,
    failures: failures
  };

  console.log(JSON.stringify(result, null, 2));

  SpreadsheetApp.getActiveSpreadsheet().toast(
    result.ok
      ? "Full Operations OK: reversa, depósito, mantenimiento, CapEx y cierre validados."
      : "Full Operations smoke test falló con " + failures.length + " problema(s).",
    REOS_APP.NAME,
    10
  );

  if (!result.ok) {
    throw new Error("Full Operations smoke test failed: " + failures.join("; "));
  }

  return result;
}
