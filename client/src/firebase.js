// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "freelancefreely-954ae.firebaseapp.com",
  projectId: "freelancefreely-954ae",
  storageBucket: "freelancefreely-954ae.firebasestorage.app",
  messagingSenderId: "833034819183",
  appId: "1:833034819183:web:4dffead63cc20d2b439f9a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);