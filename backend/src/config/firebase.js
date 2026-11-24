const path = require('path');
const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const keyPath = path.resolve(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH || path.join(__dirname, '../../serviceAccountKey.json'),
  );
  return require(keyPath);
}

let serviceAccount;
try {
  serviceAccount = loadServiceAccount();
} catch (error) {
  console.error('No se pudo cargar la clave de Firebase:', error.message);
  console.error('Pon serviceAccountKey.json en backend/ o define FIREBASE_SERVICE_ACCOUNT.');
  process.exit(1);
}

const app = getApps()[0] || initializeApp({ credential: cert(serviceAccount) });

module.exports = {
  db: getFirestore(app),
  auth: getAuth(app),
  increment: (n) => FieldValue.increment(n),
};
