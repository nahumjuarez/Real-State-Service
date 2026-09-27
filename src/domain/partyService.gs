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
