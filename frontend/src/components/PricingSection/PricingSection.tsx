import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { pricingPlans } from '../../data/pricingPlans';
import PricingCard from './PricingCard';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export default function PricingSection() {
  const { isDarkMode } = useTheme();
  const [isAnnual, setIsAnnual] = useState(true);
  const [activePlan, setActivePlan] = useState(1); // Default to middle plan (usually the popular one)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Track window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Is mobile view?
  const isMobile = windowWidth < 768;

  // Navigation for mobile carousel
  const scrollToCard = (index: number) => {
    if (carouselRef.current && isMobile) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const cardWidth = scrollWidth / pricingPlans.length;
      carouselRef.current.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      });
    }
    setActivePlan(index);
  };

  // Handle carousel scroll events to update active card
  const handleScroll = () => {
    if (carouselRef.current && isMobile) {
      const scrollPosition = carouselRef.current.scrollLeft;
      const scrollWidth = carouselRef.current.scrollWidth;
      const cardWidth = scrollWidth / pricingPlans.length;
      
      const activeIndex = Math.round(scrollPosition / cardWidth);
      if (activeIndex !== activePlan) {
        setActivePlan(activeIndex);
      }
    }
  };

  // Comparison table data - simplified version of features
  const comparisonFeatures = [
    "Weekly Meal Delivery",
    "Fresh Ingredients",
    "Nutrition Information",
    "Customizable Ingredients",
    "Priority Delivery"
  ];

  return (
    <section 
      id="pricing" 
      className={`py-12 md:py-20 px-4 md:px-6 relative overflow-hidden ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-green-50 to-green-100'
      }`}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Salad ingredients floating */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute text-2xl animate-float-slow`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.8}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            >
              {['🥗', '🥬', '🥑', '🥕', '🍅', '🥒'][i % 6]}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center md:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center mb-2"
          >
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-green-100 text-green-700'
            }`}>
              Choose Your Plan
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-3xl md:text-4xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            Healthy Eating <span className={isDarkMode ? 'text-red-400' : 'text-green-600'}>Made Simple</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`mt-3 mx-auto max-w-2xl text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Fresh, delicious salads delivered to your door. No shopping, no chopping, no waste.
          </motion.p>
          
          {/* Billing toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-3 mt-6"
          >
            <span className={`text-sm ${!isAnnual ? 'font-medium' : ''} ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Monthly
            </span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                isAnnual 
                  ? (isDarkMode ? 'bg-red-600' : 'bg-green-600') 
                  : (isDarkMode ? 'bg-gray-700' : 'bg-gray-300')
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm ${isAnnual ? 'font-medium' : ''} ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Annual <span className={`ml-1 px-1.5 py-0.5 text-xs rounded ${
                isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-green-100 text-green-700'
              }`}>Save 20%</span>
            </span>
          </motion.div>
        </div>

        {/* Mobile indicator dots */}
        {isMobile && (
          <div className="flex justify-center gap-2 mb-4">
            {pricingPlans.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToCard(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activePlan === idx
                    ? isDarkMode ? 'bg-red-500 w-4' : 'bg-green-500 w-4'
                    : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                aria-label={`View ${pricingPlans[idx].name} plan`}
              />
            ))}
          </div>
        )}

        {/* Mobile carousel navigation buttons */}
        {isMobile && (
          <div className="absolute left-0 right-0 z-20 flex justify-between px-2 top-1/2">
            <button
              onClick={() => scrollToCard(Math.max(0, activePlan - 1))}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md ${
                activePlan === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={activePlan === 0}
            >
              <ChevronLeft className={isDarkMode ? 'text-white' : 'text-gray-800'} size={16} />
            </button>
            <button
              onClick={() => scrollToCard(Math.min(pricingPlans.length - 1, activePlan + 1))}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md ${
                activePlan === pricingPlans.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={activePlan === pricingPlans.length - 1}
            >
              <ChevronRight className={isDarkMode ? 'text-white' : 'text-gray-800'} size={16} />
            </button>
          </div>
        )}

        {/* Pricing cards - mobile carousel or desktop grid */}
        <div 
          ref={carouselRef}
          onScroll={handleScroll}
          className={`
            ${isMobile ? 'flex overflow-x-auto snap-x snap-mandatory hide-scrollbar' : 'grid md:grid-cols-3 gap-6'} 
            mt-4 md:mt-8
          `}
        >
          {pricingPlans.map((plan, idx) => (
            <div 
              key={plan.name}
              className={`
                ${isMobile ? 'min-w-full snap-center px-4' : ''}
              `}
            >
              <PricingCard 
                plan={{...plan, icon: ['basic', 'premium', 'family'][idx] as 'basic' | 'premium' | 'family'}}
                isAnnual={isAnnual} 
                isDarkMode={isDarkMode}
                isActive={idx === activePlan}
                onClick={() => setActivePlan(idx)}
              />
            </div>
          ))}
        </div>

        {/* Desktop feature comparison table - hidden on mobile to reduce scrolling */}
        {!isMobile && (
          <div className={`mt-12 p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/90'} shadow-lg backdrop-blur-sm`}>
            <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Plan Comparison
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={`text-left py-2 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Features
                    </th>
                    {pricingPlans.map((plan) => (
                      <th 
                        key={plan.name} 
                        className={`text-center py-2 px-4 ${
                          isDarkMode ? 'text-white' : 'text-gray-800'
                        } ${plan.popular ? (isDarkMode ? 'text-red-400' : 'text-green-600') : ''}`}
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, idx) => (
                    <tr key={feature} className={`${idx % 2 === 1 ? (isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50/80') : ''}`}>
                      <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </td>
                      {pricingPlans.map((plan, planIdx) => (
                        <td key={`${plan.name}-${feature}`} className="px-4 py-3 text-center">
                          {planIdx >= Math.floor(idx / 2) ? (
                            <CheckCircle className={`w-5 h-5 mx-auto ${
                              isDarkMode ? 'text-red-500' : 'text-green-500'
                            }`} />
                          ) : (
                            <span className={`block w-5 h-0.5 mx-auto ${
                              isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}></span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Satisfaction guarantee */}
        <div className={`mt-8 text-center p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white/90'
        } backdrop-blur-sm shadow-sm max-w-md mx-auto`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              100% Satisfaction Guaranteed
            </span>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Try risk-free with our 14-day money back guarantee
          </p>
        </div>
      </div>
    </section>
  );
}
