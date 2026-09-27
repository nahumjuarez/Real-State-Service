function recordSecurityDeposit(input) {
  var data = input || {};
  var lease = assertRecordExists_("Leases", data.leaseId, "Lease");
  var amount = requirePositiveNumber_(data.amountReceived, "Deposit amount", false);
  var existing = findRecordsByField_("SecurityDeposits", "lease_id", lease.lease_id)
    .filter(function (deposit) {
      return ["HELD", "PARTIALLY_RETURNED"].indexOf(String(deposit.status)) !== -1;
    });

  if (existing.length > 0) {
    throw new Error("Lease already has an active security deposit.");
  }

  var deposit = {
    deposit_id: generateId_("DEP"),
    lease_id: lease.lease_id,
    amount_received: amount,
    date_received: requireValidDate_(data.dateReceived || new Date(), "Deposit date"),
    amount_held: amount,
    amount_returned: 0,
    deductions: 0,
    return_date: "",
    status: "HELD"
  };

  var created = insertRecord_("SecurityDeposits", deposit);

  appendAuditEvent_({
    action: "SECURITY_DEPOSIT_RECORDED",
    entityType: "SECURITY_DEPOSIT",
    entityId: created.deposit_id,
    newValue: created
  });

  return created;
}


function settleSecurityDeposit(input) {
  var data = input || {};
  var deposit = assertRecordExists_(
    "SecurityDeposits",
    data.depositId,
    "Security deposit"
  );

  if (["RETURNED", "APPLIED"].indexOf(String(deposit.status)) !== -1) {
    throw new Error("Security deposit is already settled.");
  }

  var returnAmount =
    data.returnAmount === undefined || data.returnAmount === ""
      ? 0
      : requirePositiveNumber_(data.returnAmount, "Deposit return amount", true);

  var deductions =
    data.deductions === undefined || data.deductions === ""
      ? 0
      : requirePositiveNumber_(data.deductions, "Deposit deductions", true);

  var currentlyHeld = Number(deposit.amount_held || 0);

  if (returnAmount + deductions - currentlyHeld > 0.000001) {
    throw new Error(
      "Return plus deductions cannot exceed amount currently held: " +
        currentlyHeld
    );
  }

  var remainingHeld = Math.max(
    currentlyHeld - returnAmount - deductions,
    0
  );

  var totalReturned = Number(deposit.amount_returned || 0) + returnAmount;
  var totalDeductions = Number(deposit.deductions || 0) + deductions;

  var nextStatus = "HELD";
  if (remainingHeld > 0 && (returnAmount > 0 || deductions > 0)) {
    nextStatus = "PARTIALLY_RETURNED";
  } else if (remainingHeld === 0 && totalReturned > 0) {
    nextStatus = "RETURNED";
  } else if (remainingHeld === 0 && totalDeductions > 0) {
    nextStatus = "APPLIED";
  }

  var previous = {
    amount_held: deposit.amount_held,
    amount_returned: deposit.amount_returned,
    deductions: deposit.deductions,
    status: deposit.status
  };

  var updated = updateRecordById_("SecurityDeposits", deposit.deposit_id, {
    amount_held: remainingHeld,
    amount_returned: totalReturned,
    deductions: totalDeductions,
    return_date:
      remainingHeld === 0
        ? requireValidDate_(data.returnDate || new Date(), "Return date")
        : deposit.return_date,
    status: nextStatus
  });

  appendAuditEvent_({
    action: "SECURITY_DEPOSIT_SETTLED",
    entityType: "SECURITY_DEPOSIT",
    entityId: deposit.deposit_id,
    previousValue: previous,
    newValue: {
      amount_held: updated.amount_held,
      amount_returned: updated.amount_returned,
      deductions: updated.deductions,
      status: updated.status,
      reason: normalizeOptionalString_(data.reason)
    }
  });

  return updated;
}

function getLeaseSecurityDeposit(leaseId) {
  assertRecordExists_("Leases", leaseId, "Lease");

  var deposits = findRecordsByField_(
    "SecurityDeposits",
    "lease_id",
    leaseId
  );

  if (deposits.length === 0) return null;

  return deposits[deposits.length - 1];
}
