"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, CircleCheck, ChevronLeft, ChevronRight, Loader, X } from 'lucide-react';
import { useIngredients } from '../../../hooks/useIngredients';
import { useCategories } from '../../../hooks/useCategories';
import { useToast } from '../../../hooks/useToast'; // Assuming you have a toast notification system
// import { useNavigate } from 'react-router-dom'; // Assuming you use react-router-dom
import pb from '../../../pb/pocketbase';
import { userSaladApi } from '../../../services/api'; // Assuming you have an API for user salads
import { useCart } from '../../../contexts/CartContext';

// Switch component definition
interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}



const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onCheckedChange,
  className = '',
  disabled = false,
}) => {
  const handleToggle = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`inline-flex h-6 w-11 items-center rounded-full transition-colors 
                ${checked ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'} 
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}`}
      onClick={handleToggle}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  );
};

type Step = 'base' | 'protein' | 'toppings' | 'dressing' | 'extras';
type UserSalad = {
  id: string;
  name: string;
  ingredients: Record<string, number>;
  total_price: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  is_favorite: boolean;
};

export default function SaladBuilder() {
  // Get data from hooks instead of static imports
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [activeStep, setActiveStep] = useState<Step>('base');
  const { ingredients: currentCategoryIngredients, loading: ingredientsLoading, error: ingredientsError } = useIngredients(activeStep);
  const { ingredients: allIngredients, loading: allIngredientsLoading } = useIngredients();

  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast(); // If you have a toast system
  // const navigate = useNavigate(); // For navigation

  const [saladName, setSaladName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSalads, setSavedSalads] = useState<UserSalad[]>([]);
  const { addToCart } = useCart();

  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  useEffect(() => {
    if (pb.authStore.isValid) {
      userSaladApi.getAll().then(setSavedSalads).catch(console.error);
    }
  }, []);

  const steps = useMemo(() => {
    return categories.map(cat => cat.id);
  }, [categories]);

  const currentStepIndex = steps.indexOf(activeStep);

  // Calculate totals from selected ingredients
  const totals = useMemo(() => {
    const result = Object.entries(selectedIngredients).reduce(
      (acc, [id, count]) => {
        const ingredient = allIngredients.find(i => i.id === id);
        if (ingredient && count > 0) {
          acc.price += ingredient.price * count;
          acc.calories += ingredient.calories * count;
          acc.protein += ingredient.protein * count;
          acc.carbs += ingredient.carbs * count;
          acc.fats += ingredient.fats * count;
        }
        return acc;
      },
      { price: 0, calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    
    // Round the values for display
    return {
      price: Number(result.price.toFixed(2)),
      calories: Math.round(result.calories),
      protein: Math.round(result.protein),
      carbs: Math.round(result.carbs),
      fats: Math.round(result.fats)
    };
  }, [selectedIngredients, allIngredients]);

  const handleAddIngredient = (id: string) => {
    setSelectedIngredients(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setLastAdded(id);
    setTimeout(() => setLastAdded(null), 500);
  };

  const handleRemoveIngredient = (id: string) => {
      setSelectedIngredients(prev => {
      const count = (prev[id] || 0) - 1;
      if (count <= 0) {
        // Use object rest destructuring to omit the key without creating a variable
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: count };
    });
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setActiveStep(steps[nextIndex] as Step);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 800);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setActiveStep(steps[prevIndex] as Step);
    }
  };

  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const handleAddToCart = async () => {
    try {
      setIsSubmitting(true);
      
      // Keep the ingredients in the expected Record<string, unknown> format
      // The cart context expects customizations as a key-value object, not an array
      const customizationsObject: Record<string, unknown> = {};
      
      // Convert the selected ingredients into the required format
      Object.entries(selectedIngredients).forEach(([id, quantity]) => {
        customizationsObject[id] = { quantity };
      });
      
      if (pb.authStore.isValid) {
        // Create a saved salad first
        const saladData = {
          user_id: pb.authStore.record?.id || '', // Use record instead of model (deprecated)
          name: saladName || `Salad ${new Date().toLocaleTimeString()}`,
          ingredients: selectedIngredients, // Keep the object format for storage
          total_price: totals.price,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fats: totals.fats,
          is_favorite: false
        };
        
        const savedSalad = await userSaladApi.create(saladData);
        
        // Add to cart as a saved salad with full ingredient info
        await addToCart({
          id: savedSalad.id,
          type: 'saved-salad',
          quantity,
          name: savedSalad.name,
          price: savedSalad.total_price,
          customizations: customizationsObject
        });
      } else {
        // For non-authenticated users, add a custom salad
        await addToCart({
          id: `custom_salad_${Date.now()}`,
          type: 'premade',
          quantity,
          name: `Custom Salad`,
          price: totals.price,
          customizations: customizationsObject
        });
      }
      
      // Clear selections after adding to cart
      setSelectedIngredients({});
      setQuantity(1);
      toast?.success('Added to cart!');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast?.error('Failed to add to cart. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSalad = async () => {
    if (!pb.authStore.isValid) {
      toast?.info('Please log in to save your salad');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Auto-generate name if user didn't provide one
      const name = saladName.trim() || `Salad ${savedSalads.length + 1}`;
      
      const saladData = {
        user_id: pb.authStore.record?.id || '', // Use record instead of model (deprecated)
        name,
        ingredients: selectedIngredients,
        total_price: totals.price,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fats: totals.fats,
        is_favorite: false
      };
      
      const savedSalad = await userSaladApi.create(saladData);
      
      // Update local state
      setSavedSalads(prev => [savedSalad, ...prev]);
      
      // Reset form
      setSaladName('');
      setShowSaveDialog(false);
      
      toast?.success('Salad saved successfully!');
    } catch (error) {
      console.error('Error saving salad:', error);
      toast?.error('Failed to save your salad');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (categoriesLoading || ingredientsLoading || allIngredientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 text-green-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading ingredients...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (categoriesError || ingredientsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-6 text-center rounded-lg bg-red-50">
          <h2 className="text-xl font-bold text-red-700">Something went wrong</h2>
          <p className="mt-2 text-red-600">
            {categoriesError?.message || ingredientsError?.message}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-4 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Animated Rings */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            transition={{ duration: 1.2 }}
          >
            <div className="absolute inset-0 border-4 rounded-full border-green-300/30" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 py-8 mx-auto sm:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-16">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-3 text-3xl font-bold text-transparent sm:mb-4 sm:text-4xl md:text-5xl bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400"
          >
            Build Your Signature Salad
          </motion.h1>
          <p className="text-lg text-gray-600 sm:text-xl dark:text-gray-300">
            Craft your perfect meal with fresh ingredients
          </p>
        </div>

        {/* Enhanced Progress Steps Indicator */}
        <div className="mb-8 sm:mb-12">
          <div className="relative w-full max-w-md mx-auto mb-6">
            {/* Step labels */}
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <button
                    onClick={() => setActiveStep(step as Step)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base transition-all ${
                      index <= currentStepIndex
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <CircleCheck size={16} />
                    ) : (
                      categories.find(c => c.id === step)?.icon
                    )}
                  </button>
                  <span className="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-300">
                    {categories.find(c => c.id === step)?.name}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
              <motion.div
                className="h-full bg-green-600 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
              />
            </div>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center px-4 py-2 bg-white rounded-full shadow-sm dark:bg-gray-800">
              <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">Show Details</span>
              <Switch
                checked={showDetails}
                onCheckedChange={setShowDetails}
                className="scale-75 sm:scale-100"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Ingredients Panel */}
          <div className="md:col-span-1 lg:col-span-2">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-white shadow-lg sm:p-6 dark:bg-gray-800 rounded-3xl"
            >
              <h2 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl dark:text-white">
                {categories.find(c => c.id === activeStep)?.name}
              </h2>
              <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentCategoryIngredients.map(ingredient => (
                  <motion.div
                    key={ingredient.id}
                    whileHover={{ scale: 1.03 }}
                    animate={lastAdded === ingredient.id ? 
                      { scale: [1, 1.1, 1], borderColor: ['#10B981', '#10B981', '#D1D5DB'] } : 
                      {}
                    }
                    transition={{ duration: 0.4 }}
                    className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center cursor-pointer transition-all ${
                      selectedIngredients[ingredient.id]
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                    }`}
                    onClick={() => handleAddIngredient(ingredient.id)}
                  >
                    <span className="mb-1 text-2xl sm:mb-2 sm:text-3xl">{ingredient.emoji || '🥗'}</span>
                    <h3 className="text-sm font-medium text-center sm:text-base dark:text-white">{ingredient.name}</h3>
                    <div className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm dark:text-gray-300">
                      ${ingredient.price.toFixed(2)}
                    </div>
                    {showDetails && (
                      <div className="mt-2 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                        <div>Calories: {ingredient.calories}</div>
                        <div>Protein: {ingredient.protein}g</div>
                        <div>Carbs: {ingredient.carbs}g</div>
                        <div>Fat: {ingredient.fats}g</div>
                      </div>
                    )}
                    {selectedIngredients[ingredient.id] && (
                      <div className="mt-1 font-bold text-green-600 sm:mt-2 dark:text-green-400">
                        ×{selectedIngredients[ingredient.id]}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={goToPreviousStep}
                  disabled={currentStepIndex === 0}
                  className="flex items-center px-4 py-2 text-sm font-medium bg-white border rounded-full sm:px-6 sm:py-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={goToNextStep}
                  disabled={currentStepIndex === steps.length - 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-full sm:px-6 sm:py-3 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Summary Panel */}
          <div className="md:sticky md:top-8 h-fit">
            <div className="p-4 bg-white shadow-lg sm:p-6 dark:bg-gray-800 rounded-3xl">
              <h3 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl dark:text-white">Your Salad</h3>
              {Object.entries(selectedIngredients).length > 0 ? (
                <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4 max-h-[50vh] md:max-h-[40vh] overflow-y-auto pr-1">
                  {Object.entries(selectedIngredients).map(([id, count]) => {
                    const ingredient = allIngredients.find(i => i.id === id);
                    if (!ingredient) return null;
                    
                    return (
                      <div key={id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl">{ingredient.emoji || '🥗'}</span>
                          <div>
                            <div className="text-sm font-medium sm:text-base dark:text-white">{ingredient.name}</div>
                            <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">
                              {categories.find(c => c.id === ingredient.category)?.name || ingredient.category}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveIngredient(id);
                            }}
                            className="flex items-center justify-center bg-gray-100 rounded-full w-7 h-7 sm:w-8 sm:h-8 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-5 text-center sm:w-6 dark:text-white">{count}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddIngredient(id);
                            }}
                            className="flex items-center justify-center bg-gray-100 rounded-full w-7 h-7 sm:w-8 sm:h-8 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-sm text-center text-gray-500 sm:py-8 dark:text-gray-400 sm:text-base">
                  Select ingredients to build your salad
                </div>
              )}

              {/* Nutrition Summary */}
              <div className="p-3 mb-4 sm:p-4 sm:mb-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
                  <div>
                    <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">Calories</div>
                    <div className="text-lg font-bold sm:text-xl dark:text-white">
                      {totals.calories}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">Protein</div>
                    <div className="text-lg font-bold sm:text-xl dark:text-white">
                      {totals.protein}g
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">Price</div>
                    <div className="text-lg font-bold sm:text-xl dark:text-white">
                      ${totals.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Section */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium sm:text-base dark:text-white">Quantity</span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex items-center justify-center bg-gray-100 rounded-full w-7 h-7 sm:w-8 sm:h-8 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center sm:w-8 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex items-center justify-center bg-gray-100 rounded-full w-7 h-7 sm:w-8 sm:h-8 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    disabled={!Object.keys(selectedIngredients).length}
                    className="px-4 py-2 text-green-600 border border-green-600 rounded-xl hover:bg-green-50 disabled:opacity-50"
                  >
                    Save Salad
                  </button>
                  <button
                    onClick={() => {
                      if (Object.keys(selectedIngredients).length > 0) {
                        setShowOrderSummary(true);
                      } else {
                        toast?.info('Please select ingredients first');
                      }
                    }}
                    className="relative flex-1 py-2 overflow-hidden text-sm font-medium text-white transition-all bg-green-600 sm:py-3 sm:text-base rounded-xl hover:bg-green-700 disabled:opacity-50 group"
                  >
                    <span className="relative z-10">
                      Review Order - ${totals.price.toFixed(2)}
                    </span>
                    <span className="absolute inset-0 w-0 transition-all duration-300 bg-green-700 group-hover:w-full"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md p-6 bg-white rounded-xl dark:bg-gray-800"
          >
            <button 
              onClick={() => setShowSaveDialog(false)}
              className="absolute p-1 text-gray-400 top-4 right-4 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="mb-4 text-xl font-bold dark:text-white">Save Your Salad</h3>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Salad Name
              </label>
              <input
                type="text"
                value={saladName}
                onChange={e => setSaladName(e.target.value)}
                placeholder={`Salad ${savedSalads.length + 1}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                If left blank, we'll auto-name it for you.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSalad}
                disabled={isSaving}
                className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Salad'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Order Summary Dialog */}
      {showOrderSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md p-6 bg-white rounded-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setShowOrderSummary(false)}
              className="absolute p-1 text-gray-400 top-4 right-4 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <h3 className="mb-4 text-xl font-bold dark:text-white">Order Summary</h3>
            
            <div className="mb-4 space-y-2">
              {Object.entries(selectedIngredients).map(([id, count]) => {
                const ingredient = allIngredients.find(i => i.id === id);
                if (!ingredient) return null;
                
                return (
                  <div key={id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">{ingredient.emoji || '🥗'}</span>
                      <span>{ingredient.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-4 text-sm text-gray-600">×{count}</span>
                      <span>${(ingredient.price * count).toFixed(2)}</span>
                    </div>
                  </div>
                );
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
                onClick={() => setShowOrderSummary(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit Salad
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  setShowOrderSummary(false);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </div>
  );
}