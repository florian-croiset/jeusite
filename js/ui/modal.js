/* =========================================================
   MODAL.JS
   Fenêtres modales : accès secret + partage du site
   ========================================================= */

// ---------------------------------------------------------
// 1. MODALE SECRÈTE
// ---------------------------------------------------------

const modal        = document.getElementById('secretModal');
const secretBtn    = document.getElementById('versionAccessBtn');
const input        = document.getElementById('secretInput');
const cancelBtn    = document.getElementById('cancelSecret');
const confirmBtn   = document.getElementById('confirmSecret');
const copyLock     = document.getElementById('copyLock');

const codeSecret   = 'N1ghtberryV1.2';
const lienVersions = 'versions.html';

// --- Ouvrir la modale
if (secretBtn && modal && input) {
  secretBtn.addEventListener('click', () => {
    document.body.style.overflow = 'hidden';
    modal.classList.add('active');
    input.value = '';
    setTimeout(() => input.focus(), 200);
  });
}

// --- Fermer la modale
function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
if (modal) {
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
}

// --- Validation du code secret
if (confirmBtn) {
  confirmBtn.addEventListener('click', () => {
    if (input.value === codeSecret) {
      closeModal();
      window.open(lienVersions, '_blank');
    } else {
      input.style.borderColor = 'red';
      setTimeout(() => {
        input.style.borderColor = 'rgba(102,126,234,0.4)';
      }, 1000);
    }
  });
}

// --- Raccourcis clavier : Échap pour fermer, Entrée pour valider
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && modal.classList.contains('active')) {
    confirmBtn?.click();
  }
});

// --- Copier le code secret depuis l’icône cadenas
if (copyLock) {
  copyLock.addEventListener('click', () => {
    navigator.clipboard.writeText(codeSecret).catch(err => console.error('Erreur copie :', err));
    copyLock.style.transition = 'transform 0.3s ease, color 0.3s ease';
    copyLock.style.transform = 'scale(1.2)';
    copyLock.style.color = 'var(--debut)';
    setTimeout(() => {
      copyLock.style.transform = 'scale(1)';
      copyLock.style.color = '';
    }, 400);
  });
}


// ---------------------------------------------------------
// 2. MODALE DE PARTAGE
// ---------------------------------------------------------
const shareBtn      = document.getElementById('shareBtn');
const shareModal    = document.getElementById('shareModal');
const closeShareBtn = document.getElementById('closeShare');
const copyLinkBtn   = document.getElementById('copyLinkBtn');
const shareLinkInput= document.getElementById('shareLinkInput');
const qrCodeImg     = document.getElementById('qrCodeImg');

const siteUrl = window.location.href;

// --- Ouvrir via bouton partager
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    // 1. Tentative de partage natif (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title:  'Echo - Team Nightberry',
          text:   'Découvrez Echo, une aventure intense dans un futur dystopique !',
          url:    siteUrl
        });
      } catch (err) {
        console.warn('Partage annulé ou erreur.');
      }
    }
    // 2. Sinon, fallback = ouverture de la modale
    else {
      openShareModal();
    }
  });
}

// --- Fonction d’ouverture de la modale de partage
function openShareModal() {
  if (!shareModal) return;

  // Remplir le champ avec l’URL
  shareLinkInput.value = siteUrl;

  // Générer le QR code via l’API goQR.me
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(siteUrl)}&color=00d0c6&bgcolor=0f0f0f`;
  if (qrCodeImg) qrCodeImg.src = qrApiUrl;

  document.body.style.overflow = 'hidden';
  shareModal.classList.add('active');
}

// --- Fermer la modale
if (closeShareBtn) {
  closeShareBtn.addEventListener('click', () => {
    shareModal.classList.remove('active');
    document.body.style.overflow = '';
  });
}

// --- Copier le lien depuis la modale
if (copyLinkBtn && shareLinkInput) {
  copyLinkBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(siteUrl).then(() => {
      const originalText = 'Copier';
      copyLinkBtn.classList.add('copied');
      copyLinkBtn.textContent = 'Copié !';
      setTimeout(() => {
        copyLinkBtn.classList.remove('copied');
        copyLinkBtn.textContent = originalText;
      }, 2000);
    }).catch(err => console.error('Erreur copie du lien :', err));
  });
}
