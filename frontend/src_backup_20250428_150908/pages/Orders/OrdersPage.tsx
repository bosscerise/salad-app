"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Clock, CheckCircle, XCircle, ShoppingBag, RefreshCcw, Search } from 'lucide-react';
import Header from '../../components/Header';
import { pb } from '../../pb';
import { ingredientService, saladService, categoryService } from '../../pb';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../Menu/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { toast as toastNotify } from 'react-hot-toast';
pb.autoCancellation(false);
// Define the Order type with rendered items
interface OrderWithDetails {
  id: string;
  user_id: string;
  items: Record<string, number>;
  items_detail?: Array<{
    type: 'ingredient' | 'saved-salad' | 'premade';
    id: string;
    name: string;
    quantity: number;
    price: number;
    ingredients?: Record<string, number>;
    customized?: boolean;
    customizations?: Array<{ id: string; quantity: number }> | Record<string, number>;
    originalSaladId?: string;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'delivered';
  delivery: boolean;
  created: string;
  updated: string;
  formattedItems?: Array<{
    id: string;
    type?: 'ingredient' | 'saved-salad' | 'premade';
    name: string;
    emoji: string;
    quantity: number;
    price: number;
    categoryName?: string;
    ingredients?: Array<{ name: string; quantity: number; price: number; emoji?: string }>;
    ingredientCount?: number;
    customized?: boolean;
    originalSaladId?: string;
  }>;
}

// Define the type for raw order records from the database
type OrderRecord = {
  id: string;
  user_id: string;
  items: Record<string, number>;
  items_detail?: Array<{
    type: 'ingredient' | 'saved-salad' | 'premade';
    id: string;
    name: string;
    quantity: number;
    price: number;
    ingredients?: Record<string, number>;
    customized?: boolean;
    customizations?: Array<{ id: string; quantity: number }> | Record<string, number>;
    originalSaladId?: string;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'delivered';
  delivery: boolean;
  created: string;
  updated: string;
};

const formatOrderItems = async (orderRecords: OrderRecord[]): Promise<OrderWithDetails[]> => {
  try {
    const [ingredients, userSalads, categories] = await Promise.all([
      ingredientService.getAll(),
      pb.authStore.isValid ? saladService.getUserSalads() : Promise.resolve([]),
      categoryService.getAll().catch(() => [])
    ]);

    return Promise.all(orderRecords.map(async (order) => {
      if (order.items_detail && Array.isArray(order.items_detail)) {
        const formattedItems = order.items_detail.map(detail => {
          if (detail.type === 'premade' && (detail.customized || detail.name?.includes('Custom'))) {
            const ingredients_array = [];
            
            if (detail.customizations) {
              const hasInvalidFormat = Array.isArray(detail.customizations) && 
                detail.customizations.some(c => c.id === "ingredients" && c.quantity === null);
              
              if (hasInvalidFormat) {
                ingredients_array.push({
                  id: detail.id + "_custom_ingredient",
                  name: "Custom Ingredient",
                  quantity: 1,
                  price: 0,
                  emoji: '🥬'
                });
                
                console.log('Found invalid customizations format for', detail.name, '- using placeholder');
              } else {
                let customizationsArray;
                
                if (Array.isArray(detail.customizations)) {
                  customizationsArray = detail.customizations.filter(
                    c => c && c.id && c.id !== "ingredients" && c.quantity !== null
                  );
                } else {
                  customizationsArray = Object.entries(detail.customizations).map(([id, qty]) => ({
                    id,
                    quantity: typeof qty === 'number' ? qty : Number(qty) || 1
                  }));
                }
                
                for (const ing of customizationsArray) {
                  const ingredient = ingredients.find(i => i.id === ing.id);
                  if (ingredient) {
                    ingredients_array.push({
                      id: ing.id,
                      name: ingredient.name || 'Unknown',
                      quantity: ing.quantity || 1,
                      price: ingredient.price || 0,
                      emoji: ingredient.emoji || '🥬'
                    });
                  }
                }
              }
            }
            
            const originalId = detail.originalSaladId || detail.id;
            
            return {
              id: detail.id,
              originalSaladId: originalId,
              type: 'premade' as const,
              name: detail.name || 'Customized Salad',
              emoji: '🥗',
              quantity: detail.quantity || 1,
              price: detail.price || 0,
              customized: true,
              ingredients: ingredients_array,
              ingredientCount: ingredients_array.length
            };
          }

          if (detail.type === 'saved-salad') {
            const ingredients_array = [];
            if (detail.ingredients) {
              if (Array.isArray(detail.ingredients)) {
                ingredients_array.push(...detail.ingredients);
              } else {
                for (const [ingId, ingInfo] of Object.entries(detail.ingredients)) {
                  if (typeof ingInfo === 'object' && ingInfo !== null) {
                    const typedIngInfo = ingInfo as {
                      name?: string;
                      quantity?: number;
                      price?: number;
                      emoji?: string;
                    };
                    ingredients_array.push({
                      id: ingId,
                      name: typedIngInfo.name || 'Unknown',
                      quantity: typedIngInfo.quantity || 1,
                      price: typedIngInfo.price || 0,
                      emoji: typedIngInfo.emoji || '🥬'
                    });
                  } else {
                    const ingredient = ingredients.find(ing => ing.id === ingId);
                    if (ingredient) {
                      ingredients_array.push({
                        id: ingId,
                        name: ingredient.name || 'Unknown',
                        quantity: Number(ingInfo),
                        price: ingredient.price || 0,
                        emoji: ingredient.emoji || '🥬'
                      });
                    }
                  }
                }
              }
            }

            return {
              id: detail.id,
              type: 'saved-salad' as const,
              name: detail.name || 'Custom Salad',
              emoji: '🥗',
              quantity: detail.quantity || 1,
              price: detail.price || 0,
              ingredients: ingredients_array,
              ingredientCount: ingredients_array.length
            };
          } else {
            const ingredient = ingredients.find(ing => ing.id === detail.id);
            
            let categoryName = '';
            if (ingredient?.category) {
              const category = categories.find(cat => cat.id === ingredient.category);
              categoryName = category?.name || '';
            }
            
            return {
              id: detail.id,
              type: 'ingredient' as const,
              name: detail.name || (ingredient?.name || 'Unknown Ingredient'),
              emoji: ingredient?.emoji || '🥬',
              quantity: detail.quantity || 1,
              price: detail.price || (ingredient?.price || 0),
              categoryName
            };
          }
        });

        return {
          ...order,
          formattedItems: formattedItems.filter(Boolean)
        };
      } else {
        let orderItems = order.items;
        
        if (typeof orderItems === 'string') {
          try {
            orderItems = JSON.parse(orderItems);
          } catch (e) {
            console.error('Error parsing order items:', e);
            orderItems = {};
          }
        }
        
        if (!orderItems || typeof orderItems !== 'object') {
          orderItems = {};
        }
        
        const formattedItems = [];
        
        for (const [itemId, quantity] of Object.entries(orderItems)) {
          if (itemId.startsWith('salad_')) {
            const saladId = itemId.replace('salad_', '');
            const salad = userSalads.find(s => s.id === saladId);
            
            if (salad) {
              const ingredients_array = [];
              if (salad.ingredients) {
                for (const [ingId, ingQty] of Object.entries(salad.ingredients)) {
                  const ingredient = ingredients.find(ing => ing.id === ingId);
                  if (ingredient) {
                    ingredients_array.push({
                      id: ingId,
                      name: ingredient.name || 'Unknown',
                      quantity: Number(ingQty),
                      price: ingredient.price || 0,
                      emoji: ingredient.emoji || '🥬'
                    });
                  }
                }
              }
              
              formattedItems.push({
                id: itemId,
                type: 'saved-salad' as const,
                name: salad.name || 'Custom Salad',
                emoji: '🥗',
                quantity: Number(quantity),
                price: salad.total_price || 0,
                ingredients: ingredients_array,
                ingredientCount: ingredients_array.length
              });
            }
          } else if (itemId.includes('_from_')) {
            continue;
          } else {
            const ingredient = ingredients.find(ing => ing.id === itemId);
            if (ingredient) {
              let categoryName = '';
              if (ingredient.category) {
                const category = categories.find(cat => cat.id === ingredient.category);
                categoryName = category?.name || '';
              }
              
              formattedItems.push({
                id: itemId,
                type: 'ingredient' as const,
                name: ingredient.name || 'Ingredient',
                emoji: ingredient.emoji || '🥬',
                quantity: Number(quantity),
                price: ingredient.price || 0,
                categoryName
              });
            }
          }
        }
        
        const fromSaladItems = Object.entries(orderItems).filter(([key]) => key.includes('_from_'));
        
        if (fromSaladItems.length > 0) {
          const saladGroups: Record<string, {
            id: string;
            name: string;
            ingredients: Array<{
              id: string;
              name: string;
              emoji: string;
              quantity: number;
              price: number;
            }>;
            totalPrice: number;
          }> = {};
          
          for (const [itemKey, quantity] of fromSaladItems) {
            const [ingredientId, saladId] = itemKey.split('_from_');
            
            if (!saladGroups[saladId]) {
              saladGroups[saladId] = {
                id: saladId,
                name: 'Custom Salad',
                ingredients: [],
                totalPrice: 0
              };
              
              const salad = userSalads.find(s => s.id === saladId);
              if (salad) {
                saladGroups[saladId].name = salad.name;
              }
            }
            
            const ingredient = ingredients.find(ing => ing.id === ingredientId);
            if (ingredient) {
              saladGroups[saladId].ingredients.push({
                id: ingredientId,
                name: ingredient.name || 'Unknown Ingredient',
                emoji: ingredient.emoji || '🥬',
                quantity: Number(quantity),
                price: ingredient.price || 0
              });
              
              saladGroups[saladId].totalPrice += (ingredient.price || 0) * Number(quantity);
            }
          }
          
          for (const [saladId, group] of Object.entries(saladGroups)) {
            formattedItems.push({
              id: saladId,
              type: 'saved-salad' as const,
              name: group.name,
              emoji: '🥗',
              quantity: 1,
              price: group.totalPrice,
              ingredients: group.ingredients,
              ingredientCount: group.ingredients.length
            });
          }
        }
        
        return {
          ...order,
          formattedItems: formattedItems.filter(Boolean)
        };
      }
    }));
  } catch (error) {
    console.error('Error formatting order items:', error);
    return orderRecords;
  }
};

const OrderCard = ({ order, onReorder, showReorderButton = true, recentlyUpdated }: { order: OrderWithDetails; onReorder: (order: OrderWithDetails) => void; showReorderButton?: boolean; recentlyUpdated: string | null }) => {
  const [expanded, setExpanded] = useState(false);
  const isRecentlyUpdated = order.id === recentlyUpdated;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Truck className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: isRecentlyUpdated
          ? ['0 0 0 rgba(16, 185, 129, 0)', '0 0 15px rgba(16, 185, 129, 0.7)', '0 0 0 rgba(16, 185, 129, 0)']
          : 'none',
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        boxShadow: {
          repeat: isRecentlyUpdated ? 2 : 0,
          duration: 1.5,
        },
      }}
      className={`overflow-hidden transition-all duration-200 bg-white rounded-lg shadow-sm hover:shadow-md ${
        isRecentlyUpdated ? 'ring-2 ring-green-400 bg-green-50' : ''
      }`}
    >
      <div className="p-4 border-b border-gray-100 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">#{order.id.substring(0, 6)}</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </span>
              {order.delivery && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Truck className="w-3 h-3 mr-1" />
                  Delivery
                </span>
              )}
            </div>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Clock className="w-3.5 h-3.5 mr-1 opacity-70" />
              {new Date(order.created).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-expanded={expanded}
              >
                {expanded ? 'Hide' : 'Details'}
              </button>

              {showReorderButton && (order.status === 'completed' || order.status === 'delivered') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder(order);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors flex items-center"
                >
                  <RefreshCcw className="w-3 h-3 mr-1.5" />
                  Reorder
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 bg-gray-50">
              <h3 className="mb-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Order Items</h3>
              <div className="mb-4 space-y-3">
                {order.formattedItems && order.formattedItems.length > 0 ? (
                  order.formattedItems.map((item) => (
                    <div key={item.id} className="pb-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="mr-2 text-xl">{item.emoji}</span>
                          <div>
                            <span className="font-medium text-gray-800">{item.name}</span>
                            {item.categoryName && (
                              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{item.categoryName}</span>
                            )}
                            {item.type === 'saved-salad' && item.ingredientCount && (
                              <span className="ml-2 text-xs text-green-600">{item.ingredientCount} ingredients</span>
                            )}
                            {item.type === 'premade' && item.customized && item.ingredientCount && (
                              <span className="ml-2 text-xs text-blue-600">{item.ingredientCount} customizations</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">×{item.quantity}</span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>

                      {item.type === 'saved-salad' && item.ingredients && item.ingredients.length > 0 && (
                        <div className="mt-2 pl-8 space-y-1.5 bg-gray-50 p-3 rounded-md">
                          <div className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">Ingredients:</div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {item.ingredients.map((ing, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-600">
                                <span className="mr-1.5">{ing.emoji}</span>
                                <span>{ing.name}</span>
                                <span className="ml-auto text-gray-500">×{ing.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.type === 'premade' && item.customized && item.ingredients && item.ingredients.length > 0 && (
                        <div className="mt-2 pl-8 space-y-1.5 bg-gray-50 p-3 rounded-md">
                          <div className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">Customizations:</div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {item.ingredients.map((ing, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-600">
                                <span className="mr-1.5">{ing.emoji}</span>
                                <span>{ing.name}</span>
                                <span className="ml-auto text-gray-500">×{ing.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-center text-gray-500">No items found in this order</div>
                )}
              </div>
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Total</span>
                  <span className="font-bold text-gray-900">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { reorderFromHistory } = useCart();

  const handleReorder = async (order: OrderWithDetails) => {
    try {
      if ((!order.items || Object.keys(order.items).length === 0) && (!order.items_detail || order.items_detail.length === 0)) {
        toast?.error('This order has no items to reorder');
        return;
      }

      interface CartItem {
        type: 'ingredient' | 'saved-salad' | 'premade';
        id: string;
        name: string;
        quantity: number;
        price: number;
        customized?: boolean;
        ingredients?: Record<string, number>;
        customizations?: Record<string, number>;
      }

      const processedItems = order.items_detail?.map(item => {
        const newItem: Partial<CartItem> = {
          type: item.type,
          id: item.id,
          name: item.name,
          quantity: item.quantity || 1, 
          price: item.price || 0,
          customized: item.customized
        };
        
        if (item.type === 'premade' && item.customized) {
          const hasInvalidFormat = Array.isArray(item.customizations) && 
            item.customizations.some(c => c.id === "ingredients" && c.quantity === null);
            
          if (hasInvalidFormat) {
            console.log('Found invalid customization format in reorder, using original salad');
            
            const formattedItem = order.formattedItems?.find(fi => fi.id === item.id);
            if (formattedItem && formattedItem.originalSaladId) {
              newItem.id = formattedItem.originalSaladId;
            }
            
            newItem.customized = false;
            newItem.customizations = {};
          } else if (item.customizations) {
            const customizationsRecord: Record<string, number> = {};
            
            if (Array.isArray(item.customizations)) {
              item.customizations
                .filter(c => c && c.id && c.id !== "ingredients" && typeof c.quantity === 'number')
                .forEach(c => {
                  customizationsRecord[c.id] = c.quantity;
                });
            } else {
              Object.entries(item.customizations).forEach(([key, value]) => {
                if (key !== "ingredients" && value !== null) {
                  customizationsRecord[key] = typeof value === 'number' ? value : Number(value) || 1;
                }
              });
            }
            
            if (Object.keys(customizationsRecord).length > 0) {
              newItem.customizations = customizationsRecord;
            } else {
              newItem.customized = false;
            }
          }
        }
        
        if (item.ingredients) {
          if (Array.isArray(item.ingredients)) {
            const ingredientsRecord: Record<string, number> = {};
            item.ingredients.forEach(ing => {
              if (typeof ing === 'object' && ing !== null && ing.id) {
                ingredientsRecord[ing.id] = ing.quantity || 1;
              }
            });
            newItem.ingredients = ingredientsRecord;
          } else {
            newItem.ingredients = item.ingredients as Record<string, number>;
          }
        }
        
        return newItem;
      });

      await reorderFromHistory(order.items, processedItems || []);
      toast?.success('Items added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
      toast?.error('Failed to reorder. Please try again.');
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!pb.authStore.isValid) return;

    try {
      setIsLoading(true);

      const orderRecords = await pb.collection('orders').getFullList({
        filter: `user_id = "${pb.authStore.model?.id}"`,
        sort: `${sortOrder === 'newest' ? '-' : ''}created`,
      });

      const processedOrders = await formatOrderItems(orderRecords as unknown as OrderRecord[]);
      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast?.error('Failed to load your orders');
    } finally {
      setIsLoading(false);
    }
  }, [sortOrder]);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      fetchOrders();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchOrders]);

  useEffect(() => {
    if (!pb.authStore.isValid) return;

    interface UnsubscribeFunc {
      (): void;
    }
    
    type UnsubscribePromise = Promise<UnsubscribeFunc | null>;
    
    let unsubscribePromise: UnsubscribePromise | null = null;
    let isSubscribed = true;

    const setupSubscription = async () => {
      try {
        unsubscribePromise = pb.collection('orders').subscribe('*', async (data) => {
          if (!isSubscribed) return;

          if (data.record?.user_id === pb.authStore.model?.id) {
            console.log('Realtime update received:', data);

            if (data.action === 'create') {
              const processedOrder = await formatOrderItems([data.record] as unknown as OrderRecord[]);
              setOrders((prev) => [processedOrder[0], ...prev]);
              toastNotify.success('New order created!');
            } else if (data.action === 'update') {
              const processedOrder = await formatOrderItems([data.record as unknown as OrderRecord]);
              setOrders((prev) => prev.map((order) => (order.id === data.record.id ? processedOrder[0] : order)));

              const prevOrder = orders.find((o) => o.id === data.record.id);
              if (prevOrder && prevOrder.status !== data.record.status) {
                setRecentlyUpdated(data.record.id);
                setTimeout(() => setRecentlyUpdated(null), 5000);

                toastNotify.success(
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      Order #{data.record.id.substring(0, 6)} status changed to <strong>{data.record.status}</strong>
                    </span>
                  </div>
                );
              }
            } else if (data.action === 'delete') {
              setOrders((prev) => prev.filter((order) => order.id !== data.record.id));
              toastNotify('An order was removed');
            }
          }
        });
      } catch (error) {
        console.error('Failed to subscribe to order updates:', error);
      }
    };

    setupSubscription();

    return () => {
      isSubscribed = false;
      if (unsubscribePromise) {
        unsubscribePromise
          .then((unsubscribeFunc) => {
            if (typeof unsubscribeFunc === 'function') {
              unsubscribeFunc();
            }
          })
          .catch((err) => {
            console.error('Error unsubscribing:', err);
          });
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      <Header cartItems={0} />

      <main className="max-w-5xl px-4 pt-6 pb-20 mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Your Orders
          </motion.h1>

          <div className="flex items-center gap-2">
            <div className="relative sm:w-64">
              <Search className="absolute w-4 h-4 text-gray-400 top-2.5 left-3" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full py-2 pr-3 text-sm transition-all border rounded-lg pl-9 focus:ring-2 focus:ring-green-200 focus:border-green-400"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Sort Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                      className="w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="text-sm text-gray-600">Showing {orders.length} orders</div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : orders.length > 0 ? (
            <AnimatePresence mode="wait">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 25,
                  }}
                  className="mb-4"
                >
                  <OrderCard order={order} onReorder={() => handleReorder(order)} showReorderButton={true} recentlyUpdated={recentlyUpdated} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center bg-white border border-gray-100 rounded-lg shadow-sm"
            >
              <ShoppingBag className="mx-auto mb-4 text-gray-400 w-14 h-14" />
              <h3 className="mb-1 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mb-4 text-gray-500">You haven't placed any orders yet.</p>
              <button
                onClick={() => navigate('/menu')}
                className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Menu
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}