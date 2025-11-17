async function loadCategory() {
  const res = await fetch("http://localhost:8000/category", {
    method: "GET",
  });

  if (!res.ok) {
    console.error("Error fetching categories:", res.statusText);
    return;
  }

  // ต้องแปลง response เป็น JSON
  const body = await res.json();

  console.log("Fetched categories:", body);

  const categories = body;

  const container = document.getElementById("items");
  if (!container) {
    console.error("Category list container not found");
    return;
  }

  categories.forEach((cat) => {
    const item = document.createElement("div");
    const icon1 = document.createElement("a");
    const icon2 = document.createElement("a");
    const title = document.createElement("span");
    const sub = document.createElement("span");
    item.className = "item";
    icon2.className = "icon";
    icon2.href = `admin-category-update.html?id=${cat.category_id}`;
    icon1.className = "icon";
    icon1.href = `admin-category-delete.html?id=${cat.category_id}`;
    title.className = "item-title";
    sub.className = "item-sub";

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

    icon2.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`;

    item.appendChild(icon1);
    title.textContent = cat.name;
    item.appendChild(title);

    item.appendChild(icon2);
    sub.textContent = cat.description || "No description";
    item.appendChild(sub);

    container.appendChild(item);
  });
}

loadCategory();
