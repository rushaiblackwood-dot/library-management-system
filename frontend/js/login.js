// wait for page to load
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const logoutBtn = document.getElementById("logoutBtn");

  /* =========================
     LOGIN LOGIC
     ========================= */

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent page refresh

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      // Mock login
      // Matches members in the database

      // Abraham Sharkey (MemberID = 1)
      if (email === "abraham@mail.com" && password === "password123") {
        loginMessage.textContent = "Login successful! Redirecting...";
        loginMessage.style.color = "green";

        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("memberId", "1");

        setTimeout(() => {
          window.location.href = "member.html";
        }, 1000);

      // Malaika Noor (MemberID = 2)
      } else if (email === "malaika@mail.com" && password === "password123") {
        loginMessage.textContent = "Login successful! Redirecting...";
        loginMessage.style.color = "green";

        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("memberId", "2");

        setTimeout(() => {
          window.location.href = "member.html";
        }, 1000);

      } else {
        loginMessage.textContent = "Invalid email or password";
        loginMessage.style.color = "red";
      }
    });
  }

  /* =========================
     LOGOUT LOGIC
     ========================= */

  if (logoutBtn) {
    // Hide logout button if user is not logged in
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
