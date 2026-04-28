from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os

app = FastAPI()

openai.api_key = os.getenv("OPENAI_API_KEY")

class ChatRequest(BaseModel):
    message: str

# El conocimiento extraído de tu Dossier
OPTICORE_KNOWLEDGE = """
INFORMACIÓN BASE DE OPTICORE SYSTEMS IA:
- ¿Qué es?: Es una plataforma SaaS de logística y transporte que conecta en tiempo real a los administradores de oficina con los conductores en campo[cite: 6].
- Propuesta de valor: Reduce el tiempo de conciliación de viajes de 2 días a menos de 2 horas[cite: 7]. Elimina los vales en papel mediante un registro digital con código QR inviolable[cite: 13].
- Funciones clave: GPS en tiempo real (incluso en zonas sin conexión) [cite: 28], preliquidaciones automáticas [cite: 25], evidencia fotográfica obligatoria [cite: 28], y alertas proactivas de documentos vencidos (SOAT, Tecnomecánica)[cite: 13, 37].
- Implementación: No requiere costo de instalación ni hardware[cite: 69]. El onboarding toma 15 minutos para conductores[cite: 64].
- Planes disponibles: TRIAL (evaluación gratuita hasta 50 viajes), PRO (para operaciones en crecimiento), y PLATINUM (para grandes constructoras con viajes ilimitados)[cite: 41].
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
        response = openai.chat.completions.create(
            model="gpt-4o", # O gpt-4o-mini para ahorrar costos
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.message}
            ],
            temperature=0.3, # Temperatura baja para que sea muy preciso y no alucine
            max_tokens=250
        )
        
        bot_reply = response.choices[0].message.content
        return {"reply": bot_reply}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))