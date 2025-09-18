/* ===== Repayments Calculator Specific Logic ===== */

function calculateAll() {
  const loanAmount = parseFloat(document.getElementById("loanAmount").value);
  const annualRate = parseFloat(document.getElementById("interestRate").value) / 100;
  const years = parseInt(document.getElementById("loanTerm").value);
  const frequency = document.getElementById("repaymentFrequency").value;

  const extraRepayments = parseFloat(document.getElementById("extraRepayments").value) || 0;
  const offsetAmount = parseFloat(document.getElementById("offsetAmount").value) || 0;
  const lumpSum = parseFloat(document.getElementById("lumpSum").value) || 0;

  // Frequency setup
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

  // Single lever scenarios
  const extra = simulateLoan(loanAmount, annualRate, years, paymentsPerYear, periodRate, { extraRepayments });
  const offset = simulateLoan(loanAmount, annualRate, years, paymentsPerYear, periodRate, { offsetAmount });
  const lump = simulateLoan(loanAmount, annualRate, years, paymentsPerYear, periodRate, { lumpSum });

  // Combined
  const combined = simulateLoan(loanAmount, annualRate, years, paymentsPerYear, periodRate, { extraRepayments, offsetAmount, lumpSum });

  // Update savings UI
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

window.onload = calculateAll;

