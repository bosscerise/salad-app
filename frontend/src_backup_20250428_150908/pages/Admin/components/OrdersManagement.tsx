import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, RefreshCw, ChevronDown, Truck, Clock, 
  CheckCircle, XCircle, X, User, ArrowDown, ArrowUp, 
  Calendar, AlertTriangle, ShoppingBag, Coffee
} from 'lucide-react';
import { pb } from '../../../pb/pocketbase';
import { toast } from 'react-hot-toast';

// Order type definition similar to OrdersPage but with user info
interface OrderWithDetails {
  id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  items: Record<string, number>;
  items_detail?: Array<{
    type: 'ingredient' | 'saved-salad' | 'premade';
    id: string;
    name: string;
    quantity: number;
    price: number;
    ingredients?: Record<string, number>;
    customized?: boolean;
    originalSaladId?: string;
    emoji?: string;
    customizations?: Array<{
      id: string;
      quantity: number;
      name?: string;
      price?: number;
      emoji?: string;
    }>;
  }>;
  total: number;
  status: 'pending' | 'prepping' | 'ready' | 'cancelled' | 'delivered';
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
  }>;
  // Address details for delivery orders
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    instructions?: string;
  };
  // Payment info
  payment_method?: string;
  payment_status?: 'paid' | 'pending' | 'failed';
  // Any additional customer notes
  notes?: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: <Clock size={14} /> },
  { value: 'prepping', label: 'Prepping', icon: <Coffee size={14} /> },
  { value: 'ready', label: 'Ready', icon: <CheckCircle size={14} /> },
  { value: 'delivered', label: 'Delivered', icon: <Truck size={14} /> },
  { value: 'cancelled', label: 'Cancelled', icon: <XCircle size={14} /> }
];

const OrderCard = ({ 
  order, 
  onStatusUpdate, 
  isUpdating, 
  isRecentlyUpdated
}: { 
  order: OrderWithDetails; 
  onStatusUpdate: (orderId: string, status: string) => void;
  isUpdating: boolean;
  isRecentlyUpdated: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'prepping': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'prepping': return <Coffee className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <Truck className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: isRecentlyUpdated
          ? ['0 0 0 rgba(16, 185, 129, 0)', '0 0 15px rgba(16, 185, 129, 0.7)', '0 0 0 rgba(16, 185, 129, 0)']
          : 'none'
      }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.2,
        boxShadow: {
          repeat: isRecentlyUpdated ? 2 : 0,
          duration: 1.5,
        }
      }}
      className={`mb-4 bg-white rounded-lg shadow-md border border-gray-100 ${
        isRecentlyUpdated ? 'ring-2 ring-emerald-500' : ''
      }`}
    >
      <div className="p-4 border-b border-gray-100 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2 py-1 text-sm font-medium rounded-md text-emerald-800 bg-emerald-50">
                #{order.id.substring(0, 8)}
              </span>
              <div className="relative inline-block">
                <button
                  onClick={() => setShowStatusDropdown(prev => !prev)}
                  className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border cursor-pointer relative ${getStatusColor(order.status)}`}
                  disabled={isUpdating}
                >
                  {getStatusIcon(order.status)}
                  <span className="mx-1 capitalize">{order.status}</span>
                  <ChevronDown size={14} className={`transform transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Status dropdown */}
                {showStatusDropdown && (
                  <div className="absolute left-0 z-20 w-40 mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          disabled={isUpdating || order.status === option.value}
                          onClick={() => {
                            onStatusUpdate(order.id, option.value);
                            setShowStatusDropdown(false);
                          }}
                          className={`flex w-full items-center px-4 py-2 text-sm ${
                            order.status === option.value
                              ? 'bg-gray-100 text-gray-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="mr-2">{option.icon}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {order.delivery && (
                <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Truck className="w-3 h-3 mr-1" />
                  Delivery
                </span>
              )}
              {order.payment_status && (
                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium ${
                  order.payment_status === 'paid' 
                    ? 'bg-green-50 text-green-700 border border-green-100' 
                    : order.payment_status === 'failed'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                }`}>
                  {order.payment_status === 'paid' ? <CheckCircle size={14} className="mr-1" /> : 
                   order.payment_status === 'failed' ? <AlertTriangle size={14} className="mr-1" /> :
                   <Clock size={14} className="mr-1" />}
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </span>
              )}
            </div>
            
            {/* User info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center text-gray-700">
                {order.user?.avatar ? (
                  <div className="w-6 h-6 mr-2 overflow-hidden rounded-full">
                    <img 
                      src={order.user.avatar} 
                      alt={order.user.name} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <User size={16} className="mr-2 p-0.5 bg-gray-100 rounded-full text-gray-600" />
                )}
                <span className="font-medium">
                  {order.user ? (order.user.name || order.user.email) : order.user_id.substring(0, 6)}
                </span>
              </div>
              {order.user?.email && (
                <span className="hidden text-gray-500 sm:inline-block">• {order.user.email}</span>
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={14} className="mr-1.5 opacity-70" />
              {new Date(order.created).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-emerald-700">${order.total.toFixed(2)}</div>
              <div className="text-xs text-gray-500">
                {order.formattedItems?.length || Object.keys(order.items || {}).length} items
              </div>
            </div>
            
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border ${
                  expanded 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {expanded ? 'Hide Details' : 'View Details'}
              </button>
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
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white border-t border-gray-100 rounded-b-lg">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Order details column */}
                <div className="md:col-span-2">
                  <h3 className="mb-3 text-sm font-bold tracking-wide text-gray-700 uppercase">Order Items</h3>
                  <div className="mb-4 space-y-3">
                    {order.formattedItems && order.formattedItems.length > 0 ? (
                      order.formattedItems.map((item) => (
                        <div key={item.id} className="flex flex-col p-4 border border-gray-100 rounded-lg shadow-sm bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="flex items-center justify-center w-10 h-10 mr-3 text-xl rounded-lg bg-emerald-100 text-emerald-700">
                                {item.emoji}
                              </span>
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-800">{item.name}</span>
                                  {item.customized && (
                                    <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                      Customized
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ${item.price.toFixed(2)} each 
                                  {item.ingredientCount > 0 && ` • ${item.ingredientCount} ingredients`}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm font-medium text-right">
                              <div className="text-gray-600">x{item.quantity}</div>
                              <div className="text-lg font-semibold text-emerald-700">${(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                          </div>

                          {/* Display ingredients */}
                          {item.ingredients && item.ingredients.length > 0 && (
                            <div className="p-3 mt-3 ml-2 bg-white border border-gray-100 rounded-md shadow-sm">
                              <div className="mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
                                {item.customized ? 'Customizations:' : 'Ingredients:'}
                              </div>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {item.ingredients.length === 0 ? (
                                  <div className="text-sm text-gray-500">No details available</div>
                                ) : item.ingredients.some(ing => ing.name === "Custom Ingredients") ? (
                                  <div className="flex items-center justify-between col-span-2 p-2 text-sm text-gray-600 rounded-md bg-blue-50">
                                    <span className="flex items-center">
                                      <span className="mr-1.5">🥗</span>
                                      <span>Custom ingredients</span>
                                    </span>
                                    <div className="flex flex-col items-end">
                                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                        Custom Order
                                      </span>
                                      <span className="mt-1 text-xs font-medium text-blue-700">
                                        ${item.price.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                ) : item.ingredients.some(ing => ing.name === "Standard Ingredients" || ing.name === "Base Salad Ingredients") ? (
                                  <div className="flex items-center justify-between col-span-2 p-2 text-sm text-gray-600 rounded-md bg-emerald-50">
                                    <span className="flex items-center">
                                      <span className="mr-1.5">🥗</span>
                                      <span>Standard salad ingredients</span>
                                    </span>
                                    <span className="text-xs font-medium text-emerald-700 px-2 py-0.5 bg-emerald-100 rounded-full">
                                      Base recipe
                                    </span>
                                  </div>
                                ) : (
                                  item.ingredients.map((ing, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm p-1.5 hover:bg-gray-50 rounded">
                                      <span className="flex items-center">
                                        <span className="flex items-center justify-center w-6 h-6 mr-2 text-sm bg-gray-100 rounded-full">
                                          {ing.emoji || '🥬'}
                                        </span>
                                        <span className="font-medium">{ing.name}</span>
                                      </span>
                                      <div className="flex items-center ml-2 text-gray-500">
                                        <span className="font-medium">x{ing.quantity}</span>
                                        <span className="ml-2 text-xs text-gray-400">${(ing.price || 0).toFixed(2)}</span>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center p-6 text-center text-gray-500 border border-gray-100 rounded-lg bg-gray-50">
                        No item details available
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Customer and delivery info */}
                <div>
                  <h3 className="mb-3 text-sm font-bold tracking-wide text-gray-700 uppercase">Order Information</h3>
                  
                  {order.delivery && order.address && (
                    <div className="p-4 mb-4 border border-indigo-100 rounded-lg shadow-sm bg-indigo-50">
                      <h4 className="flex items-center mb-2 font-medium text-indigo-700">
                        <Truck size={16} className="mr-2" /> Delivery Address
                      </h4>
                      <address className="not-italic text-indigo-800">
                        {order.address.street}<br />
                        {order.address.city}, {order.address.state} {order.address.zipCode}
                        {order.address.instructions && (
                          <div className="p-2 mt-2 text-sm italic text-indigo-600 bg-indigo-100 rounded">
                            <strong>Instructions:</strong> {order.address.instructions}
                          </div>
                        )}
                      </address>
                    </div>
                  )}
                  
                  <div className="p-4 mb-4 border border-gray-100 rounded-lg shadow-sm bg-gray-50">
                    <h4 className="mb-3 text-sm font-medium text-gray-800">Payment</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded">
                        <span className="text-sm text-gray-600">Method:</span>
                        <span className="font-medium text-gray-900">{order.payment_method || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`font-medium capitalize px-2 py-0.5 rounded-full ${
                          order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                          order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.payment_status || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {order.notes && (
                    <div className="p-4 mb-4 border border-yellow-100 rounded-lg shadow-sm bg-yellow-50">
                      <h4 className="mb-2 text-sm font-medium text-yellow-800">Customer Notes</h4>
                      <p className="p-2 text-sm italic text-yellow-800 bg-yellow-100 rounded">{order.notes}</p>
                    </div>
                  )}

                  <div className="p-4 border rounded-lg shadow-sm bg-emerald-50 border-emerald-100">
                    <div className="pb-3 mb-3 border-b border-emerald-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Subtotal</span>
                        <span className="font-medium">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Delivery Fee</span>
                        <span className="font-medium">${order.delivery ? '3.99' : '0.00'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-emerald-800">Total</span>
                      <span className="text-emerald-800">${(order.total + (order.delivery ? 3.99 : 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDelivery, setFilterDelivery] = useState('all');
  const [sortField, setSortField] = useState('created');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState<string | null>(null);

  // Fetch orders with expanded user info
  const fetchOrders = useCallback(async () => {
    if (!pb.authStore.isValid) {
      setError('Admin authentication required');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // First get all ingredients to have them ready
      let ingredients = [];
      try {
        const ingredientsResponse = await pb.collection('ingredients').getList(1, 500, {
          sort: 'name',
          fields: 'id,name,emoji,price'
        });
        ingredients = ingredientsResponse.items;
      } catch (err) {
        console.error('Error pre-fetching ingredients:', err);
      }

      // Also fetch all salads for standard salad ingredients
      let salads = [];
      try {
        const saladsResponse = await pb.collection('salads').getList(1, 100, {
          sort: 'name',
          fields: 'id,name,ingredients,price'
        });
        salads = saladsResponse.items;
      } catch (err) {
        console.error('Error pre-fetching salads:', err);
      }

      // Get all orders
      const orderRecords = await pb.collection('orders').getList(1, 100, {
        sort: `${sortDirection === 'desc' ? '-' : ''}${sortField}`,
        expand: 'user_id'
      });

      // Create lookup maps for faster access
      const ingredientsMap = {};
      ingredients.forEach(ing => {
        ingredientsMap[ing.id] = ing;
      });

      const saladsMap = {};
      salads.forEach(salad => {
        saladsMap[salad.id] = salad;
      });

      // Process and format orders
      const enhancedOrders = orderRecords.items.map(record => {
        const processedOrder = processOrderData(record);
        
        // Immediately enhance order with ingredient and salad information
        if (processedOrder.formattedItems) {
          processedOrder.formattedItems.forEach(item => {
            // For standard salads, try to find ingredients
            if (item.type === 'premade' && !item.customized && 
                (item.ingredients.length === 0 || item.ingredients.some(ing => ing.needsFetch))) {
              
              const salad = saladsMap[item.id];
              if (salad) {
                // Replace placeholder with actual ingredients
                item.ingredients = [];
                
                // Process salad ingredients
                if (salad.ingredients) {
                  let ingredientsList = [];
                  
                  if (typeof salad.ingredients === 'string') {
                    try {
                      ingredientsList = JSON.parse(salad.ingredients);
                    } catch (e) {
                      ingredientsList = salad.ingredients.split(',').map(i => i.trim());
                    }
                  } else if (Array.isArray(salad.ingredients)) {
                    ingredientsList = salad.ingredients;
                  } else if (typeof salad.ingredients === 'object') {
                    ingredientsList = Object.entries(salad.ingredients).map(([id, qty]) => ({
                      id, quantity: qty
                    }));
                  }
                  
                  for (const ing of ingredientsList) {
                    let ingId = '';
                    let ingQty = 1;
                    
                    if (typeof ing === 'string') {
                      ingId = ing;
                    } else if (ing && typeof ing === 'object') {
                      ingId = ing.id || '';
                      ingQty = ing.quantity || 1;
                    }
                    
                    if (ingId) {
                      const ingredientData = ingredientsMap[ingId];
                      if (ingredientData) {
                        item.ingredients.push({
                          id: ingId,
                          name: ingredientData.name || 'Unknown',
                          quantity: ingQty,
                          price: ingredientData.price || 0,
                          emoji: ingredientData.emoji || '🥬'
                        });
                      }
                    }
                  }
                  
                  // Update ingredient count
                  item.ingredientCount = item.ingredients.length;
                }
                
                // If we still have no ingredients, add a placeholder
                if (item.ingredients.length === 0) {
                  item.ingredients.push({
                    id: 'unknown_ingredient',
                    name: "Base Salad Ingredients",
                    quantity: 1,
                    price: 0,
                    emoji: '🥗'
                  });
                  item.ingredientCount = 1;
                }
              }
            }
            
            // Handle customized ingredients lookup
            if (item.ingredients) {
              item.ingredients.forEach(ing => {
                if (ing.needsLookup) {
                  const ingredientData = ingredientsMap[ing.id];
                  if (ingredientData) {
                    ing.name = ingredientData.name || ing.name;
                    ing.emoji = ingredientData.emoji || ing.emoji;
                    ing.price = ingredientData.price || 0;
                    delete ing.needsLookup;
                  }
                }
              });
            }
          });
        }
        
        return processedOrder;
      });
      
      setOrders(enhancedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sortField, sortDirection]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription
    let isSubscribed = true;
    const subscribeToOrders = async () => {
      try {
        await pb.collection('orders').subscribe('*', (data) => {
          if (!isSubscribed) return;
          
          if (data.action === 'create') {
            // Process and add the new order
            const processedOrder = processOrderData(data.record);
            setOrders(prev => [processedOrder, ...prev]);
            
            toast('New order received!', {
              icon: '🔔',
              duration: 5000
            });
          } else if (data.action === 'update') {
            // Update order in state without refetching
            const processedOrder = processOrderData(data.record);
            setOrders(prev => prev.map(order => 
              order.id === data.record.id ? processedOrder : order
            ));
            
            setRecentlyUpdated(data.record.id);
            setTimeout(() => setRecentlyUpdated(null), 3000);
          } else if (data.action === 'delete') {
            setOrders(prev => prev.filter(order => order.id !== data.record.id));
          }
        });
      } catch (error) {
        console.error('Error subscribing to orders:', error);
      }
    };
    
    subscribeToOrders();
    
    // Cleanup
    return () => {
      isSubscribed = false;
      pb.collection('orders').unsubscribe();
    };
  }, []);
  
  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (updatingOrder) return;
    
    setUpdatingOrder(orderId);
    try {
      // Update the order status in the database
      await pb.collection('orders').update(orderId, {
        status: newStatus
      });
      
      // Find the existing order with all its expanded data
      const existingOrder = orders.find(order => order.id === orderId);
      if (!existingOrder) return;
      
      // Update local state while preserving all other data
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...existingOrder, status: newStatus } : order
      ));
      
      toast.success(`Order #${orderId.substring(0, 6)} updated to ${newStatus}`);
      setRecentlyUpdated(orderId);
      setTimeout(() => setRecentlyUpdated(null), 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };
  
  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }
    
    // Delivery filter
    if (filterDelivery !== 'all') {
      const isDelivery = order.delivery === true;
      if ((filterDelivery === 'delivery' && !isDelivery) || 
          (filterDelivery === 'pickup' && isDelivery)) {
        return false;
      }
    }
    
    // Text search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      
      // Search in order ID
      if (order.id.toLowerCase().includes(searchLower)) return true;
      
      // Search in user info
      if (order.user && 
        (order.user.name?.toLowerCase().includes(searchLower) || 
         order.user.email?.toLowerCase().includes(searchLower))) {
        return true;
      }
      
      // Search in items
      if (order.formattedItems && order.formattedItems.some(item => 
        item.name.toLowerCase().includes(searchLower))) {
        return true;
      }
      
      // No match found
      return false;
    }
    
    // Include by default if no search text
    return true;
  });

  // Toggle sort direction
  const handleSortToggle = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-5 border-b border-gray-200">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-xl font-bold text-gray-800">Orders Management</h2>
          
          <div className="flex flex-wrap items-center w-full gap-3 sm:w-auto">
            <div className="relative flex-1 w-full sm:w-64">
              <Search className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" size={16} />
              <input
                type="text"
                placeholder="Search orders, users..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full px-3 py-2 pr-3 text-sm border rounded-lg pl-9 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute -translate-y-1/2 right-3 top-1/2"
                >
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(prev => !prev)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Filter size={16} className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Filters'}
              <span className="ml-1.5 flex items-center justify-center w-5 h-5 text-xs text-white bg-emerald-500 rounded-full">
                {filterStatus !== 'all' || filterDelivery !== 'all' ? 
                  ((filterStatus !== 'all' ? 1 : 0) + (filterDelivery !== 'all' ? 1 : 0)) : 
                  0}
              </span>
            </button>
            
            <button
              onClick={() => fetchOrders()}
              className="flex items-center px-3 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
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
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="prepping">Prepping</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Delivery Method</label>
                  <select
                    value={filterDelivery}
                    onChange={(e) => setFilterDelivery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">All Methods</option>
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Pickup</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Sort By</label>
                  <select
                    value={sortField}
                    onChange={(e) => {
                      setSortField(e.target.value);
                      fetchOrders();
                    }}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="created">Order Date</option>
                    <option value="status">Status</option>
                    <option value="total">Total Amount</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Order</label>
                  <div className="flex">
                    <button
                      onClick={() => {
                        setSortDirection('desc');
                        fetchOrders();
                      }}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-lg border 
                        ${sortDirection === 'desc' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-white text-gray-700 border-gray-200'}`}
                    >
                      <ArrowDown size={16} className="inline mr-1" /> Desc
                    </button>
                    <button
                      onClick={() => {
                        setSortDirection('asc');
                        fetchOrders();
                      }}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b 
                        ${sortDirection === 'asc' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-white text-gray-700 border-gray-200'}`}
                    >
                      <ArrowUp size={16} className="inline mr-1" /> Asc
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterDelivery('all');
                    setSortField('created');
                    setSortDirection('desc');
                    setSearchText('');
                    fetchOrders();
                  }}
                  className="px-4 py-2 text-xs font-medium text-white transition-colors bg-gray-500 rounded-md hover:bg-gray-600"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Order stats summary */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 md:grid-cols-6">
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <h3 className="text-xs font-medium text-gray-500">Total Orders</h3>
          <p className="mt-1 text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <h3 className="text-xs font-medium text-gray-500">Pending</h3>
          <p className="mt-1 text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <h3 className="text-xs font-medium text-gray-500">Prepping</h3>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'prepping').length}
          </p>
        </div>
        
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <h3 className="text-xs font-medium text-gray-500">Ready</h3>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'ready').length}
          </p>
        </div>
        
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <h3 className="text-xs font-medium text-gray-500">Delivered</h3>
          <p className="mt-1 text-2xl font-bold text-indigo-600">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
        
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <h3 className="text-xs font-medium text-gray-500">Cancelled</h3>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {orders.filter(o => o.status === 'cancelled').length}
          </p>
        </div>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <RefreshCw size={36} className="text-emerald-600 animate-spin" />
              <span className="mt-4 text-gray-500">Loading orders...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-lg bg-red-50">
            <AlertTriangle size={32} className="mx-auto mb-2 text-red-500" />
            <h3 className="mb-1 text-lg font-medium text-red-800">Error Loading Orders</h3>
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <ShoppingBag className="mb-4 text-gray-300" size={48} />
            <h3 className="mb-1 text-xl font-medium text-gray-700">No Orders Found</h3>
            <p className="mb-4 text-sm text-gray-500">
              {searchText || filterStatus !== 'all' || filterDelivery !== 'all' ? 
                'Try adjusting your filters to see more orders' : 
                'There are no orders in the system yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <OrderCard 
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={updatingOrder === order.id}
                isRecentlyUpdated={recentlyUpdated === order.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Optimized processOrderData function
function processOrderData(record) {
  let items = record.items;
  let itemsDetail = record.items_detail;
  let address = record.address;
  
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch (e) { items = {}; }
  }
  
  if (typeof itemsDetail === 'string') {
    try { itemsDetail = JSON.parse(itemsDetail); } catch (e) { itemsDetail = []; }
  }
  
  if (typeof address === 'string') {
    try { address = JSON.parse(address); } catch (e) { address = {}; }
  }

  // Process order items
  const formattedItems = Array.isArray(itemsDetail) ? itemsDetail.map(item => {
    const ingredientsArray = [];
    let isCustomItem = false;
    
    // Handle saved salads
    if (item.type === 'saved-salad' && Array.isArray(item.ingredients)) {
      // Process ingredients from saved salad
      item.ingredients.forEach(ing => {
        if (ing && typeof ing === 'object' && ing.id) {
          ingredientsArray.push({
            id: ing.id,
            name: ing.name || 'Unknown ingredient',
            quantity: ing.quantity || 1,
            price: ing.price || 0,
            emoji: ing.emoji || '🥬'
          });
        }
      });
      
      // If we have ingredients data, return the processed item immediately
      if (ingredientsArray.length > 0) {
        return {
          id: item.id,
          originalSaladId: item.originalSaladId || item.id,
          type: 'saved-salad',
          name: item.name || 'Custom Salad',
          emoji: item.emoji || '🥗',
          quantity: item.quantity || 1,
          price: item.price || 0,
          ingredients: ingredientsArray,
          ingredientCount: ingredientsArray.length,
          customized: false,
        };
      }
      
      // If the array format failed, try object format (backwards compatibility)
      if (item.ingredients && typeof item.ingredients === 'object' && !Array.isArray(item.ingredients)) {
        Object.entries(item.ingredients).forEach(([ingId, ingData]) => {
          let name = 'Unknown';
          let quantity = 1;
          let price = 0;
          let emoji = '🥬';
          
          if (typeof ingData === 'object' && ingData !== null) {
            name = ingData.name || 'Unknown';
            quantity = ingData.quantity || 1;
            price = ingData.price || 0;
            emoji = ingData.emoji || '🥬';
          } else if (typeof ingData === 'number') {
            quantity = ingData;
          }
          
          ingredientsArray.push({
            id: ingId,
            name: name,
            quantity: quantity,
            price: price,
            emoji: emoji
          });
        });
      }
    }
    
    // Check if this is a salad item (both custom and standard)
    if (item.type === 'premade') {
      // Check for the problematic customization format first
      const hasInvalidFormat = item.customizations && Array.isArray(item.customizations) && 
        item.customizations.some(c => c && c.id === "ingredients" && c.quantity === null);
      
      if (item.customized || (item.name && item.name.includes('Custom'))) {
        if (hasInvalidFormat) {
          isCustomItem = true;
          
          // Look for ingredients elsewhere in the record
          if (item.ingredients && typeof item.ingredients === 'object') {
            // Convert ingredients object to array for display
            Object.entries(item.ingredients).forEach(([ingId, quantity]) => {
              ingredientsArray.push({
                id: ingId,
                name: `Ingredient ${ingId.substring(0, 4)}...`,
                quantity: typeof quantity === 'number' ? quantity : 1,
                price: 0,
                emoji: '🥬',
                needsLookup: true
              });
            });
          } 
          
          // If no ingredients found, add a generic placeholder
          if (ingredientsArray.length === 0) {
            ingredientsArray.push({
              id: 'placeholder_ingredient',
              name: "Custom Ingredients",
              quantity: 1,
              price: item.price,
              emoji: '🥗'
            });
          }
        } else if (item.customizations) {
          try {
            if (Array.isArray(item.customizations)) {
              item.customizations
                .filter(c => c && c.id && c.id !== "ingredients" && c.quantity !== null)
                .forEach(customization => {
                  if (customization.name) {
                    ingredientsArray.push({
                      id: customization.id,
                      name: customization.name,
                      quantity: customization.quantity || 1,
                      price: customization.price || 0,
                      emoji: customization.emoji || '🥬'
                    });
                  } else {
                    ingredientsArray.push({
                      id: customization.id,
                      name: `Ingredient ${customization.id.substring(0, 4)}...`,
                      quantity: customization.quantity || 1,
                      price: 0,
                      emoji: '🥬',
                      needsLookup: true
                    });
                  }
                });
            } else if (typeof item.customizations === 'object') {
              Object.entries(item.customizations).forEach(([id, qty]) => {
                if (id !== "ingredients" && qty !== null) {
                  const quantity = typeof qty === 'number' ? qty : Number(qty) || 1;
                  
                  ingredientsArray.push({
                    id: id,
                    name: `Ingredient ${id.substring(0, 4)}...`,
                    quantity: quantity,
                    price: 0,
                    emoji: '🥬',
                    needsLookup: true
                  });
                }
              });
            }
          } catch (error) {
            // Silent error handling
          }
        }
      } else {
        // This is a standard salad
        ingredientsArray.push({
          id: 'standard_salad_ingredient',
          name: "Standard Ingredients",
          quantity: 1,
          price: 0,
          emoji: '🥗',
          needsFetch: true,
          saladId: item.id
        });
      }
    }
    
    // Create the processed item
    return {
      id: item.id,
      originalSaladId: item.originalSaladId || item.id,
      type: item.type || 'premade',
      name: item.name || (item.customized ? 'Custom Salad' : 'Item'),
      emoji: item.emoji || '🥗',
      quantity: item.quantity || 1,
      price: item.price || 0,
      ingredients: ingredientsArray,
      ingredientCount: ingredientsArray.length || (item.type === 'premade' ? 1 : 0),
      customized: item.customized || item.name?.includes('Custom') || isCustomItem,
    };
  }) : [];

  // Get user info if available
  const userInfo = record.expand?.user_id ? {
    id: record.expand.user_id.id,
    name: record.expand.user_id.name,
    email: record.expand.user_id.email,
    avatar: record.expand.user_id.avatar 
      ? pb.files.getURL(record.expand.user_id, record.expand.user_id.avatar, { thumb: '100x100' }) 
      : undefined
  } : undefined;
  
  const result = {
    ...record,
    items,
    items_detail: itemsDetail,
    address,
    user: userInfo,
    formattedItems
  };
  
  // Function to fetch standard salad ingredients
  const fetchStandardSaladIngredients = async () => {
    try {
      const saladsToFetch = formattedItems
        .filter(item => item.type === 'premade' && !item.customized && 
                 item.ingredients?.some(ing => ing.needsFetch))
        .map(item => {
          return item.id.startsWith('premade_') ? item.id.substring(8) : item.id;
        });
      
      if (saladsToFetch.length === 0) return;
      
      // Fix the filter syntax for PocketBase
      let filter;
      if (saladsToFetch.length === 1) {
        filter = `id = "${saladsToFetch[0]}"`;
      } else {
        filter = `id IN ("${saladsToFetch.join('","')}")`;
      }
      
      const saladsResponse = await pb.collection('salads').getList(1, 100, {
        filter: filter
      });

      const ingredientsResponse = await pb.collection('ingredients').getList(1, 500);
      const ingredientsMap = ingredientsResponse.items.reduce((acc, ing) => {
        acc[ing.id] = ing;
        return acc;
      }, {});
      
      for (const salad of saladsResponse.items) {
        const saladItem = formattedItems.find(item => item.id === salad.id);
        if (!saladItem) continue;
        
        saladItem.ingredients = [];
        
        if (salad.ingredients) {
          let ingredientsList = [];
          
          if (typeof salad.ingredients === 'string') {
            try {
              const parsed = JSON.parse(salad.ingredients);
              ingredientsList = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              ingredientsList = salad.ingredients.split(',').map(i => i.trim());
            }
          } else if (Array.isArray(salad.ingredients)) {
            ingredientsList = salad.ingredients;
          } else if (typeof salad.ingredients === 'object') {
            ingredientsList = Object.entries(salad.ingredients).map(([id, qty]) => ({
              id, quantity: qty
            }));
          }
          
          for (const ing of ingredientsList) {
            let ingId = '';
            let ingQty = 1;
            
            if (typeof ing === 'string') {
              ingId = ing;
            } else if (ing && typeof ing === 'object') {
              ingId = ing.id || '';
              ingQty = ing.quantity || 1;
            }
            
            if (ingId) {
              const ingredientData = ingredientsMap[ingId];
              if (ingredientData) {
                saladItem.ingredients.push({
                  id: ingId,
                  name: ingredientData.name || 'Unknown',
                  quantity: ingQty,
                  price: ingredientData.price || 0,
                  emoji: ingredientData.emoji || '🥬'
                });
              }
            }
          }
          
          saladItem.ingredientCount = saladItem.ingredients.length;
        }
        
        if (saladItem.ingredients.length === 0) {
          saladItem.ingredients.push({
            id: 'unknown_ingredient',
            name: "Base Salad Ingredients",
            quantity: 1,
            price: 0,
            emoji: '🥗'
          });
          saladItem.ingredientCount = 1;
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };
  
  // Start async fetching of ingredients
  fetchStandardSaladIngredients();
  
  return result;
}
