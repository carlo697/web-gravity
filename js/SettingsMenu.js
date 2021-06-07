import Game from "./Game.js";
import MassObj from "./MassObj.js";
import Vector2 from "./Vector2.js";

const sidebarButton = document.querySelector(".sidebar-button");
const sidebarWrapper = document.querySelector(".sidebar-wrapper");

// Forms
const renderingForm = document.querySelector("#renderingForm");
const planetarySystemForm = document.querySelector("#planetarySystemForm");

export function setupSidebar() {
    // Sidebar
    sidebarButton.addEventListener("click", handleSidebarButtonClick);

    // Rendering settings
    renderingForm.addEventListener("submit", handleRenderingFormSubmit);
    applyRenderingSettings();

    // Planetary system settings
    planetarySystemForm.addEventListener("submit", handlePlanetarySystemSubmit);

    // Default spawner
    applyPlanetarySystemSettings();
}

function handleSidebarButtonClick() {
    sidebarWrapper.classList.toggle("open");
}

function handleRenderingFormSubmit(e) {
    e.preventDefault();
    applyRenderingSettings();
}

function applyRenderingSettings() {
    const formData = new FormData(renderingForm);

    const skipRenderFrames = parseInt(formData.get("skipRenderFrames"));
    const renderSquares = formData.get("renderSquares") === "on";

    Game.instance.skipRenderFrames = skipRenderFrames;
    Game.instance.renderSquares = renderSquares;
}

function handlePlanetarySystemSubmit(e) {
    e.preventDefault();

    applyPlanetarySystemSettings();
}

function applyPlanetarySystemSettings() {
    const formData = new FormData(planetarySystemForm);

    const asteroids = parseInt(formData.get("asteroids"));
    const maxDistance = parseFloat(formData.get("maxDistance"));

    // Clear objs
    Game.instance.worldObjects.length = 0;

    // Create the sun
    const sunRadius = 15;
    Game.instance.sun = new MassObj(
        Game.instance.worldCenter,
        sunRadius,
        30000
    );
    Game.instance.sun.colorStyle = "rgb(255, 255, 255)";

    // Spawn random asteorids
    for (let i = 0; i < asteroids; i++) {
        // Get a random size
        const size = 0.5 + Math.random() * 1;

        // Get a random position and size
        const randomAngle = Math.random() * 2 * Math.PI;
        const randomDistance = Math.random() * maxDistance + (sunRadius * 1.5);
        const x = randomDistance * Math.sin(randomAngle);
        const y = randomDistance * Math.cos(randomAngle);

        // Spawn the asteorid
        const obj = new MassObj(new Vector2(x, y), size, size * size * 4);

        // get tangent direction
        const dirr = Game.instance.sun.position.substract(obj.position);
        const distance = dirr.magnitude;
        const dirrNormalized = dirr.normalized;
        // get a random value to alter the orbit a bit
        const random = 1 + (Math.random() * 2 - 1) * 0.1;

        // apply a velocity to make it orbit the sun
        obj.velocity = new Vector2(
            -dirrNormalized.y *
                Math.sqrt(Game.instance.sun.mass / distance) *
                random,
            dirrNormalized.x *
                Math.sqrt(Game.instance.sun.mass / distance) *
                random
        );

        // set a random color
        const r = 55 + Math.random() * 200;
        const g = 55 + Math.random() * 200;
        const b = 55 + Math.random() * 200;
        obj.colorStyle = `rgb(${r},${g},${b})`;
    }
}
