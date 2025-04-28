document.getElementById('taxForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const salary = parseFloat(document.getElementById('salary').value);
  const traditionalPercent = parseFloat(document.getElementById('traditionalPercent').value);
  const rothPercent = parseFloat(document.getElementById('rothPercent').value);
  const retirementIncome = parseFloat(document.getElementById('retirementIncome').value) || 75000; // Default retirement income

  // Validate percentages
  if (traditionalPercent + rothPercent !== 100) {
    alert('Traditional % and Roth % must add up to 100%!');
    return;
  }

  const traditionalContribution = salary * (traditionalPercent / 100);
  const rothContribution = salary * (rothPercent / 100);

  // Taxable income now (Traditional 401k lowers it)
  const taxableIncomeNow = salary - traditionalContribution;

  // Federal Tax calculation (2024 brackets for Married Filing Jointly)
  const federalTax = calculateFederalTax(taxableIncomeNow);

  // Connecticut State Tax calculation (2024 rough estimate)
  const stateTax = calculateCTTax(taxableIncomeNow);

  const totalTax = federalTax + stateTax;

  const effectiveTaxRate = (totalTax / salary) * 100; // Based on full salary
  const marginalFederalRate = getFederalMarginalRate(taxableIncomeNow);

  // Output results
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <h2>Results</h2>
    <p><strong>Taxable Income (after Traditional 401k):</strong> $${taxableIncomeNow.toFixed(2)}</p>
    <p><strong>Estimated Federal Tax:</strong> $${federalTax.toFixed(2)}</p>
    <p><strong>Estimated CT State Tax:</strong> $${stateTax.toFixed(2)}</p>
    <p><strong>Total Estimated Tax:</strong> $${totalTax.toFixed(2)}</p>
    <p><strong>Effective Tax Rate:</strong> ${effectiveTaxRate.toFixed(2)}%</p>
    <p><strong>Marginal Federal Tax Rate:</strong> ${marginalFederalRate}%</p>
  `;
});

// --- Helper Functions ---

function calculateFederalTax(income) {
  let tax = 0;
  const brackets = [
    { limit: 24000, rate: 0.10 },
    { limit: 89450, rate: 0.12 },
    { limit: 190750, rate: 0.22 },
    { limit: 364200, rate: 0.24 },
    { limit: 462500, rate: 0.32 },
    { limit: 693750, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ];

  let previousLimit = 0;
  for (let i = 0; i < brackets.length; i++) {
    if (income > brackets[i].limit) {
      tax += (brackets[i].limit - previousLimit) * brackets[i].rate;
      previousLimit = brackets[i].limit;
    } else {
      tax += (income - previousLimit) * brackets[i].rate;
      break;
    }
  }
  return tax;
}

function getFederalMarginalRate(income) {
  if (income <= 24000) return 10;
  if (income <= 89450) return 12;
  if (income <= 190750) return 22;
  if (income <= 364200) return 24;
  if (income <= 462500) return 32;
  if (income <= 693750) return 35;
  return 37;
}

function calculateCTTax(income) {
  let tax = 0;
  const brackets = [
    { limit: 20000, rate: 0.03 },
    { limit: 100000, rate: 0.05 },
    { limit: 200000, rate: 0.055 },
    { limit: 250000, rate: 0.06 },
    { limit: 500000, rate: 0.065 },
    { limit: 1000000, rate: 0.069 },
    { limit: Infinity, rate: 0.0699 }
  ];

  let previousLimit = 0;
  for (let i = 0; i < brackets.length; i++) {
    if (income > brackets[i].limit) {
      tax += (brackets[i].limit - previousLimit) * brackets[i].rate;
      previousLimit = brackets[i].limit;
    } else {
      tax += (income - previousLimit) * brackets[i].rate;
      break;
    }
  }
  return tax;
}
