function calculateTaxImpact() {
    const grossIncome = parseFloat(document.getElementById('grossIncome').value) || 0;
    const rsuIncome = parseFloat(document.getElementById('rsuIncome').value) || 0;
    const age = parseInt(document.getElementById('age').value) || 0;
    const traditionalPercent = parseFloat(document.getElementById('traditionalPercent').value) || 0;
    const rothPercent = parseFloat(document.getElementById('rothPercent').value) || 0;
    const hsaCoverage = document.getElementById('hsaCoverage').value;
    const hsaContributionInput = parseFloat(document.getElementById('hsaContribution').value) || 0;

    // Combine salary + RSU
    const totalIncome = grossIncome + rsuIncome;

    // 401k contribution limits
    const max401k = (age >= 50) ? 30000 : 23000; // 2024 limits

    const total401kPercent = traditionalPercent + rothPercent;
    let total401kContribution = totalIncome * (total401kPercent / 100);

    if (total401kContribution > max401k) {
        total401kContribution = max401k;
    }

    const traditionalContribution = total401kContribution * (traditionalPercent / total401kPercent);
    const rothContribution = total401kContribution * (rothPercent / total401kPercent);

    // HSA contribution limits
    let maxHSA = 0;
    if (hsaCoverage === 'individual') {
        maxHSA = (age >= 55) ? 5150 : 4150;
    } else {
        maxHSA = (age >= 55) ? 9300 : 8300;
    }

    let hsaContribution = hsaContributionInput || maxHSA;
    if (hsaContribution > maxHSA) {
        hsaContribution = maxHSA;
    }

    // Taxable income after deductions
    const taxableIncome = totalIncome - traditionalContribution - hsaContribution;

    // Federal tax brackets for 2024 (married filing jointly)
    const brackets = [
        { limit: 23200, rate: 0.10 },
        { limit: 94300, rate: 0.12 },
        { limit: 201050, rate: 0.22 },
        { limit: 383900, rate: 0.24 },
        { limit: 487450, rate: 0.32 },
        { limit: 731200, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
    ];

    // Standard deduction
    const standardDeduction = 29200;
    let incomeAfterDeduction = taxableIncome - standardDeduction;
    if (incomeAfterDeduction < 0) incomeAfterDeduction = 0;

    // Calculate federal taxes owed
    let federalTax = 0;
    let lastLimit = 0;
    for (const bracket of brackets) {
        if (incomeAfterDeduction > bracket.limit) {
            federalTax += (bracket.limit - lastLimit) * bracket.rate;
            lastLimit = bracket.limit;
        } else {
            federalTax += (incomeAfterDeduction - lastLimit) * bracket.rate;
            break;
        }
    }

    // Connecticut (CT) state taxes (simplified flat estimate ~5%)
    const stateTaxRate = 0.05;
    const stateTax = incomeAfterDeduction * stateTaxRate;

    const totalTax = federalTax + stateTax;
    const effectiveTaxRate = (totalTax / totalIncome) * 100;

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <p><strong>Gross Income + RSUs:</strong> $${totalIncome.toLocaleString()}</p>
        <p><strong>Traditional 401k Contribution:</strong> $${traditionalContribution.toLocaleString()}</p>
        <p><strong>Roth 401k Contribution:</strong> $${rothContribution.toLocaleString()}</p>
        <p><strong>HSA Contribution:</strong> $${hsaContribution.toLocaleString()}</p>
        <p><strong>Taxable Income after deductions:</strong> $${incomeAfterDeduction.toLocaleString()}</p>
        <p><strong>Federal Tax:</strong> $${federalTax.toLocaleString()}</p>
        <p><strong>State Tax (CT):</strong> $${stateTax.toLocaleString()}</p>
        <p><strong>Total Taxes:</strong> $${totalTax.toLocaleString()}</p>
        <p><strong>Effective Tax Rate:</strong> ${effectiveTaxRate.toFixed(2)}%</p>
    `;
}
