// Waiting for page to load first
document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "http://127.0.0.1:5000";

  // Local placeholder images only (backend does not supply images)
  // These are temporary and we can swap them later to match the sql books properly
  function pickImageByTitle(title) {
    const t = (title || "").toLowerCase();

    // SQL sample books
    if (t.includes("clean code")) return "assets/clean-code.png";
    if (t.includes("introduction to algorithms")) return "assets/intro-to-algorithms.png";
    if (t.includes("algorithms")) return "assets/intro-to-algorithms.png";

    // Fallback image for anything else
    return "assets/book-placeholder.png";
  }

  // Getting item id from url 
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("id");

  // If no id in url then stopping
  if (!itemId) {
    alert("no item id provided");
    return;
  }

  // Getting member id from local storage (set at login)
  const memberId = localStorage.getItem("memberId");

  // Page elements
  const itemTitle = document.getElementById("itemTitle");
  const itemAuthor = document.getElementById("itemAuthor");
  const itemType = document.getElementById("itemType");
  const itemImage = document.getElementById("itemImage");
  const copiesTable = document.getElementById("copiesTable");
  const reservationList = document.getElementById("reservationList");
  const reserveBtn = document.getElementById("reserveBtn");
  const itemMessage = document.getElementById("itemMessage");

  // loading item basic information
  async function loadItemInfo() {
    try {
      const res = await fetch(`${API_BASE}/items/${itemId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const item = await res.json();

      // Safe field access for backend variations
      const title = item.Title ?? item.title;
      const author = item.Author ?? item.author ?? "unknown";
      const type = item.ItemType ?? item.item_type ?? "";

      itemTitle.textContent = title;
      itemAuthor.textContent = `author: ${author}`;
      itemType.textContent = `type: ${type}`;

      // Setting the image based on the item title
      itemImage.src = pickImageByTitle(title);

    } catch (err) {
      console.error(err);
      itemTitle.textContent = "item not found";
      itemAuthor.textContent = "";
      itemType.textContent = "";
      itemImage.src = "assets/book-placeholder.png";
    }
  }

  //Loading copies for this item
  async function loadCopies() {
    copiesTable.innerHTML = "";

    try {
      const res = await fetch(`${API_BASE}/items/${itemId}/copies`);
      const data = await res.json();

      if (!res.ok) {
        copiesTable.innerHTML = `<tr><td colspan="3">${data.error}</td></tr>`;
        return;
      }

      // Track if any copy is available
      let hasAvailableCopy = false;

      data.copies.forEach(copy => {
        const row = document.createElement("tr");

        const statusClass =
          copy.Status === "Available"
            ? "status-available"
            : "status-unavailable";

        if (copy.Status === "Available") {
          hasAvailableCopy = true;
        }

        row.innerHTML = `
          <td>${copy.BranchName}</td>
          <td class="${statusClass}">${copy.Status}</td>
          <td>
            ${
              copy.Status === "Available" && memberId
                ? `<button class="borrow-btn" data-copy="${copy.CopyID}">borrow</button>`
                : `<button disabled>unavailable</button>`
            }
          </td>
        `;

        copiesTable.appendChild(row);
      });

      // Disable reserve button if borrowing is possible
      reserveBtn.disabled = hasAvailableCopy;

    } catch (err) {
      console.error(err);
      copiesTable.innerHTML = "<tr><td colspan='3'>no copies found</td></tr>";
    }
  }

  // Borrowing a copy
  async function borrowCopy(copyId) {
    itemMessage.style.color = "red";
    itemMessage.textContent = "";

    if (!memberId) {
      itemMessage.textContent = "please log in to borrow";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/loans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          copy_id: copyId,
          member_id: memberId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        itemMessage.textContent = data.error;
        return;
      }

      itemMessage.style.color = "green";
      itemMessage.textContent = "item borrowed successfully";

      // Refreshing copies after borrowing
      loadCopies();

    } catch (err) {
      console.error(err);
      itemMessage.textContent = "error borrowing item";
    }
  }

  // Listening for borrow button clicks
  copiesTable.addEventListener("click", (e) => {
    if (e.target.classList.contains("borrow-btn")) {
      const copyId = e.target.dataset.copy;
      borrowCopy(copyId);
    }
  });

  // loading reservations
  async function loadReservations() {
    reservationList.innerHTML = "";

    try {
      const res = await fetch(`${API_BASE}/items/${itemId}/reservations`);
      const data = await res.json();

      if (!res.ok) {
        reservationList.innerHTML = `<li>${data.error}</li>`;
        return;
      }

      if (data.reservations.length === 0) {
        reservationList.innerHTML = "<li>no reservations</li>";
        return;
      }

      data.reservations.forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${r.FirstName} ${r.LastName} - ${r.ReservationDate}`;
        reservationList.appendChild(li);
      });

    } catch (err) {
      console.error(err);
      reservationList.innerHTML = "<li>could not load reservations</li>";
    }
  }

  // reserving this item
  reserveBtn.addEventListener("click", async () => {
    itemMessage.style.color = "red";
    itemMessage.textContent = "";

    if (!memberId) {
      itemMessage.textContent = "please log in to reserve";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: itemId,
          member_id: memberId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        itemMessage.textContent = data.error;
        return;
      }

      itemMessage.style.color = "green";
      itemMessage.textContent = "item reserved successfully";

      // refreshing reservations after reserving
      loadReservations();

    } catch (err) {
      console.error(err);
      itemMessage.textContent = "error reserving item";
    }
  });

  // loading everything when page opens
  loadItemInfo();
  loadCopies();
  loadReservations();
});

// logout logic
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  // if the logout button exists on this page
  if (logoutBtn) {

    // hide logout button if user is not logged in
    if (!localStorage.getItem("memberId")) {
      logoutBtn.style.display = "none";
      return;
    }

    // handle logout click
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("memberId");
      localStorage.removeItem("loggedIn");

      // redirect after logout
      window.location.href = "index.html";
    });
  }
});
