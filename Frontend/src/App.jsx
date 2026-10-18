import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';
import Chat from '@/pages/Chat';
import Login from '@/pages/Login';
import Rooms from '@/pages/Rooms';
import Signup from '@/pages/Signup';
import './App.css';

const LoadingScreen = () => (
  <div className="route-loading" role="status" aria-label="Loading">
    <span className="route-loading-spinner" />
  </div>
);

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return <Navigate to={user ? '/chat' : '/login'} replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/chat" replace />;

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/signup"
      element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      }
    />
    <Route
      path="/chat"
      element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      }
    />
    <Route
      path="/rooms"
      element={
        <ProtectedRoute>
          <Rooms />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{ style: { pointerEvents: 'none' } }}
        />
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
