function createAccessProfile(input) {
  var data = input || {};
  assertNoInlineSecret_(data);

  var property = assertRecordExists_("Properties", data.propertyId, "Property");
  var unit = null;

  if (data.unitId) {
    unit = assertRecordExists_("Units", data.unitId, "Unit");
    if (String(unit.property_id) !== String(property.property_id)) {
      throw new Error("Selected unit does not belong to the selected property.");
    }
  }

  var now = new Date();
  var accessProfile = {
    access_profile_id: generateId_("ACCESS"),
    property_id: property.property_id,
    unit_id: unit ? unit.unit_id : "",
    access_type: requireEnumValue_(
      data.accessType || "OTHER",
      REOS_ENUMS.accessType,
      "Access type"
    ),
    label: String(requireNonEmpty_(data.label, "Access label")).trim(),
    login_identifier: normalizeOptionalString_(data.loginIdentifier),
    vault_provider: requireEnumValue_(
      data.vaultProvider || "OTHER",
      REOS_ENUMS.vaultProvider,
      "Vault provider"
    ),
    vault_item_reference: normalizeOptionalString_(data.vaultItemReference),
    instructions: normalizeOptionalString_(data.instructions),
    status: requireEnumValue_(
      data.status || "ACTIVE",
      REOS_ENUMS.accessProfileStatus,
      "Access profile status"
    ),
    created_at: now,
    updated_at: now
  };

  var created = insertRecord_("AccessProfiles", accessProfile);

  appendAuditEvent_({
    action: "ACCESS_PROFILE_CREATED",
    entityType: "ACCESS_PROFILE",
    entityId: created.access_profile_id,
    newValue: created
  });

  return created;
}

function updateAccessProfile(input) {
  var data = input || {};
  assertNoInlineSecret_(data);

  var current = assertRecordExists_(
    "AccessProfiles",
    data.accessProfileId,
    "Access profile"
  );

  var propertyId =
    data.propertyId === undefined ? current.property_id : data.propertyId;
  var unitId = data.unitId === undefined ? current.unit_id : data.unitId;

  var property = assertRecordExists_("Properties", propertyId, "Property");
  var unit = null;

  if (unitId) {
    unit = assertRecordExists_("Units", unitId, "Unit");
    if (String(unit.property_id) !== String(property.property_id)) {
      throw new Error("Selected unit does not belong to the selected property.");
    }
  }

  var patch = {
    property_id: property.property_id,
    unit_id: unit ? unit.unit_id : "",
    access_type: requireEnumValue_(
      data.accessType === undefined ? current.access_type : data.accessType,
      REOS_ENUMS.accessType,
      "Access type"
    ),
    label: String(
      requireNonEmpty_(
        data.label === undefined ? current.label : data.label,
        "Access label"
      )
    ).trim(),
    login_identifier:
      data.loginIdentifier === undefined
        ? current.login_identifier
        : normalizeOptionalString_(data.loginIdentifier),
    vault_provider: requireEnumValue_(
      data.vaultProvider === undefined
        ? current.vault_provider
        : data.vaultProvider,
      REOS_ENUMS.vaultProvider,
      "Vault provider"
    ),
    vault_item_reference:
      data.vaultItemReference === undefined
        ? current.vault_item_reference
        : normalizeOptionalString_(data.vaultItemReference),
    instructions:
      data.instructions === undefined
        ? current.instructions
        : normalizeOptionalString_(data.instructions),
    status: requireEnumValue_(
      data.status === undefined ? current.status : data.status,
      REOS_ENUMS.accessProfileStatus,
      "Access profile status"
    ),
    updated_at: new Date()
  };

  var updated = updateRecordById_(
    "AccessProfiles",
    current.access_profile_id,
    patch
  );

  appendAuditEvent_({
    action: "ACCESS_PROFILE_UPDATED",
    entityType: "ACCESS_PROFILE",
    entityId: current.access_profile_id,
    previousValue: current,
    newValue: updated
  });

  return updated;
}

function archiveAccessProfile(accessProfileId) {
  var current = assertRecordExists_(
    "AccessProfiles",
    accessProfileId,
    "Access profile"
  );

  if (String(current.status) === "INACTIVE") return current;

  var updated = updateRecordById_("AccessProfiles", current.access_profile_id, {
    status: "INACTIVE",
    updated_at: new Date()
  });

  appendAuditEvent_({
    action: "ACCESS_PROFILE_ARCHIVED",
    entityType: "ACCESS_PROFILE",
    entityId: current.access_profile_id,
    previousValue: { status: current.status },
    newValue: { status: updated.status }
  });

  return updated;
}

function assertNoInlineSecret_(data) {
  var forbiddenFields = [
    "password",
    "passcode",
    "pin",
    "secret",
    "token",
    "accessCode",
    "wifiPassword"
  ];

  forbiddenFields.forEach(function (field) {
    if (
      Object.prototype.hasOwnProperty.call(data, field) &&
      String(data[field] || "").trim() !== ""
    ) {
      throw new Error(
        "Do not store passwords, PINs, access codes or tokens in Real Estate OS. " +
          "Store the secret in a password manager and save only its vault reference."
      );
    }
  });
}
