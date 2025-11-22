document.addEventListener("DOMContentLoaded", function() {
    const newArrivalsContainer = document.getElementById("new-arrivals");
    fetch("http://localhost:8000/products?limit=5")
        .then(response => response.json())
        .then(res => res.products)
        .then(data => {
            data.forEach(product => {
                const itemLink = document.createElement("a");
                itemLink.href = `./product.html?id=${product.product_id}`;
                itemLink.className = "item";

                const img = document.createElement("img");
                img.src = `http://localhost:8000/products/images/${product.image_url}` || "/frontend/img/default-product.png";
                img.alt = product.name;

                const title = document.createElement("span");
                title.className = "item-title";
                title.textContent = product.name;

                const description = document.createElement("span");
                description.className = "item-description";
                description.textContent = product.description || "No description available";

                itemLink.appendChild(img);
                itemLink.appendChild(title);
                itemLink.appendChild(description);

                newArrivalsContainer.appendChild(itemLink);
            });
        })
        .catch(error => {
            console.error("Error fetching new arrivals:", error);
        });
});