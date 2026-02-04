// =====================================
// ✅ CONFIG (Change later when deployed)
// =====================================
const BASE_URL = "https://swathi-fitness-world.onrender.com/api/auth";
const BOOKING_URL = "https://swathi-fitness-world.onrender.com/api/bookings";


// =====================================
// ✅ HELPERS
// =====================================
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function setMessage(el, msg, type = "success") {
  if (!el) return;

  el.style.display = "block";
  el.style.marginTop = "12px";
  el.style.textAlign = "center";
  el.style.fontWeight = "600";
  el.style.color = type === "success" ? "lime" : "red";
  el.innerText = msg;
}

// ✅ Logout function used in dashboards
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "auth.html";
}

// =====================================
// ✅ BOOKING MODAL (index.html)
// =====================================
const openBooking = document.getElementById("openBooking");
const closeBooking = document.getElementById("closeBooking");
const bookingModal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const trainerSelect = document.getElementById("trainerSelect");

// ✅ Create a booking message element dynamically (inside modal)
let bookingMsg = document.getElementById("bookingMsg");
if (!bookingMsg && bookingForm) {
  bookingMsg = document.createElement("p");
  bookingMsg.id = "bookingMsg";
  bookingForm.appendChild(bookingMsg);
}

// ✅ Open modal button
if (openBooking && bookingModal) {
  openBooking.addEventListener("click", () => {
    bookingModal.style.display = "flex";
  });
}

// ✅ Close modal button
if (closeBooking && bookingModal) {
  closeBooking.addEventListener("click", () => {
    bookingModal.style.display = "none";
  });
}

// ✅ Close on outside click
if (bookingModal) {
  window.addEventListener("click", (e) => {
    if (e.target === bookingModal) {
      bookingModal.style.display = "none";
    }
  });
}

// ✅ Auto-open booking modal from trainers.html
// Example URL: index.html?book=1&trainer=Arjun%20Patel
if (bookingModal) {
  const urlParams = new URLSearchParams(window.location.search);
  const openBook = urlParams.get("book");
  const trainerName = urlParams.get("trainer");

  if (openBook === "1") {
    bookingModal.style.display = "flex";

    if (trainerName && trainerSelect) {
      for (let option of trainerSelect.options) {
        if (option.text.trim() === trainerName.trim()) {
          option.selected = true;
          break;
        }
      }
    }

    // ✅ clean url after opening
    window.history.replaceState({}, document.title, "index.html");
  }
}

// ✅ Submit booking (FRONTEND VALIDATION ONLY)
// Later we will connect booking to MongoDB via backend
if (bookingForm && bookingModal) {
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = getCurrentUser();

    // ✅ If no login → force login
    if (!user) {
      setMessage(bookingMsg, "❌ Please login first to book a session!", "error");

      setTimeout(() => {
        bookingModal.style.display = "none";
        window.location.href = "auth.html";
      }, 1200);

      return;
    }

    // ✅ Only members can book session (trainer/owner not needed)
    if (user.role !== "member") {
      setMessage(
        bookingMsg,
        "❌ Only Members can book sessions. Please login as a Member.",
        "error"
      );
      return;
    }

    // ✅ Booking confirmed (frontend only)
    setMessage(bookingMsg, "✅ Booking submitted successfully!", "success");

    setTimeout(() => {
      bookingModal.style.display = "none";
      bookingForm.reset();
      bookingMsg.innerText = "";
    }, 1200);
  });
}

// =====================================
// ✅ AUTH (auth.html)
// =====================================
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");
const message = document.getElementById("message");

// ✅ Toggle to Signup
if (showSignup && loginForm && signupForm && message) {
  showSignup.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    message.innerText = "";
  });
}

// ✅ Toggle to Login
if (showLogin && loginForm && signupForm && message) {
  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    signupForm.style.display = "none";
    loginForm.style.display = "block";
    message.innerText = "";
  });
}

// ✅ SIGNUP (MongoDB)
if (signupForm && message) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(signupForm);

    const user = {
      name: fd.get("name"),
      email: fd.get("email"),
      password: fd.get("password"),
      role: fd.get("role"),
    };

    try {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      message.style.color = res.ok ? "lime" : "red";
      message.innerText = data.msg || "Something went wrong!";

      if (res.ok) {
        signupForm.reset();

        setTimeout(() => {
          signupForm.style.display = "none";
          loginForm.style.display = "block";
          message.innerText = "";
        }, 1200);
      }
    } catch (err) {
      message.style.color = "red";
      message.innerText = "❌ Backend not running! Start backend first.";
    }
  });
}

// ✅ LOGIN (MongoDB)
if (loginForm && message) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(loginForm);

    const payload = {
      email: fd.get("email"),
      password: fd.get("password"),
      role: fd.get("role"),
    };

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      message.style.color = res.ok ? "lime" : "red";
      message.innerText = data.msg || "Login failed!";

      if (res.ok) {
        console.log("✅ Logged in user:", data.user);

        // ✅ Save logged user
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        // ✅ Redirect based on role
        setTimeout(() => {
          if (data.user.role === "member") window.location.href = "user-dashboard.html";
          else if (data.user.role === "trainer") window.location.href = "trainer-dashboard.html";
          else if (data.user.role === "owner") window.location.href = "owner-dashboard.html";
          else window.location.href = "index.html";
        }, 800);
      }
    } catch (err) {
      message.style.color = "red";
      message.innerText = "❌ Backend not running! Start backend first.";
    }
  });
}
