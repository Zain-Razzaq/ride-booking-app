import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { Dashboard } from "./components/Dashboard";
import { BookRide, TripHistory, DriverRequests } from "./pages";
import { Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">{children}</div>

        {/* Brand Footer */}
        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold text-primary">RideShare</h2>
          <p className="text-gray-600 text-sm mt-1">
            Your journey, our priority
          </p>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <AuthRoute>
            <AuthLayout>
              <LoginForm
                onSwitchToRegister={() => (window.location.href = "/signup")}
              />
            </AuthLayout>
          </AuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRoute>
            <AuthLayout>
              <RegisterForm
                onSwitchToLogin={() => (window.location.href = "/login")}
              />
            </AuthLayout>
          </AuthRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-ride"
        element={
          <ProtectedRoute>
            <BookRide />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip-history"
        element={
          <ProtectedRoute>
            <TripHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver-requests"
        element={
          <ProtectedRoute>
            <DriverRequests />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "rgb(236, 0, 140)",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "rgb(236, 0, 140)",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
};

export default App;
