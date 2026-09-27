function registerPayment(input) {
  var data = input || {};
  var lock = LockService.getDocumentLock();

  if (!lock.tryLock(30000)) {
    throw new Error("Could not acquire payment operation lock. Try again.");
  }

  try {
    var party = assertRecordExists_("Parties", data.partyId, "Payer");
    var amount = requirePositiveNumber_(data.amount, "Payment amount", false);
    var allocations = data.allocations || [];

    if (!Array.isArray(allocations)) {
      throw new Error("allocations must be an array.");
    }

    validatePaymentAllocationsBeforeWrite_(amount, allocations);

    var period = Utilities.formatDate(
      requireValidDate_(data.dateReceived || new Date(), "Payment date"),
      Session.getScriptTimeZone() || "America/Mexico_City",
      "yyyy-MM"
    );

    var payment = {
      payment_id: generatePeriodId_("PAY", period),
      party_id: party.party_id,
      date_received: requireValidDate_(data.dateReceived || new Date(), "Payment date"),
      amount: amount,
      payment_method: requireEnumValue_(
        data.paymentMethod || "TRANSFER",
        REOS_ENUMS.paymentMethod,
        "Payment method"
      ),
      reference: normalizeOptionalString_(data.reference),
      bank_account_reference: normalizeOptionalString_(data.bankAccountReference),
      notes: normalizeOptionalString_(data.notes),
      status: "RECEIVED",
      created_at: new Date()
    };

    var createdPayment = insertRecord_("Payments", payment);
    var createdAllocations = [];

    allocations.forEach(function (allocation) {
      createdAllocations.push(
        insertRecord_("PaymentAllocations", {
          allocation_id: generateId_("ALLOC"),
          payment_id: createdPayment.payment_id,
          charge_id: allocation.chargeId,
          allocated_amount: Number(allocation.amount),
          created_at: new Date()
        })
      );
    });

    var affectedChargeIds = {};
    createdAllocations.forEach(function (allocation) {
      affectedChargeIds[allocation.charge_id] = true;

      appendAuditEvent_({
        action: "PAYMENT_ALLOCATED",
        entityType: "PAYMENT_ALLOCATION",
        entityId: allocation.allocation_id,
        newValue: allocation
      });
    });

    Object.keys(affectedChargeIds).forEach(function (chargeId) {
      reconcileChargeStatus_(chargeId);
    });

    appendAuditEvent_({
      action: "PAYMENT_RECEIVED",
      entityType: "PAYMENT",
      entityId: createdPayment.payment_id,
      newValue: {
        payment: createdPayment,
        allocations: createdAllocations
      }
    });

    return {
      payment: createdPayment,
      allocations: createdAllocations,
      unallocatedAmount:
        amount -
        createdAllocations.reduce(function (sum, allocation) {
          return sum + Number(allocation.allocated_amount || 0);
        }, 0)
    };
  } finally {
    lock.releaseLock();
  }
}

function allocatePayment(paymentId, chargeId, amount) {
  var lock = LockService.getDocumentLock();

  if (!lock.tryLock(30000)) {
    throw new Error("Could not acquire payment allocation lock. Try again.");
  }

  try {
    var payment = assertRecordExists_("Payments", paymentId, "Payment");
    var charge = assertRecordExists_("RentCharges", chargeId, "Rent charge");
    var allocationAmount = requirePositiveNumber_(amount, "Allocation amount", false);

    if (String(payment.status) !== "RECEIVED") {
      throw new Error("Only RECEIVED payments can be allocated.");
    }

    if (String(charge.status) === "VOID") {
      throw new Error("Cannot allocate a payment to a VOID charge.");
    }

    var available = getPaymentAvailableAmount_(payment.payment_id);
    if (allocationAmount - available > 0.000001) {
      throw new Error(
        "Allocation exceeds payment available amount. Available: " + available
      );
    }

    var chargeBalance = getChargeBalance(charge.charge_id);
    if (allocationAmount - chargeBalance.outstandingAmount > 0.000001) {
      throw new Error(
        "Allocation exceeds charge outstanding amount. Outstanding: " +
          chargeBalance.outstandingAmount
      );
    }

    var allocation = insertRecord_("PaymentAllocations", {
      allocation_id: generateId_("ALLOC"),
      payment_id: payment.payment_id,
      charge_id: charge.charge_id,
      allocated_amount: allocationAmount,
      created_at: new Date()
    });

    reconcileChargeStatus_(charge.charge_id);

    appendAuditEvent_({
      action: "PAYMENT_ALLOCATED",
      entityType: "PAYMENT_ALLOCATION",
      entityId: allocation.allocation_id,
      newValue: allocation
    });

    return {
      allocation: allocation,
      paymentAvailableAmount: getPaymentAvailableAmount_(payment.payment_id),
      chargeBalance: getChargeBalance(charge.charge_id)
    };
  } finally {
    lock.releaseLock();
  }
}

function validatePaymentAllocationsBeforeWrite_(paymentAmount, allocations) {
  var amountByCharge = {};
  var total = 0;

  allocations.forEach(function (allocation) {
    requireNonEmpty_(allocation.chargeId, "Allocation chargeId");
    var allocationAmount = requirePositiveNumber_(
      allocation.amount,
      "Allocation amount",
      false
    );

    var charge = assertRecordExists_(
      "RentCharges",
      allocation.chargeId,
      "Rent charge"
    );

    if (String(charge.status) === "VOID") {
      throw new Error("Cannot allocate to VOID charge: " + allocation.chargeId);
    }

    amountByCharge[allocation.chargeId] =
      (amountByCharge[allocation.chargeId] || 0) + allocationAmount;
    total += allocationAmount;
  });

  if (total - paymentAmount > 0.000001) {
    throw new Error(
      "Total allocations exceed payment amount. Payment: " +
        paymentAmount +
        ", allocations: " +
        total
    );
  }

  Object.keys(amountByCharge).forEach(function (chargeId) {
    var balance = getChargeBalance(chargeId);

    if (amountByCharge[chargeId] - balance.outstandingAmount > 0.000001) {
      throw new Error(
        "Allocations exceed outstanding charge " +
          chargeId +
          ". Outstanding: " +
          balance.outstandingAmount
      );
    }
  });

  return true;
}

function getPaymentAllocatedAmount_(paymentId) {
  assertRecordExists_("Payments", paymentId, "Payment");

  return findRecordsByField_("PaymentAllocations", "payment_id", paymentId)
    .reduce(function (sum, allocation) {
      return sum + Number(allocation.allocated_amount || 0);
    }, 0);
}

function getPaymentAvailableAmount_(paymentId) {
  var payment = assertRecordExists_("Payments", paymentId, "Payment");
  return Math.max(
    Number(payment.amount || 0) - getPaymentAllocatedAmount_(paymentId),
    0
  );
}

function getActiveAllocatedAmountForCharge_(chargeId) {
  assertRecordExists_("RentCharges", chargeId, "Rent charge");

  return findRecordsByField_("PaymentAllocations", "charge_id", chargeId)
    .reduce(function (sum, allocation) {
      var payment = findRecordById_("Payments", allocation.payment_id);

      if (!payment || String(payment.status) !== "RECEIVED") {
        return sum;
      }

      return sum + Number(allocation.allocated_amount || 0);
    }, 0);
}
