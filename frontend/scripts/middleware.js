
if (!localStorage.getItem('token')) {
    console.log('No token found, redirecting to signin');
    window.location.href = './signin.html';
}