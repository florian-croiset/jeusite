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
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    // On continue tant que le curseur n'a pas rattrapé la souris, puis on STOPPE
    // la boucle (plus de requestAnimationFrame à 60 fps quand la souris est immobile).
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      requestAnimationFrame(animateCursor);
    } else {
      running = false;
    }
  }
}
