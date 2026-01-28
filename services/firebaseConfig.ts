
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const getEnv = (key: string): string => {
  try {
    // @ts-ignore
    const val = import.meta.env?.[key];
    return typeof val === 'string' ? val : '';
  } catch (e) {
    return '';
  }
};

const FALLBACK_CONFIG = {
  apiKey: "AIzaSyDggUqxXmEd8qGcMmoFLmim7pfzaiPU4xY",
  authDomain: "pokemon-travel-v2.firebaseapp.com",
  projectId: "pokemon-travel-v2",
  storageBucket: "pokemon-travel-v2.firebasestorage.app",
  messagingSenderId: "208103149031",
  appId: "1:915110641546:web:f5a25a90c0bd6906fd1273"
};

const apiKey = getEnv('VITE_FIREBASE_API_KEY') || FALLBACK_CONFIG.apiKey;

if (!apiKey || apiKey.includes("把這裡換成")) {
  console.error("❌ Firebase 設定錯誤！請打開 .env 檔案，並填入您從 Firebase 網站複製的金鑰。");
} else {
  console.log("✅ Firebase 金鑰已讀取");
}

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || FALLBACK_CONFIG.authDomain,
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || FALLBACK_CONFIG.projectId,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || FALLBACK_CONFIG.messagingSenderId,
  appId: getEnv('VITE_FIREBASE_APP_ID') || FALLBACK_CONFIG.appId
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
