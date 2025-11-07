// Firebase configuration and initialization
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_UfMpEK9ReQML0ubej0uglK5jSAZTKQU",
  authDomain: "falconcore-v2.firebaseapp.com",
  projectId: "falconcore-v2",
  storageBucket: "falconcore-v2.firebasestorage.app",
  messagingSenderId: "1038906476883",
  appId: "1:1038906476883:web:ff6cb11d86b11644e3b9a6"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);

export default app;


