// Waiting for page to load first
document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "http://127.0.0.1:5000";

  // Getting member ID from local storage (set at login)
  const memberId = localStorage.getItem("memberId");

  // If no member ID (user hasn’t logged in yet), redirect to login
  if (!memberId) {
    window.location.href = "login.html";
    return;
  }

  // Getting elements from the page
  const nameEl = document.getElementById("memberName");
  const emailEl = document.getElementById("memberEmail");
  const phoneEl = document.getElementById("memberPhone");
  const loansTable = document.getElementById("loansTable");
  const messageEl = document.getElementById("accountMessage");

  // Reservations table reference
  const reservationsTable = document.getElementById("reservationsTable");

  // Loading member summary from backend
  async function loadAccount() {
    loansTable.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;
    messageEl.textContent = "";

    try {
      const res = await fetch(`${API_BASE}/members/${memberId}`);
      const data = await res.json();

      if (!res.ok) {
        loansTable.innerHTML = `<tr><td colspan="4">${data.error}</td></tr>`;
        return;
      }

      // Safe field access
      const firstName = data.FirstName ?? data.first_name ?? "";
      const lastName = data.LastName ?? data.last_name ?? "";
      const email = data.Email ?? data.email ?? "";
      const phone = data.Phone ?? data.phone ?? "N/A";

      // Rendering member info
      nameEl.textContent = `${firstName} ${lastName}`;
      emailEl.textContent = `Email: ${email}`;
      phoneEl.textContent = `Phone: ${phone}`;

      // Rendering loans table
      loansTable.innerHTML = "";

      if (!data.active_loans || data.active_loans.length === 0) {
        loansTable.innerHTML = `<tr><td colspan="4">No active loans</td></tr>`;
        return;
      }

      data.active_loans.forEach(loan => {
        const title = loan.Title ?? loan.title ?? "";
        const dueDate = loan.DueDate ?? loan.due_date ?? "";
        const loanId = loan.LoanID ?? loan.loan_id;
        const isOverdue = loan.is_overdue;
        const daysOverdue = loan.days_overdue;

        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${title}</td>
          <td>${dueDate}</td>
          <td class="${isOverdue ? "status-overdue" : "status-ok"}">
            ${isOverdue ? `Overdue (${daysOverdue} days)` : "On time"}
          </td>
          <td>
            <button class="return-btn" data-loan="${loanId}">Return</button>
          </td>
        `;

        loansTable.appendChild(row);
      });

    } catch (err) {
      console.error(err);
      loansTable.innerHTML =
        `<tr><td colspan="4">Could not load account. Is the backend running?</td></tr>`;
    }
  }

  // load reservations
  async function loadReservations() {
    try {
      const res = await fetch(`${API_BASE}/members/${memberId}/reservations`);
      const data = await res.json();

      reservationsTable.innerHTML = "";

      if (!data.reservations || data.reservations.length === 0) {
        reservationsTable.innerHTML =
          `<tr><td colspan="2">No active reservations</td></tr>`;
        return;
      }

      data.reservations.forEach(r => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${r.Title}</td>
          <td>${r.ReservationDate}</td>
        `;
        reservationsTable.appendChild(row);
      });

    } catch (err) {
      console.error(err);
      reservationsTable.innerHTML =
        `<tr><td colspan="2">Could not load reservations</td></tr>`;
    }
  }

  // Returning a loan
  async function returnLoan(loanId) {
    messageEl.style.color = "red";
    messageEl.textContent = "";

    try {
      const res = await fetch(`${API_BASE}/loans/${loanId}/return`, {
        method: "PUT"
      });

      const data = await res.json();

      if (!res.ok) {
        messageEl.textContent = data.error;
        return;
      }

      messageEl.style.color = "green";
      messageEl.textContent = data.message;

      loadAccount();
      loadReservations();

    } catch (err) {
      console.error(err);
      messageEl.textContent = "Error returning item";
    }
  }

  // Listening for return button clicks
  loansTable.addEventListener("click", (e) => {
    if (e.target.classList.contains("return-btn")) {
      const loanId = e.target.dataset.loan;
      returnLoan(loanId);
    }
  });

  // load both sections
  loadAccount();
  loadReservations();
});


// Logout logic
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    if (!localStorage.getItem("memberId")) {
      logoutBtn.style.display = "none";
      return;
    }

    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("memberId");
      localStorage.removeItem("loggedIn");
      window.location.href = "index.html";
    });
  }
});
