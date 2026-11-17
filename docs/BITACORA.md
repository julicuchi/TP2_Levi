# Bitácora — ¿Qué cocino?

## 10/11/2026 · Definición y base de la primera versión

**Necesidad:** elegir qué cocinar con un ingrediente disponible y organizar las compras que requiere la receta. Público: estudiantes y otras personas que cocinan en casa.

**Decisiones:** React + Vite; TheMealDB para recetas; Firebase Authentication anónimo para identificar el navegador; Firestore para favoritas y compras privadas por usuario. Se descartó la propuesta inicial de guardar estas listas únicamente en localStorage al leer la consigna, que exige Firestore.

**Diseño:** se tomaron las referencias aportadas por la estudiante: menú lateral y tarjetas de Cookz; fotografías de platos como protagonistas; detalle limpio inspirado en Goodfood; transparencias suaves. Paleta crema, verde salvia y verde oscuro, tipografías Manrope y DM Sans, botones y tarjetas redondeadas. Se priorizó el flujo de cocinar y comprar: no se incorporaron precios, carrito de venta ni estadísticas nutricionales inventadas. El enlace de animación de Pinterest no pudo visualizarse; la entrada suave de tarjetas y del plato es una propuesta propia, no una reproducción verificada del video.

**Código creado:** búsqueda y categorías, detalle, selección de ingredientes, favoritas, CRUD de compras, validaciones, errores, estados de carga, diseño adaptable, reglas por UID, archivo de ejemplo de variables y documentación.

**IA utilizada:** ChatGPT/Codex para idear, interpretar la consigna, generar la base de código y revisar flujos. Instrucciones representativas de la estudiante: «Otra idea más útil, también pensá que voy a tener que conectar una API»; «Me gustaría que empecemos a construirla siguiendo siempre lo que dice la consigna». La estudiante deberá revisar, probar y poder explicar el código.

**Dificultades reales:** la consigna no era accesible como PDF en el contexto y se recibió luego como imágenes; la instalación de paquetes falló porque el entorno no resolvió `registry.npmjs.org` (`ENOTFOUND`). Hay caché de algunos paquetes, pero no de Vite ni Firebase. No se configuraron credenciales web de Firebase, todavía no suministradas.

**Estado:** base implementada, aún no declarada como versión funcional verificada. Pendientes pruebas visuales, instalación completa, conexión real, operaciones en Firestore y publicación. No hay capturas de la app ejecutada ni URLs de GitHub/Vercel verificadas.

**Verificación realizada:** `npm test` pasó 10 de 10 pruebas. Se revisó la sintaxis de los 12 archivos JS/JSX (incluyendo pruebas y configuración de Vite) con el parser de Babel disponible en caché local. `npm run build` no pudo ejecutarse porque Vite no está instalado; no es una compilación aprobada. La instalación offline tampoco pudo completar las dependencias necesarias. No se probó la API en vivo desde la app, la interfaz en navegador ni las reglas contra Firebase.

## Plan de versiones — no son versiones completadas

| Versión | Objetivo | Evidencia necesaria | Estado |
| --- | --- | --- | --- |
| V1 | Buscar recetas y completar el flujo receta → compras con CRUD persistente | Capturas en desktop y móvil, documentos en Firestore, recarga y eliminación, commit y despliegue | Base escrita; integración y validación pendientes |
| V2 | Refinar diseño y comportamiento según pruebas y devolución de la estudiante; evaluar mejora útil como agrupación de compras | Antes/después, justificación de cambios, prueba funcional, commit y nuevo despliegue | Pendiente |
| V3 | Ajustes finales de accesibilidad, estados vacíos/error y revisión de entrega | Pruebas sobre la URL final, informe, capturas y mini video | Pendiente |

En cada iteración agregar la fecha, cambios concretos, dificultades y solución, pruebas con resultados, capturas, hash del commit y URL/versionado del despliegue. No marcar una prueba aprobada sin haberla realizado.

## 15/11/2026 · Refinamiento visual solicitado por la estudiante

**Pedido:** «Necesito que refines el diseño mucho más».

**Cambios:** portada con tipografía Manrope y acento editorial DM Serif Display, fondo crema y verde salvia; fotografías de platos sobre una composición circular; tarjeta translúcida y carrusel manual con tres inspiraciones que llevan a sus categorías. Se agrandaron las imágenes de ingredientes, se diferenciaron con fondos suaves y se reorganizaron las recetas en tres columnas de escritorio y dos de celular. Se muestran seis recetas por tanda. Se refinó el detalle con una fotografía circular, etiquetas, selección de ingredientes y más espacio de lectura. Se unificaron botones, navegación, listas y estados vacíos. En móvil se agregó la marca en el encabezado y se ajustó el buscador en dos filas.

**Justificación:** la versión anterior tenía textos y controles pequeños, imágenes de ingredientes poco visibles y una portada con menor jerarquía. Se priorizaron el reconocimiento visual de ingredientes, la lectura y el recorrido hacia recetas y compras. El carrusel es manual para que el usuario controle el movimiento; se mantiene `prefers-reduced-motion`. Las categorías de la interfaz se traducen al español y las recetas conservan el idioma original de la API.

**Organización:** nuevos componentes `Brand.jsx` y `Hero.jsx`; estilos de esta iteración en `refinement.css`, separados de los estilos funcionales base. Los servicios de Firestore y sus reglas se conservan.

**Pruebas realizadas:** la app se ejecutó en el navegador usando Vite. Se comprobaron consultas reales a TheMealDB, filtro de pastas, búsqueda de pollo, apertura del detalle, selección de 13 ingredientes en una receta, cierre con Escape y devolución del foco al botón de origen. Se navegó a favoritas y compras, comprobando sus estados sin Firebase. No hubo desbordamiento horizontal en anchos 1440, 1280, 768, 540, 390 y 320 px; el diálogo móvil tampoco desbordó. La consola no registró errores. Las 10 pruebas unitarias pasaron. La compilación de producción pasó, con un aviso de tamaño del bundle JavaScript; la división del bundle queda como optimización pendiente.

**Evidencias reales:** `evidencias/antes-desktop.png`, `evidencias/antes-mobile.png`, `evidencias/refinado-desktop.png`, `evidencias/refinado-portada.png`, `evidencias/refinado-mobile.png`, `evidencias/refinado-detalle.png`, `evidencias/refinado-detalle-mobile.png`, `evidencias/refinado-compras.png` y `evidencias/refinado-compras-mobile.png`. La captura móvil inicial ya incluía el primer ajuste del texto de la tarjeta, antes de aplicar la nueva composición y estilos.

**Límite de esta iteración:** es una mejora visual probada localmente, no una entrega funcional publicada. Firebase todavía no está configurado, por lo que no se verificó persistencia ni CRUD real. Continúan pendientes GitHub, Vercel y las tres versiones funcionales con evidencia de despliegue.

## 16/11/2026 · Mezcla con la referencia Cookz

**Pedido:** combinar el diseño actual con la referencia de Cookz aportada por la estudiante.

**Decisiones visuales:** conservar la identidad verde y crema y el acento tipográfico editorial; sumar fondo durazno, un panel blanco con esquinas amplias, navegación activa en forma de píldora, cuatro propuestas en tonos pastel y recetas horizontales con fotografías circulares que sobresalen del fondo. Las colecciones permiten acceder a pastas, vegetarianas, mariscos y postres. La lista sigue utilizando fotografías y recetas reales de TheMealDB.

**Adaptación:** el marco se simplifica en celular, las propuestas se pueden deslizar horizontalmente y las recetas se muestran en una columna. Los controles de la tira solo aparecen cuando hay contenido fuera de vista y se deshabilitan al llegar a cada extremo. Se conserva la preferencia de movimiento reducido.

**Código:** `Hero.jsx`, `RecipeCard.jsx` y sección del 16/11 en `refinement.css`. Se mantienen búsqueda, favoritas, detalle y compras, sin cambiar las operaciones de Firebase.

**Verificación y límites:** compilación de producción aprobada. La revisión visual de esta iteración quedó pendiente: aunque Vite inició, el entorno rechazó el acceso al socket local por permisos y el navegador devolvió errores de conexión. Las capturas `refinado-*` corresponden a la iteración del 15/11, no a esta mezcla. No se generó una captura nueva válida. Debe revisarse en el navegador del equipo con `npm run dev` y guardar evidencias reales antes de marcar esta iteración como revisada visualmente.

## 16/11/2026 · Configuración del proyecto Firebase

La estudiante creó `que-cocino-frontend` y compartió su configuración web. Se incorporaron los cuatro valores necesarios en `.env`, que ya está excluido por `.gitignore`. La inicialización existente en `src/lib/firebase.js` lee esas variables. La app utiliza Authentication y Firestore; no se agregó Analytics, que es opcional para la consigna.

Esto configura el cliente, pero todavía no demuestra la conexión completa ni la persistencia. Queda pendiente confirmar el proveedor anónimo, la creación de Firestore `(default)`, la publicación de `firestore.rules` y las pruebas de crear, consultar, modificar, recargar y eliminar documentos.

## 16/11/2026 - Ingredientes en español

**Pedido:** mostrar en español los ingredientes que llegan en inglés desde TheMealDB.

**Cambios:** glosario local en `src/lib/ingredientLabels.js`, con vocabulario de Argentina (papa, palta, manteca, morrón), traducción de unidades y expresiones de cantidades. El detalle entrega los nombres traducidos al flujo existente de compras, por lo que los nuevos ingredientes seleccionados se guardan en español. Las compras anteriores se traducen al mostrarse y al abrir su edición, sin una migración automática de Firestore. Se conservan los identificadores que usa la API para buscar.

**Verificación:** 15 pruebas aprobadas y compilación de producción aprobada. Se verificaron nombres compuestos, mayúsculas, nombres personalizados, cantidades y fracciones, datos extraídos para compras y estabilidad al volver a traducir. Persiste el aviso previo de tamaño del bundle.

**Alcance:** los ingredientes sin traducción conocida mantienen el nombre original. Los títulos y las instrucciones de preparación conservan el idioma de origen. No se consultó el catálogo completo en vivo porque el entorno no pudo resolver el dominio de TheMealDB; no se realizó una nueva prueba visual ni una escritura real en Firebase en esta iteración.

## 16/11/2026 - Nombres de recetas en español

**Pedido:** traducir también los nombres de las recetas.

**Cambios:** catálogo local de 793 recetas consultadas en vivo en TheMealDB, con títulos descriptivos traducidos y nombres propios conservados. Datos en `src/lib/recipeTitles.es.json` (identificador: [nombre original, nombre mostrado]); lógica compartida en `recipeTitles.js`. Tarjetas, detalle, textos accesibles y favoritas utilizan el mismo título. Los documentos existentes de Firestore conservan sus datos originales; se traducen al mostrarlos. Las nuevas recetas no catalogadas conservan su nombre original hasta actualizar el catálogo.

**Búsqueda:** admite el título completo en español, sin distinguir mayúsculas ni tildes, resolviendo los identificadores originales y consultando `lookup.php`. Si varias recetas comparten un título, se recuperan todas. La búsqueda parcial por nombre original sigue disponible. No se añadió una API de traducción ni una dependencia nueva.

**Verificación:** 20 pruebas aprobadas y compilación aprobada. En navegador se buscó «Canelones de espinaca y ricota» contra la API real y se comprobó el título en la tarjeta. Se abrió su detalle para revisar la misma traducción. No se escribieron datos de prueba en Firestore. Continúa el aviso previo del tamaño del bundle. La preparación conserva el idioma original.

**Fuente del catálogo:** https://www.themealdb.com/api/json/v1/1/categories.php y consultas `filter.php?c=` por categoría, realizadas el 16/11/2026.

## 16/11/2026 - Recetario completo en español

**Problema:** traducir únicamente nombres e ingredientes dejaba la preparación en inglés. La estudiante indicó que toda la experiencia debía estar en español y autorizó seleccionar otras recetas si hacía falta.

**Decisión:** sustituir la exploración del catálogo general por una selección de 30 recetas con contenido completo revisado. Se mantienen las consultas reales a TheMealDB, sus IDs y fotografías; no se incorpora otra API ni una traducción automática dependiente de credenciales. La selección contiene 6 recetas de pollo, 6 del mar, 6 postres, 7 vegetarianas, 4 pastas y 1 de carne, según las categorías de origen. La portada intercala categorías para ofrecer variedad.

**Implementación:** `recipes.es.json` contiene título, país, ingredientes con cantidades y pasos redactados en español. `spanishRecipes.js` filtra las búsquedas por nombre parcial o ingrediente en español y transforma la respuesta externa. Los listados solo incluyen recetas revisadas. El detalle no devuelve texto original de la API ni enlaces a videos cuyo idioma no está verificado. Los fallos de conexión también se informan en español. Continúan las operaciones de Firestore con la misma estructura de datos.

**Adaptaciones editoriales:** se revisó cada preparación contra el detalle de la API. Se corrigieron inconsistencias de origen: pasta de canelones en lugar de porotos; cantidades explícitas para envases sin tamaño; carbonara alineada con su lista de ingredientes; miel que faltaba en el salmón; tomates ausentes en la ensalada de atún; cocción explícita de los langostinos del risotto; unidades de azúcar de la torta de zanahoria. No se presentan como traducciones literales: el crédito indica versión adaptada. Se omitieron promociones y notas de conservación ajenas a la preparación. Se conservan nombres culinarios de uso habitual en español.

**Compatibilidad:** ninguna favorita antigua se borra ni se migra automáticamente. Si está fuera de la selección se muestra un aviso, no se permite abrir contenido sin traducir y se mantiene la opción de eliminarla. Las compras existentes conservan el tratamiento previo de nombres; los ingredientes nuevos de estas 30 recetas se guardan ya en español.

**Comprobación real:** el navegador consultó la API y devolvió las 30 recetas. Los accesos por ingrediente dieron resultados: pollo 6, arroz 8, tomate 13, papa 4, salmón 4 y huevo 10. Se comprobaron detalles de tortilla, galletitas de maní y canelones. En la interfaz se buscó «tortilla», se abrió el detalle y se verificaron título, origen, 10 ingredientes y 6 pasos en español, sin desbordamiento horizontal del diálogo. No se realizaron escrituras de prueba en Firestore en esta iteración.

**Alcance:** el recetario ya no ofrece las 793 recetas del índice de títulos; ofrece las 30 versiones completas. Para ampliar la selección hay que revisar la receta entera. El catálogo de títulos anterior se conserva para identificar favoritas antiguas. GitHub, despliegue y entrega continúan siendo tareas separadas.

**Verificación final:** 25 pruebas aprobadas y compilación de producción aprobada. Persiste el aviso de tamaño del bundle ya existente.
