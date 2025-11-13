function openNav() {
  const overlay = document.getElementById("sidenav-overlay");
  const menu = document.getElementById("sidenav-menu");
  if (overlay && menu) {
    overlay.classList.add("open");
    menu.classList.add("open");
  }
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  const overlay = document.getElementById("sidenav-overlay");
  const menu = document.getElementById("sidenav-menu");
  const indicator = document.getElementById("indicator");
  if (overlay && menu && indicator) {
    overlay.classList.remove("open");
    menu.classList.remove("open");
    indicator.style.transform = "rotate(0deg)";
    const submenu = document.getElementById("submenu-shop");
    if (submenu) {
      submenu.classList.remove("open");
    }
  }
}

function toggleNav() {
  const menu = document.getElementById("sidenav-menu");
  const overlay = document.getElementById("sidenav-overlay");
  if (!menu || !overlay) return;
  const isOpen = menu.classList.contains("open");
  if (isOpen) closeNav();
  else openNav();
}

function toggleSubmenu() {
  const submenu = document.getElementById("submenu-shop");
  const indicator = document.getElementById("indicator");
  if (!submenu || !indicator) return;
  const isOpen = submenu.classList.contains("open");
  if (isOpen) {
    submenu.classList.remove("open");
    indicator.style.transform = "rotate(0deg)";
  } else {
    submenu.classList.add("open");
    indicator.style.transform = "rotate(90deg)";
  }
}

function accountopen() {
  const btn = document.getElementById("account-btn");
  const menu = document.getElementById("account-dropdown");

  // Toggle dropdown on button click
  btn.addEventListener("click", function (e) {
    // e.stopPropagation();
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  // Prevent clicks inside menu from closing it
  // menu.addEventListener("click", function (e) {
  //   e.stopPropagation();
  // });

  // // Close when clicking outside or pressing Escape
  // document.addEventListener("click", function () {
  //   menu.style.display = "none";
  // });
}

// Initialize account dropdown listeners immediately so a single click toggles it.
// This avoids the need to first call `accountopen()` from an inline onclick.
(function initAccountDropdown() {
  const btn = document.getElementById("account-btn");
  const menu = document.getElementById("account-dropdown");
  if (!btn || !menu) return;

  // Toggle dropdown on button click
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  });

  // Prevent clicks inside menu from closing it
  menu.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Close when clicking outside
  document.addEventListener("click", function () {
    menu.style.display = "none";
  });

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") menu.style.display = "none";
  });
})();

function signout() {
  localStorage.removeItem("token");
  window.location.href = "./index.html";
}

const signoutButton = document.getElementById("signout-btn");
const signoutLinkButton = document.getElementById("signout-link-btn");
if (localStorage.getItem("token")) {
  signoutLinkButton.style.display = "block";
  signoutLinkButton.addEventListener("click", signout);
  signoutButton.style.display = "block";
  signoutButton.addEventListener("click", signout);
} else {
  signoutLinkButton.style.display = "none";
  signoutButton.style.display = "none";
}


// Admin link visibility
const adminLink = document.getElementById("admin-link");
const token = localStorage.getItem("token");
if (token) {
  const payload = JSON.parse(atob(token.split(".")[1]));
  if (payload.role && payload.role === "admin") {
    adminLink.style.display = "block";
  } else {
    adminLink.style.display = "none";
  }
} else {
  adminLink.style.display = "none";
}


const categorysubmenu = document.getElementById("submenu-shop");
fetch("http://localhost:8000/category?limit=5")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((category) => {
      const categoryLink = document.createElement("a");
      categoryLink.href = `#`;
      categoryLink.textContent = category.name;
      categorysubmenu.appendChild(categoryLink);
    });
  })
  .catch((error) => {
    console.error("Error fetching categories:", error);
  });