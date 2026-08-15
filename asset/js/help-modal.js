// Shared "petunjuk penggunaan" modal: shows once per module (per browser),
// and can be reopened anytime via the floating help button.
function initHelpModal(pageKey) {
  const overlay = document.getElementById('helpModalOverlay');
  if (!overlay) return;

  const closeBtn = document.getElementById('helpModalClose');
  const startBtn = document.getElementById('helpModalStart');
  const fab = document.getElementById('helpFabBtn');
  const storageKey = 'labmaya_help_seen_' + pageKey;

  function open() {
    overlay.classList.add('show');
    if (window.LabMayaSound) window.LabMayaSound.play('open');
  }

  function close() {
    overlay.classList.remove('show');
    localStorage.setItem(storageKey, '1');
    if (window.LabMayaSound) window.LabMayaSound.play('close');
  }

  if (!localStorage.getItem(storageKey)) {
    open();
  }

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (startBtn) startBtn.addEventListener('click', close);
  if (fab) fab.addEventListener('click', open);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('show')) close();
  });
}
