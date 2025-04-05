import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Heart } from 'lucide-react';
import { Salad } from '../types';

interface SaladCardProps {
  salad: Salad;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onAddToCart: () => void;
}

const SaladCard: React.FC<SaladCardProps> = ({ 
  salad, 
  isFavorite, 
  onToggleFavorite, 
  onAddToCart 
}) => {
  const [showNutrition, setShowNutrition] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="overflow-hidden bg-white shadow-lg rounded-xl"
    >
      <div className="relative h-48 bg-emerald-100">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-emerald-600/30" />
        <button
          onClick={() => onToggleFavorite(Number(salad.id))}
          className="absolute z-10 p-2 rounded-full shadow-md top-2 right-2 bg-white/80 backdrop-blur-sm"
        >
          <Heart className={`w-5 h-5 ${
            isFavorite
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-400'
          }`} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-gray-800">{salad.name}</h3>
          <span className="font-bold text-teal-600">${salad.price}</span>
        </div>
        
        <p className="mt-2 text-sm text-gray-600">{salad.description}</p>
        
        <div className="flex items-center mt-3 text-sm text-gray-500">
          <span className="px-2 py-1 text-xs text-teal-800 bg-teal-100 rounded-full">
            {salad.calories} cal
          </span>
          <div className="w-px h-4 mx-2 bg-gray-300"></div>
          <div className="flex space-x-1">
            {salad.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setShowNutrition(!showNutrition)}
            className="flex items-center text-xs text-teal-600 hover:text-teal-800"
          >
            {showNutrition ? 'Hide details' : 'Show details'}
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${
              showNutrition ? 'rotate-90' : ''
            }`} />
          </button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddToCart}
            className="px-3 py-2 text-sm font-medium text-white rounded-lg shadow-md bg-gradient-to-r from-teal-500 to-emerald-500 hover:shadow-lg"
          >
            Add to Cart
          </motion.button>
        </div>
        
        <AnimatePresence>
          {showNutrition && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 mt-4 overflow-hidden border-t border-gray-200"
            >
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 text-center rounded-lg bg-gray-50">
                  <div className="text-xs text-gray-500">Protein</div>
                  <div className="font-bold text-gray-700">{salad.nutritionFacts.protein}g</div>
                </div>
                <div className="p-2 text-center rounded-lg bg-gray-50">
                  <div className="text-xs text-gray-500">Carbs</div>
                  <div className="font-bold text-gray-700">{salad.nutritionFacts.carbs}g</div>
                </div>
                <div className="p-2 text-center rounded-lg bg-gray-50">
                  <div className="text-xs text-gray-500">Fats</div>
                  <div className="font-bold text-gray-700">{salad.nutritionFacts.fats}g</div>
                </div>
              </div>
              
              <h4 className="mb-2 text-xs font-medium text-gray-700">Ingredients:</h4>
              <div className="flex flex-wrap gap-1">
                {salad.ingredients.map((ingredient) => (
                  <span 
                    key={typeof ingredient === 'string' ? ingredient : ingredient.id} 
                    className="px-2 py-1 text-xs text-teal-700 rounded-full bg-teal-50"
                  >
                    {typeof ingredient === 'string' ? ingredient : ingredient.id}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SaladCard;
