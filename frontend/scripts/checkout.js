document.addEventListener('DOMContentLoaded', () => {
	const totalEl = document.getElementById('total-price');
	if (totalEl) totalEl.textContent = localStorage.getItem('total-price') || '0';

	// find a checkout button (id or class)
	const checkoutBtn = document.getElementById('checkout-btn') || document.querySelector('.checkout-btn');
	const checkoutForm = document.getElementById('checkout-form') || null;

	if (!checkoutBtn) return; // no checkout button on this page

	checkoutBtn.addEventListener('click', async (e) => {
		e.preventDefault();
		if (checkoutBtn.disabled) return;
		checkoutBtn.disabled = true;
		const originalText = checkoutBtn.textContent;
		checkoutBtn.textContent = 'Processing...';

		try {
			// gather cart from localStorage
			let cart = [];
			try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch (err) { cart = []; }

			if (!cart || !cart.length) {
				alert('Your cart is empty');
				return;
			}

			// total price
			const total = (totalEl && totalEl.textContent) ? totalEl.textContent : (localStorage.getItem('total-price') || 0);

			// gather customer details from a form if present, or from inputs by name
			const customer = {};
			if (checkoutForm) {
				const fd = new FormData(checkoutForm);
				for (const [k, v] of fd.entries()) customer[k] = v;
			} else {
				['name','email','phone','address'].forEach(n => {
					const el = document.querySelector(`[name="${n}"]`);
					if (el) customer[n] = el.value;
				});
			}


			const token = localStorage.getItem('token');

			const payload = { items: cart, total_amount: total, token: token };

			console.log('Checkout payload', payload);

			const res = await fetch("http://localhost:8000/order", {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const resJson = await res.json().catch(() => null);

			if (!res.ok) {
				const msg = (resJson && (resJson.error || resJson.message)) ? (resJson.error || resJson.message) : `Server returned ${res.status}`;
				alert('Order failed: ' + msg);
				return;
			}

			console.log('Order response', resJson);


			const paymentRes = await fetch("http://localhost:8000/payment", {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ order_id: resJson.order.order_id, status: "Success" })
			});

			const paymentResJson = await paymentRes.json().catch(() => null);
			if (!paymentRes.ok) {
				const msg = (paymentResJson && (paymentResJson.error || paymentResJson.message)) ? (paymentResJson.error || paymentResJson.message) : `Server returned ${paymentRes.status}`;
				alert('Payment failed: ' + msg);
				return;
			}


			// success: clear cart and redirect or show message
			localStorage.removeItem('cart');
			localStorage.removeItem('total-price');

			alert('Order placed successfully');
			// optionally reload to update UI
			// window.location.reload();

		} catch (err) {
			console.error('Checkout error', err);
			alert('Failed to place order. Check console for details.');
		} finally {
			checkoutBtn.disabled = false;
			checkoutBtn.textContent = originalText;
		}
	});
});