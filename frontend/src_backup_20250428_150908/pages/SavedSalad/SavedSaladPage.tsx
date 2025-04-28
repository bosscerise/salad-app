import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pb } from '../../pb';
import { saladService, ingredientService } from '../../pb';
import { Trash2, ChevronLeft, ShoppingCart, Star, PenSquare, Plus } from 'lucide-react';
import Header from '../../components/Header';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../Menu/components/LoadingSpinner';
import { useCart, CartItem as ContextCartItem } from '../../contexts/CartContext';
import { useCategories } from '../../hooks/useCategories';
import { 
  Salad, 
  Ingredient, 
  Category, 
  convertToSalad,
  convertToIngredient,
  convertToCategory,
  UserSaladsResponse,
  IngredientsResponse
} from '../../pb/types';

pb.autoCancellation(false);

function SavedSaladPage() {
  const { id } = useParams<{ id: string }>();
  const [salad, setSalad] = useState<Salad | null>(null);
  const [savedSalads, setSavedSalads] = useState<Salad[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { categories: hookCategories } = useCategories();

  // Determine if we're in list view or detail view
  const isListView = !id;

  // Process salad ingredients using memo
  const saladIngredients = React.useMemo(() => {
    if (!salad || !ingredients.length) return [];
    
    return Object.entries(salad.ingredients || {}).map(([id, quantity]) => {
      const ingredient = ingredients.find(ing => ing.id === id);
      if (!ingredient) return null;
      
      // Handle potential missing category data
      const category = categories.find(cat => cat.id === ingredient.category);
      const categoryName = category?.name || ingredient.category || 'Other';
      
      return {
        id,
        name: ingredient.name,
        emoji: ingredient.emoji || '🥗',
        category: categoryName,
        price: ingredient.price,
        quantity: quantity as number,
      };
    }).filter(Boolean);
  }, [salad, ingredients, categories]);

  // Load all saved salads
  const fetchSavedSalads = useCallback(async () => {
    if (!pb.authStore.isValid) {
      navigate('/auth');
      return;
    }

    try {
      setIsLoading(true);
      const response = await saladService.getAll();
      
      // Convert PocketBase response to our app Salad type
      const typedSalads: Salad[] = response.map(item => convertToSalad(item as UserSaladsResponse));
      setSavedSalads(typedSalads);
    } catch (error) {
      console.error('Error fetching saved salads:', error);
      toast?.error('Failed to load your saved salads');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  // Load a specific salad by ID
  const loadSalad = useCallback(async (saladId: string) => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      // Check if collections exist first
      try {
        // Check if the user_salads collection exists
        const collections = await pb.collections.getFullList();
        const userSaladsCollection = collections.find(c => c.name === 'user_salads');
        
        if (!userSaladsCollection) {
          console.error('The user_salads collection doesn\'t exist in PocketBase.');
          toast?.error('Database configuration issue. Please set up collections first.');
          navigate('/my-salads');
          return;
        }
        
        // Get salad data
        let saladData;
        try {
          saladData = await saladService.getById(saladId);
          if (!saladData) {
            setIsError(true);
            toast?.error('Salad not found');
            navigate('/my-salads'); // Redirect to list view if salad not found
            return;
          }
        } catch (error: unknown) {
          const errorObj = error as { status?: number };
          if (errorObj.status === 404) {
            console.error('Salad not found:', error);
            toast?.error('The requested salad does not exist');
          } else {
            console.error('Error loading salad:', error);
            toast?.error('Failed to load salad details');
          }
          navigate('/my-salads');
          return;
        }
        
        // Now get ingredients - these can fail gracefully
        let allIngredients: Ingredient[] = [];
        
        try {
          const fetchedIngredients = await ingredientService.getAll();
          // Convert to our app Ingredient type
          allIngredients = fetchedIngredients.map(ing => 
            convertToIngredient(ing as IngredientsResponse)
          );
        } catch (error) {
          console.error('Error loading ingredients:', error);
          toast?.error('Could not load all ingredient details');
        }
        
        // Convert to Salad type and set state
        const typedSalad = convertToSalad(saladData as UserSaladsResponse);
        
        // Set all state
        setSalad(typedSalad);
        setIngredients(allIngredients);
        setCategories(hookCategories ? hookCategories.map(cat => convertToCategory(cat)) : []);
      } catch (error) {
        console.error('Error checking collections:', error);
        toast?.error('Database configuration issue');
        navigate('/my-salads');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, hookCategories, toast]);

  useEffect(() => {
    if (isListView) {
      fetchSavedSalads();
    } else if (id) {
      loadSalad(id);
    }
  }, [id, isListView, fetchSavedSalads, loadSalad]);

  useEffect(() => {
    // Update categories whenever hookCategories changes
    if (hookCategories) {
      setCategories(hookCategories.map(cat => convertToCategory(cat)));
    }
  }, [hookCategories]);

  const handleAddToCart = useCallback(async (saladToAdd: Salad) => {
    if (!saladToAdd || typeof saladToAdd !== 'object') {
      toast?.error('Invalid salad data');
      return;
    }
    
    try {
      // Create a CartItem that matches the expected type in the context
      const cartItem: ContextCartItem = {
        id: saladToAdd.id,
        type: 'saved-salad',
        quantity: 1,
        name: saladToAdd.name || 'Custom Salad',
        price: saladToAdd.total_price || 0
      };
      
      await addToCart(cartItem);
      toast?.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast?.error('Failed to add to cart');
    }
  }, [addToCart, toast]);

  const toggleFavorite = useCallback(async (saladId: string, isFavorite: boolean) => {
    try {
      const updated = await saladService.toggleFavorite(saladId, !isFavorite);
      
      // Convert to Salad type
      const typedSalad = convertToSalad(updated as UserSaladsResponse);
      
      if (isListView) {
        setSavedSalads(prev => prev.map(s => s.id === saladId ? typedSalad : s));
      } else {
        setSalad(typedSalad);
      }
      
      toast?.success(typedSalad.is_favorite ? 'Added to favorites!' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast?.error('Failed to update favorite status');
    }
  }, [isListView, toast]);

  const deleteSalad = useCallback(async (saladId: string, saladName: string) => {
    if (window.confirm(`Are you sure you want to delete "${saladName}"?`)) {
      try {
        // Using proper delete method from our services
        await pb.collection('user_salads').delete(saladId);
        toast?.success('Salad deleted!');
        
        if (isListView) {
          setSavedSalads(prev => prev.filter(s => s.id !== saladId));
        } else {
          navigate('/my-salads');
        }
      } catch (error) {
        console.error('Error deleting salad:', error);
        toast?.error('Failed to delete salad');
      }
    }
  }, [isListView, navigate, toast]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isListView && (isError || !salad)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Salad Not Found</h1>
        <p className="mb-6 text-gray-600">The salad you're looking for doesn't exist or was deleted.</p>
        <button
          onClick={() => navigate('/my-salads')}
          className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          View My Salads
        </button>
      </div>
    );
  }

  // Render the list view
  if (isListView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
        <Header />
        
        <main className="max-w-5xl px-4 pt-6 pb-20 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Saved Salads</h1>
            <Link 
              to="/menu" 
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus size={16} />
              Create New
            </Link>
          </div>
          
          {savedSalads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 mt-8 text-center bg-white rounded-lg shadow">
              <div className="p-4 mb-4 text-4xl bg-gray-100 rounded-full">🥗</div>
              <h2 className="mb-2 text-xl font-semibold">No Saved Salads Yet</h2>
              <p className="mb-6 text-gray-600">Create your first custom salad to see it here!</p>
              <Link 
                to="/menu" 
                className="px-6 py-3 text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
              >
                Create a Salad
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedSalads.map(salad => {
                // Ensure salad has valid data
                if (!salad || typeof salad !== 'object') return null;
                
                const price = typeof salad.total_price === 'number' ? salad.total_price : 0;
                const calories = typeof salad.total_calories === 'number' ? salad.total_calories : 0;
                const protein = typeof salad.total_protein === 'number' ? salad.total_protein : 0;
                
                return (
                  <div 
                    key={salad.id} 
                    className="overflow-hidden transition-shadow bg-white rounded-lg shadow hover:shadow-md"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 
                          className="text-xl font-semibold cursor-pointer hover:text-emerald-600"
                          onClick={() => navigate(`/my-salads/${salad.id}`)}
                        >
                          {salad.name || 'Unnamed Salad'}
                        </h3>
                        <button
                          onClick={() => toggleFavorite(salad.id, !!salad.is_favorite)}
                          className={`p-1 rounded-full ${
                            salad.is_favorite ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'
                          }`}
                        >
                          <Star 
                            size={18} 
                            fill={salad.is_favorite ? "currentColor" : "none"} 
                          />
                        </button>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          {calories} calories · {protein}g protein
                        </p>
                        <p className="mt-2 text-lg font-bold text-emerald-700">
                          ${price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(salad)}
                          className="flex items-center justify-center flex-1 gap-1 py-2 text-sm text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
                        >
                          <ShoppingCart size={14} />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => navigate(`/my-salads/edit/${salad.id}`)}
                          className="p-2 text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          <PenSquare size={16} />
                        </button>
                        <button
                          onClick={() => deleteSalad(salad.id, salad.name || 'Unnamed Salad')}
                          className="p-2 text-red-600 transition-colors bg-gray-100 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }
  
  // Render the detail view (when a specific salad is selected)
  // Make sure we have valid salad data before rendering
  if (!salad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Salad Not Found</h1>
        <p className="mb-6 text-gray-600">The salad data could not be loaded.</p>
        <button
          onClick={() => navigate('/my-salads')}
          className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          View My Salads
        </button>
      </div>
    );
  }

  // Safely extract values with defaults
  const price = typeof salad.total_price === 'number' ? salad.total_price : 0;
  const calories = typeof salad.total_calories === 'number' ? salad.total_calories : 0;
  const protein = typeof salad.total_protein === 'number' ? salad.total_protein : 0;
  const carbs = typeof salad.total_carbs === 'number' ? salad.total_carbs : 0;
  const fats = typeof salad.total_fats === 'number' ? salad.total_fats : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      <Header />
      
      <main className="max-w-5xl px-4 pt-6 pb-20 mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/my-salads')}
            className="p-1 text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold sm:text-3xl">{salad.name || 'Unnamed Salad'}</h1>
          <button
            onClick={() => toggleFavorite(salad.id, !!salad.is_favorite)}
            className={`ml-2 p-1 rounded-full ${
              salad.is_favorite ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'
            }`}
          >
            <Star 
              size={20} 
              fill={salad.is_favorite ? "currentColor" : "none"} 
            />
          </button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Ingredients</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/my-salads/edit/${salad.id}`)}
                    className="p-2 text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <PenSquare size={18} />
                  </button>
                  <button
                    onClick={() => deleteSalad(salad.id, salad.name || 'Unnamed Salad')}
                    className="p-2 text-red-600 rounded-full hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {saladIngredients.map(item => {
                  if (!item) return null;
                  const itemPrice = typeof item.price === 'number' ? item.price : 0;
                  const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center">
                        <span className="mr-3 text-2xl">{item.emoji || '🥗'}</span>
                        <div>
                          <h3 className="font-medium">{item.name || 'Unnamed Ingredient'}</h3>
                          <p className="text-sm text-gray-500">{item.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">x{quantity}</span>
                        <span className="font-medium">${(itemPrice * quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-xl font-semibold">Nutrition</h2>
              
              <div className="mb-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium">{calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-medium">{protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs</span>
                  <span className="font-medium">{carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fats</span>
                  <span className="font-medium">{fats}g</span>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Total Price</span>
                  <span className="text-lg font-bold">${price.toFixed(2)}</span>
                </div>
                
                <button
                  onClick={() => handleAddToCart(salad)}
                  className="flex items-center justify-center w-full py-3 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SavedSaladPage;