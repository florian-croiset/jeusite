// Configuration
export const siteUrl = window.location.href;
const titleText = 'Echo - Team Nightberry';
const shareText = 'Découvrez Echo, une aventure intense dans un futur dystopique !';

export async function shareNative() {
  if (!navigator.share) return false;
  try {
    await navigator.share({ title: titleText, text: shareText, url: siteUrl });
    return true;
  } catch (err) { return false; }
}

export function openShareModal() {
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
if (typeof window.sendDiscordNotification === 'function') {
    window.sendDiscordNotification('share_modal_opened', {
        page: window.location.pathname
    });
}
  document.body.style.overflow = 'hidden';
}

export function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) modal.classList.remove('active');
if (typeof window.sendDiscordNotification === 'function') {
    window.sendDiscordNotification('share_modal_closed', {});
}
  document.body.style.overflow = '';
}

export function openPrivateShareModal() {
  // Évite que les deux modales de partage soient ouvertes en même temps
  const publicModal = document.getElementById('shareModal');
  if (publicModal) {
      publicModal.classList.remove('active');
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

const copyBtn = document.getElementById('copyLinkBtn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(siteUrl).then(() => {
            const original = copyBtn.textContent;
            copyBtn.textContent = 'Copié !';
            copyBtn.classList.add('copied');
if (typeof window.sendDiscordNotification === 'function') {
    window.sendDiscordNotification('share_link_copied', {
        url: siteUrl
    });
}
            setTimeout(() => {
                copyBtn.textContent = original;
                copyBtn.classList.remove('copied');
            }, 2000);
        });
    });
}

document.addEventListener("click", async function (e) {
    const btn = e.target.closest("#shareBtn");
    if (!btn) return;

    e.preventDefault();
    // Empêche d'autres scripts d'écouter le même clic
    e.stopImmediatePropagation(); 

    const isSharingAllowed = btn.getAttribute('data-allow-share') === "true";

    if (isSharingAllowed) {
        const success = await shareNative();
        if (!success) openShareModal();
    } else {
        openPrivateShareModal();
    }
}, true); // Capture phase pour passer avant les autres écouteurs

// Fermetures des modales au clic extérieur
document.addEventListener("DOMContentLoaded", () => {
    const shareModal = document.getElementById('shareModal');
    const closeShareBtn = document.getElementById('closeShare');
    if (closeShareBtn) closeShareBtn.addEventListener('click', closeShareModal);
    if (shareModal) shareModal.addEventListener('click', (e) => { if(e.target===shareModal) closeShareModal(); });

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
