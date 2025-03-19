import { useState, useEffect, useMemo } from 'react';
import { featuredSalads } from '../../data/featuredSalads';
import SaladCard from './SaladCard';
import { useTheme } from '../../hooks/useTheme';

interface FeaturedSaladsProps {
  addToCart: (id: number) => void;
}

export default function FeaturedSalads({ addToCart }: FeaturedSaladsProps) {
  const { isDarkMode } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile once on mount and on resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Create food icons only once using useMemo
  const backgroundIcons = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      size: Math.random() * 20 + 20,
      emoji: ['🥗', '🥑', '🍅', '🥬'][i % 4]
    }));
  }, []);

  return (
    <section className={`py-20 sm:py-24 px-4 sm:px-6 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-white via-white to-green-50'
    }`}>
      {/* Simplified decorative background */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static gradient circles instead of animated ones */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl ${
          isDarkMode ? 'bg-red-900/10' : 'bg-green-600/5'
        }`}></div>
        <div className={`absolute top-1/3 -left-24 w-80 h-80 rounded-full blur-3xl ${
          isDarkMode ? 'bg-red-800/10' : 'bg-green-500/5'
        }`}></div>
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(${isDarkMode ? '#ffffff22' : '#00000011'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
        
        {/* Static food emojis instead of animated ones */}
        {backgroundIcons.map((icon, index) => (
          <div
            key={index}
            className="absolute opacity-[0.07]"
            style={{
              top: icon.top,
              left: icon.left,
              fontSize: `${icon.size}px`,
              transform: `rotate(${index * 45}deg)`
            }}
          >
            {icon.emoji}
          </div>
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto relative">
        {/* Section header - static with minimal animation */}
        <div className="text-center max-w-2xl mx-auto animate-fadeIn">
          {/* Badge */}
          <div className="flex justify-center">
            <span className={`px-5 py-1.5 rounded-full text-sm font-medium ${
              isDarkMode 
                ? 'bg-red-900/40 text-red-400 border border-red-800/30' 
                : 'bg-green-100 text-green-700 border border-green-200/50'
            }`}>
              Featured Selection
            </span>
          </div>
          
          {/* Title with simplified styling */}
          <h2 className={`mt-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <span className={`${
              isDarkMode 
                ? 'text-red-400' 
                : 'text-green-600'
            }`}>
              Fresh
            </span>
            <span> Daily Favorites</span>
          </h2>
          
          {/* Description */}
          <p className={`mt-6 text-base sm:text-lg leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Vibrant, nutrient-packed creations made with locally-sourced ingredients. 
            A different salad every day keeps the doctor away!
          </p>
        </div>
        
        {/* Simplified salad cards grid */}
        <div className="mt-14 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featuredSalads.map((salad, index) => (
            <div 
              key={salad.id} 
              onMouseEnter={() => !isMobile && setHoveredIndex(index)}
              onMouseLeave={() => !isMobile && setHoveredIndex(null)}
              onClick={() => isMobile && setHoveredIndex(index === hoveredIndex ? null : index)}
              className="h-full animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <SaladCard 
                salad={salad} 
                addToCart={addToCart} 
                isHovered={hoveredIndex === index}
                isDarkMode={isDarkMode}
              />
            </div>
          ))}
        </div>
        
        {/* Simplified call-to-action button */}
        <div className="mt-16 text-center">
          <a
            href="/menu"
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'bg-red-900/40 text-red-400 hover:bg-red-800/40 hover:shadow-lg hover:shadow-red-900/20' 
                : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-lg hover:shadow-green-200/50'
            }`}
          >
            <span>Explore Our Full Menu</span>
            <svg 
              className={`w-5 h-5 ${
                isDarkMode ? 'text-red-400' : 'text-green-600'
              }`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}