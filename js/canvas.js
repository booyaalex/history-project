let current_slide = 5;
let slide_data_array = [];
var audio = new Audio('../Outro-Music-Meme-Sound-Effect.mp3');
var audio2 = new Audio('../ding-126626.mp3');

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
    ctx.fillStyle = current_slide_data.backgroundColor;
    ctx.fillRect(0, 0, board.width, board.height);
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
            if (element.shape == "rect") {
                drawing.shapes.addRect(element);
            }
            if (element.shape == "line") {
                drawing.shapes.addLine(element);
            }
            if (element.shape == "polygon") {
                drawing.shapes.addPolygon(element);
            }
            if (element.shape == "arrow") {
                drawing.shapes.addArrow(element);
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
            size: element.size,
            color: element.color
        };
        ctx.font = `${text.size}px Verdana`;

        //Modifiers
        if (element.modifiers.includes("h-center")) {
            text.x = (board.width / 2) - (ctx.measureText(text.value).width / 2);
        }
        if (element.modifiers.includes("v-center")) {
            text.y = (board.height / 2) - (ctx.measureText(text.value).actualBoundingBoxAscent + ctx.measureText(text.value).actualBoundingBoxDescent) / 2;
        }

        //Display Element
        ctx.fillStyle = text.color;
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
        } else if (element.modifiers.includes("h-full")) {
            image.x = 0;
            image.width = board.width;
        }
        if (element.modifiers.includes("v-center")) {
            image.y = (board.height / 2) - (image.height / 2);
        } else if (element.modifiers.includes("v-full")) {
            image.y = 0;
            image.height = board.height;
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
            type: element.bulletType,
            color: element.color
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
        ctx.fillStyle = bullets.color;
        for (let i = 0; i < bulletsArray.length; i++) {
            ctx.fillText(bulletType, bullets.x, currentYPos);
            let height = 0;
            for (let j = 0; j < bulletsArray[i].length; j++) {
                ctx.fillText(bulletsArray[i][j], bullets.x + bulletSpace * 1.5, currentYPos + height);
                height += (ctx.measureText(bulletsArray[i][j]).actualBoundingBoxAscent + ctx.measureText(bulletsArray[i][j]).actualBoundingBoxDescent) + 5;
            }
            currentYPos += height + bullets.spacing;
            if (bullets.type == "number") {
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
                if (r.val().accepted == 1) {
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

            //Modifiers
            if (element.modifiers.includes("h-center")) {
                rect.x = (board.width / 2) - (rect.width / 2);
            } else if (element.modifiers.includes("h-full")) {
                rect.x = 0;
                rect.width = board.width;
            }
            if (element.modifiers.includes("v-center")) {
                rect.y = (board.height / 2) - (rect.height / 2);
            } else if (element.modifiers.includes("v-full")) {
                rect.y = 0;
                rect.height = board.height;
            }


            //Display Element
            if (rect.stroke.width > 0) {
                ctx.lineWidth = rect.stroke.width;
                ctx.strokeStyle = rect.stroke.color;
                ctx.strokeRect(rect.x - 1, rect.y - 1, rect.width + 2, rect.height + 2);
            }
            ctx.fillStyle = rect.color;
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        },
        addLine: function addLine(element) {
            let line = {
                x1: element.x1,
                y1: element.y1,
                x2: element.x2,
                y2: element.y2,
                width: element.width,
                color: element.color
            };

            ctx.beginPath();
            ctx.strokeStyle = line.color;
            ctx.lineWidth = line.width;
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        },
        addPolygon: function addPolygon(element) {
            let polygon = {
                positions: element.positions,
                width: element.width,
                color: element.color,
                stroke: {
                    color: element.stroke.color,
                    width: element.stroke.width
                }
            };

            ctx.fillStyle = polygon.color;
            ctx.beginPath();
            for (let i = 0; i < polygon.positions.length; i++) {
                const pos = polygon.positions[i];
                if (i == 0) {
                    ctx.moveTo(pos.x, pos.y);
                } else {
                    ctx.lineTo(pos.x, pos.y);
                }
            }
            ctx.closePath();
            ctx.fill();

            ctx.lineWidth = polygon.stroke.width;
            ctx.strokeStyle = polygon.stroke.color;
            ctx.stroke();
        },
        addArrow: function addArrow(element) {
            //XPOS- DISTANCE * Math.cos(arrow.angle - Math.PI / ANGLE)
            //YPOS - DISTANCE * Math.sin(arrow.angle - Math.PI / ANGLE)
            let arrow = {
                x1: element.x1,
                y1: element.y1,
                x2: element.x2,
                y2: element.y2,
                width: element.width,
                color: element.color,
                stroke: {
                    color: element.stroke.color,
                    width: element.stroke.width
                },
                length: Math.sqrt(Math.pow((element.x2 - element.x1), 2) + Math.pow((element.y2 - element.y1), 2)) - 75,
                angle: Math.atan2((element.y2 - element.y1), (element.x2 - element.x1)),
                points: [null, null, null, { x: element.x2, y: element.y2 }, null, null, null]
            };

            //Get Arrow Points
            arrow.points[0] = {
                x: arrow.x1 - (arrow.width / 2) * Math.cos(arrow.angle - Math.PI / -2),
                y: arrow.y1 - (arrow.width / 2) * Math.sin(arrow.angle - Math.PI / -2)
            };
            arrow.points[6] = {
                x: arrow.x1 - (arrow.width / 2) * Math.cos(arrow.angle - Math.PI / 2),
                y: arrow.y1 - (arrow.width / 2) * Math.sin(arrow.angle - Math.PI / 2)
            };
            arrow.points[1] = {
                x: arrow.points[0].x - arrow.length * Math.cos(arrow.angle - Math.PI),
                y: arrow.points[0].y - arrow.length * Math.sin(arrow.angle - Math.PI)
            };
            arrow.points[5] = {
                x: arrow.points[6].x - arrow.length * Math.cos(arrow.angle - Math.PI),
                y: arrow.points[6].y - arrow.length * Math.sin(arrow.angle - Math.PI)
            };
            arrow.points[2] = {
                x: arrow.points[1].x - (arrow.width / 2) * Math.cos(arrow.angle - Math.PI / -2),
                y: arrow.points[1].y - (arrow.width / 2) * Math.sin(arrow.angle - Math.PI / -2)
            };
            arrow.points[4] = {
                x: arrow.points[5].x - (arrow.width / 2) * Math.cos(arrow.angle - Math.PI / 2),
                y: arrow.points[5].y - (arrow.width / 2) * Math.sin(arrow.angle - Math.PI / 2)
            };

            //Display Element
            ctx.beginPath();
            ctx.fillStyle = arrow.color;
            for (let i = 0; i < 7; i++) {
                ctx.lineTo(arrow.points[i].x, arrow.points[i].y);
            }
            ctx.lineTo(arrow.points[0].x, arrow.points[0].y);
            ctx.fill();
            if (arrow.stroke.width > 0) {
                ctx.strokeStyle = arrow.stroke.color;
                ctx.lineWidth = arrow.stroke.width;
                ctx.stroke();
            }

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
    board.height = Math.floor((board.width / 2.5));

    if (slide_data_array[current_slide].slideName == "OUTRO") {
        console.log("good");
        var audio = new Audio('../Outro-Music-Meme-Sound-Effect.mp3');
        audio.play();
    }

    updateSlide();
});

db.ref("/Slide").on("value", function (snapshot) {
    current_slide = snapshot.val().slide;

    if (slide_data_array[current_slide].slideName == "OUTRO") {
        console.log("good");

        audio.play();
    }
    else {
        audio.currentTime = 14;
        audio.pause();
    }

    updateSlide();
});

db.ref("/Sound").on("value", function (snapshot) {
    if (window.location.pathname == "/slideshow") {
        audio2.play();
    } else {
        audio2.currentTime = 0;
        audio2.pause();
    }
});

function createFunName() {
    const firstName = ["Super", "Marvelous", "Charged", "Swirly", 'Zealous', "Light", "Lucky", "Mr.", "Mrs."];
    const lastName = ["Cactus", "Doggo", "Duck", "Flame", "Artist", "Tiger", "Warden", "Dancer", "Brekker"];

    return `${firstName[Math.floor(Math.random() * 9)]} ${lastName[Math.floor(Math.random() * 9)]}`;
}

document.addEventListener("visibilitychange", () => {
    if(document.hidden) {
        alert("Please stay on the Project, don't leave me :(");
    }
});