/* =========================================================
   CLIPBOARD.JS
   Gestion des actions de copier / coller / effacer dans la modale secrète
   ========================================================= */

// ---------------------------------------------------------
// 1. RÉFÉRENCES AUX ÉLÉMENTS
// ---------------------------------------------------------
const pasteBtn  = document.getElementById('pasteBtn');
const clearBtn  = document.getElementById('clearBtn');
const secretInp = document.getElementById('secretInput');


// ---------------------------------------------------------
// 2. BOUTON "COLLER" : Lit le presse‑papier et colle la valeur
// ---------------------------------------------------------
if (pasteBtn && secretInp) {
  pasteBtn.addEventListener('click', async () => {
    try {
      const pasteText = await navigator.clipboard.readText();
      secretInp.value = pasteText || '';
      // 📊 Tracking: Code collé
if (typeof window.sendDiscordNotification === 'function') {
    window.sendDiscordNotification('secret_code_pasted', {
        length: pasteText.length
    });
}

      // feedback visuel
      pasteBtn.style.color = 'var(--finn)';
      setTimeout(() => { pasteBtn.style.color = 'var(--debut)'; }, 300);

      secretInp.focus();
    } catch (err) {
      console.error('Impossible de coller :', err);
      alert('⚠️ Impossible de coller : autorisez l’accès au presse‑papier.');
    }
  });
}


// ---------------------------------------------------------
// 3. BOUTON "EFFACER" : Vide le champ input secret
// ---------------------------------------------------------
if (clearBtn && secretInp) {
  clearBtn.addEventListener('click', () => {
    secretInp.value = '';
    // 📊 Tracking: Code effacé
if (typeof window.sendDiscordNotification === 'function') {
    window.sendDiscordNotification('secret_code_cleared', {});
}

    clearBtn.style.color = 'red';
    setTimeout(() => { clearBtn.style.color = 'var(--debut)'; }, 300);

    secretInp.focus();
  });
}
