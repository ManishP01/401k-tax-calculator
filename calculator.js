// Tax brackets for 2025 for Married Filing Jointly (adjust as needed for the current year)
const TAX_BRACKETS_MARRIED = [
    { rate: 0.10, cap: 22000 },
    { rate: 0.12, cap: 89400 },
    { rate: 0.22, cap: 190750 },
    { rate: 0.24, cap: 364200 },
    { rate: 0.32, cap: 462500 },
    { rate: 0.35, cap: 693750 },
    { rate: 0.37, cap: Infinity }
];

// Tax brackets for 2025 for Single (adjust as needed for the current year)
const TAX_BRACKETS_SINGLE = [
    { rate: 0.10, cap: 11000 },
    { rate: 0.12, cap: 44725 },
    { rate: 0.22, cap: 95375 },
    { rate: 0.24, cap: 182100 },
    { rate: 0.32, cap: 231250 },
    { rate: 0.35, cap: 578100 },
    { rate: 0.37, cap: Infinity }
];

// Function to calculate federal tax based on tax brackets
function calculateFederalTax(income, filingStatus) {
    const taxBrackets = filingStatus === "married" ? TAX_BRACKETS_MARRIED : TAX_BRACKETS_SINGLE;
    let tax = 0;
    let remainingIncome = income;

    for (let i = 0; i < taxBrackets.length; i++) {
        const { rate, cap } = taxBrackets[i];
        if (remainingIncome > cap) {
            const taxableAtThisRate = cap - (i === 0 ? 0 : taxBrackets[i - 1].cap);
            tax += taxableAtThisRate * rate;
            remainingIncome -= taxableAtThisRate;
        } else {
            tax += remainingIncome * rate;
            break;
        }
    }

    return tax;
}

// Function to calculate adjusted HSA limits based on age and filing status
function calculateAdjustedHSA(age, filingStatus) {
    let maxHSA = (filingStatus === "married") ? MAX_HSA_MARRIED : MAX_HSA_SINGLE;

    if (age >= 55) {
        maxHSA += MAX_HSA_CATCHUP; // Catch-up for HSA if 55+
    }

    return maxHSA;
}

// Function to calculate taxes and handle RSU income, 401k contributions, and HSA
function calculateTaxes() {
    // Get input values
    const grossIncome = parseFloat(document.getElementById("grossIncome").value);
    const rsuIncome = parseFloat(document.getElementById("rsuIncome").value);
    const age = parseInt(document.getElementById("age").value);
    const filingStatus = document.getElementById("filingStatus").value;
    const trad401kPct = parseFloat(document.getElementById("trad401kPct").value) / 100;
    const roth401kPct = parseFloat(document.getElementById("roth401kPct").value) / 100;
    const hsaContribution = parseFloat(document.getElementById("hsaContribution").value);

    // Calculate adjusted 401k and HSA contribution limits based on age and filing status
    const { max401k } = calculateAdjustedLimits(age);
    const maxHSA = calculateAdjustedHSA(age, filingStatus);

    // Check if user input for 401k or HSA exceeds limits
    if (trad401kPct * grossIncome > max401k) {
        alert(`Traditional 401k contribution exceeds the max limit of $${max401k}.`);
        return;
    }

    if (hsaContribution > maxHSA) {
        alert(`HSA contribution exceeds the max limit of $${maxHSA}.`);
        return;
    }

    // Calculate total income, accounting for RSU
    const totalIncome = grossIncome + rsuIncome;

    // Calculate 401k contributions
    const trad401kContribution = trad401kPct * grossIncome;
    const roth401kContribution = roth401kPct * grossIncome;

    // Calculate taxable income after 401k deductions and HSA contribution
    const taxableIncome = totalIncome - trad401kContribution - hsaContribution;

    // Calculate federal tax dynamically using the correct brackets
    const federalTax = calculateFederalTax(taxableIncome, filingStatus);

    // Calculate effective tax rate
    const effectiveTaxRate = (federalTax / totalIncome) * 100;

    // Display results
    document.getElementById("results").innerHTML = `
        <p>Total Income (including RSU): $${totalIncome.toFixed(2)}</p>
        <p>Traditional 401k Contribution: $${trad401kContribution.toFixed(2)}</p>
        <p>Roth 401k Contribution: $${roth401kContribution.toFixed(2)}</p>
        <p>HSA Contribution: $${hsaContribution.toFixed(2)}</p>
        <p>Taxable Income after deductions: $${taxableIncome.toFixed(2)}</p>
        <p>Federal Tax: $${federalTax.toFixed(2)}</p>
        <p>Effective Tax Rate: ${effectiveTaxRate.toFixed(2)}%</p>
    `;
}
