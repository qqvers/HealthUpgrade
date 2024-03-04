// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8FNzD9W0_6njppHfJ541Z5yvcVI5ZjEM",
  authDomain: "pcz2-f1ee9.firebaseapp.com",
  databaseURL: "https://pcz2-f1ee9-default-rtdb.firebaseio.com",
  projectId: "pcz2-f1ee9",
  storageBucket: "pcz2-f1ee9.appspot.com",
  messagingSenderId: "846098124659",
  appId: "1:846098124659:web:2a55a6a8989d5663813f06",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
