function ensureOperationalTriggers() {
  var environment = String(getSetting_("environment") || "").toUpperCase();

  if (environment === "PROD") {
    var onboarding = validateOnboardingForAutomation();
    if (!onboarding.ok) {
      throw new Error(
        "Monthly automation is blocked until onboarding is complete. " +
          onboarding.blockers.map(function (gap) {
            return gap.label + ": " + gap.message;
          }).join("; ")
      );
    }
  }

  var handler = "runScheduledRentChargeGeneration";
  var triggers = ScriptApp.getProjectTriggers();
  var matches = triggers.filter(function (trigger) {
    return trigger.getHandlerFunction() === handler;
  });

  if (matches.length === 0) {
    ScriptApp.newTrigger(handler)
      .timeBased()
      .onMonthDay(1)
      .atHour(5)
      .create();
  }

  matches.slice(1).forEach(function (trigger) {
    ScriptApp.deleteTrigger(trigger);
  });

  appendAuditEvent_({
    action: "OPERATIONAL_TRIGGERS_ENSURED",
    entityType: "SYSTEM",
    entityId: "TRIGGERS",
    newValue: {
      monthly_rent_charge_generation: true,
      handler: handler
    }
  });

  return getOperationalTriggerStatus();
}

function removeOperationalTriggers() {
  var handler = "runScheduledRentChargeGeneration";
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;

  triggers.forEach(function (trigger) {
    if (trigger.getHandlerFunction() === handler) {
      ScriptApp.deleteTrigger(trigger);
      removed += 1;
    }
  });

  appendAuditEvent_({
    action: "OPERATIONAL_TRIGGERS_REMOVED",
    entityType: "SYSTEM",
    entityId: "TRIGGERS",
    newValue: { removed: removed }
  });

  return { removed: removed };
}

function getOperationalTriggerStatus() {
  var handler = "runScheduledRentChargeGeneration";
  var count = ScriptApp.getProjectTriggers().filter(function (trigger) {
    return trigger.getHandlerFunction() === handler;
  }).length;

  return {
    handler: handler,
    installed: count > 0,
    count: count
  };
}

function runScheduledRentChargeGeneration() {
  var period = currentPeriod_();
  var result = generateRentChargesForPeriod(period);

  appendAuditEvent_({
    action: "SCHEDULED_RENT_GENERATION",
    entityType: "SYSTEM",
    entityId: period,
    newValue: {
      created: result.created.length,
      skipped: result.skipped.length
    }
  });

  return result;
}
