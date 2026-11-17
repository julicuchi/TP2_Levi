# Verificación de la aplicación

## Pruebas automatizadas disponibles

`npm test`: traducción de ingredientes comunes, normalización de datos, resultados vacíos, codificación de parámetros, errores HTTP, receta inexistente y validación de compras. Estas pruebas usan respuestas simuladas y no demuestran integración en vivo.

`npm run build`: compilación de producción aprobada el 15/11/2026. Vite advierte sobre el tamaño del bundle; no impide compilar. Las 10 pruebas de `npm test` también pasaron.

El 15/11 se verificaron en navegador la búsqueda por ingrediente, filtros, carrusel, detalle, selección de ingredientes, cierre con Escape y foco, estados sin Firebase y diseño responsive de 320 a 1440 px. Ver la evidencia y los límites en `BITACORA.md`. La lista siguiente sigue pendiente para la validación completa de persistencia y publicación.

## Flujo funcional obligatorio (local y Vercel)

- [ ] Buscar pollo desde las sugerencias; verificar resultados reales.
- [ ] Buscar por nombre original, cambiar categoría y limpiar la búsqueda.
- [ ] Probar una consulta sin resultados y un fallo de red.
- [ ] Abrir una receta, cerrar con Escape y verificar retorno de foco.
- [ ] Guardar una favorita, recargar y comprobar que permanece; eliminarla.
- [ ] Seleccionar ingredientes de una receta y agregarlos a compras.
- [ ] Crear un ingrediente manualmente y localizar el documento en Firestore.
- [ ] Editar nombre y cantidad; verificar el documento.
- [ ] Marcar comprado y volver a pendiente; verificar el estado.
- [ ] Recargar; verificar que los datos persisten.
- [ ] Eliminar y confirmar que desaparece en Firestore.
- [ ] Probar campos vacíos y longitudes máximas.
- [ ] Probar error de permisos; no debe aparecer un mensaje de éxito.
- [ ] Abrir otro perfil de navegador y verificar que no obtiene la lista del primero.
- [ ] Comprobar reglas en Rules Playground o emulador: rechazar usuario ajeno, usuario sin autenticar, campos adicionales y datos inválidos.
- [ ] Repetir en la URL publicada después de cada nueva versión.

## Diseño y accesibilidad

- [ ] Desktop (1440 × 900) y celular (390 × 844 y ancho 320).
- [ ] Sin desplazamiento horizontal de la página ni superposición de botones.
- [ ] Navegación inferior móvil y todos los formularios utilizables.
- [ ] Navegación por teclado, foco visible, etiquetas de formularios y diálogo modal.
- [ ] Mensajes de carga, error y éxito anunciados al lector de pantalla.
- [ ] Legibilidad y contraste del texto, incluyendo notas y estados.
- [ ] Preferencia de movimiento reducido respetada.
- [ ] Capturas reales guardadas como evidencias de la iteración.

## Guion sugerido para el mini video

1. Explicar necesidad, usuario y recorrido principal.
2. Buscar receta y mostrar de dónde viene la API (`src/lib/recipes.js`).
3. Seleccionar ingredientes; crear, editar, marcar, recargar y eliminar.
4. Mostrar la configuración de Firebase (`src/lib/firebase.js`) y las operaciones (`src/hooks/useKitchen.js`).
5. Mostrar documentos en Firestore y explicar las reglas por UID (`firestore.rules`).
6. Mostrar GitHub, Vercel y la app publicada en pantalla pequeña.
7. Resumir tres iteraciones reales y qué se modificó a partir del trabajo con IA.
