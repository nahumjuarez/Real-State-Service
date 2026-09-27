function createProperty(input) {
  var data = input || {};
  var now = new Date();

  var property = {
    property_id: generateId_("PROP"),
    property_name: String(requireNonEmpty_(data.propertyName, "Property name")).trim(),
    property_type: requireEnumValue_(
      data.propertyType || "APARTMENT",
      REOS_ENUMS.propertyType,
      "Property type"
    ),
    street: normalizeOptionalString_(data.street),
    neighborhood: normalizeOptionalString_(data.neighborhood),
    municipality: String(requireNonEmpty_(data.municipality, "Municipality")).trim(),
    state: String(requireNonEmpty_(data.state, "State")).trim(),
    postal_code: normalizeOptionalString_(data.postalCode),
    country: normalizeOptionalString_(data.country) || "MX",
    latitude: data.latitude === undefined || data.latitude === "" ? "" : Number(data.latitude),
    longitude: data.longitude === undefined || data.longitude === "" ? "" : Number(data.longitude),
    acquisition_date: data.acquisitionDate ? requireValidDate_(data.acquisitionDate, "Acquisition date") : "",
    acquisition_price:
      data.acquisitionPrice === undefined || data.acquisitionPrice === ""
        ? ""
        : requirePositiveNumber_(data.acquisitionPrice, "Acquisition price", true),
    predial_account: normalizeOptionalString_(data.predialAccount),
    status: requireEnumValue_(
      data.status || "ACTIVE",
      REOS_ENUMS.propertyStatus,
      "Property status"
    ),
    created_at: now,
    updated_at: now
  };

  var created = insertRecord_("Properties", property);

  appendAuditEvent_({
    action: "PROPERTY_CREATED",
    entityType: "PROPERTY",
    entityId: created.property_id,
    newValue: created
  });

  return created;
}

function createOwnership(input) {
  var data = input || {};
  var party = assertRecordExists_("Parties", data.partyId, "Owner party");
  var property = assertRecordExists_("Properties", data.propertyId, "Property");
  var percentage = requirePositiveNumber_(
    data.ownershipPercentage,
    "Ownership percentage",
    false
  );

  if (percentage > 1) {
    throw new Error("Ownership percentage must be expressed between 0 and 1.");
  }

  var startDate = requireValidDate_(data.startDate || new Date(), "Ownership start date");
  var endDate = data.endDate ? requireValidDate_(data.endDate, "Ownership end date") : "";

  if (endDate && endDate.getTime() < startDate.getTime()) {
    throw new Error("Ownership end date cannot be before start date.");
  }

  var ownership = {
    ownership_id: generateId_("OWN"),
    party_id: party.party_id,
    property_id: property.property_id,
    ownership_percentage: percentage,
    start_date: startDate,
    end_date: endDate
  };

  var created = insertRecord_("Ownership", ownership);

  appendAuditEvent_({
    action: "OWNERSHIP_CREATED",
    entityType: "OWNERSHIP",
    entityId: created.ownership_id,
    newValue: created
  });

  return created;
}
