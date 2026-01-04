/* =========================================================
   MUSIC.JS
   Contrôle de la musique de fond (lecture, pause, raccourcis)
   ========================================================= */

// ---------------------------------------------------------
// 1. SÉLECTION DES ÉLÉMENTS
// ---------------------------------------------------------
const musicBtn = document.getElementById('musicBtn');
const musique  = document.getElementById('backgroundMusic');


// ---------------------------------------------------------
// 2. INITIALISATION ET VOLUME
// ---------------------------------------------------------
if (musique && musicBtn) {

  // Réglage volume de départ
  musique.volume = 0.4;  

  // Met à jour l’icône selon l’état
  function updateIcon() {
    const icon = musicBtn.querySelector('i');
    if (!icon) return;

    if (musique.paused) {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-music');
      icon.style.color = 'var(--debut)';
    } else {
      icon.classList.remove('fa-music');
      icon.classList.add('fa-pause');
      icon.style.color = 'var(--finn)';
    }
  }

  // -------------------------------------------------------
  // 3. GESTION DU CLIC SUR LE BOUTON MUSIQUE
  // -------------------------------------------------------
  musicBtn.addEventListener('click', () => {
    if (musique.paused) {
      musique.play().catch(err => console.warn('Lecture refusée :', err));
    } else {
      musique.pause();
    }
    updateIcon();
    // 📊 Tracking: Musique play/pause
if (typeof window.sendDiscordNotification === 'function') {
    window.sendDiscordNotification('music_toggled', {
        playing: !musique.paused
    });
}
  });


  // -------------------------------------------------------
  // 4. DÉMARRAGE AUTOMATIQUE APRÈS INTERACTION
  // -------------------------------------------------------
  const activerMusique = () => {
    musique.play()
      .then(updateIcon)
      .catch(() => { /* aucun log si refus */ });
      // 📊 Tracking: Démarrage automatique musique
if (typeof window.sendDiscordNotification === 'function') {
    window.sendDiscordNotification('music_autoplay', {
        success: true
    });
}

    ['click', 'scroll', 'keydown', 'mousemove', 'touchstart']
      .forEach(evt => window.removeEventListener(evt, activerMusique));
  };

  ['click', 'scroll', 'keydown', 'mousemove', 'touchstart']
    .forEach(evt => window.addEventListener(evt, activerMusique, { once: true }));


  // -------------------------------------------------------
  // 5. RACCOURCI CLAVIER : TOUCHE « M »
  // -------------------------------------------------------
  document.addEventListener('keydown', e => {
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      musicBtn.click();                       // Simule un clic
      musicBtn.style.transform = 'scale(1.2)'; // Feedback visuel
      setTimeout(() => (musicBtn.style.transform = ''), 150);
    }
  });
}
