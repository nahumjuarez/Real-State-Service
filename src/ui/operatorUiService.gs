function openOperatorPanel() {
  var html = HtmlService
    .createTemplateFromFile("OperatorPanel")
    .evaluate()
    .setWidth(1040)
    .setHeight(720);

  SpreadsheetApp.getUi().showModelessDialog(html, REOS_APP.NAME + " — Operación");
}

function includeOperatorFile_(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function pingOperatorUiBridge() {
  var result = {
    ok: true,
    message: "pong",
    timestamp: new Date().toISOString(),
    actor: currentActor_()
  };

  console.log(JSON.stringify(result));

  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Operator UI bridge: pong",
      REOS_APP.NAME,
      5
    );
  } catch (error) {
    console.log("Toast unavailable: " + error.message);
  }

  return result;
}

function getOperatorUiState(period) {
  var normalizedPeriod = normalizePeriod_(period || currentPeriod_());
  var properties = readAllRecords_("Properties");
  var units = readAllRecords_("Units");
  var parties = readAllRecords_("Parties");
  var leases = readAllRecords_("Leases");
  var leaseParties = readAllRecords_("LeaseParties");
  var charges = readAllRecords_("RentCharges");
  var payments = readAllRecords_("Payments");
  var allocations = readAllRecords_("PaymentAllocations");
  var expenses = readAllRecords_("Expenses");
  var workOrders = readAllRecords_("WorkOrders");
  var deposits = readAllRecords_("SecurityDeposits");
  var capexRecords = readAllRecords_("CapEx");

  var propertyById = indexRecordsBy_("property_id", properties);
  var unitById = indexRecordsBy_("unit_id", units);
  var partyById = indexRecordsBy_("party_id", parties);
  var leaseById = indexRecordsBy_("lease_id", leases);
  var paymentById = indexRecordsBy_("payment_id", payments);
  var depositByLease = {};
  deposits.forEach(function (deposit) {
    depositByLease[String(deposit.lease_id)] = deposit;
  });

  var allocationsByPayment = {};
  allocations.forEach(function (allocation) {
    if (!allocationsByPayment[allocation.payment_id]) {
      allocationsByPayment[allocation.payment_id] = [];
    }
    allocationsByPayment[allocation.payment_id].push(allocation);
  });

  var tenantIdsByLease = {};
  leaseParties.forEach(function (entry) {
    if (entry.role !== "TENANT" && entry.role !== "CO_TENANT") return;
    if (!tenantIdsByLease[entry.lease_id]) tenantIdsByLease[entry.lease_id] = [];
    tenantIdsByLease[entry.lease_id].push(entry.party_id);
  });

  var allocatedByCharge = {};
  allocations.forEach(function (allocation) {
    var payment = paymentById[allocation.payment_id];
    if (!payment || String(payment.status) !== "RECEIVED") return;

    allocatedByCharge[allocation.charge_id] =
      (allocatedByCharge[allocation.charge_id] || 0) +
      Number(allocation.allocated_amount || 0);
  });

  var chargeRows = charges
    .filter(function (charge) {
      return (
        String(charge.period) === normalizedPeriod &&
        String(charge.status) !== "VOID"
      );
    })
    .map(function (charge) {
      var lease = leaseById[charge.lease_id] || {};
      var unit = unitById[lease.unit_id] || {};
      var property = propertyById[unit.property_id] || {};
      var tenantIds = tenantIdsByLease[lease.lease_id] || [];
      var tenantNames = tenantIds.map(function (partyId) {
        var party = partyById[partyId] || {};
        return party.preferred_name || party.legal_name || partyId;
      });
      var tenantId = tenantIds.length ? tenantIds[0] : "";
      var allocated = Number(allocatedByCharge[charge.charge_id] || 0);
      var currentAmount = Number(charge.current_amount || 0);
      var outstanding = Math.max(currentAmount - allocated, 0);

      return {
        chargeId: String(charge.charge_id),
        leaseId: String(charge.lease_id),
        propertyId: String(unit.property_id || ""),
        propertyName: String(property.property_name || ""),
        unitId: String(unit.unit_id || ""),
        unitName: String(unit.unit_name || ""),
        tenantId: String(tenantId || ""),
        tenantName: tenantNames.join(", "),
        period: String(charge.period),
        dueDate: formatUiDate_(charge.due_date),
        currentAmount: currentAmount,
        allocatedAmount: allocated,
        outstandingAmount: outstanding,
        status: computeChargeStatus_(charge, allocated)
      };
    })
    .sort(function (a, b) {
      if (a.status === b.status) return a.dueDate.localeCompare(b.dueDate);
      var order = { PARTIAL: 0, OPEN: 1, PAID: 2 };
      return (order[a.status] || 9) - (order[b.status] || 9);
    });

  var outstandingChargeRows = charges
    .filter(function (charge) {
      return String(charge.status) !== "VOID";
    })
    .map(function (charge) {
      var lease = leaseById[charge.lease_id] || {};
      var unit = unitById[lease.unit_id] || {};
      var property = propertyById[unit.property_id] || {};
      var tenantIds = tenantIdsByLease[lease.lease_id] || [];
      var tenantNames = tenantIds.map(function (partyId) {
        var party = partyById[partyId] || {};
        return party.preferred_name || party.legal_name || partyId;
      });
      var tenantId = tenantIds.length ? tenantIds[0] : "";
      var allocated = Number(allocatedByCharge[charge.charge_id] || 0);
      var currentAmount = Number(charge.current_amount || 0);
      var outstanding = Math.max(currentAmount - allocated, 0);

      return {
        chargeId: String(charge.charge_id),
        leaseId: String(charge.lease_id),
        propertyId: String(unit.property_id || ""),
        propertyName: String(property.property_name || ""),
        unitId: String(unit.unit_id || ""),
        unitName: String(unit.unit_name || ""),
        tenantId: String(tenantId || ""),
        tenantName: tenantNames.join(", "),
        period: String(charge.period),
        dueDate: formatUiDate_(charge.due_date),
        currentAmount: currentAmount,
        allocatedAmount: allocated,
        outstandingAmount: outstanding,
        status: computeChargeStatus_(charge, allocated)
      };
    })
    .filter(function (charge) {
      return charge.outstandingAmount > 0;
    })
    .sort(function (a, b) {
      if (a.period !== b.period) return b.period.localeCompare(a.period);
      return a.dueDate.localeCompare(b.dueDate);
    });

  var activeLeases = leases
    .filter(function (lease) {
      return ["ACTIVE", "EXPIRING"].indexOf(String(lease.status)) !== -1;
    })
    .map(function (lease) {
      var unit = unitById[lease.unit_id] || {};
      var property = propertyById[unit.property_id] || {};
      var tenantIds = tenantIdsByLease[lease.lease_id] || [];
      var tenantNames = tenantIds.map(function (partyId) {
        var party = partyById[partyId] || {};
        return party.preferred_name || party.legal_name || partyId;
      });

      return {
        leaseId: String(lease.lease_id),
        propertyId: String(unit.property_id || ""),
        propertyName: String(property.property_name || ""),
        unitId: String(unit.unit_id || ""),
        unitName: String(unit.unit_name || ""),
        tenantIds: tenantIds.map(String),
        tenantName: tenantNames.join(", "),
        startDate: formatUiDate_(lease.start_date),
        endDate: formatUiDate_(lease.end_date),
        baseRent: Number(lease.base_rent || 0),
        paymentDueDay: Number(lease.payment_due_day || 1),
        status: String(lease.status),
        deposit: depositByLease[lease.lease_id]
          ? {
              depositId: String(depositByLease[lease.lease_id].deposit_id),
              amountReceived: Number(depositByLease[lease.lease_id].amount_received || 0),
              amountHeld: Number(depositByLease[lease.lease_id].amount_held || 0),
              amountReturned: Number(depositByLease[lease.lease_id].amount_returned || 0),
              deductions: Number(depositByLease[lease.lease_id].deductions || 0),
              status: String(depositByLease[lease.lease_id].status || "")
            }
          : null
      };
    });

  var summary = {
    period: normalizedPeriod,
    activeLeases: activeLeases.length,
    occupiedUnits: units.filter(function (unit) {
      return String(unit.status) === "OCCUPIED";
    }).length,
    totalCharged: chargeRows.reduce(function (sum, charge) {
      return sum + charge.currentAmount;
    }, 0),
    totalAllocated: chargeRows.reduce(function (sum, charge) {
      return sum + charge.allocatedAmount;
    }, 0),
    outstanding: chargeRows.reduce(function (sum, charge) {
      return sum + charge.outstandingAmount;
    }, 0),
    openCount: chargeRows.filter(function (charge) {
      return charge.status === "OPEN";
    }).length,
    partialCount: chargeRows.filter(function (charge) {
      return charge.status === "PARTIAL";
    }).length,
    paidCount: chargeRows.filter(function (charge) {
      return charge.status === "PAID";
    }).length
  };

  var recentExpenses = expenses
    .slice()
    .sort(function (a, b) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 8)
    .map(function (expense) {
      var property = propertyById[expense.property_id] || {};
      var unit = unitById[expense.unit_id] || {};
      return {
        expenseId: String(expense.expense_id),
        date: formatUiDate_(expense.date),
        propertyName: String(property.property_name || ""),
        unitName: String(unit.unit_name || ""),
        category: String(expense.expense_category || ""),
        description: String(expense.description || ""),
        amount: Number(expense.amount || 0),
        status: String(expense.status || "")
      };
    });

  var openWorkOrders = workOrders
    .filter(function (workOrder) {
      return ["COMPLETED", "CANCELLED"].indexOf(String(workOrder.status)) === -1;
    })
    .map(function (workOrder) {
      var property = propertyById[workOrder.property_id] || {};
      var unit = unitById[workOrder.unit_id] || {};
      return {
        workOrderId: String(workOrder.work_order_id),
        propertyName: String(property.property_name || ""),
        unitName: String(unit.unit_name || ""),
        category: String(workOrder.category || ""),
        description: String(workOrder.description || ""),
        priority: String(workOrder.priority || ""),
        status: String(workOrder.status || ""),
        reportedAt: formatUiDateTime_(workOrder.reported_at),
        vendorPartyId: String(workOrder.vendor_party_id || ""),
        estimatedCost: workOrder.estimated_cost === "" ? null : Number(workOrder.estimated_cost || 0),
        actualCost: workOrder.actual_cost === "" ? null : Number(workOrder.actual_cost || 0),
        nextStatuses: (REOS_WORK_ORDER_TRANSITIONS[String(workOrder.status)] || []).slice()
      };
    });

  var recentPayments = payments
    .slice()
    .sort(function (a, b) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 12)
    .map(function (payment) {
      var paymentAllocations = allocationsByPayment[payment.payment_id] || [];
      var firstAllocation = paymentAllocations[0] || {};
      var charge = firstAllocation.charge_id
        ? charges.filter(function (candidate) {
            return String(candidate.charge_id) === String(firstAllocation.charge_id);
          })[0]
        : null;
      var lease = charge ? leaseById[charge.lease_id] || {} : {};
      var unit = unitById[lease.unit_id] || {};
      var property = propertyById[unit.property_id] || {};
      var payer = partyById[payment.party_id] || {};

      return {
        paymentId: String(payment.payment_id),
        partyId: String(payment.party_id || ""),
        payerName: String(payer.preferred_name || payer.legal_name || ""),
        dateReceived: formatUiDate_(payment.date_received),
        amount: Number(payment.amount || 0),
        method: String(payment.payment_method || ""),
        reference: String(payment.reference || ""),
        status: String(payment.status || ""),
        propertyName: String(property.property_name || ""),
        unitName: String(unit.unit_name || ""),
        allocationCount: paymentAllocations.length
      };
    });

  var recentCapEx = capexRecords
    .slice()
    .sort(function (a, b) {
      var aDate = a.start_date ? new Date(a.start_date).getTime() : 0;
      var bDate = b.start_date ? new Date(b.start_date).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 10)
    .map(function (item) {
      var property = propertyById[item.property_id] || {};
      var unit = unitById[item.unit_id] || {};
      return {
        capexId: String(item.capex_id),
        propertyName: String(property.property_name || ""),
        unitName: String(unit.unit_name || ""),
        projectName: String(item.project_name || ""),
        budget: item.budget === "" ? null : Number(item.budget || 0),
        actualCost: item.actual_cost === "" ? null : Number(item.actual_cost || 0),
        startDate: formatUiDate_(item.start_date),
        completionDate: formatUiDate_(item.completion_date),
        expectedUsefulLife: item.expected_useful_life === "" ? null : Number(item.expected_useful_life || 0),
        notes: String(item.notes || "")
      };
    });

  return {
    app: {
      name: REOS_APP.NAME,
      version: REOS_APP.VERSION,
      environment: String(getSetting_("environment") || ""),
      currency: String(getSetting_("currency") || "MXN")
    },
    summary: summary,
    charges: chargeRows,
    pendingCharges: chargeRows.filter(function (charge) {
      return charge.outstandingAmount > 0;
    }),
    outstandingCharges: outstandingChargeRows,
    activeLeases: activeLeases,
    properties: properties
      .filter(function (property) {
        return String(property.status) === "ACTIVE";
      })
      .map(function (property) {
        return {
          propertyId: String(property.property_id),
          name: String(property.property_name || ""),
          municipality: String(property.municipality || ""),
          state: String(property.state || "")
        };
      }),
    units: units.map(function (unit) {
      return {
        unitId: String(unit.unit_id),
        propertyId: String(unit.property_id),
        name: String(unit.unit_name || ""),
        status: String(unit.status || ""),
        type: String(unit.unit_type || "")
      };
    }),
    parties: parties
      .filter(function (party) {
        return String(party.status) === "ACTIVE";
      })
      .map(function (party) {
        return {
          partyId: String(party.party_id),
          name: String(party.preferred_name || party.legal_name || ""),
          legalName: String(party.legal_name || ""),
          partyType: String(party.party_type || ""),
          email: String(party.email || "")
        };
      }),
    recentExpenses: recentExpenses,
    recentPayments: recentPayments,
    recentCapEx: recentCapEx,
    openWorkOrders: openWorkOrders,
    enums: {
      propertyTypes: REOS_ENUMS.propertyType,
      unitTypes: REOS_ENUMS.unitType,
      paymentMethods: REOS_ENUMS.paymentMethod,
      expenseCategories: REOS_ENUMS.expenseCategory,
      workOrderPriorities: REOS_ENUMS.workOrderPriority
    }
  };
}

function createPartyFromOperatorUi(payload) {
  return serializeUiValue_(createParty(payload || {}));
}

function createPropertyFromOperatorUi(payload) {
  return serializeUiValue_(createProperty(payload || {}));
}

function createUnitFromOperatorUi(payload) {
  return serializeUiValue_(createUnit(payload || {}));
}

function createLeaseFromOperatorUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    createLease({
      unitId: data.unitId,
      startDate: data.startDate,
      endDate: data.endDate,
      baseRent: Number(data.baseRent),
      depositRequired:
        data.depositRequired === "" || data.depositRequired === undefined
          ? 0
          : Number(data.depositRequired),
      paymentDueDay: Number(data.paymentDueDay || 1),
      paymentFrequency: "MONTHLY",
      rentAdjustmentRule: data.rentAdjustmentRule || "",
      tenantPartyIds: [data.tenantPartyId],
      status: "ACTIVE"
    })
  );
}

function registerPaymentFromOperatorUi(payload) {
  var data = payload || {};
  var amount = Number(data.amount);

  var result = registerPayment({
    partyId: data.partyId,
    dateReceived: data.dateReceived || new Date(),
    amount: amount,
    paymentMethod: data.paymentMethod || "TRANSFER",
    reference: data.reference || "",
    notes: data.notes || "",
    allocations: [
      {
        chargeId: data.chargeId,
        amount: amount
      }
    ]
  });

  return serializeUiValue_({
    result: result,
    chargeBalance: getChargeBalance(data.chargeId)
  });
}

function createExpenseFromOperatorUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    createExpense({
      propertyId: data.propertyId,
      unitId: data.unitId || "",
      expenseCategory: data.expenseCategory || "OTHER",
      description: data.description,
      date: data.date || new Date(),
      amount: Number(data.amount),
      taxAmount: data.taxAmount ? Number(data.taxAmount) : 0,
      paymentMethod: data.paymentMethod || "",
      status: data.status || "PAID"
    })
  );
}

function createWorkOrderFromOperatorUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    createWorkOrder({
      propertyId: data.propertyId,
      unitId: data.unitId || "",
      reportedBy: data.reportedBy || "",
      category: data.category,
      description: data.description,
      priority: data.priority || "NORMAL",
      estimatedCost:
        data.estimatedCost === "" || data.estimatedCost === undefined
          ? ""
          : Number(data.estimatedCost)
    })
  );
}

function generateChargesFromOperatorUi(period) {
  return serializeUiValue_(generateRentChargesForPeriod(period || currentPeriod_()));
}

function closeLeaseFromOperatorUi(payload) {
  return serializeUiValue_(closeLease(payload || {}));
}

function settleDepositFromOperatorUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    settleSecurityDeposit({
      depositId: data.depositId,
      returnAmount: data.returnAmount === "" ? 0 : Number(data.returnAmount || 0),
      deductions: data.deductions === "" ? 0 : Number(data.deductions || 0),
      returnDate: data.returnDate || new Date(),
      reason: data.reason || ""
    })
  );
}

function reversePaymentFromOperatorUi(payload) {
  return serializeUiValue_(reversePayment(payload || {}));
}

function transitionWorkOrderFromOperatorUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    transitionWorkOrder(
      data.workOrderId,
      data.nextStatus,
      {
        vendorPartyId: data.vendorPartyId || "",
        actualCost:
          data.actualCost === "" || data.actualCost === undefined
            ? ""
            : Number(data.actualCost),
        completedAt: data.completedAt || new Date()
      }
    )
  );
}

function createCapExFromOperatorUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    createCapEx({
      propertyId: data.propertyId,
      unitId: data.unitId || "",
      projectName: data.projectName,
      budget: data.budget === "" ? "" : Number(data.budget),
      actualCost: data.actualCost === "" ? "" : Number(data.actualCost),
      startDate: data.startDate || "",
      completionDate: data.completionDate || "",
      expectedUsefulLife:
        data.expectedUsefulLife === "" ? "" : Number(data.expectedUsefulLife),
      notes: data.notes || ""
    })
  );
}

function ensureOperationalTriggersFromUi() {
  return serializeUiValue_(ensureOperationalTriggers());
}

function getOperationalTriggerStatusFromUi() {
  return serializeUiValue_(getOperationalTriggerStatus());
}

function indexRecordsBy_(key, records) {
  var index = {};
  records.forEach(function (record) {
    index[String(record[key])] = record;
  });
  return index;
}

function formatUiDate_(value) {
  if (!value) return "";
  var date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "";
  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone() || "America/Mexico_City",
    "yyyy-MM-dd"
  );
}

function formatUiDateTime_(value) {
  if (!value) return "";
  var date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "";
  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone() || "America/Mexico_City",
    "yyyy-MM-dd HH:mm"
  );
}

function serializeUiValue_(value) {
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    return value.map(function (item) {
      return serializeUiValue_(item);
    });
  }

  if (value && typeof value === "object") {
    var result = {};
    Object.keys(value).forEach(function (key) {
      result[key] = serializeUiValue_(value[key]);
    });
    return result;
  }

  return value;
}
