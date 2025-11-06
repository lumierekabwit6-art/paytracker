let records = [];
const tableBody = document.querySelector("#records-table tbody");
const totalPayElem = document.getElementById("total-pay");
const differenceMessage = document.getElementById("difference-message");
const chartCanvas = document.getElementById("pay-chart");

document.getElementById("add-entry").addEventListener("click", () => {
  const date = document.getElementById("work-date").value;
  const hours = parseFloat(document.getElementById("work-hours").value);
  const rate = parseFloat(document.getElementById("daily-rate").value);

  if (!date || isNaN(hours) || isNaN(rate)) {
    alert("Please enter valid details for all fields.");
    return;
  }

  const expectedPay = ((hours / 4.5) * rate).toFixed(2);

  const record = { date, hours, rate, expectedPay: parseFloat(expectedPay) };
  records.push(record);
  renderTable();
});

function renderTable() {
  tableBody.innerHTML = "";
  let total = 0;
  records.forEach(r => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.date}</td>
      <td>${r.hours}</td>
      <td>${r.rate}</td>
      <td>R${r.expectedPay}</td>
    `;
    tableBody.appendChild(row);
    total += r.expectedPay;
  });
  totalPayElem.textContent = total.toFixed(2);
  drawChart();
}

document.getElementById("check-difference").addEventListener("click", () => {
  const actual = parseFloat(document.getElementById("actual-pay").value);
  const expected = parseFloat(totalPayElem.textContent);

  if (isNaN(actual)) {
    alert("Enter your actual pay first.");
    return;
  }

  const diff = actual - expected;
  if (Math.abs(diff) < 1) {
    differenceMessage.textContent = "✅ Pay matches perfectly!";
    differenceMessage.style.color = "green";
  } else if (diff > 0) {
    differenceMessage.textContent = ⚠️ Overpaid by R${diff.toFixed(2)}`;
    differenceMessage.style.color = "orange";
  } else {
    differenceMessage.textContent = `❌ Underpaid by R${Math.abs(diff).toFixed(2)}`;
    differenceMessage.style.color = "red";
  }
});

function drawChart() {
  const labels = records.map(r => r.date);
  const data = records.map(r => r.expectedPay);

  new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Expected Pay (R)",
        data,
        backgroundColor: "rgba(0, 123, 255, 0.5)",
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
