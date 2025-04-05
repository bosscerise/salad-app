import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userSaladApi, ingredientApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';

// Define ingredient type
export type Ingredient = {
  id: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
};

// Define salad type
export type Salad = {
  id: string;
  name: string;
  total_price: number;
  ingredients?: Record<string, number>;
};

// Define types for cart items
export type CartItem = {
  id: string;
  type: 'ingredient' | 'saved-salad' | 'premade';
  quantity: number;
  name: string;
  price: number;
  details?: Ingredient | Salad | Record<string, unknown> | null;
  customizations?: Record<string, unknown>;
  ingredients?: Record<string, number>; // Add ingredients for reordering from history
};

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'details'>) => Promise<void>;
  removeFromCart: (id: string, type: string) => void;
  updateQuantity: (id: string, type: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  showCartNotification: boolean;
  reorderFromHistory: (orderItems: Record<string, number>, itemsDetail?: Partial<CartItem>[]) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart notification component
const CartNotification = ({ item, onClose }: { item: Omit<CartItem, 'details'>, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className="fixed z-50 flex items-center p-3 pr-4 text-white bg-green-600 rounded-full shadow-lg bottom-4 right-4"
    >
      <div className="flex items-center justify-center w-8 h-8 mr-2 bg-white rounded-full">
        <Check className="w-5 h-5 text-green-600" />
      </div>
      <div className="mr-2">
        <p className="text-sm font-medium">{item.name} added to cart</p>
        <p className="text-xs">${item.price.toFixed(2)} × {item.quantity}</p>
      </div>
      <button 
        onClick={onClose}
        className="p-1 ml-2 text-white rounded-full hover:bg-green-700"
      >
        <ShoppingCart className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<Omit<CartItem, 'details'> | null>(null);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const { toast } = useToast();
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            // Load details for each item
            const itemsWithDetails = await Promise.all(
              parsedCart.map(async (item) => {
                try {
                  let details = null;
                  if (item.type === 'saved-salad') {
                    details = await userSaladApi.getById(item.id);
                  } else if (item.type === 'ingredient') {
                    details = await ingredientApi.getById(item.id);
                  }
                  return { ...item, details };
                } catch (error: unknown) {
                  // If we can't load details, still return the item
                  console.error('Failed to load item details:', error);
                  return item;
                }
              })
            );
            setItems(itemsWithDetails);
          }
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };
    
    loadCart();
  }, []);
  
  // Save to localStorage when cart changes
  useEffect(() => {
    // Only save essential data to localStorage, not the full details
    const simplifiedItems = items.map(({ id, type, quantity, name, price }) => ({
      id, type, quantity, name, price
    }));
    localStorage.setItem('cart', JSON.stringify(simplifiedItems));
  }, [items]);
  
  const addToCart = useCallback(async (newItem: Omit<CartItem, 'details'>) => {
    console.log("Adding item to cart:", JSON.stringify({
      id: newItem.id,
      name: newItem.name,
      type: newItem.type,
      price: newItem.price,
      customizations: newItem.customizations ? 
        (Array.isArray(newItem.customizations) ? 
          `Array with ${newItem.customizations.length} items` : 
          `Object with ${Object.keys(newItem.customizations).length} keys`) : 
        'None'
    }));
    setIsLoading(true);
    try {
      let details = null;
      
      // Determine if this is actually a customized salad
      const isCustomized = newItem.name.includes('Custom') && 
                           newItem.customizations && 
                           Array.isArray(newItem.customizations) &&
                           newItem.customizations.length > 0;
      
      if (newItem.type === 'saved-salad') {
        details = await userSaladApi.getById(newItem.id);
      } else if (newItem.type === 'ingredient') {
        details = await ingredientApi.getById(newItem.id);
      } else if (newItem.type === 'premade' && isCustomized) {
        // Only mark as customized if it has customizations AND includes "Custom" in the name
        details = {
          customized: true,
          originalId: newItem.id,
          customIngredients: newItem.customizations
        };
      }
      
      setItems(prev => {
        // For customized items, always add as a new item with a unique ID
        if (isCustomized) {
          console.log("Adding customized salad to cart:", newItem);
          
          // Create a unique ID for the customized salad that preserves the original ID
          const customId = `${newItem.id}_custom_${Date.now()}`;
          
          return [...prev, { 
            ...newItem, 
            id: customId,
            details,
            customizations: newItem.customizations
          }];
        }
        
        // Check if regular item already exists
        const existingItemIndex = prev.findIndex(
          item => item.id === newItem.id && item.type === newItem.type
        );
        
        if (existingItemIndex >= 0) {
          // Update quantity of existing item
          const updatedItems = [...prev];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          return updatedItems;
        } else {
          // Add new item with details
          return [...prev, { ...newItem, details }];
        }
      });
      
      // Show notification
      setLastAddedItem(newItem);
      setShowCartNotification(true);
      
      setTimeout(() => {
        setShowCartNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast?.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const hideNotification = useCallback(() => {
    setShowCartNotification(false);
  }, []);
  
  const removeFromCart = useCallback((id: string, type: string) => {
    setItems(prev => prev.filter(item => !(item.id === id && item.type === type)));
  }, []);
  
  const updateQuantity = useCallback((id: string, type: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, type);
      return;
    }
    
    setItems(prev => prev.map(item => 
      (item.id === id && item.type === type) 
        ? { ...item, quantity } 
        : item
    ));
  }, [removeFromCart]);
  
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('cart');
  }, []);
  
  // Method to reorder items from order history
  const reorderFromHistory = useCallback(async (orderItems: Record<string, number>, itemsDetail?: Partial<CartItem>[]) => {
    setIsLoading(true);
    
    try {
      // Clear the current cart first
      clearCart();
      
      // If we have detailed information, use that first
      if (itemsDetail && Array.isArray(itemsDetail)) {
        for (const item of itemsDetail) {
          if (item.type === 'saved-salad' && item.id) {
            try {
              // Check if the saved salad still exists
              const salad = await userSaladApi.getById(item.id);
              if (salad) {
                await addToCart({
                  id: item.id,
                  type: 'saved-salad',
                  quantity: Number(item.quantity),
                  name: salad.name || 'Custom Salad',
                  price: salad.total_price || 0
                });
                continue; // Skip to next item
              }
            } catch (error) {
              // If saved salad no longer exists, try to recreate it from ingredients
              console.error(`Failed to load salad ${item.id}, will try to recreate:`, error);
              
              if (item.ingredients && Object.keys(item.ingredients).length > 0) {
                // Need to add ingredients individually
                for (const [ingId, ingQuantity] of Object.entries(item.ingredients)) {
                  try {
                    const ingredient = await ingredientApi.getById(ingId);
                    if (ingredient) {
                      await addToCart({
                        id: ingId,
                        type: 'ingredient',
                        quantity: Number(ingQuantity) * Number(item.quantity),
                        name: ingredient.name,
                        price: ingredient.price
                      });
                    }
                  } catch (ingError) {
                    console.error(`Couldn't add ingredient ${ingId}:`, ingError);
                  }
                }
                continue; // Skip to next item
              }
            }
          } else if (item.type === 'ingredient' && item.id) {
            try {
              const ingredient = await ingredientApi.getById(item.id);
              if (ingredient) {
                await addToCart({
                  id: item.id,
                  type: 'ingredient',
                  quantity: Number(item.quantity),
                  name: ingredient.name,
                  price: ingredient.price
                });
              }
            } catch (error) {
              console.error(`Failed to load ingredient ${item.id}:`, error);
            }
          }
        }
      } else {
        // Legacy format - process as before
        // Process each item in the order
        const promises = Object.entries(orderItems).map(async ([itemId, quantity]) => {
          // Handle saved salads (with salad_ prefix)
          if (itemId.startsWith('salad_')) {
            const saladId = itemId.replace('salad_', '');
            try {
              const salad = await userSaladApi.getById(saladId);
              if (salad) {
                await addToCart({
                  id: saladId,
                  type: 'saved-salad',
                  quantity: Number(quantity),
                  name: salad.name || 'Custom Salad',
                  price: salad.total_price || 0
                });
              }
            } catch (error) {
              console.error(`Failed to load salad ${saladId}:`, error);
            }
          } else if (itemId.includes('_from_')) {
            // Handle ingredient from salad (new format)
            const [ingredientId] = itemId.split('_from_');
            try {
              const ingredient = await ingredientApi.getById(ingredientId);
              if (ingredient) {
                await addToCart({
                  id: ingredientId,
                  type: 'ingredient',
                  quantity: Number(quantity),
                  name: ingredient.name,
                  price: ingredient.price
                });
              }
            } catch (error) {
              console.error(`Failed to load ingredient ${ingredientId}:`, error);
            }
          } else {
            // Handle regular ingredients
            try {
              const ingredient = await ingredientApi.getById(itemId);
              if (ingredient) {
                await addToCart({
                  id: itemId,
                  type: 'ingredient',
                  quantity: Number(quantity),
                  name: ingredient.name || 'Ingredient',
                  price: ingredient.price || 0
                });
              }
            } catch (error) {
              console.error(`Failed to load ingredient ${itemId}:`, error);
            }
          }
        });
        
        await Promise.all(promises);
      }
      
      toast?.success('Order items added to cart!');
    } catch (error) {
      console.error('Error reordering:', error);
      toast?.error('Failed to reorder some items');
    } finally {
      setIsLoading(false);
    }
  }, [addToCart, clearCart, toast]);
  
  // Calculate totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        updateQuantity,
        clearCart, 
        itemCount, 
        subtotal,
        isLoading,
        showCartNotification,
        reorderFromHistory
      }}
    >
      {children}
      <AnimatePresence>
        {showCartNotification && lastAddedItem && (
          <CartNotification 
            item={lastAddedItem} 
            onClose={hideNotification} 
          />
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};