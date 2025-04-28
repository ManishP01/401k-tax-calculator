// calculator.js

// Constants
const MAX_401K_CONTRIBUTION_UNDER_50 = 23000;
const MAX_401K_CONTRIBUTION_50_PLUS = 30000; // catch-up contributions allowed
const MAX_HSA_CONTRIBUTION_SELF = 4150;
const MAX_HSA_CONTRIBUTION_FAMILY = 8300;

// 2024 Federal tax brackets for Married Filing Jointly
const FEDERAL_TAX_BRACKETS = [
  { rate: 0.10, cap: 23200 },
  { rate: 0.12, cap: 94300 },
  { rate: 0.22, cap: 201050 },
  { rate: 0.24, cap: 383900 },
  { rate: 0.32, cap: 487450 },
  { rate: 0.35, cap: 731200 },
  { rate: 0.37, cap: Infinity },
];

// 2024 CT state income tax brackets (simplified)
const CT_TAX_BRACKETS = [
  { rate: 0.03, cap: 20000 },
  { rate: 0.05, cap: 100000 },
  { rate: 0.055, cap: 200000 },
  { rate: 0.06, cap: 250000 },
  { rate: 0.065, cap: 500000 },
  { rate: 0.069, cap: Infinity },
];

function calculateTaxes() {
  const grossIncome = parseFloat(document.getElementById("grossIncome").value) || 0;
  const rsuIncome = parseFloat(document.getElementById("rsuIncome").value) || 0;
  const trad401kPct = parseFloat(document.getElementById("trad401kPct").value) || 0;
  const roth401kPct = parseFloat(document.getElementById("roth401kPct").value) || 0;
  const hsaContribution = parseFloat(document.getElementById("hsaContribution").value) || 0;

  const totalIncome = grossIncome + rsuIncome;

  const isOver50 = false; // Add an input if needed later
  const max401k = isOver50 ? MAX_401K_CONTRIBUTION_50_PLUS : MAX_401K_CONTRIBUTION_UNDER_50;

  let trad401kContribution = (trad401kPct / 100) * grossIncome;
  let roth401kContribution = (roth401kPct / 100) * grossIncome;

  const total401kContribution = trad401kContribution + roth401kContribution;

  // Enforce 401k limits
  if (total401kContribution > max401k) {
    const scalingFactor = max401k / total401kContribution;
    trad401kContribution *= scalingFactor;
    roth401kContribution *= scalingFactor;
  }

  // Calculate taxable income
  const taxableIncome = totalIncome - trad401kContribution - hsaContribution;

  const federalTaxes = calculateFederalTax(taxableIncome);
  const ctTaxes = calculateStateTax(taxableIncome);

  const totalTax = federalTaxes + ctTaxes;

  const effectiveTaxRate = (totalTax / totalIncome) * 100;

  const results = `
    <p><strong>Total Income (Salary + RSUs):</strong> $${totalIncome.toFixed(2)}</p>
    <p><strong>Traditional 401k Contribution:</strong> $${trad401kContribution.toFixed(2)}</p>
    <p><strong>Roth 401k Contribution:</strong> $${roth401kContribution.toFixed(2)}</p>
    <p><strong>HSA Contribution:</strong> $${hsaContribution.toFixed(2)}</p>
    <p><strong>Taxable Income After Contributions:</strong> $${taxableIncome.toFixed(2)}</p>
    <p><strong>Federal Taxes:</strong> $${federalTaxes.toFixed(2)}</p>
    <p><strong>CT State Taxes:</strong> $${ctTaxes.toFixed(2)}</p>
    <p><strong>Total Taxes:</strong> $${totalTax.toFixed(2)}</p>
    <p><strong>Effective Tax Rate:</strong> ${effectiveTaxRate.toFixed(2)}%</p>
  `;

  document.getElementById("results").innerHTML = results;
}

function calculateFederalTax(income) {
  let tax = 0;
  let lastCap = 0;

  for (const bracket of FEDERAL_TAX_BRACKETS) {
    if (income > bracket.cap) {
      tax += (bracket.cap - lastCap) * bracket.rate;
      lastCap = bracket.cap;
    } else {
      tax += (income - lastCap) * bracket.rate;
      break;
    }
  }

  return tax;
}

function calculateStateTax(income) {
  let tax = 0;
  let lastCap = 0;

  for (const bracket of CT_TAX_BRACKETS) {
    if (income > bracket.cap) {
      tax += (bracket.cap - lastCap) * bracket.rate;
      lastCap = bracket.cap;
    } else {
      tax += (income - lastCap) * bracket.rate;
      break;
    }
  }

  return tax;
}
