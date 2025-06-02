// Simple script to test Firebase configuration
// Run with: node scripts/test-firebase-config.js

// Replace these with your .env values
const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyD--lieggygBJNj-GSrmIwtCY0vtEmopns",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "soundalchemy-577b4.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "soundalchemy-577b4",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "soundalchemy-577b4.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "114604289713301961748",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:772996673219:web:c530d8e2f9f97f8f687c76",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CGF7DJNT79"
};

console.log('==== Firebase Configuration Test ====');
console.log('\nTesting Firebase configuration with the following values:');
console.log('-------------------------------------');

// Check required fields
const requiredFields = ['apiKey', 'authDomain', 'projectId'];
let hasErrors = false;

for (const field of requiredFields) {
  if (!config[field]) {
    console.error(`❌ ERROR: Missing required field: ${field}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${field}: ${config[field].substring(0, 10)}...`);
  }
}

// Check common issues
console.log('\n==== Common Issues Checklist ====');

// Check API Key format
if (!/^AIza[0-9A-Za-z-_]{35}$/.test(config.apiKey)) {
  console.error('❌ ERROR: API key has incorrect format. Should start with "AIza" and be 39 characters long.');
  hasErrors = true;
} else {
  console.log('✅ API Key format looks correct');
}

// Check authDomain format
if (!/.+\.firebaseapp\.com$/.test(config.authDomain)) {
  console.error('❌ ERROR: authDomain should end with .firebaseapp.com');
  hasErrors = true;
} else {
  console.log('✅ authDomain format looks correct');
}

// Check project ID matches auth domain
const projectIdFromAuthDomain = config.authDomain.split('.')[0];
if (projectIdFromAuthDomain !== config.projectId) {
  console.error(`❌ WARNING: projectId (${config.projectId}) doesn't match what's expected from authDomain (${projectIdFromAuthDomain})`);
} else {
  console.log('✅ projectId matches authDomain');
}

// Check App ID format
if (!/^1:[0-9]+:web:[a-f0-9]+$/.test(config.appId)) {
  console.error('❌ WARNING: appId format looks incorrect. Should be in format "1:123456789:web:abcdef123456"');
} else {
  console.log('✅ appId format looks correct');
}

console.log('\n==== Next Steps ====');
if (hasErrors) {
  console.log('❌ Found potential issues with your Firebase configuration.');
  console.log('\nTROUBLESHOOTING STEPS:');
  console.log('1. Verify your Firebase project exists at: https://console.firebase.google.com');
  console.log('2. Double check your configuration by going to Project Settings > Your Apps');
  console.log('3. Make sure the Firebase Authentication service is enabled');
  console.log('4. Verify Google Sign-in is enabled in Authentication > Sign-in methods');
  console.log('5. Add your domain to the Authorized Domains list in Authentication > Settings');
} else {
  console.log('✅ Basic configuration checks passed!');
  console.log('\nIf you\'re still having issues, please verify:');
  console.log('1. Firebase Authentication is enabled for your project');
  console.log('2. Google Sign-in provider is enabled in Firebase Console');
  console.log('3. Your app domain is added to authorized domains in Firebase Authentication Settings');
  console.log('4. Your Google Cloud OAuth consent screen is properly configured');
}

console.log('\nFor more detailed diagnostics, run this in your browser console:');
console.log('firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(console.error)'); 