import React, { lazy, Suspense } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link 
} from "react-router-dom";

import "./App.css";
import { CartProvider } from "./contexts/CartContext";
import Header from "./components/Header";
//import NavBar from "./components/NavBar";
//import CreatAccount from "./pages/Login/CreatAccount";


// Lazy load components for better performance
const Homepage = lazy(() => import("./pages/HomePage/HomePage"));
const Menu = lazy(() => import("./pages/Menu/Menu"));
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

function App() {
  return (
    <Router>
      <div className="container w-full mx-auto">
        {/* Suspense provides a fallback while components are loading */}
        <Suspense fallback={<LoadingFallback />}>
          <CartProvider>
            <div className="min-h-screen bg-gray-100">
              <Header />
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/menu" element={<Menu />} />
                {/* Catch-all route for undefined paths */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </CartProvider>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;