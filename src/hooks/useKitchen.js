import { useCallback, useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, deleteField, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db, firebaseConfigured, startSession } from '../lib/firebase';
import { toSavedProduct } from '../lib/prices';
import { firebaseMessage, validateShoppingItem } from '../lib/shopping';

const productData = (product, units) => ({ ...toSavedProduct(product, units), checkedAt: serverTimestamp() });

export default function useKitchen(notify) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [shopping, setShopping] = useState([]);
  const [status, setStatus] = useState(firebaseConfigured ? 'loading' : 'unconfigured');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) return;
    let active = true;
    let unsubscribe = [];
    setStatus('loading');
    setError('');
    startSession().then((currentUser) => {
      if (!active) return;
      setUser(currentUser);
      let loaded = new Set();
      let subscriptionFailed = false;
      const listen = (name, setter) => onSnapshot(
        collection(db, 'users', currentUser.uid, name),
        (snapshot) => {
          setter(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
          loaded.add(name);
          if (loaded.size === 2 && !subscriptionFailed) setStatus('ready');
        },
        (err) => { subscriptionFailed = true; setError(firebaseMessage(err)); setStatus('error'); },
      );
      unsubscribe = [listen('favorites', setFavorites), listen('shopping', setShopping)];
    }).catch((err) => {
      if (active) { setError(firebaseMessage(err)); setStatus('error'); }
    });
    return () => { active = false; unsubscribe.forEach((stop) => stop()); };
  }, [retry]);

  const run = useCallback(async (action, message) => {
    if (status !== 'ready' || !user) {
      notify(status === 'unconfigured' ? 'Todavía falta conectar Firebase para guardar tus listas.' : 'Esperá a que tus listas estén conectadas o reintentá la conexión.', 'error');
      return false;
    }
    if (!navigator.onLine) { notify('No hay conexión. Conectate a internet para guardar el cambio.', 'error'); return false; }
    setBusy(true);
    try {
      const result = await action(user.uid);
      if (message) notify(typeof message === 'function' ? message(result) : message);
      return true;
    } catch (err) {
      notify(firebaseMessage(err), 'error');
      return false;
    } finally { setBusy(false); }
  }, [status, user, notify]);

  const toggleFavorite = (meal) => {
    const exists = favorites.some((favorite) => favorite.id === meal.idMeal);
    return run((uid) => {
      const reference = doc(db, 'users', uid, 'favorites', meal.idMeal);
      return exists ? deleteDoc(reference) : setDoc(reference, {
        name: meal.strMeal, image: meal.strMealThumb || '', category: meal.strCategory || '', createdAt: serverTimestamp(),
      });
    }, exists ? 'Receta eliminada de favoritas.' : 'Receta guardada en favoritas.');
  };

  const addItem = (name, quantity) => run((uid) => addDoc(collection(db, 'users', uid, 'shopping'), {
    ...validateShoppingItem(name, quantity), completed: false, createdAt: serverTimestamp(),
  }), 'Ingrediente agregado a tu lista.');

  const editItem = (id, name, quantity) => run((uid) => updateDoc(doc(db, 'users', uid, 'shopping', id), {
    ...validateShoppingItem(name, quantity),
  }), 'Ingrediente actualizado.');

  const toggleItem = (item) => run((uid) => updateDoc(doc(db, 'users', uid, 'shopping', item.id), {
    completed: !item.completed,
  }), item.completed ? 'Ingrediente marcado como pendiente.' : '¡Un ingrediente menos por comprar!');

  const removeItem = (id) => run((uid) => deleteDoc(doc(db, 'users', uid, 'shopping', id)), 'Ingrediente eliminado.');

  const addIngredients = (items) => run((uid) => {
    if (!items.length) throw new Error('Elegí al menos un ingrediente.');
    const batch = writeBatch(db);
    items.forEach((item) => batch.set(doc(collection(db, 'users', uid, 'shopping')), {
      ...validateShoppingItem(item.name, item.quantity), completed: false, createdAt: serverTimestamp(),
      ...(item.product ? { product: productData(item.product, 1) } : {}),
    }));
    return batch.commit();
  }, items.some((item) => item.product) ? 'Ingredientes agregados con su precio de Día.' : 'Ingredientes agregados a tu lista de compras.');

  // Producto de Día elegido para un ingrediente de la lista.
  const shoppingDoc = (uid, id) => doc(db, 'users', uid, 'shopping', id);
  const chooseProduct = (item, product) => run((uid) => updateDoc(shoppingDoc(uid, item.id), {
    product: productData(product, item.product?.units || 1),
  }), 'Guardamos el producto de Día en tu lista.');
  const changeUnits = (item, units) => run((uid) => updateDoc(shoppingDoc(uid, item.id), {
    'product.units': Math.min(99, Math.max(1, units)),
  }), null);
  const clearProduct = (item) => run((uid) => updateDoc(shoppingDoc(uid, item.id), { product: deleteField() }), 'Quitaste el producto de Día.');
  const refreshPrices = (items, fresh) => run(async (uid) => {
    const byId = new Map(fresh.map((product) => [product.id, product]));
    const batch = writeBatch(db);
    let updated = 0;
    items.forEach((item) => {
      const product = byId.get(item.product.id);
      if (!product) return;
      batch.update(shoppingDoc(uid, item.id), { product: productData(product, item.product.units) });
      updated += 1;
    });
    if (updated) await batch.commit();
    return { updated, missing: items.length - updated };
  }, ({ updated, missing }) => `Actualizamos ${updated} ${updated === 1 ? 'precio' : 'precios'}${missing ? `. ${missing} ${missing === 1 ? 'producto ya no está' : 'productos ya no están'} disponible${missing === 1 ? '' : 's'} en Día` : ''}.`);

  return { favorites, shopping, status, error, busy, retry: () => setRetry((value) => value + 1), toggleFavorite, addItem, editItem, toggleItem, removeItem, addIngredients, chooseProduct, changeUnits, clearProduct, refreshPrices };
}
