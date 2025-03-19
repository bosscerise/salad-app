import { useState, useEffect } from 'react';
import { testimonials } from '../../data/testimonials';
import TestimonialCard from './TestimonialCard';
import { useTheme } from '../../hooks/useTheme';

export default function Testimonials() {
  const { isDarkMode } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Listen for window resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // For small screens, cycle through testimonials automatically
  useEffect(() => {
    if (isSmallScreen) {
      const interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isSmallScreen]);

  return (
    <section 
      id="testimonials" 
      className={`relative py-24 px-6 overflow-hidden ${
        isDarkMode 
          ? 'bg-gray-900 text-white' 
          : 'bg-gradient-to-b from-white to-green-50 text-gray-900'
      }`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Quote marks */}
        <svg 
          className={`absolute -top-10 -left-10 w-40 h-40 ${
            isDarkMode ? 'text-red-900/10' : 'text-green-600/10'
          }`} 
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
        </svg>
        <svg 
          className={`absolute -bottom-10 -right-10 w-40 h-40 transform rotate-180 ${
            isDarkMode ? 'text-red-900/10' : 'text-green-600/10'
          }`} 
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
        </svg>

        {/* Decorative circles */}
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl ${
          isDarkMode ? 'bg-red-900/10' : 'bg-green-600/10'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl ${
          isDarkMode ? 'bg-red-800/10' : 'bg-green-700/10'
        }`}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
            isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-green-100 text-green-700'
          }`}>
            Customer Stories
          </span>
          <h2 className={`mt-4 text-4xl md:text-5xl font-bold tracking-tight ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <span className={isDarkMode ? 'text-red-400' : 'text-green-600'}>Real People,</span> Real Results
          </h2>
          <p className={`mt-4 text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            See how our fresh, nutrient-dense salads are changing lives and habits every day.
          </p>
        </div>

        {/* Mobile view - Single card with pagination */}
        <div className="md:hidden">
          <div className="relative pb-10">
            <TestimonialCard 
              testimonial={testimonials[activeIndex]} 
              isDarkMode={isDarkMode} 
              isActive={true}
            />

            {/* Pagination dots */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === activeIndex 
                      ? isDarkMode 
                        ? 'bg-red-500 scale-125' 
                        : 'bg-green-600 scale-125' 
                      : isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop view - Grid of cards */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard 
              key={testimonial.name} 
              testimonial={testimonial} 
              isDarkMode={isDarkMode}
              isActive={idx === activeIndex}
            />
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-10 border-t border-opacity-10 border-current">
          <div className="text-center mb-6">
            <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Trusted by health-conscious individuals nationwide
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm mt-1">Satisfaction rate</div>
            </div>
            <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-sm mt-1">Happy customers</div>
            </div>
            <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              <div className="text-3xl font-bold">4.9</div>
              <div className="text-sm mt-1">Average rating</div>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-10 text-center">
            <a 
              href="/menu" 
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30' 
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20'
              }`}
            >
              Start Your Healthy Journey
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
