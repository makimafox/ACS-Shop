document.addEventListener("DOMContentLoaded", () => {
  const usernameFormGroup = document.getElementById("username-settings-form");
  const passwordFormGroup = document.getElementById("password-settings-form");
  const addressFormGroup = document.getElementById("address-settings-form");
  const phoneFormGroup = document.getElementById("phone-settings-form");

  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be signed in to access account settings.");
    window.location.href = "./signin.html";
    return;
  }

  passwordFormGroup.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPasswordInput = document.getElementById("current-password");
    const newPasswordInput = document.getElementById("new-password");
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();

    updatePasswordSettings(currentPassword, newPassword, token);

  });

  addressFormGroup.addEventListener("submit", async (e) => {
    e.preventDefault();
    const addressInput = document.getElementById("address");
    const newAddress = addressInput.value.trim();
    updateAdressSettings(newAddress, token);
  });



  usernameFormGroup.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById("username");
    const newUsername = usernameInput.value.trim();
    updateUsernameSettings(newUsername, token);
  });

  phoneFormGroup.addEventListener("submit", async (e) => {
    e.preventDefault();
    const phoneInput = document.getElementById("phone");
    const newPhone = phoneInput.value.trim();
    updatePhoneSettings(newPhone, token);
  });

});


async function updateUsernameSettings(newUsername, token) {
  if (!newUsername) {
    alert("Username cannot be empty.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/users/settings/username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: newUsername, token: token }),
    });

    if (!response.ok) {
      throw new Error("Failed to update username.");
    }

    alert("Username updated successfully. Please sign in again.");
    localStorage.removeItem("token");
    window.location.href = "./signin.html";

  } catch (error) {
    alert(error.message);
  }
}


async function updatePasswordSettings(currentPassword, newPassword, token) {
  if (!currentPassword || !newPassword) {
    alert("Please fill in all password fields.");
    return;
  }
  try {
    const response = await fetch("http://localhost:8000/users/settings/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oldPassword: currentPassword, newPassword: newPassword, token: token }),
    });
    if (!response.ok) {
      throw new Error("Failed to update password.");
    }
    alert("Password updated successfully. Please sign in again.");
    localStorage.removeItem("token");
    window.location.href = "./signin.html";
  } catch (error) {
    alert(error.message);
  }
}


async function updateAdressSettings(newAddress, token) {
  if (!newAddress) {
    alert("Address cannot be empty.");
    return;
  }
  try {
    const response = await fetch("http://localhost:8000/users/settings/address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: newAddress, token: token }),
    });

    if (!response.ok) {
      throw new Error("Failed to update address.");
    }

    alert("Address updated successfully.");

  } catch (error) {
    alert(error.message);
  }
}


async function updatePhoneSettings(newPhone, token) {
  if (!newPhone) {
    alert("Phone number cannot be empty.");
    return;
  }
  try {
    const response = await fetch("http://localhost:8000/users/settings/phone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: newPhone, token: token }),
    });
    if (!response.ok) {
      throw new Error("Failed to update phone number.");
    }
    alert("Phone number updated successfully.");
  } catch (error) {
    alert(error.message);
  }
}