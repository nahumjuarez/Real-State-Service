function buildDemoData_() {
  var createdAt = new Date("2026-09-01T10:00:00");
  var updatedAt = new Date("2026-09-26T10:00:00");

  return {
    Parties: [
      {
        party_id: "PARTY-DEMO-OWNER",
        party_type: "PERSON",
        legal_name: "Propietario Demo",
        preferred_name: "Propietario Demo",
        email: "owner.demo@example.com",
        phone: "5550000000",
        status: "ACTIVE",
        created_at: createdAt,
        updated_at: updatedAt
      },
      {
        party_id: "PARTY-DEMO-T01",
        party_type: "PERSON",
        legal_name: "Ana Demo",
        preferred_name: "Ana",
        email: "ana.demo@example.com",
        phone: "5550000001",
        status: "ACTIVE",
        created_at: createdAt,
        updated_at: updatedAt
      },
      {
        party_id: "PARTY-DEMO-T02",
        party_type: "PERSON",
        legal_name: "Luis Demo",
        preferred_name: "Luis",
        email: "luis.demo@example.com",
        phone: "5550000002",
        status: "ACTIVE",
        created_at: createdAt,
        updated_at: updatedAt
      },
      {
        party_id: "PARTY-DEMO-T03",
        party_type: "PERSON",
        legal_name: "Sofía Demo",
        preferred_name: "Sofía",
        email: "sofia.demo@example.com",
        phone: "5550000003",
        status: "ACTIVE",
        created_at: createdAt,
        updated_at: updatedAt
      },
      {
        party_id: "PARTY-DEMO-V01",
        party_type: "ORGANIZATION",
        legal_name: "Mantenimiento Demo MX",
        preferred_name: "Mantenimiento Demo",
        email: "mantenimiento.demo@example.com",
        phone: "5550000099",
        status: "ACTIVE",
        created_at: createdAt,
        updated_at: updatedAt
      }
    ],

    FiscalProfiles: [
      {
        fiscal_profile_id: "FISCAL-DEMO-OWNER",
        party_id: "PARTY-DEMO-OWNER",
        rfc: "XAXX010101000",
        legal_name: "Propietario Demo",
        tax_regime: "DEMO",
        fiscal_zip_code: "00000",
        default_cfdi_use: "DEMO",
        status: "ACTIVE",
        updated_at: updatedAt
      }
    ],

    Properties: [
      {
        property_id: "PROP-DEMO-001",
        property_name: "Departamento Demo Centro",
        property_type: "APARTMENT",
        street: "Calle Demo 101",
        neighborhood: "Colonia Demo Centro",
        municipality: "Cuauhtémoc",
        state: "Ciudad de México",
        postal_code: "00001",
        country: "MX",
        latitude: "",
        longitude: "",
        acquisition_date: new Date("2022-01-15T12:00:00"),
        acquisition_price: 3100000,
        predial_account: "PREDIAL-DEMO-001",
        status: "ACTIVE",
        created_at: createdAt,
        updated_at: updatedAt
      },
      {
        property_id: "PROP-DEMO-002",
        property_name: "Departamento Demo Parque",
        property_type: "APARTMENT",
        street: "Avenida Demo 202",
        neighborhood: "Colonia Demo Parque",
        municipality: "Benito Juárez",
        state: "Ciudad de México",
        postal_code: "00002",
        country: "MX",
        latitude: "",
        longitude: "",
        acquisition_date: new Date("2023-06-10T12:00:00"),
        acquisition_price: 4200000,
        predial_account: "PREDIAL-DEMO-002",
        status: "ACTIVE",
        created_at: createdAt,
        updated_at: updatedAt
      },
      {
        property_id: "PROP-DEMO-003",
        property_name: "Departamento Demo Sur",
        property_type: "APARTMENT",
        street: "Calle Demo Sur 303",
        neighborhood: "Colonia Demo Sur",
        municipality: "Coyoacán",
        state: "Ciudad de México",
        postal_code: "00003",
        country: "MX",
        latitude: "",
        longitude: "",
        acquisition_date: new Date("2024-03-20T12:00:00"),
        acquisition_price: 2850000,
        predial_account: "PREDIAL-DEMO-003",
        status: "ACTIVE",
        created_at: createdAt,
        updated_at: updatedAt
      }
    ],

    Units: [
      {
        unit_id: "UNIT-DEMO-001",
        property_id: "PROP-DEMO-001",
        unit_name: "Unidad Demo Centro",
        unit_type: "APARTMENT",
        floor: "4",
        bedrooms: 2,
        bathrooms: 1,
        parking_spaces: 1,
        area_m2: 72,
        rentable_area_m2: 72,
        status: "OCCUPIED",
        created_at: createdAt,
        updated_at: updatedAt
      },
      {
        unit_id: "UNIT-DEMO-002",
        property_id: "PROP-DEMO-002",
        unit_name: "Unidad Demo Parque",
        unit_type: "APARTMENT",
        floor: "7",
        bedrooms: 2,
        bathrooms: 2,
        parking_spaces: 1,
        area_m2: 88,
        rentable_area_m2: 88,
        status: "OCCUPIED",
        created_at: createdAt,
        updated_at: updatedAt
      },
      {
        unit_id: "UNIT-DEMO-003",
        property_id: "PROP-DEMO-003",
        unit_name: "Unidad Demo Sur",
        unit_type: "APARTMENT",
        floor: "2",
        bedrooms: 1,
        bathrooms: 1,
        parking_spaces: 1,
        area_m2: 60,
        rentable_area_m2: 60,
        status: "OCCUPIED",
        created_at: createdAt,
        updated_at: updatedAt
      }
    ],

    Ownership: [
      {
        ownership_id: "OWN-DEMO-001",
        party_id: "PARTY-DEMO-OWNER",
        property_id: "PROP-DEMO-001",
        ownership_percentage: 1,
        start_date: new Date("2022-01-15T12:00:00"),
        end_date: ""
      },
      {
        ownership_id: "OWN-DEMO-002",
        party_id: "PARTY-DEMO-OWNER",
        property_id: "PROP-DEMO-002",
        ownership_percentage: 1,
        start_date: new Date("2023-06-10T12:00:00"),
        end_date: ""
      },
      {
        ownership_id: "OWN-DEMO-003",
        party_id: "PARTY-DEMO-OWNER",
        property_id: "PROP-DEMO-003",
        ownership_percentage: 1,
        start_date: new Date("2024-03-20T12:00:00"),
        end_date: ""
      }
    ],

    Leases: [
      {
        lease_id: "LEASE-DEMO-001",
        unit_id: "UNIT-DEMO-001",
        start_date: new Date("2026-01-01T12:00:00"),
        end_date: new Date("2026-12-31T12:00:00"),
        base_rent: 18000,
        deposit_required: 18000,
        payment_due_day: 5,
        payment_frequency: "MONTHLY",
        rent_adjustment_rule: "Revisión anual demo",
        status: "ACTIVE",
        contract_document_id: "",
        created_at: createdAt,
        updated_at: updatedAt
      },
      {
        lease_id: "LEASE-DEMO-002",
        unit_id: "UNIT-DEMO-002",
        start_date: new Date("2026-02-01T12:00:00"),
        end_date: new Date("2027-01-31T12:00:00"),
        base_rent: 22000,
        deposit_required: 22000,
        payment_due_day: 5,
        payment_frequency: "MONTHLY",
        rent_adjustment_rule: "Revisión anual demo",
        status: "ACTIVE",
        contract_document_id: "",
        created_at: createdAt,
        updated_at: updatedAt
      },
      {
        lease_id: "LEASE-DEMO-003",
        unit_id: "UNIT-DEMO-003",
        start_date: new Date("2026-04-01T12:00:00"),
        end_date: new Date("2027-03-31T12:00:00"),
        base_rent: 16500,
        deposit_required: 16500,
        payment_due_day: 5,
        payment_frequency: "MONTHLY",
        rent_adjustment_rule: "Revisión anual demo",
        status: "ACTIVE",
        contract_document_id: "",
        created_at: createdAt,
        updated_at: updatedAt
      }
    ],

    LeaseParties: [
      {
        lease_party_id: "LP-DEMO-001",
        lease_id: "LEASE-DEMO-001",
        party_id: "PARTY-DEMO-T01",
        role: "TENANT"
      },
      {
        lease_party_id: "LP-DEMO-002",
        lease_id: "LEASE-DEMO-002",
        party_id: "PARTY-DEMO-T02",
        role: "TENANT"
      },
      {
        lease_party_id: "LP-DEMO-003",
        lease_id: "LEASE-DEMO-003",
        party_id: "PARTY-DEMO-T03",
        role: "TENANT"
      }
    ],

    RentCharges: [
      {
        charge_id: "CHARGE-202609-DEMO-001",
        lease_id: "LEASE-DEMO-001",
        charge_type: "RENT",
        period: "2026-09",
        due_date: new Date("2026-09-05T12:00:00"),
        original_amount: 18000,
        adjustments: 0,
        current_amount: 18000,
        status: "PAID",
        created_at: new Date("2026-09-01T12:00:00")
      },
      {
        charge_id: "CHARGE-202609-DEMO-002",
        lease_id: "LEASE-DEMO-002",
        charge_type: "RENT",
        period: "2026-09",
        due_date: new Date("2026-09-05T12:00:00"),
        original_amount: 22000,
        adjustments: 0,
        current_amount: 22000,
        status: "PAID",
        created_at: new Date("2026-09-01T12:00:00")
      },
      {
        charge_id: "CHARGE-202609-DEMO-003",
        lease_id: "LEASE-DEMO-003",
        charge_type: "RENT",
        period: "2026-09",
        due_date: new Date("2026-09-05T12:00:00"),
        original_amount: 16500,
        adjustments: 0,
        current_amount: 16500,
        status: "PARTIAL",
        created_at: new Date("2026-09-01T12:00:00")
      }
    ],

    Payments: [
      {
        payment_id: "PAY-202609-DEMO-001",
        party_id: "PARTY-DEMO-T01",
        date_received: new Date("2026-09-03T12:00:00"),
        amount: 18000,
        payment_method: "TRANSFER",
        reference: "DEMO-PAGO-001",
        bank_account_reference: "",
        notes: "Pago demo completo.",
        status: "RECEIVED",
        created_at: new Date("2026-09-03T12:00:00")
      },
      {
        payment_id: "PAY-202609-DEMO-002",
        party_id: "PARTY-DEMO-T02",
        date_received: new Date("2026-09-04T12:00:00"),
        amount: 22000,
        payment_method: "TRANSFER",
        reference: "DEMO-PAGO-002",
        bank_account_reference: "",
        notes: "Pago demo completo.",
        status: "RECEIVED",
        created_at: new Date("2026-09-04T12:00:00")
      },
      {
        payment_id: "PAY-202609-DEMO-003",
        party_id: "PARTY-DEMO-T03",
        date_received: new Date("2026-09-06T12:00:00"),
        amount: 10000,
        payment_method: "TRANSFER",
        reference: "DEMO-PAGO-003",
        bank_account_reference: "",
        notes: "Pago demo parcial.",
        status: "RECEIVED",
        created_at: new Date("2026-09-06T12:00:00")
      }
    ],

    PaymentAllocations: [
      {
        allocation_id: "ALLOC-DEMO-001",
        payment_id: "PAY-202609-DEMO-001",
        charge_id: "CHARGE-202609-DEMO-001",
        allocated_amount: 18000,
        created_at: new Date("2026-09-03T12:00:00")
      },
      {
        allocation_id: "ALLOC-DEMO-002",
        payment_id: "PAY-202609-DEMO-002",
        charge_id: "CHARGE-202609-DEMO-002",
        allocated_amount: 22000,
        created_at: new Date("2026-09-04T12:00:00")
      },
      {
        allocation_id: "ALLOC-DEMO-003",
        payment_id: "PAY-202609-DEMO-003",
        charge_id: "CHARGE-202609-DEMO-003",
        allocated_amount: 10000,
        created_at: new Date("2026-09-06T12:00:00")
      }
    ],

    SecurityDeposits: [
      {
        deposit_id: "DEP-DEMO-001",
        lease_id: "LEASE-DEMO-001",
        amount_received: 18000,
        date_received: new Date("2026-01-01T12:00:00"),
        amount_held: 18000,
        amount_returned: 0,
        deductions: 0,
        return_date: "",
        status: "HELD"
      },
      {
        deposit_id: "DEP-DEMO-002",
        lease_id: "LEASE-DEMO-002",
        amount_received: 22000,
        date_received: new Date("2026-02-01T12:00:00"),
        amount_held: 22000,
        amount_returned: 0,
        deductions: 0,
        return_date: "",
        status: "HELD"
      },
      {
        deposit_id: "DEP-DEMO-003",
        lease_id: "LEASE-DEMO-003",
        amount_received: 16500,
        date_received: new Date("2026-04-01T12:00:00"),
        amount_held: 16500,
        amount_returned: 0,
        deductions: 0,
        return_date: "",
        status: "HELD"
      }
    ],

    Expenses: [
      {
        expense_id: "EXP-DEMO-001",
        property_id: "PROP-DEMO-001",
        unit_id: "UNIT-DEMO-001",
        vendor_party_id: "",
        expense_category: "HOA",
        description: "Cuota de mantenimiento demo septiembre.",
        date: new Date("2026-09-02T12:00:00"),
        amount: 2300,
        tax_amount: 0,
        payment_method: "TRANSFER",
        document_id: "",
        status: "PAID",
        created_at: new Date("2026-09-02T12:00:00")
      },
      {
        expense_id: "EXP-DEMO-002",
        property_id: "PROP-DEMO-002",
        unit_id: "UNIT-DEMO-002",
        vendor_party_id: "",
        expense_category: "HOA",
        description: "Cuota de mantenimiento demo septiembre.",
        date: new Date("2026-09-02T12:00:00"),
        amount: 3100,
        tax_amount: 0,
        payment_method: "TRANSFER",
        document_id: "",
        status: "PAID",
        created_at: new Date("2026-09-02T12:00:00")
      }
    ],

    WorkOrders: [
      {
        work_order_id: "WO-DEMO-001",
        property_id: "PROP-DEMO-003",
        unit_id: "UNIT-DEMO-003",
        reported_by: "PARTY-DEMO-T03",
        reported_at: new Date("2026-09-10T09:00:00"),
        category: "PLUMBING",
        description: "Revisión demo de una fuga menor.",
        priority: "NORMAL",
        vendor_party_id: "PARTY-DEMO-V01",
        estimated_cost: 1200,
        actual_cost: 950,
        status: "COMPLETED",
        completed_at: new Date("2026-09-11T16:00:00")
      }
    ],

    Invoices: [
      {
        invoice_id: "INV-DEMO-001",
        issuer_party_id: "PARTY-DEMO-OWNER",
        receiver_party_id: "PARTY-DEMO-T01",
        related_property_id: "PROP-DEMO-001",
        related_unit_id: "UNIT-DEMO-001",
        issue_date: "",
        subtotal: 18000,
        taxes: 0,
        withholdings: 0,
        total: 18000,
        currency: "MXN",
        status: "DRAFT",
        pac_provider: "",
        uuid: "",
        xml_document_id: "",
        pdf_document_id: "",
        created_at: new Date("2026-09-03T12:00:00")
      }
    ],

    InvoiceLines: [
      {
        invoice_line_id: "INVLINE-DEMO-001",
        invoice_id: "INV-DEMO-001",
        concept: "Renta demo septiembre 2026",
        sat_product_code: "80131500",
        unit_code: "E48",
        quantity: 1,
        unit_price: 18000,
        amount: 18000,
        tax_object: "DEMO"
      }
    ],

    Loans: [
      {
        loan_id: "LOAN-DEMO-001",
        property_id: "PROP-DEMO-002",
        lender: "Banco Demo",
        original_principal: 2500000,
        current_balance: 2190000,
        interest_rate: 0.105,
        interest_type: "FIXED",
        origination_date: new Date("2023-06-10T12:00:00"),
        maturity_date: new Date("2043-06-10T12:00:00"),
        payment_frequency: "MONTHLY",
        monthly_payment: 24800,
        status: "ACTIVE"
      }
    ],

    Valuations: [
      {
        valuation_id: "VAL-DEMO-001",
        property_id: "PROP-DEMO-001",
        valuation_date: new Date("2026-09-01T12:00:00"),
        valuation_method: "OWNER_ESTIMATE",
        estimated_value: 3700000,
        source: "Demo",
        confidence: 0.5,
        notes: "Dato sintético."
      },
      {
        valuation_id: "VAL-DEMO-002",
        property_id: "PROP-DEMO-002",
        valuation_date: new Date("2026-09-01T12:00:00"),
        valuation_method: "OWNER_ESTIMATE",
        estimated_value: 4800000,
        source: "Demo",
        confidence: 0.5,
        notes: "Dato sintético."
      },
      {
        valuation_id: "VAL-DEMO-003",
        property_id: "PROP-DEMO-003",
        valuation_date: new Date("2026-09-01T12:00:00"),
        valuation_method: "OWNER_ESTIMATE",
        estimated_value: 3200000,
        source: "Demo",
        confidence: 0.5,
        notes: "Dato sintético."
      }
    ],

    Budgets: [
      {
        budget_id: "BUD-DEMO-001",
        property_id: "PROP-DEMO-001",
        period: "2026-09",
        budget_type: "OPERATING_EXPENSE",
        category: "HOA",
        amount: 2300,
        notes: "Presupuesto demo."
      }
    ],

    Deals: [
      {
        deal_id: "DEAL-DEMO-001",
        deal_name: "Departamento candidato Demo",
        city: "Ciudad de México",
        neighborhood: "Colonia Candidato Demo",
        property_type: "APARTMENT",
        asking_price: 3500000,
        source: "DEMO",
        listing_url: "https://example.com/demo-property",
        status: "UNDERWRITING",
        date_added: new Date("2026-09-20T12:00:00"),
        decision: "",
        decision_reason: ""
      }
    ],

    Scenarios: [
      {
        scenario_id: "SCEN-DEMO-BASE",
        deal_id: "DEAL-DEMO-001",
        scenario_type: "BASE",
        name: "Base",
        description: "Escenario base sintético.",
        created_at: updatedAt
      },
      {
        scenario_id: "SCEN-DEMO-BEAR",
        deal_id: "DEAL-DEMO-001",
        scenario_type: "BEAR",
        name: "Bear",
        description: "Escenario conservador sintético.",
        created_at: updatedAt
      },
      {
        scenario_id: "SCEN-DEMO-BULL",
        deal_id: "DEAL-DEMO-001",
        scenario_type: "BULL",
        name: "Bull",
        description: "Escenario optimista sintético.",
        created_at: updatedAt
      }
    ],

    DealAssumptions: [
      {
        assumption_id: "ASSUMP-DEMO-001",
        deal_id: "DEAL-DEMO-001",
        scenario_id: "SCEN-DEMO-BASE",
        metric: "market_rent",
        value: 19000,
        unit: "MXN_MONTH",
        source_type: "ASSUMPTION",
        source_reference: "Demo"
      },
      {
        assumption_id: "ASSUMP-DEMO-002",
        deal_id: "DEAL-DEMO-001",
        scenario_id: "SCEN-DEMO-BASE",
        metric: "vacancy_rate",
        value: 0.05,
        unit: "PERCENT",
        source_type: "ASSUMPTION",
        source_reference: "Demo"
      }
    ]
  };
}
