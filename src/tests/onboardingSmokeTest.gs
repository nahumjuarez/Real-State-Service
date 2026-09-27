function runOnboardingSmokeTest() {
  assertDevelopmentEnvironment_();

  var token = Utilities.getUuid().replace(/-/g, "").substring(0, 8).toUpperCase();
  var now = new Date();
  var leaseStart = new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0);
  var leaseEnd = new Date(now.getFullYear() + 1, now.getMonth(), 0, 12, 0, 0);
  var renewalStart = new Date(
    leaseEnd.getFullYear(),
    leaseEnd.getMonth(),
    leaseEnd.getDate() + 1,
    12,
    0,
    0
  );
  var renewalEnd = new Date(
    renewalStart.getFullYear() + 1,
    renewalStart.getMonth(),
    renewalStart.getDate() - 1,
    12,
    0,
    0
  );
  var failures = [];

  function check(condition, message) {
    if (!condition) failures.push(message);
  }

  var owner = createParty({
    partyType: "PERSON",
    legalName: "Onboarding Owner " + token,
    preferredName: "Owner " + token,
    email: "owner-" + token.toLowerCase() + "@example.test"
  });

  var tenant = createParty({
    partyType: "PERSON",
    legalName: "Onboarding Tenant " + token,
    preferredName: "Tenant " + token,
    email: "tenant-" + token.toLowerCase() + "@example.test"
  });

  var guarantor = createParty({
    partyType: "PERSON",
    legalName: "Onboarding Guarantor " + token,
    preferredName: "Guarantor " + token
  });

  var propertyBundle = createPropertyOnboardingBundle({
    property: {
      propertyName: "Onboarding Property " + token,
      propertyType: "APARTMENT",
      municipality: "Demo",
      state: "Puebla",
      country: "MX",
      status: "ACTIVE"
    },
    ownerPartyId: owner.party_id,
    ownershipPercentage: 1,
    ownershipStartDate: leaseStart
  });

  check(Boolean(propertyBundle.property.property_id), "Property must be created.");
  check(
    Boolean(propertyBundle.ownership && propertyBundle.ownership.ownership_id),
    "Initial ownership must be created."
  );

  var ownershipOverflowRejected = false;
  try {
    createOwnership({
      partyId: owner.party_id,
      propertyId: propertyBundle.property.property_id,
      ownershipPercentage: 0.01,
      startDate: leaseStart
    });
  } catch (error) {
    ownershipOverflowRejected =
      String(error.message || error).indexOf("exceed 100%") !== -1;
  }
  check(
    ownershipOverflowRejected,
    "Concurrent ownership above 100% must be rejected."
  );

  var unit = createUnit({
    propertyId: propertyBundle.property.property_id,
    unitName: "Depto " + token,
    unitType: "APARTMENT",
    floor: "2",
    bedrooms: 2,
    bathrooms: 1.5,
    parkingSpaces: 1,
    areaM2: 75,
    rentableAreaM2: 75,
    status: "VACANT"
  });

  var leaseBundle = createLeaseOnboardingBundle({
    unitId: unit.unit_id,
    tenantPartyId: tenant.party_id,
    additionalParties: [
      { partyId: guarantor.party_id, role: "GUARANTOR" }
    ],
    startDate: leaseStart,
    endDate: leaseEnd,
    baseRent: 9500,
    depositRequired: 9500,
    paymentDueDay: 5,
    paymentFrequency: "MONTHLY",
    rentAdjustmentRule: "Synthetic annual review",
    status: "ACTIVE",
    depositAmountReceived: 9500,
    depositDateReceived: leaseStart
  });

  check(leaseBundle.lease.status === "ACTIVE", "Onboarded lease must be ACTIVE.");
  check(
    Boolean(leaseBundle.deposit && leaseBundle.deposit.deposit_id),
    "Initial security deposit must be created with the lease."
  );
  check(
    Number(leaseBundle.deposit.amount_held) === 9500,
    "Initial deposit must remain HELD."
  );

  var leasePartyRows = findRecordsByField_(
    "LeaseParties",
    "lease_id",
    leaseBundle.lease.lease_id
  );
  check(
    leasePartyRows.some(function (entry) {
      return String(entry.party_id) === String(guarantor.party_id) &&
        String(entry.role) === "GUARANTOR";
    }),
    "Guarantor must be persisted as a lease party."
  );

  var access = createAccessProfile({
    propertyId: propertyBundle.property.property_id,
    unitId: unit.unit_id,
    accessType: "WIFI",
    label: "Wi-Fi synthetic " + token,
    loginIdentifier: "wifi-" + token,
    vaultProvider: "GOOGLE_PASSWORD_MANAGER",
    vaultItemReference: "vault://synthetic/" + token,
    instructions: "Synthetic non-secret reference only."
  });

  check(access.status === "ACTIVE", "Access profile must be ACTIVE.");
  check(
    !Object.prototype.hasOwnProperty.call(access, "password"),
    "Access profile must never expose a password field."
  );

  var updatedOwner = updateParty({
    partyId: owner.party_id,
    partyType: "PERSON",
    legalName: owner.legal_name,
    preferredName: "Owner edited " + token,
    email: "owner-edited-" + token.toLowerCase() + "@example.test",
    phone: "0000000000",
    status: "ACTIVE"
  });
  check(
    updatedOwner.preferred_name === "Owner edited " + token,
    "Party edits must persist."
  );

  var updatedProperty = updateProperty({
    propertyId: propertyBundle.property.property_id,
    propertyName: "Onboarding Property Edited " + token,
    propertyType: "APARTMENT",
    municipality: "Demo",
    state: "Puebla",
    country: "MX",
    predialAccount: "PRED-" + token,
    status: "ACTIVE"
  });
  check(
    updatedProperty.predial_account === "PRED-" + token,
    "Property edits must persist."
  );

  var updatedUnit = updateUnit({
    unitId: unit.unit_id,
    unitName: "Depto Edited " + token,
    unitType: "APARTMENT",
    floor: "2",
    bedrooms: 2,
    bathrooms: 1.5,
    parkingSpaces: 1,
    areaM2: 76,
    rentableAreaM2: 75,
    status: "OCCUPIED"
  });
  check(
    Number(updatedUnit.area_m2) === 76,
    "Unit edits must persist."
  );

  var updatedAccess = updateAccessProfile({
    accessProfileId: access.access_profile_id,
    propertyId: propertyBundle.property.property_id,
    unitId: unit.unit_id,
    accessType: "WIFI",
    label: "Wi-Fi synthetic edited " + token,
    loginIdentifier: "wifi-edited-" + token,
    vaultProvider: "GOOGLE_PASSWORD_MANAGER",
    vaultItemReference: "vault://synthetic/edited/" + token,
    instructions: "Edited synthetic non-secret reference.",
    status: "ACTIVE"
  });
  check(
    updatedAccess.vault_item_reference ===
      "vault://synthetic/edited/" + token,
    "Access reference edits must persist."
  );

  var secretRejected = false;
  try {
    createAccessProfile({
      propertyId: propertyBundle.property.property_id,
      unitId: unit.unit_id,
      accessType: "UNIT_ENTRY",
      label: "Forbidden inline secret " + token,
      vaultProvider: "OTHER",
      password: "THIS-MUST-NOT-BE-STORED"
    });
  } catch (error) {
    secretRejected =
      String(error.message || error).indexOf("Do not store passwords") !== -1;
  }
  check(secretRejected, "Inline passwords must be rejected.");

  var renewal = createLeaseRenewal({
    leaseId: leaseBundle.lease.lease_id,
    startDate: renewalStart,
    endDate: renewalEnd,
    baseRent: 10000
  });

  check(renewal.status === "DRAFT", "Renewal must be created as DRAFT.");

  var snapshot = getOnboardingSnapshot();
  var propertyRow = snapshot.properties.filter(function (item) {
    return item.propertyId === propertyBundle.property.property_id;
  })[0];
  var leaseRow = snapshot.leases.filter(function (item) {
    return item.leaseId === leaseBundle.lease.lease_id;
  })[0];
  var accessRow = snapshot.accessProfiles.filter(function (item) {
    return item.accessProfileId === access.access_profile_id;
  })[0];

  check(
    propertyRow && Math.abs(Number(propertyRow.ownershipPercent) - 100) < 0.001,
    "Snapshot must report 100% ownership."
  );
  check(
    leaseRow && Boolean(leaseRow.depositId),
    "Snapshot must expose the lease deposit."
  );
  check(
    accessRow &&
      accessRow.vaultItemReference ===
        "vault://synthetic/edited/" + token,
    "Snapshot must expose the edited external vault reference."
  );

  var result = {
    ok: failures.length === 0,
    token: token,
    propertyId: propertyBundle.property.property_id,
    unitId: unit.unit_id,
    leaseId: leaseBundle.lease.lease_id,
    depositId: leaseBundle.deposit.deposit_id,
    accessProfileId: access.access_profile_id,
    renewalLeaseId: renewal.lease_id,
    failures: failures
  };

  console.log(JSON.stringify(result, null, 2));

  SpreadsheetApp.getActiveSpreadsheet().toast(
    result.ok
      ? "Onboarding OK: property, ownership, unit, lease, deposit, access ref and renewal validated."
      : "Onboarding smoke test failed with " + failures.length + " issue(s).",
    REOS_APP.NAME,
    10
  );

  if (!result.ok) {
    throw new Error("Onboarding smoke test failed: " + failures.join("; "));
  }

  return result;
}
