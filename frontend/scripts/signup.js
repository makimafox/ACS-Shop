// Signup handler for the signup form on signup.html
async function signUp(e) {
    e.preventDefault();
    console.log('Sign up form submitted');
     // Prevent the default form submission behavior

    const form = document.getElementById("signup-form");
    if (!form) {
        console.error('Signup form not found');
        return;
    }

    // Helper to get field and its small.error-message element
    const getField = (id) => {
        const input = document.getElementById(id);
        const container = input ? input.closest('.form-group') : null;
        const errorEl = container ? container.querySelector('.error-message') : null;
        return { input, errorEl };
    };

    const first = getField('firstname');
    const last = getField('lastname');
    const email = getField('email');
    const address = getField('address');
    const phone = getField('phone');
    const password = getField('password');
    const confirm = getField('confirm-password');

    // Clear previous errors
    [first, last, email, address, phone, password, confirm].forEach(f => {
        if (f && f.errorEl) f.errorEl.textContent = '';
    });

    const values = {
        firstname: first.input ? first.input.value.trim() : '',
        lastname: last.input ? last.input.value.trim() : '',
        email: email.input ? email.input.value.trim() : '',
        address: address.input ? address.input.value.trim() : '',
        phone: phone.input ? phone.input.value.trim() : '',
        password: password.input ? password.input.value : '',
        confirm: confirm.input ? confirm.input.value : ''
    };

    console.log('Form values:', values);

    let hasError = false;

    // Basic validations
    if (!values.firstname) {
        const msg = 'Firstname is required';
        console.log('Validation error:', msg);
        if (first.errorEl) first.errorEl.textContent = msg;
        hasError = true;
    }
    if (!values.lastname) {
        const msg = 'Lastname is required';
        console.log('Validation error:', msg);
        if (last.errorEl) last.errorEl.textContent = msg;
        hasError = true;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email) {
        const msg = 'Email is required';
        console.log('Validation error:', msg);
        if (email.errorEl) email.errorEl.textContent = msg;
        hasError = true;
    } else if (!emailRe.test(values.email)) {
        const msg = 'Enter a valid email address';
        console.log('Validation error:', msg, values.email);
        if (email.errorEl) email.errorEl.textContent = msg;
        hasError = true;
    }

    if (!values.password) {
        const msg = 'Password is required';
        console.log('Validation error:', msg);
        if (password.errorEl) password.errorEl.textContent = msg;
        hasError = true;
    } else if (values.password.length < 8) {
        const msg = 'Password must be at least 8 characters';
        console.log('Validation error:', msg);
        if (password.errorEl) password.errorEl.textContent = msg;
        hasError = true;
    }

    if (values.password !== values.confirm) {
        const msg = 'Passwords do not match';
        console.log('Validation error:', msg);
        if (confirm.errorEl) confirm.errorEl.textContent = msg;
        hasError = true;
    }

    // Simple phone check (digits + spaces/dashes allowed)
    if (values.phone && !/^[-+() 0-9]{6,20}$/.test(values.phone)) {
        const msg = 'Enter a valid phone number';
        console.log('Validation error:', msg, values.phone);
        if (phone.errorEl) phone.errorEl.textContent = msg;
        hasError = true;
    }

    if (hasError) return;

    // Prepare payload for backend: name, email, password
    const payload = {
        name: `${values.firstname} ${values.lastname}`,
        email: values.email,
        password: values.password
    };

    console.log(payload)

    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        // Adjust the URL if your backend is hosted elsewhere
        const res = await fetch('http://localhost:8000/users/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            console.log('Server returned non-OK response', res.status, errBody);

            // If server returned field-specific errors, map them to the form
            // Expecting either { errors: { fieldName: 'message' } } or { error: 'message' }
            if (errBody && typeof errBody === 'object') {
                if (errBody.errors && typeof errBody.errors === 'object') {
                    console.log('Server field errors:', errBody.errors);
                    // map field errors to .error-message elements
                    Object.keys(errBody.errors).forEach((key) => {
                        const msg = errBody.errors[key];
                        console.log(`Mapping server error for field ${key}:`, msg);
                        const fld = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
                        const container = fld ? fld.closest('.form-group') : null;
                        const errEl = container ? container.querySelector('.error-message') : null;
                        if (errEl) errEl.textContent = msg;
                    });
                    return;
                }

                if (errBody.error) {
                    console.log('Server error message:', errBody.error);
                    alert('Signup failed: ' + errBody.error);
                    return;
                }
            }

            console.log('Unhandled server error, status:', res.status);
            alert(`Signup failed: Server returned ${res.status}`);
            return;
        }

        const data = await res.json();
        console.log('Signup success response:', data);

        // Attempt to sign in automatically using the email/password just provided
        try {
            const signinRes = await fetch('http://localhost:8000/users/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: payload.email, password: payload.password })
            });

            const signinBody = await signinRes.json().catch(() => ({}));
            if (signinRes.ok && signinBody && signinBody.token) {
                console.log('Signin after signup successful', signinBody);
                localStorage.setItem('token', signinBody.token);
                // Redirect to home or dashboard
                window.location.href = './index.html';
                return;
            }

            console.log('Signin after signup failed', signinRes.status, signinBody);
            // Fall back to asking user to sign in manually
            alert('Sign up successful! Please sign in.');
            window.location.href = './index.html';

        } catch (err) {
            console.error('Signin after signup error', err);
            alert('Sign up successful! Error signing in automatically — please sign in.');
            window.location.href = './index.html';
        }


    } catch (err) {
        console.error('Signup error', err);
        alert('Failed to sign up. Check console for details.');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Attach submit listener on DOMContentLoaded so the form works without inline handlers
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    if (form) {
        // Avoid double-binding if inline attribute exists; remove it if present
        form.removeAttribute('onsubmit');
        form.addEventListener('submit', signUp);
    }
});