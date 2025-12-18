// ==========================================
// CENTRALISATION DU CHARGEMENT (CHEF D'ORCHESTRE)
// ==========================================
window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');

    // 1. On définit le temps d'affichage du Splash (ex: 2.2 secondes)
    setTimeout(() => {
        // 2. Disparition du Splash
        if (splash) {
            splash.classList.add('hidden');
            // Optionnel : on le retire du DOM après l'effet de fondu
            setTimeout(() => splash.remove(), 800);
        }

        // 3. LE SIGNAL DE DÉPART : On ajoute .loaded au body
        // C'est cette ligne qui déclenche les animations CSS définies plus haut
        document.body.classList.add('loaded');

        // 4. On lance les scripts de calcul (Compteurs, Observers de scroll)
        // On attend 500ms après l'ouverture pour que les calculs ne ralentissent pas l'anim
        setTimeout(() => {
            if (typeof updateTestCountdown === "function") {
                updateTestCountdown();
                setInterval(updateTestCountdown, 1000);
            }
            
            // Activer l'observer pour les autres sections du site
            const sections = document.querySelectorAll('section:not(.hero)');
            sections.forEach(section => {
                observer.observe(section);
            });
        }, 500);

    }, 1000); /*2200*/
});

// ==========================================
// GESTION DES SECTIONS AU SCROLL
// ==========================================
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optionnel: on arrête d'observer une fois affiché
            sectionObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

function initScrollObserver() {
    const sections = document.querySelectorAll('section:not(.hero)');
    sections.forEach(sec => sectionObserver.observe(sec));
}

// ==========================================
// ANIMATION DES COMPTEURS (COUNTDOWN)
// ==========================================
function initCountdownAnimation() {
    // On récupère les IDs des blocs countdown
    const ids = ['days', 'hours', 'minutes', 'seconds'];
    
    ids.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el) {
            // On anime l'opacité du bloc parent d'abord
            const parent = el.closest('.countdown-item');
            setTimeout(() => {
                if (parent) parent.style.opacity = "1";
                if (parent) parent.style.transform = "translateY(0)";
                
                // Ici tu peux appeler une fonction de montée de chiffres si tu veux
                // animateValue(el, 0, parseInt(el.textContent), 1000);
            }, index * 200); // Décalage en cascade
        }
    });
}
