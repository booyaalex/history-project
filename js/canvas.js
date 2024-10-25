let current_slide = 5;
let slide_data_array = [];

const firebaseConfig = {
    apiKey: "AIzaSyDspsa0eeswdZX91YWGg3uygsxmgiqvhd8",
    authDomain: "historyproject-a9cca.firebaseapp.com",
    databaseURL: "https://historyproject-a9cca-default-rtdb.firebaseio.com",
    projectId: "historyproject-a9cca",
    storageBucket: "historyproject-a9cca.appspot.com",
    messagingSenderId: "111673046869",
    appId: "1:111673046869:web:690062c4a33871b74d61dc"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

db.ref("/Slide").on("value", function (snapshot) {
    current_slide = snapshot.val().slide;
    updateSlide();
});

window.onload = function () {
    //Define Canvas
    board = document.getElementById("myCanvas");
    ctx = board.getContext("2d");
    window.devicePixelRatio = 8;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    board.width = Math.floor(board.width * window.devicePixelRatio);
    board.height = Math.floor((board.width / Math.abs(-2.5)));
    //Update Slideshow
    updateSlide();
};

function updateSlide() {
    ctx.clearRect(0, 0, board.width, board.height);
    const current_slide_data = slide_data_array[current_slide];

    if (current_slide_data.slideType != "default") {

    }
    for (let i = 0; i < current_slide_data.slideElements.length; i++) {
        const element = current_slide_data.slideElements[i];

        //Text Elements
        if (element.type == "text") {
            let text = {
                value: element.text,
                x: element.xPos,
                y: element.yPos,
                size: element.size
            };

            //Modifiers
            if (element.modifiers.includes("h-center")) {
                text.x = (board.width / 2) - ctx.measureText(text.value).width / 2;
            }
            if (element.modifiers.includes("v-center")) {
                text.y = (board.height / 2) - (ctx.measureText(text.value).actualBoundingBoxAscent + ctx.measureText(text.value).actualBoundingBoxDescent) / 2;
            }
            //Display Element
            ctx.font = `${text.size}px arial`;
            ctx.fillText(text.value, text.x, text.y);
        }

        //Image Elements
        if (element.type == "image") {
            //Define Values
            let image = {
                src: element.src,
                x: element.xPos,
                y: element.yPos,
                width: element.width,
                height: element.height
            };

            //Modifiers
            if(element.modifiers.includes("h-center")) {
                image.x = (board.width / 2) - (image.width / 2);
            }

            //Display Element
            const imageElement = new Image(image.width, image.height);
            imageElement.src = image.src;
            //drawImage(imageElement, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            imageElement.onload = function () {
                ctx.drawImage(imageElement, image.x, image.y, image.width, image.height);
            };
        }
    }
}

async function getSlideshowData() {
    const response = await fetch("json/slideData.json");
    const JSON = await response.json();
    console.log(JSON);

    slide_data_array = JSON;
}
getSlideshowData();