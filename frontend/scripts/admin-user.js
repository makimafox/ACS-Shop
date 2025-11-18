async function loadUsers() {
  const res = await fetch("http://localhost:8000/users", {
    method: "GET",
  });

  if (!res.ok) {
    console.error("Error fetching users:", res.statusText);
    return;
  }

  const body = await res.json();
  console.log("Fetched users:", body);

  const users = body;

  const container = document.getElementById("items");
  if (!container) {
    console.error("User list container not found");
    return;
  }

  users.forEach((user) => {
    const item = document.createElement("div");
    const icon1 = document.createElement("a");
    const title = document.createElement("span");
    const email = document.createElement("span");
    const role = document.createElement("span");
    const address = document.createElement("span");
    item.className = "item";
    icon1.className = "icon";
    icon1.className = "item-span";
    icon1.href = `admin-user-delete.html?id=${user.user_id}`;
    title.className = "item-title";
    email.className = "item-sub";
    role.className = "badge";
    address.className = "item-sub";

    icon1.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" 
       width="24" height="24" 
       viewBox="0 0 24 24" 
       fill="none" 
       stroke="currentColor" 
       stroke-width="2" 
       stroke-linecap="round" 
       stroke-linejoin="round" 
       class="lucide lucide-x-icon lucide-x">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
    `;
    item.appendChild(icon1);

    title.textContent = `${user.name}`;
    item.appendChild(title);
    role.textContent = user.role;
    item.appendChild(role);
    email.textContent = `${user.email}`;
    item.appendChild(email);
    address.textContent = `${user.address || "No address provided"}`;
    item.appendChild(address);

    container.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadUsers().catch((err) => {
    console.error("Error loading users:", err);
  });
});