from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os
from typing import List, Optional
from fastapi.responses import JSONResponse

app = FastAPI()

openai.api_key = os.getenv("OPENAI_API_KEY")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = [] # Acepta el historial del JS

# El conocimiento extraído de tu Dossier
OPTICORE_KNOWLEDGE = """
INFORMACIÓN AVANZADA DE OPTICORE SYSTEMS IA:
- Manejo de Peajes: El sistema asocia automáticamente los costos de peajes a las rutas, permitiendo una liquidación exacta que incluye estos gastos operativos.
- Registro Preoperacional: Antes de iniciar la jornada, el conductor debe completar un formulario digital de preguntas personalizables sobre el estado del vehículo.
- Nuevo Rol de Despachador: Interfaz optimizada para el personal en planta que gestiona el flujo de salida y entrada.
- Tecnología OCR e IA: 
    1. Lectura de Placas: El despachador usa la cámara para identificar la máquina por OCR y asignar la ruta.
    2. Escaneo de Recibos: Al finalizar, el sistema escanea mediante IA los recibos de gastos y guarda la información automáticamente.
- Hardware y Salidas: Integración con impresoras Bluetooth para la entrega inmediata del tiquete físico de viaje al conductor.
- Cierre de Viaje: Uso de lectura de códigos QR/COR para finalizar recorridos y asegurar la integridad de la data.
"""

# Las reglas de comportamiento del Bot
SYSTEM_PROMPT = f"""
Eres OptiBot, el asistente comercial experto de OptiCore Systems IA.
Tu objetivo es responder dudas sobre la plataforma basándote ÚNICAMENTE en la siguiente información:
{OPTICORE_KNOWLEDGE}

REGLAS ESTRICTAS DE COMPORTAMIENTO:
1. NUNCA menciones precios, cifras monetarias exactas, ni "valores base". 
2. Si el usuario pregunta cuánto cuesta, cómo se cobra o pide precios, DEBES responder exactamente esto: "Nuestros planes (PRO y PLATINUM) tienen precios específicos que se definen en el contrato comercial según tu volumen de operación y alcance. Para darte una propuesta a medida, por favor déjanos tus datos en el formulario de la página o escríbele a Julián o Armando a través de los botones de WhatsApp."
3. Sé persuasivo, conciso (máximo 3 párrafos cortos) y usa un tono muy profesional enfocado en directores de operaciones y gerentes del sector constructor.
4. Si te preguntan algo que no está en la INFORMACIÓN BASE, responde: "Mi especialidad es la información comercial de los módulos de OptiCore IA. Para consultas más técnicas o específicas, te invito a contactar a nuestro equipo de Arquitectura de Datos."
"""

@app.post("/api/chat")
async def chat_with_optibot(request: ChatRequest):
    try:
        # 2. Construimos los mensajes incluyendo el historial previo
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Añadimos los últimos turnos del historial para que tenga contexto
        if request.history:
            for msg in request.history:
                messages.append({"role": msg.role, "content": msg.content})
        
        # Añadimos la pregunta actual
        messages.append({"role": "user", "content": request.message})

        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=messages, # Enviamos el pack completo de mensajes
            temperature=0.3,
            max_tokens=250
        )
        
        bot_reply = response.choices[0].message.content
        return {"reply": bot_reply}
        
    except Exception as e:
        # Esto evita el "Unexpected end of JSON" al asegurar que siempre hay una respuesta JSON
        return JSONResponse(status_code=500, content={"detail": str(e)})