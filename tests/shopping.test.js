import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firebaseMessage, validateShoppingItem } from '../src/lib/shopping.js';

test('un ingrediente solo con espacios no se guarda', () => {
  assert.throws(() => validateShoppingItem('   ', '1 kg'), /nombre/);
});

test('limpia espacios y permite cantidades opcionales', () => {
  assert.deepEqual(validateShoppingItem('  Tomates ', ''), { name: 'Tomates', quantity: '' });
});

test('valida los mismos límites de longitud que Firestore', () => {
  assert.throws(() => validateShoppingItem('a'.repeat(101), ''), /100/);
  assert.throws(() => validateShoppingItem('Arroz', 'a'.repeat(61)), /60/);
  assert.equal(validateShoppingItem('a'.repeat(100), 'b'.repeat(60)).name.length, 100);
});

test('errores de permisos y autenticación tienen mensajes accionables', () => {
  assert.match(firebaseMessage({ code: 'permission-denied' }), /reglas de Firestore/);
  assert.match(firebaseMessage({ code: 'auth/operation-not-allowed' }), /acceso anónimo/);
});
