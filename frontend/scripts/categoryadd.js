// Handler for a form with id "category-add-form"
async function handleCategoryAdd(e) {
  e.preventDefault();

  const form = document.getElementById("category-add-form");
  if (!form) {
    console.error("category-add-form not found");
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

  [name, description].forEach((f) => {
    if (f && f.errorEl) f.errorEl.textContent = "";
  });

  const values = {
    name: name.input ? name.input.value.trim() : "",
    description: description.input ? description.input.value.trim() : "",
  };

  const payload = {
    name: values.name,
    description: values.description,
  };

  try {
    const categoryRes = await fetch("http://localhost:8000/category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const categoryBody = await categoryRes.json().catch(() => ({}));

    if (categoryRes.ok) {
      console.log("Category created", categoryBody);
      alert("Category added successfully.");
      return;
    }

    // Handle validation errors returned from API
    if (categoryBody && typeof categoryBody === "object") {
      // If errors is an object mapping field names to messages
      if (categoryBody.errors && typeof categoryBody.errors === "object") {
        Object.entries(categoryBody.errors).forEach(([field, msg]) => {
          const fieldObj = getField(field);
          if (fieldObj && fieldObj.errorEl) {
            fieldObj.errorEl.textContent = Array.isArray(msg)
              ? msg.join(", ")
              : String(msg);
          }
        });
        return;
      }

      // If API returns single-field errors like { name: "..." } or { description: "..." }
      Object.keys(categoryBody).forEach((key) => {
        const fieldObj = getField(key);
        if (fieldObj && fieldObj.errorEl) {
          fieldObj.errorEl.textContent = String(categoryBody[key]);
        }
      });

      if (categoryBody.message) {
        alert(categoryBody.message);
        return;
      }
    }

    alert("Failed to add category. Please check the form and try again.");
  } catch (err) {
    console.error("Error creating category", err);
    alert("Error adding category. Please try again later.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("category-add-form");
  if (form) {
    form.removeAttribute("onsubmit");
    form.addEventListener("submit", handleCategoryAdd);
  }
});
