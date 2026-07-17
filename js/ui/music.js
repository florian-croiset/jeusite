const musicBtn = document.getElementById('musicBtn');
const musique  = document.getElementById('backgroundMusic');

if (musique && musicBtn) {

  musique.volume = 0.4;

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

  musicBtn.addEventListener('click', () => {
    if (musique.paused) {
      musique.play().catch(err => console.warn('Lecture refusée :', err));
    } else {
      musique.pause();
    }
    updateIcon();
    if (typeof window.sendDiscordNotification === 'function') {
        window.sendDiscordNotification('music_toggled', {
            playing: !musique.paused
        });
    }
  });


  // Musique désactivée par défaut : l'utilisateur doit cliquer sur le bouton pour la lancer.


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
