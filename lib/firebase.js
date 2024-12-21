// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Utility functions
export function getTimestampFromKey(key) {
  // Extract the first 8 characters
  const timestampPart = key.substr(0, 8);
  // Convert from base 64 to decimal
  const timestampInt = parseInt(timestampPart, 36);
  // Adjust for the epoch used by Firebase (June 2015)
  return timestampInt + 1420070400000;
}
