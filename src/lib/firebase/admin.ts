import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import {
  INFLUNEX_FIREBASE_PROJECT_ID,
  INFLUNEX_FIRESTORE_DATABASE_ID,
} from "./isolation";

const ADMIN_APP_NAME = "influnex-server";

export class FirebaseAdminConfigurationError extends Error {
  constructor() {
    super("Firebase Admin credential configuration is incomplete.");
    this.name = "FirebaseAdminConfigurationError";
  }
}

function getAdminApp(): App {
  const existing = getApps().find((app) => app.name === ADMIN_APP_NAME);
  if (existing) return existing;

  const projectId =
    process.env.FIREBASE_PROJECT_ID || INFLUNEX_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (Boolean(clientEmail) !== Boolean(privateKey)) {
    throw new FirebaseAdminConfigurationError();
  }

  return initializeApp(
    {
      credential:
        clientEmail && privateKey
          ? cert({ projectId, clientEmail, privateKey })
          : applicationDefault(),
      projectId,
    },
    ADMIN_APP_NAME,
  );
}

export function getInfluNexAdminServices(): {
  auth: Auth;
  firestore: Firestore;
} {
  const app = getApps().some((candidate) => candidate.name === ADMIN_APP_NAME)
    ? getApp(ADMIN_APP_NAME)
    : getAdminApp();

  return {
    auth: getAuth(app),
    firestore: getFirestore(app, INFLUNEX_FIRESTORE_DATABASE_ID),
  };
}
