import Game from "./Game.js";
import { setupSidebar } from "./SettingsMenu.js";
const canvas = document.getElementById("canvas");

const game = new Game(canvas);
setupSidebar();

requestAnimationFrame(handleGameLoop);

function handleGameLoop(elapsedTime) {
  game.update(elapsedTime);
  requestAnimationFrame(handleGameLoop);
}
