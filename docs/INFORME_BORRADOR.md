# Informe breve — borrador para completar al finalizar

**Proyecto:** ¿Qué cocino? · TP2 Desarrollo Frontend II.

**Integrantes:** pendiente de completar.

**Repositorio:** pendiente de crear/publicar.

**URL de Vercel:** pendiente de desplegar.

## Idea y destinatarios

Ayudar a personas que cocinan en casa a elegir qué comer partiendo de un ingrediente disponible. El flujo une el descubrimiento de recetas con la lista de compras, para evitar anotar manualmente cada ingrediente faltante.

## Funcionalidades implementadas en el código

Búsqueda de recetas por nombre, ingrediente principal o categoría; consulta de detalle; selección de ingredientes; guardado de favoritas; lista de compras con creación, edición, marcado y eliminación. Interfaz adaptable, validaciones y estados de carga/error/éxito. La validación de la implementación en un entorno ejecutándose está pendiente.

## Información persistida

Firestore almacena favoritas y compras bajo `users/{uid}`. La autenticación anónima identifica cada navegador. Se conserva nombre, imagen, categoría y fecha en favoritas; nombre, cantidad, estado y fecha en compras. Las recetas completas se consultan en TheMealDB. Las reglas restringen cada ruta a su propietario.

## Herramientas e intervención propia

ChatGPT/Codex se utilizó como apoyo para proponer la idea, interpretar requisitos, generar componentes y documentación, y diseñar pruebas. La estudiante eligió el problema, compartió referencias visuales e indicó que debía respetarse la consigna.

Ejemplos de instrucciones y decisiones: ver `BITACORA.md`. Completar este informe con cambios efectivamente revisados por la estudiante, problemas resueltos, evidencias y resultados de las tres versiones. No presentar pendientes como funcionalidades verificadas.
