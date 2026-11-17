import { useCallback, useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db, firebaseConfigured, startSession } from '../lib/firebase';
import { firebaseMessage, validateShoppingItem } from '../lib/shopping';

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
      await action(user.uid);
      notify(message);
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
    }));
    return batch.commit();
  }, 'Ingredientes agregados a tu lista de compras.');

  return { favorites, shopping, status, error, busy, retry: () => setRetry((value) => value + 1), toggleFavorite, addItem, editItem, toggleItem, removeItem, addIngredients };
}
