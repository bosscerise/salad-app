import React, { useState } from 'react';
import { Plus, Minus, Leaf, Zap } from 'lucide-react';
import { Ingredient } from '../types';
import { useTheme } from '../../../hooks/useTheme';

interface IngredientItemProps {
  ingredient: Ingredient;
  count: number;
  onAddIngredient: (id: string) => void;
  onRemoveIngredient: (id: string) => void;
}

const IngredientItem: React.FC<IngredientItemProps> = ({
  ingredient,
  count,
  onAddIngredient,
  onRemoveIngredient
}) => {
  const { isDarkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleTap = () => {
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 300);
  };
  
  // Select icon based on ingredient category
  const renderCategoryIcon = (category: string) => {
    switch(category) {
      case 'protein':
        return (
          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
            isDarkMode ? 'bg-amber-900/30 text-amber-500' : 'bg-amber-100 text-amber-600'
          }`}>
            <Zap className="w-3.5 h-3.5" />
          </div>
        );
      case 'base':
        return (
          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
            isDarkMode ? 'bg-emerald-900/30 text-emerald-500' : 'bg-emerald-100 text-emerald-600'
          }`}>
            <Leaf className="w-3.5 h-3.5" />
          </div>
        );
      case 'toppings':
        return (
          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
            isDarkMode ? 'bg-indigo-900/30 text-indigo-500' : 'bg-indigo-100 text-indigo-600'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      case 'dressing':
        return (
          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
            isDarkMode ? 'bg-rose-900/30 text-rose-500' : 'bg-rose-100 text-rose-600'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
            isDarkMode ? 'bg-purple-900/30 text-purple-500' : 'bg-purple-100 text-purple-600'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
    }
  };

  // Safely get nutrition values with fallbacks
  const safePrice = ingredient?.price ?? 0;
  const safeCalories = ingredient?.calories ?? 0;
  const safeProtein = ingredient?.protein ?? 0;
  const safeCarbs = ingredient?.carbs ?? 0;
  const safeFats = ingredient?.fats ?? 0;

  return (
    <div 
      className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 hover:bg-gray-750' 
          : 'bg-white hover:bg-gray-50'
      } ${
        count > 0 
          ? isDarkMode 
            ? 'ring-2 ring-green-500/50' 
            : 'ring-2 ring-green-500/30' 
          : ''
      } ${
        isTapped ? 'scale-[0.98]' : isHovered ? 'scale-[1.01]' : ''
      } shadow-sm`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTap}
    >
      {/* Selected badge */}
      {count > 0 && (
        <div className={`absolute top-0 right-0 w-0 h-0 
          border-t-[40px] border-r-[40px] 
          ${isDarkMode ? 'border-t-green-600' : 'border-t-green-500'} 
          border-r-transparent`}>
        </div>
      )}
      
      <div className="flex items-center p-4">
        {/* Left: Image placeholder + category icon */}
        <div className="relative flex-shrink-0 mr-4">
          <div className={`w-16 h-16 rounded-lg bg-cover bg-center shadow-sm overflow-hidden ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`} style={{
            backgroundImage: !imageError ? `url(/ingredients/${ingredient?.id}.jpg)` : 'none',
            backgroundSize: 'cover',
          }}>
            {/* Fallback if image doesn't exist */}
            <div 
              className={`absolute inset-0 flex items-center justify-center ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}
              style={{ opacity: imageError ? 1 : 0 }}
              onError={() => setImageError(true)}
            >
              {renderCategoryIcon(ingredient?.category || '')}
            </div>
            
            {/* Invisible image to detect loading errors */}
            <img 
              src={`/ingredients/${ingredient?.id}.jpg`}
              alt=""
              className="hidden"
              onError={() => setImageError(true)}
            />
          </div>
          
          {/* Category badge */}
          <div className="absolute -bottom-1 -left-1">
            {renderCategoryIcon(ingredient?.category || '')}
          </div>
        </div>
        
        {/* Middle: Name and details */}
        <div className="flex-1">
          <div className={`font-medium text-base ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>{ingredient?.name || 'Ingredient'}</div>
          
          {/* Nutrition info */}
          <div className={`flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="flex items-center">
              <span className="font-semibold">${safePrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center">
              <span>{safeCalories} cal</span>
            </div>
            
            {safeProtein > 0 && (
              <div className={`px-1.5 py-0.5 rounded-sm text-xs ${
                isDarkMode ? 'bg-gray-700 text-amber-400' : 'bg-amber-50 text-amber-700'
              }`}>
                {safeProtein}g protein
              </div>
            )}
          </div>
        </div>
        
        {/* Right: Controls */}
        <div className="flex items-center">
          <div className={`flex items-center ${count === 0 ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveIngredient(ingredient?.id || '');
              }}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              disabled={count === 0}
              aria-label="Remove ingredient"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <span className={`mx-2 font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>{count}</span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddIngredient(ingredient?.id || '');
            }}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
              count === 0 
                ? isDarkMode
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-600/20' 
                : isDarkMode
                  ? 'bg-green-700 hover:bg-green-600 text-white'
                  : 'bg-green-100 hover:bg-green-200 text-green-700'
            } ${
              isHovered && count === 0 ? 'scale-110' : ''
            }`}
            aria-label="Add ingredient"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Nutrient bar */}
      {(safeCarbs > 0 || safeProtein > 0 || safeFats > 0) && (
        <div className="flex h-1.5 w-full overflow-hidden">
          <div 
            className="bg-amber-500" 
            style={{ width: `${safeProtein > 0 ? (safeProtein / (safeProtein + safeCarbs + safeFats)) * 100 : 0}%` }}
          />
          <div 
            className="bg-blue-500" 
            style={{ width: `${safeCarbs > 0 ? (safeCarbs / (safeProtein + safeCarbs + safeFats)) * 100 : 0}%` }}
          />
          <div 
            className="bg-red-500" 
            style={{ width: `${safeFats > 0 ? (safeFats / (safeProtein + safeCarbs + safeFats)) * 100 : 0}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Use React.memo for performance optimization
export default React.memo(IngredientItem);
