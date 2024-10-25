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

function updateSlide() {
    const INPUT_BOX_DIV = document.getElementById("audienceParticipationInput");
    INPUT_BOX_DIV.innerHTML = "";

    ctx.clearRect(0, 0, board.width, board.height);
    const current_slide_data = slide_data_array[current_slide];

    if (current_slide_data.slideType == "question") {
        INPUT_BOX_DIV.innerHTML = '<input id="questionInput" type="text" placeholder="Type in Your Answer Here"><button id="submitButton" type="submit">Submit</button>';
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
            ctx.font = `${text.size}px arial`;

            //Modifiers
            if (element.modifiers.includes("h-center")) {
                text.x = (board.width / 2) - (ctx.measureText(text.value).width / 2);
            }
            if (element.modifiers.includes("v-center")) {
                text.y = (board.height / 2) - (ctx.measureText(text.value).actualBoundingBoxAscent + ctx.measureText(text.value).actualBoundingBoxDescent) / 2;
            }

            //Display Element
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
            if (element.modifiers.includes("h-center")) {
                image.x = (board.width / 2) - (image.width / 2);
            }
            if (element.modifiers.includes("v-center")) {
                image.y = (board.height / 2) - (image.height / 2);
            }

            //Display Element
            const imageElement = new Image(image.width, image.height);
            imageElement.src = image.src;
            //drawImage(imageElement, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            imageElement.onload = function () {
                ctx.drawImage(imageElement, image.x, image.y, image.width, image.height);
            };
        }

        //Bullet Points
        if (element.type == "bullets") {
            //Define Values
            let bullets = {
                list: element.list,
                x: element.xPos,
                y: element.yPos, //xPos & yPos of first bullet.
                size: element.size,
                width: element.width,
                spacing: element.spacing,
                type: element.bulletType
            };
            let currentYPos = bullets.yPos;

            //Text Wrap
            const bulletsArray = [];
            for(let i = 0; i < bullets.list.length; i++) {
                let words = bullets.list[i].split(" ");
                let lines = [];
                let currentLine = words[0];
    
                for (let j = 1; j < words.length; j++) {
                    let word = words[j];
                    let width = ctx.measureText(currentLine + " " + word).width;
                    if (width < bullets.width) {
                        currentLine += " " + word;
                    } else {
                        lines.push(currentLine);
                        currentLine = word;
                    }
                }
                lines.push(currentLine);

                bulletsArray.push(lines);
            }
            console.log(bulletsArray);

            //Display Element
            ctx.font = `${bullets.size}px arial`;

            const bulletSpace = ctx.measureText("•").width;
            for(let i = 0; i < bulletsArray.length; i++) {
                ctx.fillText("•", bullets.x, currentYPos);
                let height = 0;
                for(let j = 0; j < bulletsArray[i].length; j++) {
                    height = 0;
                    ctx.fillText(bulletsArray[i][j], bullets.x + bulletSpace * 1.5, currentYPos + height);
                    height += (ctx.measureText(bulletsArray[i][j]).actualBoundingBoxAscent + ctx.measureText(bulletsArray[i][j]).actualBoundingBoxDescent);
                }
                currentYPos += height;
            }
        }
    }
}

async function getSlideshowData() {
    const response = await fetch("json/slideData.json");
    const JSON = await response.json();
    console.log(JSON);

    slide_data_array = JSON;
}
getSlideshowData().then(() => {
    //Define Canvas
    board = document.getElementById("myCanvas");
    ctx = board.getContext("2d");
    window.devicePixelRatio = 8;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    board.width = Math.floor(board.width * window.devicePixelRatio);
    board.height = Math.floor((board.width / Math.abs(-2.5)));

    updateSlides();
});

db.ref("/Slide").on("value", function (snapshot) {
    current_slide = snapshot.val().slide;
    updateSlide();
});

