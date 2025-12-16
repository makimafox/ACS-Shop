localStorage.getItem('token')
payload = JSON.parse(atob(token.split(".")[1]));

console.log(payload)
if (payload.role == "user") {
    window.location.href = './landing.html';
}