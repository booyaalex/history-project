if(!sessionStorage.getItem("temp_id")) {
    getIpAddress().then((value) => {
        const temp = value.ip;
        sessionStorage.setItem("temp_id", temp.replaceAll(".", "-"));
    });
}

async function getIpAddress() {
    const response = await fetch("https://api.ipify.org/?format=json");
    return response.json();
}
