/* Textes personnalisables : 36 messages, sans doublon avant d'avoir parcouru le lot. */
const MESSAGES_AMOUR = [
  "Je te choisis dans les petits gestes, chaque jour.",
  "Ton sourire est ma plus douce lumière.",
  "Je veux écouter tes rêves, pas seulement te raconter les miens.",
  "Avec toi, même les jours ordinaires ont quelque chose de beau.",
  "DANTOU, tu n'as pas besoin d'être parfaite pour être aimée.",
  "Je te promets des mots tendres, même après une longue journée.",
  "J'aime la personne que tu es, pas une version imaginée de toi.",
  "Je veux prendre le temps de vraiment te comprendre.",
  "Ton bonheur mérite toute mon attention.",
  "Je nous souhaite des fous rires qu'on n'aura pas besoin d'expliquer.",
  "Tu es ma pensée douce au milieu du bruit.",
  "Je te promets de ne pas oublier les petits mercis.",
  "J'ai envie de découvrir encore mille détails de toi.",
  "Aujourd'hui, c'est ton jour. Le monde peut bien attendre.",
  "Je veux être une présence, pas seulement une promesse.",
  "Je t'aime aussi les jours où les mots viennent moins facilement.",
  "Nos silences peuvent être doux, eux aussi.",
  "Je te souhaite de croire en toi autant que je crois en toi.",
  "Un message de toi, et ma journée change de couleur.",
  "Je veux célébrer tes petites victoires autant que les grandes.",
  "Je te promets de m'excuser sans transformer l'amour en bataille.",
  "Tu as ta place dans mes projets, et le droit à tes propres rêves.",
  "Je t'offre un peu de mon temps, et beaucoup de mon cœur.",
  "Le prochain beau souvenir n'attend peut-être que nous.",
  "Je veux rire avec toi, jamais de ce qui te blesse.",
  "Il y a de la douceur dans le simple fait de te retrouver.",
  "Je te promets de te dire plus souvent ce que j'apprécie chez toi.",
  "DANTOU, tu comptes bien plus que tu ne l'imagines.",
  "Je nous souhaite un avenir fait de gestes vrais.",
  "Je t'aime sans avoir besoin d'une occasion spéciale.",
  "Ta voix est une de mes façons préférées de finir la journée.",
  "Je veux te laisser de l'espace sans jamais te laisser seule avec tout.",
  "À deux, on peut apprendre à mieux traverser les jours gris.",
  "Mon cœur ne fait pas de pause quand tu es loin.",
  "Ce 7 novembre 2026, toutes mes pensées tendres sont pour toi.",
  "HASSANE + DANTOU : j'aime déjà le début de cette histoire."
];

(() => {
  'use strict';
  const garden = document.getElementById('heart-garden');
  const layer = document.getElementById('heart-layer');
  const canvas = document.getElementById('heart-canvas');
  const ctx = canvas.getContext('2d');
  const notes = document.getElementById('heart-notes');
  const announcement = document.getElementById('heart-announcement');
  const counter = document.getElementById('heart-count');
  const pause = document.getElementById('motion-toggle');
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#ce849c', '#dcb984', '#ac6682', '#ebbdc5', '#b895ac'];
  const heartSVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21C8 18 2 14 2 8a5.2 5.2 0 0 1 10-2 5.2 5.2 0 0 1 10 2c0 6-6 10-10 13Z" fill="currentColor"/></svg>';
  let width = 0, height = 0, hearts = [], particles = [];
  let frame = 0, previous = 0, phase = 0, discovered = 0;
  let manualPaused = false, deck = [];

  function nextMessage() {
    if (!deck.length) {
      deck = [...MESSAGES_AMOUR];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }
    return deck.pop();
  }

  function requestFrame() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function seedHeart(heart) {
    // Centre et rayons normalisés : trajectoires contenues dans le jardin.
    heart.cx = 0.16 + Math.random() * 0.68;
    heart.cy = 0.20 + Math.random() * 0.55;
    heart.rx = 0.05 + Math.random() * 0.20;
    heart.ry = 0.06 + Math.random() * 0.19;
    heart.theta = Math.random() * Math.PI * 2;
    heart.speed = (0.12 + Math.random() * 0.14) * (Math.random() < 0.5 ? -1 : 1);
    heart.color = colors[Math.floor(Math.random() * colors.length)];
    heart.size = 18 + Math.random() * 17;
    heart.el.style.setProperty('--heart-color', heart.color);
    heart.el.style.setProperty('--heart-size', `${heart.size.toFixed(1)}px`);
    heart.el.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2);
    heart.popping = false;
    heart.el.classList.remove('is-popping');
    heart.el.setAttribute('aria-disabled', 'false');
    positionHeart(heart);
  }

  function positionHeart(heart) {
    const theta = heart.theta + phase * heart.speed;
    // Marge conservée pour que le bouton tactile de 48 px ne soit jamais coupé.
    heart.x = Math.max(26, Math.min(width - 26,
      (heart.cx + Math.cos(theta) * heart.rx + Math.sin(theta * 0.7) * 0.02) * width));
    heart.y = Math.max(32, Math.min(height - 65,
      (heart.cy + Math.sin(theta) * heart.ry + Math.cos(theta * 0.6) * 0.02) * height));
    const tilt = Math.sin(theta + heart.theta) * 22;
    heart.el.style.transform = `translate3d(${(heart.x - 24).toFixed(2)}px, ${(heart.y - 24).toFixed(2)}px, 0) rotate(${tilt.toFixed(1)}deg)`;
  }

  function createHeart(index) {
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'floating-heart'; el.innerHTML = heartSVG;
    el.setAttribute('aria-label', `Cœur ${index + 1} : découvrir une pensée d'amour`);
    const heart = { el };
    el.addEventListener('click', () => popHeart(heart));
    layer.appendChild(el); seedHeart(heart);
    return heart;
  }

  function resize() {
    width = garden.clientWidth; height = garden.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = width < 500 ? 18 : width < 800 ? 28 : 38;
    while (hearts.length > count) hearts.pop().el.remove();
    while (hearts.length < count) hearts.push(createHeart(hearts.length));
    hearts.forEach(positionHeart);
    // Les bulles existantes sont effacées si leur position n'est plus valide.
    notes.replaceChildren();
    requestFrame();
  }

  function showMessage(heart, message) {
    // Maximum trois bulles simultanées pour rester lisible sur petit écran.
    while (notes.childElementCount >= 3) notes.firstElementChild.remove();
    const note = document.createElement('div');
    note.className = 'heart-note'; note.textContent = message;
    const boxWidth = width < 500 ? 220 : 240;
    note.style.left = `${Math.max(8, Math.min(width - boxWidth - 8, heart.x - boxWidth / 2))}px`;
    note.style.top = `${Math.max(22, Math.min(height - 170, heart.y - 70))}px`;
    notes.appendChild(note);
    announcement.textContent = message;
    setTimeout(() => {
      note.classList.add('is-leaving');
      setTimeout(() => note.remove(), 400);
    }, 4800);
  }

  function popHeart(heart) {
    if (heart.popping) return;
    heart.popping = true;
    heart.el.classList.add('is-popping');
    heart.el.setAttribute('aria-disabled', 'true');
    discovered++; counter.textContent = String(discovered);
    showMessage(heart, nextMessage());
    if (!reducedQuery.matches) {
      for (let i = 0; i < 12; i++) {
        const angle = Math.PI * 2 * i / 12;
        const speed = 45 + Math.random() * 70;
        particles.push({
          x: heart.x, y: heart.y,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 0.65 + Math.random() * 0.3, age: 0,
          size: 2 + Math.random() * 2.5, color: heart.color
        });
      }
    }
    requestFrame();
    // Même bouton réutilisé : aucune accumulation de DOM, focus clavier conservé.
    setTimeout(() => {
      if (heart.el.isConnected) { seedHeart(heart); requestFrame(); }
    }, reducedQuery.matches ? 30 : 350);
  }

  function updateMotionLabel() {
    const stopped = manualPaused || reducedQuery.matches;
    pause.setAttribute('aria-pressed', String(stopped));
    pause.textContent = reducedQuery.matches
      ? 'Mouvements réduits activés'
      : manualPaused ? 'Remettre les cœurs en mouvement ▶' : 'Mettre les cœurs en pause Ⅱ';
    pause.disabled = reducedQuery.matches;
  }

  pause.addEventListener('click', () => {
    manualPaused = !manualPaused;
    updateMotionLabel(); requestFrame();
  });

  function tick(now) {
    frame = 0;
    const dt = previous ? Math.min((now - previous) / 1000, 0.035) : 0;
    previous = now;
    const moving = !manualPaused && !reducedQuery.matches;
    if (moving) phase += dt;
    // Une seule boucle anime les cœurs et les particules, sans calcul de layout.
    if (moving) {
      for (const heart of hearts) {
        if (!heart.popping && document.activeElement !== heart.el) positionHeart(heart);
      }
    }
    ctx.clearRect(0, 0, width, height);
    particles = particles.filter(p => p.age < p.life);
    for (const p of particles) {
      p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 30 * dt;
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (moving || particles.length) requestFrame();
    else previous = 0;
  }

  reducedQuery.addEventListener('change', () => {
    if (reducedQuery.matches) particles = [];
    updateMotionLabel(); requestFrame();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
    } else requestFrame();
  });
  new ResizeObserver(resize).observe(garden);
  updateMotionLabel(); resize();
})();
