// Copier / coller / effacer dans la modale secrète
const pasteBtn  = document.getElementById('pasteBtn');
const clearBtn  = document.getElementById('clearBtn');
const secretInp = document.getElementById('secretInput');

if (pasteBtn && secretInp) {
  pasteBtn.addEventListener('click', async () => {
    try {
      const pasteText = await navigator.clipboard.readText();
      secretInp.value = pasteText || '';
      if (typeof window.sendDiscordNotification === 'function') {
          window.sendDiscordNotification('secret_code_pasted', {
              length: pasteText.length
          });
      }

      pasteBtn.style.color = 'var(--finn)';
      setTimeout(() => { pasteBtn.style.color = 'var(--debut)'; }, 300);

      secretInp.focus();
    } catch (err) {
      console.error('Impossible de coller :', err);
      alert('⚠️ Impossible de coller : autorisez l’accès au presse‑papier.');
    }
  });
}

if (clearBtn && secretInp) {
  clearBtn.addEventListener('click', () => {
    secretInp.value = '';
    if (typeof window.sendDiscordNotification === 'function') {
        window.sendDiscordNotification('secret_code_cleared', {});
    }

    clearBtn.style.color = 'red';
    setTimeout(() => { clearBtn.style.color = 'var(--debut)'; }, 300);

    secretInp.focus();
  });
}
