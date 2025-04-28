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

    // Calculate the tax scenario with 100% Traditional 401k contribution (max tax savings in current year)
    const maxTrad401kContribution = Math.min(grossIncome, max401k);
    const maxTradTaxableIncome = totalIncome - maxTrad401kContribution - hsaContribution;
    const maxTradTax = calculateFederalTax(maxTradTaxableIncome, filingStatus);

    // Calculate the difference in taxes
    const taxDifference = maxTradTax - federalTax;

    // Calculate effective tax rate for user scenario
    const effectiveTaxRate = (federalTax / totalIncome) * 100;
    const effectiveTaxRateMaxTrad = (maxTradTax / totalIncome) * 100;

    // Display results
    document.getElementById("results").innerHTML = `
        <p>Total Income (including RSU): $${totalIncome.toFixed(2)}</p>
        <p>Traditional 401k Contribution: $${trad401kContribution.toFixed(2)}</p>
        <p>Roth 401k Contribution: $${roth401kContribution.toFixed(2)}</p>
        <p>HSA Contribution: $${hsaContribution.toFixed(2)}</p>
        <p>Taxable Income after deductions: $${taxableIncome.toFixed(2)}</p>
        <p>Federal Tax (User's Choice): $${federalTax.toFixed(2)}</p>
        <p>Effective Tax Rate (User's Choice): ${effectiveTaxRate.toFixed(2)}%</p>

        <h3>Tax Savings Scenario (100% Traditional 401k Contribution)</h3>
        <p>Maximum Traditional 401k Contribution (100%): $${maxTrad401kContribution.toFixed(2)}</p>
        <p>Taxable Income after Max 401k and HSA Deduction: $${maxTradTaxableIncome.toFixed(2)}</p>
        <p>Federal Tax (100% Traditional 401k): $${maxTradTax.toFixed(2)}</p>
        <p>Effective Tax Rate (100% Traditional 401k): ${effectiveTaxRateMaxTrad.toFixed(2)}%</p>
        <p>Tax Difference (Max Traditional vs User Choice): $${taxDifference.toFixed(2)}</p>
    `;
}

// Function to calculate adjusted 401k contribution limits based on age
function calculateAdjustedLimits(age) {
    const max401k = (age >= 50) ? 27000 : 23000; // 2025 max 401k limit
    return { max401k };
}

// Function to calculate HSA contribution limits based on age and filing status
function calculateAdjustedHSA(age, filingStatus) {
    let maxHSA = 0;
    if (filingStatus === 'single') {
        maxHSA = (age >= 55) ? 4350 : 3750; // 2025 limits for single
    } else if (filingStatus === 'married') {
        maxHSA = (age >= 55) ? 8750 : 7500; // 2025 limits for married filing jointly
    }
    return maxHSA;
}

// Function to calculate federal tax based on filing status
function calculateFederalTax(taxableIncome, filingStatus) {
    const brackets = getTaxBrackets(filingStatus);
    let tax = 0;

    // Apply each bracket's tax rates
    for (let i = 0; i < brackets.length; i++) {
        const [low, high, rate] = brackets[i];
        if (taxableIncome > low) {
            const taxableAtBracket = Math.min(taxableIncome, high) - low;
            tax += taxableAtBracket * rate;
        } else {
            break;
        }
    }

    return tax;
}

// Tax brackets for different filing statuses
function getTaxBrackets(filingStatus) {
    if (filingStatus === 'single') {
        return [
            [0, 11000, 0.10], [11001, 44725, 0.12], [44726, 95375, 0.22],
            [95376, 182100, 0.24], [182101, 231250, 0.32], [231251, 578100, 0.35],
            [578101, Infinity, 0.37]
        ];
    } else if (filingStatus === 'married') {
        return [
            [0, 22000, 0.10], [22001, 89450, 0.12], [89451, 190750, 0.22],
            [190751, 364200, 0.24], [364201, 462500, 0.32], [462501, 693750, 0.35],
            [693751, Infinity, 0.37]
        ];
    }
    return []; // Default case
}
