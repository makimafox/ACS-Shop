const productDeleteForm = document.getElementById('product-delete-form')

productDeleteForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Product delete form submitted');
    const form = document.getElementById('product-delete-form');
    if (!form) {
        console.error('Product delete form not found');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) {
        console.error('Product ID not found in URL');
        alert('Product ID not found in URL');
        return;
    }

    const payload = { id: productId };
console.log('Payload for deletion:', payload);    

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await fetch(`http://localhost:8000/products/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log('Product deleted successfully');
            alert('Product deleted successfully');
            window.location.href = './admin-product.html';
        } else {
            const errorData = await res.json();
            console.error('Error deleting product:', errorData.error);
            alert(`Error deleting product: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Network or server error:', error);
        alert('Network or server error occurred while deleting product');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});