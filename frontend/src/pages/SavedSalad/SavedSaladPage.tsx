import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userSaladApi, ingredientApi, categoryApi } from '../../services/api';
import { Heart, Edit, Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';
import Header from '../../components/Header';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../Menu/components/LoadingSpinner';
import { useCart } from '../../contexts/CartContext';

interface Salad {
  id: string;
  name: string;
  ingredients: Record<string, number>;
  total_price: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  is_favorite: boolean;
}

interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: string;
  price: number;
}

interface Category {
  id: string;
  name: string;
}

function SavedSaladPage() {
  const { id } = useParams<{ id: string }>();
  const [salad, setSalad] = useState<Salad | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Move useMemo here - before any conditional returns
  const saladIngredients = React.useMemo(() => {
    if (!salad || !ingredients.length) return [];
    
    return Object.entries(salad.ingredients || {}).map(([id, quantity]) => {
      const ingredient = ingredients.find(ing => ing.id === id);
      if (!ingredient) return null;
      
      const category = categories.find(cat => cat.id === ingredient.category);
      
      return {
        id,
        name: ingredient.name,
        emoji: ingredient.emoji,
        category: category?.name || 'Unknown',
        price: ingredient.price,
        quantity: quantity as number,
      };
    }).filter(Boolean);
  }, [salad, ingredients, categories]);

  useEffect(() => {
    let isMounted = true;
    
    async function loadSalad() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setIsError(false);
        
        // Get salad data first - this is critical
        let saladData;
        try {
          saladData = await userSaladApi.getById(id);
          if (!saladData) {
            if (isMounted) setIsError(true);
            return;
          }
        } catch (error) {
          console.error('Error loading salad:', error);
          if (isMounted) {
            setIsError(true);
            toast?.error('Failed to load salad details');
          }
          return;
        }
        
        // Now get ingredients and categories - these can fail gracefully
        let allIngredients: Ingredient[] = [], allCategories: Category[] = [];
        
        try {
          allIngredients = await ingredientApi.getAll();
        } catch (error) {
          console.error('Error loading ingredients:', error);
        }
        
        try {
          allCategories = await categoryApi.getAll();
        } catch (error) {
          console.error('Error loading categories:', error);
        }
        
        // Update state only if still mounted
        if (isMounted) {
          setSalad(saladData);
          setIngredients(allIngredients || []);
          setCategories(allCategories || []);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        if (isMounted) {
          setIsError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    loadSalad();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = useCallback(async () => {
    if (!salad) return;
    
    try {
      await addToCart({
        id: salad.id,
        type: 'saved-salad',
        quantity: 1,
        name: salad.name,
        price: salad.total_price
      });
      
      toast?.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast?.error('Failed to add to cart');
    }
  }, [salad, addToCart, toast]);

  const toggleFavorite = useCallback(async () => {
    if (!salad) return;
    
    try {
      const updated = await userSaladApi.toggleFavorite(salad.id, !salad.is_favorite);
      setSalad(updated);
      toast?.success(updated.is_favorite ? 'Added to favorites!' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast?.error('Failed to update favorite status');
    }
  }, [salad, toast]);

  const deleteSalad = useCallback(async () => {
    if (!salad) return;
    
    if (window.confirm(`Are you sure you want to delete "${salad.name}"?`)) {
      try {
        await userSaladApi.delete(salad.id);
        toast?.success('Salad deleted!');
        navigate('/saved-salads');
      } catch (error) {
        console.error('Error deleting salad:', error);
        toast?.error('Failed to delete salad');
      }
    }
  }, [salad, navigate, toast]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !salad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Salad Not Found</h1>
        <p className="mb-6 text-gray-600">The salad you're looking for doesn't exist or was deleted.</p>
        <button
          onClick={() => navigate('/saved-salads')}
          className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          View My Salads
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      <Header 
        cartItems={0}
      />
      
      <main className="max-w-5xl px-4 pt-6 pb-20 mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/saved-salads')}
            className="p-1 text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold sm:text-3xl">{salad.name}</h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Ingredients</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full ${
                      salad.is_favorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Heart size={20} fill={salad.is_favorite ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => navigate(`/edit-salad/${salad.id}`)}
                    className="p-2 text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={deleteSalad}
                    className="p-2 text-red-600 rounded-full hover:bg-red-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {saladIngredients.map(item => (
                  <div key={item?.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <span className="mr-3 text-2xl">{item?.emoji}</span>
                      <div>
                        <h3 className="font-medium">{item?.name}</h3>
                        <p className="text-sm text-gray-500">{item?.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">x{item?.quantity}</span>
                      <span className="font-medium">${((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-xl font-semibold">Nutrition</h2>
              
              <div className="mb-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium">{salad.total_calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-medium">{salad.total_protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs</span>
                  <span className="font-medium">{salad.total_carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fats</span>
                  <span className="font-medium">{salad.total_fats}g</span>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Total Price</span>
                  <span className="text-lg font-bold">${salad.total_price.toFixed(2)}</span>
                </div>
                
                <button
                  onClick={handleAddToCart}
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

// Since this component doesn't receive props directly (using hooks instead),
// we can either remove the custom comparison or define the expected props
interface SavedSaladPageProps {
  id?: string;
}

function areEqual(prevProps: SavedSaladPageProps, nextProps: SavedSaladPageProps) {
  return prevProps.id === nextProps.id;
}

export default React.memo(SavedSaladPage, areEqual);