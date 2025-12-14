/* =========================================================
   SCROLL.JS
   Gère les effets et comportements de défilement :
   - Bouton scroll top
   - Animation des sections
   - Navigation fluide
   ========================================================= */

const scrollTopBtn = document.getElementById('scrollTopBtn');

if (scrollTopBtn) {
  scrollTopBtn.style.display = 'none';

  window.addEventListener('scroll', () => {
    scrollTopBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
  });

  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Apparition fluide des sections
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('visible'));
}, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

sections.forEach(section => !section.classList.contains('hero') && observer.observe(section));

// Défilement fluide vers les ancres
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });
});
