/**
 * Environment configuration for Node.js scripts
 * This file is used by test scripts that run in Node.js environment
 */

// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

// Validate Firebase configuration
const isFirebaseConfigValid = () => {
  return (
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.authDomain &&
    !!firebaseConfig.projectId &&
    !!firebaseConfig.storageBucket &&
    !!firebaseConfig.messagingSenderId &&
    !!firebaseConfig.appId
  );
};

// Validate configuration
if (!isFirebaseConfigValid()) {
  console.error(
    "Firebase configuration is incomplete. Make sure you have set up the .env.local file correctly."
  );
  process.exit(1);
}

module.exports = {
  firebaseConfig,
  isFirebaseConfigValid
};
