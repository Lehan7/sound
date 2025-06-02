import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, getAuth, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const FirebaseTest = () => {
  const [result, setResult] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('User already signed in:', firebaseUser.email);
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          uid: firebaseUser.uid
        });
      } else {
        console.log('No user signed in');
      }
    });

    // Check Firebase config
    console.log('Current Firebase config:', {
      authDomain: auth.config?.authDomain,
      apiKey: '***', // Hiding actual key
      appName: auth.app?.name
    });

    return () => unsubscribe();
  }, []);

  const testSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setResult('Successfully signed out');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      setResult(`Sign out error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testDirectAuth = async () => {
    setLoading(true);
    setResult('Testing direct Firebase authentication...');
    
    try {
      // Create a fresh provider for this request
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Force account selection
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      setResult('Initiating Google sign-in...');
      
      // Try direct sign in
      const userCredential = await signInWithPopup(auth, provider);
      
      setResult(`Success! Signed in as ${userCredential.user.email}`);
      setUser({
        email: userCredential.user.email,
        name: userCredential.user.displayName,
        uid: userCredential.user.uid
      });
      
      toast.success('Authentication successful!');
    } catch (error) {
      console.error('Firebase test error:', error);
      
      // Get detailed error info
      let errorMessage = 'Authentication failed';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
        
        // Extract Firebase error code if available
        const firebaseError = error as any;
        if (firebaseError.code) {
          errorMessage += `\nCode: ${firebaseError.code}`;
        }
      }
      
      setResult(errorMessage);
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Firebase Direct Test</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Test direct Firebase authentication without going through contexts</p>
          <div className="flex space-x-2">
            <button 
              onClick={testDirectAuth}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Firebase Auth'}
            </button>
            
            {user && (
              <button
                onClick={testSignOut}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
        
        {result && (
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded overflow-auto max-h-60">
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        {user && (
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
            <h3 className="font-medium mb-2">Authenticated User:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="font-medium">Email:</span>
              <span>{user.email}</span>
              <span className="font-medium">Name:</span>
              <span>{user.name}</span>
              <span className="font-medium">UID:</span>
              <span className="break-all">{user.uid}</span>
            </div>
          </div>
        )}
        
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900 text-xs text-yellow-800 dark:text-yellow-200 rounded">
          <p>Debug Info:</p>
          <p>Auth initialized: {auth ? 'Yes' : 'No'}</p>
          <p>Auth Domain: {auth?.config?.authDomain || 'Not available'}</p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest; 