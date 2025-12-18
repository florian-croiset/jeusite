/* =========================================================
   GESTION DU CHARGEMENT ET DES ANIMATIONS (Chef d'orchestre)
   ========================================================= */

window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');

    setTimeout(() => {
        // 1. Cacher le Splash
        if (splash) {
            splash.classList.add('hidden');
            setTimeout(() => splash.remove(), 800);
        }

        // 2. Signal de départ pour les animations CSS (.loaded)
        document.body.classList.add('loaded');

        // 3. Initialisation des systèmes après un léger délai
        setTimeout(() => {
            // Lancer le compte à rebours
            initMainCountdown();

            // Activer l'observation des sections au scroll
            const sections = document.querySelectorAll('section:not(.hero)');
            sections.forEach(section => {
                sectionObserver.observe(section);
            });
        }, 500);

    }, 2200); // Temps du Splash Screen
});

/* =========================================================
   INTERSECTION OBSERVER (Animations au scroll)
   ========================================================= */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            sectionObserver.unobserve(entry.target); // On arrête d'observer une fois visible
        }
    });
}, observerOptions);

/* =========================================================
   FONCTION COMPTE À REBOURS ADAPTÉE
   ========================================================= */
const targetDate = new Date('2026-05-25T00:00:00').getTime();

export function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;
    const timerWrap = document.querySelector('.countdown-timer');

    if (diff <= 0) {
        if (timerWrap) {
            timerWrap.innerHTML = `
                <div class="countdown-item">
                    <span class="countdown-value">🎉</span>
                    <span class="countdown-label">Lancé !</span>
                </div>`;
        }
        if (window._countdownInterval) clearInterval(window._countdownInterval);
        return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const elD = document.getElementById('days');
    const elH = document.getElementById('hours');
    const elM = document.getElementById('minutes');
    const elS = document.getElementById('seconds');

    if (elD) elD.textContent = d;
    if (elH) elH.textContent = h.toString().padStart(2, '0');
    if (elM) elM.textContent = m.toString().padStart(2, '0');
    if (elS) elS.textContent = s.toString().padStart(2, '0');
}

// Dans screen.js
export function initMainCountdown() {
    // Si un intervalle existe déjà, on le détruit avant de recommencer
    if (window._countdownInterval) {
        clearInterval(window._countdownInterval);
    }
    window._countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
}
