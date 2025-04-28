// Define tax brackets
const federalBrackets = {
    "single": [
        { rate: 0.10, upTo: 11600 },
        { rate: 0.12, upTo: 47150 },
        { rate: 0.22, upTo: 100525 },
        { rate: 0.24, upTo: 191950 },
        { rate: 0.32, upTo: 243725 },
        { rate: 0.35, upTo: 609350 },
        { rate: 0.37, upTo: Infinity }
    ],
    "married filing jointly": [
        { rate: 0.10, upTo: 23200 },
        { rate: 0.12, upTo: 94300 },
        { rate: 0.22, upTo: 201050 },
        { rate: 0.24, upTo: 383900 },
        { rate: 0.32, upTo: 487450 },
        { rate: 0.35, upTo: 731200 },
        { rate: 0.37, upTo: Infinity }
    ]
};

// CT State Tax (Simplified)
function calculateCTTax(taxableIncome, filingStatus) {
    let tax = 0;
    if (filingStatus === "single") {
        if (taxableIncome <= 10000) tax = taxableIncome * 0.03;
        else if (taxableIncome <= 50000) tax = 300 + (taxableIncome - 10000) * 0.05;
        else tax = 2300 + (taxableIncome - 50000) * 0.055;
    } else {
        if (taxableIncome <= 20000) tax = taxableIncome * 0.03;
        else if (taxableIncome <= 100000) tax = 600 + (taxableIncome - 20000) * 0.05;
        else tax = 4600 + (taxableIncome - 100000) * 0.055;
    }
    return tax;
}

// Federal Tax
function calculateFederalTax(taxableIncome, filingStatus) {
    const brackets = federalBrackets[filingStatus];
    let tax = 0;
    let lastLimit = 0;

    for (const bracket of brackets) {
        if (taxableIncome > bracket.upTo) {
            tax += (bracket.upTo - lastLimit) * bracket.rate;
            lastLimit = bracket.upTo;
        } else {
            tax += (taxableIncome - lastLimit) * bracket.rate;
            break;
        }
    }
    return tax;
}

// Main Calculation
function calculateTaxes() {
    const grossIncome = parseFloat(document.getElementById('grossIncome').value) || 0;
    const rsuIncome = parseFloat(document.getElementById('rsuIncome').value) || 0;
    const trad401kPct = parseFloat(document.getElementById('trad401kPct').value) || 0;
    const roth401kPct = parseFloat(document.getElementById('roth401kPct').value) || 0;
    const hsaContributionInput = parseFloat(document.getElementById('hsaContribution').value) || 0;
    const filingStatus = document.getElementById('filingStatus').value || "single";
    const age = parseInt(document.getElementById('age').value) || 30;

    const totalIncome = grossIncome + rsuIncome;

    // Adjust max 401k limit based on age
    const max401kLimit = age >= 50 ? 30000 : 23000;

    // Traditional 401k and Roth 401k are % of max limit
    let trad401kContribution = (trad401kPct / 100) * max401kLimit;
    let roth401kContribution = (roth401kPct / 100) * max401kLimit;

    if (trad401kContribution + roth401kContribution > max401kLimit) {
        alert(`Combined 401k contributions cannot exceed the limit of $${max401kLimit}. Adjusting proportionally.`);
        const totalPct = trad401kPct + roth401kPct;
        trad401kContribution = (trad401kPct / totalPct) * max401kLimit;
        roth401kContribution = (roth401kPct / totalPct) * max401kLimit;
    }

    // Adjust max HSA limit based on age and filing status
    let maxHsa = 0;
    if (filingStatus === "married filing jointly") {
        maxHsa = age >= 55 ? 9550 : 8550;
    } else {
        maxHsa = age >= 55 ? 5300 : 4300;
    }
    let hsaContribution = Math.min(hsaContributionInput, maxHsa);

    // Taxable income with user's actual choice
    const taxableIncome = totalIncome - trad401kContribution - hsaContribution;

    const federalTax = calculateFederalTax(taxableIncome, filingStatus);
    const stateTax = calculateCTTax(taxableIncome, filingStatus);
    const combinedEffectiveTaxRate = (federalTax + stateTax) / totalIncome * 100;

    const totalContributions = trad401kContribution + roth401kContribution + hsaContribution;
    const takeHomePay = totalIncome - (federalTax + stateTax + totalContributions);

    // === Tax Calculation for 100% Traditional 401k Scenario ===
    const maxTrad401kContribution = max401kLimit;
    const taxableIncomeMaxTraditional = totalIncome - maxTrad401kContribution - hsaContribution;
    const federalTaxMaxTraditional = calculateFederalTax(taxableIncomeMaxTraditional, filingStatus);
    const stateTaxMaxTraditional = calculateCTTax(taxableIncomeMaxTraditional, filingStatus);
    const totalTaxMaxTraditional = federalTaxMaxTraditional + stateTaxMaxTraditional;
    const takeHomePayMaxTraditional = totalIncome - (totalTaxMaxTraditional + maxTrad401kContribution + hsaContribution);

    // Differences
    const taxDifference = (federalTax + stateTax) - totalTaxMaxTraditional;
    const takeHomeDifference = takeHomePay - takeHomePayMaxTraditional;

    // Build Results
    let results = "";

    results += `<h3>Current Selection</h3>`;
    results += `<p>Federal Tax: $${federalTax.toFixed(2)}</p>`;
    results += `<p>Connecticut State Tax: $${stateTax.toFixed(2)}</p>`;
    results += `<p><strong>Combined Effective Tax Rate: ${combinedEffectiveTaxRate.toFixed(2)}%</strong></p>`;
    results += `<p><strong>Total 401k + HSA Contributions: $${totalContributions.toFixed(2)}</strong></p>`;
    results += `<p><strong>Estimated Take-Home Pay: $${takeHomePay.toFixed(2)}</strong></p>`;

    results += `<hr>`;

    results += `<h3>If 100% Traditional 401k Contribution</h3>`;
    results += `<p>Federal Tax: $${federalTaxMaxTraditional.toFixed(2)}</p>`;
    results += `<p>Connecticut State Tax: $${stateTaxMaxTraditional.toFixed(2)}</p>`;
    results += `<p><strong>Estimated Take-Home Pay: $${takeHomePayMaxTraditional.toFixed(2)}</strong></p>`;

    results += `<hr>`;

    results += `<h3>Comparison</h3>`;
    results += `<p><strong>Tax Saved by Going 100% Traditional 401k: $${taxDifference.toFixed(2)}</strong></p>`;
    results += `<p><strong>Take-Home Pay Difference: $${takeHomeDifference.toFixed(2)}</strong> (${takeHomeDifference > 0 ? 'More' : 'Less'})</p>`;

    document.getElementById('results').innerHTML = results;
}
