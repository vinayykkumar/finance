document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transactionForm");
  const transactionsDiv = document.getElementById("transactions");

  const loadTransactions = async () => {
    const response = await fetch("http://127.0.0.1:5000/list");
    const transactions = await response.json();

    transactionsDiv.innerHTML = "<h3>Recent Transactions:</h3><ul>" +
      transactions.map(tx =>
        `<li>${tx.date} - ${tx.description}: ₹${tx.amount}</li>`
      ).join('') + "</ul>";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      description: document.getElementById("description").value,
      amount: parseFloat(document.getElementById("amount").value),
      date: document.getElementById("date").value
    };

    await fetch("http://127.0.0.1:5000/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    form.reset();
    loadTransactions();
  });

  loadTransactions();
});
