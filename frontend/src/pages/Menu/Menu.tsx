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
// import { useState } from 'react';
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "../../components/ui/sheet"

// interface Salad {
//   id: number;
//   name: string;
//   price: number;
//   description: string;
//   ingredients: string[];
//   calories: number;
//   image: string;
// }

// function Menu() {
//   const [cartCount, setCartCount] = useState(0);
//   const [activeTab, setActiveTab] = useState('pre-made');

//   const preMadeSalads: Salad[] = [
//     {
//       id: 1,
//       name: "Nonna's Caesar",
//       price: 8.50,
//       description: "Our signature Caesar with homemade croutons and a family-secret dressing recipe",
//       ingredients: ["Romaine Lettuce", "Parmesan", "Croutons", "Caesar Dressing"],
//       calories: 380,
//       image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80",
//     },
//     {
//       id: 2,
//       name: "Tropical Twist",
//       price: 9.00,
//       description: "A refreshing blend of sweet pineapple and succulent shrimp on a bed of mixed greens",
//       ingredients: ["Mixed Greens", "Shrimp", "Pineapple", "Citrus Vinaigrette"],
//       calories: 320,
//       image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=200&q=80",
//     },
//     {
//       id: 3,
//       name: "Spicy Fiesta",
//       price: 9.50,
//       description: "A zesty Mexican-inspired salad with black beans, corn, and chipotle lime dressing",
//       ingredients: ["Romaine Lettuce", "Black Beans", "Corn", "Chipotle Lime Dressing"],
//       calories: 420,
//       image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=200&q=80",
//     },
//   ];

//   const addToCart = () => setCartCount(cartCount + 1);
  
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-amber-50 via-green-50 to-lime-50">
//       {/* Hero Section */}
//       <div className="relative py-12 mb-8 text-center bg-center bg-cover sm:py-24 sm:mb-12" 
//            style={{
//              backgroundImage: 'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1800&q=80")',
//              height: '400px'
//            }}>
//         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
//         <div className="relative z-10 px-4">
//           <h1 className="mb-4 font-serif text-4xl font-bold text-white sm:text-6xl animate-slide-up">
//             Fresh & Vibrant Moments
//           </h1>
//           <p className="max-w-3xl mx-auto text-lg sm:text-2xl text-white/90 animate-fade-slide">
//             More than just salads - we create daily moments of joy and wellness. Experience the perfect blend of taste and health.
//           </p>
//         </div>
//       </div>

//       <div className="container px-4 mx-auto">
//         {/* Cart and Tabs */}
//         <div className="flex items-center justify-between mb-8 animate-fade-slide">
//           <div className="flex border-b border-gray-200">
//             <button 
//               onClick={() => setActiveTab('pre-made')}
//               className={`px-6 py-3 text-lg font-medium transition-colors ${
//                 activeTab === 'pre-made' 
//                 ? 'text-green-700 border-b-2 border-green-700' 
//                 : 'text-gray-500 hover:text-gray-700'
//               }`}>
//               Pre-made Salads
//             </button>
//             <button 
//               onClick={() => setActiveTab('build')}
//               className={`px-6 py-3 text-lg font-medium transition-colors ${
//                 activeTab === 'build' 
//                 ? 'text-green-700 border-b-2 border-green-700' 
//                 : 'text-gray-500 hover:text-gray-700'
//               }`}>
//               Build Your Own
//             </button>
//           </div>
//           <button className="flex items-center gap-3 px-5 py-3 transition-all rounded-full shadow-md bg-amber-100 hover:bg-amber-200">
//             <span className="text-2xl">🛒</span>
//             <span className="font-semibold text-amber-900">{cartCount}</span>
//           </button>
//         </div>

//         {/* Salad Grid */}
//         <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
//           {preMadeSalads.map((salad) => (
//             <div key={salad.id} 
//                  className="overflow-hidden transition-all border-0 shadow-xl bg-lime-50 rounded-3xl hover:shadow-2xl hover:-translate-y-2">
//               <div className="relative">
//                 <img src={salad.image} alt={salad.name} 
//                      className="object-cover w-full h-64 transition-transform duration-300 rounded-t-3xl hover:scale-110" />
//                 <div className="absolute px-4 py-2 text-lg rounded-full shadow-lg bg-white/90 backdrop-blur top-4 right-4">
//                   <span className="font-semibold text-green-700">${salad.price.toFixed(2)}</span>
//                 </div>
//               </div>
//               <Sheet>
//                 <SheetTrigger>Open</SheetTrigger>
//                 <SheetContent>
//                   <SheetHeader>
//                     <SheetTitle>Are you absolutely sure?</SheetTitle>
//                     <SheetDescription>
//                       This action cannot be undone. This will permanently delete your account
//                       and remove your data from our servers.
//                     </SheetDescription>
//                   </SheetHeader>
//                 </SheetContent>
//               </Sheet>
//               <div className="p-6">
//                 <h3 className="mb-3 font-serif text-2xl font-bold text-gray-800">{salad.name}</h3>
//                 <p className="mb-5 leading-relaxed text-gray-600">{salad.description}</p>
//                 <div className="flex flex-wrap gap-2 mb-5">
//                   {salad.ingredients.map((ingredient, i) => (
//                     <span key={i} 
//                           className="px-4 py-2 text-sm font-medium text-green-800 transition-colors rounded-full bg-green-50 hover:bg-green-100">
//                       {ingredient}
//                     </span>
//                   ))}
//                 </div>
//                 <div className="flex items-center mb-5 text-gray-600">
//                   <span className="mr-2 text-lg">🌱</span>
//                   <span>{salad.calories} calories</span>
//                 </div>
//                 <button
//                   onClick={addToCart}
//                   className="w-full py-4 text-lg font-semibold text-white transition-all rounded-full shadow-md bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg"
//                 >
//                   Add to Cart ✨
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Menu;
