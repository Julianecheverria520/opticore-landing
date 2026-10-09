/* ==========================================================================
   OptiCore · Landing (rediseño 2026-10)
   Menú móvil, animación de entrada, enlace activo y formulario de demo.
   ========================================================================== */

(function () {
  'use strict';

  /* ── Menú móvil ── */
  var menuBtn = document.getElementById('menu-btn');
  var menu = document.getElementById('menu-movil');
  if (menuBtn && menu) {
    function setMenu(abierto) {
      menu.classList.toggle('abierto', abierto);
      menuBtn.setAttribute('aria-expanded', String(abierto));
      menuBtn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    }
    menuBtn.addEventListener('click', function () {
      setMenu(!menu.classList.contains('abierto'));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('abierto')) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ── Animación de entrada ── */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('revealed'); });
  }

  /* ── Enlace activo en la navegación ── */
  var links = document.querySelectorAll('.nav-links a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var porId = {};
    links.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = porId[entry.target.id];
        if (!a) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        } else if (a.getAttribute('aria-current')) {
          a.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(porId).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* ── Formulario de demo ──
     Se envía con FormSubmit (https://formsubmit.co) a gerencia@opticore-ia.com.
     La primera vez FormSubmit manda un correo de activación a esa dirección:
     hay que abrirlo y confirmar una sola vez; después llegan todas las solicitudes. */
  var DESTINO = 'https://formsubmit.co/ajax/gerencia@opticore-ia.com';

  var form = document.getElementById('form-demo');
  if (!form) return;
  var errorBox = document.getElementById('form-error');
  var okBox = document.getElementById('form-ok');
  var enviarBtn = document.getElementById('form-enviar');
  var otraBtn = document.getElementById('form-otra');
  var textoBtn = enviarBtn.textContent;

  var MENSAJES = {
    nombre: 'Escribe tu nombre.',
    empresa: 'Escribe el nombre de tu empresa.',
    email: 'Escribe un correo válido, por ejemplo tu@empresa.com.',
    interes: 'Elige qué te interesa ver.',
    autoriza: 'Debes aceptar la política de datos para enviar.'
  };

  function mostrarError(texto) {
    errorBox.textContent = texto;
    errorBox.classList.add('visible');
  }
  function limpiarError() {
    errorBox.textContent = '';
    errorBox.classList.remove('visible');
  }

  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
      e.target.removeAttribute('aria-invalid');
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    limpiarError();

    var primero = null;
    ['nombre', 'empresa', 'email', 'interes', 'autoriza'].forEach(function (nombre) {
      var campo = form.elements[nombre];
      if (campo.type !== 'checkbox') campo.value = campo.value.trim();
      var valido = campo.checkValidity();
      campo.setAttribute('aria-invalid', valido ? 'false' : 'true');
      if (!valido && !primero) primero = campo;
    });
    if (primero) {
      mostrarError(MENSAJES[primero.name]);
      primero.focus();
      return;
    }

    // Trampa para bots: si llenaron el campo oculto, fingimos éxito y no enviamos.
    if (form.elements._honey.value) {
      mostrarExito();
      return;
    }

    var datos = {
      _subject: 'Nueva solicitud de demo · ' + form.elements.empresa.value,
      _template: 'table',
      _captcha: 'false',
      Nombre: form.elements.nombre.value,
      Empresa: form.elements.empresa.value,
      Correo: form.elements.email.value,
      Celular: form.elements.celular.value.trim() || 'No lo dejó',
      Interes: form.elements.interes.value,
      Equipos: form.elements.equipos.value || 'No lo dijo',
      Mensaje: form.elements.mensaje.value.trim() || 'Sin mensaje',
      Autorizacion_datos: 'Sí',
      _replyto: form.elements.email.value
    };

    enviarBtn.disabled = true;
    enviarBtn.textContent = 'Enviando…';

    fetch(DESTINO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(datos)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) {
          if (!res.ok || json.success === false || json.success === 'false') {
            throw new Error(json.message || 'Error ' + res.status);
          }
        });
      })
      .then(mostrarExito)
      .catch(function () {
        mostrarError('No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo, o escríbenos por WhatsApp.');
      })
      .then(function () {
        enviarBtn.disabled = false;
        enviarBtn.textContent = textoBtn;
      });
  });

  function mostrarExito() {
    form.hidden = true;
    okBox.classList.add('visible');
    okBox.focus();
  }

  otraBtn.addEventListener('click', function () {
    form.reset();
    form.querySelectorAll('[aria-invalid]').forEach(function (c) { c.removeAttribute('aria-invalid'); });
    okBox.classList.remove('visible');
    form.hidden = false;
    form.elements.nombre.focus();
  });
})();
