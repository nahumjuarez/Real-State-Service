function registerPaymentNative() {
  var ui = SpreadsheetApp.getUi();
  var state = getOperatorUiState(currentPeriod_());
  var charges = state.outstandingCharges || [];

  if (charges.length === 0) {
    ui.alert(
      REOS_APP.NAME,
      "No hay cargos pendientes para cobrar.",
      ui.ButtonSet.OK
    );
    return null;
  }

  var charge = null;

  if (charges.length === 1) {
    charge = charges[0];
  } else {
    var lines = charges.map(function (item, index) {
      return [
        (index + 1) + ")",
        item.propertyName || "Propiedad",
        "·",
        item.unitName || "Unidad",
        "·",
        item.tenantName || "Sin inquilino",
        "·",
        item.period,
        "· pendiente",
        formatNativeMoney_(item.outstandingAmount, state.app.currency)
      ].join(" ");
    });

    var selection = ui.prompt(
      "Registrar pago",
      "Escribe el número del cargo a cobrar:\n\n" + lines.join("\n"),
      ui.ButtonSet.OK_CANCEL
    );

    if (selection.getSelectedButton() !== ui.Button.OK) return null;

    var selectedIndex = Number(selection.getResponseText()) - 1;
    if (
      !Number.isInteger(selectedIndex) ||
      selectedIndex < 0 ||
      selectedIndex >= charges.length
    ) {
      ui.alert("Selección inválida.");
      return null;
    }

    charge = charges[selectedIndex];
  }

  var fullPaymentChoice = ui.alert(
    "Registrar pago",
    [
      (charge.propertyName || "") + " · " + (charge.unitName || ""),
      charge.tenantName || "",
      "Periodo: " + charge.period,
      "Cargo: " + formatNativeMoney_(charge.currentAmount, state.app.currency),
      "Pagado: " + formatNativeMoney_(charge.allocatedAmount, state.app.currency),
      "Pendiente: " + formatNativeMoney_(charge.outstandingAmount, state.app.currency),
      "",
      "¿Registrar el saldo pendiente completo?"
    ].join("\n"),
    ui.ButtonSet.YES_NO_CANCEL
  );

  if (fullPaymentChoice === ui.Button.CANCEL) return null;

  var amount = Number(charge.outstandingAmount);

  if (fullPaymentChoice === ui.Button.NO) {
    var amountPrompt = ui.prompt(
      "Monto recibido",
      "Saldo pendiente: " +
        formatNativeMoney_(charge.outstandingAmount, state.app.currency) +
        "\n\nEscribe el monto recibido:",
      ui.ButtonSet.OK_CANCEL
    );

    if (amountPrompt.getSelectedButton() !== ui.Button.OK) return null;

    amount = Number(amountPrompt.getResponseText());
    if (!isFinite(amount) || amount <= 0) {
      ui.alert("El monto debe ser un número mayor a cero.");
      return null;
    }
  }

  var methods = REOS_ENUMS.paymentMethod;
  var methodPrompt = ui.prompt(
    "Método de pago",
    methods
      .map(function (method, index) {
        return (index + 1) + ") " + method;
      })
      .join("\n") +
      "\n\nEscribe el número del método:",
    ui.ButtonSet.OK_CANCEL
  );

  if (methodPrompt.getSelectedButton() !== ui.Button.OK) return null;

  var methodIndex = Number(methodPrompt.getResponseText()) - 1;
  if (
    !Number.isInteger(methodIndex) ||
    methodIndex < 0 ||
    methodIndex >= methods.length
  ) {
    ui.alert("Método inválido.");
    return null;
  }

  var referencePrompt = ui.prompt(
    "Referencia",
    "Referencia bancaria / folio. Si no existe, deja el campo vacío y presiona Aceptar:",
    ui.ButtonSet.OK_CANCEL
  );

  if (referencePrompt.getSelectedButton() !== ui.Button.OK) return null;

  var result = registerPayment({
    partyId: charge.tenantId,
    dateReceived: new Date(),
    amount: amount,
    paymentMethod: methods[methodIndex],
    reference: referencePrompt.getResponseText(),
    allocations: [
      {
        chargeId: charge.chargeId,
        amount: amount
      }
    ]
  });

  var balance = getChargeBalance(charge.chargeId);

  ui.alert(
    REOS_APP.NAME,
    [
      "Pago registrado correctamente.",
      "",
      (charge.propertyName || "") + " · " + (charge.unitName || ""),
      charge.tenantName || "",
      "Periodo: " + charge.period,
      "Pago: " + formatNativeMoney_(amount, state.app.currency),
      "Pendiente: " + formatNativeMoney_(balance.outstandingAmount, state.app.currency),
      "Estado: " + balance.status
    ].join("\n"),
    ui.ButtonSet.OK
  );

  return result;
}

function showNativeReceivablesSummary() {
  var ui = SpreadsheetApp.getUi();
  var state = getOperatorUiState(currentPeriod_());
  var summary = state.summary;
  var pending = state.outstandingCharges || [];

  var body = [
    "Periodo visible: " + summary.period,
    "Contratos activos: " + summary.activeLeases,
    "Unidades ocupadas: " + summary.occupiedUnits,
    "Cargado: " + formatNativeMoney_(summary.totalCharged, state.app.currency),
    "Cobrado: " + formatNativeMoney_(summary.totalAllocated, state.app.currency),
    "Pendiente del periodo: " + formatNativeMoney_(summary.outstanding, state.app.currency),
    "",
    "Cargos pendientes totales: " + pending.length
  ];

  pending.slice(0, 15).forEach(function (charge) {
    body.push(
      "• " +
        (charge.propertyName || "") +
        " · " +
        (charge.unitName || "") +
        " · " +
        charge.period +
        " · " +
        formatNativeMoney_(charge.outstandingAmount, state.app.currency)
    );
  });

  if (pending.length > 15) {
    body.push("… y " + (pending.length - 15) + " más.");
  }

  ui.alert(REOS_APP.NAME + " — Cobranza", body.join("\n"), ui.ButtonSet.OK);
  return state;
}

function formatNativeMoney_(value, currency) {
  return String(currency || "MXN") + " " + Number(value || 0).toFixed(2);
}
