const form = document.getElementById("transactionForm");
const title = document.getElementById("title");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const date = document.getElementById("date");

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

const transactionList = document.getElementById("transactionList");
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const themeToggle = document.getElementById("themeToggle");

let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

let barChart;
let pieChart;

/* Save Data */

function saveData() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

/* Add Transaction */

form.addEventListener("submit", function (e) {

    e.preventDefault();
const transaction = {
    id: Date.now(),
    title: title.value.trim(),
    amount: Number(amount.value),
    type: type.value,
    category: category.value,
    date: date.value
};

if (
    !transaction.title ||
    !transaction.amount ||
    !transaction.date
) {
    alert("Please fill all fields");
    return;
}

    transactions.push(transaction);

    saveData();
    displayTransactions();
    updateSummary();
    updateCharts();

    form.reset();
});

/* Display Transactions */

function displayTransactions() {

    transactionList.innerHTML = "";

    let filtered = transactions;

    const searchValue =
    searchInput.value.toLowerCase();

    const filterValue =
    filterType.value;

    filtered = filtered.filter(item =>
    (item.title || "")
    .toLowerCase()
    .includes(searchValue)
);

    if (filterValue !== "all") {
        filtered = filtered.filter(
            item => item.type === filterValue
        );
    }

    filtered.reverse().forEach(item => {

        const li =
        document.createElement("li");

        li.className =
        `transaction ${item.type}`;

        li.innerHTML = `
            <div class="transaction-info">

                <span class="transaction-title">
                    ${item.title}
                </span>

                <span class="transaction-date">
                    ${item.category} • ${item.date}
                </span>

            </div>

            <div class="transaction-right">

                <span class="
                ${item.type === "income"
                ? "amount-income"
                : "amount-expense"}">

                ${item.type === "income"
                ? "+"
                : "-"}₹${item.amount}

                </span>

                <button
                class="delete-btn"
                onclick="deleteTransaction(${item.id})">

                <i class="fa-solid fa-trash"></i>

                </button>

            </div>
        `;

        transactionList.appendChild(li);
    });
}

/* Delete */

function deleteTransaction(id) {

    transactions =
    transactions.filter(
        item => item.id !== id
    );

    saveData();
    displayTransactions();
    updateSummary();
    updateCharts();
}

/* Summary */

function updateSummary() {

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(item => {

        if (item.type === "income") {
            totalIncome += item.amount;
        } else {
            totalExpense += item.amount;
        }
    });

    income.textContent =
    `₹${totalIncome.toLocaleString()}`;

    expense.textContent =
    `₹${totalExpense.toLocaleString()}`;

    balance.textContent =
    `₹${(totalIncome - totalExpense)
    .toLocaleString()}`;
}

/* Search */

searchInput.addEventListener(
    "keyup",
    displayTransactions
);

/* Filter */

filterType.addEventListener(
    "change",
    displayTransactions
);

/* Dark Mode */

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );

        localStorage.setItem(
            "theme",
            document.body.classList.contains(
                "dark"
            )
        );
    }
);

if (
localStorage.getItem("theme")
=== "true"
) {
    document.body.classList.add(
        "dark"
    );
}

/* Charts */

function updateCharts() {

    const incomeData =
    transactions
    .filter(t => t.type === "income")
    .reduce(
        (sum, t) => sum + t.amount,
        0
    );

    const expenseData =
    transactions
    .filter(t => t.type === "expense")
    .reduce(
        (sum, t) => sum + t.amount,
        0
    );

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(
        document.getElementById("barChart"),
        {
            type: "bar",
            data: {
                labels: [
                    "Income",
                    "Expense"
                ],
                datasets: [{
                    data: [
                        incomeData,
                        expenseData
                    ],
                    backgroundColor: [
                        "#22c55e",
                        "#ef4444"
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        }
    );

    const categories = {};
    
    transactions
    .filter(t => t.type === "expense")
    .forEach(t => {

        categories[t.category] =
        (categories[t.category] || 0)
        + t.amount;
    });

    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(
        document.getElementById("pieChart"),
        {
            type: "pie",
            data: {
                labels:
                Object.keys(categories),

                datasets: [{
                    data:
                    Object.values(categories),

                    backgroundColor: [
                        "#7c3aed",
                        "#9333ea",
                        "#06b6d4",
                        "#f97316",
                        "#22c55e",
                        "#ef4444"
                    ]
                }]
            },
            options: {
                responsive: true
            }
        }
    );
}

/* Initial Load */

displayTransactions();
updateSummary();
updateCharts();