import { useState } from 'react';

interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
  rating?: number;
  date?: string;
  mealChoice?: string;
  result?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  isDarkMode?: boolean;
  isActive?: boolean;
}

export default function TestimonialCard({ testimonial, isDarkMode = false, isActive = false }: TestimonialCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-6 md:p-8 rounded-2xl transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gray-800 hover:bg-gray-800/80 shadow-lg shadow-red-900/5 hover:shadow-red-900/10' 
          : 'bg-white hover:bg-white shadow-lg shadow-green-900/5 hover:shadow-green-900/10'
      } ${isActive || isHovered ? 'scale-[1.02] md:scale-[1.01]' : ''}`}
    >
      {/* Rating stars */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-5 h-5 ${
              i < (testimonial.rating || 5)
                ? isDarkMode ? 'text-red-500' : 'text-green-500'
                : isDarkMode ? 'text-gray-700' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        {testimonial.date && (
          <span className={`text-xs ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {testimonial.date}
          </span>
        )}
      </div>
      
      {/* Testimonial quote */}
      <div className="relative">
        <svg 
          className={`absolute top-0 left-0 w-8 h-8 transform -translate-x-4 -translate-y-4 ${
            isDarkMode ? 'text-red-900/20' : 'text-green-600/20'
          }`} 
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className={`text-lg relative z-10 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          "{testimonial.quote}"
        </p>
      </div>
      
      {/* Meal choice tag */}
      {testimonial.mealChoice && (
        <div className="mt-5">
          <span className={`inline-block px-3 py-1 text-xs rounded-full ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-green-100 text-green-700'
          }`}>
            Favorite: {testimonial.mealChoice}
          </span>
        </div>
      )}
      
      {/* Result highlight */}
      {testimonial.result && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          isDarkMode 
            ? 'bg-gray-700/50 text-gray-300' 
            : 'bg-green-50 text-gray-700'
        }`}>
          <span className={`font-medium ${isDarkMode ? 'text-red-400' : 'text-green-600'}`}>
            Result:
          </span> {testimonial.result}
        </div>
      )}
      
      {/* Customer info */}
      <div className="mt-6 flex items-center gap-4">
        {testimonial.image ? (
          <img 
            src={testimonial.image} 
            alt={testimonial.name} 
            className="w-14 h-14 rounded-full object-cover border-2 border-opacity-10 border-current"
            loading="lazy"
          />
        ) : (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            isDarkMode 
              ? 'bg-gray-700 text-red-400' 
              : 'bg-green-100 text-green-700'
          }`}>
            <span className="text-lg font-semibold">{getInitials(testimonial.name)}</span>
          </div>
        )}
        <div>
          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {testimonial.name}
          </p>
          <p className={`text-sm ${
            isDarkMode ? 'text-red-400' : 'text-green-600'
          }`}>
            {testimonial.role}
          </p>
        </div>
      </div>
      
      {/* Verification badge */}
      <div className="mt-4 flex items-center gap-1.5">
        <svg 
          className={`w-4 h-4 ${isDarkMode ? 'text-red-500' : 'text-green-600'}`}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Verified Customer
        </span>
      </div>
    </div>
  );
}
