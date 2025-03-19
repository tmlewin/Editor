// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBycacqDrZDF2fwUTW-i_MIxToRDfZdaU",
  authDomain: "disney-f0465.firebaseapp.com",
  projectId: "disney-f0465",
  storageBucket: "disney-f0465.firebasestorage.app",
  messagingSenderId: "882131124902",
  appId: "1:882131124902:web:3176a466ae927c784e2a67",
  measurementId: "G-LJTPNJFEJB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);