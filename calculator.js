function calculateTaxes() {
    console.log("Calculating taxes..."); // This will log when the button is clicked
    
    // Get input values
    const grossIncome = parseFloat(document.getElementById("grossIncome").value);
    const rsuIncome = parseFloat(document.getElementById("rsuIncome").value);
    const age = parseInt(document.getElementById("age").value);
    const filingStatus = document.getElementById("filingStatus").value;
    const trad401kPct = parseFloat(document.getElementById("trad401kPct").value) / 100;
    const roth401kPct = parseFloat(document.getElementById("roth401kPct").value) / 100;
    const hsaContribution = parseFloat(document.getElementById("hsaContribution").value);

    // Validate inputs
    if (isNaN(grossIncome) || grossIncome <= 0) {
        alert("Please enter a valid Gross Income.");
        return;
    }
    if (isNaN(rsuIncome) || rsuIncome < 0) {
        alert("Please enter a valid RSU income.");
        return;
    }
    if (isNaN(trad401kPct) || trad401kPct < 0 || trad401kPct > 1) {
        alert("Please enter a valid Traditional 401k percentage.");
        return;
    }
    if (isNaN(roth401kPct) || roth401kPct < 0 || roth401kPct > 1) {
        alert("Please enter a valid Roth 401k percentage.");
        return;
    }
    if (isNaN(hsaContribution) || hsaContribution < 0) {
        alert("Please enter a valid HSA contribution.");
        return;
    }

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
    
    // Check for valid federal tax calculation
    if (isNaN(federalTax) || federalTax < 0) {
        alert("There was an error calculating federal tax.");
        return;
    }

    // Calculate the tax scenario with 100% Traditional 401k contribution (max tax savings in current year)
    const maxTrad401kContribution = Math.min(grossIncome, max401k);
    const maxTradTaxableIncome = totalIncome - maxTrad401kContribution - hsaContribution;
    const maxTradTax = calculateFederalTax(maxTradTaxableIncome, filingStatus);

    // Check for valid maxTraditionalTax calculation
    if (isNaN(maxTradTax) || maxTradTax < 0) {
        alert("There was an error calculating the max traditional 401k tax.");
        return;
    }

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

// Function to calculate federal tax based on tax brackets
function calculateFederalTax(taxableIncome, filingStatus) {
    let tax = 0;

    // Define the tax brackets for Married Filing Jointly and Single
    const brackets = {
        "Married Filing Jointly": [
            { limit: 22000, rate: 0.10 },
            { limit: 89450, rate: 0.12 },
            { limit: 190750, rate: 0.22 },
            { limit: 364200, rate: 0.24 },
            { limit: 462500, rate: 0.32 },
            { limit: 693750, rate: 0.35 },
            { limit: Infinity, rate: 0.37 }
        ],
        "Single": [
            { limit: 11000, rate: 0.10 },
            { limit: 44725, rate: 0.12 },
            { limit: 95375, rate: 0.22 },
            { limit: 182100, rate: 0.24 },
            { limit: 231250, rate: 0.32 },
            { limit: 578100, rate: 0.35 },
            { limit: Infinity, rate: 0.37 }
        ]
    };

    const selectedBrackets = brackets[filingStatus] || brackets["Married Filing Jointly"];
    let remainingIncome = taxableIncome;

    // Calculate tax based on the taxable income and filing status
    for (let i = 0; i < selectedBrackets.length; i++) {
        const bracket = selectedBrackets[i];
        if (remainingIncome > bracket.limit) {
            const taxableAtThisRate = Math.min(remainingIncome, bracket.limit);
            tax += taxableAtThisRate * bracket.rate;
            remainingIncome -= taxableAtThisRate;
        } else {
            break;
        }
    }

    return tax;
}
