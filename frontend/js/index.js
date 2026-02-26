// waiting for page to load first
document.addEventListener("DOMContentLoaded", () => {
  const bookList = document.querySelector(".book-list");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearBtn");

  const API_BASE = "http://127.0.0.1:5000";

  // local placeholder images only (backend does not supply images)
  // these are images matchign the book items in the sql
  function pickImageByTitle(title) {
    const t = (title || "").toLowerCase();

    // sql sample books
    if (t.includes("clean code")) return "assets/clean-code.png";
    if (t.includes("introduction to algorithms")) return "assets/intro-to-algorithms.png";
    if (t.includes("algorithms")) return "assets/intro-to-algorithms.png";

    // default image for books without a cover
    return "assets/book-placeholder.png";
  }

  function renderItems(items) {
    bookList.innerHTML = "";

    items.forEach((item) => {
      const image = pickImageByTitle(item.Title);

      // using <a> so it navigates to item details page
      const card = document.createElement("a");
      card.className = "book-item";
      card.href = `item.html?id=${encodeURIComponent(item.ItemID)}`;

      card.innerHTML = `
        <img src="${image}" alt="${item.Title}">
        <h4>${item.Title}</h4>
        <p><strong>Author:</strong> ${item.Author ?? "Unknown Author"}</p>
        <span><strong>Type:</strong> ${item.ItemType ?? ""}</span>
      `;

      bookList.appendChild(card);
    });
  }

  async function loadItems() {
    bookList.innerHTML = `<p>Loading items...</p>`;

    try {
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const items = await res.json();
      renderItems(items);
    } catch (err) {
      console.error(err);
      bookList.innerHTML = `<p>Could not load items. Is the backend running?</p>`;
    }
  }

  // search box behaviour 
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

  // getting arrow buttons and book list
  const leftArrow = document.querySelector(".arrow-btn.left");
  const rightArrow = document.querySelector(".arrow-btn.right");
  const scrollAmount = 160;

  // disabling arrows if they are missing
  if (leftArrow && rightArrow) {
    leftArrow.addEventListener("click", () => {
      bookList.scrollLeft -= scrollAmount;
    });

    rightArrow.addEventListener("click", () => {
      bookList.scrollLeft += scrollAmount;
    });
  }

  // loading everything when page opens
  loadItems();

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
