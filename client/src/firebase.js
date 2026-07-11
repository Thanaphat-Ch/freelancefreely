// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpXCfIMTimnOIl8dreAUyooFELYvXahLE",
  authDomain: "freelancefreely-954ae.firebaseapp.com",
  projectId: "freelancefreely-954ae",
  storageBucket: "freelancefreely-954ae.firebasestorage.app",
  messagingSenderId: "833034819183",
  appId: "1:833034819183:web:4dffead63cc20d2b439f9a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);