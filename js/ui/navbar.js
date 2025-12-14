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


// --- Menu Burger ---
const burger = document.getElementById('burger');
const navLinks = document.getElementById('nav-links');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Fermeture du menu au clic sur un lien
  document.querySelectorAll('#nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        // Reutilise smoothScrollTo si défini ailleurs
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      navLinks.classList.remove('active');
      burger.classList.remove('active');
    });
  });
}
