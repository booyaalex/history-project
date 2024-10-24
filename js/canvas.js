let current_slide = 0;
let slide_data_array = [];

window.onload = function () {
    //Define Canvas
    board = document.getElementById("myCanvas");
    ctx = board.getContext("2d");

    //Update Slideshow
    requestAnimationFrame(update);
};

function update() {
    requestAnimationFrame(update);
    ctx.clearRect(0, 0, screen.availWidth, screen.availHeight);


}

async function getSlideshowData() {
    const response = await fetch("json/slideData.json");
    const JSON = await response.json();
    console.log(JSON);
}
getSlideshowData();