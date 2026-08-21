import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "blueprint-envision",
  appId: "1:1034076496098:web:914f03abc3e206a8633ebb",
  storageBucket: "blueprint-envision.firebasestorage.app",
  apiKey: "AIzaSyCKEyf2cQlYHXyLVA7Q4-nC39pWz06ENL8",
  authDomain: "blueprint-envision.firebaseapp.com",
  messagingSenderId: "1034076496098"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
