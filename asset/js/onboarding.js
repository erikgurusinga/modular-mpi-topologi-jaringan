// Cover -> Form -> Beranda flow. Uses sessionStorage (not localStorage) on
// purpose: this runs on shared lab computers, so each new browser session
// (tab/window) should ask the next student for their name again.
(function () {
  const KEY_ENTERED = 'labmaya_entered';
  const KEY_NAME = 'labmaya_student_name';
  const KEY_SCHOOL = 'labmaya_student_school';

  const coverScreen = document.getElementById('coverScreen');
  const formScreen = document.getElementById('formScreen');
  const btnCoverStart = document.getElementById('btnCoverStart');
  const btnEnterLab = document.getElementById('btnEnterLab');
  const nameInput = document.getElementById('studentName');
  const schoolInput = document.getElementById('studentSchool');
  const formError = document.getElementById('formError');

  function personalizeGreeting() {
    const name = sessionStorage.getItem(KEY_NAME);
    if (!name) return;

    const text = document.getElementById('heroGreetingText');
    const firstName = name.split(' ')[0];

    if (text) text.textContent = 'Selamat belajar, ' + firstName + '! Pilih salah satu modul di bawah untuk mulai.';
    // The name/school display itself lives in the navbar profile chip now.
    if (window.renderProfile) window.renderProfile();
  }

  function enterLab() {
    document.documentElement.classList.add('lm-entered');
    // Explicitly clear the inline display these got from the click handlers
    // below — an inline style always wins over the html.lm-entered CSS rule.
    coverScreen.style.display = 'none';
    formScreen.style.display = 'none';
    personalizeGreeting();
  }

  // Already onboarded this session (e.g. returning to index.html via the navbar).
  if (sessionStorage.getItem(KEY_ENTERED) === '1') {
    personalizeGreeting();
  }

  if (btnCoverStart) {
    btnCoverStart.addEventListener('click', () => {
      if (window.LabMayaSound) window.LabMayaSound.play('open');
      coverScreen.style.display = 'none';
      formScreen.style.display = 'flex';
      nameInput.focus();
    });
  }

  if (btnEnterLab) {
    btnEnterLab.addEventListener('click', () => {
      const name = nameInput.value.trim();
      const school = schoolInput.value.trim();

      if (!name || !school) {
        formError.classList.add('show');
        return;
      }

      if (window.LabMayaSound) window.LabMayaSound.play('click');
      formError.classList.remove('show');
      sessionStorage.setItem(KEY_NAME, name);
      sessionStorage.setItem(KEY_SCHOOL, school);
      sessionStorage.setItem(KEY_ENTERED, '1');
      enterLab();
    });

    schoolInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnEnterLab.click();
    });
  }

  // Profil Pengembang / Kredit & Daftar Pustaka: plain on-demand modals,
  // no localStorage first-visit tracking like asset/js/help-modal.js —
  // these are reference info the user opens deliberately, not a tutorial.
  // Each overlay can hold more than one close trigger (X button + a bottom
  // "Tutup" button), so every [data-modal-close] inside it is wired up.
  function wireModal(openBtnId, overlayId) {
    const openBtn = document.getElementById(openBtnId);
    const overlay = document.getElementById(overlayId);
    if (!openBtn || !overlay) return;

    const open = () => {
      overlay.classList.add('show');
      if (window.LabMayaSound) window.LabMayaSound.play('open');
    };
    const close = () => {
      overlay.classList.remove('show');
      if (window.LabMayaSound) window.LabMayaSound.play('close');
    };

    openBtn.addEventListener('click', open);
    overlay.querySelectorAll('[data-modal-close]').forEach((btn) => {
      btn.addEventListener('click', close);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  wireModal('btnDevProfile', 'devProfileModal');
  wireModal('btnCredits', 'creditsModal');
  wireModal('btnCpTp', 'cpTpModal');

  // CP & TP modal has two tabs (Capaian Pembelajaran / Tujuan Pembelajaran)
  // instead of the flat info-grid the other dp-* modals use, since its
  // content (pulled from capaian-pembelajaran.html) is heavier.
  const cpTpTabs = document.getElementById('cpTpTabs');
  if (cpTpTabs) {
    cpTpTabs.querySelectorAll('.cptp-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        cpTpTabs.querySelectorAll('.cptp-tab').forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.cptp-panel').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.cptpTarget).classList.add('active');
        if (window.LabMayaSound) window.LabMayaSound.play('click');
      });
    });
  }

  // Module cards on the Beranda dashboard: play a sound before navigating.
  if (window.LabMayaSound) window.LabMayaSound.wireNavSound('.module-card', 'open', 350);
})();
