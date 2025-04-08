import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import Header from '../../components/Header';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { pb } from '../../services/api';
import { Salad } from '../Menu/types';
import { useIngredients } from '../../hooks/useIngredients';
import { menuCategoryFromId, areIngredientsCustomized } from './utils';

export default function SaladDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { ingredients: allIngredients } = useIngredients();
  
  const [salad, setSalad] = useState<ExtendedSalad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedSalads, setRelatedSalads] = useState<Salad[]>([]);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition'>('description');

  const url = "https://7793d9d384730dd5acb7be839c71587b.serveo.net"

  interface SaladIngredient {
    id: string;
    name: string;
    quantity: number;
    price: number;
    emoji?: string;
  }

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customizedIngredients, setCustomizedIngredients] = useState<SaladIngredient[]>([]);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [customPrice, setCustomPrice] = useState(0);
  const [isCustomized, setIsCustomized] = useState(false);

  interface NutrientInfo {
    name: string;
    value: string;
  }

  interface ExtendedSalad extends Omit<Salad, 'ingredients'> {
    ingredients: (string | { id: string; quantity?: number })[];
    additionalNutrients?: NutrientInfo[];
    story?: string;
    prepTime?: number;
    servingSize?: string;
  }

  const customizationRef = useRef<HTMLDivElement>(null);

  const toggleCustomization = () => {
    const newState = !isCustomizing;
    setIsCustomizing(newState);
    
    if (newState) {
      setTimeout(() => {
        customizationRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate('/menu');
      return;
    }

    window.scrollTo(0, 0);

    fetchSaladData();
  }, [id, navigate, user]);

  useEffect(() => {
    if (salad?.ingredients && allIngredients?.length > 0) {
      try {
        const processed: SaladIngredient[] = [];
        
        for (const ingredient of salad.ingredients) {
          let ingId: string;
          let ingQty: number = 1;
          
          if (typeof ingredient === 'string') {
            ingId = ingredient;
          } else if (ingredient && typeof ingredient === 'object') {
            // Type assertion to handle mixed ingredient types
            const ingredientObj = ingredient as { id?: string; quantity?: number };
            ingId = ingredientObj.id || '';
            ingQty = ingredientObj.quantity || 1;
          } else {
            continue;
          }
          
          const ingredientDetails = allIngredients.find(i => i.id === ingId);
          
          if (ingredientDetails) {
            processed.push({
              id: ingId,
              name: ingredientDetails.name,
              quantity: ingQty,
              price: ingredientDetails.price,
              emoji: ingredientDetails.emoji || '🥬'
            });
          }
        }
        
        setCustomizedIngredients(processed);
        setOriginalPrice(salad.price);
        setCustomPrice(salad.price);
      } catch (error) {
        console.error('Error processing ingredients:', error);
      }
    }
  }, [salad, allIngredients]);

  interface PocketBaseRecord {
    collectionId: string;
    id: string;
  }

  const getImageURL = async (record: PocketBaseRecord, image: string): Promise<string> => {
    try {
      if (image.startsWith('http')) return image;
      
      if (record && image) {
        const imageUrl = `${url}/api/files/${record.collectionId}/${record.id}/${image}`;
        try {
          const response = await fetch(imageUrl)
          
          if (!response.ok) throw new Error('Failed to fetch image');
          
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        } catch (error) {
          console.error('Error fetching image:', error);
          return '/images/default-salad.jpg';
        }
      }
      
      return `/images/${image || 'default-salad.jpg'}`;
    } catch (error) {
      console.error('Error creating image URL:', error);
      return '/images/default-salad.jpg';
    }
  };

  const fetchSaladData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const isNumericId = !isNaN(Number(id));
      let saladData: ExtendedSalad | null = null;
      let relatedItems: Salad[] = [];
      
      try {
        const record = await pb.collection('salads').getOne(id || '');
        type SaladIngredientInput = string | { id: string; quantity?: number };
        let ingredientsArray: SaladIngredientInput[] = [];
        
        if (typeof record.ingredients === 'string') {
          ingredientsArray = record.ingredients.split(',').map(item => item.trim());
        } else if (Array.isArray(record.ingredients)) {
          ingredientsArray = record.ingredients;
        } else {
          ingredientsArray = [record.ingredients?.toString() || 'Mixed Ingredients'];
        }
        
        const imageUrl = record.image 
          ? await getImageURL(record, record.image)
          : '/images/default-salad.jpg';
          
        saladData = {
          id: record.id,
          name: record.name || 'Unnamed Salad',
          description: record.description || 'No description available',
          price: record.price || 0,
          image: imageUrl,
          calories: record.calories || 0,
          category: record.category || 'featured',
          tags: Array.isArray(record.tags) ? record.tags : (record.tags ? [record.tags.toString()] : []),
          ingredients: ingredientsArray as SaladIngredientInput[],
          nutritionFacts: {
            protein: record.protein || 0,
            carbs: record.carbs || 0,
            fats: record.fats || 0
          },
          additionalNutrients: record.additional_nutrients 
            ? (typeof record.additional_nutrients === 'string' 
                ? JSON.parse(record.additional_nutrients) 
                : record.additional_nutrients)
            : [],
          prepTime: record.prep_time || 5,
          servingSize: record.serving_size || '1 salad (400g)',
        };
        
        try {
          const relatedRecords = await pb.collection('salads').getList(1, 4, {
            filter: `id != "${saladData?.id}" && category = "${saladData?.category}" && available = true`,
            sort: '-created'
          });
          
          const processedRelatedItems = await Promise.all(relatedRecords.items.map(async (item) => {
            let ingredientsArr: string[] = [];
            if (typeof item.ingredients === 'string') {
              ingredientsArr = item.ingredients.split(',').map(i => i.trim());
            } else if (Array.isArray(item.ingredients)) {
              ingredientsArr = item.ingredients;
            } else {
              ingredientsArr = [item.ingredients?.toString() || 'Mixed Ingredients'];
            }
            
            const relatedImageUrl = item.image 
              ? await getImageURL(item, item.image)
              : '/images/default-salad.jpg';
              
            return {
              id: item.id,
              name: item.name || 'Unnamed Salad',
              description: item.description || 'No description available',
              price: item.price || 0,
              image: relatedImageUrl,
              calories: item.calories || 0,
              category: item.category || 'featured',
              tags: Array.isArray(item.tags) ? item.tags : 
                   (item.tags ? [item.tags.toString()] : []),
              ingredients: ingredientsArr,
              nutritionFacts: {
                protein: item.protein || 0,
                carbs: item.carbs || 0,
                fats: item.fats || 0
              }
            };
          }));
          
          relatedItems = processedRelatedItems;
          
        } catch (relatedError) {
          console.log('Error fetching related salads from PocketBase:', relatedError);
        }
      } catch (pbError: unknown) {
        if (isNumericId) {
          console.log('PocketBase fetch failed, trying static data:', pbError);
          const staticSalads = await import('../Menu/data').then(module => module.salads);
          const fallbackSalad = staticSalads.find(s => String(s.id) === id);
          
          if (fallbackSalad) {
            console.log('Using fallback static data for ID:', id);
            saladData = fallbackSalad;
            
            const sameCategorySalads = staticSalads
              .filter(s => s.id !== fallbackSalad.id && s.category === fallbackSalad.category)
              .slice(0, 4);
            
            let additionalSalads: Salad[] = [];
            if (sameCategorySalads.length < 4) {
              additionalSalads = staticSalads
                .filter(s => s.id !== fallbackSalad.id && s.category !== fallbackSalad.category)
                .slice(0, 4 - sameCategorySalads.length);
            }
            
            relatedItems = [...sameCategorySalads, ...additionalSalads];
          } else {
            throw new Error("Salad not found in static data");
          }
        } else {
          console.error("PocketBase error and no static fallback available:", pbError);
          throw new Error("Salad not found");
        }
      }
      
      if (saladData) {
        setSalad(saladData);
        setRelatedSalads(relatedItems);
      }
    } catch (error: unknown) {
      console.error('Error fetching salad data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching salad data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (salad?.image && typeof salad.image === 'string' && salad.image.startsWith('blob:')) {
        URL.revokeObjectURL(salad.image);
      }
      
      relatedSalads.forEach(relatedSalad => {
        if (relatedSalad.image && relatedSalad.image.startsWith('blob:')) {
          URL.revokeObjectURL(relatedSalad.image);
        }
      });
    };
  }, [salad, relatedSalads]);

  const handleAddToCart = () => {
    if (salad) {
      try {
        addToCart({
          id: `premade_${salad.id}`,
          name: salad.name,
          price: salad.price,
          quantity: quantity,
          type: 'premade',
          customizations: {}
        });
        
        alert(`${quantity} × ${salad.name} added to your cart!`);
      } catch (err: unknown) {
        console.error('Error adding to cart:', err);
        alert('Sorry, there was a problem adding this item to your cart. Please try again.');
      }
    }
  };

  const handleIncrementIngredient = (ingredientId: string) => {
    setCustomizedIngredients(prev => {
      const existing = prev.find(item => item.id === ingredientId);
      const newIngredients = existing
        ? prev.map(item => item.id === ingredientId ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { 
            id: ingredientId, 
            quantity: 1, 
            name: allIngredients?.find(i => i.id === ingredientId)?.name || '', 
            price: allIngredients?.find(i => i.id === ingredientId)?.price || 0 
          }];
      
      if (salad) {
        try {
          setIsCustomized(areIngredientsCustomized(salad.ingredients, newIngredients));
        } catch (error) {
          console.error('Error checking customization:', error);
          setIsCustomized(true);
        }
      }
      return newIngredients;
    });
    updateCustomPrice();
  };

  const handleDecrementIngredient = (ingredientId: string) => {
    setCustomizedIngredients(prev => {
      const existing = prev.find(item => item.id === ingredientId);
      let newIngredients;
      
      if (existing && existing.quantity > 1) {
        newIngredients = prev.map(item => 
          item.id === ingredientId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        newIngredients = prev.filter(item => item.id !== ingredientId);
      }
      
      if (salad) {
        try {
          setIsCustomized(areIngredientsCustomized(salad.ingredients, newIngredients));
        } catch (error) {
          console.error('Error checking customization:', error);
          setIsCustomized(true);
        }
      }
      return newIngredients;
    });
    updateCustomPrice();
  };

  const updateCustomPrice = useCallback(() => {
    if (!salad || !allIngredients) return;
    
    let newPrice = originalPrice;
    
    try {
      const originalIngredientsMap = new Map<string, number>();
      
      interface IngredientItem {
        id: string;
        quantity?: number;
      }
      
      for (const ing of salad.ingredients) {
        const id = typeof ing === 'object' && ing !== null ? (ing as IngredientItem).id : ing;
        const qty = typeof ing === 'object' && ing !== null ? (ing as IngredientItem).quantity || 1 : 1;
        originalIngredientsMap.set(id, qty);
      }
      
      for (const customIng of customizedIngredients) {
        const originalQty = originalIngredientsMap.get(customIng.id) || 0;
        if (customIng.quantity > originalQty) {
          const ingredient = allIngredients.find(i => i.id === customIng.id);
          if (ingredient) {
            newPrice += ingredient.price * (customIng.quantity - originalQty);
          }
        }
      }
      
      setCustomPrice(newPrice);
    } catch (error) {
      console.error('Error updating custom price:', error);
      setCustomPrice(originalPrice);
    }
  }, [customizedIngredients, salad, allIngredients, originalPrice]);
  
  useEffect(() => {
    updateCustomPrice();
  }, [customizedIngredients, updateCustomPrice]);

  const renderIngredient = (ingredient: string | { id?: string; name?: string; quantity?: number }, index: number) => {
    let ingredientId = '';
    let ingredientName = '';
    let quantity = 1;
    
    if (typeof ingredient === 'string') {
      ingredientId = ingredient;
    } else if (typeof ingredient === 'object') {
      ingredientId = ingredient.id || '';
      ingredientName = ingredient.name || '';
      quantity = ingredient.quantity || 1;
    }
    
    const ingredientDetails = allIngredients?.find(i => 
      i.id === ingredientId || i.name.toLowerCase() === ingredientName.toLowerCase()
    );
    
    return (
      <div 
        key={`ingredient-${index}-${ingredientId || ingredientName}`}
        className="flex items-center p-3 rounded-lg bg-green-50"
      >
        <div className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-full">
          <span className="text-xl text-green-800">
            {ingredientDetails?.emoji || '🌿'}
          </span>
        </div>
        <div>
          <span className="text-gray-800">
            {ingredientDetails?.name || ingredientName}
          </span>
          {quantity > 1 && (
            <span className="ml-1 text-sm text-gray-500">×{quantity}</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="border-4 rounded-full w-14 h-14 border-emerald-200 border-t-emerald-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error && !salad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
        <Header />
        <div className="container px-4 py-16 mx-auto text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-800">Error Loading Salad</h1>
          <p className="max-w-lg mx-auto mb-8 text-gray-600">{error}</p>
          <button 
            onClick={() => navigate('/menu')}
            className="inline-flex items-center gap-2 px-6 py-3 text-white transition-colors rounded-lg shadow-sm bg-emerald-600 hover:bg-emerald-700"
          >
            <ArrowLeft size={20} />
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (!salad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
        <Header />
        <div className="container px-4 py-16 mx-auto text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-800">Salad Not Found</h1>
          <p className="max-w-lg mx-auto mb-8 text-gray-600">We couldn't find the salad you're looking for. It might have been removed or the URL is incorrect.</p>
          <button 
            onClick={() => navigate('/menu')}
            className="inline-flex items-center gap-2 px-6 py-3 text-white transition-colors rounded-lg shadow-sm bg-emerald-600 hover:bg-emerald-700"
          >
            <ArrowLeft size={20} />
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      <Header />
      
      <div className="container px-4 py-6 mx-auto">
        <nav className="mb-6 text-sm text-gray-500">
          <ol className="flex items-center space-x-2">
            <li>
              <button onClick={() => navigate('/')} className="hover:text-emerald-600">Home</button>
            </li>
            <li className="flex items-center space-x-2">
              <span>/</span>
              <button onClick={() => navigate('/menu')} className="hover:text-emerald-600">Menu</button>
            </li>
            <li className="flex items-center space-x-2">
              <span>/</span>
              <span className="text-gray-800">{salad.name}</span>
            </li>
          </ol>
        </nav>
        
        <div className="mb-10 overflow-hidden bg-white border shadow-xl rounded-2xl border-emerald-100">
          <div className="flex flex-col lg:flex-row">
            <div className="relative lg:w-1/2">
              <img 
                src={typeof salad.image === 'string' ? salad.image : '/images/default-salad.jpg'} 
                alt={salad.name}
                className="w-full h-64 md:h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute px-3 py-1.5 text-sm font-medium text-white rounded-full top-4 left-4 bg-emerald-600 backdrop-blur-sm shadow-md">
                {menuCategoryFromId(salad.category)}
              </div>
              
              <motion.div 
                className="absolute text-4xl bottom-4 right-4"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut" 
                }}
              >
                🥑
              </motion.div>
            </div>
            
            <div className="flex flex-col p-6 sm:p-8 lg:w-1/2">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-800 sm:text-4xl">{salad.name}</h1>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {salad.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="mb-6 text-lg leading-relaxed text-gray-600">{salad.description}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-4 text-center border border-green-100 shadow-sm rounded-xl bg-green-50"
                >
                  <p className="text-2xl font-bold text-gray-800">{salad.calories}</p>
                  <p className="text-sm font-medium text-gray-600">calories</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-4 text-center border border-blue-100 shadow-sm rounded-xl bg-blue-50"
                >
                  <p className="text-2xl font-bold text-gray-800">{salad.nutritionFacts.protein}g</p>
                  <p className="text-sm font-medium text-gray-600">protein</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center justify-center p-4 border shadow-sm rounded-xl bg-amber-50 border-amber-100"
                >
                  <span className="text-sm font-medium text-gray-700">{(salad as ExtendedSalad).prepTime || 5} min</span>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 mb-6 text-white shadow-md bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl"
              >
                <div className="flex items-center">
                  <div className="mr-4 text-3xl">👨‍🍳</div>
                  <div>
                    <h3 className="text-lg font-bold">Make It Your Own!</h3>
                    <p className="text-emerald-100">Customize this salad to match your perfect taste</p>
                  </div>
                </div>
                <button
                  onClick={toggleCustomization}
                  className="w-full py-2 mt-3 font-medium transition-all transform bg-white rounded-lg shadow-sm text-emerald-600 hover:bg-emerald-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isCustomizing ? 'Hide Customization' : 'Customize Ingredients'}
                </button>
              </motion.div>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-emerald-700">${isCustomizing && isCustomized ? customPrice.toFixed(2) : salad.price.toFixed(2)}</span>
                  
                  <div className="flex items-center overflow-hidden border-2 border-gray-300 rounded-lg">
                    <motion.button
                      whileHover={{ backgroundColor: "#e5e7eb" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-700 transition-colors bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </motion.button>
                    <span className="px-6 py-2 text-base font-medium text-gray-800">{quantity}</span>
                    <motion.button
                      whileHover={{ backgroundColor: "#e5e7eb" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-700 transition-colors bg-gray-100"
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (isCustomizing && isCustomized) {
                      addToCart({
                        id: String(salad.id),
                        name: `Custom ${salad.name}`,
                        price: customPrice,
                        quantity: quantity,
                        type: 'premade',
                        customizations: { ingredients: customizedIngredients }
                      });
                    } else {
                      handleAddToCart();
                    }
                  }}
                  className="flex items-center justify-center w-full px-6 py-4 font-medium text-white transition-colors shadow-md bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-xl"
                >
                  Add to Cart - ${(isCustomizing && isCustomized) ? (customPrice * quantity).toFixed(2) : (salad.price * quantity).toFixed(2)}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-10 bg-white border shadow-xl rounded-2xl border-emerald-100">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                className={`px-6 py-4 text-base font-medium border-b-2 ${
                  activeTab === 'description'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description & Ingredients
              </button>
              <button
                className={`px-6 py-4 text-base font-medium border-b-2 ${
                  activeTab === 'nutrition'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('nutrition')}
              >
                Nutrition Facts
              </button>
            </nav>
          </div>
          
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-8">
                    <h2 className="mb-4 text-2xl font-bold text-gray-800">About This Salad</h2>
                    <p className="mb-4 leading-relaxed text-gray-600">
                      {(salad as ExtendedSalad).story || 
                        `The ${salad.name} salad was inspired by our chef's travels through the Mediterranean coast. 
                        Created with freshness in mind, we source our ingredients locally whenever possible.
                        
                        Each ingredient is carefully selected to create a perfect balance of flavors and textures, 
                        making this salad not just a meal, but an experience that nourishes both body and soul.`
                      }
                    </p>
                  </div>
                  
                  <div>
                    <h2 className="mb-6 text-2xl font-bold text-gray-800">Ingredients</h2>
                    
                    <div>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {salad.ingredients?.map((ingredient, index) => 
                          renderIngredient(ingredient, index)
                        )}
                      </div>
                    </div>

                    {isCustomizing && (
                      <motion.div
                        ref={customizationRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 mt-8 border-2 rounded-xl border-emerald-200 bg-emerald-50"
                      >
                        <h3 className="mb-4 text-xl font-bold text-emerald-800">Customize Your Salad</h3>
                        
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                          {customizedIngredients.map(ingredient => (
                            <motion.div 
                              key={ingredient.id}
                              whileHover={{ y: -5 }}
                              className="flex flex-col items-center p-4 bg-white border shadow-sm rounded-xl border-emerald-100"
                            >
                              <span className="mb-2 text-2xl">{ingredient.emoji || '🥗'}</span>
                              <span className="mb-1 font-medium text-center">{ingredient.name || 'Ingredient'}</span>
                              
                              <div className="flex items-center mt-3">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDecrementIngredient(ingredient.id)}
                                  className="flex items-center justify-center w-8 h-8 text-white rounded-full bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <Minus size={16} />
                                </motion.button>
                                <span className="w-10 font-bold text-center">{ingredient.quantity}</span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleIncrementIngredient(ingredient.id)}
                                  className="flex items-center justify-center w-8 h-8 text-white rounded-full bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <Plus size={16} />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
                        <div className="mt-8">
                          <h4 className="mb-4 text-lg font-bold text-emerald-800">Add More Ingredients</h4>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {allIngredients
                              ?.filter(ing => !customizedIngredients.some(i => i.id === ing.id))
                              .map(ingredient => (
                                <motion.button
                                  key={ingredient.id}
                                  whileHover={{ 
                                    scale: 1.05, 
                                    backgroundColor: "#dcfce7",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleIncrementIngredient(ingredient.id)}
                                  className="flex flex-col items-center p-4 text-center transition-all bg-white border shadow-sm rounded-xl hover:border-emerald-300 group"
                                >
                                  <span className="text-3xl transition-transform group-hover:scale-110">{ingredient.emoji || '🥗'}</span>
                                  <span className="mt-2 text-sm font-medium">{ingredient.name}</span>
                                  <span className="mt-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">+${ingredient.price.toFixed(2)}</span>
                                </motion.button>
                              ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 mt-6 bg-white border rounded-lg border-emerald-200">
                          <span className="text-lg font-medium">Updated Price:</span>
                          <span className="text-2xl font-bold text-emerald-700">${customPrice.toFixed(2)}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
                
              {activeTab === 'nutrition' && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="mb-6 text-2xl font-bold text-gray-800">Nutrition Facts</h2>
                  
                  <div className="p-4 mb-6 border border-gray-200 rounded-lg">
                    <p className="mb-1 text-lg font-bold text-gray-800">Serving Size: {salad.servingSize || '1 salad (400g)'}</p>
                    <p className="mb-3 text-sm text-gray-600">Calories: {salad.calories}</p>
                    
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <div className="flex justify-between mb-2">
                        <p className="font-bold text-gray-800">Total Fat</p>
                        <p className="text-gray-800">{salad.nutritionFacts.fats || 15}g</p>
                      </div>
                      <div className="flex justify-between pl-4 mb-1">
                        <p className="text-gray-600">Saturated Fat</p>
                        <p className="text-gray-600">3g</p>
                      </div>
                      <div className="flex justify-between pl-4 mb-2">
                        <p className="text-gray-600">Trans Fat</p>
                        <p className="text-gray-600">5g</p>
                      </div>
                      <div className="flex justify-between pl-4 mb-2">
                        <p className="text-gray-600">Sugars</p>
                        <p className="text-gray-600">3g</p>
                      </div>
                      
                      <div className="flex justify-between pt-2 mb-2 border-t border-gray-200">
                        <p className="font-bold text-gray-800">Protein</p>
                        <p className="text-gray-800">{salad.nutritionFacts.protein}g</p>
                      </div>
                      
                      {((salad as ExtendedSalad).additionalNutrients?.length ?? 0) > 0 ? (
                        (salad as ExtendedSalad).additionalNutrients?.map((nutrient: NutrientInfo, index: number) => (
                          <div key={index} className="flex justify-between mb-1">
                            <p className="text-gray-600">{nutrient.name}</p>
                            <p className="text-gray-600">{nutrient.value}</p>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex justify-between pt-2 mb-1 border-t border-gray-200">
                            <p className="text-gray-600">Vitamin A</p>
                            <p className="text-gray-600">25%</p>
                          </div>
                          <div className="flex justify-between mb-1">
                            <p className="text-gray-600">Vitamin C</p>
                            <p className="text-gray-600">45%</p>
                          </div>
                          <div className="flex justify-between mb-1">
                            <p className="text-gray-600">Calcium</p>
                            <p className="text-gray-600">15%</p>
                          </div>
                          <div className="flex justify-between mb-1">
                            <p className="text-gray-600">Iron</p>
                            <p className="text-gray-600">10%</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="flex items-center mb-6 text-2xl font-bold text-gray-800">
            You Might Also Like
          </h2>
          
          <div className="pb-4 overflow-x-auto">
            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
              {relatedSalads.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: index * 0.1 } }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="overflow-hidden transition-all bg-white border shadow-lg cursor-pointer w-72 rounded-xl hover:shadow-xl border-emerald-100"
                  onClick={() => navigate(`/salads/${item.id}`)}
                >
                  <div className="relative h-44">
                    <img
                      src={typeof item.image === 'string' ? item.image : '/images/default-salad.jpg'}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-t from-black/50 to-transparent hover:opacity-100"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {item.tags && item.tags.slice(0, 1).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-white/80 text-emerald-800 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="px-2 py-1 text-sm font-bold text-white rounded-lg bg-emerald-700/90">
                          ${item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="h-10 mt-1 mb-3 text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        {item.calories} cal
                      </div>
                      <button
                        className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/salads/${item.id}`);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
