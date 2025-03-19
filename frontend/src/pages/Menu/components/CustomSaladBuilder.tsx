import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Info, Clock, Check, Plus, Minus, Loader2 } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import IngredientItem from './IngredientItem';
import { Ingredient, IngredientCategory, SuggestedCombination } from '../types';

interface CustomSaladBuilderProps {
  ingredients: Ingredient[];
  ingredientCategories: IngredientCategory[];
  suggestedCombinations: SuggestedCombination[];
  onAddToCart: (saladId: string, quantity: number, ingredients: Record<string, number>) => void;
  isLoading?: boolean;
}

const CustomSaladBuilder: React.FC<CustomSaladBuilderProps> = ({
  ingredients = [],
  ingredientCategories = [],
  suggestedCombinations = [],
  onAddToCart,
  isLoading = false,
}) => {
  const { isDarkMode } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showNutritionPanel, setShowNutritionPanel] = useState(false);
  
  // Reset step if categories change
  useEffect(() => {
    if (ingredientCategories && ingredientCategories.length > 0 && activeStep >= ingredientCategories.length) {
      setActiveStep(0);
    }
  }, [ingredientCategories, activeStep]);
  
  // Calculate totals for the selected ingredients
  const totals = useMemo(() => {
    return Object.entries(selectedIngredients).reduce(
      (acc, [id, count]) => {
        const ingredient = ingredients?.find(i => i.id === id);
        if (ingredient && count > 0) {
          acc.price += ingredient.price * count;
          acc.calories += ingredient.calories * count;
          acc.protein += (ingredient.protein || 0) * count;
          acc.carbs += (ingredient.carbs || 0) * count;
          acc.fats += (ingredient.fats || 0) * count;
          acc.count += count;
        }
        return acc;
      },
      { price: 0, calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 }
    );
  }, [ingredients, selectedIngredients]);
  
  // Get current category ingredients
  const currentCategory = ingredientCategories[activeStep];
  const currentIngredients = useMemo(() => {
    return ingredients?.filter(i => i.category === currentCategory?.id) || [];
  }, [ingredients, currentCategory]);
  
  // Is current step valid (at least one base selected if step is 0)
  const isCurrentStepValid = useMemo(() => {
    if (activeStep === 0) {
      // Base ingredients require at least one selection
      return Object.entries(selectedIngredients).some(
        ([id, count]) => {
          const ingredient = ingredients?.find(i => i.id === id);
          return ingredient?.category === currentCategory?.id && count > 0;
        }
      );
    }
    return true;
  }, [activeStep, currentCategory, ingredients, selectedIngredients]);
  
  // Apply a suggested combination
  const applySuggestion = (suggestion: SuggestedCombination) => {
    setShowAnimation(true);
    
    // Clear existing selections
    setSelectedIngredients({});
    
    // Add all ingredients from the suggestion
    const newSelections: Record<string, number> = {};
    
    Object.entries(suggestion).forEach(([category, items]) => {
      if (Array.isArray(items) && category !== 'id' && category !== 'name') {
        items.forEach((itemId) => {
          newSelections[itemId] = 1;
        });
      }
    });
    
    setSelectedIngredients(newSelections);
    setActiveSuggestion(suggestion.id);
    setActiveStep(0);
    
    setTimeout(() => {
      setShowAnimation(false);
    }, 1500);
  };
  
  // Add/remove ingredient
  const handleAddIngredient = (id: string) => {
    setSelectedIngredients(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
    // Clear any active suggestion when manually adjusting
    if (activeSuggestion) setActiveSuggestion(null);
  };
  
  const handleRemoveIngredient = (id: string) => {
    setSelectedIngredients(prev => {
      const newVal = { ...prev };
      if ((prev[id] || 0) > 0) {
        newVal[id] = prev[id] - 1;
        if (newVal[id] === 0) {
          delete newVal[id];
        }
      }
      return newVal;
    });
    // Clear any active suggestion when manually adjusting
    if (activeSuggestion) setActiveSuggestion(null);
  };
  
  // Complete order
  const handleAddToCart = () => {
    onAddToCart('custom-salad', quantity, selectedIngredients);
    
    // Reset selections after adding to cart
    setSelectedIngredients({});
    setActiveStep(0);
    setQuantity(1);
    setActiveSuggestion(null);
  };
  
  // Previous/next step handlers
  const goToNextStep = () => {
    if (activeStep < ingredientCategories.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };
  
  // First load animation
  useEffect(() => {
    if (isFirstLoad) {
      setTimeout(() => {
        setIsFirstLoad(false);
      }, 500);
    }
  }, [isFirstLoad]);
  
  // Salad preview - sorted ingredients to display
  const displayIngredients = useMemo(() => {
    return Object.entries(selectedIngredients)
      .filter(([ingredientId, count]) => count > 0)
      .map(([id, count]) => {
        const ingredient = ingredients?.find(i => i.id === id);
        return {
          id,
          name: ingredient?.name || '',
          category: ingredient?.category || '',
          count
        };
      })
      .sort((a, b) => {
        // Sort by category order in ingredientCategories, then by name
        const catA = ingredientCategories.findIndex(c => c.id === a.category);
        const catB = ingredientCategories.findIndex(c => c.id === b.category);
        if (catA !== catB) return catA - catB;
        return a.name.localeCompare(b.name);
      });
  }, [ingredients, ingredientCategories, selectedIngredients]);

  // Get the category name for the preview
  const getCategoryName = (categoryId: string) => {
    return ingredientCategories.find(c => c.id === categoryId)?.name || '';
  };
  
  // Loading state UI
  if (isLoading) {
    return (
      <div className={`rounded-2xl overflow-hidden shadow-lg p-12 flex flex-col items-center justify-center ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        <Loader2 className={`w-12 h-12 animate-spin mb-4 ${isDarkMode ? 'text-green-500' : 'text-green-600'}`} />
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Chargement des ingrédients...
        </p>
      </div>
    );
  }
  
  // Empty state UI
  if (!ingredients?.length || !ingredientCategories?.length) {
    return (
      <div className={`rounded-2xl overflow-hidden shadow-lg p-12 text-center ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        <div className={`text-5xl mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>🥗</div>
        <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Aucun ingrédient disponible
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Veuillez réessayer ultérieurement.
        </p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Animated rings on suggestion apply */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.7 }}
            exit={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <div className={`absolute inset-0 rounded-full border-4 ${
              isDarkMode ? 'border-green-600/30' : 'border-green-500/30'
            }`}></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`rounded-2xl overflow-hidden shadow-lg ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className={`text-2xl md:text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Créez Votre Salade
              </h2>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Composez votre salade parfaite en choisissant vos ingrédients préférés
              </p>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={() => setShowNutritionPanel(!showNutritionPanel)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                  isDarkMode 
                    ? 'text-white hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Info size={18} />
                <span>Nutrition</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left: Category selection and ingredients */}
          <div className="w-full lg:w-2/3 lg:border-r lg:min-h-[600px] flex flex-col ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }">
            {/* Step progress */}
            <div className="px-6 pt-6">
              <div className="flex justify-between mb-2">
                <div className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Étape {activeStep + 1}/{ingredientCategories.length} - {currentCategory?.name}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {isCurrentStepValid ? 
                    <span className="flex items-center text-green-500">
                      <Check size={14} className="mr-1" />
                      Complété
                    </span> : 
                    <span className={isDarkMode ? 'text-amber-400' : 'text-amber-600'}>
                      {activeStep === 0 ? '* Sélectionnez au moins une base' : 'Optionnel'}
                    </span>
                  }
                </div>
              </div>
              
              <div className="flex mb-6">
                {ingredientCategories.map((category, idx) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveStep(idx)}
                    className={`flex-1 h-2 rounded-full mx-0.5 transition-colors ${
                      activeStep === idx
                        ? isDarkMode ? 'bg-green-600' : 'bg-green-500'
                        : idx < activeStep
                          ? isDarkMode ? 'bg-green-800' : 'bg-green-200'
                          : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Ingredients grid */}
            <div className="flex-1 px-6 pb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCategory?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {currentIngredients.map(ingredient => (
                    <IngredientItem
                      key={ingredient.id}
                      ingredient={ingredient}
                      count={selectedIngredients[ingredient.id] || 0}
                      onAddIngredient={handleAddIngredient}
                      onRemoveIngredient={handleRemoveIngredient}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className={`p-4 flex justify-between border-t ${
              isDarkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-100 bg-gray-50'
            }`}>
              <button
                onClick={goToPreviousStep}
                disabled={activeStep === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeStep === 0
                    ? isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    : isDarkMode 
                      ? 'text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Précédent</span>
              </button>
              
              <button
                onClick={goToNextStep}
                disabled={!isCurrentStepValid || activeStep === ingredientCategories.length - 1}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  !isCurrentStepValid || activeStep === ingredientCategories.length - 1
                    ? isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    : isDarkMode 
                      ? 'text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="hidden sm:inline">Suivant</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Right: Summary, suggestions, and checkout */}
          <div className="w-full lg:w-1/3">
            <div className="p-6">
              {/* Current salad summary */}
              <div className={`mb-6 rounded-xl p-4 ${
                isDarkMode ? 'bg-gray-750' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-medium mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Votre Salade
                </h3>
                
                {displayIngredients.length === 0 ? (
                  <div className={`text-sm italic ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Commencez à ajouter des ingrédients...
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      {Object.entries(
                        displayIngredients.reduce<Record<string, typeof displayIngredients>>((acc, item) => {
                          if (!acc[item.category]) acc[item.category] = [];
                          acc[item.category].push(item);
                          return acc;
                        }, {})
                      ).map(([category, items]) => (
                        <div key={category} className="mb-3">
                          <div className={`text-xs font-medium mb-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {getCategoryName(category)}:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {items.map(item => (
                              <div 
                                key={item.id}
                                className={`px-2 py-1 rounded-md text-xs ${
                                  isDarkMode 
                                    ? 'bg-gray-700 text-gray-200' 
                                    : 'bg-gray-200 text-gray-800'
                                }`}
                              >
                                {item.name} {item.count > 1 ? `× ${item.count}` : ''}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Totals */}
                    <div className="flex flex-wrap gap-3">
                      <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                        isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {totals.count} ingrédients
                      </div>
                      <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                        isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {Math.round(totals.calories)} calories
                      </div>
                      <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                        isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                        {Math.round(totals.protein)}g protéines
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Suggestions */}
              <div className="mb-6">
                <h3 className={`text-lg font-medium mb-3 flex items-center gap-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <Sparkles size={16} className={isDarkMode ? 'text-amber-400' : 'text-amber-600'} />
                  Suggestions
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  {suggestedCombinations.map(combo => (
                    <button
                      key={combo.id}
                      onClick={() => applySuggestion(combo)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        activeSuggestion === combo.id
                          ? isDarkMode 
                            ? 'bg-green-900/30 border border-green-700' 
                            : 'bg-green-100 border border-green-200'
                          : isDarkMode 
                            ? 'hover:bg-gray-750 border border-gray-700' 
                            : 'hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {combo.name}
                      </div>
                      <div className={`text-xs mt-1 line-clamp-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {[
                          ...combo.base || [],
                          ...combo.protein || [],
                          ...combo.toppings?.slice(0, 2) || []
                        ].map(id => {
                          const ingredient = ingredients.find(i => i.id === id);
                          return ingredient?.name;
                        }).filter(Boolean).join(', ')}
                        {combo.toppings && combo.toppings.length > 2 ? '...' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Checkout section */}
              <div className={`rounded-xl p-4 ${
                isDarkMode ? 'bg-gray-750' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`text-lg font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Total
                  </h3>
                  <div className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {totals.price.toFixed(2)} €
                  </div>
                </div>
                
                {/* Estimated time */}
                <div className={`flex items-center gap-1 mb-4 text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Clock size={14} />
                  <span>Temps de préparation: ~10 min</span>
                </div>
                
                {/* Quantity selector */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Quantité:
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className={`mx-4 font-medium w-4 text-center ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Add to cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={displayIngredients.length === 0 || !isCurrentStepValid}
                  className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                    displayIngredients.length === 0 || !isCurrentStepValid
                      ? isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                      : isDarkMode 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <ShoppingBag size={18} />
                  <span>Ajouter au panier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nutrition panel - slides from the bottom on mobile, from the right on desktop */}
      <AnimatePresence>
        {showNutritionPanel && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={() => setShowNutritionPanel(false)}>
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={e => e.stopPropagation()}
              className={`w-full md:max-w-md h-screen overflow-y-auto ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-xl`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Information Nutritionnelle
                  </h3>
                  <button
                    onClick={() => setShowNutritionPanel(false)}
                    className={`p-2 rounded-full ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {displayIngredients.length === 0 ? (
                  <div className={`text-center py-12 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Ajoutez des ingrédients pour voir les informations nutritionnelles
                  </div>
                ) : (
                  <>
                    {/* Nutrition summary */}
                    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 rounded-xl p-4 ${
                      isDarkMode ? 'bg-gray-750' : 'bg-gray-50'
                    }`}>
                      <div className="text-center">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Calories</div>
                        <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {Math.round(totals.calories)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Protéines</div>
                        <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {Math.round(totals.protein)}g
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Glucides</div>
                        <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {Math.round(totals.carbs)}g
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Lipides</div>
                        <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {Math.round(totals.fats)}g
                        </div>
                      </div>
                    </div>
                    
                    {/* Macronutrient visualization */}
                    <div className="mb-8">
                      <div className={`text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        Répartition des Macronutriments
                      </div>
                      
                      <div className="h-5 flex rounded-full overflow-hidden">
                        {totals.protein + totals.carbs + totals.fats > 0 && (
                          <>
                            <div 
                              className="bg-amber-500 h-full flex items-center justify-center"
                              style={{ 
                                width: `${(totals.protein / (totals.protein + totals.carbs + totals.fats)) * 100}%` 
                              }}
                            >
                              {totals.protein >= 10 && (
                                <span className="text-xs text-white font-medium px-1">
                                  {Math.round(totals.protein)}g
                                </span>
                              )}
                            </div>
                            <div 
                              className="bg-blue-500 h-full flex items-center justify-center"
                              style={{ 
                                width: `${(totals.carbs / (totals.protein + totals.carbs + totals.fats)) * 100}%` 
                              }}
                            >
                              {totals.carbs >= 10 && (
                                <span className="text-xs text-white font-medium px-1">
                                  {Math.round(totals.carbs)}g
                                </span>
                              )}
                            </div>
                            <div 
                              className="bg-red-500 h-full flex items-center justify-center"
                              style={{ 
                                width: `${(totals.fats / (totals.protein + totals.carbs + totals.fats)) * 100}%` 
                              }}
                            >
                              {totals.fats >= 10 && (
                                <span className="text-xs text-white font-medium px-1">
                                  {Math.round(totals.fats)}g
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSaladBuilder;