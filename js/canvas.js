/* ==========================================================================
   CANVAS - Fondo animado de constelaciones (Nodos de datos)
   ========================================================================== */

const cv = document.getElementById('bg-canvas');
const cx = cv.getContext('2d');
let pts = [];

// Ajusta el tamaño del canvas al tamaño de la ventana
function sz() {
    cv.width = innerWidth;
    cv.height = innerHeight;
}
sz();
window.addEventListener('resize', sz);

// Clase constructora para cada partícula (Punto)
class P {
    constructor() { 
        this.reset(); 
    }
    
    reset() {
        this.x = Math.random() * cv.width;
        this.y = Math.random() * cv.height;
        this.r = Math.random() * 1.2 + 0.3; // Radio
        this.vx = (Math.random() - 0.5) * 0.22; // Velocidad X
        this.vy = (Math.random() - 0.5) * 0.22; // Velocidad Y
        this.a = Math.random() * 0.38 + 0.06; // Opacidad
    }
    
    tick() {
        this.x += this.vx;
        this.y += this.vy;
        // Si sale de la pantalla, se reinicia
        if (this.x < 0 || this.x > cv.width || this.y < 0 || this.y > cv.height) {
            this.reset();
        }
    }
    
    draw() {
        cx.beginPath();
        cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        cx.fillStyle = `rgba(0,210,255,${this.a})`;
        cx.fill();
    }
}

// Crear 100 partículas iniciales
for (let i = 0; i < 100; i++) {
    pts.push(new P());
}

// Bucle de animación principal
(function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    
    // Mover y dibujar cada punto
    pts.forEach(p => { 
        p.tick(); 
        p.draw(); 
    });
    
    // Dibujar las líneas de conexión entre puntos cercanos
    for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const d = Math.hypot(dx, dy); // Distancia entre puntos
            
            if (d < 82) { // Si están lo suficientemente cerca, trazar línea
                cx.beginPath();
                cx.moveTo(pts[i].x, pts[i].y);
                cx.lineTo(pts[j].x, pts[j].y);
                cx.strokeStyle = `rgba(0,210,255,${0.05 * (1 - d / 82)})`;
                cx.lineWidth = 0.5;
                cx.stroke();
            }
        }
    }
    requestAnimationFrame(loop);
})();