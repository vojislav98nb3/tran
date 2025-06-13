// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, remove, push } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxg8-zVfFc1SguwvXGd2Ht62muEULc53g",
  authDomain: "transferko-com.firebaseapp.com",
  databaseURL: "https://transferko-com-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "transferko-com",
  storageBucket: "transferko-com.firebasestorage.app",
  messagingSenderId: "153489561497",
  appId: "1:153489561497:web:f74799d50d12d9e26ae508",
  measurementId: "G-R56BBKHHQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { database, analytics };
export default app;