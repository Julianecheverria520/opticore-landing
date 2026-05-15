/* ==========================================================================
   OPTIBOT — Asistente Comercial IA
   OptiCore Systems IA v4.0
   Sincronizado con FastAPI + Historial de Conversación
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

  // Historial de conversación para dar contexto a la IA
  let conversationHistory = [];

  /* ── Configuración Inicial ── */
  if (!messagesEl.hasAttribute('aria-live')) {
    messagesEl.setAttribute('aria-live', 'polite');
    messagesEl.setAttribute('aria-atomic', 'false');
  }

  function setOpen(open) {
    chatWindow.classList.toggle('active', open);
    btnToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      chatInput.focus();
      btnToggle.removeAttribute('data-unread');
    }
  }

  btnToggle.addEventListener('click', () => setOpen(!chatWindow.classList.contains('active')));
  btnClose.addEventListener('click', () => setOpen(false));

  /* ── Interfaz de Mensajes ── */
  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('msg', sender === 'user' ? 'user-msg' : 'bot-msg');

    // Limpieza y formato básico (negritas y saltos de línea)
    const safeContent = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    div.innerHTML = safeContent;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.classList.add('msg', 'bot-msg');
    div.id = 'optibot-typing';
    div.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('optibot-typing');
    if (el) el.remove();
  }

  /* ── Lógica de Envío y Conexión con API ── */
  let isSending = false;

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSending) return;

    const userText = chatInput.value.trim();
    if (!userText) return;

    isSending = true;
    sendBtn.disabled = true;

    // 1. UI: Mostrar mensaje del usuario
    addMessage(userText, 'user');
    chatInput.value = '';

    // 2. IA: Mostrar indicador de escritura
    showTyping();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: conversationHistory.slice(-6) // Enviamos los últimos 6 mensajes para contexto
        })
      });

      // Validar si la respuesta es JSON para evitar el error "Unexpected end of JSON"
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
          throw new Error("El servidor no respondió con JSON válido.");
      }

      const data = await response.json();
      hideTyping();

      if (!response.ok) {
        throw new Error(data.detail || `Error ${response.status}`);
      }

      // 3. UI: Mostrar respuesta del Bot
      const botReply = data.reply || 'No recibí una respuesta clara. ¿Podrías repetir?';
      addMessage(botReply, 'bot');

      // 4. Memoria: Guardar en el historial local
      conversationHistory.push({ role: 'user', content: userText });
      conversationHistory.push({ role: 'assistant', content: botReply });

    } catch (error) {
      console.error('[OptiBot Error]:', error);
      hideTyping();
      addMessage(
        'Lo siento, tengo problemas de conexión. Por favor, intenta de nuevo o contacta a soporte por WhatsApp.',
        'bot'
      );
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  });
})();