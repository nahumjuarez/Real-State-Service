function createUnit(input) {
  var data = input || {};
  var property = assertRecordExists_("Properties", data.propertyId, "Property");
  var now = new Date();

  var unit = {
    unit_id: generateId_("UNIT"),
    property_id: property.property_id,
    unit_name: String(requireNonEmpty_(data.unitName, "Unit name")).trim(),
    unit_type: requireEnumValue_(
      data.unitType || "APARTMENT",
      REOS_ENUMS.unitType,
      "Unit type"
    ),
    floor: normalizeOptionalString_(data.floor),
    bedrooms:
      data.bedrooms === undefined || data.bedrooms === ""
        ? ""
        : requireIntegerBetween_(data.bedrooms, 0, 100, "Bedrooms"),
    bathrooms:
      data.bathrooms === undefined || data.bathrooms === ""
        ? ""
        : requirePositiveNumber_(data.bathrooms, "Bathrooms", true),
    parking_spaces:
      data.parkingSpaces === undefined || data.parkingSpaces === ""
        ? ""
        : requireIntegerBetween_(data.parkingSpaces, 0, 100, "Parking spaces"),
    area_m2:
      data.areaM2 === undefined || data.areaM2 === ""
        ? ""
        : requirePositiveNumber_(data.areaM2, "Area m2", false),
    rentable_area_m2:
      data.rentableAreaM2 === undefined || data.rentableAreaM2 === ""
        ? ""
        : requirePositiveNumber_(data.rentableAreaM2, "Rentable area m2", false),
    status: requireEnumValue_(
      data.status || "VACANT",
      REOS_ENUMS.unitStatus,
      "Unit status"
    ),
    created_at: now,
    updated_at: now
  };

  var created = insertRecord_("Units", unit);

  appendAuditEvent_({
    action: "UNIT_CREATED",
    entityType: "UNIT",
    entityId: created.unit_id,
    newValue: created
  });

  return created;
}


function updateUnit(input) {
  var data = input || {};
  var current = assertRecordExists_("Units", data.unitId, "Unit");
  var leases = findRecordsByField_("Leases", "unit_id", current.unit_id);
  var hasActiveLease = leases.some(function (lease) {
    return ["ACTIVE", "EXPIRING"].indexOf(String(lease.status)) !== -1;
  });

  var nextStatus = requireEnumValue_(
    data.status === undefined ? current.status : data.status,
    REOS_ENUMS.unitStatus,
    "Unit status"
  );

  if (hasActiveLease && nextStatus !== "OCCUPIED") {
    throw new Error("A unit with an active lease must remain OCCUPIED.");
  }

  if (!hasActiveLease && nextStatus === "OCCUPIED") {
    throw new Error("A unit cannot be OCCUPIED without an active lease.");
  }

  var updated = updateRecordById_("Units", current.unit_id, {
    unit_name: String(
      requireNonEmpty_(
        data.unitName === undefined ? current.unit_name : data.unitName,
        "Unit name"
      )
    ).trim(),
    unit_type: requireEnumValue_(
      data.unitType === undefined ? current.unit_type : data.unitType,
      REOS_ENUMS.unitType,
      "Unit type"
    ),
    floor:
      data.floor === undefined ? current.floor : normalizeOptionalString_(data.floor),
    bedrooms:
      data.bedrooms === undefined
        ? current.bedrooms
        : data.bedrooms === ""
          ? ""
          : requireIntegerBetween_(data.bedrooms, 0, 100, "Bedrooms"),
    bathrooms:
      data.bathrooms === undefined
        ? current.bathrooms
        : data.bathrooms === ""
          ? ""
          : requirePositiveNumber_(data.bathrooms, "Bathrooms", true),
    parking_spaces:
      data.parkingSpaces === undefined
        ? current.parking_spaces
        : data.parkingSpaces === ""
          ? ""
          : requireIntegerBetween_(
              data.parkingSpaces,
              0,
              100,
              "Parking spaces"
            ),
    area_m2:
      data.areaM2 === undefined
        ? current.area_m2
        : data.areaM2 === ""
          ? ""
          : requirePositiveNumber_(data.areaM2, "Area m2", false),
    rentable_area_m2:
      data.rentableAreaM2 === undefined
        ? current.rentable_area_m2
        : data.rentableAreaM2 === ""
          ? ""
          : requirePositiveNumber_(
              data.rentableAreaM2,
              "Rentable area m2",
              false
            ),
    status: nextStatus,
    updated_at: new Date()
  });

  appendAuditEvent_({
    action: "UNIT_UPDATED",
    entityType: "UNIT",
    entityId: current.unit_id,
    previousValue: current,
    newValue: updated
  });

  return updated;
}
