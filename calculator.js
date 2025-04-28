function calculateTaxes() {
    console.log("Calculating taxes...");

    // Get input values
    const grossIncome = parseFloat(document.getElementById("grossIncome").value);
    const rsuIncome = parseFloat(document.getElementById("rsuIncome").value);
    const age = parseInt(document.getElementById("age").value);
    const filingStatus = document.getElementById("filingStatus").value; // Get selected filing status
    let trad401kPct = parseFloat(document.getElementById("trad401kPct").value) / 100;
    let roth401kPct = parseFloat(document.getElementById("roth401kPct").value) / 100;
    let hsaContribution = parseFloat(document.getElementById("hsaContribution").value);

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

    // Adjust max 401k limit based on age
    const max401k = age >= 50 ? 30000 : 23000;  // $23,000 if under 50, $30,000 if 50 or older

    // Calculate the total contribution for Traditional 401k
    let trad401kContribution = trad401kPct * grossIncome;

    // Check if the user input exceeds the max limit for Traditional 401k
    if (trad401kContribution > max401k) {
        alert(`Traditional 401k contribution exceeds the max limit of $${max401k}. Using max allowed.`);
        trad401kContribution = max401k;
    }

    // Adjust HSA contribution based on age
    const maxHsa = age >= 55 ? 8300 : 3850; // $8,300 for age 55 and above, $3,850 for under 55

    // Check if the user input exceeds the max limit for HSA
    if (hsaContribution > maxHsa) {
        alert(`HSA contribution exceeds the max limit of $${maxHsa}. Using max allowed.`);
        hsaContribution = maxHsa;
    }

    // Calculate total income, accounting for RSU
    const totalIncome = grossIncome + rsuIncome;

    // Calculate Roth 401k contribution
    const roth401kContribution = roth401kPct * grossIncome;

    // Calculate taxable income after 401k and HSA deductions
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

// Function to calculate federal tax based on filing status
function calculateFederalTax(income, filingStatus) {
    let tax = 0;

    // Tax brackets for Single
    const singleBrackets = [
        { threshold: 11000, rate: 0.1 },
        { threshold: 44725, rate: 0.12 },
        { threshold: 95375, rate: 0.22 },
        { threshold: 182100, rate: 0.24 },
        { threshold: 231250, rate: 0.32 },
        { threshold: 578100, rate: 0.35 },
        { threshold: Infinity, rate: 0.37 }
    ];

    // Tax brackets for Married Filing Jointly
    const marriedBrackets = [
        { threshold: 22000, rate: 0.1 },
        { threshold: 89450, rate: 0.12 },
        { threshold: 190750, rate: 0.22 },
        { threshold: 364200, rate: 0.24 },
        { threshold: 462500, rate: 0.32 },
        { threshold: 693750, rate: 0.35 },
        { threshold: Infinity, rate: 0.37 }
    ];

    const brackets = filingStatus === "married" ? marriedBrackets : singleBrackets;

    // Calculate tax
    for (let i = 0; i < brackets.length; i++) {
        const { threshold, rate } = brackets[i];
        if (income > threshold) {
            const nextThreshold = brackets[i + 1] ? brackets[i + 1].threshold : Infinity;
            const taxableAtThisRate = Math.min(income, nextThreshold) - threshold;
            tax += taxableAtThisRate * rate;
        }
    }

    return tax;
}
