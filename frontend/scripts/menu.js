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

function signout() {
  localStorage.removeItem("token");
  window.location.href = "./landing.html";
}

function signin() {
  window.location.href = "./signin.html";
}

const signoutButton = document.getElementById("signout-btn");
const signinButton = document.getElementById("signin-btn");
const signoutLinkButton = document.getElementById("signout-link-btn");
const signinLinkButton = document.getElementById("signin-link-btn");
const accountSettingsLink = document.getElementById("account-settings-link");
const orderHistoryLink = document.getElementById("order-history-link");
const accountSettingsBtn = document.getElementById("account-settings-btn");
const orderHistoryBtn = document.getElementById("order-history-btn");

if (localStorage.getItem("token")) {
  signinButton.style.display = "none";
  signinLinkButton.style.display = "none";
  accountSettingsLink.style.display = "block";
  accountSettingsBtn.style.display = "block";
  orderHistoryLink.style.display = "block";
  orderHistoryBtn.style.display = "block";
  signoutLinkButton.style.display = "block";
  signoutLinkButton.addEventListener("click", signout);
  signoutButton.style.display = "block";
  signoutButton.addEventListener("click", signout);
} else {
  signinButton.style.display = "block";
  signinLinkButton.style.display = "block";
  accountSettingsLink.style.display = "none";
  accountSettingsBtn.style.display = "none";
  orderHistoryLink.style.display = "none";
  orderHistoryBtn.style.display = "none";
  signinButton.addEventListener("click", signin);
  signinLinkButton.addEventListener("click", signin);
  signoutLinkButton.style.display = "none";
  signoutButton.style.display = "none";
}

// Admin link visibility
const adminLink = document.getElementById("admin-link");
const token = localStorage.getItem("token");
if (token) {
  const payload = JSON.parse(atob(token.split(".")[1]));
  console.log("User payload:", payload);
  if (payload.role && payload.role === "admin") {
    adminLink.style.display = "block";
  } else {
    adminLink.style.display = "none";
  }
} else {
  adminLink.style.display = "none";
}

const categorysubmenu = document.getElementById("submenu-shop");
fetch("http://localhost:8000/category")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((category) => {
      const categoryLink = document.createElement("a");
      categoryLink.href = `./shop.html?category=${category.category_id}`;
      categoryLink.textContent = category.name;
      categorysubmenu.appendChild(categoryLink);
    });
  })
  .catch((error) => {
    console.error("Error fetching categories:", error);
  });

function AccountDropdown() {
  const dropdown = document.getElementById("account-dropdown");
  if (!dropdown) return;
  const isOpen = dropdown.classList.contains("open");
  if (isOpen) {

    dropdown.classList.remove("open");
  } else {
    dropdown.classList.add("open");
  }
}



