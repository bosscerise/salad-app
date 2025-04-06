import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import SaladBuilder from './components/SaladBuilder';
import { loadDataFromAPI, salads as staticSalads } from './data';
// import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import { Salad, Ingredient, SaladIngredient } from './types';
import { pb } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Components
import SaladGrid from './components/SaladGrid';
import LoadingSpinner from './components/LoadingSpinner';

const url = "https://597d-2a09-bac5-3071-1a78-00-2a3-17.ngrok-free.app";

// Main component
export default function MenuPage() {
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [activeTab, setActiveTab] = useState<'premade' | 'custom'>('premade');
  const [salads, setSalads] = useState<Salad[]>([]);
  const [pbError, setPbError] = useState<string | null>(null);

  // Hooks
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const fetchSaladsFromPB = async () => {
    try {
      const results = await pb.collection('salads').getList(1, 50, {
        filter: 'available = true',
        sort: 'display_order'
      });
      
      // Process image URLs first to avoid repetitive fetches
      const imageUrls: Record<string, string> = {};
      
      // Pre-fetch all images with proper headers
      await Promise.all(results.items.map(async (item) => {
        if (item.image) {
          try {
            const imageUrl = `${url}/api/files/${item.collectionId}/${item.id}/${item.image}`;
            const response = await fetch(imageUrl, {
              headers: {
                'ngrok-skip-browser-warning': 'true'
              }
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
      
      // Robust parsing of salad data
      const pbSalads = results.items.map(item => {
        // Process ingredients data with better error handling
        let ingredientsData = [];
        
        try {
          // Check if ingredients exists
          if (item.ingredients) {
            // If it's already an array, use it directly
            if (Array.isArray(item.ingredients)) {
              ingredientsData = item.ingredients;
            } 
            // If it's a string, try to parse it as JSON
            else if (typeof item.ingredients === 'string' && item.ingredients.trim()) {
              // First check if it looks like JSON
              if (item.ingredients.trim().startsWith('[') || item.ingredients.trim().startsWith('{')) {
                try {
                  ingredientsData = JSON.parse(item.ingredients);
                } catch (parseError) {
                  console.error(`Error parsing ingredients for ${item.name}:`, parseError);
                  // Fallback to comma-separated string parsing
                  ingredientsData = item.ingredients.split(',').map(ing => ({
                    id: ing.trim(),
                    quantity: 1
                  }));
                }
              } else {
                // Handle as comma-separated string
                ingredientsData = item.ingredients.split(',').map(ing => ({
                  id: ing.trim(),
                  quantity: 1
                }));
              }
            } else if (typeof item.ingredients === 'object') {
              // Handle object format (key-value pairs)
              ingredientsData = Object.entries(item.ingredients).map(([id, qty]) => ({
                id,
                quantity: typeof qty === 'number' ? qty : 1
              }));
            }
          }
        } catch (e) {
          console.error('Error processing ingredients:', e);
          ingredientsData = [];
        }
        
        // Format nutrition facts
        const nutritionFacts = {
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fats: item.fats || 0
        };

        return {
          id: item.id,
          name: item.name || 'Unnamed Salad',
          description: item.description || 'No description available',
          price: item.price || 0,
          image: imageUrls[item.id] || '/images/default-salad.jpg',
          calories: item.calories || 0,
          category: item.category || 'featured',
          tags: Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags.toString()] : []),
          ingredients: ingredientsData,
          nutritionFacts,
          prepTime: item.prep_time || 5
        };
      });
      
      return pbSalads;
    } catch (error) {
      console.error('Error fetching salads from PocketBase:', error);
      // Return empty array or fallback data if available
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await loadDataFromAPI();
        // Check if data.ingredients is of type Ingredient[]
        if (Array.isArray(data.ingredients) && data.ingredients.length > 0 && 'price' in data.ingredients[0]) {
          setIngredients(data.ingredients as Ingredient[]);
        } else {
          console.error('Received ingredients in wrong format');
          setIngredients([]);
        }
        const pbSalads = await fetchSaladsFromPB();
        if (pbSalads.length > 0) {
          setSalads(pbSalads);
          setPbError(null);
        } else {
          setSalads(staticSalads);
          setPbError('Could not load salads from database. Using fallback data.');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      // Clean up any object URLs to prevent memory leaks
      salads.forEach(salad => {
        if (salad.image && salad.image.startsWith('blob:')) {
          URL.revokeObjectURL(salad.image);
        }
      });
    };
  }, [salads]);

  const handleSaladClick = (salad: Salad) => {
    navigate(`/salads/${salad.id}`);
  };

  const handleViewDetails = (salad: Salad) => {
    navigate(`/salads/${salad.id}`);
  };

  const handleAddToCart = (salad: Salad, customIngredients?: SaladIngredient[]) => {
    // Only consider it customized if custom ingredients are provided AND different from original
    // Convert string ingredients to SaladIngredient objects
    const saladIngredients: SaladIngredient[] = Array.isArray(salad.ingredients) 
      ? salad.ingredients.map(ing => typeof ing === 'string' 
          ? { id: ing, quantity: 1 } 
          : ing as SaladIngredient)
      : [];
    
    const isCustomized = customIngredients && areIngredientsCustomized(saladIngredients, customIngredients);
    
    addToCart({
      id: isCustomized ? `premade_${salad.id}` : salad.id.toString(),
      name: isCustomized ? `Custom ${salad.name}` : salad.name,
      price: isCustomized 
        ? calculateCustomPrice(salad, customIngredients) 
        : salad.price,
      quantity: 1,
      type: 'premade',
      customizations: {
        ...(isCustomized ? { ingredients: customIngredients } : {}),
        image: salad.image
      }
    });
  };

  // Add helper function to check if ingredients are actually customized
  const areIngredientsCustomized = (original: SaladIngredient[], custom: SaladIngredient[]): boolean => {
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
  };

  // Add a helper function to calculate custom price
  const calculateCustomPrice = (salad: Salad, customIngredients: SaladIngredient[]) => {
    let basePrice = salad.price;
    
    // Find original ingredients to calculate price difference
    const originalQuantities = salad.ingredients.reduce((acc, ing) => {
      if (typeof ing === 'string') {
        acc[ing] = 1; // Default quantity for string ingredients
      } else {
        const saladIng = ing as SaladIngredient;
        acc[saladIng.id] = saladIng.quantity;
      }
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      <Header />
      
      {/* Hero Section with Animated Elements */}
      <div className="relative overflow-hidden bg-emerald-800 h-72 md:h-96">
        {/* Decorative Elements */}
        <div className="absolute w-64 h-64 rounded-full opacity-50 -top-16 -left-16 bg-emerald-700"></div>
        <div className="absolute rounded-full -bottom-20 -right-20 w-80 h-80 bg-emerald-600 opacity-40"></div>
        
        {/* Main Image with Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/60 to-emerald-700/60"></div>
        <img 
          src="/images/hero.jpeg" 
          alt="Fresh Salads" 
          className="object-cover w-full h-full"
        />
        
        {/* Animated Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-6 text-5xl font-bold text-white drop-shadow-md md:text-6xl">
              Salad <span className="text-green-300">Perfection</span>
            </h1>
            <p className="max-w-xl mx-auto mb-8 text-xl font-medium text-white/90 drop-shadow-sm">
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
          <span className="text-4xl">🥑</span>
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
          <span className="text-4xl">🍅</span>
        </motion.div>
      </div>

      {/* Experience Selection - Simplified Tab Selector */}
      <div className="py-10 text-center bg-white shadow-sm">
        <div className="container px-4 mx-auto">
          <h2 className="mb-8 text-2xl font-semibold text-gray-800">Choose Your Experience</h2>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('premade')}
              className={`relative flex flex-col items-center w-full max-w-xs p-6 transition-all rounded-2xl sm:w-72 ${
                activeTab === 'premade' 
                  ? 'bg-emerald-50 border-2 border-emerald-500 shadow-md' 
                  : 'bg-gray-50 border-2 border-transparent hover:border-emerald-200'
              }`}
            >
              <div className="mb-4 text-5xl">🥗</div>
              <h3 className="mb-2 text-xl font-bold text-gray-800">Chef-Crafted Salads</h3>
              <p className="text-sm text-gray-600">Explore our delicious signature creations</p>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('custom')}
              className={`relative flex flex-col items-center w-full max-w-xs p-6 transition-all rounded-2xl sm:w-72 ${
                activeTab === 'custom' 
                  ? 'bg-emerald-50 border-2 border-emerald-500 shadow-md' 
                  : 'bg-gray-50 border-2 border-transparent hover:border-emerald-200'
              }`}
            >
              <div className="mb-4 text-5xl">👨‍🍳</div>
              <h3 className="mb-2 text-xl font-bold text-gray-800">Create Your Own</h3>
              <p className="text-sm text-gray-600">Customize every ingredient to your taste</p>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container px-4 py-12 mx-auto">
        {/* Loading State */}
        <AnimatePresence>
          {isLoading && <LoadingSpinner />}
        </AnimatePresence>
        
        {!isLoading && (
          <>
            {pbError && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 mb-8 text-center rounded-lg text-amber-800 bg-amber-100"
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
                  <h2 className="mb-4 text-3xl font-bold text-gray-800">Our Signature Salads</h2>
                  <p className="max-w-2xl mx-auto text-gray-600">
                    Carefully crafted combinations that delight your taste buds while nourishing your body
                  </p>
                </div>
                
                <SaladGrid
                  salads={salads}
                  handleAddToCart={handleAddToCart}
                  onSaladClick={handleSaladClick}
                  onViewDetails={handleViewDetails}
                />
              </motion.div>
            )}
            
            {activeTab === 'custom' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SaladBuilder 
                />
              </motion.div>
            )}
          </>
        )}
      </main>
      
      {/* Inspirational Quote Section */}
      <div className="py-16 text-white bg-emerald-900">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <p className="mb-6 text-2xl italic font-light text-emerald-100">
                "Eating is not merely a material pleasure. Eating well gives a spectacular joy to life and contributes immensely to goodwill and happy companionship."
              </p>
              <p className="text-lg font-medium text-emerald-300">— Elsa Schiaparelli</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}