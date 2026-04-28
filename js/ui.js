/* ==========================================================================
   UI CORE - Navegación, Menú Móvil, Scroll Reveal y Formularios
   ========================================================================== */

// 1. Efecto en la barra de navegación al hacer scroll
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('on', window.scrollY > 50);
});

// 2. Menú Hamburguesa para móviles
const burger = document.getElementById('burgerBtn');
const mob = document.getElementById('mobMenu');

if (burger && mob) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        mob.classList.toggle('open');
    });

    // Cerrar el menú móvil automáticamente al hacer clic en un enlace
    mob.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            burger.classList.remove('open');
            mob.classList.remove('open');
        });
    });
}

// 3. Efecto de aparición al hacer scroll (Intersection Observer)
const observerOptions = { threshold: 0.08 };
const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target); // Dejar de observar una vez que ya apareció
        }
    });
}, observerOptions);

// Aplicar el observador a todos los elementos con la clase .reveal
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 4. Manejo del Formulario de Contacto
const contactForm = document.getElementById('cForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Evita que la página recargue
        const btn = document.getElementById('submitBtn');
        btn.innerHTML = '✓ Solicitud enviada — Le contactamos en menos de 24h';
        btn.style.background = '#00c853'; // Verde de éxito
        btn.style.color = '#fff';
        btn.disabled = true; // Deshabilita el botón tras el envío
    });
}