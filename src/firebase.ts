// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAc5GtjquhKPN-onVzriSoKRDLxQ0TCzO8",
  authDomain: "lal-sobuj-2.firebaseapp.com",
  projectId: "lal-sobuj-2",
  storageBucket: "lal-sobuj-2.firebasestorage.app",
  messagingSenderId: "266120244284",
  appId: "1:266120244284:web:cf465fc6d3da088ba0a739",
  measurementId: "G-24JR6TF9LK"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Graceful fallback for environments where analytics is restricted
    });
}

export default app;
