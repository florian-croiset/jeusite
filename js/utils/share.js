/* =========================================================
   SHARE.JS - VERSION BLINDÉE (Anti-conflit)
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
  if (!navigator.share) return false;
  try {
    await navigator.share({ title: titleText, text: shareText, url: siteUrl });
    return true;
  } catch (err) { return false; }
}

// ---------------------------------------------------------
// 3. GESTION DE LA MODALE CLASSIQUE (QR Code)
// ---------------------------------------------------------
export function openShareModal() {
  // SÉCURITÉ : On ferme d'abord la modale privée si elle est ouverte
  const privateModal = document.getElementById("privateShareModal");
  if (privateModal) privateModal.classList.remove("active");

  const modal = document.getElementById('shareModal');
  const linkInp = document.getElementById('shareLinkInput');
  const qrImg = document.getElementById('qrCodeImg');

  if (!modal) return;

  if (linkInp) linkInp.value = siteUrl;

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(siteUrl)}&color=00d0c6&bgcolor=0f0f0f`;
  if (qrImg) qrImg.src = qrApiUrl;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ---------------------------------------------------------
// 4. GESTION DE LA MODALE PRIVÉE (Interdit)
// ---------------------------------------------------------
export function openPrivateShareModal() {
  // 🛑 SÉCURITÉ CRITIQUE : On force la fermeture de la modale normale
  // Cela corrige le bug où les deux s'ouvrent en même temps
  const publicModal = document.getElementById('shareModal');
  if (publicModal) {
      publicModal.classList.remove('active');
      // On retire aussi le style inline s'il a été mis par erreur
      publicModal.style.display = ''; 
  }

  const modal = document.getElementById("privateShareModal");
  if (!modal) return;
  
  modal.classList.add("active");
  document.body.style.overflow = 'hidden';
}

export function closePrivateShareModal() {
  const modal = document.getElementById("privateShareModal");
  if (modal) modal.classList.remove("active");
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
        });
    });
}

// ---------------------------------------------------------
// 6. LOGIQUE CENTRALE (CLIC BOUTON)
// ---------------------------------------------------------
document.addEventListener("click", async function (e) {
    const btn = e.target.closest("#shareBtn");
    if (!btn) return;

    // Empêche le comportement par défaut
    e.preventDefault();
    // 🛑 Tente de stopper les autres scripts qui écouteraient le même bouton
    e.stopImmediatePropagation(); 

    // Lecture stricte : doit être la chaîne de caractères "true"
    const isSharingAllowed = btn.getAttribute('data-allow-share') === "true";

    console.log("Clic Share détecté. Autorisé ?", isSharingAllowed); // Pour debug

    if (isSharingAllowed) {
        // --- CAS 1 : PARTAGE AUTORISÉ ---
        const success = await shareNative();
        if (!success) openShareModal();
    } else {
        // --- CAS 2 : PARTAGE INTERDIT ---
        // On appelle la fonction sécurisée qui ferme l'autre modale
        openPrivateShareModal();
    }
}, true); // "true" ici force la priorité (capture phase)

// ---------------------------------------------------------
// 7. GESTION GLOBALE DES FERMETURES
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // Modale Classique
    const shareModal = document.getElementById('shareModal');
    const closeShareBtn = document.getElementById('closeShare');
    if (closeShareBtn) closeShareBtn.addEventListener('click', closeShareModal);
    if (shareModal) shareModal.addEventListener('click', (e) => { if(e.target===shareModal) closeShareModal(); });

    // Modale Privée
    const privateModal = document.getElementById("privateShareModal");
    const closePrivateBtn = document.getElementById("closePrivateShare");
    const closePrivateX = privateModal ? privateModal.querySelector(".close-modal") : null;
    
    if (closePrivateBtn) closePrivateBtn.addEventListener("click", closePrivateShareModal);
    if (closePrivateX) closePrivateX.addEventListener("click", closePrivateShareModal);
    if (privateModal) privateModal.addEventListener("click", (e) => { if(e.target===privateModal) closePrivateShareModal(); });
});

// Touche Échap
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeShareModal();
        closePrivateShareModal();
    }
});
