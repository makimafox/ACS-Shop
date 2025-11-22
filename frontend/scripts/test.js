document.addEventListener("DOMContentLoaded", () => {
  loadCartItems();
});

async function loadCartItems() {
  const container = document.getElementById("items");
  const totalEl = document.getElementById("total-price"); // element to display total
  container.innerHTML = "";
  totalEl.textContent = "Loading...";

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let totalPrice = 0;

  for (const cartItem of cart) {
    try {
      const res = await fetch(`http://localhost:8000/products/${cartItem.id}`);
      if (!res.ok) continue;
      const product = await res.json();
      const productData = product.product;

      const categoryRes = await fetch(`http://localhost:8000/category/${productData.category_id}`);
      let categoryName = "No category";
      if (categoryRes.ok) {
        const categoryBody = await categoryRes.json();
        categoryName = categoryBody.name;
      }

      // Create DOM elements
      const itemDiv = document.createElement("div");
      itemDiv.className = "item";

      const title = document.createElement("span");
      title.textContent = productData.name;

      const price = document.createElement("span");
      price.textContent = `${productData.price} THB`;

      const qty_control = document.createElement("div");
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
      }

      function updateLocalCart(newQty) {
        const cartArr = getCart();
        const idx = cartArr.findIndex(it => it.id === cartItem.id);
        if (idx === -1) return;

        if (newQty <= 0) {
          cartArr.splice(idx, 1);
          saveCart(cartArr);
          itemDiv.remove();
        } else {
          const clamped = Math.min(newQty, productData.stock_quantity ?? newQty);
          cartArr[idx].qty = clamped;
          saveCart(cartArr);
          qtyNumber.textContent = clamped;
        }

        // Recalculate total price
        recalcTotal();
      }

      minusBtn.addEventListener("click", () => {
        let current = parseInt(qtyNumber.textContent, 10) || 0;
        current = Math.max(0, current - 1);
        updateLocalCart(current);
      });

      plusBtn.addEventListener("click", () => {
        let current = parseInt(qtyNumber.textContent, 10) || 0;
        const max = productData.stock_quantity ?? Infinity;
        if (current >= max) return;
        current++;
        updateLocalCart(current);
      });

      // Delete button
      const iconDelete = document.createElement("a");
      iconDelete.href = "#";
      iconDelete.textContent = "Remove";
      iconDelete.addEventListener("click", (e) => {
        e.preventDefault();
        const cartArr = getCart();
        const idx = cartArr.findIndex(it => it.id === cartItem.id);
        if (idx !== -1) {
          cartArr.splice(idx, 1);
          saveCart(cartArr);
        }
        itemDiv.remove();
        recalcTotal();
      });

      // Append elements
      itemDiv.appendChild(title);
      itemDiv.appendChild(price);
      itemDiv.appendChild(qty_control);
      itemDiv.appendChild(iconDelete);
      container.appendChild(itemDiv);

      // Add initial price
      totalPrice += cartItem.qty * productData.price;

    } catch (err) {
      console.error(`Error loading product ${cartItem.id}:`, err);
    }
  }

  function recalcTotal() {
    const cartArr = getCart();
    let total = 0;
    cartArr.forEach(cartIt => {
      const prodEl = document.querySelector(`.item:contains("${cartIt.id}")`);
      // fallback if productData not stored, sum using stored price from DOM or fetched again
      const itemPriceEl = document.querySelector(".item span"); 
      const price = parseFloat(itemPriceEl.textContent) || 0;
      total += cartIt.qty * price;
    });
    totalEl.textContent = `Total: THB ${total}`;
  }

  totalEl.textContent = `Total: THB ${totalPrice}`;
}
