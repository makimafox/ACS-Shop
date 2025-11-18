async function handleProductAdd(e) {
  e.preventDefault();

  const form = document.getElementById("product-add-form");
  if (!form) {
    console.error("product-add-form not found");
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

  try {
    const productRes = await fetch("http://localhost:8000/products", {
      method: "POST",
      body: formData, // อย่าลืม! ห้ามใส่ headers multipart/form-data เอง
    });

    console.log('Request sent, awaiting response...');
    const productBody = await productRes.json().catch(() => ({}));
    console.log('Response status:', productRes.status, 'body:', productBody);

    if (productRes.ok) {
      console.log("Product created", productBody);
      alert("Product added successfully.");
      return;
    }

    // 📌 Validation errors จาก Backend
    if (productBody && typeof productBody === "object") {
      // กรณี errors เป็น object เช่น { name: "...", price: "..." }
      if (productBody.errors && typeof productBody.errors === "object") {
        Object.entries(productBody.errors).forEach(([field, msg]) => {
          const fieldObj = getField(field);
          if (fieldObj?.errorEl) {
            fieldObj.errorEl.textContent = Array.isArray(msg)
              ? msg.join(", ")
              : String(msg);
          }
        });
        return;
      }

      // single field error เช่น { price: "Price invalid" }
      Object.keys(productBody).forEach((key) => {
        const fieldObj = getField(key);
        if (fieldObj?.errorEl) {
          fieldObj.errorEl.textContent = String(productBody[key]);
        }
      });

      if (productBody.error) {
        alert("Product creation failed: " + productBody.error);
        return;
      }
    }

    alert(`Product creation failed: Server returned ${productRes.status}`);
  } catch (err) {
    console.error("Error creating product:", err);
    alert("An unexpected error occurred while creating the product.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("product-add-form");

  const categorySelect = document.getElementById("category-option");
  // Fetch categories and populate the select dropdown
  fetch("http://localhost:8000/category")
    .then((response) => response.json())
    .then((data) => {
      categorySelect.innerHTML = ""; // Clear existing options
      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.category_id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
      categorySelect.innerHTML =
        '<option value="">Error loading categories</option>';
    });

  if (form) {
    form.removeAttribute("onsubmit");
    form.addEventListener("submit", handleProductAdd);
  }
});
