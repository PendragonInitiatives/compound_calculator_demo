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
function formatCurrency(num) {
  return "$" + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/* Percentage Formatter */
function formatPercent(num) {
  return num.toFixed(2) + "%";
}
