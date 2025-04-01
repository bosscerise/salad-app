"use client";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Minus } from 'lucide-react';
import React from 'react';

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
import { ingredients, ingredientCategories, suggestedCombinations } from '../data';
import type { SuggestedCombination } from '../types';

type Step = 'base' | 'protein' | 'toppings' | 'dressing' | 'extras';

export default function SaladBuilder() {
  const [activeStep, setActiveStep] = useState<Step>('base');
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // New state for toggle

  const steps: Step[] = ['base', 'protein', 'toppings', 'dressing', 'extras'];

  const totals = useMemo(() => {
    return Object.entries(selectedIngredients).reduce(
      (acc, [id, count]) => {
        const ingredient = ingredients.find(i => i.id === id);
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
  }, [selectedIngredients]);

  const currentIngredients = useMemo(() => {
    return ingredients.filter(i => i.category === activeStep);
  }, [activeStep]);

  const applySuggestion = (suggestion: SuggestedCombination) => {
    setShowAnimation(true);
    const newSelections: Record<string, number> = {};
    ['base', 'protein', 'toppings', 'dressing', 'extras'].forEach(category => {
      const items = suggestion[category as keyof SuggestedCombination];
      if (Array.isArray(items)) {
        items.forEach((id: string) => {
          newSelections[id] = 1;
        });
      }
    });
    setSelectedIngredients(newSelections);
    setActiveSuggestion(suggestion.id);
    setTimeout(() => setShowAnimation(false), 1200);
  };

  const handleAddIngredient = (id: string) => {
    setSelectedIngredients(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    if (activeSuggestion) setActiveSuggestion(null);
  };

  const handleRemoveIngredient = (id: string) => {
    setSelectedIngredients(prev => {
      const count = (prev[id] || 0) - 1;
      if (count <= 0) {
        // Create a new object without the specified id property
        const newObj = { ...prev };
        delete newObj[id];
        return newObj;
      }
      return { ...prev, [id]: count };
    });
    if (activeSuggestion) setActiveSuggestion(null);
  };

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

        {/* Progress Steps, Toggle Switch, and Suggested Combinations */}
        <div className="mb-8 sm:mb-12">
          <div className="flex justify-center pb-2 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => setActiveStep(step)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm sm:text-base md:text-lg transition-all ${
                    activeStep === step
                      ? 'bg-green-600 text-white scale-110'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {ingredientCategories.find(c => c.id === step)?.icon}
                </button>
                {index < steps.length - 1 && (
                  <div className="w-4 h-1 mx-1 bg-gray-200 sm:w-8 md:w-16 sm:mx-2 dark:bg-gray-700" />
                )}
              </div>
            ))}
          </div>

          {/* Toggle Switch and Suggested Combinations */}
          <div className="flex flex-col items-center mt-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">Show Details</span>
              <Switch
                checked={showDetails}
                onCheckedChange={setShowDetails}
                className="scale-75 sm:scale-100"
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full sm:w-auto"
            >
              <h3 className="flex items-center justify-center gap-2 mb-3 text-lg font-bold sm:text-xl dark:text-white">
                <Sparkles className="text-amber-500" size={18} /> Chef's Recommendations
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {suggestedCombinations.map(combo => (
                  <motion.div
                    key={combo.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-all text-center ${
                      activeSuggestion === combo.id
                        ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => applySuggestion(combo)}
                  >
                    <div className="text-xs font-medium sm:text-sm dark:text-white">{combo.name}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
                {ingredientCategories.find(c => c.id === activeStep)?.name}
              </h2>
              <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentIngredients.map(ingredient => (
                  <motion.div
                    key={ingredient.id}
                    whileHover={{ scale: 1.03 }}
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
            </motion.div>
          </div>

          {/* Summary Panel */}
          <div className="md:sticky md:top-8 h-fit">
            <div className="p-4 bg-white shadow-lg sm:p-6 dark:bg-gray-800 rounded-3xl">
              <h3 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl dark:text-white">Your Salad</h3>
              {Object.entries(selectedIngredients).length > 0 ? (
                <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4 max-h-[50vh] md:max-h-[40vh] overflow-y-auto pr-1">
                  {Object.entries(selectedIngredients).map(([id, count]) => {
                    const ingredient = ingredients.find(i => i.id === id)!;
                    return (
                      <div key={id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl">{ingredient.emoji || '🥗'}</span>
                          <div>
                            <div className="text-sm font-medium sm:text-base dark:text-white">{ingredient.name}</div>
                            <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">
                              {ingredient.category}
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
                      {totals.calories.toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">Protein</div>
                    <div className="text-lg font-bold sm:text-xl dark:text-white">
                      {totals.protein.toFixed(0)}g
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 sm:text-sm dark:text-sm dark:text-gray-300">Price</div>
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
                <button
                  onClick={() => {
                    setShowAnimation(true);
                    setTimeout(() => {
                      alert('Added to cart!');
                      setShowAnimation(false);
                    }, 500);
                  }}
                  disabled={!Object.keys(selectedIngredients).length}
                  className="relative w-full py-2 overflow-hidden text-sm font-medium text-white transition-all bg-green-600 sm:py-3 sm:text-base rounded-xl hover:bg-green-700 disabled:opacity-50 group"
                >
                  <span className="relative z-10">Add to Cart - ${(totals.price * quantity).toFixed(2)}</span>
                  <span className="absolute inset-0 w-0 transition-all duration-300 bg-green-700 group-hover:w-full"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}