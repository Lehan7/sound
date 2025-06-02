import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import GoogleLoginButton from './GoogleLoginButton';
import toast from 'react-hot-toast';

const OAuthTest = () => {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Check if user is already signed in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
        console.log('User already signed in:', currentUser.email);
      } else {
        setUser(null);
        console.log('No user signed in');
      }
    });
    
    // Firebase OAuth info
    console.log('Firebase OAuth config:', {
      authDomain: auth.config?.authDomain,
      apiKey: '[REDACTED]', // Don't log actual API key
      projectId: auth.app.options.projectId
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">OAuth Test</h1>
      
      {user ? (
        <div>
          <div className="flex items-center mb-4">
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt={user.displayName || user.email} 
                className="w-12 h-12 rounded-full mr-3"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{user.displayName || 'User'}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          
          <div className="p-4 mb-4 bg-green-100 text-green-800 rounded-lg">
            <p className="font-medium">Successfully authenticated with Google!</p>
            <p className="text-sm">User ID: {user.uid}</p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Click the button below to test Google OAuth login with your new credentials:
          </p>
          
          <GoogleLoginButton />
          
          <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
            <p className="font-medium">Authentication Info:</p>
            <p>Project ID: {auth.app.options.projectId || 'Not available'}</p>
            <p>Auth Domain: {auth.config?.authDomain || 'Not available'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthTest; 