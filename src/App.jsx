import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { GlobalProvider } from './contexts/GlobalContext';
import { LoadingProvider } from './contexts/LoadingContext';

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
        <LoadingProvider>
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
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
              }}
            />
          </Router>
          </GlobalProvider>
        </LoadingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
