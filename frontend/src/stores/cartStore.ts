import { create } from 'zustand';
import { ingredientService, saladService } from '../pb';
import { IngredientsRecord, SaladsRecord, UserSaladsRecord } from '../pb/types';
import { persist } from 'zustand/middleware';

// Define types for cart items
export type CartItem = {
  id: string;
  type: 'ingredient' | 'saved-salad' | 'premade';
  quantity: number;
  name: string;
  price: number;
  details?: IngredientsRecord | SaladsRecord | UserSaladsRecord | Record<string, unknown> | null;
  customizations?: Record<string, unknown>;
  ingredients?: Record<string, number>; // Add ingredients for reordering from history
  customized?: boolean;
};

// Define the toast function types
type ToastFunction = (message: string, options?: { duration?: number }) => void;
interface ToastApi {
  success: ToastFunction;
  error: ToastFunction;
  info: ToastFunction;
}

// Define the cart store state and actions
interface CartState {
  items: CartItem[];
  isLoading: boolean;
  lastAddedItem: Omit<CartItem, 'details'> | null;
  showCartNotification: boolean;
  
  // Computed values
  itemCount: number;
  subtotal: number;
  
  // Actions
  addToCart: (newItem: Omit<CartItem, 'details'>, toastApi?: ToastApi) => Promise<void>;
  removeFromCart: (id: string, type: string) => void;
  updateQuantity: (id: string, type: string, quantity: number) => void;
  clearCart: () => void;
  hideNotification: () => void;
  reorderFromHistory: (orderItems: Record<string, number>, itemsDetail?: Partial<CartItem>[], toastApi?: ToastApi) => Promise<void>;
}

// Create the Zustand store
export const useCartStore = create<CartState>()(
  // Use the persist middleware to save cart to localStorage
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      lastAddedItem: null,
      showCartNotification: false,
      
      // Computed values
      get itemCount() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      get subtotal() {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      // Actions
      addToCart: async (newItem, toastApi) => {
        console.log("Adding item to cart:", JSON.stringify({
          id: newItem.id,
          name: newItem.name,
          type: newItem.type,
          price: newItem.price,
          customized: newItem.customized,
        }));
        
        set({ isLoading: true });
        try {
          let details = null;
          
          // Determine if this is a customized salad
          const isCustomized = newItem.customized === true || 
                               (newItem.name.includes('Custom') && newItem.customizations && 
                                Object.keys(newItem.customizations).length > 0);
          
          if (newItem.type === 'saved-salad') {
            // First try user_salads collection since this is likely a user-created salad
            try {
              details = await saladService.getUserSalad(newItem.id);
            } catch (error) {
              // If not found in user_salads, try the regular salads collection as fallback
              console.log('Salad not found in user_salads, trying standard salads collection');
              details = await saladService.getSalad(newItem.id);
            }
          } else if (newItem.type === 'ingredient') {
            details = await ingredientService.getById(newItem.id);
          } else if (newItem.type === 'premade' && isCustomized) {
            // Handle customized premade salads
            details = {
              customized: true,
              originalId: newItem.id,
              customIngredients: newItem.customizations || {}
            };
          }
          
          set((state) => {
            // For customized items, always add as a new item with a unique ID
            if (isCustomized) {
              console.log("Adding customized salad to cart:", newItem.name);
              
              // Create a unique ID for the customized salad that preserves the original ID
              const customId = `${newItem.id}_custom_${Date.now()}`;
              
              return {
                items: [...state.items, { 
                  ...newItem, 
                  id: customId,
                  details,
                  customized: true,
                  // Ensure customizations is an object, not an array
                  customizations: newItem.customizations || {}
                }],
                lastAddedItem: newItem,
                showCartNotification: true,
              };
            }
            
            // Check if regular item already exists
            const existingItemIndex = state.items.findIndex(
              item => item.id === newItem.id && item.type === newItem.type
            );
            
            if (existingItemIndex >= 0) {
              // Update quantity of existing item
              const updatedItems = [...state.items];
              updatedItems[existingItemIndex].quantity += newItem.quantity;
              return {
                items: updatedItems,
                lastAddedItem: newItem,
                showCartNotification: true,
              };
            } else {
              // Add new item with details
              return {
                items: [...state.items, { ...newItem, details }],
                lastAddedItem: newItem,
                showCartNotification: true,
              };
            }
          });
          
          // Auto-hide notification after 3 seconds
          setTimeout(() => {
            set({ showCartNotification: false });
          }, 3000);
          
        } catch (error) {
          console.error('Error adding item to cart:', error);
          // Show error toast if toast API is provided
          toastApi?.error('Failed to add to cart');
        } finally {
          set({ isLoading: false });
        }
      },
      
      hideNotification: () => set({ showCartNotification: false }),
      
      removeFromCart: (id, type) => {
        set((state) => ({
          items: state.items.filter(item => !(item.id === id && item.type === type))
        }));
      },
      
      updateQuantity: (id, type, quantity) => {
        const { removeFromCart } = get();
        
        if (quantity <= 0) {
          removeFromCart(id, type);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item => 
            (item.id === id && item.type === type) 
              ? { ...item, quantity } 
              : item
          )
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      reorderFromHistory: async (orderItems, itemsDetail, toastApi) => {
        const { clearCart, addToCart } = get();
        set({ isLoading: true });
        
        try {
          // Clear the current cart first
          clearCart();
          let successCount = 0;
          
          // If we have detailed information, use that first
          if (itemsDetail && Array.isArray(itemsDetail)) {
            for (const item of itemsDetail) {
              if (!item.id || !item.type || !item.quantity) {
                console.warn('Skipping item with missing required fields:', item);
                continue;
              }
              
              if (item.type === 'saved-salad') {
                try {
                  // Check if the saved salad still exists
                  const salad = await saladService.getById(item.id);
                  if (salad) {
                    await addToCart({
                      id: item.id,
                      type: 'saved-salad',
                      quantity: Number(item.quantity),
                      name: salad.name || 'Custom Salad',
                      price: salad.total_price || 0
                    });
                    successCount++;
                    continue; // Skip to next item
                  }
                } catch (error) {
                  // If saved salad no longer exists, try to recreate it from ingredients
                  console.error(`Failed to load salad ${item.id}, will try to recreate:`, error);
                  
                  if (item.ingredients && Object.keys(item.ingredients).length > 0) {
                    let ingredientSuccessCount = 0;
                    // Need to add ingredients individually
                    for (const [ingId, ingQuantity] of Object.entries(item.ingredients)) {
                      try {
                        const ingredient = await ingredientService.getById(ingId);
                        if (ingredient) {
                          await addToCart({
                            id: ingId,
                            type: 'ingredient',
                            quantity: Number(ingQuantity) * Number(item.quantity || 1),
                            name: ingredient.name,
                            price: ingredient.price
                          });
                          ingredientSuccessCount++;
                        }
                      } catch (ingError) {
                        console.error(`Couldn't add ingredient ${ingId}:`, ingError);
                      }
                    }
                    
                    if (ingredientSuccessCount > 0) {
                      successCount++;
                    }
                    
                    continue; // Skip to next item
                  }
                }
              } else if (item.type === 'ingredient') {
                try {
                  const ingredient = await ingredientService.getById(item.id);
                  if (ingredient) {
                    await addToCart({
                      id: item.id,
                      type: 'ingredient',
                      quantity: Number(item.quantity),
                      name: ingredient.name,
                      price: ingredient.price
                    });
                    successCount++;
                  }
                } catch (error) {
                  console.error(`Failed to load ingredient ${item.id}:`, error);
                }
              } else if (item.type === 'premade') {
                try {
                  // Try to add as premade salad
                  await addToCart({
                    id: item.id,
                    type: 'premade',
                    quantity: Number(item.quantity),
                    name: item.name || 'Menu Salad',
                    price: Number(item.price || 0),
                    customizations: item.customizations,
                    customized: item.customized
                  });
                  successCount++;
                } catch (error) {
                  console.error(`Failed to add premade salad ${item.id}:`, error);
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
                  const salad = await saladService.getById(saladId);
                  if (salad) {
                    await addToCart({
                      id: saladId,
                      type: 'saved-salad',
                      quantity: Number(quantity),
                      name: salad.name || 'Custom Salad',
                      price: salad.total_price || 0
                    });
                    successCount++;
                  }
                } catch (error) {
                  console.error(`Failed to load salad ${saladId}:`, error);
                }
              } else if (itemId.includes('_from_')) {
                // Handle ingredient from salad (new format)
                const [ingredientId] = itemId.split('_from_');
                try {
                  const ingredient = await ingredientService.getById(ingredientId);
                  if (ingredient) {
                    await addToCart({
                      id: ingredientId,
                      type: 'ingredient',
                      quantity: Number(quantity),
                      name: ingredient.name,
                      price: ingredient.price
                    });
                    successCount++;
                  }
                } catch (error) {
                  console.error(`Failed to load ingredient ${ingredientId}:`, error);
                }
              } else {
                // Handle regular ingredients
                try {
                  const ingredient = await ingredientService.getById(itemId);
                  if (ingredient) {
                    await addToCart({
                      id: itemId,
                      type: 'ingredient',
                      quantity: Number(quantity),
                      name: ingredient.name || 'Ingredient',
                      price: ingredient.price || 0
                    });
                    successCount++;
                  }
                } catch (error) {
                  console.error(`Failed to load ingredient ${itemId}:`, error);
                }
              }
            });
            
            await Promise.all(promises);
          }
          
          if (successCount > 0) {
            toastApi?.success('Order items added to cart!');
          } else {
            toastApi?.error('No items could be added to cart');
          }
          
          return successCount;
          
        } catch (error) {
          console.error('Error reordering:', error);
          toastApi?.error('Failed to reorder some items');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'salad-app-cart', // localStorage key
      partialize: (state) => ({
        // Only store necessary cart data (not the computed values and methods)
        items: state.items.map(({ id, type, quantity, name, price, customizations, customized }) => ({
          id, type, quantity, name, price, customizations, customized
        })),
      }),
    }
  )
);

// Create a hook that combines toast and cart
export function useCartWithToast() {
  // Import this dynamically to avoid circular dependencies
  const { useToast } = require('../hooks/useToast');
  const { toast } = useToast();
  
  const addToCart = useCartStore(state => state.addToCart);
  const reorderFromHistory = useCartStore(state => state.reorderFromHistory);

  return {
    ...useCartStore(),
    addToCart: (newItem: Omit<CartItem, 'details'>) => addToCart(newItem, toast),
    reorderFromHistory: (orderItems: Record<string, number>, itemsDetail?: Partial<CartItem>[]) => 
      reorderFromHistory(orderItems, itemsDetail, toast)
  };
}

// Create a separate hook for the cart notification component
export function useCartNotification() {
  return {
    showNotification: useCartStore((state) => state.showCartNotification),
    lastAddedItem: useCartStore((state) => state.lastAddedItem),
    hideNotification: useCartStore((state) => state.hideNotification)
  };
}

// Export a hook to load the cart on initialization
export function useCartInit() {
  // Don't create a new setter function on each render
  return {
    loadCartDetails: async () => {
      try {
        const state = useCartStore.getState();
        const savedItems = state.items;
        
        // If we already have details for items, don't reload
        const needsDetails = savedItems.some(item => !item.details);
        if (!needsDetails) {
          return; // Skip if we already have details
        }
        
        // Load details for each item
        const itemsWithDetails = await Promise.all(
          savedItems.map(async (item) => {
            // If the item already has details, don't reload
            if (item.details) {
              return item;
            }
            
            try {
              let details = null;
              if (item.type === 'saved-salad') {
                details = await saladService.getById(item.id);
              } else if (item.type === 'ingredient') {
                details = await ingredientService.getById(item.id);
              }
              return { ...item, details };
            } catch (error) {
              // If we can't load details, still return the item
              console.error('Failed to load item details:', error);
              return item;
            }
          })
        );
        
        // Only update state if we have items that need details
        useCartStore.setState({ items: itemsWithDetails });
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  };
}