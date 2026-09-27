function closeLease(input) {
  var data = input || {};
  var lease = assertRecordExists_("Leases", data.leaseId, "Lease");
  var unit = assertRecordExists_("Units", lease.unit_id, "Unit");
  var targetStatus = requireEnumValue_(
    data.status || "ENDED",
    ["ENDED", "TERMINATED"],
    "Lease closing status"
  );
  var effectiveDate = requireValidDate_(
    data.effectiveDate || new Date(),
    "Lease effective end date"
  );

  if (["ENDED", "TERMINATED"].indexOf(String(lease.status)) !== -1) {
    throw new Error("Lease is already closed: " + lease.lease_id);
  }

  var startDate = requireValidDate_(lease.start_date, "Lease start date");
  if (effectiveDate.getTime() < startDate.getTime()) {
    throw new Error("Lease effective end date cannot be before start date.");
  }

  var previous = {
    status: lease.status,
    end_date: lease.end_date
  };

  var updated = updateRecordById_("Leases", lease.lease_id, {
    status: targetStatus,
    end_date: effectiveDate,
    updated_at: new Date()
  });

  var blockingLease = findRecordsByField_("Leases", "unit_id", unit.unit_id)
    .some(function (candidate) {
      return (
        String(candidate.lease_id) !== String(lease.lease_id) &&
        ["ACTIVE", "EXPIRING"].indexOf(String(candidate.status)) !== -1
      );
    });

  if (!blockingLease && String(unit.status) !== "OFF_MARKET") {
    updateRecordById_("Units", unit.unit_id, {
      status: "VACANT",
      updated_at: new Date()
    });
  }

  appendAuditEvent_({
    action: targetStatus === "TERMINATED" ? "LEASE_TERMINATED" : "LEASE_ENDED",
    entityType: "LEASE",
    entityId: lease.lease_id,
    previousValue: previous,
    newValue: {
      status: updated.status,
      end_date: updated.end_date,
      reason: normalizeOptionalString_(data.reason)
    }
  });

  return {
    lease: updated,
    unit: assertRecordExists_("Units", unit.unit_id, "Unit")
  };
}

function markLeaseExpiring(leaseId) {
  var lease = assertRecordExists_("Leases", leaseId, "Lease");

  if (String(lease.status) !== "ACTIVE") {
    throw new Error("Only ACTIVE leases can be marked EXPIRING.");
  }

  var updated = updateRecordById_("Leases", lease.lease_id, {
    status: "EXPIRING",
    updated_at: new Date()
  });

  appendAuditEvent_({
    action: "LEASE_MARKED_EXPIRING",
    entityType: "LEASE",
    entityId: lease.lease_id,
    previousValue: { status: lease.status },
    newValue: { status: updated.status }
  });

  return updated;
}

function createLeaseRenewal(input) {
  var data = input || {};
  var previousLease = assertRecordExists_("Leases", data.leaseId, "Lease");
  var tenants = getLeaseTenants_(previousLease.lease_id);

  if (tenants.length === 0) {
    throw new Error("Cannot renew a lease without a tenant.");
  }

  var startDate = requireValidDate_(data.startDate, "Renewal start date");
  var endDate = requireValidDate_(data.endDate, "Renewal end date");

  if (startDate.getTime() <= requireValidDate_(previousLease.end_date, "Previous lease end date").getTime()) {
    throw new Error("Renewal must start after the previous lease end date.");
  }

  var renewal = createLease({
    unitId: previousLease.unit_id,
    startDate: startDate,
    endDate: endDate,
    baseRent:
      data.baseRent === undefined || data.baseRent === ""
        ? Number(previousLease.base_rent)
        : Number(data.baseRent),
    depositRequired:
      data.depositRequired === undefined || data.depositRequired === ""
        ? Number(previousLease.deposit_required || 0)
        : Number(data.depositRequired),
    paymentDueDay:
      data.paymentDueDay === undefined || data.paymentDueDay === ""
        ? Number(previousLease.payment_due_day || 1)
        : Number(data.paymentDueDay),
    paymentFrequency: previousLease.payment_frequency,
    rentAdjustmentRule:
      data.rentAdjustmentRule === undefined
        ? previousLease.rent_adjustment_rule
        : data.rentAdjustmentRule,
    tenantPartyIds: tenants.map(function (party) {
      return party.party_id;
    }),
    status: "DRAFT"
  });

  appendAuditEvent_({
    action: "LEASE_RENEWAL_CREATED",
    entityType: "LEASE",
    entityId: renewal.lease_id,
    newValue: {
      previous_lease_id: previousLease.lease_id,
      renewal_lease_id: renewal.lease_id
    }
  });

  return renewal;
}

function activateLease(leaseId) {
  var lease = assertRecordExists_("Leases", leaseId, "Lease");

  if (String(lease.status) !== "DRAFT") {
    throw new Error("Only DRAFT leases can be activated.");
  }

  var tenants = getLeaseTenants_(lease.lease_id);
  if (tenants.length === 0) {
    throw new Error("Cannot activate a lease without a tenant.");
  }

  var unit = assertRecordExists_("Units", lease.unit_id, "Unit");
  if (String(unit.status) === "OFF_MARKET") {
    throw new Error("Cannot activate a lease for an OFF_MARKET unit.");
  }

  assertNoBlockingLeaseOverlap_(
    unit.unit_id,
    lease.start_date,
    lease.end_date,
    lease.lease_id
  );

  var updated = updateRecordById_("Leases", lease.lease_id, {
    status: "ACTIVE",
    updated_at: new Date()
  });

  updateRecordById_("Units", unit.unit_id, {
    status: "OCCUPIED",
    updated_at: new Date()
  });

  appendAuditEvent_({
    action: "LEASE_ACTIVATED",
    entityType: "LEASE",
    entityId: lease.lease_id,
    previousValue: { status: lease.status },
    newValue: { status: "ACTIVE" }
  });

  return updated;
}
