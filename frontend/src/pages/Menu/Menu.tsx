import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';

// Components
import MenuTabs from './components/MenuTabs';
import MobileMenu from './components/MobileMenu';
import MenuSidebar from './components/MenuSidebar';
import SaladGrid from './components/SaladGrid';
import CustomSaladBuilder from './components/CustomSaladBuilder';
import LoadingSpinner from './components/LoadingSpinner';

// Data and Utils
import { menuCategories, ingredientCategories, ingredients, salads, suggestedCombinations } from './data';
import { getRecommendedIngredients } from './utils';
// calculateCustomNutrition^^
import { CustomSalad, SavedSalad, RecommendationType } from './types';

// Main component
export default function MenuPage() {
  // Core states
  const [selectedCategory, setSelectedCategory] = useState('featured');
  const [cartItems, setCartItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'premade' | 'custom'>('premade');
  const [favorites, setFavorites] = useState<number[]>([]);
  
  // Custom salad builder states
  const [selectedIngredientCategory, setSelectedIngredientCategory] = useState('base');
  const [customSalad, setCustomSalad] = useState<CustomSalad>({
    ingredients: {},
    name: "My Custom Salad"
  });
  // const [saladNameInput, setSaladNameInput] = useState("");
  const [savedCustomSalads, setSavedCustomSalads] = useState<SavedSalad[]>([]);
  const [selectedCombination, setSelectedCombination] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recommendationType, setRecommendationType] = useState<RecommendationType>('balanced');

  // For demonstration - toggle this to test authentication state in header
  // const [isAuthenticated] = useState(false);
  // const [userName] = useState('John Doe');

  // Load data
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter salads by selected category - memoized to avoid unnecessary recalculations
  const filteredSalads = useMemo(() => 
    salads.filter(salad => salad.category === selectedCategory || selectedCategory === 'featured'),
    [selectedCategory]
  );

  // Handle adding ingredient with useCallback to prevent unnecessary re-renders
  const handleAddIngredient = useCallback((ingredientId: string) => {
    setCustomSalad(prev => {
      const currentCount = prev.ingredients[ingredientId] || 0;
      return {
        ...prev,
        ingredients: {
          ...prev.ingredients,
          [ingredientId]: currentCount + 1
        }
      };
    });
  }, []);

  // Add to cart handler
  const handleAddToCart = useCallback(() => {
    setCartItems(prev => prev + 1);
  }, []);

  // Get ingredient counts by category
  const getIngredientCounts = useCallback((category: string) => {
    return Object.entries(customSalad.ingredients)
      .filter(([id]) => ingredients.find(ing => ing.id === id)?.category === category)
      .reduce((sum, [, count]) => sum + count, 0);
  }, [customSalad.ingredients]);

  // Toggle favorite
  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  }, []);

  // Load saved salad
  const loadSavedSalad = useCallback((savedSalad: SavedSalad) => {
    setCustomSalad({
      name: savedSalad.name,
      ingredients: {...savedSalad.ingredients}
    });
  }, []);

  // Delete saved salad
  const deleteSavedSalad = useCallback((id: string) => {
    setSavedCustomSalads(prev => 
      prev.filter(salad => salad.id !== id)
    );
  }, []);

  // Apply suggested combination
  const applySuggestedCombination = useCallback((id: string) => {
    const combination = suggestedCombinations.find(combo => combo.id === id);
    if (!combination) return;
    
    const newIngredients: {[key: string]: number} = {};
    
    // Add all ingredients from the combination
    const addFromArray = (arr: string[]) => {
      arr.forEach(ingredientId => {
        newIngredients[ingredientId] = 1;
      });
    };
    
    addFromArray(combination.base);
    addFromArray(combination.protein);
    addFromArray(combination.toppings);
    addFromArray(combination.dressing);
    addFromArray(combination.extras);
    
    setCustomSalad({
      name: combination.name,
      ingredients: newIngredients
    });
    
    setSelectedCombination(id);
    setShowSuggestions(false);
  }, []);

  // Handle custom salad add to cart
  const handleCustomSaladAddToCart = useCallback((saladId: string, _: number, ingredients: Record<string, number>) => {
    setCartItems(prev => prev + 1);
    
    // Update the custom salad state for consistency with the rest of the app
    setCustomSalad({
      name: saladId === 'custom-salad' ? 'My Custom Salad' : saladId,
      ingredients: ingredients
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      {/* Header component */}
      <Header 
        cartItems={cartItems}
        scrolled={false}
      />
      
      {/* Mobile Menu */}
      <MobileMenu
        mobileMenuOpen={mobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedIngredientCategory={selectedIngredientCategory}
        setSelectedIngredientCategory={setSelectedIngredientCategory}
        menuCategories={menuCategories}
        ingredientCategories={ingredientCategories}
        getIngredientCounts={getIngredientCounts}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Tab Selector */}
      <MenuTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="px-2 pt-4 pb-16 mx-auto max-w-7xl sm:px-4 lg:px-8 sm:pb-20 sm:pt-6">
        <div className="flex flex-col gap-6 md:flex-row">
          
          {/* Sidebar - Categories (Desktop) */}
          <MenuSidebar
            activeTab={activeTab}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedIngredientCategory={selectedIngredientCategory}
            setSelectedIngredientCategory={setSelectedIngredientCategory}
            menuCategories={menuCategories}
            ingredientCategories={ingredientCategories}
            getIngredientCounts={getIngredientCounts}
            savedCustomSalads={savedCustomSalads}
            loadSavedSalad={loadSavedSalad}
            deleteSavedSalad={deleteSavedSalad}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            recommendationType={recommendationType}
            setRecommendationType={setRecommendationType}
            suggestedCombinations={suggestedCombinations}
            applySuggestedCombination={applySuggestedCombination}
            selectedCombination={selectedCombination}
            getRecommendedIngredients={() => getRecommendedIngredients(recommendationType)}
            handleAddIngredient={handleAddIngredient}
          />
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Loading State */}
            <AnimatePresence>
              {isLoading && <LoadingSpinner />}
            </AnimatePresence>
            
            {!isLoading && (
              <>
                {activeTab === 'premade' && (
                  <>
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 text-2xl font-bold text-gray-800"
                    >
                      Our {selectedCategory === 'featured' ? 'Featured' : menuCategories.find(c => c.id === selectedCategory)?.name} Salads
                    </motion.h2>
                    
                    <SaladGrid
                      salads={filteredSalads}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      handleAddToCart={handleAddToCart}
                    />
                  </>
                )}
                
                {activeTab === 'custom' && (
                  <CustomSaladBuilder
                    ingredients={ingredients}
                    ingredientCategories={ingredientCategories}
                    suggestedCombinations={suggestedCombinations}
                    onAddToCart={handleCustomSaladAddToCart}
                    isLoading={isLoading}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}