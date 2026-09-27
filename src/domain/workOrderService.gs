var REOS_WORK_ORDER_TRANSITIONS = {
  REPORTED: ["TRIAGED", "CANCELLED"],
  TRIAGED: ["APPROVED", "CANCELLED"],
  APPROVED: ["SCHEDULED", "IN_PROGRESS", "CANCELLED"],
  SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: []
};

function createWorkOrder(input) {
  var data = input || {};
  var property = assertRecordExists_("Properties", data.propertyId, "Property");
  var unit = null;

  if (data.unitId) {
    unit = assertRecordExists_("Units", data.unitId, "Unit");
    if (String(unit.property_id) !== String(property.property_id)) {
      throw new Error("Work order unit does not belong to the selected property.");
    }
  }

  if (data.reportedBy) {
    assertRecordExists_("Parties", data.reportedBy, "Reporting party");
  }

  if (data.vendorPartyId) {
    assertRecordExists_("Parties", data.vendorPartyId, "Vendor party");
  }

  var workOrder = {
    work_order_id: generateId_("WO"),
    property_id: property.property_id,
    unit_id: unit ? unit.unit_id : "",
    reported_by: normalizeOptionalString_(data.reportedBy),
    reported_at: requireValidDate_(data.reportedAt || new Date(), "Reported at"),
    category: String(requireNonEmpty_(data.category, "Work order category")).trim(),
    description: String(requireNonEmpty_(data.description, "Work order description")).trim(),
    priority: requireEnumValue_(
      data.priority || "NORMAL",
      REOS_ENUMS.workOrderPriority,
      "Work order priority"
    ),
    vendor_party_id: normalizeOptionalString_(data.vendorPartyId),
    estimated_cost:
      data.estimatedCost === undefined || data.estimatedCost === ""
        ? ""
        : requirePositiveNumber_(data.estimatedCost, "Estimated cost", true),
    actual_cost: "",
    status: "REPORTED",
    completed_at: ""
  };

  var created = insertRecord_("WorkOrders", workOrder);

  appendAuditEvent_({
    action: "WORK_ORDER_CREATED",
    entityType: "WORK_ORDER",
    entityId: created.work_order_id,
    newValue: created
  });

  return created;
}

function transitionWorkOrder(workOrderId, nextStatus, options) {
  var current = assertRecordExists_("WorkOrders", workOrderId, "Work order");
  var target = requireEnumValue_(
    nextStatus,
    REOS_ENUMS.workOrderStatus,
    "Work order status"
  );
  var opts = options || {};
  var allowed = REOS_WORK_ORDER_TRANSITIONS[String(current.status)] || [];

  if (
    String(current.priority) === "EMERGENCY" &&
    ["APPROVED", "SCHEDULED", "IN_PROGRESS", "COMPLETED"].indexOf(target) !== -1
  ) {
    allowed = allowed.concat([target]);
  }

  if (allowed.indexOf(target) === -1) {
    throw new Error(
      "Invalid work order transition: " + current.status + " -> " + target
    );
  }

  var patch = { status: target };

  if (opts.vendorPartyId) {
    assertRecordExists_("Parties", opts.vendorPartyId, "Vendor party");
    patch.vendor_party_id = opts.vendorPartyId;
  }

  if (opts.actualCost !== undefined && opts.actualCost !== "") {
    patch.actual_cost = requirePositiveNumber_(opts.actualCost, "Actual cost", true);
  }

  if (target === "COMPLETED") {
    patch.completed_at = requireValidDate_(
      opts.completedAt || new Date(),
      "Completed at"
    );
  }

  var updated = updateRecordById_("WorkOrders", workOrderId, patch);

  appendAuditEvent_({
    action: "WORK_ORDER_STATUS_CHANGED",
    entityType: "WORK_ORDER",
    entityId: workOrderId,
    previousValue: { status: current.status },
    newValue: updated
  });

  return updated;
}
