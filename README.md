# ¿Qué cocino?

TP2 de Desarrollo Frontend II · UADE · 2026.

Una app para decidir qué cocinar aprovechando un ingrediente que ya tenés. Consultás recetas de TheMealDB, guardás favoritas y llevás los ingredientes que te faltan a una lista de compras, con precios reales de Día para saber cuánto vas a gastar.

## Enlaces

- **App publicada (Vercel):** https://tp-2-levi.vercel.app
- **Repositorio:** https://github.com/julicuchi/TP2_Levi
- **Bitácora del proceso:** [Google Docs](https://docs.google.com/document/d/1E3PSPzNH-mnKkyQn35pKiyQNFSaCBDJP/edit?usp=sharing)
- **Evidencias (capturas y videos por iteración):** [carpeta en Google Drive](https://drive.google.com/drive/folders/1xQWotdFbUjGGiSjUrxjCCPKziIWXw2Ol)

## Estado

- Publicada en Vercel y conectada a Firebase: la versión en línea muestra **Tus listas conectadas**.
- Authentication anónimo, Cloud Firestore `(default)` y las reglas de `firestore.rules` configurados en el proyecto `que-cocino-frontend`.
- Búsqueda por nombre, ingrediente y categoría sobre 30 recetas completas en español; detalle con ingredientes y preparación.
- Favoritas y lista de compras guardadas en Firestore por usuario: agregar, editar cantidad, marcar como comprado y eliminar. Las grabaciones del 16/11 y 17/11 muestran el guardado, la edición y el cambio de estado en la app y los documentos resultantes en Firestore.
- Precios de Día Online en la lista de compras y en el detalle de cada receta (mejora para el final, ver más abajo).
- Diseño adaptable a escritorio y celular, con estados de carga, validaciones, mensajes de éxito o error y animaciones que respetan «reducir movimiento».
- 37 pruebas unitarias aprobadas y compilación de producción correcta. Persiste un aviso de tamaño del bundle de JavaScript, sin errores.

### Iteraciones

| Versión | Fecha | Cambios principales |
| --- | --- | --- |
| V1 | 10/11 – 13/11 | Base funcional en React + Vite: recetas de TheMealDB, detalle, selección de ingredientes y lista de compras. Firebase todavía sin conectar. |
| V2 | 15/11 – 16/11 | Rediseño: portada con propuestas, accesos por ingrediente, estados de carga y mezcla con la referencia Cookz (tonos pastel y fotos circulares). |
| V3 | 16/11 – 17/11 | Firebase conectado (favoritas y compras por usuario), recetario completo en español, publicación en GitHub y Vercel. |
| V4 (final) | 24/11 | Precios de Día en compras y recetas, total estimado, rediseño de la lista de compras y animaciones. |

El detalle de las iteraciones del TP2, las dificultades y las evidencias están en la bitácora y en `docs/BITACORA.md`.

## Mejora para el final: precios de Día

**Qué agrega**

- **Lista de compras:** cada ingrediente tiene el botón **Ver precios en Día**. Despliega los productos de Día Online con foto y precio, y permite buscar otra marca o presentación. El producto elegido se guarda en Firestore junto al ingrediente, con un selector de unidades (− / +) y la fecha del precio.
- **Total estimado:** la tarjeta del resumen suma los ingredientes pendientes que tienen producto (precio × unidades). Al marcar uno como comprado, deja de sumarse. **Actualizar precios** vuelve a consultar los productos elegidos y guarda los precios nuevos.
- **Detalle de receta:** al marcar ingredientes se muestra el precio del primer resultado de Día para cada uno y el total aproximado. Al agregarlos a compras se guardan con ese producto, que después se puede cambiar.

**Cómo funciona**

```text
Navegador (React)  →  /api/dia (función serverless en Vercel)  →  catálogo público de Día Online
       ↓
Firestore: users/{uid}/shopping/{itemId}.product
```

Día no permite llamadas desde otro sitio (no envía cabeceras CORS), así que el navegador no puede consultarlo directo. Por eso `api/dia.js` es una **función serverless de Vercel**: recibe la búsqueda, consulta a Día del lado del servidor y devuelve solo los datos necesarios (id, nombre, precio, imagen y link). Valida la búsqueda, corta la consulta a los 8 segundos y deja que Vercel guarde la respuesta en caché durante 30 minutos.

- `GET /api/dia?q=cebolla`: busca productos (usa la búsqueda inteligente de Día, que acepta varias palabras).
- `GET /api/dia?ids=141913,55538`: consulta productos por ID para actualizar precios.

En desarrollo, `npm run dev` sirve la misma función desde Vite (`vite.config.js`), así que no hace falta instalar la CLI de Vercel.

**Límites**

- Es el catálogo público que usa la tienda online de Día, no una API oficial documentada: si Día lo cambia, la búsqueda puede dejar de funcionar. La app informa el error y la lista de compras sigue funcionando sin precios.
- Son precios online: pueden variar según la sucursal y las promociones.
- En las recetas, el total usa el primer resultado de cada ingrediente, que puede no ser la presentación exacta. Por eso se muestra como aproximado y el producto se puede cambiar desde la lista.

## Ejecutar

Usar Node.js 22.12 o posterior (preferiblemente una versión LTS compatible).

```sh
npm install
npm run dev
```

Abrir la URL que indique Vite. Sin variables de Firebase, se puede explorar recetas; la app informa que el guardado no está disponible. No se reemplaza la base de datos con datos simulados ni con localStorage.

```sh
npm test
npm run build
npm run preview
```

Las pruebas unitarias usan el ejecutor integrado de Node y no necesitan instalar paquetes. Simulan respuestas HTTP: no prueban la API en vivo ni Firebase. Después de instalar, conservar y subir `package-lock.json` al repositorio para instalaciones reproducibles.

## Conectar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/) y registrar una aplicación web. No hace falta activar Analytics ni Firebase Hosting.
2. Activar **Authentication → Sign-in method → Anonymous / Anónimo**.
3. Crear **Cloud Firestore Standard**, base `(default)`, en modo producción. La consigna sugiere `southamerica-east1` (São Paulo).
4. Copiar `.env.example` a `.env` en la raíz. Completar los cuatro valores de la configuración web (`firebaseConfig`):

```dotenv
VITE_FIREBASE_API_KEY=valor_de_apiKey
VITE_FIREBASE_AUTH_DOMAIN=valor_de_authDomain
VITE_FIREBASE_PROJECT_ID=valor_de_projectId
VITE_FIREBASE_APP_ID=valor_de_appId
```

5. Copiar el contenido de `firestore.rules` en **Firestore → Rules / Reglas** y publicar.
6. Reiniciar Vite si estaba ejecutándose.
7. Verificar que aparezca **Tus listas conectadas**. Crear un ingrediente y verificar el documento en Firestore; después probar editar, marcar comprado, recargar y eliminar.

Las variables `VITE_` forman parte del código del navegador. La configuración web de Firebase es pública; **no agregar claves privadas ni credenciales de cuentas de servicio**. Los permisos se resuelven con Authentication y las reglas de Firestore. El archivo `.env` está excluido de Git.

Cada navegador conserva una sesión anónima. Abrir otro navegador o borrar los datos del sitio no recupera la misma lista. No hay inicio de sesión permanente en esta versión.

## Datos y operaciones

| Ubicación | Datos | Operaciones |
| --- | --- | --- |
| `users/{uid}/favorites/{mealId}` | Nombre mostrado, imagen, categoría, fecha de creación | Consultar, agregar, eliminar |
| `users/{uid}/shopping/{itemId}` | Nombre, cantidad, comprado/pendiente, fecha de creación y, opcionalmente, `product`: producto de Día elegido (id, nombre, precio, imagen, link, unidades y fecha del precio) | Consultar, agregar, editar, cambiar estado, elegir o quitar producto, cambiar unidades, actualizar precio, eliminar |

Los documentos viven bajo el UID autenticado. Las reglas rechazan accesos de otras identidades y campos adicionales, y validan el tipo y el tamaño de cada dato del producto de Día (por ejemplo, unidades entre 1 y 99). Si se reutiliza el proyecto, hay que publicar la versión actual de `firestore.rules`: con las reglas anteriores, Firestore rechaza guardar el producto. La app escucha cambios con `onSnapshot`. Los avisos de éxito se muestran luego de que la promesa de escritura termina, no solamente al cambiar una variable de React.

## Organización del código

```text
api/
  dia.js                     Función serverless de Vercel que consulta los precios de Día
src/
  App.jsx                    Navegación, búsqueda, filtros y estados de la pantalla
  components/
    Brand.jsx                Marca compartida entre escritorio y móvil
    Hero.jsx                 Cuatro propuestas pastel con acceso a categorías y desplazamiento horizontal
    RecipeCard.jsx           Tarjeta de receta y botón de favorita
    RecipeDialog.jsx         Detalle, selección de ingredientes y costo estimado en Día
    ShoppingList.jsx         Lista de compras, productos elegidos y total estimado
    DiaPicker.jsx            Buscador de productos de Día para un ingrediente
  hooks/useKitchen.js        Suscripciones y operaciones en Firestore
  lib/prices.js              Consultas a /api/dia, formato de precios y cálculo de totales
  lib/firebase.js            Configuración e inicio de sesión anónima
  lib/recipes.js             Consultas a TheMealDB y normalización de ingredientes
  lib/spanishRecipes.js      Búsqueda en español y combinación con el recetario adaptado
  lib/recipes.es.json        30 recetas completas en español
  lib/ingredientLabels.js    Nombres de ingredientes y unidades en español
  lib/recipeTitles.js        Títulos en español (compatibilidad con favoritas anteriores)
  lib/shopping.js            Validaciones y mensajes de error
  styles.css                 Diseño y adaptación a pantallas pequeñas
  refinement.css             Refinamiento visual y ajustes responsive de esta iteración
  mejoras.css                Diseño de precios y animaciones de la mejora final
tests/                       Pruebas de búsquedas, precios, errores y validaciones
docs/                        Consigna resumida, bitácora y plan de verificación
```

## API y recetario en español

La app ofrece una selección de **30 recetas completas en español**: nombre, origen, ingredientes, cantidades y preparación. La búsqueda admite partes del nombre o un ingrediente en español, sin distinguir tildes ni mayúsculas.

[TheMealDB](https://www.themealdb.com/api.php), con la clave educativa `1`, sigue siendo la API externa: se consultan los listados por categoría mediante `filter.php?c=...` y el detalle mediante `lookup.php?i=...`. Las imágenes y los identificadores proceden de sus respuestas reales. Si falla la conexión se informa el error; no se simula una respuesta exitosa con datos locales.

`src/lib/recipes.es.json` contiene las versiones adaptadas y revisadas. `spanishRecipes.js` realiza la búsqueda y combina la respuesta externa con ese contenido. Solo las recetas con versión completa en español pueden aparecer en Descubrir y abrirse. La portada intercala categorías. Se retiraron los enlaces a videos sin idioma verificado.

Es un catálogo acotado, no un traductor automático de las 793 recetas del índice anterior. Para ampliar el recetario hay que añadir nombre, país, lista completa de ingredientes y pasos revisados, conservando el ID de TheMealDB. Se comprobaron coherencia y cantidades: por ejemplo, la lista original de canelones confundía pasta con porotos. Por eso se acredita cada receta como **versión adaptada**, no como traducción literal. Las decisiones están en `docs/BITACORA.md`.

Las favoritas antiguas se conservan en Firestore. Las que pertenecen al catálogo actual se muestran completas en español; las demás indican que quedaron fuera del recetario, permiten quitarlas y no abren instrucciones en inglés. Las nuevas favoritas guardan el nombre mostrado en español. El catálogo anterior de títulos se conserva únicamente por compatibilidad con esas favoritas.

No se utiliza una API de traducción, una clave adicional ni localStorage para reemplazar la persistencia de favoritas y compras.

## GitHub y Vercel

1. Crear el repositorio GitHub y subir este proyecto. Antes de cada commit, revisar `git status` y el contenido a incluir. No subir `.env`, `node_modules` ni `dist`.
2. Incluir `.env.example`, `firestore.rules`, README, documentación y el lockfile generado al instalar.
3. Importar el repositorio en [Vercel](https://vercel.com/), seleccionar Vite, raíz con `package.json`, build `npm run build` y salida `dist`.
4. En **Settings → Environment Variables**, crear las cuatro variables para Production (y Preview si se usan despliegues de prueba). Son configuración web pública.
5. Desplegar. Si se cambian variables después del build, ejecutar **Redeploy**.
6. Repetir la lista de pruebas de `docs/VERIFICACION.md` en la URL publicada y en celular.

Vercel publica automáticamente los archivos de `api/` como funciones serverless: `/api/dia` no necesita configuración ni variables de entorno extra.

Las reglas se publican **en Firebase**. Un despliegue de Vercel no las actualiza. No hay integración con Sites: la publicación requerida por la materia es Vercel.

## Iteraciones y entrega

La consigna exige al menos tres versiones con cambios comprobables, bitácora con evidencias, informe breve y un mini video explicando el funcionamiento. Las tres versiones están resumidas en la sección **Estado** y documentadas en la [bitácora](https://docs.google.com/document/d/1E3PSPzNH-mnKkyQn35pKiyQNFSaCBDJP/edit?usp=sharing), con capturas y grabaciones de cada etapa. Entrega indicada: **19/11/2026 a las 13:30**, al inicio de clase.

## Documentación consultada

- [React](https://react.dev/learn)
- [Vite](https://vite.dev/guide/)
- [Firebase: acceso anónimo](https://firebase.google.com/docs/auth/web/anonymous-auth)
- [Firestore: reglas por usuario](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [TheMealDB API](https://www.themealdb.com/api.php)
