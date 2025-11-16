const ar = document.getElementById("ar");
const ad = document.getElementById("ad");
const show = document.getElementById("show");

function showproduct() {
    show.style.display = "flex";
    ar.style.display = "none";
    ad.style.display = "inline-block";
}

function closeproduct() {
    show.style.display = "none";
    ar.style.display = "inline-block";
    ad.style.display = "none";
}