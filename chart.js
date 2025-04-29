export function renderPieChart({ totalTax, total401k, totalHsa, takeHome }) {
    const ctx = document.getElementById('taxBreakdownChart').getContext('2d');

    const data = {
        labels: ['Federal + State Taxes', '401k Contributions', 'HSA Contributions', 'Take-home Pay'],
        datasets: [{
            label: 'Current Year Breakdown',
            data: [totalTax, total401k, totalHsa, takeHome],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A'],
            borderWidth: 1
        }]
    };

    const config = {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.parsed;
                            return `${context.label}: $${value.toLocaleString()}`;
                        }
                    }
                },
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Where Your Income Goes (Current Year)'
                }
            }
        }
    };

    // Destroy existing chart if it exists
    if (window.taxBreakdownChart) {
        window.taxBreakdownChart.destroy();
    }

    window.taxBreakdownChart = new Chart(ctx, config);
}
