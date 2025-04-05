import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, PlusCircle, MenuSquare, Grid, Utensils, ArrowLeft, LogOut, Users, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { pb } from '../../services/api';

// Admin Panel components
import SaladsManagement from './components/SaladsManagement';
import IngredientsManagement from './components/IngredientsManagement';

type ActiveView = 'salads' | 'ingredients' | 'categories' | 'orders' | 'users';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<ActiveView>('salads');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated and has admin role
  if (!user) {
    // Redirect to login page if not authenticated
    navigate('/login?redirect=/admin');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-emerald-700">Salad Admin</h2>
          <p className="text-sm text-gray-500">Management Dashboard</p>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <p className="mb-2 text-xs font-medium text-gray-400 uppercase">Menu Management</p>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveView('salads')}
                className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg ${
                  activeView === 'salads' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MenuSquare size={18} className="mr-3" /> 
                Salads
              </button>
              <button
                onClick={() => setActiveView('ingredients')}
                className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg ${
                  activeView === 'ingredients' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Utensils size={18} className="mr-3" /> 
                Ingredients
              </button>
              <button
                onClick={() => setActiveView('categories')}
                className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg ${
                  activeView === 'categories' 
                    ? 'bg-emerald-50 text-emerald-700' 
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
                onClick={() => setActiveView('orders')}
                className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg ${
                  activeView === 'orders' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Mail size={18} className="mr-3" /> 
                Orders
              </button>
              <button
                onClick={() => setActiveView('users')}
                className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg ${
                  activeView === 'users' 
                    ? 'bg-emerald-50 text-emerald-700' 
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
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeView === 'salads' && <SaladsManagement />}
        {activeView === 'ingredients' && <IngredientsManagement />}
        {activeView === 'categories' && (
          <div className="p-8 text-center bg-white rounded-lg">
            <h3 className="text-xl font-bold text-gray-700">Category Management</h3>
            <p className="text-gray-500">Coming soon</p>
          </div>
        )}
        {activeView === 'orders' && (
          <div className="p-8 text-center bg-white rounded-lg">
            <h3 className="text-xl font-bold text-gray-700">Order Management</h3>
            <p className="text-gray-500">Coming soon</p>
          </div>
        )}
        {activeView === 'users' && (
          <div className="p-8 text-center bg-white rounded-lg">
            <h3 className="text-xl font-bold text-gray-700">User Management</h3>
            <p className="text-gray-500">Coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
