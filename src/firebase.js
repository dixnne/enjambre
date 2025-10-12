
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7CyIY8PLXLcqEy9XyO5odX3lzx_tjs4w",
  authDomain: "enjambre-e27fd.firebaseapp.com",
  projectId: "enjambre-e27fd",
  storageBucket: "enjambre-e27fd.appspot.com",
  messagingSenderId: "896116005947",
  appId: "1:896116005947:web:d53387ac029ef5cf03d01e",
  measurementId: "G-9WPWQXDEJ6"
};

let auth;
try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
} catch (e) {
    console.error("Error al inicializar Firebase. ¿Revisaste tu configuración?", e);
}

export { auth, onAuthStateChanged, signInAnonymously };
