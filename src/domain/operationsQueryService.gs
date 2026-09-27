function getOperationalSummary(period) {
  var normalized = normalizePeriod_(period || currentPeriod_());
  var charges = readAllRecords_("RentCharges").filter(function (charge) {
    return String(charge.period) === normalized && String(charge.status) !== "VOID";
  });

  var balances = charges.map(function (charge) {
    return getChargeBalance(charge.charge_id);
  });

  var summary = {
    period: normalized,
    activeLeases: readAllRecords_("Leases").filter(function (lease) {
      return ["ACTIVE", "EXPIRING"].indexOf(String(lease.status)) !== -1;
    }).length,
    occupiedUnits: readAllRecords_("Units").filter(function (unit) {
      return String(unit.status) === "OCCUPIED";
    }).length,
    charges: balances.length,
    totalCharged: 0,
    totalAllocated: 0,
    outstanding: 0,
    statusCounts: {
      OPEN: 0,
      PARTIAL: 0,
      PAID: 0
    }
  };

  balances.forEach(function (balance) {
    summary.totalCharged += balance.currentAmount;
    summary.totalAllocated += balance.allocatedAmount;
    summary.outstanding += balance.outstandingAmount;

    if (summary.statusCounts[balance.status] !== undefined) {
      summary.statusCounts[balance.status] += 1;
    }
  });

  return summary;
}
