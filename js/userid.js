if(!sessionStorage.getItem("temp_id")) {
    sessionStorage.setItem("temp_id", Math.floor(Math.random() * Date.now()));
}

async function getIpAddress() {
    const response = await fetch("https://api6.ipify.org?format=json");
    return response.json();
}
