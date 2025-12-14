/* =========================================================
   COUNTDOWN.JS
   Gestion du compte à rebours principal (date de lancement)
   ========================================================= */

// ---------------------------------------------------------
// 1. CONFIGURATION
// ---------------------------------------------------------
const targetDate = new Date('2026-05-25T00:00:00').getTime();

// Récupération des éléments du DOM
const daysEl    = document.getElementById('days');
const hoursEl   = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const timerWrap = document.querySelector('.countdown-timer');


// ---------------------------------------------------------
// 2. FONCTION DE MISE À JOUR
// ---------------------------------------------------------
export function updateCountdown() {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl || !timerWrap) return;

  if (distance < 0) {
    timerWrap.innerHTML = `
      <div class="countdown-item">
        <span class="countdown-value">🎉</span>
        <span class="countdown-label">Lancé !</span>
      </div>`;
    clearInterval(window._countdownInterval);
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  daysEl.textContent    = days;
  hoursEl.textContent   = hours.toString().padStart(2, '0');
  minutesEl.textContent = minutes.toString().padStart(2, '0');
  secondsEl.textContent = seconds.toString().padStart(2, '0');
}


// ---------------------------------------------------------
// 3. INITIALISATION AUTOMATIQUE
// ---------------------------------------------------------
window._countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();
