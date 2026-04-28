/* ==========================================================================
   OPTIBOT - Lógica del Asistente Comercial IA (Conexión API)
   ========================================================================== */

const btnToggle = document.getElementById('optibot-toggle');
const btnClose = document.getElementById('optibot-close');
const chatWindow = document.getElementById('optibot-window');
const chatForm = document.getElementById('optibot-form');
const chatInput = document.getElementById('optibot-input');
const messagesContainer = document.getElementById('optibot-messages');

if (btnToggle && chatWindow) {
    // Abrir y cerrar el chat
    btnToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            chatInput.focus();
        }
    });

    btnClose.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    // Función para añadir mensajes visualmente al DOM
    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('msg', sender === 'user' ? 'user-msg' : 'bot-msg');
        msgDiv.textContent = text;
        messagesContainer.appendChild(msgDiv);
        // Auto-scroll hacia abajo
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Manejo del envío del mensaje por el usuario
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userText = chatInput.value.trim();
        if (!userText) return;

        // 1. Mostrar mensaje del usuario
        addMessage(userText, 'user');
        chatInput.value = '';

        // 2. Mostrar indicador de "escribiendo..."
        const typingId = 'typing-' + Date.now();
        const typingMsg = document.createElement('div');
        typingMsg.id = typingId;
        typingMsg.classList.add('msg', 'bot-msg');
        typingMsg.innerHTML = '<span style="opacity: 0.6">OptiBot está pensando...</span>';
        messagesContainer.appendChild(typingMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            // Reemplaza esto con la URL real de tu backend en Render cuando lo subas
            // Ejemplo: 'https://api-opticore.onrender.com/api/chat'
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });
            
            if (!response.ok) throw new Error('Error en el servidor');
            
            const data = await response.json();

            // Eliminar mensaje de "escribiendo..."
            document.getElementById(typingId).remove();

            // Mostrar respuesta final del bot
            addMessage(data.reply, 'bot');

        } catch (error) {
            document.getElementById(typingId).remove();
            addMessage("Error de conexión. Por favor usa el formulario o escríbenos por WhatsApp.", 'bot');
            console.error("Error OptiBot:", error);
        }
    });
}