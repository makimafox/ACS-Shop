async function handleProductUpdate(e) {
  e.preventDefault();

  const form = document.getElementById("product-update-form");
  if (!form) {
    console.error("product-update-form not found");
    return;
  }

  const getField = (id) => {
    const input = document.getElementById(id);
    const container = input ? input.closest(".form-group") : null;
    const errorEl = container
      ? container.querySelector(".error-message")
      : null;
    return { input, errorEl };
  };

  const name = getField("name");
  const description = getField("description");
  const price = getField("price");
  const category_id = getField("category-option");
  const stock_quantity = getField("stock_quantity");
  const file = getField("file"); // ฟิลด์รูปภาพชื่อ file

  const fields = [name, description, price, category_id, stock_quantity, file];
  fields.forEach((f) => {
    if (f && f.errorEl) f.errorEl.textContent = "";
  });

  const values = {
    name: name.input?.value.trim() || "",
    description: description.input?.value.trim() || "",
    price: price.input?.value.trim() || "",
    category_id: category_id.input?.value.trim() || "",
    stock_quantity: stock_quantity.input?.value.trim() || "",
    file: file.input?.files[0] || null,
  };

  console.log("Form values:", values);

  // ใช้ FormData ตาม spec
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("description", values.description);
  formData.append("price", values.price);
  formData.append("category_id", values.category_id);
  formData.append("stock_quantity", values.stock_quantity);

  if (values.file) {
    formData.append("file", values.file); // ต้องเป็น file ตามสเปก API
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  if (!productId) {
    console.error("Product ID not found in URL");
    return;
  }

  formData.append("product_id", productId);
  try {
    const productRes = await fetch(`http://localhost:8000/products/update`, {
      method: "POST",
      body: formData, // อย่าลืม! ห้ามใส่ headers multipart/form-data เอง
    });

    console.log("Request sent, awaiting response...");
    const productBody = await productRes.json().catch(() => ({}));
    console.log("Response status:", productRes.status, "body:", productBody);

    if (productRes.ok) {
      console.log("Product updated", productBody);
      alert("Product updated successfully.");
      return;
    }

    console.error("Failed to update product", productBody);
    alert("Failed to update product. Please try again.");
  } catch (error) {
    console.error("Error updating product:", error);
    alert("An error occurred while updating the product. Please try again.");
  }
}

async function handleProductUpdateImg(e) {
  e.preventDefault();
  // Implementation for updating only the product image can go here
    console.log("Product image update form submitted");
    const form = document.getElementById("product-update-image-form");
    if (!form) {
      console.error("product-update-image-form not found");
      return;
    }

    const fileField = document.getElementById("file");
    const container = fileField ? fileField.closest(".form-group") : null;
    const errorEl = container ? container.querySelector(".error-message") : null;
    if (errorEl) errorEl.textContent = "";

    const file = fileField ? fileField.files[0] : null;
    if (!file) {
      const msg = "Please select a file to upload.";
      console.log("Validation error:", msg);
      if (errorEl) errorEl.textContent = msg;
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId) {
      console.error("Product ID not found in URL");
      return;
    }

    formData.append("product_id", productId);

    try {
      const res = await fetch(`http://localhost:8000/products/updateimg`, {
        method: "POST",
        body: formData,
      });

      console.log("Request sent, awaiting response...");
      const body = await res.json().catch(() => ({}));
      console.log("Response status:", res.status, "body:", body);

      if (res.ok) {
        console.log("Product image updated", body);
        alert("Product image updated successfully.");
        return;
      }

      console.error("Failed to update product image", body);
      alert("Failed to update product image. Please try again.");
    } catch (error) {
      console.error("Error updating product image:", error);
      alert("An error occurred while updating the product image. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("product-update-form");
  const formImg = document.getElementById("product-update-image-form");

  const categorySelect = document.getElementById("category-option");


  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  // Fetch categories and populate the select dropdown
  fetch("http://localhost:8000/category")
    .then((response) => response.json())
    .then((data) => {
      categorySelect.innerHTML = ""; // Clear existing options
      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.category_id;
        option.textContent = category.name;
        // ถ้าค่าใน category_id ตรงกับ query → เอาไว้บนสุด
      if (String(category.category_id) === productId) {
        categorySelect.prepend(option); 
      } else {
        categorySelect.appendChild(option);
      }
      });
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
      categorySelect.innerHTML =
        '<option value="">Error loading categories</option>';
    });


    fetch("http://localhost:8000/products/" + new URLSearchParams(window.location.search).get("id"))
    .then((response) => response.json())
    .then((product) => {
      console.log("Fetched product details:", product.product);
      // เติมค่าลงในฟิลด์ต่างๆ
      document.getElementById("name").value = product.product.name || "";
      document.getElementById("description").value = product.product.description || "";
      document.getElementById("price").value = product.product.price || "";
      document.getElementById("category-option").value = product.product.category_id || "";
      document.getElementById("stock_quantity").value = product.product.stock_quantity || "";
      document.getElementById("preview").src = `http://localhost:8000/products/images/${product.product.image_url}` || "";
    })
    .catch((error) => {
      console.error("Error fetching product details:", error);
      alert("Error loading product details. Please try again.");
    });


  if (form) {
    form.removeAttribute("onsubmit");
    form.addEventListener("submit", handleProductUpdate);
  }

  if (formImg) {
    formImg.removeAttribute("onsubmit");
    formImg.addEventListener("submit", handleProductUpdateImg);
  }
});
