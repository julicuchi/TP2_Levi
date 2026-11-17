# ¿Qué cocino?

TP2 de Desarrollo Frontend II · UADE · 2026.

Una app para decidir qué cocinar aprovechando un ingrediente que ya tenés. Consultás recetas de TheMealDB, guardás favoritas y llevás los ingredientes que te faltan a una lista de compras.

## Estado de esta primera entrega de código

- Interfaz React + Vite y diseño adaptable implementados.
- Búsqueda por nombre, ingrediente principal y categoría; detalle con ingredientes y preparación.
- Código de favoritas, lista de compras y autenticación anónima conectado al SDK de Firebase.
- Reglas de Firestore limitadas a cada usuario, con validación de documentos.
- Diseño refinado el 15/11: portada navegable, ingredientes visuales, tarjetas más legibles y detalle de receta rediseñado. Evidencias en `docs/evidencias/`.
- Mezcla visual del 16/11 con la referencia Cookz: marco blanco sobre durazno, propuestas pastel y tarjetas horizontales con fotos circulares. Compila; revisión visual de esta última iteración pendiente por bloqueo de conexión local en el entorno.
- Dependencias instaladas; compilación y 10 pruebas unitarias aprobadas. Se probaron la búsqueda real, categorías, detalle, navegación y adaptación a escritorio/celular en navegador.
- Configuración web del proyecto Firebase incorporada localmente en `.env`. Falta verificar en la consola Authentication anónimo, base Firestore y publicación de reglas.
- **Pendiente:** completar los servicios de Firebase, verificar operaciones y persistencia, subir a GitHub y publicar en Vercel.
- Esta base aún **no equivale a una versión funcional verificada** para la entrega. Ver `docs/BITACORA.md`.

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
| `users/{uid}/shopping/{itemId}` | Nombre, cantidad, comprado/pendiente, fecha de creación | Consultar, agregar, editar, cambiar estado, eliminar |

Los documentos viven bajo el UID autenticado. Las reglas rechazan accesos de otras identidades y campos adicionales. La app escucha cambios con `onSnapshot`. Los avisos de éxito se muestran luego de que la promesa de escritura termina, no solamente al cambiar una variable de React.

## Organización del código

```text
src/
  App.jsx                    Navegación, búsqueda, filtros y estados de la pantalla
  components/
    Brand.jsx                Marca compartida entre escritorio y móvil
    Hero.jsx                 Cuatro propuestas pastel con acceso a categorías y desplazamiento horizontal
    RecipeCard.jsx           Tarjeta de receta y botón de favorita
    RecipeDialog.jsx         Detalle y selección de ingredientes
    ShoppingList.jsx         Formulario y operaciones de compras
  hooks/useKitchen.js        Suscripciones y operaciones en Firestore
  lib/firebase.js            Configuración e inicio de sesión anónima
  lib/recipes.js             Consultas a TheMealDB y normalización de ingredientes
  lib/shopping.js            Validaciones y mensajes de error
  styles.css                 Diseño y adaptación a pantallas pequeñas
  refinement.css             Refinamiento visual y ajustes responsive de esta iteración
tests/                       Pruebas de búsquedas, errores y validaciones
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

Las reglas se publican **en Firebase**. Un despliegue de Vercel no las actualiza. No hay integración con Sites: la publicación requerida por la materia es Vercel.

## Iteraciones y entrega

La consigna exige al menos tres versiones con cambios comprobables, bitácora con evidencias, informe breve y un mini video explicando el funcionamiento. El plan y el estado real de cada etapa están en `docs/`. Entrega indicada: **19/11/2026 a las 13:30**, al inicio de clase.

## Documentación consultada

- [React](https://react.dev/learn)
- [Vite](https://vite.dev/guide/)
- [Firebase: acceso anónimo](https://firebase.google.com/docs/auth/web/anonymous-auth)
- [Firestore: reglas por usuario](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [TheMealDB API](https://www.themealdb.com/api.php)
