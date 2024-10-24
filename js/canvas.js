window.onload = function () {
    board = document.getElementById("myCanvas");
    ctx = board.getContext("2d");

    requestAnimationFrame(update);
};

function update() {
    requestAnimationFrame(update);
    ctx.clearRect(0, 0, boardWidth, boardHeight);


}