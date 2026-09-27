function generateRentCharge(input) {
  var data = input || {};
  var lock = LockService.getDocumentLock();

  if (!lock.tryLock(30000)) {
    throw new Error("Could not acquire rent operation lock. Try again.");
  }

  try {
    var lease = assertRecordExists_("Leases", data.leaseId, "Lease");
    var period = normalizePeriod_(data.period || currentPeriod_());

    if (["ACTIVE", "EXPIRING"].indexOf(String(lease.status)) === -1) {
      throw new Error("Only ACTIVE or EXPIRING leases can generate rent charges.");
    }

    if (String(lease.payment_frequency) !== "MONTHLY") {
      throw new Error(
        "Automatic rent generation currently supports MONTHLY leases only."
      );
    }

    var unit = assertRecordExists_("Units", lease.unit_id, "Unit");
    if (String(unit.status) === "OFF_MARKET") {
      throw new Error("OFF_MARKET units cannot generate rent charges.");
    }

    if (!periodTouchesLease_(period, lease.start_date, lease.end_date)) {
      throw new Error(
        "Period " + period + " is outside lease " + lease.lease_id + "."
      );
    }

    var existing = findRecordsByField_("RentCharges", "lease_id", lease.lease_id)
      .filter(function (charge) {
        return (
          String(charge.period) === period &&
          String(charge.charge_type) === "RENT" &&
          String(charge.status) !== "VOID"
        );
      });

    if (existing.length > 0) {
      throw new Error(
        "Rent charge already exists for " + lease.lease_id + " / " + period + "."
      );
    }

    var amount = Number(lease.base_rent);
    var charge = {
      charge_id: generatePeriodId_("CHARGE", period),
      lease_id: lease.lease_id,
      charge_type: "RENT",
      period: period,
      due_date: dueDateForPeriod_(period, lease.payment_due_day),
      original_amount: amount,
      adjustments: 0,
      current_amount: amount,
      status: "OPEN",
      created_at: new Date()
    };

    var created = insertRecord_("RentCharges", charge);

    appendAuditEvent_({
      action: "RENT_CHARGE_CREATED",
      entityType: "RENT_CHARGE",
      entityId: created.charge_id,
      newValue: created
    });

    return created;
  } finally {
    lock.releaseLock();
  }
}

function generateRentChargesForPeriod(period) {
  var normalized = normalizePeriod_(period || currentPeriod_());
  var leases = readAllRecords_("Leases");
  var result = {
    period: normalized,
    created: [],
    skipped: []
  };

  leases.forEach(function (lease) {
    if (["ACTIVE", "EXPIRING"].indexOf(String(lease.status)) === -1) {
      return;
    }

    if (String(lease.payment_frequency) !== "MONTHLY") {
      result.skipped.push({
        leaseId: lease.lease_id,
        reason: "UNSUPPORTED_FREQUENCY"
      });
      return;
    }

    if (!periodTouchesLease_(normalized, lease.start_date, lease.end_date)) {
      return;
    }

    var unit = assertRecordExists_("Units", lease.unit_id, "Unit");
    if (String(unit.status) === "OFF_MARKET") {
      result.skipped.push({
        leaseId: lease.lease_id,
        reason: "UNIT_OFF_MARKET"
      });
      return;
    }

    var duplicate = findRecordsByField_("RentCharges", "lease_id", lease.lease_id)
      .some(function (charge) {
        return (
          String(charge.period) === normalized &&
          String(charge.charge_type) === "RENT" &&
          String(charge.status) !== "VOID"
        );
      });

    if (duplicate) {
      result.skipped.push({
        leaseId: lease.lease_id,
        reason: "ALREADY_EXISTS"
      });
      return;
    }

    result.created.push(
      generateRentCharge({
        leaseId: lease.lease_id,
        period: normalized
      })
    );
  });

  return result;
}

function periodTouchesLease_(period, leaseStart, leaseEnd) {
  var normalized = normalizePeriod_(period);
  var parts = normalized.split("-");
  var year = Number(parts[0]);
  var monthIndex = Number(parts[1]) - 1;

  var periodStart = new Date(year, monthIndex, 1, 12, 0, 0);
  var periodEnd = new Date(year, monthIndex + 1, 0, 12, 0, 0);

  return periodsOverlap_(
    periodStart,
    periodEnd,
    leaseStart,
    leaseEnd
  );
}

function getChargeBalance(chargeId) {
  var charge = assertRecordExists_("RentCharges", chargeId, "Rent charge");
  var allocated = getActiveAllocatedAmountForCharge_(charge.charge_id);
  var currentAmount = Number(charge.current_amount || 0);
  var outstanding = Math.max(currentAmount - allocated, 0);

  return {
    chargeId: charge.charge_id,
    leaseId: charge.lease_id,
    period: charge.period,
    currentAmount: currentAmount,
    allocatedAmount: allocated,
    outstandingAmount: outstanding,
    status: computeChargeStatus_(charge, allocated)
  };
}

function getLeaseBalance(leaseId) {
  assertRecordExists_("Leases", leaseId, "Lease");

  var charges = findRecordsByField_("RentCharges", "lease_id", leaseId)
    .filter(function (charge) {
      return String(charge.status) !== "VOID";
    });

  var totalCharges = 0;
  var totalAllocated = 0;

  var details = charges.map(function (charge) {
    var balance = getChargeBalance(charge.charge_id);
    totalCharges += balance.currentAmount;
    totalAllocated += balance.allocatedAmount;
    return balance;
  });

  return {
    leaseId: leaseId,
    totalCharges: totalCharges,
    totalAllocated: totalAllocated,
    outstandingAmount: Math.max(totalCharges - totalAllocated, 0),
    charges: details
  };
}

function computeChargeStatus_(charge, allocatedAmount) {
  if (String(charge.status) === "VOID") return "VOID";

  var amount = Number(charge.current_amount || 0);
  var allocated = Number(allocatedAmount || 0);

  if (allocated <= 0) return "OPEN";
  if (allocated + 0.000001 >= amount) return "PAID";
  return "PARTIAL";
}

function reconcileChargeStatus_(chargeId) {
  var charge = assertRecordExists_("RentCharges", chargeId, "Rent charge");
  var allocated = getActiveAllocatedAmountForCharge_(chargeId);
  var expected = computeChargeStatus_(charge, allocated);

  if (String(charge.status) !== expected) {
    var updated = updateRecordById_("RentCharges", chargeId, {
      status: expected
    });

    appendAuditEvent_({
      action: "RENT_CHARGE_STATUS_RECONCILED",
      entityType: "RENT_CHARGE",
      entityId: chargeId,
      previousValue: { status: charge.status },
      newValue: { status: expected, allocatedAmount: allocated }
    });

    return updated;
  }

  return charge;
}
