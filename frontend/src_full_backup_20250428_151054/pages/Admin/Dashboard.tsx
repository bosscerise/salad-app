import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuSquare, Grid, Utensils, ArrowLeft, LogOut, Users, Mail, Menu, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import UsersManagement from './components/UsersManagement';
import OrdersManagement from './components/OrdersManagement';

// Admin Panel components
import SaladsManagement from './components/SaladsManagement';
import IngredientsManagement from './components/IngredientsManagement';

type ActiveView = 'salads' | 'ingredients' | 'categories' | 'orders' | 'users';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<ActiveView>('salads');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated and has admin role
  if (!user) {
    navigate('/login?redirect=/admin');
    return null;
  }
  if (user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handlelogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="fixed z-20 p-3 bg-white rounded-full shadow-lg md:hidden top-4 left-4"
      >
        <Menu size={24} className="text-emerald-700" />
      </button>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white shadow-xl md:shadow-md md:relative ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-emerald-700">Salad Admin</h2>
            <p className="text-sm text-gray-500">Management Dashboard</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="p-1 text-gray-500 rounded-full md:hidden hover:bg-gray-100"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto h-[calc(100%-10rem)]">
          <div className="mb-6">
            <p className="mb-2 text-xs font-medium text-gray-400 uppercase">Menu Management</p>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveView('salads');
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  activeView === 'salads' 
                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MenuSquare size={18} className="mr-3" /> 
                Salads
              </button>
              <button
                onClick={() => {
                  setActiveView('ingredients');
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  activeView === 'ingredients' 
                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Utensils size={18} className="mr-3" /> 
                Ingredients
              </button>
              <button
                onClick={() => {
                  setActiveView('categories');
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  activeView === 'categories' 
                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Grid size={18} className="mr-3" /> 
                Categories
              </button>
            </nav>
          </div>
          
          <div className="mb-6">
            <p className="mb-2 text-xs font-medium text-gray-400 uppercase">Shop Management</p>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveView('orders');
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  activeView === 'orders' 
                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Mail size={18} className="mr-3" /> 
                Orders
              </button>
              <button
                onClick={() => {
                  setActiveView('users');
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  activeView === 'users' 
                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users size={18} className="mr-3" /> 
                Users
              </button>
            </nav>
          </div>
          
          <div className="pt-6 mt-6 border-t">
            <button
              onClick={() => navigate('/')}
              className="flex items-center w-full px-4 py-2.5 mb-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={18} className="mr-3" />
              Back to Site
            </button>
            <button
              onClick={handlelogout}
              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="flex-1 w-full p-4 pt-16 transition-all duration-200 md:p-8 md:pt-8">
        <div className="pb-4 mb-4 border-b md:hidden">
          <h1 className="text-lg font-bold text-emerald-700">
            {activeView === 'salads' && 'Salads Management'}
            {activeView === 'ingredients' && 'Ingredients Management'}
            {activeView === 'categories' && 'Categories Management'}
            {activeView === 'orders' && 'Orders Management'}
            {activeView === 'users' && 'Users Management'}
          </h1>
        </div>
        
        <div className="overflow-hidden rounded-xl">
          {activeView === 'salads' && <SaladsManagement />}
          {activeView === 'ingredients' && <IngredientsManagement />}
          {activeView === 'categories' && (
            <div className="p-8 text-center bg-white rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full text-emerald-600 bg-emerald-100">
                <Grid size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-700">Category Management</h3>
              <p className="text-gray-500">Coming soon</p>
            </div>
          )}
          {activeView === 'orders' && <OrdersManagement />}
          {activeView === 'users' && <UsersManagement />}
        </div>
      </div>
    </div>
  );
}
