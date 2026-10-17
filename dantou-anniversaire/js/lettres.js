/* Apparition des lettres et 4 playlists de 8 morceaux, avec exclusivité audio. */
(() => {
  'use strict';
  const cards = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.07 });
    cards.forEach(card => {
      card.classList.add('js-reveal');
      observer.observe(card);
    });
  }

  /* Les lecteurs sont créés seulement à la première ouverture d'une playlist.
   * Pas de fetch, de module ES ni de serveur requis pour le double-clic.
   */
  function createPlaylist(panel) {
    const notice = document.createElement('p');
    notice.className = 'playlist-notice';
    notice.textContent = '8 chansons pour accompagner ces mots. Les fichiers MP3 sont à ajouter dans assets/audio/.';
    panel.appendChild(notice);
    const list = document.createElement('ol');
    list.className = 'track-list';
    (window.MUSIQUES || []).slice(0, 8).forEach((song, index) => {
      const item = document.createElement('li');
      item.className = 'track';
      const heading = document.createElement('div');
      heading.className = 'track-heading';
      const number = document.createElement('span');
      number.className = 'track-index';
      number.textContent = String(index + 1).padStart(2, '0');
      const title = document.createElement('div');
      title.className = 'track-title';
      title.textContent = song.titre;
      const artist = document.createElement('span');
      artist.textContent = song.artiste;
      title.appendChild(artist);
      heading.append(number, title);
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'none';
      audio.src = song.fichier;
      audio.setAttribute('aria-label', `${song.titre} — ${song.artiste}`);
      const error = document.createElement('p');
      error.className = 'audio-error';
      error.hidden = true;
      error.setAttribute('role', 'status');
      audio.addEventListener('error', () => {
        error.hidden = false;
        error.textContent = `Fichier absent ou illisible : ${song.fichier}. Ajoute ton MP3, puis recharge la page.`;
      });
      audio.addEventListener('pause', () => item.classList.remove('is-playing'));
      audio.addEventListener('ended', () => item.classList.remove('is-playing'));
      item.append(heading, audio, error);
      list.appendChild(item);
    });
    panel.appendChild(list);
    panel.dataset.ready = 'true';
  }

  document.querySelectorAll('.playlist-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const open = button.getAttribute('aria-expanded') === 'true';
      if (!panel.dataset.ready) createPlaylist(panel);
      panel.hidden = open;
      button.setAttribute('aria-expanded', String(!open));
      button.querySelector('.toggle-plus').textContent = open ? '+' : '−';
      if (open) panel.querySelectorAll('audio').forEach(audio => audio.pause());
    });
  });

  /* play ne bouillonne pas : écoute en capture pour toute la page.
   * Un seul lecteur joue à la fois, y compris entre deux lettres.
   */
  document.addEventListener('play', event => {
    if (!(event.target instanceof HTMLAudioElement)) return;
    document.querySelectorAll('audio').forEach(audio => {
      if (audio !== event.target) audio.pause();
    });
    event.target.closest('.track')?.classList.add('is-playing');
  }, true);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) document.querySelectorAll('audio').forEach(audio => audio.pause());
  });
})();
