const URL = "http://localhost:3000/api/messages";

fetch(URL)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById('display');
        div.innerText = JSON.stringify(data);
    });