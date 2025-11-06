let records = [];

function handleCredentialResponse(response) {
  const payload = parseJwt(response.credential);
  console.log("Logged in as:", payload.email);
  
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("tracker-section").classList.remove("hidden");
  
  window.USER_EMAIL = payload.email; // store for backend
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

window.onload = () => {
  google.accounts.id.initialize({
    client_id: "YOUR_CLIENT_ID_HERE",
    callback: handleCredentialResponse
  });
  google.accounts.id.renderButton(
    document.querySelector(".g_id_signin"),
    { theme: "outline", size: "large" }
  );
  google.accounts.id.prompt(); // shows the One Tap prompt
};

const BACKEND_URL = "https://script.google.com/macros/s/AKfycbx9YGhkoKSwAKLs-MDn6aV3ZSLzuJERndO1uhx1HC4UJPdtaY3BJKCRhzZZF4BR0UHj/exec";
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

  const record = { date, hours, rate, expectedPay: parseFloat(expectedPay), email: window.USER_EMAIL };
  records.push(record);
  renderTable();
  // Send to backend
fetch(BACKEND_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(record)
})
.then(res => res.text())
.then(msg => console.log("Backend:", msg))
.catch(err => console.error("Error:", err));
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


