import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8DS9WOt7Phr3KFyh2MPNMPYjJOsIkCac",
  authDomain: "fiatsend-d117b.firebaseapp.com",
  projectId: "fiatsend-d117b",
  storageBucket: "fiatsend-d117b.firebasestorage.app",
  messagingSenderId: "505132588464",
  appId: "1:505132588464:web:1bf87b8c60914c6276ca75",
  measurementId: "G-QP6F3WRM04",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Analytics only if supported
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app); // Directly call getAnalytics without storing it
  }
});

export default app;
