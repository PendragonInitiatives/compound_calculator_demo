/* ===== Show Info Tooltips ===== */
function showInfo(type) {
  let message = "";
  if (type === "extraInfo") {
    message = "Making extra repayments means paying more than the minimum required. This reduces the loan balance so less interest is charged. Even small amounts add up over time.";
  }
  if (type === "offsetInfo") {
    message = "An offset account is a bank account linked to your loan. The balance reduces the interest you pay because interest is only charged on the loan minus the offset.";
  }
  if (type === "lumpInfo") {
    message = "A lump sum is a one-off extra payment. It goes straight to reducing your loan balance. This cuts down future interest and shortens the loan term.";
  }
  if (type === "frequencyInfo") {
    message = "Paying fortnightly or weekly instead of monthly means you make the equivalent of 13 monthly payments each year instead of 12. This helps pay off your loan faster.";
  }
  alert(message);
}

/* ===== Main Calculator ===== */
function calculateAll() {
  // Inputs
  const loanAmount = parseFloat(document.getElementById("loanAmount").value);
  const annualRate = parseFloat(document.getElementById("interestRate").value) / 100;
  const years = parseInt(document.getElementById("loanTerm").value);
  const frequency = document.getElementById("repaymentFrequency").value;

  const extraRepayments = parseFloat(document.getElementById("extraRepayments").value) || 0;
  const offsetAmount = parseFloat(document.getElementById("offsetAmount").value) || 0;
  const lumpSum = parseFloat(document.getElementById("lumpSum").value) || 0;

  // Repayment frequency
  let paymentsPerYear, periodRate;
  if (frequency === "monthly") {
    paymentsPerYear = 12; periodRate = annualRate / 12;
  } else if (frequency === "fortnightly") {
    paymentsPerYear = 26; periodRate = annualRate / 26;
  } else {
    paymentsPerYear = 52; periodRate = annualRate / 52;
  }

  // Baseline loan
  const baseline = simulateLoan(loanAmount, annualRate, years, paymentsPerYear, periodRate);

  // Single-lever scenarios
  const extra = simulateLoan(loanAmount, annualRate, years, paymentsPerYear, periodRate, { extraRepayments });
  const offset = simulateLoan(loanAmount, annualRate, years, paymentsPerYear, periodRate, { offsetAmount });
  const lump = simulateLoan(loanAmount, annualRate, years, paymentsPerYear, periodRate, { lumpSum });

  // Combined scenario
  const combined = simulateLoan(loanAmount, annualRate, years, paymentsPerYear, periodRate, { extraRepayments, offsetAmount, lumpSum });

  // Update per-lever savings
  updateSavings("extraSavings", baseline, extra, "extra repayments");
  updateSavings("offsetSavings", baseline, offset, "offset account");
  updateSavings("lumpSavings", baseline, lump, "lump sum");

  // Combined savings
  const interestSaved = baseline.totalInterest - combined.totalInterest;
  const yearsSaved = (baseline.termYears - combined.termYears).toFixed(1);
  document.getElementById("totalInterestSaved").innerText = `$${interestSaved.toFixed(0)}`;
  document.getElementById("totalTimeSaved").innerText = `${yearsSaved} years`;

  // Loan summary
  document.getElementById("summaryTotalPayments").innerText = `$${combined.totalPayments.toFixed(2)}`;
  document.getElementById("summaryTotalPrincipal").innerText = `$${loanAmount.toFixed(2)}`;
  document.getElementById("summaryTotalInterest").innerText = `$${combined.totalInterest.toFixed(2)}`;
  document.getElementById("summaryYearsSaved").innerText = `${yearsSaved} years`;

  // Frequency message
  const freqDiv = document.getElementById("frequencySavings");
  if (frequency === "monthly") {
    freqDiv.innerText = "You are making standard monthly repayments.";
  } else {
    freqDiv.innerText = `By paying ${frequency}, you effectively make 13 months of payments per year. This shortens your loan by about ${yearsSaved} years and saves you interest.`;
  }

  // Amortization schedule
  generateAmortizationSchedule(loanAmount, annualRate, years, paymentsPerYear, periodRate, { extraRepayments, offsetAmount, lumpSum });
}

/* ===== Loan Simulation ===== */
function simulateLoan(principal, annualRate, years, paymentsPerYear, periodRate, opts = {}) {
  let balance = principal;
  let totalInterest = 0;
  let totalPayments = 0;
  let periods = years * paymentsPerYear;

  const baseRepayment = (principal * periodRate) / (1 - Math.pow(1 + periodRate, -periods));
  const repayment = baseRepayment + (opts.extraRepayments || 0);

  for (let i = 1; i <= periods; i++) {
    // Offset reduces balance for interest
    let effectiveBalance = balance - (opts.offsetAmount || 0);
    if (effectiveBalance < 0) effectiveBalance = 0;

    const interest = effectiveBalance * periodRate;
    let principalPaid = repayment - interest;

    // Lump sum at first payment
    if (i === 1 && opts.lumpSum) {
      balance -= opts.lumpSum;
      if (balance < 0) balance = 0;
    }

    balance -= principalPaid;
    totalInterest += interest;
    totalPayments += repayment;

    if (balance <= 0) {
      return {
        totalInterest,
        totalPayments,
        termYears: i / paymentsPerYear
      };
    }
  }
  return { totalInterest, totalPayments, termYears: years };
}

/* ===== Update Savings UI ===== */
function updateSavings(id, baseline, scenario, label) {
  const interestSaved = baseline.totalInterest - scenario.totalInterest;
  const yearsSaved = (baseline.termYears - scenario.termYears).toFixed(1);

  const div = document.getElementById(id);
  div.innerHTML = `
    <div class="savings-line"><span class="icon-interest">🐖</span> Interest saved: $${interestSaved.toFixed(0)}</div>
    <div class="savings-line"><span class="icon-time">⏱</span> Time saved: ${yearsSaved} years</div>
    <div class="savings-note">(This is just from ${label} only.)</div>
  `;
}

/* ===== Amortization Schedule ===== */
function generateAmortizationSchedule(principal, annualRate, years, paymentsPerYear, periodRate, opts) {
  let balance = principal;
  let schedule = [];
  let periods = years * paymentsPerYear;

  const baseRepayment = (principal * periodRate) / (1 - Math.pow(1 + periodRate, -periods));
  const repayment = baseRepayment + (opts.extraRepayments || 0);

  for (let i = 1; i <= periods; i++) {
    let effectiveBalance = balance - (opts.offsetAmount || 0);
    if (effectiveBalance < 0) effectiveBalance = 0;

    const interest = effectiveBalance * periodRate;
    let principalPaid = repayment - interest;

    if (i === 1 && opts.lumpSum) {
      balance -= opts.lumpSum;
      if (balance < 0) balance = 0;
    }

    balance -= principalPaid;
    schedule.push({
      period: i,
      payment: repayment,
      principal: principalPaid,
      interest: interest,
      balance: balance < 0 ? 0 : balance
    });

    if (balance <= 0) break;
  }

  updateChart(schedule, paymentsPerYear);
  updateTable(schedule, paymentsPerYear);
}

/* ===== Chart.js Loan Balance ===== */
function updateChart(schedule, paymentsPerYear) {
  const labels = [];
  const balances = [];
  let lastYear = 0;

  schedule.forEach((s, i) => {
    const year = Math.ceil((i + 1) / paymentsPerYear);
    if (year !== lastYear) {
      labels.push("Year " + year);
      balances.push(s.balance);
      lastYear = year;
    }
  });

  if (window.loanChart) {
    window.loanChart.destroy();
  }
  const ctx = document.getElementById("loanChart").getContext("2d");
  window.loanChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Loan Balance",
        data: balances,
        borderWidth: 2,
        borderColor: "#d8bd7d",
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: "Years" } },
        y: { title: { display: true, text: "Balance ($)" } }
      }
    }
  });
}

/* ===== Amortization Table ===== */
function updateTable(schedule, paymentsPerYear) {
  const tableBody = document.getElementById("amortizationTableBody");
  tableBody.innerHTML = "";

  let yearSummary = {
    year: 1,
    totalPayment: 0,
    totalPrincipal: 0,
    totalInterest: 0,
    endBalance: schedule[0] ? schedule[0].balance : 0
  };

  let grandTotalPayment = 0, grandTotalPrincipal = 0, grandTotalInterest = 0;

  schedule.forEach((s, i) => {
    yearSummary.totalPayment += s.payment;
    yearSummary.totalPrincipal += s.principal;
    yearSummary.totalInterest += s.interest;
    yearSummary.endBalance = s.balance;

    grandTotalPayment += s.payment;
    grandTotalPrincipal += s.principal;
    grandTotalInterest += s.interest;

    if ((i + 1) % paymentsPerYear === 0 || i === schedule.length - 1) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>Year ${yearSummary.year}</td>
        <td>${yearSummary.totalPayment.toFixed(2)}</td>
        <td>${yearSummary.totalPrincipal.toFixed(2)}</td>
        <td>${yearSummary.totalInterest.toFixed(2)}</td>
        <td>${yearSummary.endBalance.toFixed(2)}</td>
      `;
      tableBody.appendChild(row);

      yearSummary = { year: yearSummary.year + 1, totalPayment: 0, totalPrincipal: 0, totalInterest: 0, endBalance: s.balance };
    }
  });

  const totalRow = document.createElement("tr");
  totalRow.classList.add("font-bold");
  totalRow.innerHTML = `
    <td>Total</td>
    <td>${grandTotalPayment.toFixed(2)}</td>
    <td>${grandTotalPrincipal.toFixed(2)}</td>
    <td>${grandTotalInterest.toFixed(2)}</td>
    <td>0.00</td>
  `;
  tableBody.appendChild(totalRow);
}

/* ===== Auto-Run on Load ===== */
window.onload = calculateAll;
