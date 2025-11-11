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
