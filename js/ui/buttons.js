/* =========================================================
   BUTTONS.JS
   Gestion des boutons (Télécharger / Sablier / CTA / Feedback visuel)
   ========================================================= */

// --- IMPORTS ---
import { updateCountdown } from '../utils/screen.js';
// import { updateCountdown } from '../utils/countdown.js';

// ---------------------------------------------------------
// 1. DÉTERMINE SI ON EST SUR MOBILE
// ---------------------------------------------------------
function estSurMobile() {
  return window.innerWidth <= 768;
}

// ---------------------------------------------------------
// 2. GESTION DE LA DISPONIBILITÉ DES BOUTONS DE TÉLÉCHARGEMENT
// ---------------------------------------------------------
let jeuDispo = false; // disponible ou pas

function appliquerDisponibiliteBouton(bouton) {
  if (!bouton) return;

  const infoSpan = document.createElement('span');
  infoSpan.style.position = 'absolute';
  infoSpan.style.bottom = '6px';
  infoSpan.style.left = '50%';
  infoSpan.style.transform = 'translateX(-50%)';
  infoSpan.style.fontSize = '0.65rem';
  infoSpan.style.opacity = '0.8';
  infoSpan.style.pointerEvents = 'none';
  infoSpan.style.fontWeight = 'normal';
  infoSpan.style.whiteSpace = 'nowrap';

  // Sur mobile => message d’indisponibilité
  if (estSurMobile()) {
    bouton.innerHTML = '<i class="fa-solid fa-download fa-bounce"></i> Télécharger le jeu';
    infoSpan.innerHTML = '<span class="icon-stack"><i class="fa-solid fa-mobile-alt"></i><i class="fa-solid fa-slash"></i></span> Jeu non disponible sur mobile';
    bouton.style.opacity = '0.3';
    bouton.style.cursor = 'not-allowed';
    bouton.style.pointerEvents = 'none';
  }
  // Sur desktop => logique selon disponibilité
  else {
    if (jeuDispo) {
      bouton.innerHTML = '<i class="fa-solid fa-download fa-bounce"></i> Télécharger le jeu';
      infoSpan.textContent = 'v1.0';
      bouton.style.opacity = '1';
      bouton.style.cursor = 'pointer';
      bouton.style.pointerEvents = 'auto';
    } else {
      bouton.innerHTML = '<i class="fa-solid fa-download"></i> Télécharger le jeu';
      infoSpan.innerHTML = '<i class="fa-solid fa-hourglass-half fa-fade"></i> Bientôt disponible';
      bouton.style.opacity = '0.3';
      bouton.style.cursor = 'not-allowed';
      bouton.style.pointerEvents = 'none';
    }
  }

  bouton.style.position = 'relative';
  bouton.appendChild(infoSpan);
}

// CIBLES DES BOUTONS
const btnHero = document.querySelector('.hero .btn-primary');
const btnTelecharger = document.querySelector('#telecharger .btn-primary');

// Application initiale
appliquerDisponibiliteBouton(btnHero);
appliquerDisponibiliteBouton(btnTelecharger);

// Réadapter si redimensionnement de fenêtre
window.addEventListener('resize', () => {
  appliquerDisponibiliteBouton(btnHero);
  appliquerDisponibiliteBouton(btnTelecharger);
});


// ---------------------------------------------------------
// 3. SABLIER (MODE TEST DE 10 s POUR DÉBLOQUER LE TÉLÉCHARGEMENT)
// ---------------------------------------------------------
const sablierBtn = document.getElementById('sablierBtn');
let testInterval = null; // Déclaré à l'extérieur pour pouvoir le stopper

if (sablierBtn) {
  sablierBtn.addEventListener('click', () => {
    
    // --- L'ACTION CRUCIALE ICI ---
    // On arrête l'intervalle global de 2026 défini dans screen.js
    if (window._countdownInterval) {
      clearInterval(window._countdownInterval);
      window._countdownInterval = null; 
    }
    
    // On arrête un ancien test si l'utilisateur reclique comme un fou
    if (testInterval) clearInterval(testInterval);

    // Reset des boutons et du titre
    jeuDispo = false;
    appliquerDisponibiliteBouton(btnHero);
    appliquerDisponibiliteBouton(btnTelecharger);

    const titre = document.querySelector('.countdown-title');
    if (titre) titre.style.display = 'block';

    // Animation Sablier
    sablierBtn.style.color = 'var(--finn)';
    sablierBtn.style.transform = 'rotate(15deg) scale(1.3)';

    // Config du test 10s
    const testTarget = Date.now() + 10 * 1000;

    function updateTestCountdown() {
      const distance = testTarget - Date.now();

      if (distance <= 0) {
        jeuDispo = true;
        appliquerDisponibiliteBouton(btnHero);
        appliquerDisponibiliteBouton(btnTelecharger);
        
        document.querySelector('.countdown-timer').innerHTML = `
          <div class="countdown-item"><span class="countdown-value">🎉</span><span class="countdown-label">Lancé&nbsp;!</span></div>`;

        if (titre) titre.style.display = 'none';
        clearInterval(testInterval);
        sablierBtn.style.color = '';
        sablierBtn.style.transform = '';
        return;
      }

      // Affichage formaté 00
      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      document.getElementById('days').textContent = d;
      document.getElementById('hours').textContent = h.toString().padStart(2, '0');
      document.getElementById('minutes').textContent = m.toString().padStart(2, '0');
      document.getElementById('seconds').textContent = s.toString().padStart(2, '0');
    }

    // Réinjecte le HTML si on était sur le message "Lancé 🎉"
    const timer = document.querySelector('.countdown-timer');
    if (timer && !document.getElementById('days')) {
      timer.innerHTML = `
        <div class="countdown-item"><span class="countdown-value" id="days">0</span><span class="countdown-label">Jours</span></div>
        <div class="countdown-item"><span class="countdown-value" id="hours">00</span><span class="countdown-label">Heures</span></div>
        <div class="countdown-item"><span class="countdown-value" id="minutes">00</span><span class="countdown-label">Minutes</span></div>
        <div class="countdown-item"><span class="countdown-value" id="seconds">00</span><span class="countdown-label">Secondes</span></div>`;
    }

    updateTestCountdown();
    testInterval = setInterval(updateTestCountdown, 1000);
  });
}

// ---------------------------------------------------------
// 4. FEEDBACK VISUEL / SONORE SUR LES BOUTONS
// ---------------------------------------------------------
const audioVis = document.getElementById('audioVisualizer');

function triggerAudioReaction() {
  if (!audioVis) return;
  audioVis.classList.add('active');
  setTimeout(() => audioVis.classList.remove('active'), 800);
}

// Pulsation à chaque clic sur un bouton principal ou secondaire
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
  btn.addEventListener('click', () => triggerAudioReaction());
});
