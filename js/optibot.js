/* ==========================================================================
   OPTIBOT — Asistente Comercial IA
   OptiCore Systems IA v3.0
   Mejoras: contexto multi-turno, aria-live, typing dots, throttle envío
   ========================================================================== */

(function initOptiBot() {
  const btnToggle   = document.getElementById('optibot-toggle');
  const btnClose    = document.getElementById('optibot-close');
  const chatWindow  = document.getElementById('optibot-window');
  const chatForm    = document.getElementById('optibot-form');
  const chatInput   = document.getElementById('optibot-input');
  const messagesEl  = document.getElementById('optibot-messages');
  const sendBtn     = document.getElementById('optibot-send');

  if (!btnToggle || !chatWindow) return;

  /* Accesibilidad: el contenedor de mensajes debe tener aria-live en el HTML.
     Lo añadimos aquí por si no está en el markup. */
  if (!messagesEl.hasAttribute('aria-live')) {
    messagesEl.setAttribute('aria-live', 'polite');
    messagesEl.setAttribute('aria-atomic', 'false');
  }

  /* Historial de conversación (contexto multi-turno) */
  const conversationHistory = [];

  /* ── Abrir / cerrar ── */
  function setOpen(open) {
    chatWindow.classList.toggle('active', open);
    btnToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      chatInput.focus();
      // Quitar indicador de no-leídos
      btnToggle.removeAttribute('data-unread');
    }
  }

  btnToggle.addEventListener('click', () => {
    setOpen(!chatWindow.classList.contains('active'));
  });

  btnClose.addEventListener('click', () => setOpen(false));

  // Cerrar con Escape
  chatWindow.addEventListener('keydown', e => {
    if (e.key === 'Escape') { setOpen(false); btnToggle.focus(); }
  });

  /* ── Añadir mensaje al DOM ── */
  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('msg', sender === 'user' ? 'user-msg' : 'bot-msg');

    // Soporte básico de markdown: **negrita** y saltos de línea
    const safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    div.innerHTML = safe;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  /* ── Indicador "escribiendo…" (3 dots) ── */
  function showTyping() {
    const div = document.createElement('div');
    div.classList.add('msg', 'bot-msg');
    div.id = 'optibot-typing';
    div.setAttribute('aria-label', 'OptiBot está escribiendo');
    div.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('optibot-typing');
    if (el) el.remove();
  }

  /* ── Envío del mensaje ── */
  let sending = false; // throttle: evita dobles envíos

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;

    const userText = chatInput.value.trim();
    if (!userText) return;

    sending = true;
    sendBtn.disabled = true;

    // 1. Mostrar mensaje del usuario
    addMessage(userText, 'user');
    chatInput.value = '';

    // 2. Añadir al historial
    conversationHistory.push({ role: 'user', content: userText });

    // 3. Mostrar typing
    showTyping();

    try {
      const response = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos el historial completo para contexto multi-turno
        body: JSON.stringify({
          message: userText,
          history: conversationHistory.slice(-10) // últimos 10 turnos
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${response.status}`);
      }

      const data = await response.json();
      hideTyping();

      const replyText = data.reply || 'Sin respuesta del servidor.';
      addMessage(replyText, 'bot');

      // Guardar respuesta del bot en historial
      conversationHistory.push({ role: 'assistant', content: replyText });

    } catch (error) {
      hideTyping();
      addMessage(
        'En este momento no puedo conectarme. Por favor escríbenos por WhatsApp o usa el formulario de contacto.',
        'bot'
      );
      console.error('[OptiBot]', error.message);
    } finally {
      sending = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  });

  /* ── Notificación de no-leídos cuando el chat está cerrado ── */
  // Si el usuario recibe un mensaje proactivo en el futuro,
  // usar: btnToggle.setAttribute('data-unread', '1');
})();