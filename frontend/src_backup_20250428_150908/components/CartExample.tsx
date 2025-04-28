import React from 'react';
import { useCartStore } from '../stores/cartStore';

// Example component using the Zustand store directly
export function CartExample() {
  // Access cart state and actions directly from Zustand store
  const items = useCartStore(state => state.items);
  const itemCount = useCartStore(state => state.itemCount);
  const subtotal = useCartStore(state => state.subtotal);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const clearCart = useCartStore(state => state.clearCart);

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-lg font-bold mb-2">Cart ({itemCount} items)</h2>
      <p className="text-sm text-gray-600 mb-4">Subtotal: ${subtotal.toFixed(2)}</p>
      
      {items.length === 0 ? (
        <p className="text-gray-500">Your cart is empty</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={`${item.id}-${item.type}`} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">${item.price.toFixed(2)} × {item.quantity}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
                <button 
                  onClick={() => removeFromCart(item.id, item.type)}
                  className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 ml-2"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={clearCart}
            className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Cart
          </button>
        </div>
      )}
    </div>
  );
}