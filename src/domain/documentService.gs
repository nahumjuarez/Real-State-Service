function registerDocumentMetadata(input) {
  var data = input || {};

  var document = {
    document_id: generateId_("DOC"),
    entity_type: String(requireNonEmpty_(data.entityType, "Entity type")).trim(),
    entity_id: String(requireNonEmpty_(data.entityId, "Entity ID")).trim(),
    document_type: requireEnumValue_(
      data.documentType || "OTHER",
      REOS_ENUMS.documentType,
      "Document type"
    ),
    drive_file_id: String(requireNonEmpty_(data.driveFileId, "Drive file ID")).trim(),
    file_name: String(requireNonEmpty_(data.fileName, "File name")).trim(),
    created_at: new Date(),
    expiration_date: data.expirationDate
      ? requireValidDate_(data.expirationDate, "Expiration date")
      : "",
    status: requireEnumValue_(
      data.status || "ACTIVE",
      REOS_ENUMS.documentStatus,
      "Document status"
    )
  };

  var created = insertRecord_("Documents", document);

  appendAuditEvent_({
    action: "DOCUMENT_REGISTERED",
    entityType: "DOCUMENT",
    entityId: created.document_id,
    newValue: created
  });

  return created;
}
