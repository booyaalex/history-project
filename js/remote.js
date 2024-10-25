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

db.ref("/Slide").on("value", function (snapshot) {
    current_slide = snapshot.val().slide;
});

function slideForward() {
    current_slide++;
    db.ref("/Slide").update({
        slide: current_slide
    });
}

function slideBackward() {
    current_slide--;
    if(current_slide <= -1) {
        current_slide = 0;
    }
    db.ref("/Slide").update({
        slide: current_slide
    });
}