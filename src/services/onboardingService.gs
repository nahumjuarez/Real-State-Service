function getOnboardingSnapshot() {
  var properties = readAllRecords_("Properties");
  var units = readAllRecords_("Units");
  var parties = readAllRecords_("Parties");
  var ownerships = readAllRecords_("Ownership");
  var leases = readAllRecords_("Leases");
  var leaseParties = readAllRecords_("LeaseParties");
  var deposits = readAllRecords_("SecurityDeposits");
  var accessProfiles = readAllRecords_("AccessProfiles");

  var propertyById = indexRecordsBy_("property_id", properties);
  var unitById = indexRecordsBy_("unit_id", units);
  var partyById = indexRecordsBy_("party_id", parties);
  var depositByLease = {};
  deposits.forEach(function (deposit) {
    depositByLease[String(deposit.lease_id)] = deposit;
  });

  var tenantIdsByLease = {};
  leaseParties.forEach(function (entry) {
    if (["TENANT", "CO_TENANT"].indexOf(String(entry.role)) === -1) return;
    if (!tenantIdsByLease[entry.lease_id]) tenantIdsByLease[entry.lease_id] = [];
    tenantIdsByLease[entry.lease_id].push(entry.party_id);
  });

  var activeOwnershipByProperty = {};
  var today = stripTime_(new Date());

  ownerships.forEach(function (ownership) {
    var starts = stripTime_(requireValidDate_(ownership.start_date, "Ownership start date"));
    var ends = ownership.end_date
      ? stripTime_(requireValidDate_(ownership.end_date, "Ownership end date"))
      : null;

    if (starts.getTime() > today.getTime()) return;
    if (ends && ends.getTime() < today.getTime()) return;

    var key = String(ownership.property_id);
    activeOwnershipByProperty[key] =
      (activeOwnershipByProperty[key] || 0) +
      Number(ownership.ownership_percentage || 0);
  });

  var activeLeases = leases.filter(function (lease) {
    return ["ACTIVE", "EXPIRING"].indexOf(String(lease.status)) !== -1;
  });

  var activeLeaseByUnit = {};
  activeLeases.forEach(function (lease) {
    activeLeaseByUnit[String(lease.unit_id)] = lease;
  });

  var gaps = [];

  properties.forEach(function (property) {
    var total = Number(activeOwnershipByProperty[property.property_id] || 0);
    if (total < 0.999999) {
      gaps.push({
        severity: "BLOCKER",
        code: "OWNERSHIP_INCOMPLETE",
        entityType: "PROPERTY",
        entityId: String(property.property_id),
        label: String(property.property_name || property.property_id),
        message: "La propiedad no tiene 100% de ownership activo.",
        detail: Math.round(total * 10000) / 100 + "%"
      });
    } else if (total > 1.000001) {
      gaps.push({
        severity: "BLOCKER",
        code: "OWNERSHIP_OVERALLOCATED",
        entityType: "PROPERTY",
        entityId: String(property.property_id),
        label: String(property.property_name || property.property_id),
        message: "La suma de ownership supera 100%.",
        detail: Math.round(total * 10000) / 100 + "%"
      });
    }
  });

  units.forEach(function (unit) {
    var activeLease = activeLeaseByUnit[unit.unit_id];
    if (String(unit.status) === "OCCUPIED" && !activeLease) {
      gaps.push({
        severity: "BLOCKER",
        code: "OCCUPIED_WITHOUT_LEASE",
        entityType: "UNIT",
        entityId: String(unit.unit_id),
        label: String(unit.unit_name || unit.unit_id),
        message: "La unidad está OCCUPIED pero no tiene contrato activo.",
        detail: ""
      });
    }
  });

  activeLeases.forEach(function (lease) {
    var unit = unitById[lease.unit_id] || {};
    var property = propertyById[unit.property_id] || {};
    var tenantIds = tenantIdsByLease[lease.lease_id] || [];

    if (tenantIds.length === 0) {
      gaps.push({
        severity: "BLOCKER",
        code: "LEASE_WITHOUT_TENANT",
        entityType: "LEASE",
        entityId: String(lease.lease_id),
        label:
          String(property.property_name || "") +
          " · " +
          String(unit.unit_name || lease.unit_id),
        message: "El contrato activo no tiene inquilino asociado.",
        detail: ""
      });
    }

    if (
      Number(lease.deposit_required || 0) > 0 &&
      !depositByLease[String(lease.lease_id)]
    ) {
      gaps.push({
        severity: "ACTION",
        code: "DEPOSIT_MISSING",
        entityType: "LEASE",
        entityId: String(lease.lease_id),
        label:
          String(property.property_name || "") +
          " · " +
          String(unit.unit_name || lease.unit_id),
        message: "El contrato requiere depósito y aún no está registrado.",
        detail: Number(lease.deposit_required || 0)
      });
    }
  });

  var checks = [
    {
      key: "properties",
      label: "Propiedades",
      done: properties.length > 0,
      detail: properties.length + " registradas"
    },
    {
      key: "units",
      label: "Unidades",
      done: units.length > 0,
      detail: units.length + " registradas"
    },
    {
      key: "ownership",
      label: "Ownership",
      done:
        properties.length > 0 &&
        !gaps.some(function (gap) {
          return gap.code === "OWNERSHIP_INCOMPLETE" ||
            gap.code === "OWNERSHIP_OVERALLOCATED";
        }),
      detail: "Cobertura patrimonial"
    },
    {
      key: "leases",
      label: "Contratos",
      done:
        !gaps.some(function (gap) {
          return gap.code === "OCCUPIED_WITHOUT_LEASE" ||
            gap.code === "LEASE_WITHOUT_TENANT";
        }),
      detail: activeLeases.length + " activos"
    },
    {
      key: "deposits",
      label: "Depósitos",
      done:
        !gaps.some(function (gap) {
          return gap.code === "DEPOSIT_MISSING";
        }),
      detail: deposits.length + " registrados"
    }
  ];

  var completedChecks = checks.filter(function (check) {
    return check.done;
  }).length;

  return {
    environment: String(getSetting_("environment") || "UNSET"),
    appVersion: REOS_APP.VERSION,
    schemaVersion: REOS_SCHEMA_VERSION,
    counts: {
      properties: properties.length,
      units: units.length,
      parties: parties.length,
      ownerships: ownerships.length,
      leases: leases.length,
      activeLeases: activeLeases.length,
      deposits: deposits.length,
      accessProfiles: accessProfiles.filter(function (item) {
        return String(item.status) === "ACTIVE";
      }).length
    },
    progress: {
      completed: completedChecks,
      total: checks.length,
      percent: Math.round((completedChecks / checks.length) * 100),
      checks: checks
    },
    gaps: gaps,
    properties: properties.map(function (property) {
      return {
        propertyId: String(property.property_id),
        propertyName: String(property.property_name || ""),
        propertyType: String(property.property_type || ""),
        municipality: String(property.municipality || ""),
        state: String(property.state || ""),
        ownershipPercent:
          Math.round(Number(activeOwnershipByProperty[property.property_id] || 0) * 10000) /
          100
      };
    }),
    units: units.map(function (unit) {
      var property = propertyById[unit.property_id] || {};
      return {
        unitId: String(unit.unit_id),
        propertyId: String(unit.property_id || ""),
        propertyName: String(property.property_name || ""),
        unitName: String(unit.unit_name || ""),
        unitType: String(unit.unit_type || ""),
        status: String(unit.status || ""),
        floor: String(unit.floor || ""),
        bedrooms: unit.bedrooms === "" ? null : Number(unit.bedrooms),
        bathrooms: unit.bathrooms === "" ? null : Number(unit.bathrooms),
        parkingSpaces:
          unit.parking_spaces === "" ? null : Number(unit.parking_spaces),
        areaM2: unit.area_m2 === "" ? null : Number(unit.area_m2)
      };
    }),
    parties: parties.map(function (party) {
      return {
        partyId: String(party.party_id),
        legalName: String(party.legal_name || ""),
        preferredName: String(party.preferred_name || ""),
        partyType: String(party.party_type || ""),
        email: String(party.email || ""),
        phone: String(party.phone || ""),
        status: String(party.status || "")
      };
    }),
    ownerships: ownerships.map(function (ownership) {
      var owner = partyById[ownership.party_id] || {};
      var property = propertyById[ownership.property_id] || {};
      return {
        ownershipId: String(ownership.ownership_id),
        partyId: String(ownership.party_id || ""),
        ownerName: String(owner.preferred_name || owner.legal_name || ""),
        propertyId: String(ownership.property_id || ""),
        propertyName: String(property.property_name || ""),
        ownershipPercent: Number(ownership.ownership_percentage || 0) * 100,
        startDate: formatUiDate_(ownership.start_date),
        endDate: formatUiDate_(ownership.end_date)
      };
    }),
    leases: leases.map(function (lease) {
      var unit = unitById[lease.unit_id] || {};
      var property = propertyById[unit.property_id] || {};
      var tenantIds = tenantIdsByLease[lease.lease_id] || [];
      var tenantNames = tenantIds.map(function (partyId) {
        var party = partyById[partyId] || {};
        return party.preferred_name || party.legal_name || partyId;
      });
      var deposit = depositByLease[String(lease.lease_id)];

      return {
        leaseId: String(lease.lease_id),
        propertyId: String(unit.property_id || ""),
        propertyName: String(property.property_name || ""),
        unitId: String(lease.unit_id || ""),
        unitName: String(unit.unit_name || ""),
        tenantIds: tenantIds.map(String),
        tenantName: tenantNames.join(", "),
        startDate: formatUiDate_(lease.start_date),
        endDate: formatUiDate_(lease.end_date),
        baseRent: Number(lease.base_rent || 0),
        depositRequired: Number(lease.deposit_required || 0),
        paymentDueDay: Number(lease.payment_due_day || 1),
        status: String(lease.status || ""),
        depositId: deposit ? String(deposit.deposit_id) : "",
        depositHeld: deposit ? Number(deposit.amount_held || 0) : 0
      };
    }),
    accessProfiles: accessProfiles.map(function (profile) {
      var property = propertyById[profile.property_id] || {};
      var unit = unitById[profile.unit_id] || {};
      return {
        accessProfileId: String(profile.access_profile_id),
        propertyId: String(profile.property_id || ""),
        propertyName: String(property.property_name || ""),
        unitId: String(profile.unit_id || ""),
        unitName: String(unit.unit_name || ""),
        accessType: String(profile.access_type || ""),
        label: String(profile.label || ""),
        loginIdentifier: String(profile.login_identifier || ""),
        vaultProvider: String(profile.vault_provider || ""),
        vaultItemReference: String(profile.vault_item_reference || ""),
        instructions: String(profile.instructions || ""),
        status: String(profile.status || "")
      };
    }),
    enums: {
      propertyTypes: REOS_ENUMS.propertyType.slice(),
      unitTypes: REOS_ENUMS.unitType.slice(),
      accessTypes: REOS_ENUMS.accessType.slice(),
      vaultProviders: REOS_ENUMS.vaultProvider.slice(),
      leaseStatuses: REOS_ENUMS.leaseStatus.slice()
    }
  };
}

function createPropertyOnboardingBundle(input) {
  var data = input || {};
  var lock = LockService.getDocumentLock();

  if (!lock.tryLock(30000)) {
    throw new Error("Could not acquire onboarding lock. Try again.");
  }

  try {
    var property = createProperty(data.property || data);
    var ownership = null;

    if (data.ownerPartyId) {
      ownership = createOwnership({
        partyId: data.ownerPartyId,
        propertyId: property.property_id,
        ownershipPercentage: Number(data.ownershipPercentage || 1),
        startDate: data.ownershipStartDate || data.acquisitionDate || new Date()
      });
    }

    appendAuditEvent_({
      action: "PROPERTY_ONBOARDING_BUNDLE_CREATED",
      entityType: "PROPERTY",
      entityId: property.property_id,
      newValue: {
        propertyId: property.property_id,
        ownershipId: ownership ? ownership.ownership_id : ""
      }
    });

    return {
      property: property,
      ownership: ownership
    };
  } finally {
    lock.releaseLock();
  }
}

function createLeaseOnboardingBundle(input) {
  var data = input || {};

  var amountReceived =
    data.depositAmountReceived === undefined ||
    data.depositAmountReceived === ""
      ? 0
      : requirePositiveNumber_(
          data.depositAmountReceived,
          "Deposit amount received",
          true
        );

  var depositRequired =
    data.depositRequired === undefined || data.depositRequired === ""
      ? 0
      : requirePositiveNumber_(
          data.depositRequired,
          "Deposit required",
          true
        );

  var depositDate = null;
  if (amountReceived > 0) {
    depositDate = requireValidDate_(
      data.depositDateReceived || data.startDate || new Date(),
      "Deposit date"
    );
  }

  var lease = createLease({
    unitId: data.unitId,
    startDate: data.startDate,
    endDate: data.endDate,
    baseRent: data.baseRent,
    depositRequired: depositRequired,
    paymentDueDay: data.paymentDueDay,
    paymentFrequency: data.paymentFrequency || "MONTHLY",
    rentAdjustmentRule: data.rentAdjustmentRule || "",
    tenantPartyIds: data.tenantPartyIds || [data.tenantPartyId],
    additionalParties: data.additionalParties || [],
    status: data.status || "ACTIVE"
  });

  var deposit = null;
  if (amountReceived > 0) {
    deposit = recordSecurityDeposit({
      leaseId: lease.lease_id,
      amountReceived: amountReceived,
      dateReceived: depositDate
    });
  }

  appendAuditEvent_({
    action: "LEASE_ONBOARDING_BUNDLE_CREATED",
    entityType: "LEASE",
    entityId: lease.lease_id,
    newValue: {
      leaseId: lease.lease_id,
      depositId: deposit ? deposit.deposit_id : ""
    }
  });

  return {
    lease: lease,
    deposit: deposit
  };
}

function validateOnboardingForAutomation() {
  var snapshot = getOnboardingSnapshot();
  var blockers = snapshot.gaps.filter(function (gap) {
    return gap.severity === "BLOCKER" || gap.severity === "ACTION";
  });

  return {
    ok: blockers.length === 0 && snapshot.counts.properties > 0,
    blockers: blockers,
    progress: snapshot.progress,
    counts: snapshot.counts
  };
}

function stripTime_(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
