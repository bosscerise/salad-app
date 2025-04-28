import React, { createContext, useContext, useEffect } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, useCartNotification, useCartInit, CartItem } from '../stores/cartStore';

// Define types for context (for backward compatibility)
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

// Create context with default values from the Zustand store
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart notification component
const CartNotification = ({ item, onClose }: { item: Omit<CartItem, 'details'>, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className="fixed z-50 flex items-center p-3 pr-4 text-white bg-green-600 rounded-full shadow-lg bottom-4 right-4 max-w-[calc(100%-2rem)]"
    >
      <div className="flex items-center justify-center w-8 h-8 mr-2 bg-white rounded-full shrink-0">
        <Check className="w-5 h-5 text-green-600" />
      </div>
      <div className="mr-2 overflow-hidden">
        <p className="text-sm font-medium truncate">{item.name} added to cart</p>
        <p className="text-xs">${item.price.toFixed(2)} × {item.quantity}</p>
      </div>
      <button 
        onClick={onClose}
        className="p-1 ml-2 text-white rounded-full hover:bg-green-700 shrink-0"
      >
        <ShoppingCart className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Use the Zustand store instead of React state
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    isLoading,
    reorderFromHistory
  } = useCartStore();
  
  const { showNotification: showCartNotification, lastAddedItem, hideNotification } = useCartNotification();
  const { loadCartDetails } = useCartInit();

  // Load cart details on mount
  useEffect(() => {
    loadCartDetails();
  }, []);

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

// Keep the same hook for backward compatibility
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Also export the CartItem type
export type { CartItem };