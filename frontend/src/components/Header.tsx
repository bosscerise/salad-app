"use client"

import { useState, useEffect } from 'react'
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/solid'
import { ShoppingBag, User, LogIn, LogOut, Moon, Sun, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useCart } from '../contexts/CartContext'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Menu', href: '/menu' },
  { name: 'About', href: '#about' },
  { name: 'Rewards', href: '/rewards' },
  { name: 'Contact', href: '#contact' },
]

interface HeaderProps {
  scrolled?: boolean;
  cartItems?: number;
}

export default function Header({ 
  scrolled = false,
  cartItems = 0
  }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(scrolled)

  // Get auth context
  const { isAuthenticated, user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const { itemCount } = useCart() // Access cart count from context
  const userName = user?.name || 'User'

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    if (userMenuOpen) {
      const closeMenu = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          setUserMenuOpen(false)
        }
      }
      document.addEventListener('click', closeMenu)
      return () => document.removeEventListener('click', closeMenu)
    }
  }, [userMenuOpen])

  const handleLogout = async () => {
    try {
      logout();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'} ${isDarkMode ? 'dark' : ''}`}>
      <div className={`absolute inset-0 ${isDarkMode 
        ? 'bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95' 
        : 'bg-gradient-to-r from-amber-50/95 via-emerald-50/95 to-amber-50/95'} backdrop-blur-md shadow-lg transition-all duration-300 ${isScrolled ? 'opacity-95' : 'opacity-85'}`}></div>
      
      <nav className="relative flex items-center justify-between h-full px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        {/* Logo area */}
        <div className="flex lg:flex-1">
          <Link 
            to="/" 
            className="group -m-1.5 p-1.5 flex items-center gap-2"
          >
            <span className={`text-xl sm:text-2xl font-bold ${isDarkMode 
              ? 'bg-gradient-to-r from-red-400 to-green-400'
              : 'bg-gradient-to-r from-red-600 to-green-600'} text-transparent bg-clip-text transform transition-all duration-300 group-hover:scale-105`}>
              Salad Shark
            </span>
            <span className="text-xl transition-all duration-300 transform sm:text-2xl group-hover:rotate-12">🥗</span>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            onClick={toggleTheme}
            className={`p-2 mr-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700/50' : 'text-green-800 hover:bg-red-100'} rounded-lg transition-all duration-300`}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {/* Add mobile cart button with count */}
          <Link to="/cart" className="relative p-2 mr-2 transition-all duration-300 rounded-lg">
            <ShoppingCart className={`w-5 h-5 ${isDarkMode ? 'text-gray-200' : 'text-green-800'}`} />
            {itemCount > 0 && (
              <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-green-600 rounded-full -top-1 -right-1">
                {itemCount}
              </span>
            )}
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`p-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700/50' : 'text-green-800 hover:bg-red-100'} rounded-lg transition-all duration-300`}
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">

          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`relative text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-green-800 hover:text-red-700'} transition-colors duration-300 py-2`}
            >
              {item.name}
              <span className={`absolute bottom-0 left-0 w-full h-0.5 ${isDarkMode ? 'bg-red-500' : 'bg-green-600'} transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100`} />
            </Link>
          ))}
        </div>
        
        {/* Right side: Cart, Theme toggle, Auth */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:space-x-4">
          {/* Theme toggle button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`p-2 rounded-full ${isDarkMode 
              ? 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50' 
              : 'bg-gradient-to-r from-green-100 to-red-100 hover:from-green-200 hover:to-red-200'} transition-colors`}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </motion.button>

          {/* Cart button with count badge */}
          <Link to="/cart" className="relative group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full ${isDarkMode 
                ? 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50' 
                : 'bg-gradient-to-r from-green-100 to-red-100 hover:from-green-200 hover:to-red-200'}`}
            >
              <ShoppingCart className={`w-5 h-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} />
            </motion.div>
            {itemCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-600 rounded-full -top-1 -right-1 group-hover:bg-green-700"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </motion.span>
            )}
          </Link>

          {/* User menu */}
          {isAuthenticated ? (
            <div className="relative user-menu-container">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen(!userMenuOpen);
                }}
                className={`flex items-center space-x-2 py-1 px-3 rounded-full ${isDarkMode 
                  ? 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50' 
                  : 'bg-gradient-to-r from-green-100 to-red-100 hover:from-green-200 hover:to-red-200'} transition-colors`}
              >
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {userName}
                </span>
                <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} />
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-48 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl z-20`}
                  >
                    <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{userName}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                    </div>
                    <Link to="/profile" className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center`}>
                      <User className="w-4 h-4 mr-2" /> My Profile
                    </Link>
                    <Link to="/orders" className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center`}>
                      <ShoppingBag className="w-4 h-4 mr-2" /> My Orders
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'} flex items-center`}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/auth"
              className={`relative px-6 py-2.5 rounded-full ${isDarkMode 
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white' 
                : 'bg-gradient-to-r from-emerald-600 to-lime-600 text-white'} font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg ${isDarkMode 
                  ? 'hover:shadow-emerald-500/20' 
                  : 'hover:shadow-emerald-600/20'} hover:-translate-y-0.5 flex items-center`}
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span className="relative z-10">Sign In</span>
              <div className={`absolute inset-0 ${isDarkMode 
                ? 'bg-gradient-to-r from-red-600 to-red-700' 
                : 'bg-gradient-to-r from-green-700 to-green-800'} transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100`} />
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="fixed inset-0 bg-black/80" onClick={() => setMobileMenuOpen(false)} />
        <div className={`fixed inset-y-0 right-0 w-full sm:max-w-sm ${isDarkMode ? 'bg-gray-900' : 'bg-white'} p-6 transform transition-transform duration-300 ease-in-out`} 
              style={{ transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)' }}>
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Salad Shark</span>
            <div className="flex space-x-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${isDarkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                className={`p-2 rounded-full ${isDarkMode 
                  ? 'bg-red-600 text-white hover:bg-red-500' 
                  : 'bg-green-600 text-white hover:bg-green-500'} transition-colors`}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* User info in mobile menu */}
          {isAuthenticated && (
            <div className={`mt-6 py-3 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'} flex items-center justify-center`}>
                  <User className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>{userName}</p>
                  <button 
                    onClick={handleLogout}
                    className={`text-sm ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} flex items-center`}
                  >
                    <LogOut className="w-3 h-3 mr-1" /> Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Cart info in mobile menu - update to use itemCount */}
          <div className={`mt-4 flex items-center justify-between py-3 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg`}>
            <div className="flex items-center space-x-2">
              <ShoppingBag className={`w-5 h-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} />
              <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''}` : 'Cart empty'}
              </span>
            </div>
            {itemCount > 0 && (
              <Link 
                to="/cart" 
                className={`text-xs py-1 px-3 ${isDarkMode ? 'bg-red-500 text-white' : 'bg-green-600 text-white'} rounded-full font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                View
              </Link>
            )}
          </div>
          
          <nav className="mt-8 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block py-2 px-4 rounded-lg ${isDarkMode ? 
                  'hover:bg-gray-800 text-gray-300' : 
                  'hover:bg-gray-100 text-gray-800'} transition-colors`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                to="/auth"
                className={`block mt-6 text-center py-3 px-4 rounded-full ${isDarkMode 
                  ? 'bg-red-600 text-white hover:bg-red-500' 
                  : 'bg-green-600 text-white hover:bg-green-500'} font-semibold transition-colors`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
