const cursor = document.getElementById('customCursor');

if (cursor) {
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let isOverInteractive = false;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    if (!isOverInteractive) {
      cursorX += (mouseX - cursorX) * 0.25;
      cursorY += (mouseY - cursorY) * 0.25;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}
