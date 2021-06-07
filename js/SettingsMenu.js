import Game from "./Game.js";

const sidebarButton = document.querySelector(".sidebar-button");
const sidebarWrapper = document.querySelector(".sidebar-wrapper");
const form = document.querySelector("form");

export function setupSidebar() {
    sidebarButton.addEventListener("click", handleSidebarButtonClick);
    form.addEventListener("submit", handleSubmit);

    applyChanges();
}

function handleSubmit(e) {
    e.preventDefault();

    applyChanges();
}

function applyChanges() {
    const formData = new FormData(form);

    const skipRenderFrames = parseInt(formData.get("skipRenderFrames"));
    const renderSquares = formData.get("renderSquares") === "on";
    
    Game.instance.skipRenderFrames = skipRenderFrames;
    Game.instance.renderSquares = renderSquares;
}

function handleSidebarButtonClick() {
    sidebarWrapper.classList.toggle("open");
}
