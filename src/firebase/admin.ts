import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// Check if we have valid Firebase admin config
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId) {
  console.error('Firebase admin config is incomplete: missing project ID');
  throw new Error('Firebase admin configuration is incomplete. Please check environment variables.');
}

let app: App;
let firestore: Firestore;

// This prevents re-initializing the admin app on the server.
if (getApps().length === 0) {
  try {
    // Try to initialize with service account credentials if available
    if (clientEmail && privateKey) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
        }),
      });
      console.log('Firebase Admin initialized with service account credentials');
    } else {
      // Fallback to default credentials (useful for development with local emulators)
      app = initializeApp({
        projectId,
      });
      console.log('Firebase Admin initialized with project ID only (development mode)');
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    throw new Error('Failed to initialize Firebase Admin');
  }
} else {
  app = getApps()[0];
}

firestore = getFirestore(app);

export { firestore as adminFirestore };
export { app as adminApp };
