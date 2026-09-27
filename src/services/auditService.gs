function appendAuditEvent_(event) {
  var payload = event || {};

  appendRecords_("AuditLog", [{
    event_id: generateId_("EVT"),
    timestamp: new Date(),
    actor: payload.actor || currentActor_(),
    action: payload.action || "UNKNOWN_ACTION",
    entity_type: payload.entityType || "",
    entity_id: payload.entityId || "",
    previous_value: payload.previousValue || "",
    new_value: payload.newValue || "",
    source: payload.source || REOS_APP.SOURCE
  }]);
}

function currentActor_() {
  try {
    return Session.getActiveUser().getEmail() || "UNKNOWN_USER";
  } catch (error) {
    return "UNKNOWN_USER";
  }
}
