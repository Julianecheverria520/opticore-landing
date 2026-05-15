/* ==========================================================================
   CANVAS — Fondo animado de constelaciones
   OptiCore Systems IA v3.0
   Optimización: spatial hashing O(n) en lugar de O(n²)
   ========================================================================== */

const cv = document.getElementById('bg-canvas');
if (!cv) throw new Error('canvas #bg-canvas no encontrado');

// Respetar preferencia de movimiento reducido
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  cv.style.display = 'none';
  /* No iniciamos el loop para ahorrar CPU */
} else {
  const cx   = cv.getContext('2d');
  const MAX_DIST = 88;   // distancia máxima de conexión (px)
  const N_PTS = 90;       // reducido de 100 → mejora móvil
  let pts = [];
  let raf;

  /* Redimensionar */
  function resize() {
    cv.width  = window.innerWidth;
    cv.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* Clase partícula */
  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x  = Math.random() * cv.width;
      this.y  = Math.random() * cv.height;
      this.r  = Math.random() * 1.2 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.22;
      this.vy = (Math.random() - 0.5) * 0.22;
      this.a  = Math.random() * 0.38 + 0.06;
    }

    tick() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > cv.width ||
          this.y < 0 || this.y > cv.height) this.reset();
    }

    draw() {
      cx.beginPath();
      cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      cx.fillStyle = `rgba(0,210,255,${this.a})`;
      cx.fill();
    }
  }

  /* Inicializar */
  for (let i = 0; i < N_PTS; i++) pts.push(new Particle());

  /* Spatial hash O(n) para conexiones ──────────────────────────────
     Dividimos el canvas en celdas de MAX_DIST × MAX_DIST.
     Sólo comparamos partículas en celdas vecinas (9 celdas).
  ────────────────────────────────────────────────────────────────── */
  function buildGrid() {
    const grid = new Map();
    const cellW = MAX_DIST;
    const cellH = MAX_DIST;

    pts.forEach((p, i) => {
      const col = Math.floor(p.x / cellW);
      const row = Math.floor(p.y / cellH);
      const key = `${col},${row}`;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(i);
    });
    return { grid, cellW, cellH };
  }

  function drawConnections() {
    const { grid, cellW, cellH } = buildGrid();
    const seen = new Set();

    grid.forEach((indices, key) => {
      const [col, row] = key.split(',').map(Number);

      for (let dc = -1; dc <= 1; dc++) {
        for (let dr = -1; dr <= 1; dr++) {
          const nKey = `${col + dc},${row + dr}`;
          const nbs  = grid.get(nKey);
          if (!nbs) continue;

          indices.forEach(i => {
            nbs.forEach(j => {
              if (i >= j) return;
              const pairKey = `${i}-${j}`;
              if (seen.has(pairKey)) return;
              seen.add(pairKey);

              const dx = pts[i].x - pts[j].x;
              const dy = pts[i].y - pts[j].y;
              const d  = Math.hypot(dx, dy);

              if (d < MAX_DIST) {
                const alpha = 0.06 * (1 - d / MAX_DIST);
                cx.beginPath();
                cx.moveTo(pts[i].x, pts[i].y);
                cx.lineTo(pts[j].x, pts[j].y);
                cx.strokeStyle = `rgba(0,210,255,${alpha})`;
                cx.lineWidth   = 0.5;
                cx.stroke();
              }
            });
          });
        }
      }
    });
  }

  /* Loop principal */
  function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    pts.forEach(p => { p.tick(); p.draw(); });
    drawConnections();
    raf = requestAnimationFrame(loop);
  }

  loop();

  /* Pausar cuando la pestaña no es visible (ahorro de CPU) */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      loop();
    }
  });
}