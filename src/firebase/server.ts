import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;

// Check if we have valid Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase server config is incomplete:', {
    apiKey: !!firebaseConfig.apiKey,
    projectId: !!firebaseConfig.projectId,
    authDomain: !!firebaseConfig.authDomain,
    appId: !!firebaseConfig.appId,
    allEnvVars: {
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
  });
  // Don't throw error, just log it and export null
  // This allows the app to continue with fallback behavior
} else {
  console.log('Firebase server config looks valid, attempting initialization...');
  try {
    // This prevents re-initializing the app on the server.
    if (getApps().length === 0) {
        console.log('Initializing Firebase app with config:', {
          apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
          projectId: firebaseConfig.projectId,
          authDomain: firebaseConfig.authDomain,
          appId: firebaseConfig.appId.substring(0, 10) + '...'
        });
        app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized successfully');
    } else {
        app = getApp();
        console.log('Using existing Firebase app');
    }

    firestore = getFirestore(app);
    console.log('Firestore instance created successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    app = null;
    firestore = null;
  }
}

export { firestore as serverFirestore };
