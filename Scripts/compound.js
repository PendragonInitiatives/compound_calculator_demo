// === MAIN FUNCTION: runs when user clicks calculate ===
function calculateCompound() {
  // === Inputs ===
  const initialDeposit = parseFloat(document.getElementById("initialDeposit").value.replace(/,/g, "")) || 0;
  const regularDeposit = parseFloat(document.getElementById("regularDeposit").value.replace(/,/g, "")) || 0;
  const depositFrequency = document.getElementById("depositFrequency").value;
  const compoundFrequency = document.getElementById("compoundFrequency").value;
  const years = parseInt(document.getElementById("years").value) || 0;
  const annualRate = (parseFloat(document.getElementById("annualInterestRate").value) || 0) / 100;

  // === Run simulation ===
  const rows = simulateCompound(initialDeposit, regularDeposit, years, annualRate);
  const labels = rows.map(r => r.year);

  // === Outputs ===
  const finalBalance = rows[rows.length - 1].endBalance;
  const totalDeposits = rows[rows.length - 1].totalDeposits;
  const totalInterest = rows[rows.length - 1].totalInterest;
  const regularDeposits = totalDeposits - initialDeposit;

  document.getElementById("compoundSummary").innerHTML = `
    <div class="outcome-columns">
      <div class="outcome-col">
        <div class="outcome-row"><span>Initial Deposit</span><strong class="value">${formatCurrency(initialDeposit)}</strong></div>
        <div class="outcome-row"><span>Regular Deposits</span><strong class="value">${formatCurrency(regularDeposits)}</strong></div>
      </div>
      <div class="outcome-col">
        <div class="outcome-row"><span>Total Interest</span><strong class="value">${formatCurrency(totalInterest)}</strong></div>
        <div class="outcome-row"><span>Final Balance</span><strong class="value final-balance">${formatCurrency(finalBalance)}</strong></div>
      </div>
    </div>
  `;

  // === Update chart + table ===
  updateCompoundChart(labels, rows, initialDeposit);
  updateCompoundTable(rows);
}

// === HELPER FUNCTION: pure math only ===
function simulateCompound(initialDeposit, yearlyDeposit, years, rate) {
  const rows = [];
  let balance = initialDeposit;
  let totalDeposits = initialDeposit;
  let totalInterest = 0;

  for (let year = 1; year <= years; year++) {
    // Add yearly deposit
    if (yearlyDeposit > 0) {
      balance += yearlyDeposit;
      totalDeposits += yearlyDeposit;
    }

    // Apply yearly interest
    const interest = balance * rate;
    balance += interest;
    totalInterest += interest;

    rows.push({
      year,
      totalDeposits,
      totalInterest,
      endBalance: balance
    });
  }

  return rows;
}

// === CHART FUNCTION: draw stacked bar ===
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
              if (value >= 1_000_000_000) return (value / 1_000_000_000) + "B";
              if (value >= 1_000_000) return (value / 1_000_000) + "M";
              if (value >= 1_000) return (value / 1_000) + "k";
              return value;
            }
          },
          title: { display: true, text: "Savings", color: "#fff", font: { size: 16, weight: "bold" } },
          suggestedMax: (() => {
            const end = rows[rows.length - 1].endBalance;
            const step = end > 1_000_000 ? 1_000_000 : 100_000;
            return Math.ceil(end / step) * step;
          })()
        }
      }
    }
  });
}

// === TABLE FUNCTION ===
function updateCompoundTable(rows) {
  const tbody = document.getElementById("compoundTable");
  tbody.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.year}</td>
      <td>${formatCurrency(r.totalDeposits)}</td>
      <td>${formatCurrency(r.totalInterest)}</td>
      <td>${formatCurrency(r.endBalance)}</td>
    `;
    tbody.appendChild(tr);
  });
}
