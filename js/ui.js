/* ==========================================================================
   UI CORE — Nav, Menú Móvil, Scroll Reveal, Contadores, Formularios
   OptiCore Systems IA v3.0
   ========================================================================== */

/* ── 1. NAV: fondo + scroll-spy ── */
const nav = document.getElementById('mainNav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('on', window.scrollY > 50);
}, { passive: true });

// Scroll-spy: marca enlace activo según sección visible
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.setAttribute('aria-current',
          link.getAttribute('href') === `#${id}` ? 'true' : 'false'
        );
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(sec => spyObserver.observe(sec));

/* ── 2. HAMBURGUESA con aria-expanded ── */
const burger  = document.getElementById('burgerBtn');
const mobMenu = document.getElementById('mobMenu');

if (burger && mobMenu) {
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-controls', 'mobMenu');
  mobMenu.setAttribute('role', 'navigation');
  mobMenu.setAttribute('aria-label', 'Menú móvil');

  function toggleMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.classList.toggle('open', open);
    mobMenu.classList.toggle('open', open);
  }

  burger.addEventListener('click', () => {
    toggleMenu(burger.getAttribute('aria-expanded') !== 'true');
  });

  mobMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => toggleMenu(false))
  );

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      toggleMenu(false);
      burger.focus();
    }
  });

  document.addEventListener('click', e => {
    if (!burger.contains(e.target) && !mobMenu.contains(e.target)) {
      toggleMenu(false);
    }
  });
}

/* ── 3. SCROLL REVEAL ── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── 4. CONTADORES ANIMADOS ── */
(function initCounters() {
  const DURATION = 1800;

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const start  = performance.now();

    (function tick(now) {
      const p = Math.min((now - start) / DURATION, 1);
      const ease = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = prefix + Math.round(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num[data-target]').forEach(c => obs.observe(c));
})();

/* ── 5. MOCKUP: KPI animado ── */
(function() {
  const el = document.getElementById('mk-viajes');
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setInterval(() => { el.textContent = Math.floor(Math.random() * 10) + 44; }, 3000);
})();

/* ── 6. FORMULARIO DE CONTACTO ── */
const cForm = document.getElementById('cForm');
if (cForm) {
  cForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    // TODO: reemplazar con fetch('/api/contact', { method:'POST', ... })
    setTimeout(() => {
      btn.innerHTML = '✓ Solicitud enviada — Le contactamos en menos de 24h';

      // Anuncio para lectores de pantalla
      const notice = document.createElement('p');
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      notice.className = 'sr-only';
      notice.textContent = 'Formulario enviado. Le contactaremos en menos de 24 horas.';
      cForm.appendChild(notice);
    }, 600);
  });
}