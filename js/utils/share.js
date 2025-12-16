/* =========================================================
   SHARE.JS
   Gestion unifiée du partage (Public/Privé + Mobile/Desktop)
   ========================================================= */

// ---------------------------------------------------------
// 1. CONFIGURATION
// ---------------------------------------------------------
export const siteUrl = window.location.href;
const titleText = 'Echo - Team Nightberry';
const shareText = 'Découvrez Echo, une aventure intense dans un futur dystopique !';

// ---------------------------------------------------------
// 2. PARTAGE NATIF (API Web Share)
// ---------------------------------------------------------
export async function shareNative() {
  if (!navigator.share) return false; // API non supportée

  try {
    await navigator.share({
      title: titleText,
      text:  shareText,
      url:   siteUrl
    });
    return true; // Partage réussi
  } catch (err) {
    // console.warn('Partage annulé ou non supporté', err);
    return false; // Erreur ou annulation par l'utilisateur
  }
}

// ---------------------------------------------------------
// 3. GESTION DE LA MODALE CLASSIQUE (QR Code)
// ---------------------------------------------------------
export function openShareModal() {
  const modal   = document.getElementById('shareModal');
  const linkInp = document.getElementById('shareLinkInput');
  const qrImg   = document.getElementById('qrCodeImg');

  if (!modal) return;

  // Remplir l'input avec l'URL
  if (linkInp) linkInp.value = siteUrl;

  // Génération du QR Code
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(siteUrl)}&color=00d0c6&bgcolor=0f0f0f`;
  if (qrImg) qrImg.src = qrApiUrl;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Bloque le scroll
}

export function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = ''; 
}

// ---------------------------------------------------------
// 4. GESTION DE LA MODALE PRIVÉE (Interdit)
// ---------------------------------------------------------
export function openPrivateShareModal() {
  const modal = document.getElementById("privateShareModal");
  if (!modal) return;
  
  modal.classList.add("active");
  document.body.style.overflow = 'hidden';
}

export function closePrivateShareModal() {
  const modal = document.getElementById("privateShareModal");
  if (!modal) return;
  
  modal.classList.remove("active");
  document.body.style.overflow = '';
}

// ---------------------------------------------------------
// 5. COPIE DU LIEN
// ---------------------------------------------------------
const copyBtn = document.getElementById('copyLinkBtn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(siteUrl).then(() => {
            const original = copyBtn.textContent;
            copyBtn.textContent = 'Copié !';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = original;
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(err => console.error('Erreur copie', err));
    });
}

// ---------------------------------------------------------
// 6. LOGIQUE CENTRALE (Au Clic sur le Bouton)
// ---------------------------------------------------------
document.addEventListener("click", async function (e) {
    // On cible le bouton (ou son icône intérieure)
    const btn = e.target.closest("#shareBtn");
    
    // Si ce n'est pas le bouton share, on ne fait rien
    if (!btn) return;

    e.preventDefault();

    // LECTURE DE L'ATTRIBUT HTML pour savoir si c'est autorisé
    // "true" (string) devient true (boolean), tout le reste devient false
    const isSharingAllowed = btn.dataset.allowShare === "true";

    if (isSharingAllowed) {
        // CAS 1 : Page Publique
        // D'abord on tente le natif (mobile)
        const success = await shareNative();
        
        // Si le natif échoue (ou si on est sur PC), on ouvre la modale QR
        if (!success) {
            openShareModal();
        }
    } else {
        // CAS 2 : Page Privée
        openPrivateShareModal();
    }
});

// ---------------------------------------------------------
// 7. GESTION GLOBALE DES FERMETURES (Modales)
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // -- Modale Classique (QR) --
    const shareModal = document.getElementById('shareModal');
    const closeShareBtn = document.getElementById('closeShare');

    if (closeShareBtn) closeShareBtn.addEventListener('click', closeShareModal);
    
    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) closeShareModal();
        });
    }

    // -- Modale Privée (Interdit) --
    const privateModal = document.getElementById("privateShareModal");
    const closePrivateBtn = document.getElementById("closePrivateShare");
    const closePrivateX = privateModal ? privateModal.querySelector(".close-modal") : null;

    if (closePrivateBtn) closePrivateBtn.addEventListener("click", closePrivateShareModal);
    if (closePrivateX)   closePrivateX.addEventListener("click", closePrivateShareModal);

    if (privateModal) {
        privateModal.addEventListener("click", (e) => {
            if (e.target === privateModal) closePrivateShareModal();
        });
    }
});

// Touche Échap pour tout fermer
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const shareModal = document.getElementById('shareModal');
        const privateModal = document.getElementById("privateShareModal");

        if (shareModal && shareModal.classList.contains('active')) closeShareModal();
        if (privateModal && privateModal.classList.contains('active')) closePrivateShareModal();
    }
});
