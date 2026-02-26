// waiting for page to load first
document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "http://127.0.0.1:5000";

  // getting elements from the page
  const resultsGrid = document.getElementById("resultsGrid");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearBtn");
  const resultsCount = document.getElementById("resultsCount");

  // read search query from URL
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  // local placeholder images only
  function pickImageByTitle(title) {
    const t = (title || "").toLowerCase();

    if (t.includes("clean code")) return "assets/clean-code.png";
    if (t.includes("introduction to algorithms")) return "assets/intro-to-algorithms.png";
    if (t.includes("algorithms")) return "assets/intro-to-algorithms.png";

    return "assets/book-placeholder.png";
  }

  let allItems = [];

  function renderBooks(items) {
    resultsGrid.innerHTML = "";

    if (items.length === 0) {
      resultsCount.textContent = "No Items Found";
      return;
    }

    resultsCount.textContent =
      items.length === 1
        ? "1 item found"
        : `${items.length} items found`;

    items.forEach((item) => {
      const title = item.Title ?? item.title ?? "";
      const author = item.Author ?? item.author ?? "Unknown Author";
      const type = item.ItemType ?? item.item_type ?? "";
      const id = item.ItemID ?? item.id;

      const image = pickImageByTitle(title);

      const book = document.createElement("a");
      book.className = "book-item";
      book.href = `item.html?id=${encodeURIComponent(id)}`;

      book.innerHTML = `
        <img src="${image}" alt="${title}">
        <div class="book-details">
          <h4>${title}</h4>
          <p>Author: ${author}</p>
          <span>${type}</span>
        </div>
      `;

      resultsGrid.appendChild(book);
    });
  }

  function filterAndRender(query) {
    const q = query.toLowerCase();

    const filtered = allItems.filter(item => {
      const title = item.Title ?? item.title ?? "";
      const author = item.Author ?? item.author ?? "";
      return (
        title.toLowerCase().includes(q) ||
        author.toLowerCase().includes(q)
      );
    });

    renderBooks(filtered);
  }

  async function loadItems() {
    resultsGrid.innerHTML = "<p>Loading items...</p>";

    try {
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      allItems = await res.json();

      searchInput.value = initialQuery;
      clearBtn.style.display = initialQuery ? "inline" : "none";

      filterAndRender(initialQuery);

    } catch (err) {
      console.error(err);
      resultsGrid.innerHTML =
        "<p>Could not load items. Is the backend running?</p>";
    }
  }

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    clearBtn.style.display = query ? "inline" : "none";
    filterAndRender(query);
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.style.display = "none";
    renderBooks(allItems);
  });

  loadItems();
});


// logout logic
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  const isLoggedIn =
    localStorage.getItem("loggedIn") === "true" &&
    localStorage.getItem("memberId");

  if (!isLoggedIn) {
    logoutBtn.style.display = "none";
    return;
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("memberId");
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
  });
});
