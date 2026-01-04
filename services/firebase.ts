import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA7627lnViEP_y7qWO35AcOrfhw7A0_ZUs",
  authDomain: "kampuskedilerii.firebaseapp.com",
  projectId: "kampuskedilerii",
  storageBucket: "kampuskedilerii.firebasestorage.app",
  messagingSenderId: "354515676760",
  appId: "1:354515676760:web:7fb710cfceef15ee54e42d",
  measurementId: "G-63Z4ZBRCFN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics: any = null;

isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(console.error);

export { analytics };
