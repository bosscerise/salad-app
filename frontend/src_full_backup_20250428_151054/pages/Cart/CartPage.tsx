// src/pages/Cart/CartPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, ChevronLeft, CheckCircle, Plus, Minus } from 'lucide-react';
import Header from '../../components/Header';
import { pb } from '../../pb';
import { ingredientService, saladService } from '../../pb';
import { useIngredients } from '../../hooks/useIngredients';
import { useToast } from '../../hooks/useToast';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, itemCount, isLoading } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { toast } = useToast();
  const { ingredients: allIngredients, loading: ingredientsLoading } = useIngredients();

  const handleCheckout = async () => {
    if (!pb.authStore.isValid) {
      toast?.error("Please sign in to complete your order");
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      toast?.error("Your cart is empty");
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log("Processing checkout for items:", items);

      // Create detailed representations of all items for better order history
      const itemsDetail = await Promise.all(items.map(async (item) => {
        console.log("Processing item:", item);
        
        // Handle customized premade salads
        if (item.type === 'premade' && (item.id.includes('_custom_') || item.name.includes('Custom'))) {
          // Extract original salad ID
          const originalId = item.id.includes('_custom_') 
            ? item.id.split('_custom_')[0]
            : item.id;
          
          // Get the details from the item, ensure customizations is properly formatted
          const customizations = Array.isArray(item.customizations) 
            ? item.customizations 
            : Object.entries(item.customizations || {}).map(([id, qty]) => ({
                id,
                quantity: typeof qty === 'number' ? qty : Number(qty)
              }));
          
          return {
            id: item.id,
            type: 'premade',
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            customized: true,
            originalSaladId: originalId,
            customizations: customizations,
            emoji: '🥗'  // Default emoji for salads
          };
        }
        // Handle saved custom salads
        else if (item.type === 'saved-salad') {
          try {
            const salad = await saladService.getById(item.id);
            
            // Transform ingredients to include names, not just IDs and quantities
            const ingredientsWithNames = [];
            
            // Process ingredients to add names
            if (salad?.ingredients) {
              // Handle different formats of ingredients
              if (Array.isArray(salad.ingredients)) {
                // Already in array format
                for (const ing of salad.ingredients) {
                  const ingredient = allIngredients.find(i => i.id === ing.id);
                  if (ingredient) {
                    ingredientsWithNames.push({
                      id: ing.id,
                      name: ingredient.name,
                      quantity: ing.quantity,
                      price: ingredient.price,
                      emoji: ingredient.emoji || '🥬'
                    });
                  }
                }
              } else {
                // Object format with key-value pairs
                for (const [ingId, quantity] of Object.entries(salad.ingredients)) {
                  const ingredient = allIngredients.find(i => i.id === ingId);
                  if (ingredient) {
                    ingredientsWithNames.push({
                      id: ingId,
                      name: ingredient.name,
                      quantity: typeof quantity === 'number' ? quantity : Number(quantity),
                      price: ingredient.price,
                      emoji: ingredient.emoji || '🥬'
                    });
                  }
                }
              }
            }
            
            return {
              id: item.id,
              type: 'saved-salad',
              name: salad.name || 'Custom Salad',
              price: item.price,
              quantity: item.quantity,
              ingredients: ingredientsWithNames,
              emoji: '🥗'
            };
          } catch (error) {
            console.error(`Failed to get details for salad ${item.id}:`, error);
            return {
              id: item.id,
              type: 'saved-salad',
              name: item.name || 'Unknown Salad',
              price: item.price,
              quantity: item.quantity,
              emoji: '🥗'
            };
          }
        }
        // Handle regular ingredients
        else if (item.type === 'ingredient') {
          try {
            const allIngredientsData = await ingredientService.getAll();
            const ingredient = allIngredientsData.find(ing => ing.id === item.id);
            return {
              id: item.id,
              type: 'ingredient',
              name: ingredient?.name || item.name || 'Unknown Ingredient',
              price: item.price,
              quantity: item.quantity,
              emoji: ingredient?.emoji || '🥬',
              category: ingredient?.category
            };
          } catch (err) {
            console.error(`Failed to get details for ingredient ${item.id}:`, err);
            return {
              id: item.id,
              type: 'ingredient',
              name: item.name || 'Unknown Ingredient',
              price: item.price,
              quantity: item.quantity,
              emoji: '🥬'
            };
          }
        }
        
        // Default fallback
        return {
          id: item.id,
          type: item.type,
          name: item.name || 'Unknown Item',
          price: item.price,
          quantity: item.quantity,
          emoji: '🍽️'
        };
      }));
      
      // Create simplified representation for backward compatibility
      const itemsMap = items.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {} as Record<string, number>);
      
      const orderData = {
        user_id: pb.authStore.model?.id,
        total: subtotal,
        status: 'pending',
        delivery: deliveryOption,
        items_detail: itemsDetail,
        items: itemsMap
      };
      
      console.log("Submitting order data:", orderData);
      
      const createdOrder = await pb.collection('orders').create(orderData);
      console.log("Order created successfully:", createdOrder);
      
      // Clear cart and show success message
      clearCart();
      setOrderSuccess(true);
      toast?.success("Order placed successfully!");
      
      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
      
    } catch (error) {
      console.error("Error during checkout:", error);
      toast?.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      <Header />

      <main className="max-w-4xl px-4 pt-8 pb-20 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <button 
            onClick={() => navigate('/menu')}
            className="flex items-center text-emerald-700 hover:text-emerald-800"
          >
            <ChevronLeft size={20} className="mr-1" />
            Continue Shopping
          </button>
        </div>

        {orderSuccess ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center bg-white rounded-lg shadow-md"
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Order Placed!</h2>
            <p className="mb-4 text-gray-600">
              Your order has been successfully placed and will be ready soon.
            </p>
            <p className="text-sm text-gray-500">Redirecting to your orders...</p>
          </motion.div>
        ) : (
          <>
            {items.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg shadow-md">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="mb-2 text-2xl font-bold text-gray-800">Your cart is empty</h2>
                <p className="mb-6 text-gray-600">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <button
                  onClick={() => navigate('/menu')}
                  className="px-6 py-3 text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <div className="p-6 mb-4 bg-white rounded-lg shadow-md">
                    <h2 className="mb-4 text-xl font-semibold">Cart Items ({itemCount})</h2>

                    <div className="space-y-4">
                      <AnimatePresence>
                        {items.map((item) => (
                          <motion.div 
                            key={`${item.type}-${item.id}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 border rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">
                                  {item.name}
                                  {(item.id.includes('_custom_') || item.name.includes('Custom')) && 
                                    <span className="ml-2 text-xs text-emerald-600">(Customized)</span>}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {item.type === 'saved-salad' ? 'Custom Salad' : 
                                   item.type === 'premade' ? 'Menu Salad' : 'Ingredient'}
                                </p>
                                
                                {/* Show customization summary for customized salads */}
                                {item.id.includes('_custom_') && item.customizations && (
                                  <button 
                                    onClick={() => setExpandedItems(prev => 
                                      prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                                    )}
                                    className="text-xs underline text-emerald-600"
                                  >
                                    {expandedItems.includes(item.id) ? 'Hide Customizations' : 'View Customizations'}
                                  </button>
                                )}
                                
                                {/* For saved or predefined salads */}
                                {(!item.id.includes('_custom_')) && (item.type === 'saved-salad' || item.type === 'premade') && (
                                  <button 
                                    onClick={() => item.type === 'premade' ? navigate(`/menu/${item.id}`) : null}
                                    className="text-xs underline text-emerald-600"
                                  >
                                    View Details
                                  </button>
                                )}
                              </div>
                              
                              {/* Quantity controls and price */}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                                    className="p-1 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                                    className="p-1 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                                <span className="font-medium">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                <button
                                  onClick={() => removeFromCart(item.id, item.type)}
                                  className="p-1 text-red-500 rounded-full hover:bg-red-50"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            
                            {/* Expanded view for customizations */}
                            {expandedItems.includes(item.id) && item.customizations && (
                              <div className="p-3 mt-3 rounded-md bg-gray-50">
                                <h4 className="mb-2 text-xs font-medium text-gray-700">Customized Ingredients:</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                  {Array.isArray(item.customizations) ? (
                                    item.customizations.map((ing, idx) => {
                                      const ingredient = allIngredients?.find(i => i.id === ing.id);
                                      return (
                                        <div key={idx} className="flex justify-between text-sm">
                                          <span>{ingredient?.name || ing.id}</span>
                                          <span className="text-gray-600">×{ing.quantity}</span>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    Object.entries(item.customizations).map(([id, qty], idx) => {
                                      const ingredient = allIngredients?.find(i => i.id === id);
                                      return (
                                        <div key={idx} className="flex justify-between text-sm">
                                          <span>{ingredient?.name || id}</span>
                                          <span className="text-gray-600">×{typeof qty === 'number' ? qty : String(qty)}</span>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

                    <div className="mb-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span>${(subtotal * 0.09).toFixed(2)}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>${(subtotal * 1.09).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deliveryOption}
                          onChange={() => setDeliveryOption(!deliveryOption)}
                          className="w-4 h-4 text-green-600 rounded"
                        />
                        <span>Delivery</span>
                      </label>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={isSubmitting || items.length === 0 || isLoading || ingredientsLoading}
                      className="w-full py-3 font-medium text-white transition-all rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Checkout Now'}
                    </button>

                    {!pb.authStore.isValid && (
                      <p className="mt-3 text-sm text-center text-gray-500">
                        Please <a href="/auth/login" className="text-emerald-600 hover:underline">sign in</a> to complete your order
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}