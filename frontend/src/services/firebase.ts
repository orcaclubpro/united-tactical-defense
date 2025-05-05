// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAllmt4QlQQXWB2ryXUjVehhVTBEJSjYw4",
  authDomain: "udtanaheimhills.firebaseapp.com",
  projectId: "udtanaheimhills",
  storageBucket: "udtanaheimhills.firebasestorage.app",
  messagingSenderId: "511015190864",
  appId: "1:511015190864:web:77c142a2bacce5c779ac55",
  measurementId: "G-0PV4R3M949"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics }; 