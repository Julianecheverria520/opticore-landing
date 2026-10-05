/* ==========================================================================
   OptiCore · Retiro del service worker viejo
   La app (PWA) registró /sw.js en este dominio antes de pasar a app.opticore-ia.com.
   Este archivo lo reemplaza: borra sus cachés, se da de baja y recarga las pestañas
   abiertas. La landing no lo registra; solo existe para que el navegador lo actualice.
   ========================================================================== */

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (claves) {
        return Promise.all(claves.map(function (clave) { return caches.delete(clave); }));
      })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (clientes) {
        clientes.forEach(function (cliente) { cliente.navigate(cliente.url); });
      })
  );
});
