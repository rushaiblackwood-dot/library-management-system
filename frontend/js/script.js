// Waiting for page to load first
document.addEventListener("DOMContentLoaded", () => {
  const bookList = document.querySelector(".book-list");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearBtn");

  const API_BASE = "http://127.0.0.1:5000"; 
  // Base URL for Flask backend API

  // Local placeholder images only (backend does not supply images)
  // These are images matching the book items in the SQL
  function pickImageByTitle(title) {
    const t = (title || "").toLowerCase();

    // SQL sample books
    if (t.includes("clean code")) return "assets/clean-code.png";
    if (t.includes("introduction to algorithms")) return "assets/intro-to-algorithms.png";
    if (t.includes("algorithms")) return "assets/intro-to-algorithms.png";

    // Default image for books without a cover
    return "assets/book-placeholder.png";
  }

  function renderItems(items) {
    bookList.innerHTML = "";

    items.forEach((item) => {
      // Support both SQL-style and JSON-style field names safely
      const title = item.Title ?? item.title;
      const author = item.Author ?? item.author ?? "Unknown author";
      const type = item.ItemType ?? item.item_type ?? "";
      const id = item.ItemID ?? item.id;

      const image = pickImageByTitle(title);

      // Using <a> so it navigates to item details page
      const card = document.createElement("a");
      card.className = "book-item";
      card.href = `item.html?id=${encodeURIComponent(id)}`;

      card.innerHTML = `
        <img src="${image}" alt="${title}">
        <h4>${title}</h4>
        <p>${author}</p>
        <span>${type}</span>
      `;

      bookList.appendChild(card);
    });
  }

  async function loadItems() {
    bookList.innerHTML = `<p>Loading items...</p>`;

    try {
      // Fetch items from backend REST API
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const items = await res.json();
      renderItems(items);

    } catch (err) {
      console.error(err);
      bookList.innerHTML = `<p>Could not load items. Is the backend running?</p>`;
    }
  }

  // Search box behaviour 
  searchInput.addEventListener("input", () => {
    clearBtn.style.display = searchInput.value.length > 0 ? "inline" : "none";
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query !== "") {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
      }
    }
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.style.display = "none";
  });

  // Getting arrow buttons and book list
  const leftArrow = document.querySelector(".arrow-btn.left");
  const rightArrow = document.querySelector(".arrow-btn.right");
  const scrollAmount = 160;

  // Disabling arrows if they are missing
  if (leftArrow && rightArrow) {
    leftArrow.addEventListener("click", () => {
      bookList.scrollLeft -= scrollAmount;
    });

    rightArrow.addEventListener("click", () => {
      bookList.scrollLeft += scrollAmount;
    });
  }

  // Loading everything when page opens
  loadItems();
});


// Logout logic
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  // If the logout button exists on this page
  if (logoutBtn) {

    // Hide logout button if user is not logged in
    if (!localStorage.getItem("memberId")) {
      logoutBtn.style.display = "none";
      return;
    }

    // Handle logout click
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("memberId");
      localStorage.removeItem("loggedIn");

      // Redirect after logout
      window.location.href = "index.html";
    });
  }
});
