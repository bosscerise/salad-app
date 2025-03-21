import React, { lazy, Suspense, PropsWithChildren } from "react";
import {
  Routes, 
  Route, 
  Link,
  useLocation
} from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from "./contexts/CartContext";
import "./App.css";

// Lazy load components
const Homepage = lazy(() => import("./pages/HomePage/HomePage"));
const Menu = lazy(() => import("./pages/Menu/Menu"));
const AuthPage = lazy(() => import("./pages/AuthPage/AuthPage"));
const RewardsPage = lazy(() => import("./pages/RewardsPage/RewardsPage"));


// Error boundary state and component
interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Something went wrong</h2>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading Fallback Component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-t-4 rounded-full animate-spin border-emerald-500"></div>
      <p className="ml-3 text-emerald-700">Loading...</p>
    </div>
  );
}

// Not Found Component
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <h2 className="mb-4 text-3xl font-bold text-gray-800">404 - Page Not Found</h2>
      <p className="mb-6 text-gray-600">We couldn't find the page you're looking for.</p>
      <Link to="/" className="px-6 py-2 text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700">
        Go to Home
      </Link>
    </div>
  );
}

// ScrollToTop component - MUST be used inside Router
function ScrollToTop() {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// AppContent component that uses router hooks
function AppContent() {
  const location = useLocation();
  
  return (
    <div className="container w-full mx-auto">
      <ScrollToTop />
      <ErrorBoundary>
        <main className="min-h-screen">
          <Suspense fallback={<LoadingFallback />}>
            <CartProvider>
              <div className="min-h-screen bg-gray-100">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/rewards" element={<RewardsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </CartProvider>
          </Suspense>
        </main>
      </ErrorBoundary>
    </div>
  );
}

// Main App component
function App() {  
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default React.memo(App);