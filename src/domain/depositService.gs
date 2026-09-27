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
