import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Music, Globe, Users, MessageSquare, Mic2, Award, Heart } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import PrivateRoute from './components/PrivateRoute';
import AdminSignIn from './components/AdminSignIn';
import AdminDashboard from './components/AdminDashboard';
import SkipToContent from './components/SkipToContent';
import { useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import AdminLayout from './components/AdminDashboard/AdminLayout';
import AdminHome from './components/AdminDashboard/AdminHome';
import Analytics from './components/AdminDashboard/Analytics';
import UserManagement from './components/AdminDashboard/UserManagement';
import EventManagement from './components/AdminDashboard/EventManagement';
import CreateEvent from './components/AdminDashboard/CreateEvent';
import DatabaseStats from './components/AdminDashboard/DatabaseStats';
import SecurityLogs from './components/AdminDashboard/SecurityLogs';
import PerformanceMonitor from './components/AdminDashboard/PerformanceMonitor';
import SystemSettings from './components/AdminDashboard/SystemSettings';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingFallback from './components/LoadingFallback';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FriendsForPeaceLogo from './components/FriendsForPeaceLogo';
import FirebaseTest from './components/FirebaseTest';
import OAuthTest from './components/OAuthTest';
import TestOAuthPage from './pages/TestOAuthPage';

// Lazy load non-critical components
const Hero = React.lazy(() => import('./components/Hero'));
const Features = React.lazy(() => import('./components/Features'));
const Project = React.lazy(() => import('./components/Project'));
const FriendsForPeace = React.lazy(() => import('./components/FriendsForPeace'));
const Collaborators = React.lazy(() => import('./components/Collaborators'));
const UpcomingCollaboration = React.lazy(() => import('./components/UpcomingCollaboration'));
const MusicianCredits = React.lazy(() => import('./components/MusicianCredits'));
const GlobalImpact = React.lazy(() => import('./components/GlobalImpact'));
const MusicTechnology = React.lazy(() => import('./components/MusicTechnology'));
const SuccessStories = React.lazy(() => import('./components/SuccessStories'));
const Testimonials = React.lazy(() => import('./components/Testimonials'));
const Workshop = React.lazy(() => import('./components/Workshop'));
// const Community = React.lazy(() => import('./components/Community'));// 
const JoinMovement = React.lazy(() => import('./components/JoinMovement'));
const Team = React.lazy(() => import('./components/Team'));
const UserProfile = React.lazy(() => import('./components/UserProfile'));

function App() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check for browser extensions
  useEffect(() => {
    const handleExtensionError = (event: ErrorEvent) => {
      if (event.message.includes('inpage.js') || event.message.includes('Cannot read properties of null')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('error', handleExtensionError);
    return () => window.removeEventListener('error', handleExtensionError);
  }, []);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a16] text-white overflow-x-hidden">
      <SkipToContent />
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1494&q=80')] bg-cover bg-fixed opacity-10 z-0" aria-hidden="true"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onLoginClick={() => setShowLoginModal(true)} />
        
        <main id="main-content" className="flex-grow">
          <Routes>
            <Route path="/" element={
              <div className="w-full mx-auto">
                <Hero />
                <Features />
                <Project />
                <Suspense fallback={<LoadingFallback />}>
                  <UpcomingCollaboration />
                  <FriendsForPeace />
                  <MusicTechnology />
                  <Team />
                </Suspense>
              </div>
            } />
            
            <Route path="/firebase-test" element={
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Firebase Authentication Test Page</h1>
                <FirebaseTest />
              </div>
            } />
            
            <Route path="/oauth-test" element={
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Google OAuth Test Page</h1>
                <OAuthTest />
              </div>
            } />
            
            <Route path="/test-oauth" element={<TestOAuthPage />} />
            <Route path="/friends-for-peace-logo" element={<FriendsForPeaceLogo />} />
            
            <Route path="/admin/*" element={
              <AdminProvider>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </AdminProvider>
            }>
              <Route index element={<AdminHome />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="events" element={<EventManagement />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="database" element={<DatabaseStats />} />
              <Route path="security" element={<SecurityLogs />} />
              <Route path="performance" element={<PerformanceMonitor />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>
            
            <Route path="/admin-signin" element={
              user?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <AdminSignIn />
              )
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <UserProfile />
                </Suspense>
              </PrivateRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
        
        {showLoginModal && <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;