export function validateShoppingItem(name, quantity) {
  const cleanName = name.trim();
  const cleanQuantity = quantity.trim();
  if (!cleanName) throw new Error('Escribí el nombre del ingrediente.');
  if (cleanName.length > 100) throw new Error('El nombre puede tener hasta 100 caracteres.');
  if (cleanQuantity.length > 60) throw new Error('La cantidad puede tener hasta 60 caracteres.');
  return { name: cleanName, quantity: cleanQuantity };
}

export function firebaseMessage(error) {
  if (error.code === 'permission-denied') return 'No pudimos acceder a tus listas. Revisá las reglas de Firestore del proyecto.';
  if (error.code === 'auth/operation-not-allowed') return 'Falta habilitar el acceso anónimo en Firebase Authentication.';
  if (error.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || error.code === 'auth/invalid-api-key') return 'La configuración de Firebase no es válida. Revisá las variables del proyecto.';
  if (error.code === 'unavailable' || error.code === 'auth/network-request-failed') return 'No pudimos conectar. Revisá tu conexión a internet y volvé a intentar.';
  return error.message?.startsWith('Firebase:') ? 'No pudimos conectar con Firebase. Revisá la configuración e intentá nuevamente.' : error.message || 'No pudimos guardar el cambio. Volvé a intentar.';
}
