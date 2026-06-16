import dotenv from "dotenv";
import { initializeApp, type App } from "firebase-admin";
import { getAuth, type Auth } from "firebase-admin/auth";
import { type FirebaseOptions } from "firebase/app";

dotenv.config();

const firebaseConfig:FirebaseOptions = {
  apiKey: process.env.apiKey as string,
  authDomain: process.env.authDomain as string,
  projectId: process.env.projectId as string,
  storageBucket: process.env.storageBucket as string,
  messagingSenderId: process.env.messagingSenderId as string,
  appId: process.env.appId as string,
  measurementId: process.env.measurementId as string
};

const app:App = initializeApp(firebaseConfig);
const auth:Auth = getAuth(app);

export default auth;