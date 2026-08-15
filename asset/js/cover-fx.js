// Lightweight animated node-network backdrop, shared by the cover/form
// screens AND the Beranda dashboard (the backdrop stays visible behind
// Beranda on purpose, per request, so the whole session feels consistent).
// Pauses while the tab isn't visible so it doesn't burn CPU in a background tab.
(function () {
  const canvas = document.getElementById('coverCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const LINK_DISTANCE = 150;
  const PARTICLE_COUNT = 55;
  let particles = [];
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.8,
    }));
  }

  function step() {
    if (document.hidden) {
      requestAnimationFrame(step);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.35 * (1 - dist / LINK_DISTANCE)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(103, 190, 255, 0.9)';
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  resize();
  createParticles();
  requestAnimationFrame(step);

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
})();
