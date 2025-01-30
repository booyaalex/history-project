const secondFirebaseConfig = {
    apiKey: "AIzaSyDspsa0eeswdZX91YWGg3uygsxmgiqvhd8",
    authDomain: "historyproject-a9cca.firebaseapp.com",
    databaseURL: "https://historyproject-a9cca-default-rtdb.firebaseio.com",
    projectId: "historyproject-a9cca",
    storageBucket: "historyproject-a9cca.appspot.com",
    messagingSenderId: "111673046869",
    appId: "1:111673046869:web:690062c4a33871b74d61dc"
};
firebase.initializeApp(secondFirebaseConfig);
const db = firebase.database();

var current_slide = 0;
var sound = 0;
let slide_data_array = [];



function slideForward() {
    current_slide++;
    db.ref("/Slide").update({
        slide: current_slide
    });
}

function slideBackward() {
    current_slide--;
    if (current_slide <= -1) {
        current_slide = 0;
    }
    db.ref("/Slide").update({
        slide: current_slide
    });
}

async function getSlideshowData() {
    const response = await fetch("json/slideData.json");
    const JSON = await response.json();
    console.log(JSON);

    slide_data_array = JSON;
}
getSlideshowData();

db.ref("/Slide").on("value", function (snapshot) {
    current_slide = snapshot.val().slide
    db.ref("/UserResponses").on("value", function (snapshot) {
        const response_box = document.getElementById("responseBox");
        response_box.innerHTML = "";
        snapshot.forEach((slide) => {
            if(slide.key != slide_data_array[current_slide].slideName) {
                return;
            }
            slide.forEach((r) => {
                const response = r.val();
                if(response.accepted != 0) {
                    return;
                }
                response_box.innerHTML += `<div id="${r.key}"><h3>${response.response}</h3><div><button id="acceptButton" class="smol" onclick="acceptResponse(this.parentNode.parentNode.id)"></button><button id="rejectButton" class="smol" onclick="rejectResponse(this.parentNode.parentNode.id)"></button></div></div>`;
            });
        });
    });
});



function acceptResponse(key) {
    db.ref("/UserResponses").child(slide_data_array[current_slide].slideName).child(key).update({
        accepted: 1
    });
}

function rejectResponse(key) {
    db.ref("/UserResponses").child(slide_data_array[current_slide].slideName).child(key).update({
        accepted: 2
    });
}

function soundTest() {
    db.ref("/Sound").update({
        slide: ++sound
    });
}