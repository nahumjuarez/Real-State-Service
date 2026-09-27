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
        : requirePositiveNumber_(data.bedrooms, "Bedrooms", true),
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
