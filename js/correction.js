/* =========================================================
   COMPTE À REBOURS (pour compatibilité)
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

export function initMainCountdown() {
    if (window._countdownInterval) {
        clearInterval(window._countdownInterval);
    }
    window._countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
}