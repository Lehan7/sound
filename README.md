# Sound Alchemy Music Platform

A secure and feature-rich music platform built with Firebase and Node.js.

## Features

- User Authentication
  - Email/Password registration and login
  - Email verification
  - Password reset functionality
  - OAuth providers support (Google, Facebook, GitHub)
  - Account blocking protection
  - Rate limiting
  - Session management

- Admin Panel
  - User management
    - View all users
    - Search and filter users
    - Update user details
    - Block/unblock users
    - Delete users
    - Bulk actions
  - Dashboard statistics
  - Security monitoring
  - Settings management

- Security Features
  - JWT authentication
  - Role-based access control
  - Email verification
  - Password strength requirements
  - Rate limiting
  - XSS protection
  - CSRF protection
  - Secure headers
  - Input validation and sanitization

## Prerequisites

- Node.js (v14 or higher)
- Firebase account and project
- Firebase Admin SDK credentials

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key_min_32_chars

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Firebase Web App
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Email Service
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@yourapp.com

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Google Authentication Setup

To enable Google Sign-In functionality:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen:
   - Add your app name, user support email, and developer contact information
   - Add authorized domains
   - Save and continue
6. Create OAuth client ID:
   - Application type: Web application
   - Name: Your application name
   - Authorized JavaScript origins: Add your frontend URL (e.g., `http://localhost:5173`)
   - Authorized redirect URIs: Add your auth redirect URL (e.g., `http://localhost:5173/auth/google/callback`)
   - Click "Create"
7. Copy the Client ID and Client Secret
8. Update your `.env` file with these credentials:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   ```
9. In the Firebase Console:
   - Go to Authentication > Sign-in method
   - Enable Google sign-in provider
   - Add your authorized domains

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/soundalchemy.git
cd soundalchemy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up Firebase:
- Create a new Firebase project
- Enable Email/Password authentication
- Enable OAuth providers (optional)
- Create a web app and get configuration
- Generate admin SDK credentials
- Update `.env` with Firebase credentials

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication

- POST `/api/users/register` - Register new user
- POST `/api/users/login` - Login user
- GET `/api/verify-email` - Verify email address
- POST `/api/forgot-password` - Request password reset
- POST `/api/reset-password` - Reset password
- POST `/api/change-password` - Change password (authenticated)

### Admin

- GET `/api/admin/users` - List users (with pagination, search, filters)
- GET `/api/admin/users/:userId` - Get user details
- PUT `/api/admin/users/:userId` - Update user
- DELETE `/api/admin/users/:userId` - Delete user
- GET `/api/admin/stats` - Get admin dashboard stats
- POST `/api/admin/users/bulk` - Perform bulk actions on users

## Security Best Practices

1. Environment Variables:
   - Never commit `.env` file
   - Use strong, unique secrets
   - Rotate secrets regularly

2. Authentication:
   - Use secure password requirements
   - Implement rate limiting
   - Enable email verification
   - Use secure session management

3. Authorization:
   - Implement role-based access control
   - Validate user permissions
   - Protect admin routes

4. Data Security:
   - Validate and sanitize all inputs
   - Use parameterized queries
   - Implement proper error handling
   - Enable Firebase Security Rules

5. API Security:
   - Use HTTPS
   - Implement CORS
   - Set secure headers
   - Rate limit requests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.