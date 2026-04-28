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
            // 3. Conexión a tu backend FastAPI (Reemplazar URL cuando esté lista)
            /*
            const response = await fetch('TU_URL_DE_FASTAPI_AQUI/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });
            const data = await response.json();
            */
            
            // Simulación de espera de respuesta (Eliminar cuando conectes la API)
            await new Promise(resolve => setTimeout(resolve, 1500));
            const data = { reply: "Entendido. Soy OptiBot, estoy en fase de conexión con los servidores de OptiCore. Por ahora, te invito a llenar el formulario de contacto o escribirnos por WhatsApp." };

            // Eliminar mensaje de "escribiendo..."
            document.getElementById(typingId).remove();

            // 4. Mostrar respuesta final del bot
            addMessage(data.reply, 'bot');

        } catch (error) {
            document.getElementById(typingId).remove();
            addMessage("Error de conexión. Nuestros sistemas están en mantenimiento.", 'bot');
            console.error("Error OptiBot:", error);
        }
    });
}