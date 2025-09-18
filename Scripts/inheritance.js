/* ===== Inheritance Tax Reduction Calculator ===== */

function calculateInheritance() {
  // Inputs
  const workStatus = document.getElementById("workStatus").value;
  const retireAge = parseInt(document.getElementById("retireAge").value);
  const currentAge = parseInt(document.getElementById("currentAge").value);
  const currentYear = parseInt(document.getElementById("currentYear").value);

  let taxable = parseFloat(document.getElementById("taxableBalance").value) || 0;
  let nonTaxable = parseFloat(document.getElementById("nonTaxableBalance").value) || 0;
  const grossIncome = parseFloat(document.getElementById("grossIncome").value) || 0;
  const extraContributions = parseFloat(document.getElementById("extraContributions").value) || 0;

  const totalStart = taxable + nonTaxable;

  // Simulation variables
  let year = currentYear;
  let age = currentAge;
  const rows = [];
  const labels = [];
  const taxableSeries = [];
  const nonTaxableSeries = [];

  // Constants
  const sgRate = 0.12;
  const sgTax = 0.15;
  const investmentReturn = 0.05;
  const maxAge = 75;

  // NCC caps table
  function getNCCCap(tsb) {
    if (tsb < 1_660_000) return 360000;
    if (tsb < 1_780_000) return 240000;
    if (tsb < 1_900_000) return 120000;
    return 0;
  }

  // Loop each year
  while (age <= maxAge) {
    let withdrawals = 0;
    let reContributions = 0;

    // Employer SG contributions if still working
    if (workStatus === "yes" && age < retireAge) {
      let sg = grossIncome * sgRate;
      let netSG = sg * (1 - sgTax);
      taxable += netSG;

      // Allow user extra contributions
      taxable += extraContributions;

      // Up to $30k of SG/extra can be re-contributed (if NCC cap allows)
      const sgShift = Math.min(30000, taxable, getNCCCap(taxable + nonTaxable));
      taxable -= sgShift;
      nonTaxable += sgShift;
      reContributions += sgShift;
    }

    // Withdrawals → re-contribution
    if (age >= 60 && age < 65) {
      if (workStatus === "yes" && age < retireAge) {
        // Working 60-64: 10% TSB cap
        const cap = (taxable + nonTaxable) * 0.10;
        const move = Math.min(cap, taxable, getNCCCap(taxable + nonTaxable));
        taxable -= move;
        nonTaxable += move;
        withdrawals += move;
        reContributions += move;
      } else {
        // Not working 60-64: no cap
        const move = Math.min(taxable, getNCCCap(taxable + nonTaxable));
        taxable -= move;
        nonTaxable += move;
        withdrawals += move;
        reContributions += move;
      }
    } else if (age >= 65 && age < 75) {
      // Age 65+: no cap on withdrawals, but NCC caps apply
      const move = Math.min(taxable, getNCCCap(taxable + nonTaxable));
      taxable -= move;
      nonTaxable += move;
      withdrawals += move;
      reContributions += move;
    }

    // Growth at 5% net return
    taxable *= 1 + investmentReturn;
    nonTaxable *= 1 + investmentReturn;

    // Record year
    rows.push({
      year,
      age,
      taxable,
      nonTaxable,
      reContributions
    });

    labels.push("Age " + age);
    taxableSeries.push(taxable);
    nonTaxableSeries.push(nonTaxable);

    year++;
    age++;
  }

  // Chart
  updateInheritanceChart(labels, taxableSeries, nonTaxableSeries);

  // Table
  updateInheritanceTable(rows);

  // Summary
  const finalRow = rows[rows.length - 1];
  const finalTotal = finalRow.taxable + finalRow.nonTaxable;
  const inheritanceTax = finalRow.taxable * 0.17;
  const taxIfNoStrategy = totalStart * 0.17; // simple: 17% of starting taxable
  const taxSaved = taxIfNoStrategy - inheritanceTax;

  let summaryText = `<p>At age ${finalRow.age}, your super is worth <strong>$${finalTotal.toFixed(0)}</strong>.</p>`;
  if (finalRow.taxable <= 0) {
    summaryText += `<p>✅ You converted all of your super into non-taxable. No inheritance tax payable.</p>`;
  } else {
    summaryText += `<p>Of this, <strong>$${finalRow.nonTaxable.toFixed(0)}</strong> is non-taxable and <strong>$${finalRow.taxable.toFixed(0)}</strong> is still taxable.</p>`;
    summaryText += `<p>If you passed away, your heirs would pay about <strong>$${inheritanceTax.toFixed(0)}</strong> in tax (17% of taxable).</p>`;
    summaryText += `<p>You saved about <strong>$${taxSaved.toFixed(0)}</strong> compared to doing nothing.</p>`;
  }

  document.getElementById("inheritanceSummary").innerHTML = summaryText;
}

/* ===== Chart ===== */
function updateInheritanceChart(labels, taxableSeries, nonTaxableSeries) {
 if (window.inheritanceChart instanceof Chart) {
  window.inheritanceChart.destroy();
}
  const ctx = document.getElementById("inheritanceChart").getContext("2d");
  window.inheritanceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Non-Taxable",
          data: nonTaxableSeries,
          backgroundColor: "#d8bd7d"
        },
        {
          label: "Taxable",
          data: taxableSeries,
          backgroundColor: "#5290c9"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: {
        x: { stacked: true },
        y: { stacked: true, title: { display: true, text: "Balance ($)" } }
      }
    }
  });
}

/* ===== Table ===== */
function updateInheritanceTable(rows) {
  const tableBody = document.getElementById("inheritanceTableBody");
  tableBody.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.year}</td>
      <td>${r.age}</td>
      <td>${r.taxable.toFixed(0)}</td>
      <td>${r.nonTaxable.toFixed(0)}</td>
      <td>${r.reContributions.toFixed(0)}</td>
    `;
    tableBody.appendChild(tr);
  });
}

/* ===== Run on Load ===== */
window.onload = calculateInheritance;
