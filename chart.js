function updateCompoundChart(labels, rows, initialDeposit) {
  if (window.compoundChart instanceof Chart) {
    window.compoundChart.destroy();
  }

  const ctx = document.getElementById("compoundChart").getContext("2d");

  const initialData = rows.map(() => initialDeposit);
  const depositsData = rows.map(r => r.totalDeposits - initialDeposit);
  const interestData = rows.map(r => r.totalInterest);

  window.compoundChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Initial Deposit", data: initialData, backgroundColor: "#1E3A8A", stack: "stack1" },
        { label: "Regular Deposits", data: depositsData, backgroundColor: "#3B82F6", stack: "stack1" },
        { label: "Interest", data: interestData, backgroundColor: "#93C5FD", stack: "stack1" }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#2e365f",
          titleColor: "#fff",
          bodyColor: "#fff",
          bodyFont: { size: 14 },
          padding: 12,
          callbacks: {
            title: (items) => `After ${items[0].label} years | Your Strategy`,
            label: () => null,
            afterBody: (items) => {
              const i = items[0].dataIndex;
              const r = rows[i];
              return [
                `Initial deposit: ${formatCurrency(initialDeposit)}`,
                `Regular deposits: ${formatCurrency(r.totalDeposits - initialDeposit)}`,
                `Total interest: ${formatCurrency(r.totalInterest)}`,
                `Total: ${formatCurrency(r.endBalance)}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: "#fff",
            font: { size: 14 },
            callback: function (val) {
              const year = this.getLabelForValue(val);
              if (rows.length <= 10) return year;
              if (rows.length <= 20 && year % 2 === 0) return year;
              if (rows.length > 20 && year % 5 === 0) return year;
              return "";
            }
          },
          title: { display: true, text: "Years", color: "#fff", font: { size: 16, weight: "bold" } }
        },
        y: {
          stacked: true,
          ticks: {
            color: "#fff",
            font: { size: 14 },
            callback: (value) => {
              if (value >= 1_000_000_000) return "$" + (value / 1_000_000_000) + "B";
              if (value >= 1_000_000) return "$" + (value / 1_000_000) + "M";
              if (value >= 1_000) return "$" + (value / 1_000) + "k";
              return "$" + value;
            }
          },
          title: { display: true, text: "Savings", color: "#fff", font: { size: 16, weight: "bold" } },
          // ✅ Chart.js v4 compatible way
          afterDataLimits: (axis) => {
            const end = rows[rows.length - 1].endBalance;
            const { maxY, step } = calculateYAxisMaxAndStep(end);
            axis.max = maxY;
            axis.ticks.stepSize = step;
          }
        }
      }
    }
  });
}
