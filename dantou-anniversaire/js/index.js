/* Arc interactif : physique en secondes, collision balayée, rendu rAF.
 * Les dimensions sont mises en cache au redimensionnement, jamais lues par image.
 */
(() => {
  'use strict';
  const scene = document.getElementById('game-scene');
  const canvas = document.getElementById('shot-canvas');
  const ctx = canvas.getContext('2d');
  const bow = document.getElementById('bow-control');
  const shoot = document.getElementById('shoot-button');
  const label = document.getElementById('shoot-label');
  const string = document.getElementById('bow-string');
  const envelope = document.getElementById('envelope');
  const meter = document.getElementById('power-meter');
  const fill = document.getElementById('power-fill');
  const status = document.getElementById('game-status');
  const controls = document.getElementById('game-controls');
  const birthday = document.getElementById('birthday-panel');
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, origin = { x: 0, y: 0 }, target = {};
  let pulling = null, arrow = null, particles = [];
  let power = 0, aimOffset = 0, baseAngle = 0, gravity = 0;
  let opened = false, frame = 0, previous = 0, keyboardDown = false;

  function resize() {
    if (pulling) cancelPull();
    const rect = scene.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bowRect = bow.getBoundingClientRect();
    // Dans le SVG de l'arc, le milieu de la corde est à (24, 90).
    origin = { x: bowRect.left - rect.left + bowRect.width * 24 / 80,
               y: bowRect.top - rect.top + bowRect.height / 2 };
    const giftRect = envelope.getBoundingClientRect();
    target = { left: giftRect.left - rect.left + 8,
               right: giftRect.right - rect.left - 8,
               top: giftRect.top - rect.top + 10,
               bottom: giftRect.bottom - rect.top - 8 };
    gravity = width * 0.85;
    // Réglage initial : à ~72% de puissance, le tir atteint le centre du cadeau.
    const tx = (target.left + target.right) / 2;
    const ty = (target.top + target.bottom) / 2;
    const vx = width * (0.04 + 0.72 * 0.90);
    const time = (tx - origin.x) / vx;
    const vy = (ty - origin.y - 0.5 * gravity * time * time) / time;
    baseAngle = Math.atan2(vy, vx);
    // Un redimensionnement annule seulement une flèche en vol, pas le cadeau ouvert.
    if (arrow) {
      arrow = null;
      status.textContent = 'L’écran a changé de taille. Tu peux tirer à nouveau.';
      enableControls();
    }
    requestFrame();
  }

  function requestFrame() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function startPull(control, event, mode = 'pointer') {
    if (opened || arrow || pulling) return;
    power = 0.15;
    pulling = { control, mode, start: performance.now(),
                x: event?.clientX || 0, y: event?.clientY || 0,
                dx: 0, dy: 0, pointerId: event?.pointerId };
    if (mode === 'pointer') control.setPointerCapture(event.pointerId);
    label.textContent = 'Relâche pour tirer';
    status.textContent = 'Bande l’arc… ajuste la hauteur en glissant. Puis relâche.';
    requestFrame();
  }

  function movePull(event) {
    if (!pulling || event.pointerId !== pulling.pointerId) return;
    pulling.dx = Math.max(0, pulling.x - event.clientX);
    if (pulling.control === bow) {
      pulling.dy = event.clientY - pulling.y;
      aimOffset = Math.max(-0.55, Math.min(0.55, pulling.dy / 180));
    }
  }

  function cancelPull() {
    if (!pulling) return;
    pulling = null; keyboardDown = false; power = 0;
    fill.style.width = '0%'; meter.setAttribute('aria-valuenow', '0');
    string.setAttribute('points', '24,12 24,90 24,168');
    label.textContent = 'Maintenir pour bander';
    requestFrame();
  }

  function fire() {
    if (!pulling || opened) return;
    const shotPower = power;
    cancelPull();
    const angle = baseAngle + aimOffset;
    const vx = width * (0.04 + shotPower * 0.90);
    const speed = vx / Math.cos(baseAngle);
    arrow = { x: origin.x, y: origin.y,
              vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, age: 0 };
    shoot.disabled = true;
    bow.disabled = true;
    status.textContent = 'Une flèche pleine d’amour…';
    requestFrame();
  }

  function enableControls() {
    shoot.disabled = false; bow.disabled = false;
    label.textContent = 'Maintenir pour bander';
  }

  [bow, shoot].forEach(control => {
    control.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      if (control === shoot) aimOffset = 0;
      startPull(control, event);
    });
    control.addEventListener('pointermove', movePull);
    control.addEventListener('pointerup', event => {
      if (pulling?.pointerId === event.pointerId) {
        event.preventDefault();
        fire();
      }
    });
    control.addEventListener('pointercancel', cancelPull);
    control.addEventListener('lostpointercapture', () => {
      if (pulling?.mode === 'pointer') cancelPull();
    });
    control.addEventListener('keydown', event => {
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        event.preventDefault();
        aimOffset = Math.max(-0.55, Math.min(0.55,
          aimOffset + (event.code === 'ArrowUp' ? -0.04 : 0.04)));
        requestFrame();
      }
      if (event.code !== 'Space' && event.code !== 'Enter') return;
      event.preventDefault();
      if (event.repeat || keyboardDown) return;
      keyboardDown = true;
      if (control === shoot) aimOffset = 0;
      startPull(control, null, 'keyboard');
    });
    control.addEventListener('keyup', event => {
      if (event.code !== 'Space' && event.code !== 'Enter') return;
      event.preventDefault();
      keyboardDown = false;
      if (pulling?.mode === 'keyboard') fire();
    });
    control.addEventListener('blur', () => {
      if (pulling?.mode === 'keyboard') cancelPull();
    });
  });

  // Intersection segment/rectangle : évite de traverser la cible entre deux images.
  function segmentHits(x1, y1, x2, y2) {
    let tMin = 0, tMax = 1;
    const delta = [x2 - x1, y2 - y1];
    const start = [x1, y1];
    const lower = [target.left, target.top];
    const upper = [target.right, target.bottom];
    for (let axis = 0; axis < 2; axis++) {
      if (Math.abs(delta[axis]) < 0.0001) {
        if (start[axis] < lower[axis] || start[axis] > upper[axis]) return false;
      } else {
        let a = (lower[axis] - start[axis]) / delta[axis];
        let b = (upper[axis] - start[axis]) / delta[axis];
        if (a > b) [a, b] = [b, a];
        tMin = Math.max(tMin, a); tMax = Math.min(tMax, b);
        if (tMin > tMax) return false;
      }
    }
    return true;
  }

  function celebrate() {
    if (opened) return;
    opened = true; arrow = null; cancelPull();
    envelope.classList.add('is-open');
    envelope.setAttribute('aria-label', 'Une enveloppe ouverte, avec une lettre d’amour pour Dantou');
    controls.hidden = true; birthday.hidden = false;
    if (!reducedQuery.matches) {
      const colors = ['#e4c38c', '#d295a5', '#f2e4ce', '#a76179'];
      for (let i = 0; i < (width < 500 ? 55 : 90); i++) {
        particles.push({
          x: (target.left + target.right) / 2, y: target.top + 55,
          vx: (Math.random() - 0.5) * width * 0.7,
          vy: -100 - Math.random() * 210,
          age: 0, life: 1.4 + Math.random() * 1.2,
          size: 3 + Math.random() * 3, angle: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 5, color: colors[i % colors.length]
        });
      }
    }
    // Le focus arrive sur le prochain chapitre une fois le cadeau ouvert.
    setTimeout(() => {
      if (opened) birthday.querySelector('a').focus({ preventScroll: true });
    }, reducedQuery.matches ? 50 : 1000);
    requestFrame();
  }

  function drawArrow(x, y, angle, alpha = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#ecd0a0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-37, 0); ctx.lineTo(0, 0); ctx.stroke();
    ctx.fillStyle = '#f1d1a7';
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-7, -4); ctx.lineTo(-7, 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#cd8f9d';
    ctx.beginPath(); ctx.moveTo(-31, 0); ctx.lineTo(-38, -5);
    ctx.moveTo(-31, 0); ctx.lineTo(-38, 5); ctx.stroke();
    ctx.restore();
  }

  function tick(now) {
    frame = 0;
    const dt = previous ? Math.min((now - previous) / 1000, 0.032) : 0;
    previous = now;
    ctx.clearRect(0, 0, width, height);
    if (pulling) {
      const heldPower = 0.15 + (now - pulling.start) / 1550;
      power = Math.max(0.15, Math.min(1, Math.max(heldPower, pulling.dx / 145)));
      fill.style.width = `${Math.round(power * 100)}%`;
      meter.setAttribute('aria-valuenow', String(Math.round(power * 100)));
      const pullX = 24 - power * 35;
      string.setAttribute('points', `24,12 ${pullX},90 24,168`);
      const angle = baseAngle + aimOffset;
      const speed = width * (0.04 + power * 0.90) / Math.cos(baseAngle);
      // Guide pointillé de trajectoire, uniquement pendant la visée.
      ctx.fillStyle = '#e4c99c';
      for (let t = 0.12; t < 1.6; t += 0.07) {
        const x = origin.x + Math.cos(angle) * speed * t;
        const y = origin.y + Math.sin(angle) * speed * t + 0.5 * gravity * t * t;
        if (x > width || y > height || y < -20) break;
        ctx.globalAlpha = Math.max(0.06, 0.4 - t * 0.22);
        ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      drawArrow(origin.x, origin.y, angle);
    }
    if (arrow) {
      const x1 = arrow.x, y1 = arrow.y;
      arrow.x += arrow.vx * dt;
      arrow.y += arrow.vy * dt + 0.5 * gravity * dt * dt;
      arrow.vy += gravity * dt; arrow.age += dt;
      if (segmentHits(x1, y1, arrow.x, arrow.y)) {
        celebrate();
      } else if (arrow.x > width + 40 || arrow.y > height + 40 || arrow.age > 3) {
        arrow = null; enableControls();
        status.textContent = 'Presque ! Maintiens environ une seconde, puis réessaie.';
      } else {
        drawArrow(arrow.x, arrow.y, Math.atan2(arrow.vy, arrow.vx));
      }
    }
    particles = particles.filter(p => p.age < p.life);
    for (const p of particles) {
      p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 240 * dt; p.angle += p.spin * dt;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6); ctx.restore();
    }
    if (pulling || arrow || particles.length) requestFrame();
    else previous = 0;
  }

  document.getElementById('skip-game').addEventListener('click', celebrate);
  document.getElementById('replay').addEventListener('click', () => {
    opened = false; arrow = null; particles = []; aimOffset = 0;
    envelope.classList.remove('is-open');
    envelope.setAttribute('aria-label', 'Une enveloppe fermée, adressée à Dantou');
    birthday.hidden = true; controls.hidden = false;
    enableControls();
    status.textContent = 'Une nouvelle flèche, le même amour.';
    shoot.focus({ preventScroll: true });
    resize();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelPull();
      cancelAnimationFrame(frame); frame = 0; previous = 0;
    } else requestFrame();
  });
  reducedQuery.addEventListener('change', () => {
    if (reducedQuery.matches) particles = [];
  });
  new ResizeObserver(resize).observe(scene);
  resize();
})();
