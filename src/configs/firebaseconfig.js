// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAWHKyAdaKXeWL6fPTkl1y4XaBu3522in0",
  authDomain: "sr-ailectures.firebaseapp.com",
  projectId: "sr-ailectures",
  storageBucket: "sr-ailectures.firebasestorage.app",
  messagingSenderId: "980031491123",
  appId: "1:980031491123:web:aca796033085819dc12746",
  measurementId: "G-0NG05TXY9H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ SAFE ANALYTICS FIX
let analytics = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((yes) => {
      if (yes) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      console.log("Analytics not supported");
    });
}

// ✅ VERY IMPORTANT EXPORT
export default app;
export { analytics };