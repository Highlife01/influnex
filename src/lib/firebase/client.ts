import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import {
  INFLUNEX_FIREBASE_PROJECT_ID,
  INFLUNEX_FIRESTORE_DATABASE_ID,
  INFLUNEX_STORAGE_BUCKET,
} from "./isolation";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    `${INFLUNEX_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    INFLUNEX_FIREBASE_PROJECT_ID,
  storageBucket: INFLUNEX_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "637491972242",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:637491972242:web:eba0aaa81a9f5dc339fe4b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

const INFLUNEX_FIREBASE_APP_NAME = "influnex-isolated-client";

export function getInfluNexFirebaseApp(): FirebaseApp {
  const existing = getApps().find((a) => a.name === INFLUNEX_FIREBASE_APP_NAME);
  if (existing) return existing;
  return initializeApp(firebaseConfig, INFLUNEX_FIREBASE_APP_NAME);
}

export function getInfluNexAuth(): Auth {
  return getAuth(getInfluNexFirebaseApp());
}

export function getInfluNexGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

/**
 * Connects strictly to the isolated `influnex-db` Firestore instance.
 * Never falls back to `(default)` database to guarantee data isolation on `karacateknik-b202f`.
 */
export function getInfluNexFirestore(): Firestore {
  const app = getInfluNexFirebaseApp();
  try {
    return initializeFirestore(
      app,
      { ignoreUndefinedProperties: true },
      INFLUNEX_FIRESTORE_DATABASE_ID
    );
  } catch {
    return getFirestore(app, INFLUNEX_FIRESTORE_DATABASE_ID);
  }
}

export function getInfluNexStorage(): FirebaseStorage {
  return getStorage(getInfluNexFirebaseApp(), INFLUNEX_STORAGE_BUCKET);
}
