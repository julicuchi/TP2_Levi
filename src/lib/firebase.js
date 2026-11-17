import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(config).every((value) => typeof value === 'string' && value.trim());
const app = firebaseConfigured ? initializeApp(config) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Se comparte la promesa para evitar sesiones duplicadas con React StrictMode.
let sessionPromise;
export function startSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      await auth.authStateReady();
      if (auth.currentUser) return auth.currentUser;
      return (await signInAnonymously(auth)).user;
    })().catch((error) => {
      sessionPromise = undefined;
      throw error;
    });
  }
  return sessionPromise;
}
