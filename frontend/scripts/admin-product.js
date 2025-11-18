async function loadProducts() {
  const res = await fetch("http://localhost:8000/products", {
    method: "GET",
  });

  if (!res.ok) {
    console.error("Error fetching products:", res.statusText);
    return;
  }

  
  const body = await res.json();
  console.log("Fetched products:", body);
  
  const products = body.products;
  
  

  

  const container = document.getElementById("items");
  if (!container) {
    console.error("Product list container not found");
    return;
  }

  products.forEach(async (prod) => {
    const category = await fetch(`http://localhost:8000/category/${prod.category_id}`, {
    method: "GET",
  });

  if (!category.ok) {
    console.error("Error fetching categories:", category.statusText);
    return;
  }

  
  const categoryBody = await category.json();


  console.log("Fetched categories:", categoryBody);
    const item = document.createElement("div");
    const icon1 = document.createElement("a");
    const icon2 = document.createElement("a");
    const title = document.createElement("span");
    const sub = document.createElement("span");
    const img = document.createElement("img");
    const price = document.createElement("span");
    const stock = document.createElement("span");
    item.className = "item";
    icon2.className = "icon";
    icon2.href = `admin-product-update.html?id=${prod.product_id}`;
    icon1.className = "icon";
    icon1.href = `admin-product-delete.html?id=${prod.product_id}`;
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

    img.src = `http://localhost:8000/products/images/${prod.image_url}`;
    img.alt = prod.name;
    img.className = "item-img";
    item.appendChild(img);

    title.textContent = `${prod.name}`;
    item.appendChild(title);
    price.textContent = `${prod.price} THB`;
    item.appendChild(price);

    item.appendChild(icon2);
    sub.textContent = `${categoryBody.name} • ${prod.description}` || "No description";
    item.appendChild(sub);

    stock.textContent = `${prod.stock_quantity} QTY`;
    item.appendChild(stock);

    container.appendChild(item);
  });
}



loadProducts();
