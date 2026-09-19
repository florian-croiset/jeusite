const cursor = document.getElementById('customCursor');

if (cursor) {
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let running = false;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Relance la boucle uniquement s'il y a du mouvement à suivre.
    if (!running) {
      running = true;
      requestAnimationFrame(animateCursor);
    }
  });

  function animateCursor() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    cursorX += dx * 0.25;
    cursorY += dy * 0.25;
    // transform (translate3d) au lieu de left/top : déplacement de calque GPU pur,
    // sans layout ni repaint à chaque frame. left/top forçaient un repaint + ré-upload
    // du calque à chaque frame (avec will-change: transform), ce qui saturait le GPU Firefox.
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;

    // On continue tant que le curseur n'a pas rattrapé la souris, puis on STOPPE
    // la boucle (plus de requestAnimationFrame à 60 fps quand la souris est immobile).
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      requestAnimationFrame(animateCursor);
    } else {
      running = false;
    }
  }
}
