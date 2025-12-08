async function fetchOrders() {
  const res = await fetch("http://localhost:8000/order?status=Pending", {
    method: "GET",
  });

  if (!res.ok) {
    console.error("Error fetching orders:", res.statusText);
    return;
  }

  const orders = await res.json();
  console.log("Fetched orders:", orders);

  const container = document.getElementById("items");
  if (!container) {
    console.error("Order list container not found");
    return;
  }

  orders.forEach((order) => {
    const card = document.createElement("div");
    card.className = "order-card";

    // ========== ROW TOP ==========
    const rowTop = document.createElement("div");
    rowTop.className = "row";

    const orderLeft = document.createElement("div");
    orderLeft.className = "order-left";
    orderLeft.textContent = `Order ID: ${order.order_id}`;

    // Calendar row
    const iconRow1 = document.createElement("div");
    iconRow1.className = "icon-row";
    const orderDate = order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A';
    iconRow1.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
      stroke-linecap="round" stroke-linejoin="round" 
      class="lucide lucide-calendar-icon lucide-calendar">
        <path d="M8 2v4"/>
        <path d="M16 2v4"/>
        <rect width="18" height="18" x="3" y="4" rx="2"/>
        <path d="M3 10h18"/>
    </svg> ${orderDate}`;

    const iconRow2 = document.createElement("div");
    iconRow2.className = "icon-row";
    iconRow2.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" 
      class="lucide lucide-phone-icon lucide-phone">
        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 
        2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 
        1.233 14 14 0 0 0 6.392 6.384"/>
    </svg>${order.user.phone || 'N/A'}`;

    orderLeft.appendChild(iconRow1);
    orderLeft.appendChild(iconRow2);

    // Right section
    const orderRight = document.createElement("div");
    orderRight.className = "order-right";

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = `${order.user.name || 'N/A'}`;

    const address = document.createElement("div");
    address.className = "address";
    address.textContent = `${order.user.address || 'N/A'}`;

    orderRight.appendChild(name);
    orderRight.appendChild(address);

    rowTop.appendChild(orderLeft);
    rowTop.appendChild(orderRight);
    card.appendChild(rowTop);

    // ========== ITEMS ==========
    const titleItems = document.createElement("h4");
    titleItems.textContent = "Items";

    const itemsDiv = document.createElement("div");
    itemsDiv.className = "items";

    // Render order items from the nested items array
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        const itemEl = document.createElement("p");
        itemEl.textContent = `Product ID: ${item.product_id} x ${item.quantity}`;
        itemsDiv.appendChild(itemEl);
      });
    } else {
      const noItems = document.createElement("p");
      noItems.textContent = "No items in this order";
      itemsDiv.appendChild(noItems);
    }

    card.appendChild(titleItems);
    card.appendChild(itemsDiv);

    // ========== TOTAL + BUTTON ==========
    const rowBottom = document.createElement("div");
    rowBottom.className = "row";

    const total = document.createElement("div");
    total.className = "total";
    total.textContent = `Total : THB ${order.total_amount || 0}`;

    const btn = document.createElement("button");
    btn.className = "btn btn--primary";
    btn.textContent = "Finish";


    btn.addEventListener("click", async () => {
      try {
        const res = await fetch(`http://localhost:8000/order/finish/${order.order_id}`, {
          method: "POST",
        });
        if (!res.ok) {
          console.error("Error finishing order:", res.statusText);
          alert("Failed to finish order.");
          return;
        }
        alert("Order finished successfully.");
        // Optionally, you can refresh the orders list or update the UI accordingly
      } catch (error) {
        console.error("Network error finishing order:", error);
        alert("Network error. Please try again later.");
      } 
    });
    rowBottom.appendChild(total);
    rowBottom.appendChild(btn);

    card.appendChild(rowBottom);

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchOrders();
});
