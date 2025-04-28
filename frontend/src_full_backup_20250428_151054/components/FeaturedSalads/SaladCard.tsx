import { useState, memo } from 'react';

interface Salad {
  id: number;
  name: string;
  tagline: string;
  price: number;
  image: string;
  description: string;
  ingredients: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
  badges?: string[];
  allergens?: string[];
  bestWithDressing?: string;
  preparationTime?: string;
}

interface SaladCardProps {
  salad: Salad;
  addToCart: (id: number) => void;
  isHovered?: boolean;
  isDarkMode?: boolean;
}

// Performance optimization: memoize the component to prevent unnecessary re-renders
const SaladCard = memo(function SaladCard({ salad, addToCart, isHovered = false, isDarkMode = false }: SaladCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showMore, setShowMore] = useState(false);
  
  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(salad.id);
    setTimeout(() => setIsAdding(false), 1000);
  };
  
  // Simplified badge style function with fewer conditions
  const getBadgeStyle = (badge: string) => {
    const badgeText = badge.toLowerCase();
    const isNew = badgeText.includes('new');
    const isFavorite = badgeText.includes('bestseller') || badgeText.includes('favorite');
    
    if (isDarkMode) {
      if (isNew) return 'bg-red-500/90 text-white';
      if (isFavorite) return 'bg-amber-600/90 text-white';
      return 'bg-red-900/80 text-white';
    } else {
      if (isNew) return 'bg-green-500/90 text-white';
      if (isFavorite) return 'bg-amber-500/90 text-white';
      return 'bg-green-600/90 text-white';
    }
  };
  
  // Pre-compute tag styles to avoid repeated logic in render
  const getTagStyle = (tag: string) => {
    const tagText = tag.toLowerCase();
    const isVegan = tagText.includes('vegan');
    const isSpicy = tagText.includes('spicy');
    const isGluten = tagText.includes('gluten');
    
    if (isDarkMode) {
      if (isVegan) return 'bg-green-900/30 text-green-400 border border-green-800/30';
      if (isSpicy) return 'bg-red-900/30 text-red-400 border border-red-800/30';
      if (isGluten) return 'bg-blue-900/30 text-blue-400 border border-blue-800/30';
      return 'bg-gray-700 text-gray-300 border border-gray-600/30';
    } else {
      if (isVegan) return 'bg-green-100 text-green-700 border border-green-200';
      if (isSpicy) return 'bg-red-100 text-red-600 border border-red-200';
      if (isGluten) return 'bg-blue-100 text-blue-600 border border-blue-200';
      return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };
  
  return (
    <div 
      className={`relative h-full overflow-hidden rounded-2xl transition-all duration-300 transform ${isHovered ? 'translate-y-[-8px]' : ''} ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border border-gray-700 hover:border-red-800'
          : 'bg-white border border-gray-100 hover:border-green-300'
      } shadow-lg ${
        isHovered 
          ? isDarkMode 
            ? 'shadow-red-900/20' 
            : 'shadow-green-700/15' 
          : ''
      } group`}
    >
      {/* Image container with improved styling */}
      <div className="relative overflow-hidden">
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={salad.image}
            alt={salad.name}
            className="object-cover w-full h-52 transition-transform duration-700 group-hover:scale-110"
            loading="lazy" // Performance: lazy load images
          />
        </div>
        
        {/* Badges - simplified animation */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 max-w-[70%]">
          {salad.badges?.map((badge, idx) => (
            <div 
              key={idx}
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm transition-opacity duration-300 opacity-100 ${getBadgeStyle(badge)}`}
            >
              {badge}
            </div>
          ))}
          {!salad.badges?.length && (
            <div 
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm ${
                isDarkMode 
                  ? 'bg-red-900/80 text-white'
                  : 'bg-green-600/90 text-white'
              }`}
            >
              Fresh Today
            </div>
          )}
        </div>
        
        {/* Price tag - simplified animation */}
        <div className="absolute top-4 right-4">
          <div 
            className={`px-4 py-2 rounded-full font-bold text-lg transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-900/80 text-red-400 backdrop-blur-sm'
                : 'bg-white/80 text-green-700 backdrop-blur-sm'
            } shadow-lg`}
          >
            ${salad.price.toFixed(2)}
          </div>
        </div>
        
        {/* Prep time badge - simplified animation */}
        {salad.preparationTime && (
          <div className="absolute bottom-4 left-4">
            <div 
              className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-sm transition-opacity duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800/90 text-gray-200 backdrop-blur-sm'
                  : 'bg-white/90 text-gray-700 backdrop-blur-sm'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {salad.preparationTime}
            </div>
          </div>
        )}
        
        {/* Color overlay - CSS transition instead of JS animation */}
        <div 
          className={`absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${
            isDarkMode ? 'bg-gradient-to-t from-red-900' : 'bg-gradient-to-t from-green-900'
          }`}
        ></div>
      </div>
      
      {/* Content area with enhanced organization */}
      <div className="p-5">
        {/* Title and tagline */}
        <div className="mb-3">
          <h3 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {salad.name}
          </h3>
          <p className={`text-sm italic mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {salad.tagline}
          </p>
        </div>
        
        {/* Tags - precomputed styles */}
        <div className="flex flex-wrap gap-2 mb-3">
          {salad.tags.slice(0, 3).map((tag, idx) => (
            <span 
              key={idx} 
              className={`inline-block px-2 py-1 text-xs rounded-full ${getTagStyle(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Ingredients preview - simplified animation */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {salad.ingredients.slice(0, showMore ? salad.ingredients.length : 4).map((ingredient, idx) => (
            <span 
              key={idx}
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                  : 'bg-gray-50 text-gray-600 border border-gray-100'
              } ${idx >= 4 && showMore ? 'animate-fadeIn' : ''}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
              {ingredient}
            </span>
          ))}
          {salad.ingredients.length > 4 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700' 
                  : 'bg-gray-50 text-gray-500 hover:text-gray-800 border border-gray-100'
              }`}
            >
              {showMore ? '- Less' : `+ ${salad.ingredients.length - 4} more`}
            </button>
          )}
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <p className={`text-sm ${!showMore ? 'line-clamp-2' : ''} ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {salad.description}
          </p>
        </div>
        
        {/* Nutrition toggle - simplified */}
        <div className="mb-4">
          <button
            onClick={() => setShowNutrition(!showNutrition)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ${
              isDarkMode 
                ? showNutrition 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-800/50' 
                : showNutrition 
                  ? 'bg-gray-100 text-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50'
            } transition-colors`}
          >
            <svg 
              className={`w-3.5 h-3.5 transition-transform duration-300 ${showNutrition ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{showNutrition ? 'Hide nutrition' : 'Nutrition info'}</span>
          </button>
          
          {/* Simplified nutrition info animation */}
          {showNutrition && (
            <div 
              className={`mt-3 grid grid-cols-4 gap-2 p-2 rounded-lg animate-fadeIn ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {salad.nutritionalInfo.calories}
                </div>
                <div className="text-xs text-gray-500">cal</div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {salad.nutritionalInfo.protein}g
                </div>
                <div className="text-xs text-gray-500">protein</div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {salad.nutritionalInfo.carbs}g
                </div>
                <div className="text-xs text-gray-500">carbs</div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {salad.nutritionalInfo.fat}g
                </div>
                <div className="text-xs text-gray-500">fat</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Allergen warnings */}
        {salad.allergens && salad.allergens.length > 0 && (
          <div className={`flex items-center gap-1 mb-4 text-xs ${
            isDarkMode ? 'text-amber-500' : 'text-amber-600'
          }`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Contains: {salad.allergens.join(', ')}</span>
          </div>
        )}
        
        {/* Add to cart button - simpler animation */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full py-3 rounded-lg font-medium relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
            isDarkMode 
              ? isAdding 
                ? 'bg-red-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
              : isAdding 
                ? 'bg-green-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isAdding ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Added!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to Cart
              </>
            )}
          </span>
        </button>
        
        {/* Dressing recommendation */}
        {salad.bestWithDressing && (
          <div className="mt-2 text-center">
            <span className={`text-xs italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Best with {salad.bestWithDressing} dressing
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default SaladCard;