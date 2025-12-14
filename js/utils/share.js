/* =========================================================
   SHARE.JS
   Gestion du partage du site (mobile API + fallback QR code)
   ========================================================= */

// ---------------------------------------------------------
// 1. CONFIGURATION DE BASE
// ---------------------------------------------------------
export const siteUrl = window.location.href;
const titleText = 'Echo - Team Nightberry';
const shareText = 'Découvrez Echo, une aventure intense dans un futur dystopique !';


// ---------------------------------------------------------
// 2. PARTAGE NATIF (API Web Share)
// ---------------------------------------------------------
export async function shareNative() {
  if (!navigator.share) return false; // pas supporté

  try {
    await navigator.share({
      title: titleText,
      text:  shareText,
      url:   siteUrl
    });
    return true;
  } catch (err) {
    console.warn('Partage annulé ou non supporté', err);
    return false;
  }
}


// ---------------------------------------------------------
// 3. MODALE DE PARTAGE (fallback desktop)
// ---------------------------------------------------------
export function openShareModal() {
  const modal   = document.getElementById('shareModal');
  const linkInp = document.getElementById('shareLinkInput');
  const qrImg   = document.getElementById('qrCodeImg');

  if (!modal) return;

  if (linkInp) linkInp.value = siteUrl;

  // Génération du QR Code (via API goQR)
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(siteUrl)}&color=00d0c6&bgcolor=0f0f0f`;
  if (qrImg) qrImg.src = qrApiUrl;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}


// ---------------------------------------------------------
// 4. FERMETURE DE LA MODALE
// ---------------------------------------------------------
export function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}


// ---------------------------------------------------------
// 5. COPIE DU LIEN DANS LE PRESSE-PAPIER
// ---------------------------------------------------------
export function copyShareLink(btn) {
  navigator.clipboard.writeText(siteUrl).then(() => {
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Copié !';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 2000);
    }
  }).catch(err => console.error('Erreur lors de la copie :', err));
}
