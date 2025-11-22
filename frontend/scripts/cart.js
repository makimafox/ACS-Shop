document.addEventListener("DOMContentLoaded", () => {
  loadCartItems();
});

async function loadCartItems() {
  const container = document.getElementById("items");
  const totalEl = document.getElementById("total-price");
  container.innerHTML = ""; // Clear existing items

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let totalPrice = 0;

  for (const cartItem of cart) {
    try {
      console.log("Loading cart item:", cartItem);

      const res = await fetch(`http://localhost:8000/products/${cartItem.id}`);
      if (!res.ok) {
        console.error(`Failed to fetch product ${cartItem.id}:`, res.status);
        continue;
      }

      const product = await res.json();
      const productData = product.product;
      console.log("Fetched product for cart:", productData);

      const categoryRes = await fetch(`http://localhost:8000/category/${productData.category_id}`);
      let categoryName = "No category";
      if (categoryRes.ok) {
        const categoryBody = await categoryRes.json();
        categoryName = categoryBody.name;
      } else {
        console.error(`Failed to fetch category ${productData.category_id}:`, categoryRes.status);
      }

      // Create DOM elements
      const itemDiv = document.createElement("div");
      itemDiv.className = "item";

      const iconDelete = document.createElement("a");
      iconDelete.className = "icon";
      iconDelete.className = "item-span";
      iconDelete.href = `admin-product-delete.html?id=${productData.product_id}`;
      iconDelete.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      `;

      const iconEdit = document.createElement("a");
      iconEdit.className = "icon";
      iconEdit.href = `admin-product-update.html?id=${productData.product_id}`;
      iconEdit.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil">
          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
          <path d="m15 5 4 4"/>
        </svg>
      `;

      const img = document.createElement("img");
      img.src = `http://localhost:8000/products/images/${productData.image_url}`;
      img.alt = productData.name;
      img.className = "item-img";

      const title = document.createElement("span");
      title.className = "item-title";
      title.textContent = productData.name;

      const price = document.createElement("span");
      price.textContent = `${productData.price} THB`;

      const stock = document.createElement("span");
      stock.textContent = `${productData.stock_quantity} QTY`;

      const sub = document.createElement("span");
      sub.className = "item-sub";
      sub.textContent = `${categoryName || "No category"} • ${productData.description || "No description"}`;

      const qty_control = document.createElement("div");
    // Qty control (reads quantity from localStorage-cart and updates/deletes)
    qty_control.innerHTML = `
      <div class="qty">
        <div class="qty_control">
        <button class="qty_button btn qty-minus">−</button>
        <div class="qty_number">${cartItem.qty}</div>
        <button class="qty_button btn qty-plus">+</button>
        </div>
      </div>
    `;

    const minusBtn = qty_control.querySelector(".qty-minus");
    const plusBtn = qty_control.querySelector(".qty-plus");
    const qtyNumber = qty_control.querySelector(".qty_number");

    function getCart() {
      return JSON.parse(localStorage.getItem("cart")) || [];
    }

    function saveCart(cartArr) {
      localStorage.setItem("cart", JSON.stringify(cartArr));
      localStorage.setItem("total-price", recalcTotal());

    }

    function updateLocalCart(newQty) {
      const cartArr = getCart();
      const idx = cartArr.findIndex((it) => String(it.id) === String(cartItem.id));
      if (idx === -1) return;

      if (newQty <= 0) {
        // remove item from cart and from DOM
        cartArr.splice(idx, 1);
        saveCart(cartArr);
        itemDiv.remove();
      } else {
        // clamp to available stock
        const clamped = Math.min(newQty, productData.stock_quantity ?? newQty);
        cartArr[idx].qty = clamped;
        saveCart(cartArr);
        qtyNumber.textContent = clamped;
      }
      localStorage.setItem("total-price", recalcTotal());
    }

    plusBtn.addEventListener("click", () => {
      let current = parseInt(qtyNumber.textContent, 10) || 0;
      // don't exceed stock
      const max = productData.stock_quantity ?? Infinity;
      if (current >= max) return;
      current++;
      updateLocalCart(current);
    });

    minusBtn.addEventListener("click", () => {
      let current = parseInt(qtyNumber.textContent, 10) || 0;
      current = Math.max(0, current - 1);
      updateLocalCart(current);
    });


    iconDelete.addEventListener("click", (e) => {
      e.preventDefault();
      const cartArr = getCart();
      const idx = cartArr.findIndex((it) => String(it.id) === String(cartItem.id));
      if (idx !== -1) {
        cartArr.splice(idx, 1);
        saveCart(cartArr);
      }
      itemDiv.remove();
      recalcTotal();
    });


      // Append elements
      itemDiv.appendChild(iconDelete);
      itemDiv.appendChild(img);
      itemDiv.appendChild(title);
      itemDiv.appendChild(price);
    //   itemDiv.appendChild(iconEdit);
      itemDiv.appendChild(sub);
    //   itemDiv.appendChild(stock);
        itemDiv.appendChild(qty_control);

      container.appendChild(itemDiv);

      totalPrice += cartItem.qty * productData.price;
    } catch (err) {
      console.error(`Error loading product ${cartItem.id}:`, err);
    }
  }
  function recalcTotal() {
    const cartArr = getCart();
    let total = 0;
    cartArr.forEach(cartIt => {
      total += cartIt.qty * (cartIt.price || 0);
      console.log("Recalculating total, item:", cartIt, "subtotal:", cartIt.qty * (cartIt.price || 0));
    });
    totalEl.textContent = `${total}`;
    return total;
  }

  totalEl.textContent = `${totalPrice}`;
  localStorage.setItem("total-price", totalPrice);
}
