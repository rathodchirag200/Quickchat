import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDAknZ8wp54trfHKoaAuG19ujqmrhdncsk",
  authDomain: "quick-chat-22b4f.firebaseapp.com",
  projectId: "quick-chat-22b4f",
  storageBucket: "quick-chat-22b4f.firebasestorage.app",
  messagingSenderId: "455116064170",
  appId: "1:455116064170:web:74ebf506ae3d696f45d7d3",
  measurementId: "G-DSJD88P8GN",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const realtimeDB = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
