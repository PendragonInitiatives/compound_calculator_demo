function calculateCompound() {
  // === Inputs ===
const initialDeposit = parseFloat(document.getElementById("initialDeposit").value.replace(/,/g, "")) || 0;
const regularDeposit = parseFloat(document.getElementById("regularDeposit").value.replace(/,/g, "")) || 0;
  const depositFrequency = document.getElementById("depositFrequency").value;
  const compoundFrequency = document.getElementById("compoundFrequency").value;
  const years = parseInt(document.getElementById("years").value) || 0;
  const annualInterestRate = (parseFloat(document.getElementById("annualInterestRate").value) || 0) / 100;

  // Frequency conversion
  const depositsPerYear = {
    "Annually": 1,
    "Monthly": 12,
    "Fortnightly": 26,
    "Weekly": 52
  }[depositFrequency] || 12;

  const compoundsPerYear = compoundFrequency === "Monthly" ? 12 : 1;

  // === Simulation ===
  let balance = initialDeposit;
  let totalDeposits = initialDeposit;
  let totalInterest = 0;

  const rows = [];
  const labels = [];
  const balances = [];

  for (let year = 1; year <= years; year++) {
    let startBalance = balance;
    let depositsThisYear = regularDeposit * depositsPerYear;
    let interestThisYear = 0;

    // Simulate compounding periods within the year
    for (let period = 1; period <= compoundsPerYear; period++) {
      balance += depositsThisYear / compoundsPerYear; // spread deposits
      const periodRate = annualInterestRate / compoundsPerYear;
      const interest = balance * periodRate;
      balance += interest;
      interestThisYear += interest;
    }

    totalDeposits += depositsThisYear;
    totalInterest += interestThisYear;

    rows.push({
      year,
      startBalance,
      deposits: depositsThisYear,
      interest: interestThisYear,
      endBalance: balance
    });

    labels.push(`Year ${year}`);
    balances.push(balance);
  }

  // === Outputs ===
  const finalBalance = balance;
  const summaryDiv = document.getElementById("compoundSummary");

  // Split deposits into initial vs regular
  const regularDeposits = totalDeposits - initialDeposit;

summaryDiv.innerHTML = `
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


  updateCompoundChart(labels, balances);
  updateCompoundTable(rows);
}


// === Chart ===
function updateCompoundChart(labels, balances) {
  if (window.compoundChart instanceof Chart) {
    window.compoundChart.destroy();
  }
  const ctx = document.getElementById("compoundChart").getContext("2d");
  window.compoundChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Balance",
        data: balances,
        borderColor: "#5290c9",
        backgroundColor: "rgba(82,144,201,0.3)",
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { ticks: { callback: value => formatCurrency(value) } }
      }
    }
  });
}

// === Table ===
function updateCompoundTable(rows) {
  const tbody = document.getElementById("compoundTable");
  tbody.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.year}</td>
      <td>${formatCurrency(r.startBalance)}</td>
      <td>${formatCurrency(r.deposits)}</td>
      <td>${formatCurrency(r.interest)}</td>
      <td>${formatCurrency(r.endBalance)}</td>
    `;
    tbody.appendChild(tr);
  });
}
