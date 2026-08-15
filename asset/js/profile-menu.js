// Top-right profile chip, shared by every page's navbar. Reads the student's
// name/school from sessionStorage (set once during onboarding on index.html)
// so it works consistently as the student moves between pages in the same
// session. Exposes window.renderProfile so onboarding.js can refresh it
// immediately after the student submits the form, without a page reload.
(function () {
  const KEY_NAME = 'labmaya_student_name';
  const KEY_SCHOOL = 'labmaya_student_school';

  const wrap = document.getElementById('navbarProfile');
  const btn = document.getElementById('profileChipBtn');
  if (!wrap || !btn) return;

  const avatarEl = document.getElementById('profileAvatar');
  const chipNameEl = document.getElementById('profileChipName');
  const ddNameEl = document.getElementById('profileDropdownName');
  const ddSchoolEl = document.getElementById('profileDropdownSchool');

  function renderProfile() {
    const name = sessionStorage.getItem(KEY_NAME) || 'Siswa';
    const school = sessionStorage.getItem(KEY_SCHOOL) || '-';

    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
    if (chipNameEl) chipNameEl.textContent = name.split(' ')[0];
    if (ddNameEl) ddNameEl.textContent = name;
    if (ddSchoolEl) ddSchoolEl.textContent = school;
  }

  window.renderProfile = renderProfile;
  renderProfile();

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = !wrap.classList.contains('open');
    wrap.classList.toggle('open');
    if (window.LabMayaSound) window.LabMayaSound.play(opening ? 'open' : 'close');
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) wrap.classList.remove('open');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') wrap.classList.remove('open');
  });

  // "Keluar" and the top navbar menu links (Beranda/CP&TP/Perangkat/...) all
  // navigate via href — its inline onclick already clears sessionStorage —
  // so both get the same delayed-navigation treatment as the dashboard
  // module cards, otherwise the sound never has time to play.
  if (window.LabMayaSound) {
    window.LabMayaSound.wireNavSound('.profile-dropdown-exit', 'complete', 350);
    window.LabMayaSound.wireNavSound('.navbar-nav > li > a', 'complete', 350);
  }
})();
