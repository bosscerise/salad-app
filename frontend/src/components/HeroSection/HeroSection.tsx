import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import haba from '../../assets/images/haba.jpg';

interface HeroSectionProps {
  showConfetti?: boolean;
}

export default function HeroSection({ showConfetti = false }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { isDarkMode } = useTheme();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const confettiColors = [
    isDarkMode ? '#ef4444' : '#16a34a', // Red or Green
    isDarkMode ? '#f87171' : '#22c55e', // Lighter Red or Green
    '#ffffff', // White
    isDarkMode ? '#fca5a5' : '#4ade80', // Even Lighter Red or Green
    isDarkMode ? '#7f1d1d' : '#14532d', // Dark Red or Green
  ];

  return (
    <section className={`pt-32 pb-16 px-6 relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-white to-green-50'}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className={`absolute top-0 left-0 w-full h-full ${isDarkMode ? 'bg-red-600' : 'bg-green-600'} rotate-45 scale-150`} style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
      </div>
      
      {showConfetti && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {Array.from({ length: 60 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{
                y: ['0vh', '100vh'],
                x: `calc(${Math.random() * 100}vw + ${Math.random() * 50 - 25}px)`,
                rotate: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1),
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 0.5,
                ease: [0.1, 0.25, 0.3, 1],
                repeat: Infinity,
                repeatDelay: Math.random() * 3
              }}
              className="absolute z-10 origin-center"
              style={{
                top: '-5%',
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                background: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                boxShadow: isDarkMode ? '0 0 4px rgba(255,255,255,0.2)' : '0 0 4px rgba(0,0,0,0.1)'
              }}
            />
          ))}
        </div>
      )}
      
      <div className="relative z-20 mx-auto max-w-7xl">
        <div className="grid items-center gap-8 md:grid-cols-5">
          {/* Hero Content */}
          <div className={`md:col-span-3 text-center md:text-left transition-all duration-1000 ${
            isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-12'
          }`}>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
            >
              Healthy Never Tasted
              <span className={`block mt-2 ${isDarkMode ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-green-600 to-green-700'} text-transparent bg-clip-text`}>
                So Good!
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`mt-6 text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto md:mx-0`}
            >
              Delicious, nutritious salads delivered right to your door.
              Made with fresh, locally-sourced ingredients.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col justify-center gap-5 mt-10 sm:flex-row md:justify-start"
            >
              <a
                href="/menu"
                className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-red-900/30 hover:shadow-red-500/40' 
                    : 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-green-900/20 hover:shadow-green-600/30'
                } relative overflow-hidden group`}
              >
                <span className="relative z-10">View Our Menu</span>
                <span className={`absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${
                  isDarkMode ? 'bg-gradient-to-r from-red-700 to-red-600' : 'bg-gradient-to-r from-green-700 to-green-600'
                }`}></span>
              </a>
              
              <a
                href="#pricing"
                className={`px-8 py-4 rounded-full font-bold text-lg transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-inner ${
                  isDarkMode 
                    ? 'bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-950/30' 
                    : 'bg-transparent border-2 border-green-600 text-green-700 hover:bg-green-50'
                }`}
              >
                See Plans
              </a>
            </motion.div>
            
            {/* Feature Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap justify-center gap-3 mt-12 md:justify-start"
            >
              {['Fresh Daily', 'Local Ingredients', 'Chef Crafted'].map((feature) => (
                <div 
                  key={feature}
                  className={`py-1.5 px-4 rounded-full text-sm font-medium flex items-center gap-2 ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-200 border border-gray-700' 
                      : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  <svg className={`w-4 h-4 ${isDarkMode ? 'text-red-500' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative md:col-span-2"
          >
            <div className={`absolute -inset-2 rounded-3xl -z-10 blur-lg opacity-40 ${isDarkMode ? 'bg-red-900' : 'bg-green-600'}`}></div>
            
            <div className="relative overflow-hidden shadow-2xl rounded-3xl group">
              <img
                src={haba}
                alt="Fresh gourmet salad with mixed greens and seasonal ingredients"
                className="object-cover w-full h-auto transition-all duration-700 transform group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t opacity-60 ${
                isDarkMode ? 'from-gray-900' : 'from-green-900/40'
              }`}></div>
              
              {/* Floating badge */}
              <div className={`absolute -bottom-6 -right-6 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-xl shadow-lg p-4 md:p-5 max-w-xs transform rotate-3 transition-transform duration-300 group-hover:rotate-0`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    isDarkMode ? 'bg-red-900/50' : 'bg-green-100'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      isDarkMode ? 'text-red-500' : 'text-green-600'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>100% Fresh Ingredients</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
