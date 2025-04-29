console.log("calculator.js loaded");
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

function getMaxHsa(age, filingStatus) {
    if (filingStatus === "married filing jointly") {
        return age >= 55 ? 9550 : 8550;
    } else {
        return age >= 55 ? 5300 : 4300;
    }
}


// CT State Tax (Simplified)
function calculateStateTax(taxableIncome, filingStatus) {
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
    const grossIncome = parseFloat(document.getElementById("grossIncome").value) || 0;
    const rsuIncome = parseFloat(document.getElementById("rsuIncome").value) || 0;
    const age = parseInt(document.getElementById("age").value, 10) || 30;
    const filingStatus = document.getElementById("filingStatus").value;

    const totalIncome = grossIncome + rsuIncome;

    // 401k and HSA input types
    const trad401kType = document.getElementById("trad401kType").value;
    const trad401kValue = parseFloat(document.getElementById("trad401kValue").value) || 0;
    const roth401kType = document.getElementById("roth401kType").value;
    const roth401kValue = parseFloat(document.getElementById("roth401kValue").value) || 0;
    const hsaType = document.getElementById("hsaType").value;
    const hsaValue = parseFloat(document.getElementById("hsaValue").value) || 0;

    // Legal contribution limits
    const max401k = age >= 50 ? 30000 : 23000;
    const maxHsa = getMaxHsa(age, filingStatus);

    // Calculate actual 401k and HSA contributions
    let trad401k = trad401kType === "percent" ? (trad401kValue / 100) * max401k : trad401kValue;
    let roth401k = roth401kType === "percent" ? (roth401kValue / 100) * max401k : roth401kValue;
    let hsaContribution = hsaType === "percent" ? (hsaValue / 100) * maxHsa : hsaValue;

    // Cap each at their respective limits
    if (trad401k + roth401k > max401k) {
        alert(`Total 401k contributions exceed the $${max401k} limit. They will be capped.`);
        const ratio = trad401k / (trad401k + roth401k);
        trad401k = ratio * max401k;
        roth401k = (1 - ratio) * max401k;
    }

    if (hsaContribution > maxHsa) {
        alert(`HSA contribution exceeds the $${maxHsa} limit. It will be capped.`);
        hsaContribution = maxHsa;
    }

    const taxableIncome = totalIncome - trad401k - hsaContribution;

    const federalTax = calculateFederalTax(taxableIncome, filingStatus);
    const stateTax = calculateStateTax(taxableIncome, filingStatus);
    const totalTax = federalTax + stateTax;

    const takeHome = totalIncome - totalTax - trad401k - roth401k - hsaContribution;
    const totalContributions = trad401k + roth401k + hsaContribution
    const combinedEffectiveTaxRate = (totalTax / totalIncome * 100).toFixed(2);


   
    // === Tax Calculation for 100% Traditional 401k Scenario ===
    const maxTrad401kContribution = max401k;
    const taxableIncomeMaxTraditional = totalIncome - maxTrad401kContribution - hsaContribution;
    const federalTaxMaxTraditional = calculateFederalTax(taxableIncomeMaxTraditional, filingStatus);
    const stateTaxMaxTraditional = calculateStateTax(taxableIncomeMaxTraditional, filingStatus);
    const totalTaxMaxTraditional = federalTaxMaxTraditional + stateTaxMaxTraditional;
    const takeHomePayMaxTraditional = totalIncome - (totalTaxMaxTraditional + maxTrad401kContribution + hsaContribution);

    // Differences
    const taxDifference = (federalTax + stateTax) - totalTaxMaxTraditional;
    const takeHomeDifference = takeHome - takeHomePayMaxTraditional;

    // Build Results
    let results = "";

    results += `<h3>Current Selection</h3>`;
    results += `<p>Taxable Income: $${taxableIncome.toLocaleString()}</p>`;
    results += `<p>Federal Tax: $${federalTax.toFixed(2)}</p>`;
    results += `<p>Connecticut State Tax: $${stateTax.toFixed(2)}</p>`;
    results += `<p><strong>Combined Effective Tax Rate: ${combinedEffectiveTaxRate.toFixed(2)}%</strong></p>`;
    results += `<p><strong>Total 401k + HSA Contributions: $${totalContributions.toFixed(2)}</strong></p>`;
    results += `<p><strong>Estimated Take-Home Pay: $${takeHome.toFixed(2)}</strong></p>`;

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
    

    const results = `
        <p><strong>Taxable Income:</strong> $${taxableIncome.toLocaleString()}</p>
        <p><strong>Federal Tax:</strong> $${federalTax.toLocaleString()}</p>
        <p><strong>State Tax (CT):</strong> $${stateTax.toLocaleString()}</p>
        <p><strong>Total Tax:</strong> $${totalTax.toLocaleString()}</p>
        <p><strong>Effective Tax Rate:</strong> ${effectiveTaxRate}%</p>
        <p><strong>Take-Home Pay:</strong> $${takeHome.toLocaleString()}</p>
    `;

    document.getElementById("results").innerHTML = results;
}


function drawCurrentYearChart(taxBreakdown) {
    const ctx = document.getElementById('currentYearChart').getContext('2d');

    // If there is an existing chart, destroy it first
    if (window.currentYearPie) {
        window.currentYearPie.destroy();
    }

    window.currentYearPie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [
                'Federal Taxes',
                'State Taxes',
                'Traditional 401k Contributions',
                'Roth 401k Contributions',
                'HSA Contributions',
                'Take-Home Pay'
            ],
            datasets: [{
                data: [
                    taxBreakdown.federalTaxes,
                    taxBreakdown.stateTaxes,
                    taxBreakdown.traditional401k,
                    taxBreakdown.roth401k,
                    taxBreakdown.hsaContribution,
                    taxBreakdown.takeHome
                ],
                backgroundColor: [
                    '#ff6384', // Federal Taxes - Red
                    '#36a2eb', // State Taxes - Blue
                    '#ffcd56', // Traditional 401k - Yellow
                    '#4bc0c0', // Roth 401k - Teal
                    '#9966ff', // HSA - Purple
                    '#4caf50'  // Take Home Pay - Green
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

