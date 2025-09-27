/* ===== Shared Functions ===== */

/* Info Tooltips */
function showInfo(type) {
  let messages = {
    // Repayments calculator
    extraInfo: "Making extra repayments means paying more than the minimum required. This directly reduces your loan balance and cuts interest.",
    offsetInfo: "An offset account is a bank account linked to your loan. The balance reduces how much interest you pay.",
    lumpInfo: "A lump sum is a one-off extra payment. It goes straight to reducing your loan balance.",
    frequencyInfo: "Paying fortnightly or weekly instead of monthly means you make the equivalent of 13 monthly payments each year. This saves time and interest.",

    // Inheritance calculator
    workInfo: "If you are under 60, you cannot use this strategy. At 60–64, if still working, withdrawals are capped at 10% of your balance.",
    superInfo: "Your super has two parts: taxable and non-taxable. Non-taxable money is free from inheritance tax.",
    incomeInfo: "If you are still working, your employer pays 12% of your salary into super. Contributions are taxed at 15% inside super.",
    nccInfo: "The government limits how much you can re-contribute each year. These are called Non-Concessional Contributions (NCCs).",
    inheritanceInfo: "If your super is still taxable when you die, your non-dependent heirs may pay 17% tax. Moving money into the non-taxable side avoids this."
  };

  alert(messages[type] || "No info available.");
}

/* Currency Formatter */
function formatCurrency(value) {
  if (isNaN(value)) return "$0";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
// shared.js
function formatInputCurrency(input) {
  let value = input.value.replace(/,/g, ""); // remove commas
  if (!isNaN(value) && value !== "") {
    input.value = new Intl.NumberFormat("en-AU").format(value);
  }
}

// Apply formatting only after user finishes typing (on blur)
document.addEventListener("DOMContentLoaded", () => {
  ["initialDeposit", "regularDeposit"].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      // While typing → only digits allowed
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^\d]/g, ""); // strip non-digits
      });

      // On blur → format with commas
      input.addEventListener("blur", () => {
        if (input.value !== "") {
          input.value = new Intl.NumberFormat("en-AU", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(input.value);
        }
      });
    }
  });
});




/* Percentage Formatter */
function formatPercent(num) {
  return num.toFixed(2) + "%";
}
