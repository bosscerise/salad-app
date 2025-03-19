import { useState } from 'react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import MobileMenu from './MobileMenu';

interface NavigationProps {
  navigation: { name: string; href: string }[];
  cartCount: number;
}

export default function Navigation({ navigation, cartCount }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Navigation Menu */}
      <MobileMenu 
        navigation={navigation} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      {/* Desktop Navigation */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-emerald-700">Salad Shack</a>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <button 
                className="relative p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors"
              >
                <ShoppingCartIcon className="w-6 h-6 text-emerald-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-emerald-600 text-white text-xs rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                className="md:hidden p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <svg className="w-6 h-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <a
                href="/menu"
                className="hidden md:inline-block px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors font-medium"
              >
                Order Now
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
