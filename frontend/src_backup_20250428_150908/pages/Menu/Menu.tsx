import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import { loadDataFromAPI, salads as staticSalads } from './data';
import { useCart, CartItem } from '../../contexts/CartContext'; // Import CartItem from CartContext
import { 
    SaladsResponse, 
    IngredientsResponse, 
    Ingredient,
    convertToIngredient
} from '../../pb/types';
import { SaladIngredient } from './types'; // Keep this type as it's specific to the Menu component
import { pb } from '../../pb';
import { useNavigate } from 'react-router-dom';
import { Loader, ChevronRight, ChevronLeft } from 'lucide-react';
import React from 'react';

import haba from '@/assets/images/haba.jpg';
// Components
import SaladGrid from './components/SaladGrid';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy-loaded components for better performance
const SaladBuilder = lazy(() => import('./components/SaladBuilder'));

// Main component
export default function MenuPage() {
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [activeTab, setActiveTab] = useState<'premade' | 'custom'>('premade');
  const [salads, setSalads] = useState<SaladsResponse[]>([]);
  const [pbError, setPbError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Adjust based on screen size

  // Hooks
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Memoized values for better performance
  const categories = useMemo(() => {
    // Extract unique categories from salads and sort them
    const allCategories = ['all', ...new Set(salads.map(s => s.category))];
    return allCategories.filter(Boolean);
  }, [salads]);

  const filteredSalads = useMemo(() => {
    if (currentCategory === 'all') return salads;
    return salads.filter(salad => salad.category === currentCategory);
  }, [salads, currentCategory]);

  const paginatedSalads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSalads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSalads, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => 
    Math.ceil(filteredSalads.length / itemsPerPage),
    [filteredSalads, itemsPerPage]
  );

  // Add helper function to check if ingredients are actually customized
  const areIngredientsCustomized = useCallback((original: SaladIngredient[], custom: SaladIngredient[]): boolean => {
    if (original.length !== custom.length) return true;
    
    // Create maps for easier comparison
    const originalMap = original.reduce((map, ing) => {
      map[ing.id] = ing.quantity;
      return map;
    }, {} as Record<string, number>);
    
    const customMap = custom.reduce((map, ing) => {
      map[ing.id] = ing.quantity;
      return map;
    }, {} as Record<string, number>);
    
    // Check if all original ingredient IDs exist in custom with same quantities
    for (const id in originalMap) {
      if (!customMap[id] || customMap[id] !== originalMap[id]) {
        return true; // Different quantity or missing ingredient
      }
    }
    
    // Check if all custom ingredient IDs exist in original
    for (const id in customMap) {
      if (!originalMap[id]) {
        return true; // New ingredient added
      }
    }
    
    return false; // No differences found
  }, []);

  // Calculate custom price
  const calculateCustomPrice = useCallback((salad: SaladsResponse, customIngredients: SaladIngredient[]) => {
    let basePrice = salad.price || 0;
    
    // Find original ingredients to calculate price difference
    const originalQuantities = Object.entries(salad.ingredients || {}).reduce((acc, [id, qty]) => {
      acc[id] = typeof qty === 'number' ? qty : 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate price adjustments for ingredient changes
    customIngredients.forEach(ing => {
      const ingredient = ingredients.find(i => i.id === ing.id);
      if (ingredient) {
        const originalQty = originalQuantities[ing.id] || 0;
        const qtyDiff = ing.quantity - originalQty;
        
        // Only charge for added ingredients
        if (qtyDiff > 0) {
          basePrice += qtyDiff * ingredient.price;
        }
      }
    });
    
    return basePrice;
  }, [ingredients]);

  const fetchSaladsFromPB = useCallback(async () => {
    try {
      const results = await pb.collection('salads').getList(1, 50, {
        filter: 'available = true',
        sort: 'display_order'
      });
      
      // Process image URLs with efficient caching strategy
      const imageUrls: Record<string, string> = {};
      
      // Pre-fetch all images in parallel for better performance
      await Promise.all(results.items.map(async (item) => {
        if (item.image) {
          try {
            const imageUrl = pb.files.getUrl(item, item.image);
            // Use the browser cache for images when possible
            const response = await fetch(imageUrl, {
              cache: 'force-cache', // Use cache first
            });
            
            if (response.ok) {
              const blob = await response.blob();
              const objectUrl = URL.createObjectURL(blob);
              imageUrls[item.id] = objectUrl;
            } else {
              imageUrls[item.id] = '/images/default-salad.jpg';
            }
          } catch (error) {
            console.error(`Error fetching image for ${item.name}:`, error);
            imageUrls[item.id] = '/images/default-salad.jpg';
          }
        } else {
          imageUrls[item.id] = '/images/default-salad.jpg';
        }
      }));
      
      // Process salad data with improved error handling
      const pbSalads = results.items.map(item => {
        // Process ingredients data with better error handling
        let ingredientsData: Record<string, number> = {};
        
        try {
          // Check if ingredients exists
          if (item.ingredients) {
            // If it's already an object, use it directly
            if (typeof item.ingredients === 'object' && !Array.isArray(item.ingredients)) {
              ingredientsData = item.ingredients as Record<string, number>;
            } 
            // If it's an array, convert to Record<string, number> format
            else if (Array.isArray(item.ingredients)) {
              ingredientsData = item.ingredients.reduce((acc, ing) => {
                if (typeof ing === 'string') {
                  acc[ing] = 1; // Default quantity
                } else if (typeof ing === 'object' && ing !== null) {
                  const ingObj = ing as { id: string; quantity: number };
                  if (ingObj.id) {
                    acc[ingObj.id] = ingObj.quantity || 1;
                  }
                }
                return acc;
              }, {} as Record<string, number>);
            }
            // If it's a string, try to parse it as JSON
            else if (typeof item.ingredients === 'string' && item.ingredients.trim()) {
              try {
                const parsed = JSON.parse(item.ingredients);
                if (Array.isArray(parsed)) {
                  ingredientsData = parsed.reduce((acc, ing) => {
                    if (typeof ing === 'string') {
                      acc[ing] = 1;
                    } else if (typeof ing === 'object' && ing !== null) {
                      const ingObj = ing as { id: string; quantity: number };
                      if (ingObj.id) {
                        acc[ingObj.id] = ingObj.quantity || 1;
                      }
                    }
                    return acc;
                  }, {} as Record<string, number>);
                } else if (typeof parsed === 'object' && parsed !== null) {
                  ingredientsData = parsed as Record<string, number>;
                }
              } catch (parseError) {
                console.error(`Error parsing ingredients for ${item.name}:`, parseError);
                // Fallback to comma-separated string parsing
                ingredientsData = item.ingredients.split(',').reduce((acc, ing) => {
                  const trimmed = ing.trim();
                  if (trimmed) {
                    acc[trimmed] = 1;
                  }
                  return acc;
                }, {} as Record<string, number>);
              }
            }
          }
        } catch (e) {
          console.error('Error processing ingredients:', e);
          ingredientsData = {};
        }
        
        // Format nutrition facts
        return {
          ...item,
          image: imageUrls[item.id] || '/images/default-salad.jpg',
          ingredients: ingredientsData,
        } as unknown as SaladsResponse; // Cast through unknown for type safety
      });
      
      return pbSalads;
    } catch (error) {
      console.error('Error fetching salads from PocketBase:', error);
      // Return empty array or fallback data if available
      return [];
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await loadDataFromAPI();
        // Convert to our own Ingredient type using convertToIngredient
        if (Array.isArray(data.ingredients) && data.ingredients.length > 0) {
          const typedIngredients = data.ingredients.map(ing => 
            convertToIngredient(ing as IngredientsResponse)
          );
          setIngredients(typedIngredients);
        } else {
          console.error('Received ingredients in wrong format');
          setIngredients([]);
        }
        
        const pbSalads = await fetchSaladsFromPB();
        if (pbSalads.length > 0) {
          setSalads(pbSalads);
          setPbError(null);
        } else {
          setSalads(staticSalads as SaladsResponse[]);
          setPbError('Could not load salads from database. Using fallback data.');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        // Add a slight delay to prevent layout jumps
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    fetchData();
  }, [fetchSaladsFromPB]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      salads.forEach(salad => {
        if (typeof salad.image === 'string' && salad.image.startsWith('blob:')) {
          URL.revokeObjectURL(salad.image);
        }
      });
    };
  }, [salads]);

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory]);

  const handleSaladClick = useCallback((salad: SaladsResponse) => {
    navigate(`/salads/${salad.id}`);
  }, [navigate]);

  const handleViewDetails = useCallback((salad: SaladsResponse) => {
    navigate(`/salads/${salad.id}`);
  }, [navigate]);

  const handleAddToCart = useCallback((salad: SaladsResponse, customIngredients?: SaladIngredient[]) => {
    // Convert ingredients to SaladIngredient array format for consistent handling
    const saladIngredients: SaladIngredient[] = Object.entries(salad.ingredients || {}).map(
      ([id, quantity]) => ({ id, quantity: Number(quantity) })
    );
    
    const isCustomized = customIngredients && areIngredientsCustomized(saladIngredients, customIngredients);
    
    // Create a properly typed CartItem
    const cartItem: Omit<CartItem, "details"> = {
      id: isCustomized ? `premade_${salad.id}` : salad.id,
      name: isCustomized ? `Custom ${salad.name}` : salad.name,
      type: 'premade',
      price: isCustomized ? calculateCustomPrice(salad, customIngredients || []) : salad.price,
      quantity: 1,
      customized: isCustomized,
      customizations: undefined, // Initialize with undefined
    };
    
    // Only add customizations if applicable
    if (isCustomized && customIngredients) {
      // Convert array to Record<string, unknown> format
      const customizationsObj: Record<string, unknown> = {};
      
      customIngredients.forEach(item => {
        customizationsObj[item.id] = { quantity: item.quantity };
      });
      
      // Now set the correctly typed customizations
      cartItem.customizations = customizationsObj;
    }
    
    addToCart(cartItem);
  }, [addToCart, areIngredientsCustomized, calculateCustomPrice]);

  // Memoized pagination handler functions
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      // Smooth scroll to top of grid
      document.getElementById('salad-grid')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      // Smooth scroll to top of grid
      document.getElementById('salad-grid')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Smooth scroll to top of grid
      document.getElementById('salad-grid')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [totalPages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 dark:from-gray-900 dark:via-emerald-950 dark:to-gray-800">
      <Header />
      
      {/* Enhanced Hero Section with Parallax Effect */}
      <div className="relative overflow-hidden h-[50vh] md:h-[60vh] lg:h-[70vh]">
        {/* Parallax Background */}
        <div className="absolute inset-0 w-full h-full scale-105">
          <motion.div 
            initial={{ y: 0 }}
            animate={{ 
              y: [0, -15, 0], 
              transition: { 
                repeat: Infinity, 
                duration: 20, 
                ease: "easeInOut" 
              }
            }}
            className="w-full h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-emerald-700/70" />
            <img 
              src={haba}
              alt="Fresh Salads" 
              className="object-cover w-full h-full filter dark:brightness-75"
              loading="eager" // Important for LCP
            />
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <motion.div 
          className="absolute w-64 h-64 rounded-full opacity-50 -top-16 -left-16 bg-emerald-700"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 10,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute rounded-full -bottom-20 -right-20 w-80 h-80 bg-emerald-600 opacity-40"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, -10, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 15,
            ease: "easeInOut" 
          }}
        />
        
        {/* Animated Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="mb-6 text-5xl font-bold text-white drop-shadow-lg md:text-6xl lg:text-7xl">
              Salad <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">Perfection</span>
            </h1>
            <p className="max-w-xl mx-auto mb-8 text-xl font-medium text-white/90 drop-shadow-md md:text-2xl">
              Handcrafted with love, freshness in every bite
            </p>
          </motion.div>
        </div>
        
        {/* Floating Food Icons - Decorative */}
        <motion.div 
          className="absolute top-1/4 left-1/4"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 4,
            ease: "easeInOut" 
          }}
        >
          <span className="text-5xl md:text-6xl drop-shadow-lg">🥑</span>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-1/4 right-1/4"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 5,
            ease: "easeInOut",
            delay: 1 
          }}
        >
          <span className="text-5xl md:text-6xl drop-shadow-lg">🍅</span>
        </motion.div>

        <motion.div 
          className="absolute bottom-1/3 left-1/3"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 15, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 6,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <span className="text-4xl md:text-5xl drop-shadow-lg">🥦</span>
        </motion.div>

        {/* Animated scroll down indicator */}
        <motion.div 
          className="absolute flex flex-col items-center transform -translate-x-1/2 cursor-pointer bottom-8 left-1/2"
          animate={{ 
            y: [0, 10, 0] 
          }}
          transition={{ 
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut" 
          }}
          onClick={() => document.getElementById('experience-selector')?.scrollIntoView({ behavior: 'smooth' })}
        >
            <div className="hidden mb-2 text-sm font-medium text-white sm:block md:text-base">Scroll Down</div>
            <div className="flex items-center justify-center px-2 py-1 mb-2 text-xs font-medium text-white rounded-full bg-white/20 backdrop-blur-sm sm:hidden">
            <motion.span
              animate={{ y: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Swipe Down
            </motion.span>
            </div>
          <div className="flex justify-center w-6 h-10 pt-2 border-2 border-white rounded-full">
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ 
                y: [0, 8, 0] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5, 
                ease: "easeInOut" 
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Experience Selection - Enhanced Tab Selector with Animations */}
      <div id="experience-selector" className="py-12 text-center bg-white shadow-lg dark:bg-gray-800">
        <div className="container px-4 mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-2xl font-semibold text-gray-800 md:text-3xl dark:text-white"
          >
            Choose Your Experience
          </motion.h2>
          
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <motion.button 
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('premade')}
              className={`relative flex flex-col items-center w-full max-w-xs p-8 transition-all rounded-2xl sm:w-72 ${
                activeTab === 'premade' 
                  ? 'bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-500 shadow-xl dark:from-emerald-900 dark:to-emerald-800 dark:border-emerald-600' 
                  : 'bg-gray-50 border-2 border-transparent hover:border-emerald-200 dark:bg-gray-700 dark:hover:border-emerald-700'
              }`}
            >
              <div className="mb-4 text-6xl">🥗</div>
              <h3 className="mb-3 text-2xl font-bold text-gray-800 dark:text-white">Chef-Crafted Salads</h3>
              <p className="text-gray-600 dark:text-gray-300">Explore our delicious signature creations</p>
              {activeTab === 'premade' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 w-12 h-1 rounded-full bg-emerald-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('custom')}
              className={`relative flex flex-col items-center w-full max-w-xs p-8 transition-all rounded-2xl sm:w-72 ${
                activeTab === 'custom' 
                  ? 'bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-500 shadow-xl dark:from-emerald-900 dark:to-emerald-800 dark:border-emerald-600' 
                  : 'bg-gray-50 border-2 border-transparent hover:border-emerald-200 dark:bg-gray-700 dark:hover:border-emerald-700'
              }`}
            >
              <div className="mb-4 text-6xl">👨‍🍳</div>
              <h3 className="mb-3 text-2xl font-bold text-gray-800 dark:text-white">Create Your Own</h3>
              <p className="text-gray-600 dark:text-gray-300">Customize every ingredient to your taste</p>
              {activeTab === 'custom' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 w-12 h-1 rounded-full bg-emerald-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container px-4 py-12 mx-auto lg:py-16">
        {/* Loading State with Improved Animation */}
        <AnimatePresence>
          {isLoading && <LoadingSpinner />}
        </AnimatePresence>
        
        {!isLoading && (
          <>
            {pbError && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 mb-8 text-center border rounded-lg border-amber-200 text-amber-800 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800/30"
              >
                <p>{pbError}</p>
              </motion.div>
            )}
            
            {activeTab === 'premade' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl lg:text-5xl dark:text-white">
                    Our Signature <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-400 dark:from-emerald-400 dark:to-green-300">Salads</span>
                  </h2>
                  <p className="max-w-2xl mx-auto text-gray-600 md:text-lg dark:text-gray-300">
                    Carefully crafted combinations that delight your taste buds while nourishing your body
                  </p>
                </div>
                
                {/* Enhanced Category Filters */}
                {categories.length > 1 && (
                  <div className="mb-8 overflow-x-auto md:mb-12 scrollbar-hide">
                    <div className="flex justify-center gap-2 pb-2 min-w-max">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setCurrentCategory(category)}
                          className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all md:text-base ${
                            currentCategory === category
                              ? 'bg-emerald-600 text-white dark:bg-emerald-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Salad Grid with Pagination */}
                <div id="salad-grid">
                  {filteredSalads.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-12 text-center rounded-xl bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="mb-4 text-5xl">😕</div>
                      <h3 className="mb-2 text-xl font-medium text-gray-700 dark:text-gray-200">No salads found</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        We couldn't find any salads in this category. Please try another category.
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <SaladGrid
                        salads={paginatedSalads}
                        handleAddToCart={handleAddToCart}
                        onSaladClick={handleSaladClick}
                        onViewDetails={handleViewDetails}
                      />
                      
                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex justify-center mt-12">
                          <nav className="flex items-center gap-1">
                            <button
                              onClick={goToPrevPage}
                              disabled={currentPage === 1}
                              className="flex items-center justify-center w-10 h-10 text-gray-600 transition-colors bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <ChevronLeft size={18} />
                            </button>
                            
                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => (
                                  page === 1 || 
                                  page === totalPages || 
                                  (page >= currentPage - 1 && page <= currentPage + 1)
                                ))
                                .map((page, index, array) => (
                                  <React.Fragment key={page}>
                                    {index > 0 && array[index - 1] !== page - 1 && (
                                      <span className="px-2 text-gray-400 dark:text-gray-500">...</span>
                                    )}
                                    <button
                                      onClick={() => goToPage(page)}
                                      className={`w-10 h-10 rounded-lg transition-colors ${
                                        currentPage === page 
                                          ? 'bg-emerald-600 text-white dark:bg-emerald-700' 
                                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  </React.Fragment>
                                ))}
                            </div>
                            
                            <button
                              onClick={goToNextPage}
                              disabled={currentPage === totalPages}
                              className="flex items-center justify-center w-10 h-10 text-gray-600 transition-colors bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <ChevronRight size={18} />
                            </button>
                          </nav>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'custom' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center py-16">
                    <Loader className="w-10 h-10 text-emerald-600 animate-spin" />
                  </div>
                }>
                  <SaladBuilder />
                </Suspense>
              </motion.div>
            )}
          </>
        )}
      </main>
      
      {/* Enhanced Inspirational Quote Section with Parallax */}
      <div className="relative py-20 overflow-hidden text-white bg-emerald-900 dark:bg-emerald-950">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M0,0 C30,20 70,20 100,0 L100,100 L0,100 Z"
              fill="currentColor"
              animate={{
                d: [
                  "M0,0 C30,20 70,20 100,0 L100,100 L0,100 Z",
                  "M0,0 C20,40 80,40 100,0 L100,100 L0,100 Z",
                  "M0,0 C30,20 70,20 100,0 L100,100 L0,100 Z",
                ]
              }}
              transition={{
                repeat: Infinity,
                duration: 20,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>
        
        <div className="container relative px-4 mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
            >
              <p className="mb-6 text-2xl italic font-light md:text-3xl text-emerald-100">
                "Eating is not merely a material pleasure. Eating well gives a spectacular joy to life and contributes immensely to goodwill and happy companionship."
              </p>
              <p className="text-lg font-medium md:text-xl text-emerald-300">— Elsa Schiaparelli</p>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-20 h-20 rounded-full opacity-20 bg-emerald-300" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-10 bg-emerald-200" />
      </div>
      
      {/* Features Highlight */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl dark:text-white"
            >
              Why Choose Our Salads?
            </motion.h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
              We're committed to delivering the freshest ingredients for a healthier you
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🌱",
                title: "Fresh Ingredients",
                description: "All produce is sourced locally and delivered daily for maximum freshness"
              },
              {
                icon: "🥗",
                title: "Nutritionally Balanced",
                description: "Our recipes are designed by nutritionists for optimal health benefits"
              },
              {
                icon: "🌎",
                title: "Eco-Friendly",
                description: "Sustainable packaging and practices to reduce environmental impact"
              },
              {
                icon: "⏱️",
                title: "Quick & Convenient",
                description: "Ready in minutes, perfect for your busy lifestyle"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 text-center bg-white border shadow-sm rounded-xl dark:bg-gray-700 dark:border-gray-600"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl rounded-full bg-emerald-100 dark:bg-emerald-900">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Newsletter Sign-up */}
      <div className="py-16 text-white bg-gradient-to-br from-emerald-700 to-green-600 dark:from-emerald-900 dark:to-emerald-700">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Stay Updated</h2>
              <p className="mb-8 text-emerald-100">
                Subscribe to our newsletter for seasonal menu updates, special offers, and nutrition tips
              </p>
              <div className="flex flex-col items-stretch gap-3 mx-auto sm:flex-row sm:max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-3 text-gray-800 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:bg-gray-100"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 font-medium text-white transition-colors rounded-lg bg-emerald-900 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  Subscribe
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}