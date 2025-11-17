const categoryDeleteForm = document.getElementById('category-delete-form')

categoryDeleteForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Category delete form submitted');

    const form = document.getElementById('category-delete-form');
    if (!form) {
        console.error('Category delete form not found');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('id');
    if (!categoryId) {
        console.error('Category ID not found in URL');
        alert('Category ID not found in URL');
        return;
    }

    const payload = { id: categoryId };
console.log('Payload for deletion:', payload);    

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await fetch(`http://localhost:8000/category/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log('Category deleted successfully');
            alert('Category deleted successfully');
            window.location.href = './admin-category.html';
        } else {
            const errorData = await res.json();
            console.error('Error deleting category:', errorData.error);
            alert(`Error deleting category: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Network or server error:', error);
        alert('Network or server error occurred while deleting category');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});