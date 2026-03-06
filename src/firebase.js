import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBexOJgLKnUFeqZkMCZV-6m6Cnmj9x89hg",
    authDomain: "starbella-3ae9f.firebaseapp.com",
    projectId: "starbella-3ae9f",
    storageBucket: "starbella-3ae9f.firebasestorage.app",
    messagingSenderId: "117493628767",
    appId: "1:117493628767:web:3c396f32639193c459c0ea",
    measurementId: "G-XJSP1BDGHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
