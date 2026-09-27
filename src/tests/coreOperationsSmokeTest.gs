function runCoreOperationsSmokeTest() {
  assertDevelopmentEnvironment_();

  var token = Utilities.getUuid().replace(/-/g, "").substring(0, 8).toUpperCase();
  var period = currentPeriod_();
  var periodParts = period.split("-");
  var year = Number(periodParts[0]);
  var monthIndex = Number(periodParts[1]) - 1;
  var leaseStart = new Date(year, monthIndex, 1, 12, 0, 0);
  var leaseEnd = new Date(year + 1, monthIndex, 0, 12, 0, 0);
  var failures = [];

  function check(condition, message) {
    if (!condition) failures.push(message);
  }

  var owner = createParty({
    partyType: "PERSON",
    legalName: "Core Smoke Owner " + token,
    preferredName: "Owner " + token,
    email: "owner." + token.toLowerCase() + "@example.com"
  });

  var tenant = createParty({
    partyType: "PERSON",
    legalName: "Core Smoke Tenant " + token,
    preferredName: "Tenant " + token,
    email: "tenant." + token.toLowerCase() + "@example.com"
  });

  var vendor = createParty({
    partyType: "ORGANIZATION",
    legalName: "Core Smoke Vendor " + token,
    preferredName: "Vendor " + token
  });

  var property = createProperty({
    propertyName: "Core Ops Smoke Property " + token,
    propertyType: "APARTMENT",
    municipality: "Cuauhtémoc",
    state: "Ciudad de México",
    country: "MX",
    status: "ACTIVE"
  });

  var ownership = createOwnership({
    partyId: owner.party_id,
    propertyId: property.property_id,
    ownershipPercentage: 1,
    startDate: leaseStart
  });

  var unit = createUnit({
    propertyId: property.property_id,
    unitName: "Smoke Unit " + token,
    unitType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 1,
    areaM2: 70,
    status: "VACANT"
  });

  var lease = createLease({
    unitId: unit.unit_id,
    startDate: leaseStart,
    endDate: leaseEnd,
    baseRent: 15000,
    depositRequired: 15000,
    paymentDueDay: 5,
    paymentFrequency: "MONTHLY",
    tenantPartyIds: [tenant.party_id],
    status: "ACTIVE"
  });

  var deposit = recordSecurityDeposit({
    leaseId: lease.lease_id,
    amountReceived: 15000,
    dateReceived: leaseStart
  });

  var charge = generateRentCharge({
    leaseId: lease.lease_id,
    period: period
  });

  var openBalance = getChargeBalance(charge.charge_id);
  check(openBalance.status === "OPEN", "New charge should be OPEN.");
  check(openBalance.outstandingAmount === 15000, "New charge should owe 15000.");

  var firstPayment = registerPayment({
    partyId: tenant.party_id,
    dateReceived: new Date(),
    amount: 10000,
    paymentMethod: "TRANSFER",
    reference: "CORE-SMOKE-1-" + token,
    allocations: [
      {
        chargeId: charge.charge_id,
        amount: 10000
      }
    ]
  });

  var partialBalance = getChargeBalance(charge.charge_id);
  check(partialBalance.status === "PARTIAL", "Charge should be PARTIAL after first payment.");
  check(partialBalance.outstandingAmount === 5000, "Partial balance should be 5000.");

  var overAllocationRejected = false;
  try {
    registerPayment({
      partyId: tenant.party_id,
      dateReceived: new Date(),
      amount: 6000,
      paymentMethod: "TRANSFER",
      reference: "CORE-SMOKE-OVER-" + token,
      allocations: [
        {
          chargeId: charge.charge_id,
          amount: 6000
        }
      ]
    });
  } catch (error) {
    overAllocationRejected = true;
  }
  check(overAllocationRejected, "Over-allocation should be rejected.");

  var secondPayment = registerPayment({
    partyId: tenant.party_id,
    dateReceived: new Date(),
    amount: 5000,
    paymentMethod: "TRANSFER",
    reference: "CORE-SMOKE-2-" + token,
    allocations: [
      {
        chargeId: charge.charge_id,
        amount: 5000
      }
    ]
  });

  var paidBalance = getChargeBalance(charge.charge_id);
  check(paidBalance.status === "PAID", "Charge should be PAID after second payment.");
  check(paidBalance.outstandingAmount === 0, "Paid charge should have zero outstanding.");

  var duplicateChargeRejected = false;
  try {
    generateRentCharge({
      leaseId: lease.lease_id,
      period: period
    });
  } catch (error) {
    duplicateChargeRejected = true;
  }
  check(duplicateChargeRejected, "Duplicate rent charge should be rejected.");

  var expense = createExpense({
    propertyId: property.property_id,
    unitId: unit.unit_id,
    vendorPartyId: vendor.party_id,
    expenseCategory: "REPAIR",
    description: "Core operations smoke repair",
    date: new Date(),
    amount: 900,
    paymentMethod: "TRANSFER",
    status: "PAID"
  });

  var workOrder = createWorkOrder({
    propertyId: property.property_id,
    unitId: unit.unit_id,
    reportedBy: tenant.party_id,
    vendorPartyId: vendor.party_id,
    category: "PLUMBING",
    description: "Core operations smoke maintenance",
    priority: "NORMAL",
    estimatedCost: 900
  });

  transitionWorkOrder(workOrder.work_order_id, "TRIAGED");
  transitionWorkOrder(workOrder.work_order_id, "APPROVED");
  transitionWorkOrder(workOrder.work_order_id, "IN_PROGRESS");
  var completedWorkOrder = transitionWorkOrder(
    workOrder.work_order_id,
    "COMPLETED",
    {
      actualCost: 900,
      completedAt: new Date()
    }
  );

  var leaseBalance = getLeaseBalance(lease.lease_id);
  var finalUnit = assertRecordExists_("Units", unit.unit_id, "Unit");

  check(String(finalUnit.status) === "OCCUPIED", "Active lease should mark unit OCCUPIED.");
  check(leaseBalance.totalCharges === 15000, "Lease total charges should be 15000.");
  check(leaseBalance.totalAllocated === 15000, "Lease total allocated should be 15000.");
  check(leaseBalance.outstandingAmount === 0, "Lease outstanding should be zero.");
  check(String(completedWorkOrder.status) === "COMPLETED", "Work order should be completed.");

  var result = {
    ok: failures.length === 0,
    token: token,
    period: period,
    propertyId: property.property_id,
    unitId: unit.unit_id,
    leaseId: lease.lease_id,
    chargeId: charge.charge_id,
    ownerId: owner.party_id,
    tenantId: tenant.party_id,
    ownershipId: ownership.ownership_id,
    depositId: deposit.deposit_id,
    firstPaymentId: firstPayment.payment.payment_id,
    secondPaymentId: secondPayment.payment.payment_id,
    expenseId: expense.expense_id,
    workOrderId: completedWorkOrder.work_order_id,
    finalChargeBalance: paidBalance,
    finalLeaseBalance: leaseBalance,
    failures: failures
  };

  console.log(JSON.stringify(result, null, 2));

  SpreadsheetApp.getActiveSpreadsheet().toast(
    result.ok
      ? "Core Operations OK: OPEN → PARTIAL → PAID, saldo final $0."
      : "Core Operations smoke test falló con " + failures.length + " problema(s).",
    REOS_APP.NAME,
    10
  );

  if (!result.ok) {
    throw new Error("Core Operations smoke test failed: " + failures.join("; "));
  }

  return result;
}
