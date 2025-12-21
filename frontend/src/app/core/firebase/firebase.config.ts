import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAvLbyUVppHmMz77VLuolZEqHVszF7flL8",
  authDomain: "angular-project-9210a.firebaseapp.com",
  projectId: "angular-project-9210a",
  storageBucket: "angular-project-9210a.firebasestorage.app",
  messagingSenderId: "198434190690",
  appId: "1:198434190690:web:44210e924ba2640c1da83b",
  measurementId: "G-M5PWPDHTFH"
};

export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
