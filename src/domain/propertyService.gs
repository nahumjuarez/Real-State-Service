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

  assertOwnershipCapacity_(
    property.property_id,
    percentage,
    startDate,
    endDate
  );

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


function endOwnership(input) {
  var data = input || {};
  var ownership = assertRecordExists_(
    "Ownership",
    data.ownershipId,
    "Ownership"
  );
  var endDate = requireValidDate_(
    data.endDate || new Date(),
    "Ownership end date"
  );
  var startDate = requireValidDate_(
    ownership.start_date,
    "Ownership start date"
  );

  if (endDate.getTime() < startDate.getTime()) {
    throw new Error("Ownership end date cannot be before start date.");
  }

  var updated = updateRecordById_("Ownership", ownership.ownership_id, {
    end_date: endDate
  });

  appendAuditEvent_({
    action: "OWNERSHIP_ENDED",
    entityType: "OWNERSHIP",
    entityId: ownership.ownership_id,
    previousValue: { end_date: ownership.end_date },
    newValue: {
      end_date: updated.end_date,
      reason: normalizeOptionalString_(data.reason)
    }
  });

  return updated;
}

function assertOwnershipCapacity_(
  propertyId,
  candidatePercentage,
  candidateStart,
  candidateEnd
) {
  var existing = findRecordsByField_(
    "Ownership",
    "property_id",
    propertyId
  );

  if (existing.length === 0) return;

  var startMs = candidateStart.getTime();
  var endMs = candidateEnd ? candidateEnd.getTime() : Number.POSITIVE_INFINITY;
  var samples = [startMs];

  if (isFinite(endMs)) samples.push(endMs);

  existing.forEach(function (ownership) {
    var existingStart = requireValidDate_(
      ownership.start_date,
      "Existing ownership start date"
    ).getTime();
    var existingEnd = ownership.end_date
      ? requireValidDate_(
          ownership.end_date,
          "Existing ownership end date"
        ).getTime()
      : Number.POSITIVE_INFINITY;

    if (existingStart >= startMs && existingStart <= endMs) {
      samples.push(existingStart);
    }

    if (isFinite(existingEnd)) {
      var afterExistingEnd = existingEnd + 24 * 60 * 60 * 1000;
      if (afterExistingEnd >= startMs && afterExistingEnd <= endMs) {
        samples.push(afterExistingEnd);
      }
    }
  });

  samples.some(function (sampleMs) {
    var concurrent = existing.reduce(function (sum, ownership) {
      var ownershipStart = requireValidDate_(
        ownership.start_date,
        "Existing ownership start date"
      ).getTime();
      var ownershipEnd = ownership.end_date
        ? requireValidDate_(
            ownership.end_date,
            "Existing ownership end date"
          ).getTime()
        : Number.POSITIVE_INFINITY;

      var active =
        ownershipStart <= sampleMs &&
        ownershipEnd >= sampleMs;

      return active
        ? sum + Number(ownership.ownership_percentage || 0)
        : sum;
    }, 0);

    if (concurrent + candidatePercentage > 1.000001) {
      throw new Error(
        "Ownership would exceed 100% for this property during an overlapping period."
      );
    }

    return false;
  });
}


function updateProperty(input) {
  var data = input || {};
  var current = assertRecordExists_("Properties", data.propertyId, "Property");

  var updated = updateRecordById_("Properties", current.property_id, {
    property_name: String(
      requireNonEmpty_(
        data.propertyName === undefined ? current.property_name : data.propertyName,
        "Property name"
      )
    ).trim(),
    property_type: requireEnumValue_(
      data.propertyType === undefined ? current.property_type : data.propertyType,
      REOS_ENUMS.propertyType,
      "Property type"
    ),
    street:
      data.street === undefined ? current.street : normalizeOptionalString_(data.street),
    neighborhood:
      data.neighborhood === undefined
        ? current.neighborhood
        : normalizeOptionalString_(data.neighborhood),
    municipality: String(
      requireNonEmpty_(
        data.municipality === undefined ? current.municipality : data.municipality,
        "Municipality"
      )
    ).trim(),
    state: String(
      requireNonEmpty_(
        data.state === undefined ? current.state : data.state,
        "State"
      )
    ).trim(),
    postal_code:
      data.postalCode === undefined
        ? current.postal_code
        : normalizeOptionalString_(data.postalCode),
    country:
      data.country === undefined
        ? current.country
        : normalizeOptionalString_(data.country) || "MX",
    latitude:
      data.latitude === undefined
        ? current.latitude
        : data.latitude === "" ? "" : Number(data.latitude),
    longitude:
      data.longitude === undefined
        ? current.longitude
        : data.longitude === "" ? "" : Number(data.longitude),
    acquisition_date:
      data.acquisitionDate === undefined
        ? current.acquisition_date
        : data.acquisitionDate
          ? requireValidDate_(data.acquisitionDate, "Acquisition date")
          : "",
    acquisition_price:
      data.acquisitionPrice === undefined
        ? current.acquisition_price
        : data.acquisitionPrice === ""
          ? ""
          : requirePositiveNumber_(
              data.acquisitionPrice,
              "Acquisition price",
              true
            ),
    predial_account:
      data.predialAccount === undefined
        ? current.predial_account
        : normalizeOptionalString_(data.predialAccount),
    status: requireEnumValue_(
      data.status === undefined ? current.status : data.status,
      REOS_ENUMS.propertyStatus,
      "Property status"
    ),
    updated_at: new Date()
  });

  appendAuditEvent_({
    action: "PROPERTY_UPDATED",
    entityType: "PROPERTY",
    entityId: current.property_id,
    previousValue: current,
    newValue: updated
  });

  return updated;
}
