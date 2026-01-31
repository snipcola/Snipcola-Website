// Types
type Theme = "auto" | "dark" | "light";

// Constants
const VALID_THEMES = ["dark", "light"] as const;

// Variables
const html: HTMLElement = document.documentElement;

// Functions
function setThemeVal(theme: Theme) {
  localStorage.setItem("sn-theme", theme);
}

function getThemeVal(): (typeof VALID_THEMES)[number] | null {
  const val: string | null = localStorage.getItem("sn-theme");

  if (val && (VALID_THEMES as readonly string[]).includes(val)) {
    return val as (typeof VALID_THEMES)[number];
  }

  return null;
}

function getThemeAbsolute(): Theme {
  return getThemeVal() || "auto";
}

function resetTheme() {
  html.classList.remove("dark", "light");
}

function getSystemTheme(): (typeof VALID_THEMES)[number] {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setTheme() {
  resetTheme();
  const theme: string = getThemeVal() || getSystemTheme();
  html.classList.add(theme);
}

function resetThemeButton(icon: HTMLElement) {
  icon.classList.remove("icon-desktop", "icon-sun", "icon-moon");
}

function setThemeButton(icon: HTMLElement) {
  const theme: string = getThemeAbsolute();
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
  const button: HTMLElement | null = document.querySelector(
    ".header .button.theme",
  );
  const icon: HTMLElement | undefined | null = button?.querySelector(".icon");

  if (!button || !icon) return;

  button.addEventListener("click", function () {
    const list = ["auto", "dark", "light"] as const;
    const current: Theme = getThemeAbsolute();
    const index: number = list.indexOf(current);

    const nextIndex: number = (index + 1) % list.length;
    const nextTheme: Theme = list[nextIndex]!;

    setThemeVal(nextTheme);
    setThemeButton(icon);
    setTheme();
  });

  setThemeButton(icon);
}

function setFooter() {
  const text: HTMLElement | null = document.querySelector(".footer .copyright");
  const year: string = new Date().getFullYear().toString();

  if (text && !text.innerText.includes(year)) {
    text.innerText = `© ${year} ${text.textContent}`;
  }
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
