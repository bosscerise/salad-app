import React, { lazy, Suspense, PropsWithChildren } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link,
  useLocation
} from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from './contexts/ThemeContext';

import "./App.css";
import { CartProvider } from "./contexts/CartContext";
//import NavBar from "./components/NavBar";
//import CreatAccount from "./pages/Login/CreatAccount";


// Lazy load components for better performance
const Homepage = lazy(() => import("./pages/HomePage/HomePage"));
const Menu = lazy(() => import("./pages/Menu/Menu"));
const AuthPage = lazy(() => import("./pages/AuthPage/AuthPage"));
// const dashboard = lazy(() => import("./pages/dashboard/dashboard"));
// const residentlist = lazy(() => import("./pages/residents/residentlist"));
// const residentdetails = lazy(() => import("./pages/residents/residentdetails"));
// const addresident = lazy(() => import("./pages/residents/addresident")); // add this line
// const vacantrooms = lazy(() => import("./pages/rooms/vacantrooms"));
// const allocateroom = lazy(() => import("./pages/rooms/allocateroom"));
// const login = lazy(() => import("./pages/login/login"));
// const roomslist = lazy(() => import("./pages/rooms/roomslist"));
// const roommanagement = lazy(() => import("./pages/rooms/roommanagment"));
// const occupancyreport = lazy(() => import("./pages/reports/occupancyreport"));
// const maintenancereport = lazy(() => import("./pages/reports/maintenancereport"));
// const financialreport = lazy(() => import("./pages/reports/financialreport"));
// const invoiceslist   = lazy(() => import("./pages/invoices/invoiceslist"));
// const invoiceform   = lazy(() => import("./pages/invoices/invoiceform"));
// const paymentform   = lazy(() => import("./pages/invoices/paymentform"));
// const residentcharges = lazy(() => import("./pages/residents/residentcharges"));
// const paymentsresident = lazy(() => import("./pages/payments/paymentsresident"));


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
            className="px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-primary-dark"
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
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

// Not Found Component
function NotFound() {
  return (
    <div className="not-found">
      <h2>404 - Page Not Found</h2>
      <Link to="/">Go to Home</Link>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop/>
          <div className="container w-full mx-auto">
            {/* Suspense provides a fallback while components are loading */}
            <ErrorBoundary>
              <main className="min-h-screen">
                <Suspense fallback={<LoadingFallback />}>
                  <CartProvider>
                    <div className="min-h-screen bg-gray-100">
                      {/*<Header />*/}
                      <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/menu" element={<Menu />} />
                        <Route path="/auth" element={<AuthPage />} />
                        {/* <Route path="/dashboard" element={<dashboard />} /> */}
                        {/* Catch-all route for undefined paths */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </CartProvider>
                </Suspense>
              </main>
            </ErrorBoundary>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default React.memo(App);