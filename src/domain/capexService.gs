function createCapEx(input) {
  var data = input || {};
  var property = assertRecordExists_("Properties", data.propertyId, "Property");
  var unit = null;

  if (data.unitId) {
    unit = assertRecordExists_("Units", data.unitId, "Unit");
    if (String(unit.property_id) !== String(property.property_id)) {
      throw new Error("CapEx unit does not belong to the selected property.");
    }
  }

  var capex = {
    capex_id: generateId_("CAPEX"),
    property_id: property.property_id,
    unit_id: unit ? unit.unit_id : "",
    project_name: String(requireNonEmpty_(data.projectName, "Project name")).trim(),
    budget:
      data.budget === undefined || data.budget === ""
        ? ""
        : requirePositiveNumber_(data.budget, "CapEx budget", true),
    actual_cost:
      data.actualCost === undefined || data.actualCost === ""
        ? ""
        : requirePositiveNumber_(data.actualCost, "CapEx actual cost", true),
    start_date: data.startDate
      ? requireValidDate_(data.startDate, "CapEx start date")
      : "",
    completion_date: data.completionDate
      ? requireValidDate_(data.completionDate, "CapEx completion date")
      : "",
    expected_useful_life:
      data.expectedUsefulLife === undefined || data.expectedUsefulLife === ""
        ? ""
        : requirePositiveNumber_(
            data.expectedUsefulLife,
            "Expected useful life",
            false
          ),
    notes: normalizeOptionalString_(data.notes)
  };

  if (
    capex.start_date &&
    capex.completion_date &&
    capex.completion_date.getTime() < capex.start_date.getTime()
  ) {
    throw new Error("CapEx completion date cannot be before start date.");
  }

  var created = insertRecord_("CapEx", capex);

  appendAuditEvent_({
    action: "CAPEX_CREATED",
    entityType: "CAPEX",
    entityId: created.capex_id,
    newValue: created
  });

  return created;
}
