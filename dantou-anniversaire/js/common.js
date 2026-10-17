/* Une poignée d'étoiles CSS, sans boucle JavaScript ni dépendance. */
(() => {
  'use strict';
  const sky = document.querySelector('.stars');
  if (!sky) return;
  let seed = 1126;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 42; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.style.left = `${random() * 100}%`;
    star.style.top = `${random() * 100}%`;
    star.style.animationDelay = `${-random() * 7}s`;
    if (i % 5 === 0) star.style.width = star.style.height = '3px';
    fragment.appendChild(star);
  }
  sky.appendChild(fragment);
})();
