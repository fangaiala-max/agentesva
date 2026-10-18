// Original implementation inspired by Particle Drift by Meng To / ThreeUI.
// Decorative only: all hero content remains server-rendered above the canvas.
type Particle = { x: number; y: number; speed: number; phase: number; glyph: string; trail: boolean };
const GLYPHS = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}+#*';
const MAX_PARTICLES = 90;
const LINK_DISTANCE = 140;

export function setupParticleDrift(): () => void {
  const cleanups = Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-particle-drift]')).map((canvas) => {
    const context = canvas.getContext('2d');
    if (!context) return () => {};
    const host = canvas.parentElement!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;
    let visible = false;
    let disposed = false;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.lineWidth = 0.65;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > LINK_DISTANCE) continue;
          context.strokeStyle = `rgba(144,165,226,${(1 - distance / LINK_DISTANCE) * 0.17})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
        if (a.trail) {
          const length = 28 + a.speed * 2;
          const gradient = context.createLinearGradient(a.x, a.y, a.x, a.y + length);
          gradient.addColorStop(0, 'rgba(113,152,255,0.65)');
          gradient.addColorStop(1, 'rgba(41,71,255,0)');
          context.strokeStyle = gradient;
          context.beginPath();
          context.moveTo(a.x, a.y + 7);
          context.lineTo(a.x, a.y + length);
          context.stroke();
        }
        const alpha = 0.24 + (Math.sin(elapsed * 0.35 + a.phase) + 1) * 0.16;
        context.fillStyle = `rgba(195,209,245,${alpha})`;
        context.font = `${a.trail ? 12 : 10}px monospace`;
        context.fillText(a.glyph, a.x, a.y);
      }
    };

    const tick = (time: number) => {
      frame = 0;
      if (disposed || reduced || !visible || document.hidden) return;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      elapsed += delta;
      particles.forEach((particle) => {
        particle.y -= particle.speed * delta;
        particle.x += Math.sin(elapsed * 0.2 + particle.phase) * delta * 3;
        if (particle.y < -70) particle.y = height + 70;
        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
      });
      draw();
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (!disposed && !reduced && visible && !document.hidden && width > 0) frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      if (disposed) return;
      const bounds = host.getBoundingClientRect();
      const nextWidth = Math.round(bounds.width);
      const nextHeight = Math.round(bounds.height);
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width && height ? Math.min(MAX_PARTICLES, Math.max(18, Math.floor(width * height / 11000))) : 0;
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 7 + Math.random() * 11,
        phase: Math.random() * Math.PI * 2,
        glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        trail: i % 5 === 0,
      }));
      draw();
      sync();
    };

    const bounds = host.getBoundingClientRect();
    visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    intersectionObserver.observe(host);
    document.addEventListener('visibilitychange', sync);

    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
      context.clearRect(0, 0, width, height);
      // Release the backing bitmap when Astro replaces the page.
      canvas.width = 0;
      canvas.height = 0;
    };
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
