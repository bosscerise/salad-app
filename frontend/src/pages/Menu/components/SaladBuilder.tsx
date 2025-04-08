"use client";
import React, { useState, useMemo, useEffect, useCallback, memo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, CircleCheck, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useIngredients } from '../../../hooks/useIngredients';
import { useCategories } from '../../../hooks/useCategories';
import { useToast } from '../../../hooks/useToast';
import pb from '../../../pb/pocketbase';
import { userSaladApi } from '../../../services/api';
import { useCart } from '../../../contexts/CartContext';

// Memoize the Switch component to prevent unnecessary renders
const Switch = memo(({
  checked = false,
  onCheckedChange,
  className = '',
  disabled = false,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}) => {
  // Use useCallback for event handlers
  const handleToggle = useCallback(() => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  }, [disabled, onCheckedChange, checked]);

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
});

Switch.displayName = 'Switch';

// Define type for ingredient to avoid repeated type checks
interface Ingredient {
  id: string;
  name: string;
  category: string;
  emoji?: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Replace virtualized grid with a regular grid that preserves styling
const IngredientGrid = memo(({ 
  ingredients,
  selectedIngredients,
  showDetails,
  onAddIngredient,
  lastAdded
}: { 
  ingredients: Ingredient[];
  selectedIngredients: Record<string, number>;
  showDetails: boolean;
  onAddIngredient: (id: string) => void;
  lastAdded: string | null;
}) => {
  // Only render if we have ingredients
  if (ingredients.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No ingredients available in this category
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ingredients.map(ingredient => (
        <IngredientCard
          key={ingredient.id}
          ingredient={ingredient}
          isSelected={!!selectedIngredients[ingredient.id]}
          quantity={selectedIngredients[ingredient.id] || 0}
          showDetails={showDetails}
          onAddIngredient={onAddIngredient}
          isLastAdded={lastAdded === ingredient.id}
        />
      ))}
    </div>
  );
});

IngredientGrid.displayName = 'IngredientGrid';

// Memoize the IngredientCard component
const IngredientCard = memo(({ 
  ingredient, 
  isSelected,
  quantity,
  showDetails,
  onAddIngredient,
  isLastAdded
}: { 
  ingredient: Ingredient;
  isSelected: boolean;
  quantity: number;
  showDetails: boolean;
  onAddIngredient: (id: string) => void;
  isLastAdded: boolean;
}) => {
  // Use useCallback for event handlers
  const handleClick = useCallback(() => {
    onAddIngredient(ingredient.id);
  }, [onAddIngredient, ingredient.id]);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      animate={isLastAdded ? 
        { scale: [1, 1.1, 1], borderColor: ['#10B981', '#10B981', '#D1D5DB'] } : 
        {}
      }
      transition={{ duration: 0.4 }}
      className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center cursor-pointer transition-all ${
        isSelected
          ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
          : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
      }`}
      onClick={handleClick}
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
          <div>Fat: {ingredient.fats}</div>
        </div>
      )}
      {isSelected && (
        <div className="mt-1 font-bold text-green-600 sm:mt-2 dark:text-green-400">
          ×{quantity}
        </div>
      )}
    </motion.div>
  );
});

IngredientCard.displayName = 'IngredientCard';

// Memoize the SelectedIngredientItem component
const SelectedIngredientItem = memo(({
  id,
  count,
  ingredient,
  categoryName,
  onRemove,
  onAdd
}: {
  id: string;
  count: number;
  ingredient: Ingredient;
  categoryName: string;
  onRemove: (id: string) => void;
  onAdd: (id: string) => void;
}) => {
  // Use useCallback for event handlers
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
  }, [onRemove, id]);

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(id);
  }, [onAdd, id]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xl sm:text-2xl">{ingredient.emoji || '🥗'}</span>
        <div>
          <div className="text-sm font-medium sm:text-base dark:text-white">{ingredient.name}</div>
          <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">
            {categoryName}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={handleRemove}
          className="flex items-center justify-center bg-gray-100 rounded-full w-7 h-7 sm:w-8 sm:h-8 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <Minus size={14} />
        </button>
        <span className="w-5 text-center sm:w-6 dark:text-white">{count}</span>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center bg-gray-100 rounded-full w-7 h-7 sm:w-8 sm:h-8 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
});

SelectedIngredientItem.displayName = 'SelectedIngredientItem';

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

// Lazy-loaded components for modals to reduce initial bundle size
const SaveDialog = lazy(() => import('./dialogs/SaveDialog'));
const OrderSummaryDialog = lazy(() => import('./dialogs/OrderSummaryDialog'));

export default function SaladBuilder() {
  // const isInitialRenderRef = useRef(true);

  // Get data using hooks with progressive loading approach
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [activeStep, setActiveStep] = useState<Step>('base');
  const { ingredients: currentCategoryIngredients, loading: ingredientsLoading, error: ingredientsError } = useIngredients(activeStep);
  const [initialLoad, setInitialLoad] = useState(true);
  const { ingredients: allIngredients, loading: allIngredientsLoading } = useIngredients();

  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [saladName, setSaladName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSalads, setSavedSalads] = useState<UserSalad[]>([]);
  const { addToCart } = useCart();

  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Use useCallback for all functions that are passed as props or dependencies
  const fetchSavedSalads = useCallback(async () => {
    if (pb.authStore.isValid) {
      try {
        const salads = await userSaladApi.getAll();
        setSavedSalads(salads);
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    fetchSavedSalads();
  }, [fetchSavedSalads]);

  // Memoize steps to avoid recalculation
  const steps = useMemo(() => {
    return categories.map(cat => cat.id);
  }, [categories]);

  // Auto-select the 'base' category when categories are loaded
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0 && initialLoad) {
      // Find the base category or use the first available category
      const baseCategory = categories.find(cat => cat.id === 'base');
      const categoryToSelect = baseCategory ? 'base' : categories[0].id as Step;
      
      // Force a re-render by temporarily setting to a different value and back
      setActiveStep('_temp_' as Step);
      
      // Using requestAnimationFrame for smoother transitions and to avoid layout thrashing
      requestAnimationFrame(() => {
        setActiveStep(categoryToSelect);
        setInitialLoad(false);
      });
    }
  }, [categories, categoriesLoading, initialLoad]);

  const currentStepIndex = useMemo(() => steps.indexOf(activeStep), [steps, activeStep]);

  // Calculate totals from selected ingredients - memoize for performance
  // Define proper type for our cache on the Window interface
  interface TotalsCache {
    [key: string]: {
      price: number;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
  }

  // Extend the Window interface to include our cache
  interface CustomWindow extends Window {
    __totalsCache?: TotalsCache;
  }

  const totals = useMemo(() => {
    // Only recalculate if ingredients or selection changed
    const cacheKey = JSON.stringify(selectedIngredients);
    const customWindow = window as CustomWindow;
    const cached = customWindow.__totalsCache?.[cacheKey];
    if (cached) return cached;
    
    // Initialize cache if it doesn't exist
    if (!customWindow.__totalsCache) {
      customWindow.__totalsCache = {};
    }
    
    // Calculate and cache the result
    const result = Object.entries(selectedIngredients).reduce(
      (acc, [id, count]) => {
        const ingredient = allIngredients.find(i => i.id === id);
        if (ingredient && count > 0) {
          acc.price += ingredient.price * count;
          acc.calories += ingredient.calories * count;
          acc.fats += ingredient.fats * count;
        }
        return acc;
      },
      { price: 0, calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    
    const finalResult = {
      price: Number(result.price.toFixed(2)),
      calories: Math.round(result.calories),
      protein: Math.round(result.protein),
      carbs: Math.round(result.carbs),
      fats: Math.round(result.fats)
    };
    
    // Save to cache
    if (customWindow.__totalsCache) {
      customWindow.__totalsCache[cacheKey] = finalResult;
    }
    
    return finalResult;
  }, [selectedIngredients, allIngredients]);

  // Create memoized handlers using useCallback
  const handleAddIngredient = useCallback((id: string) => {
    setSelectedIngredients(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setLastAdded(id);
    // Use a referenced timeout to clean it up properly
    const timeoutId = setTimeout(() => setLastAdded(null), 500);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleRemoveIngredient = useCallback((id: string) => {
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
  }, []);

  const goToNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setActiveStep(steps[nextIndex] as Step);
      setShowAnimation(true);
      const timeoutId = setTimeout(() => setShowAnimation(false), 800);
      return () => clearTimeout(timeoutId);
    }
  }, [currentStepIndex, steps]);

  const goToPreviousStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setActiveStep(steps[prevIndex] as Step);
    }
  }, [currentStepIndex, steps]);

  const progressPercentage = useMemo(() => 
    ((currentStepIndex + 1) / steps.length) * 100, 
    [currentStepIndex, steps.length]
  );

  const handleAddToCart = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      // Keep the ingredients in the expected Record<string, unknown> format
      const customizationsObject: Record<string, unknown> = {};
      
      // Use a more efficient way to convert the selected ingredients
      Object.entries(selectedIngredients).forEach(([id, quantity]) => {
        customizationsObject[id] = { quantity };
      });
      
      if (pb.authStore.isValid) {
        // Create a saved salad first
        const saladData = {
          user_id: pb.authStore.record?.id || '',
          name: saladName || `Salad ${new Date().toLocaleTimeString()}`,
          ingredients: selectedIngredients,
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
  }, [selectedIngredients, saladName, totals, quantity, addToCart]);

  const handleSaveSalad = useCallback(async () => {
    if (!pb.authStore.isValid) {
      toast?.info('Please log in to save your salad');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Auto-generate name if user didn't provide one
      const name = saladName.trim() || `Salad ${savedSalads.length + 1}`;
      
      const saladData = {
        user_id: pb.authStore.record?.id || '',
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
  }, [saladName, savedSalads.length, selectedIngredients, totals]);

  // Memoize category lookup for better performance
  const getCategoryName = useCallback(
    (categoryId: string) => categories.find(c => c.id === categoryId)?.name || categoryId,
    [categories]
  );

  // Optimize the ingredients list rendering with better virtualization
  const ingredientsList = useMemo(() => {
    // Return the virtualized grid component
    return (
      <IngredientGrid
        ingredients={currentCategoryIngredients}
        selectedIngredients={selectedIngredients}
        showDetails={showDetails}
        onAddIngredient={handleAddIngredient}
        lastAdded={lastAdded}
      />
    );
  }, [currentCategoryIngredients, selectedIngredients, showDetails, lastAdded, handleAddIngredient]);

  // Memoize the selected ingredients list
  const selectedIngredientsList = useMemo(() => {
    return Object.entries(selectedIngredients).map(([id, count]) => {
      const ingredient = allIngredients.find(i => i.id === id);
      if (!ingredient) return null;
      
      return (
        <SelectedIngredientItem
          key={id}
          id={id}
          count={count}
          ingredient={ingredient}
          categoryName={getCategoryName(ingredient.category)}
          onRemove={handleRemoveIngredient}
          onAdd={handleAddIngredient}
        />
      );
    }).filter(Boolean); // Filter out null values
  }, [selectedIngredients, allIngredients, getCategoryName, handleRemoveIngredient, handleAddIngredient]);

  // Add progressive loading indicator
  if (categoriesLoading || allIngredientsLoading) {
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
      {/* Animated Rings - Only render when needed using AnimatePresence */}
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
              
              {/* Show different loading states for better UX */}
              {ingredientsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="w-8 h-8 text-green-600 animate-spin" />
                  <p className="mt-4 text-gray-500">Loading ingredients...</p>
                </div>
              ) : (
                ingredientsList
              )}
              
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
                  {selectedIngredientsList}
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

      {/* Modals with Suspense */}
      <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="p-8 bg-white rounded-lg">
          <Loader className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      </div>}>
        {showSaveDialog && (
          <SaveDialog
            saladName={saladName}
            setSaladName={setSaladName}
            savedSalads={savedSalads}
            isSaving={isSaving}
            onSave={handleSaveSalad}
            onClose={() => setShowSaveDialog(false)}
          />
        )}

        {showOrderSummary && (
          <OrderSummaryDialog
            selectedIngredients={selectedIngredients}
            allIngredients={allIngredients}
            totals={totals}
            quantity={quantity}
            isSubmitting={isSubmitting}
            onAddToCart={() => {
              handleAddToCart();
              setShowOrderSummary(false);
            }}
            onClose={() => setShowOrderSummary(false)}
          />
        )}
      </Suspense>
    </div>
    </div>
  );
}