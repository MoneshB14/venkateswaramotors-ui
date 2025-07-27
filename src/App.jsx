import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/Toaster';
import { GlobalProvider } from './contexts/GlobalContext';

// VM Service Components
import ServiceHome from './pages/vm-service/ServiceHome';
import SignupForm from './components/vm-service/SignupForm';
import LoginForm from './components/vm-service/LoginForm';
import OtpVerification from './components/vm-service/OtpVerification';
import Dashboard from './components/vm-service/Dashboard';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlobalProvider>
          <Router>
            <div className="App">
              <Routes>
                              {/* VM Service Routes */}
              <Route path="/service" element={<ServiceHome />} />
              <Route path="/service/signup" element={<SignupForm />} />
              <Route path="/service/login" element={<LoginForm />} />
              <Route path="/service/verify-otp" element={<OtpVerification />} />
              <Route
                path="/service/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to VM Service */}
              <Route path="/" element={<Navigate to="/service" replace />} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/service" replace />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </GlobalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
