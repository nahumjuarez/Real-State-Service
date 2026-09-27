function createLease(input) {
  var data = input || {};
  var lock = LockService.getDocumentLock();

  if (!lock.tryLock(30000)) {
    throw new Error("Could not acquire lease operation lock. Try again.");
  }

  try {
    var unit = assertRecordExists_("Units", data.unitId, "Unit");
    var startDate = requireValidDate_(data.startDate, "Lease start date");
    var endDate = requireValidDate_(data.endDate, "Lease end date");

    if (endDate.getTime() <= startDate.getTime()) {
      throw new Error("Lease end date must be after start date.");
    }

    var status = requireEnumValue_(
      data.status || "ACTIVE",
      REOS_ENUMS.leaseStatus,
      "Lease status"
    );

    var tenantPartyIds = data.tenantPartyIds || [];
    if (!Array.isArray(tenantPartyIds)) {
      throw new Error("tenantPartyIds must be an array.");
    }

    if (status === "ACTIVE" && tenantPartyIds.length === 0) {
      throw new Error("An ACTIVE lease requires at least one TENANT.");
    }

    tenantPartyIds.forEach(function (partyId) {
      var party = assertRecordExists_("Parties", partyId, "Tenant party");
      if (String(party.status) !== "ACTIVE") {
        throw new Error("Tenant party must be ACTIVE: " + partyId);
      }
    });

    if ((status === "ACTIVE" || status === "EXPIRING") && String(unit.status) === "OFF_MARKET") {
      throw new Error("Cannot activate a lease for an OFF_MARKET unit.");
    }

    additionalParties.forEach(function (entry) {
      var party = assertRecordExists_("Parties", entry.partyId, "Lease party");
      requireEnumValue_(entry.role, REOS_ENUMS.leaseRole, "Lease role");

      if (String(party.status) !== "ACTIVE") {
        throw new Error("Lease party must be ACTIVE: " + entry.partyId);
      }
    });

    if (status === "ACTIVE" || status === "EXPIRING") {
      assertNoBlockingLeaseOverlap_(unit.unit_id, startDate, endDate, "");
    }

    var now = new Date();
    var lease = {
      lease_id: generateId_("LEASE"),
      unit_id: unit.unit_id,
      start_date: startDate,
      end_date: endDate,
      base_rent: requirePositiveNumber_(data.baseRent, "Base rent", true),
      deposit_required:
        data.depositRequired === undefined || data.depositRequired === ""
          ? 0
          : requirePositiveNumber_(data.depositRequired, "Deposit required", true),
      payment_due_day: requireIntegerBetween_(
        data.paymentDueDay === undefined || data.paymentDueDay === ""
          ? 1
          : data.paymentDueDay,
        1,
        31,
        "Payment due day"
      ),
      payment_frequency: requireEnumValue_(
        data.paymentFrequency || "MONTHLY",
        REOS_ENUMS.paymentFrequency,
        "Payment frequency"
      ),
      rent_adjustment_rule: normalizeOptionalString_(data.rentAdjustmentRule),
      status: status,
      contract_document_id: normalizeOptionalString_(data.contractDocumentId),
      created_at: now,
      updated_at: now
    };

    var createdLease = insertRecord_("Leases", lease);

    tenantPartyIds.forEach(function (partyId) {
      insertRecord_("LeaseParties", {
        lease_party_id: generateId_("LP"),
        lease_id: createdLease.lease_id,
        party_id: partyId,
        role: "TENANT"
      });
    });

    var additionalParties = data.additionalParties || [];
    if (!Array.isArray(additionalParties)) {
      throw new Error("additionalParties must be an array.");
    }

    additionalParties.forEach(function (entry) {
      var party = assertRecordExists_("Parties", entry.partyId, "Lease party");
      var role = requireEnumValue_(entry.role, REOS_ENUMS.leaseRole, "Lease role");

      if (tenantPartyIds.indexOf(party.party_id) !== -1 && role === "TENANT") {
        return;
      }

      insertRecord_("LeaseParties", {
        lease_party_id: generateId_("LP"),
        lease_id: createdLease.lease_id,
        party_id: party.party_id,
        role: role
      });
    });

    if (status === "ACTIVE" || status === "EXPIRING") {
      updateRecordById_("Units", unit.unit_id, {
        status: "OCCUPIED",
        updated_at: now
      });
    }

    appendAuditEvent_({
      action: "LEASE_CREATED",
      entityType: "LEASE",
      entityId: createdLease.lease_id,
      newValue: {
        lease: createdLease,
        tenantPartyIds: tenantPartyIds,
        additionalParties: additionalParties
      }
    });

    return createdLease;
  } finally {
    lock.releaseLock();
  }
}

function assertNoBlockingLeaseOverlap_(unitId, startDate, endDate, ignoredLeaseId) {
  var leases = findRecordsByField_("Leases", "unit_id", unitId);
  var blockingStatuses = ["ACTIVE", "EXPIRING"];

  leases.forEach(function (lease) {
    if (ignoredLeaseId && String(lease.lease_id) === String(ignoredLeaseId)) {
      return;
    }

    if (blockingStatuses.indexOf(String(lease.status)) === -1) {
      return;
    }

    if (
      periodsOverlap_(
        startDate,
        endDate,
        lease.start_date,
        lease.end_date
      )
    ) {
      throw new Error(
        "Lease dates overlap existing " +
          lease.lease_id +
          " for unit " +
          unitId +
          "."
      );
    }
  });
}

function getLeaseTenants_(leaseId) {
  var leaseParties = findRecordsByField_("LeaseParties", "lease_id", leaseId);

  return leaseParties
    .filter(function (entry) {
      return entry.role === "TENANT" || entry.role === "CO_TENANT";
    })
    .map(function (entry) {
      return assertRecordExists_("Parties", entry.party_id, "Lease tenant");
    });
}
