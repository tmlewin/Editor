// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Import Firebase configuration from centralized config
import { firebaseConfig, isFirebaseConfigValid } from "@/config/env";

// Validate Firebase configuration
if (!isFirebaseConfigValid()) {
  console.error(
    "Firebase configuration is incomplete. Make sure you have set up the .env.local file correctly."
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics if in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;
