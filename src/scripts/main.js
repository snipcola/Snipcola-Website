// Variables
const html = document.documentElement;

// Functions
function setThemeVal(theme) {
  localStorage.setItem("sn-theme", theme);
}

function getThemeVal() {
  const val = localStorage.getItem("sn-theme");
  return val && val !== "auto" ? val : null;
}

function getThemeAbsolute() {
  return getThemeVal() || "auto";
}

function resetTheme() {
  html.classList.remove("light");
  html.classList.remove("dark");
}

function getTheme() {
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isDarkMode ? "dark" : "light";
}

function setTheme() {
  resetTheme();

  const theme = getThemeVal();
  if (theme) html.classList.add(theme);
}

function resetThemeButton(icon) {
  icon.classList.remove("icon-desktop");
  icon.classList.remove("icon-sun");
  icon.classList.remove("icon-moon");
}

function setThemeButton(icon) {
  const theme = getThemeAbsolute();
  resetThemeButton(icon);

  switch (theme) {
    case "dark":
      icon.classList.add("icon-moon");
      break;
    case "light":
      icon.classList.add("icon-sun");
      break;
    default:
      icon.classList.add("icon-desktop");
  }
}

function initThemeButton() {
  const button = document.querySelector(".header .button.theme");
  const icon = button.querySelector(".icon");

  button.addEventListener("click", function () {
    const list = ["auto", "dark", "light"];
    const index = list.indexOf(getThemeAbsolute());

    setThemeVal(list[index + 1] || list[0]);
    setThemeButton(icon);
    setTheme();
  });

  setThemeButton(icon);
}

function setFooter() {
  const text = document.querySelector(".footer .copyright");
  text.innerText = `© ${new Date().getFullYear()} Snipcola`;
}

// Event Listener
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", setTheme);
setTheme();

// Load
document.addEventListener("DOMContentLoaded", function () {
  initThemeButton();
  setFooter();
});
