
        function getContributionLimit(age) {
            const baseContributionLimit = 23000;
            const catchUpContribution = 7500;
            return (age >= 50) ? (baseContributionLimit + catchUpContribution) : baseContributionLimit;
        }

        function federalTax(marriedIncome) {
            let tax = 0;
            const brackets = [
                { rate: 0.10, cap: 24600 },
                { rate: 0.12, cap: 94000 },
                { rate: 0.22, cap: 201050 },
                { rate: 0.24, cap: 383900 },
                { rate: 0.32, cap: 487450 },
                { rate: 0.35, cap: 731200 },
                { rate: 0.37, cap: Infinity }
            ];

            let previousCap = 0;
            for (const bracket of brackets) {
                if (marriedIncome > previousCap) {
                    const taxable = Math.min(marriedIncome, bracket.cap) - previousCap;
                    tax += taxable * bracket.rate;
                    previousCap = bracket.cap;
                } else {
                    break;
                }
            }
            return tax;
        }

        function ctTax(marriedIncome) {
            let tax = 0;
            const brackets = [
                { rate: 0.03, cap: 20000 },
                { rate: 0.05, cap: 100000 },
                { rate: 0.055, cap: 200000 },
                { rate: 0.06, cap: 250000 },
                { rate: 0.065, cap: 500000 },
                { rate: 0.069, cap: 1000000 },
                { rate: 0.0699, cap: Infinity }
            ];

            let previousCap = 0;
            for (const bracket of brackets) {
                if (marriedIncome > previousCap) {
                    const taxable = Math.min(marriedIncome, bracket.cap) - previousCap;
                    tax += taxable * bracket.rate;
                    previousCap = bracket.cap;
                } else {
                    break;
                }
            }
            return tax;
        }

        function calculate() {
            const salary = parseFloat(document.getElementById('salary').value);
            const age = parseInt(document.getElementById('age').value);
            const traditionalPercent = parseFloat(document.getElementById('traditionalPercent').value);
            const rothPercent = parseFloat(document.getElementById('rothPercent').value);

            if ((traditionalPercent + rothPercent) !== 100) {
                alert("Traditional % and Roth % must add up to 100%.");
                return;
            }

            const contributionLimit = getContributionLimit(age);
            const maxContribution = Math.min(contributionLimit, salary);

            const traditionalContribution = maxContribution * (traditionalPercent / 100);
            const rothContribution = maxContribution * (rothPercent / 100);

            const taxableIncome = salary - traditionalContribution;

            const federalTaxes = federalTax(taxableIncome);
            const stateTaxes = ctTax(taxableIncome);
            const totalTaxes = federalTaxes + stateTaxes;

            const effectiveTaxRate = (totalTaxes / salary) * 100;

            document.getElementById('output').innerHTML = `
                <h2>Results:</h2>
                <p><strong>Traditional 401k Contribution:</strong> $${traditionalContribution.toFixed(2)}</p>
                <p><strong>Roth 401k Contribution:</strong> $${rothContribution.toFixed(2)}</p>
                <p><strong>Taxable Income (after Traditional 401k):</strong> $${taxableIncome.toFixed(2)}</p>
                <p><strong>Federal Tax:</strong> $${federalTaxes.toFixed(2)}</p>
                <p><strong>Connecticut State Tax:</strong> $${stateTaxes.toFixed(2)}</p>
                <p><strong>Total Taxes:</strong> $${totalTaxes.toFixed(2)}</p>
                <p><strong>Effective Tax Rate:</strong> ${effectiveTaxRate.toFixed(2)}%</p>
            `;
        }
