import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface OrderSummaryDialogProps {
  selectedIngredients: Record<string, number>;
  allIngredients: {
    id: string;
    name: string;
    emoji?: string;
    price: number;
  }[];
  totals: {
    price: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  quantity: number;
  isSubmitting: boolean;
  onAddToCart: () => void;
  onClose: () => void;
}

// Memoize summary items to prevent unnecessary re-renders
const SummaryItem = memo(({ count, ingredient }: { 
  count: number; 
  ingredient: { name: string; emoji?: string; price: number; } 
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <span className="mr-2">{ingredient.emoji || '🥗'}</span>
      <span>{ingredient.name}</span>
    </div>
    <div className="flex items-center">
      <span className="mr-4 text-sm text-gray-600">×{count}</span>
      <span>${(ingredient.price * count).toFixed(2)}</span>
    </div>
  </div>
));

SummaryItem.displayName = 'SummaryItem';

const OrderSummaryDialog: React.FC<OrderSummaryDialogProps> = ({
  selectedIngredients,
  allIngredients,
  totals,
  quantity,
  isSubmitting,
  onAddToCart,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md p-6 bg-white rounded-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute p-1 text-gray-400 top-4 right-4 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        
        <h3 className="mb-4 text-xl font-bold dark:text-white">Order Summary</h3>
        
        <div className="mb-4 space-y-2">
          {Object.entries(selectedIngredients).map(([id, count]) => {
            const ingredient = allIngredients.find(i => i.id === id);
            if (!ingredient) return null;
            
            return <SummaryItem key={id} count={count} ingredient={ingredient} />;
          })}
        </div>
        
        <div className="py-3 mb-4 border-t border-b">
          <div className="flex justify-between mb-2">
            <span>Total Calories:</span>
            <span className="font-medium">{totals.calories}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Protein:</span>
            <span className="font-medium">{totals.protein}g</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Carbs:</span>
            <span className="font-medium">{totals.carbs}g</span>
          </div>
          <div className="flex justify-between">
            <span>Fats:</span>
            <span className="font-medium">{totals.fats}g</span>
          </div>
        </div>
        
        <div className="flex justify-between mb-6 text-lg font-bold">
          <span>Total Price:</span>
          <span>${(totals.price * quantity).toFixed(2)}</span>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Edit Salad
          </button>
          <button
            onClick={onAddToCart}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSummaryDialog;
