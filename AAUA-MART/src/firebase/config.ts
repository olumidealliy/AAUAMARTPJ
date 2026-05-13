import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyDK7iyJoREqAocWaWAwyrsIGPkiqVdYRck",
  authDomain: "aaua-mart-ally.firebaseapp.com",
  projectId: "aaua-mart-ally",
  storageBucket: "aaua-mart-ally.firebasestorage.app",
  messagingSenderId: "277376266940",
  appId: "1:277376266940:web:69a7d8239082e878b896b9",
  measurementId: "G-HWLY8YRNB3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;