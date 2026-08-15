// CP & TP page: sidebar "Daftar Isi" toggles which .cp-panel is shown in the workspace.
(function () {
  const navItems = document.querySelectorAll('.cp-nav-item');
  const panels = document.querySelectorAll('.cp-panel');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-target');
      if (item.classList.contains('active')) return;

      if (window.LabMayaSound) window.LabMayaSound.play('click');
      navItems.forEach((i) => i.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(targetId).classList.add('active');

      document.querySelector('.cp-workspace').scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();
