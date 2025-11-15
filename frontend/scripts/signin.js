// Sign-in handler for a form with id "signin-form" and inputs with ids "email" and "password"
async function signIn(e) {
  e.preventDefault();
  console.log('Sign in form submitted');

  const form = document.getElementById('signin-form');
  if (!form) {
    console.error('Signin form not found');
    return;
  }

  const getField = (id) => {
    const input = document.getElementById(id);
    const container = input ? input.closest('.form-group') : null;
    const errorEl = container ? container.querySelector('.error-message') : null;
    return { input, errorEl };
  };

  const emailF = getField('email');
  const passwordF = getField('password');

  // clear errors
  [emailF, passwordF].forEach(f => { if (f && f.errorEl) f.errorEl.textContent = ''; });

  const email = emailF.input ? emailF.input.value.trim() : '';
  const password = passwordF.input ? passwordF.input.value : '';

  let hasError = false;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    const msg = 'Email is required';
    console.log('Validation error:', msg);
    if (emailF.errorEl) emailF.errorEl.textContent = msg;
    hasError = true;
  } else if (!emailRe.test(email)) {
    const msg = 'Enter a valid email address';
    console.log('Validation error:', msg, email);
    if (emailF.errorEl) emailF.errorEl.textContent = msg;
    hasError = true;
  }

  if (!password) {
    const msg = 'Password is required';
    console.log('Validation error:', msg);
    if (passwordF.errorEl) passwordF.errorEl.textContent = msg;
    hasError = true;
  }

  if (hasError) return;

  const payload = { email, password };

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await fetch('http://localhost:8000/users/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.log('Signin failed, status:', res.status, body);
      if (body && typeof body === 'object') {
        if (body.errors && typeof body.errors === 'object') {
          console.log('Server field errors:', body.errors);
          Object.keys(body.errors).forEach(key => {
            const msg = body.errors[key];
            console.log(`Mapping server error for field ${key}:`, msg);
            const fld = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            const container = fld ? fld.closest('.form-group') : null;
            const errEl = container ? container.querySelector('.error-message') : null;
            if (errEl) errEl.textContent = msg;
          });
          return;
        }

        if (body.error) {
          console.log('Server error message:', body.error);
          alert('Signin failed: ' + body.error);
          return;
        }
      }

      alert('Signin failed. Server returned ' + res.status);
      return;
    }

    if (body && body.token) {
      console.log('Signin successful', body);
      localStorage.setItem('token', body.token);
      // redirect to home/dashboard
      window.location.href = './index.html';
      return;
    }

    // No token returned
    console.log('Signin succeeded but no token returned', body);
    alert('Signin successful (no token returned)');

  } catch (err) {
    console.error('Signin error', err);
    alert('Failed to sign in. Check console for details.');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// Attach handler on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signin-form');
  if (form) {
    form.removeAttribute('onsubmit');
    form.addEventListener('submit', signIn);
  }
});
