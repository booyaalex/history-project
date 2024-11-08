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
        INPUT_BOX_DIV.innerHTML = '<input id="questionInput" type="text" placeholder="Type in Your Question/Answer Here"><button id="submitButton" type="submit" onclick="submitAnswer()">Submit</button>';
    }
    for (const element of current_slide_data.slideElements) {
        if (element.type == "text") {
            drawing.addText(element);
        }
        if (element.type == "image") {
            drawing.addImage(element);
        }
        if (element.type == "bullets") {
            drawing.addBulletPoints(element);
        }
        if (element.type == "response") {
            drawing.addResponseBox(element);
        }
        if (element.type == "shape") {
            if(element.shape == "rect") {
                drawing.shapes.addRect(element);
            }
        }
    }
}

const drawing = {
    addText: function addText(element) {
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
    },
    addImage: function addImage(element) {
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
        imageElement.onload = function () {
            ctx.drawImage(imageElement, image.x, image.y, image.width, image.height);
        };
    },
    addBulletPoints: function addBulletPoints(element) {
        let bullets = {
            list: element.list,
            x: element.xPos,
            y: element.yPos,
            size: element.size,
            width: element.width,
            spacing: element.spacing,
            type: element.bulletType
        };
        let currentYPos = bullets.y;

        //Text Wrap
        const bulletsArray = [];
        for (let i = 0; i < bullets.list.length; i++) {
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

        //Bullet Type
        let bulletType, bulletSpace;
        if (bullets.type == "circle") {
            bulletType = "•";
        } else if (bullets.type == "square") {
            bulletType = "▪";
        } else if (bullets.type == "arrow") {
            bulletType = "→";
        } else if (bullets.type == "number") {
            bulletType = "1";
        }
        bulletSpace = ctx.measureText(bulletType).width;

        //Display Element
        ctx.font = `${bullets.size}px arial`;
        for (let i = 0; i < bulletsArray.length; i++) {
            ctx.fillText(bulletType, bullets.x, currentYPos);
            let height = 0;
            for (let j = 0; j < bulletsArray[i].length; j++) {
                ctx.fillText(bulletsArray[i][j], bullets.x + bulletSpace * 1.5, currentYPos + height);
                height += (ctx.measureText(bulletsArray[i][j]).actualBoundingBoxAscent + ctx.measureText(bulletsArray[i][j]).actualBoundingBoxDescent) + 5;
            }
            currentYPos += height + bullets.spacing;
            if(bullets.type == "number") {
                bulletType = (Number(bulletType) + 1);
                bulletSpace = ctx.measureText(bulletType).width;
            }
        }
    },
    addResponseBox: function addResponseBox(element) {
        let response = {
            parentSlide: element.parent,
            x: element.xPos,
            y: element.yPos,
            width: element.width,
            height: element.height,
            size: element.size
        };
        const responseArray = [];
        //Get Responses
        db.ref("/UserResponses").child(slide_data_array[current_slide].slideName).on("value", function (snapshot) {
            ctx.fillStyle = "white";
            ctx.fillRect(response.x, response.y - 50, response.width, response.height);
            ctx.fillStyle = "black";

            let i = 0;
            snapshot.forEach((r) => {
                console.log(r.val().accepted);
                if(r.val().accepted == 1) {
                    responseArray.push(r.val().response);
                    console.log(r.val().response);
                    ctx.font = `${response.size}px arial`;
                    ctx.fillText(`${r.val().funName}: ${r.val().response}`, response.x, response.y + (i * 40));
                }
                i++;
            });
        });
    },
    shapes: {
        addRect: function addRect(element) {
            let rect = {
                x: element.xPos,
                y: element.yPos,
                width: element.width,
                height: element.height,
                color: element.color,
                stroke: {
                    color: element.stroke.color,
                    width: element.stroke.width
                }
            };

            if(rect.stroke.width > 0) {
                ctx.strokeStyle = rect.stroke.color;
                ctx.strokeRect(rect.x - rect.stroke.width + 1, rect.y - rect.stroke.width + 1, rect.width + rect.stroke.width * 2 - 1, rect.height + rect.stroke.width * 2 - 1);
            }

            ctx.fillStyle = rect.color;
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
    }
}

function submitAnswer() {
    const text_box = document.getElementById("questionInput");
    const user_id = localStorage.getItem("temp_id");

    let temp = profanityCleaner.clean(text_box.value, { placeholder: '°' });

    db.ref("/UserResponses").child(slide_data_array[current_slide].slideName).child(user_id.toString()).update({
        response: temp,
        accepted: 0,
        funName: createFunName()
    });
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

    updateSlide();
});

db.ref("/Slide").on("value", function (snapshot) {
    current_slide = snapshot.val().slide;
    updateSlide();
});

function createFunName() {
    const firstName = ["Super", "Marvelous", "Charged", "Swirly", 'Zealous', "Light", "Lucky", "Mr.", "Mrs."];
    const lastName = ["Cactus", "Doggo", "Duck", "Flame", "Artist", "Tiger", "Warden", "Dancer", "Brekker"];

    return `${firstName[Math.floor(Math.random() * 9)]} ${lastName[Math.floor(Math.random() * 9)]}`;
}