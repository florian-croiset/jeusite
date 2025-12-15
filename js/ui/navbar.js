/* =========================================================
   NAVBAR.JS
   Gère la navbar : réduction au scroll, burger menu,
   et barre de progression de défilement
   ========================================================= */

// --- Réduction de la navbar au scroll ---
const navbar = document.querySelector('nav');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.pageYOffset > 50);
});


// --- Barre de progression du scroll ---
window.addEventListener('scroll', () => {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  bar.style.width = `${(scrollTop / height) * 100}%`;
});


// BURGER MENU
const burger = document.getElementById("burger");
const navLinks = document.getElementById("nav-links");

burger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  burger.classList.toggle("active");
});

// Fermer le menu avec la touche Échap
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navLinks.classList.contains("active")) {
    navLinks.classList.remove("active");
    burger.classList.remove("active");
  }
});

// Fermer le menu en cliquant en dehors
document.addEventListener("click", (e) => {
  const isClickInsideBurger = burger.contains(e.target);
  const isClickInsideMenu = navLinks.contains(e.target);
  
  if (!isClickInsideBurger && !isClickInsideMenu && navLinks.classList.contains("active")) {
    navLinks.classList.remove("active");
    burger.classList.remove("active");
  }
});

// Fermer le menu en cas de scroll
window.addEventListener("scroll", () => {
  if (navLinks.classList.contains("active")) {
    navLinks.classList.remove("active");
    burger.classList.remove("active");
  }
});
