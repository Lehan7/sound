import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../firebase/config';

const TestAuth: React.FC = () => {
  const { user, signInWithGoogle, logout } = useAuth();

  useEffect(() => {
    console.log("Current Firebase Auth config:", {
      apiKey: "REDACTED",
      authDomain: auth?.config?.authDomain,
      projectId: auth?.config?.projectId,
      hasGoogleProvider: !!googleProvider,
      currentUser: auth?.currentUser?.email || "Not signed in"
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      toast.loading('Connecting to Google...', { id: 'google-auth' });
      console.log("Starting Google sign-in attempt...");
      
      // Log provider info before sign-in attempt
      console.log("Google provider:", googleProvider ? "Available" : "Not available", {
        customParameters: googleProvider?._customParameters
      });
      
      await signInWithGoogle();
      toast.success('Successfully signed in with Google!', { id: 'google-auth' });
    } catch (error) {
      console.error('Google sign-in error in TestAuth:', error);
      
      // Detailed error feedback
      let errorMessage = "Failed to sign in with Google";
      if (error instanceof Error) {
        // Try to provide more user-friendly error messages
        if (error.message.includes('auth/configuration-not-found')) {
          errorMessage = "Firebase couldn't find the authentication configuration. Please check your Firebase console settings.";
        } else if (error.message.includes('auth/popup-closed-by-user')) {
          errorMessage = "Sign-in popup was closed before completing.";
        }
        console.log(`Error details: ${error.message}`);
      }
      
      toast.error(errorMessage, { id: 'google-auth' });
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md my-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Authentication Test</h2>
      
      {user ? (
        <div>
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 rounded">
            <p className="font-medium text-green-800 dark:text-green-200">Logged in as: {user.name}</p>
            <p className="text-sm text-green-700 dark:text-green-300">Email: {user.email}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Log Out
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center py-3 px-6 bg-white text-gray-800 rounded-lg shadow border border-gray-300 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">Debug Info</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              authDomain: {auth?.config?.authDomain || "Not available"}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Google Provider: {googleProvider ? "Available" : "Not available"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAuth; 