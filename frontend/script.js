const URL = "https://compito-f5ex.onrender.com";

fetch(URL)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById('display');
        div.innerText = JSON.stringify(data);
    });