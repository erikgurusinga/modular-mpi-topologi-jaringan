// Shared sound-effect player, loaded on every page (like profile-menu.js).
// Paths are resolved relative to this script's own file, not the including
// page, so both index.html (asset/js/...) and asset/pages/*.html (../js/...)
// reach the same audio files without needing different relative paths.
(function () {
  const MUTE_KEY = 'labmaya_sound_muted';
  const BASE_URL = new URL('../sound/', document.currentScript.src);

  const FILES = {
    click: 'juniorsoundays-ui-sound-24-527861.mp3',
    open: 'dragon-studio-menu-open-sound-effect-432999.mp3',
    close: 'soundshelfstudio-ui-pop-up-close-516938.mp3',
    success: 'nomagician-collectable-ui-sound-467876.mp3',
    error: 'liecio-menu_beep_short_stone-533776.mp3',
    complete: 'xmersounds-soft-treble-fast-collect-fade-out-ending-sound-effect-416828.mp3',
  };

  const cache = {};

  function getAudio(name) {
    if (!cache[name]) {
      const audio = new Audio(new URL(FILES[name], BASE_URL).href);
      audio.volume = 0.5;
      audio.preload = 'auto';
      cache[name] = audio;
    }
    return cache[name];
  }

  // Preload every sound eagerly (files are small, ~30-130KB) so the first
  // play() of each — especially ones right before a page navigation — isn't
  // delayed by the browser still fetching/decoding the file.
  Object.keys(FILES).forEach(getAudio);

  function isMuted() {
    return localStorage.getItem(MUTE_KEY) === '1';
  }

  function setMuted(muted) {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    document.querySelectorAll('[data-sound-toggle]').forEach((btn) => {
      btn.classList.toggle('is-muted', muted);
    });
  }

  // Sound is active by default (no stored preference yet); only silent
  // once a student/teacher explicitly mutes it via a [data-sound-toggle] button.
  function play(name) {
    if (isMuted() || !FILES[name]) return;
    const audio = getAudio(name);
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Ignored: browsers block audio before any user gesture on the page
      // (e.g. a help modal auto-opening on first visit) — fails silently.
    });
  }

  function wireToggleButtons() {
    document.querySelectorAll('[data-sound-toggle]').forEach((btn) => {
      btn.classList.toggle('is-muted', isMuted());
      btn.addEventListener('click', () => setMuted(!isMuted()));
    });
  }

  // Shared helper for <a> links that navigate to another page: a plain click
  // would unload the current page almost instantly, cutting the sound off
  // before it's audible, so this intercepts the click, plays the sound, and
  // delays the actual navigation just long enough for it to be heard.
  function wireNavSound(selector, soundName, delayMs) {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener('click', (e) => {
        if (isMuted()) return;
        e.preventDefault();
        play(soundName);
        setTimeout(() => { window.location.href = el.href; }, delayMs);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', wireToggleButtons);

  window.LabMayaSound = { play, isMuted, setMuted, wireNavSound };
})();
