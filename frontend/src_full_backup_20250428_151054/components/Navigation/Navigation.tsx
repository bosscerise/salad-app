import { useState } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';
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
      <header className="absolute top-0 left-0 right-0 z-40 shadow-sm bg-white/90 backdrop-blur-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-emerald-700">Salad Shack</a>
            </div>
            <nav className="items-center hidden space-x-8 md:flex">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="font-medium text-gray-700 transition-colors hover:text-emerald-600"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <button 
                className="relative p-2 transition-colors rounded-full bg-emerald-100 hover:bg-emerald-200"
              >
                <ShoppingCartIcon className="w-6 h-6 text-emerald-700" />
                {cartCount > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white rounded-full -top-1 -right-1 bg-emerald-600">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                className="p-2 transition-colors rounded-full md:hidden bg-emerald-100 hover:bg-emerald-200"
                onClick={() => setMobileMenuOpen(true)}
              >
                <svg className="w-6 h-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <a
                href="/menu"
                className="hidden px-4 py-2 font-medium text-white transition-colors rounded-full md:inline-block bg-emerald-600 hover:bg-emerald-700"
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
