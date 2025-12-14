/* =========================================================
   SCROLL.JS
   Gère les effets et comportements de défilement :
   - Bouton scroll top
   - Animation des sections
   - Navigation fluide
   ========================================================= */

// Bouton scroll to top
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    scrollTopBtn.style.display = 'flex';
  } else {
    scrollTopBtn.style.display = 'none';
  }
});

scrollTopBtn.addEventListener('click', () => {
  if (isNavigating) return;

  isNavigating = true;
  document.documentElement.style.scrollSnapType = 'none';

  // Scroll avec easing (ralentissement progressif)
  const startPosition = window.scrollY;
  const startTime = performance.now();
  const duration = 2500; // Durée totale en ms

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animateScroll(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easing = easeInOutCubic(progress);

    window.scrollTo(0, startPosition * (1 - easing));

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    } else {
      setTimeout(() => {
        isNavigating = false;
        document.documentElement.style.scrollSnapType = 'y mandatory';
      }, 1000);
    }
  }

  requestAnimationFrame(animateScroll);
});

// Animations au scroll des sections
const sections = document.querySelectorAll('section');

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

sections.forEach(section => {
  if (!section.classList.contains('hero')) {
    observer.observe(section);
  }
});

// Masquer le bouton scroll au chargement
scrollTopBtn.style.display = 'none';

// Smooth scroll SIMPLE et FONCTIONNEL
let isNavigating = false;

function smoothScrollTo(target) {
  if (isNavigating) return;

  isNavigating = true;

  // Désactiver scroll-snap pendant la navigation
  document.documentElement.style.scrollSnapType = 'none';

  // Calculer la position en tenant compte de la navbar (60px de hauteur)
  const navbarHeight = 80;
  const targetPosition = target.offsetTop - navbarHeight;

  // Scroll plus lent et fluide
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });

  // Réactiver le scroll-snap après 3 secondes (plus long pour le scroll lent)
  setTimeout(() => {
    isNavigating = false;
    document.documentElement.style.scrollSnapType = 'y mandatory';
  }, 1000);// 3000
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      smoothScrollTo(target);
    }
  });
});
