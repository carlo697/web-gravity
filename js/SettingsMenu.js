const sidebarButton = document.querySelector(".sidebar-button");
const sidebarWrapper = document.querySelector(".sidebar-wrapper");
const form = document.querySelector("form");

setupEvents();

function setupEvents() {
    sidebarButton.addEventListener("click", handleSidebarButtonClick);
    form.addEventListener("submit", handleSubmit);
}

function handleSubmit(e) {
    e.preventDefault();

    console.log("submit")
}

function handleSidebarButtonClick() {
    sidebarWrapper.classList.toggle("open");
}
