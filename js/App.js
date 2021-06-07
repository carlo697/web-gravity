import Game from "./Game.js";
const canvas = document.getElementById("canvas");

const game = new Game(canvas);

requestAnimationFrame(handleGameLoop);

function handleGameLoop(elapsedTime) {
    game.update(elapsedTime);
    requestAnimationFrame(handleGameLoop);
}
