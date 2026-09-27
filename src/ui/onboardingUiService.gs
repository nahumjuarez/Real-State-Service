function openOnboardingPanel() {
  ensureOnboardingSchema_();

  var html = HtmlService
    .createTemplateFromFile("OnboardingPanel")
    .evaluate()
    .setWidth(1120)
    .setHeight(760);

  SpreadsheetApp.getUi().showModelessDialog(
    html,
    REOS_APP.NAME + " — Onboarding"
  );
}

function includeOnboardingFile_(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getOnboardingUiState() {
  ensureOnboardingSchema_();
  return serializeUiValue_(getOnboardingSnapshot());
}

function ensureOnboardingSchema_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet.getSheetByName("AccessProfiles")) {
    setupRealEstateOS();
  }

  var appliedVersion = String(getSetting_("schema_version") || "");
  if (appliedVersion !== REOS_SCHEMA_VERSION) {
    setupRealEstateOS();
  }
}

function createOnboardingPartyFromUi(payload) {
  return serializeUiValue_(createParty(payload || {}));
}

function updateOnboardingPartyFromUi(payload) {
  return serializeUiValue_(updateParty(payload || {}));
}

function createOnboardingPropertyFromUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    createPropertyOnboardingBundle({
      property: {
        propertyName: data.propertyName,
        propertyType: data.propertyType,
        street: data.street || "",
        neighborhood: data.neighborhood || "",
        municipality: data.municipality,
        state: data.state,
        postalCode: data.postalCode || "",
        country: data.country || "MX",
        latitude:
          data.latitude === "" || data.latitude === undefined
            ? ""
            : Number(data.latitude),
        longitude:
          data.longitude === "" || data.longitude === undefined
            ? ""
            : Number(data.longitude),
        acquisitionDate: data.acquisitionDate || "",
        acquisitionPrice:
          data.acquisitionPrice === "" || data.acquisitionPrice === undefined
            ? ""
            : Number(data.acquisitionPrice),
        predialAccount: data.predialAccount || "",
        status: data.status || "ACTIVE"
      },
      ownerPartyId: data.ownerPartyId || "",
      ownershipPercentage:
        data.ownershipPercent === "" || data.ownershipPercent === undefined
          ? 1
          : Number(data.ownershipPercent) / 100,
      ownershipStartDate:
        data.ownershipStartDate || data.acquisitionDate || new Date()
    })
  );
}

function updateOnboardingPropertyFromUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    updateProperty({
      propertyId: data.propertyId,
      propertyName: data.propertyName,
      propertyType: data.propertyType,
      street: data.street || "",
      neighborhood: data.neighborhood || "",
      municipality: data.municipality,
      state: data.state,
      postalCode: data.postalCode || "",
      country: data.country || "MX",
      acquisitionDate: data.acquisitionDate || "",
      acquisitionPrice:
        data.acquisitionPrice === "" || data.acquisitionPrice === undefined
          ? ""
          : Number(data.acquisitionPrice),
      predialAccount: data.predialAccount || "",
      status: data.status || "ACTIVE"
    })
  );
}

function createOnboardingOwnershipFromUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    createOwnership({
      partyId: data.partyId,
      propertyId: data.propertyId,
      ownershipPercentage: Number(data.ownershipPercent) / 100,
      startDate: data.startDate || new Date(),
      endDate: data.endDate || ""
    })
  );
}

function endOnboardingOwnershipFromUi(payload) {
  return serializeUiValue_(endOwnership(payload || {}));
}

function createOnboardingUnitFromUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    createUnit({
      propertyId: data.propertyId,
      unitName: data.unitName,
      unitType: data.unitType,
      floor: data.floor || "",
      bedrooms:
        data.bedrooms === "" || data.bedrooms === undefined
          ? ""
          : Number(data.bedrooms),
      bathrooms:
        data.bathrooms === "" || data.bathrooms === undefined
          ? ""
          : Number(data.bathrooms),
      parkingSpaces:
        data.parkingSpaces === "" || data.parkingSpaces === undefined
          ? ""
          : Number(data.parkingSpaces),
      areaM2:
        data.areaM2 === "" || data.areaM2 === undefined
          ? ""
          : Number(data.areaM2),
      rentableAreaM2:
        data.rentableAreaM2 === "" || data.rentableAreaM2 === undefined
          ? ""
          : Number(data.rentableAreaM2),
      status: data.status || "VACANT"
    })
  );
}

function updateOnboardingUnitFromUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    updateUnit({
      unitId: data.unitId,
      unitName: data.unitName,
      unitType: data.unitType,
      floor: data.floor || "",
      bedrooms:
        data.bedrooms === "" || data.bedrooms === undefined
          ? ""
          : Number(data.bedrooms),
      bathrooms:
        data.bathrooms === "" || data.bathrooms === undefined
          ? ""
          : Number(data.bathrooms),
      parkingSpaces:
        data.parkingSpaces === "" || data.parkingSpaces === undefined
          ? ""
          : Number(data.parkingSpaces),
      areaM2:
        data.areaM2 === "" || data.areaM2 === undefined
          ? ""
          : Number(data.areaM2),
      rentableAreaM2:
        data.rentableAreaM2 === "" || data.rentableAreaM2 === undefined
          ? ""
          : Number(data.rentableAreaM2),
      status: data.status
    })
  );
}

function createOnboardingLeaseFromUi(payload) {
  var data = payload || {};
  var additionalParties = [];

  if (data.coTenantPartyId) {
    additionalParties.push({
      partyId: data.coTenantPartyId,
      role: "CO_TENANT"
    });
  }

  if (data.guarantorPartyId) {
    additionalParties.push({
      partyId: data.guarantorPartyId,
      role: "GUARANTOR"
    });
  }

  return serializeUiValue_(
    createLeaseOnboardingBundle({
      unitId: data.unitId,
      tenantPartyId: data.tenantPartyId,
      additionalParties: additionalParties,
      startDate: data.startDate,
      endDate: data.endDate,
      baseRent: Number(data.baseRent),
      depositRequired:
        data.depositRequired === "" || data.depositRequired === undefined
          ? 0
          : Number(data.depositRequired),
      paymentDueDay: Number(data.paymentDueDay || 1),
      paymentFrequency: data.paymentFrequency || "MONTHLY",
      rentAdjustmentRule: data.rentAdjustmentRule || "",
      status: data.status || "ACTIVE",
      depositAmountReceived:
        data.depositAmountReceived === "" ||
        data.depositAmountReceived === undefined
          ? 0
          : Number(data.depositAmountReceived),
      depositDateReceived: data.depositDateReceived || data.startDate
    })
  );
}

function recordOnboardingDepositFromUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    recordSecurityDeposit({
      leaseId: data.leaseId,
      amountReceived: Number(data.amountReceived),
      dateReceived: data.dateReceived || new Date()
    })
  );
}

function createOnboardingAccessProfileFromUi(payload) {
  return serializeUiValue_(createAccessProfile(payload || {}));
}

function updateOnboardingAccessProfileFromUi(payload) {
  return serializeUiValue_(updateAccessProfile(payload || {}));
}

function archiveOnboardingAccessProfileFromUi(payload) {
  var data = payload || {};
  return serializeUiValue_(archiveAccessProfile(data.accessProfileId));
}

function createOnboardingRenewalFromUi(payload) {
  var data = payload || {};
  return serializeUiValue_(
    createLeaseRenewal({
      leaseId: data.leaseId,
      startDate: data.startDate,
      endDate: data.endDate,
      baseRent:
        data.baseRent === "" || data.baseRent === undefined
          ? ""
          : Number(data.baseRent),
      depositRequired:
        data.depositRequired === "" || data.depositRequired === undefined
          ? ""
          : Number(data.depositRequired),
      paymentDueDay:
        data.paymentDueDay === "" || data.paymentDueDay === undefined
          ? ""
          : Number(data.paymentDueDay),
      rentAdjustmentRule:
        data.rentAdjustmentRule === undefined
          ? undefined
          : data.rentAdjustmentRule
    })
  );
}

function activateOnboardingLeaseFromUi(payload) {
  var data = payload || {};
  return serializeUiValue_(activateLease(data.leaseId));
}

function validateOnboardingForAutomationFromUi() {
  return serializeUiValue_(validateOnboardingForAutomation());
}
