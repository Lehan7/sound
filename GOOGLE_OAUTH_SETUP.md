# Setting Up Google OAuth for Authentication

This guide walks you through configuring Google OAuth for SoundAlchemy to enable the "Sign in with Google" functionality.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make note of your Project ID

## Step 2: Enable the Google OAuth API

1. In your Google Cloud project, go to "APIs & Services > Library"
2. Search for "Google OAuth" or "Google Identity"
3. Enable the "Google Identity Platform" API

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services > OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Fill in the required app information:
   - App name: "SoundAlchemy" (or your preferred name)
   - User support email: Your email address
   - Developer contact information: Your email address
4. Add the following scopes:
   - `email`
   - `profile`
5. Add test users if needed (for development)
6. Complete the registration

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services > Credentials"
2. Click "Create Credentials" and select "OAuth client ID"
3. Select "Web application" as the application type
4. Name the client ID (e.g., "SoundAlchemy Web Client")
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for local development)
   - Your production domain when ready
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/users/auth/google/callback` (for local development)
   - Your production callback URL when ready
7. Click "Create"
8. Make note of the Client ID and Client Secret

## Step 5: Configure Your Application

1. Update the backend `.env` file with:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5000
   ```

2. Make sure your frontend `.env` file includes:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## Step 6: Start the Application

1. Start your backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start your frontend:
   ```
   npm run dev
   ```

3. Test the "Sign in with Google" functionality

## Troubleshooting

If you encounter issues with Google OAuth authentication:

1. **Check your credentials**: Make sure your Client ID and Client Secret are correct in your environment variables.

2. **Verify authorized domains**: Ensure your frontend domain (localhost:5173) is added to the authorized JavaScript origins.

3. **Check redirect URIs**: Ensure your backend callback URL (localhost:5000/api/users/auth/google/callback) is added to authorized redirect URIs.

4. **Enable debugging**: Check browser console and server logs for errors.

5. **OAuth Consent Screen**: If your app is in "Testing" mode, make sure your test users are added to the allowed testers list.

6. **CORS issues**: Ensure your backend CORS settings allow requests from your frontend domain.

For production deployment, remember to update your URLs and add your production domains to the authorized origins and redirect URIs in the Google Cloud Console. 