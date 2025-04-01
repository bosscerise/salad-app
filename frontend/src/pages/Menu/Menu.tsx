import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
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
import { calculateCustomNutrition, getIngredientById, getRecommendedIngredients } from './utils';
import { CustomSalad, SavedSalad, RecommendationType } from './types';

// Main component
export default function MenuPage() {
  // States
  const [selectedCategory, setSelectedCategory] = useState('featured');
  const [cartItems, setCartItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'premade' | 'custom'>('premade');
  const [favorites, setFavorites] = useState<number[]>([]);
  
  // Custom salad builder states
  const [selectedIngredientCategory, setSelectedIngredientCategory] = useState('base');
  const [customSalad, setCustomSalad] = useState<CustomSalad>({
    ingredients: {},
    name: "My Custom Salad"
  });
  const [showCustomNutrition, setShowCustomNutrition] = useState(false);
  const [saladNameInput, setSaladNameInput] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [savedCustomSalads, setSavedCustomSalads] = useState<SavedSalad[]>([]);
  const [selectedCombination, setSelectedCombination] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recommendationType, setRecommendationType] = useState<RecommendationType>('balanced');

  // For demonstration - toggle this to test authentication state in header
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('John Doe');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Filter salads by selected category
  const filteredSalads = salads.filter(
    salad => salad.category === selectedCategory || selectedCategory === 'featured'
  );

  // Filter ingredients by selected category
  const filteredIngredients = ingredients.filter(
    ingredient => ingredient.category === selectedIngredientCategory
  );

  // Toggle functions
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (filtersOpen) setFiltersOpen(false);
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleAddIngredient = (ingredientId: string) => {
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
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setCustomSalad(prev => {
      const currentCount = prev.ingredients[ingredientId] || 0;
      const newCount = Math.max(0, currentCount - 1);
      
      const newIngredients = { ...prev.ingredients };
      
      if (newCount === 0) {
        delete newIngredients[ingredientId];
      } else {
        newIngredients[ingredientId] = newCount;
      }
      
      return {
        ...prev,
        ingredients: newIngredients
      };
    });
  };

  const resetCustomSalad = () => {
    setCustomSalad({
      ingredients: {},
      name: "My Custom Salad"
    });
    setSaladNameInput("");
    setIsEditingName(false);
    setShowCustomNutrition(false);
    setSelectedCombination(null);
  };

  const confirmSaladName = () => {
    if (saladNameInput.trim()) {
      setCustomSalad(prev => ({
        ...prev,
        name: saladNameInput.trim()
      }));
    }
    setIsEditingName(false);
  };

  const nutrition = calculateCustomNutrition(customSalad.ingredients);
  const selectedIngredientCount = Object.values(customSalad.ingredients).reduce((sum, count) => sum + count, 0);
  
  const handleAddToCart = () => {
    setCartItems(prev => prev + 1);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const addCustomSaladToCart = () => {
    // Only add if there are ingredients selected
    if (selectedIngredientCount > 0) {
      setCartItems(prev => prev + 1);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const getIngredientCounts = (category: string) => {
    return Object.entries(customSalad.ingredients)
      .filter(([id]) => ingredients.find(ing => ing.id === id)?.category === category)
      .reduce((sum, [_, count]) => sum + count, 0);
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const saveSalad = () => {
    if (selectedIngredientCount > 0) {
      const newSavedSalad = {
        id: Date.now().toString(),
        name: customSalad.name,
        ingredients: {...customSalad.ingredients}
      };
      
      setSavedCustomSalads(prev => [...prev, newSavedSalad]);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const loadSavedSalad = (savedSalad: SavedSalad) => {
    setCustomSalad({
      name: savedSalad.name,
      ingredients: {...savedSalad.ingredients}
    });
  };

  const deleteSavedSalad = (id: string) => {
    setSavedCustomSalads(prev => 
      prev.filter(salad => salad.id !== id)
    );
  };

  const applySuggestedCombination = (id: string) => {
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
  };

  // Handle adding a custom salad to cart with our new component format
  const handleCustomSaladAddToCart = (saladId: string, quantity: number, ingredients: Record<string, number>) => {
    setCartItems(prev => prev + 1);
    setShowSuccessMessage(true);
    
    // Update the custom salad state for consistency with the rest of the app
    setCustomSalad({
      name: saladId === 'custom-salad' ? 'My Custom Salad' : saladId,
      ingredients: ingredients
    });
    
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      {/* Use the enhanced Header component with authentication */}
      <Header 
        cartItems={cartItems}
        isAuthenticated={isAuthenticated} 
        userName={userName}
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
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pb-16 sm:pb-20 pt-4 sm:pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          
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
                      className="text-2xl font-bold text-gray-800 mb-6"
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