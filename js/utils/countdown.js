/* =========================================================
   COUNTDOWN.JS
   Gestion du compte à rebours principal (date de lancement)
   ========================================================= */

// ---------------------------------------------------------
// 1. CONFIGURATION
// ---------------------------------------------------------
const targetDate = new Date('2026-05-25T00:00:00').getTime();

export function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;
    const timerWrap = document.querySelector('.countdown-timer');

    // 1. Gestion de la fin du compte à rebours
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

    // 2. Calculs
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    // 3. Récupération des éléments
    const daysEl    = document.getElementById('days');
    const hoursEl   = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    // 4. Mise à jour sécurisée avec formatage (ex: 09 au lieu de 9)
    if (daysEl)    daysEl.textContent    = d;
    if (hoursEl)   hoursEl.textContent   = h.toString().padStart(2, '0');
    if (minutesEl) minutesEl.textContent = m.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = s.toString().padStart(2, '0');
}

// 5. Lancement
if (window._countdownInterval) clearInterval(window._countdownInterval);
window._countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();
