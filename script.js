const cards = [...document.querySelectorAll(".place-card")];
const categoryButtons = [...document.querySelectorAll(".category-chip")];
const searchInput = document.querySelector("#search-input");
const regionSelect = document.querySelector("#region-select");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const savedCount = document.querySelector("#saved-count");
const savedToggle = document.querySelector("#saved-toggle");
const toast = document.querySelector("#toast");
const savedKey = "weekend-atlas-saved";

let activeCategory = "all";
let showSavedOnly = false;
let toastTimer;

function readSavedPlaces() {
  try {
    const stored = JSON.parse(localStorage.getItem(savedKey) || "[]");
    return Array.isArray(stored) ? stored.filter((place) => typeof place === "string") : [];
  } catch (error) {
    console.error("Could not read saved escapes from local storage.", error);
    return [];
  }
}

let savedPlaces = readSavedPlaces();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function updateSavedButtons() {
  savedCount.textContent = String(savedPlaces.length);
  document.querySelectorAll(".save-place").forEach((button) => {
    const isSaved = savedPlaces.includes(button.dataset.place);
    button.setAttribute("aria-pressed", String(isSaved));
    button.setAttribute("aria-label", `${isSaved ? "Remove" : "Save"} ${button.getAttribute("aria-label").replace(/^(Save|Remove) /, "")}`);
  });
}

function filterPlaces() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const region = regionSelect.value;
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
    const matchesRegion = region === "all" || card.dataset.region === region;
    const matchesSearch = !query || card.dataset.search.includes(query) || card.textContent.toLocaleLowerCase().includes(query);
    const matchesSaved = !showSavedOnly || savedPlaces.includes(card.querySelector(".save-place").dataset.place);
    const isVisible = matchesCategory && matchesRegion && matchesSearch && matchesSaved;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  resultCount.textContent = `${String(visibleCount).padStart(2, "0")} ${visibleCount === 1 ? "place" : "places"} to begin`;
  emptyState.hidden = visibleCount > 0;
  document.querySelector("#places-grid").hidden = visibleCount === 0;
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    categoryButtons.forEach((chip) => chip.classList.toggle("is-active", chip === button));
    filterPlaces();
  });
});

searchInput.addEventListener("input", filterPlaces);
regionSelect.addEventListener("change", filterPlaces);
document.querySelector("#search-submit").addEventListener("click", () => {
  filterPlaces();
  document.querySelector("#discover-title").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll(".save-place").forEach((button) => {
  button.addEventListener("click", () => {
    const place = button.dataset.place;
    savedPlaces = savedPlaces.includes(place)
      ? savedPlaces.filter((savedPlace) => savedPlace !== place)
      : [...savedPlaces, place];
    localStorage.setItem(savedKey, JSON.stringify(savedPlaces));
    updateSavedButtons();
    filterPlaces();
    showToast(savedPlaces.includes(place) ? "Tucked away for your next free day." : "Removed from your saved escapes.");
  });
});

savedToggle.addEventListener("click", () => {
  showSavedOnly = !showSavedOnly;
  savedToggle.setAttribute("aria-pressed", String(showSavedOnly));
  savedToggle.querySelector("span:nth-of-type(2)").textContent = showSavedOnly ? "All places" : "Saved";
  filterPlaces();
  document.querySelector("#discover").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#reset-filters").addEventListener("click", () => {
  activeCategory = "all";
  showSavedOnly = false;
  searchInput.value = "";
  regionSelect.value = "all";
  savedToggle.setAttribute("aria-pressed", "false");
  savedToggle.querySelector("span:nth-of-type(2)").textContent = "Saved";
  categoryButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.category === "all"));
  filterPlaces();
});

document.querySelectorAll("[data-collection]").forEach((collection) => {
  collection.addEventListener("click", () => {
    activeCategory = collection.dataset.collection;
    showSavedOnly = false;
    savedToggle.setAttribute("aria-pressed", "false");
    savedToggle.querySelector("span:nth-of-type(2)").textContent = "Saved";
    categoryButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.category === activeCategory));
    filterPlaces();
  });
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const emailInput = document.querySelector("#email-input");
  if (!emailInput.checkValidity()) {
    emailInput.reportValidity();
    return;
  }
  document.querySelector("#form-message").textContent = "You're on the list. Look out for a little wonder soon.";
  emailInput.value = "";
});

const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector(".desktop-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  mainNav.classList.toggle("is-open", isOpen);
});
mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mainNav.classList.remove("is-open");
  });
});

document.querySelector("#year").textContent = String(new Date().getFullYear());
updateSavedButtons();
filterPlaces();
