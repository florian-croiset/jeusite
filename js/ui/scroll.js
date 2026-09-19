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

scrollTopBtn.style.display = 'none';

let isNavigating = false;

function smoothScrollTo(target) {
  if (isNavigating) return;

  isNavigating = true;

  document.documentElement.style.scrollSnapType = 'none';

  const navbarHeight = 80;
  const targetPosition = target.offsetTop - navbarHeight;

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });

  setTimeout(() => {
    isNavigating = false;
    document.documentElement.style.scrollSnapType = 'y mandatory';
  }, 1000);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const currentHref = this.getAttribute('href');

    if (!currentHref || !currentHref.startsWith('#')) {
        return; 
    }

    e.preventDefault();
    
    if (currentHref === '#') return;

    try {
        const target = document.querySelector(currentHref);
        if (target) {
            smoothScrollTo(target);
        }
    } catch (error) {
        console.warn("Navigation ignorée pour : ", currentHref);
    }
  });
});
