function reversePayment(input) {
  var data = input || {};
  var payment = assertRecordExists_("Payments", data.paymentId, "Payment");

  if (String(payment.status) !== "RECEIVED") {
    throw new Error("Only RECEIVED payments can be reversed.");
  }

  var reason = String(requireNonEmpty_(data.reason, "Reversal reason")).trim();
  var allocations = findRecordsByField_(
    "PaymentAllocations",
    "payment_id",
    payment.payment_id
  );

  var previous = {
    status: payment.status,
    notes: payment.notes
  };

  var existingNotes = normalizeOptionalString_(payment.notes);
  var reversalNote =
    "[REVERSED " +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || "America/Mexico_City",
      "yyyy-MM-dd HH:mm"
    ) +
    "] " +
    reason;

  var updated = updateRecordById_("Payments", payment.payment_id, {
    status: "REVERSED",
    notes: existingNotes
      ? existingNotes + "\n" + reversalNote
      : reversalNote
  });

  var affected = {};
  allocations.forEach(function (allocation) {
    affected[String(allocation.charge_id)] = true;
  });

  Object.keys(affected).forEach(function (chargeId) {
    reconcileChargeStatus_(chargeId);
  });

  appendAuditEvent_({
    action: "PAYMENT_REVERSED",
    entityType: "PAYMENT",
    entityId: payment.payment_id,
    previousValue: previous,
    newValue: {
      status: updated.status,
      reason: reason,
      affected_charge_ids: Object.keys(affected)
    }
  });

  return {
    payment: updated,
    affectedCharges: Object.keys(affected).map(function (chargeId) {
      return getChargeBalance(chargeId);
    })
  };
}

function voidPayment(input) {
  var data = input || {};
  var payment = assertRecordExists_("Payments", data.paymentId, "Payment");

  if (getPaymentAllocatedAmount_(payment.payment_id) > 0) {
    throw new Error("Allocated payments must be REVERSED, not VOID.");
  }

  if (String(payment.status) !== "RECEIVED") {
    throw new Error("Only RECEIVED payments can be voided.");
  }

  var reason = String(requireNonEmpty_(data.reason, "Void reason")).trim();
  var updated = updateRecordById_("Payments", payment.payment_id, {
    status: "VOID",
    notes:
      normalizeOptionalString_(payment.notes) +
      (payment.notes ? "\n" : "") +
      "[VOID] " +
      reason
  });

  appendAuditEvent_({
    action: "PAYMENT_VOIDED",
    entityType: "PAYMENT",
    entityId: payment.payment_id,
    previousValue: { status: payment.status },
    newValue: { status: updated.status, reason: reason }
  });

  return updated;
}
