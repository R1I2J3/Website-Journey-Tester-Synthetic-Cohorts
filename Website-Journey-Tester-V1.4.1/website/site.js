const menuButton = document.querySelector(".menu-toggle");
const primaryLinks = document.querySelector("#primary-links");

if (menuButton && primaryLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    primaryLinks.classList.toggle("is-open", !isOpen);
  });
}
