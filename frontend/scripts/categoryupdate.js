// Handler for a form with id "category-add-form"
async function handleCategoryAdd(e) {
  e.preventDefault();

  const form = document.getElementById("category-update-form");
  if (!form) {
    console.error("category-update-form not found");
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

  const params = new URLSearchParams(window.location.search);

  const id = params.get("id") || "";

  console.log("id:", id, typeof id);

  const name = getField("name");
  const description = getField("description");

  [name, description, id].forEach((f) => {
    if (f && f.errorEl) f.errorEl.textContent = "";
  });

  const values = {
    name: name.input ? name.input.value.trim() : "",
    description: description.input ? description.input.value.trim() : "",
    id: id,
  };

  const payload = {
    name: values.name,
    description: values.description,
    id: values.id,
  };

  try {
    const categoryRes = await fetch("http://localhost:8000/category/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const categoryBody = await categoryRes.json().catch(() => ({}));

    if (categoryRes.ok) {
      console.log("Category created", categoryBody);
      window.location.href = "./admin-category.html";
      
      alert("Category updated successfully.");
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
  const form = document.getElementById("category-update-form");
  if (form) {
    form.removeAttribute("onsubmit");
    form.addEventListener("submit", handleCategoryAdd);
  }

  const res = fetch(
    "http://localhost:8000/category/" +
      new URLSearchParams(window.location.search).get("id")
  )
    .then((response) => response.json())
    .then((data) => {
      const nameField = document.getElementById("name");
      const descriptionField = document.getElementById("description");
      if (nameField) nameField.value = data.name || "";
      if (descriptionField) descriptionField.value = data.description || "";


      document.getElementById("name").value = data.name;
      document.getElementById("description").value = data.description;
    })
    .catch((error) => {
      console.error("Error fetching category data:", error);
    });
});
