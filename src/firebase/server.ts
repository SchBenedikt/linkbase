import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Check if we have valid Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase server config is incomplete:', {
    apiKey: !!firebaseConfig.apiKey,
    projectId: !!firebaseConfig.projectId,
    authDomain: !!firebaseConfig.authDomain,
    appId: !!firebaseConfig.appId
  });
  throw new Error('Firebase configuration is incomplete. Please check environment variables.');
}

let app: FirebaseApp;
// This prevents re-initializing the app on the server.
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const firestore: Firestore = getFirestore(app);

export { firestore as serverFirestore };
