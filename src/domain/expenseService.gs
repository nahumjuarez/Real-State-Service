function createExpense(input) {
  var data = input || {};
  var property = assertRecordExists_("Properties", data.propertyId, "Property");
  var unit = null;

  if (data.unitId) {
    unit = assertRecordExists_("Units", data.unitId, "Unit");
    if (String(unit.property_id) !== String(property.property_id)) {
      throw new Error("Expense unit does not belong to the selected property.");
    }
  }

  if (data.vendorPartyId) {
    assertRecordExists_("Parties", data.vendorPartyId, "Vendor party");
  }

  var expense = {
    expense_id: generatePeriodId_(
      "EXP",
      Utilities.formatDate(
        requireValidDate_(data.date || new Date(), "Expense date"),
        Session.getScriptTimeZone() || "America/Mexico_City",
        "yyyy-MM"
      )
    ),
    property_id: property.property_id,
    unit_id: unit ? unit.unit_id : "",
    vendor_party_id: normalizeOptionalString_(data.vendorPartyId),
    expense_category: requireEnumValue_(
      data.expenseCategory || "OTHER",
      REOS_ENUMS.expenseCategory,
      "Expense category"
    ),
    description: String(requireNonEmpty_(data.description, "Expense description")).trim(),
    date: requireValidDate_(data.date || new Date(), "Expense date"),
    amount: requirePositiveNumber_(data.amount, "Expense amount", false),
    tax_amount:
      data.taxAmount === undefined || data.taxAmount === ""
        ? 0
        : requirePositiveNumber_(data.taxAmount, "Tax amount", true),
    payment_method: data.paymentMethod
      ? requireEnumValue_(data.paymentMethod, REOS_ENUMS.paymentMethod, "Payment method")
      : "",
    document_id: normalizeOptionalString_(data.documentId),
    status: requireEnumValue_(
      data.status || "PAID",
      REOS_ENUMS.expenseStatus,
      "Expense status"
    ),
    created_at: new Date()
  };

  var created = insertRecord_("Expenses", expense);

  appendAuditEvent_({
    action: "EXPENSE_CREATED",
    entityType: "EXPENSE",
    entityId: created.expense_id,
    newValue: created
  });

  return created;
}
