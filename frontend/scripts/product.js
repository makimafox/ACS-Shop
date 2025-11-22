async function product() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    console.error("No product id in URL");
    return;
  }

  let res;
  try {
    res = await fetch(`http://localhost:8000/products/${id}`);
  } catch (e) {
    console.error("Network error fetching product:", e);
    return;
  }

  if (!res.ok) {
    console.error("Error fetching product:", res.statusText);
    return;
  }

  const body = await res.json();
  const product = body.product;

  if (!product) {
    console.error("Product not found");
    return;
  }

  // -----------------------------
  // Update product info in DOM
  // -----------------------------
  document.getElementById("product_title").textContent = product.name;
  document.getElementById("breadcrumb-product").textContent = product.name;
  document.getElementById("product_price").innerHTML = `THB <span>${product.price}</span>`;
  document.getElementById("product_stock").textContent = `${product.stock_quantity} in stock`;
  document.getElementById("product_details").textContent = product.description;
  document.getElementById("product_image").src =
    `http://localhost:8000/products/images/${product.image_url}`;

  // -----------------------------
  // Fetch Category
  // -----------------------------
  try {
    const categoriesRes = await fetch(
      `http://localhost:8000/category/${product.category_id}`
    );

    if (!categoriesRes.ok) {
      console.error("Category fetch failed:", categoriesRes.statusText);
    } else {
      const categoriesBody = await categoriesRes.json();
      const category = categoriesBody;
      document.getElementById("product_category").textContent =
        category.name;
    }
  } catch (err) {
    console.error("Network error fetching categories:", err);
  }

  console.log("Fetched product:", product);
}

product();



document.getElementById("qty-minus").addEventListener("click", () => {
  const qtyNumberEl = document.getElementById("qty-number");
  let currentQty = parseInt(qtyNumberEl.textContent, 10);
  if (currentQty > 1) {
    currentQty -= 1;
    qtyNumberEl.textContent = currentQty;
  }
});

document.getElementById("qty-plus").addEventListener("click", () => {
  const qtyNumberEl = document.getElementById("qty-number");
  let currentQty = parseInt(qtyNumberEl.textContent, 10);
  currentQty += 1;
  qtyNumberEl.textContent = currentQty;
});


function addToCart() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10); // id as number

  const qtyNumberEl = document.getElementById("qty-number");
  const qtyToAdd = parseInt(qtyNumberEl.textContent, 10);

  if (isNaN(id)) {
    console.error("Invalid product ID");
    return;
  }

  // Get current product stock from DOM
  const stockEl = document.getElementById("product_stock");
  const stockMatch = stockEl.textContent.match(/\d+/); // extract number
  const stock = stockMatch ? parseInt(stockMatch[0], 10) : 0;

  const productPriceEl = document.getElementById("product_price").querySelector("span");
  const productPrice = productPriceEl ? parseFloat(productPriceEl.textContent) : 0;

  

  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if product exists in cart
  const existing = cart.find(item => item.id === id);

  const currentQtyInCart = existing ? existing.qty : 0;
  const totalQty = currentQtyInCart + qtyToAdd;

  if (totalQty > stock) {
    alert(`Cannot add ${qtyToAdd} items. Only ${stock - currentQtyInCart} left in stock.`);
    return;
  }

  if (existing) {
    existing.qty = totalQty; // update quantity
  } else {
    cart.push({ id, qty: qtyToAdd, price: productPrice }); // add new item
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  console.log("Cart:", cart);
  alert("Added to cart!");
}

