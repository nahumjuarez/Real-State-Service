function createParty(input) {
  var data = input || {};
  var now = new Date();

  var party = {
    party_id: generateId_("PARTY"),
    party_type: requireEnumValue_(
      data.partyType || "PERSON",
      REOS_ENUMS.partyType,
      "Party type"
    ),
    legal_name: String(requireNonEmpty_(data.legalName, "Legal name")).trim(),
    preferred_name: normalizeOptionalString_(data.preferredName),
    email: normalizeOptionalString_(data.email),
    phone: normalizeOptionalString_(data.phone),
    status: requireEnumValue_(
      data.status || "ACTIVE",
      REOS_ENUMS.partyStatus,
      "Party status"
    ),
    created_at: now,
    updated_at: now
  };

  var created = insertRecord_("Parties", party);

  appendAuditEvent_({
    action: "PARTY_CREATED",
    entityType: "PARTY",
    entityId: created.party_id,
    newValue: created
  });

  return created;
}


function updateParty(input) {
  var data = input || {};
  var current = assertRecordExists_("Parties", data.partyId, "Party");

  var updated = updateRecordById_("Parties", current.party_id, {
    party_type: requireEnumValue_(
      data.partyType === undefined ? current.party_type : data.partyType,
      REOS_ENUMS.partyType,
      "Party type"
    ),
    legal_name: String(
      requireNonEmpty_(
        data.legalName === undefined ? current.legal_name : data.legalName,
        "Legal name"
      )
    ).trim(),
    preferred_name:
      data.preferredName === undefined
        ? current.preferred_name
        : normalizeOptionalString_(data.preferredName),
    email:
      data.email === undefined
        ? current.email
        : normalizeOptionalString_(data.email),
    phone:
      data.phone === undefined
        ? current.phone
        : normalizeOptionalString_(data.phone),
    status: requireEnumValue_(
      data.status === undefined ? current.status : data.status,
      REOS_ENUMS.partyStatus,
      "Party status"
    ),
    updated_at: new Date()
  });

  appendAuditEvent_({
    action: "PARTY_UPDATED",
    entityType: "PARTY",
    entityId: current.party_id,
    previousValue: current,
    newValue: updated
  });

  return updated;
}
