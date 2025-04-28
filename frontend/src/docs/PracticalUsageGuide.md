# Practical API Usage Guide

This guide demonstrates how to combine multiple API services and hooks in common scenarios within your Salad App.

## Building a Custom Salad Builder

This example shows how to create a component that lets users build and save a custom salad:

```tsx
import React, { useState } from 'react';
import { useIngredients } from '../hooks/useIngredients';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import { saladService, ingredientService } from '../pb';

function SaladBuilder() {
  const { categories, loading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { ingredients, loading: ingredientsLoading } = useIngredients(selectedCategory || undefined);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [saladName, setSaladName] = useState('');
  const { isAuthenticated, user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Toggle ingredient selection
  const toggleIngredient = (id: string) => {
    setSelectedIngredients(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  // Calculate total price
  const calculatePrice = async () => {
    if (selectedIngredients.length === 0) return 0;
    
    try {
      const items = await ingredientService.getIngredientsByIds(selectedIngredients);
      return items.reduce((total, item) => total + item.price, 0);
    } catch (err) {
      console.error('Error calculating price:', err);
      return 0;
    }
  };

  // Save custom salad
  const saveSalad = async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to save a salad');
      return;
    }
    
    if (selectedIngredients.length === 0) {
      setError('Please select at least one ingredient');
      return;
    }
    
    if (!saladName) {
      setError('Please enter a name for your salad');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const price = await calculatePrice();
      
      await saladService.saveUserSalad({
        name: saladName,
        ingredients: selectedIngredients,
        user_id: user?.id,
        is_favorite: false,
        price: price,
      });
      
      setSuccess('Your custom salad has been saved!');
      // Reset form
      setSelectedIngredients([]);
      setSaladName('');
    } catch (err) {
      setError('Failed to save your salad. Please try again.');
      console.error('Error saving salad:', err);
    } finally {
      setSaving(false);
    }
  };

  if (categoriesLoading || ingredientsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Build Your Custom Salad</h1>
      
      {/* Category Selection */}
      <div>
        <h2>Select Category</h2>
        <div className="categories">
          {categories.map(category => (
            <button 
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={selectedCategory === category.name ? 'active' : ''}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Ingredient Selection */}
      <div>
        <h2>Select Ingredients</h2>
        <div className="ingredients">
          {ingredients.map(ingredient => (
            <div 
              key={ingredient.id}
              className={`ingredient ${selectedIngredients.includes(ingredient.id) ? 'selected' : ''}`}
              onClick={() => toggleIngredient(ingredient.id)}
            >
              <img src={ingredient.image} alt={ingredient.name} />
              <h3>{ingredient.name}</h3>
              <p>${ingredient.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Salad Name */}
      <div>
        <h2>Name Your Salad</h2>
        <input
          type="text"
          value={saladName}
          onChange={(e) => setSaladName(e.target.value)}
          placeholder="My Custom Salad"
        />
      </div>
      
      {/* Save Button */}
      <button 
        onClick={saveSalad} 
        disabled={saving || !isAuthenticated || selectedIngredients.length === 0 || !saladName}
      >
        {saving ? 'Saving...' : 'Save My Salad'}
      </button>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {!isAuthenticated && (
        <p>Please log in to save your custom salad.</p>
      )}
    </div>
  );
}

export default SaladBuilder;
```

## Order History Dashboard

This example shows how to display a user's order history:

```tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { orderService, saladService } from '../pb';

function OrderHistory() {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const userOrders = await orderService.getUserOrders();
        
        // For each order, get the salad details
        const ordersWithSalads = await Promise.all(
          userOrders.map(async (order) => {
            try {
              const salad = await saladService.getById(order.salad_id);
              return {
                ...order,
                salad
              };
            } catch (err) {
              console.error(`Error fetching salad for order ${order.id}:`, err);
              return {
                ...order,
                salad: { name: 'Unknown Salad' }
              };
            }
          })
        );
        
        setOrders(ordersWithSalads);
      } catch (err) {
        setError('Failed to load your order history');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Please log in to view your order history.</div>;
  }

  if (loading) {
    return <div>Loading your orders...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h1>Your Order History</h1>
      
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="orders">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Order #{order.id.substring(0, 8)}</h3>
                <span className={`status status-${order.status}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="order-details">
                <p>
                  <strong>Date:</strong> {new Date(order.created).toLocaleDateString()}
                </p>
                <p>
                  <strong>Salad:</strong> {order.salad?.name}
                </p>
                <p>
                  <strong>Quantity:</strong> {order.quantity}
                </p>
                <p>
                  <strong>Total:</strong> ${order.total_price.toFixed(2)}
                </p>
                <p>
                  <strong>Delivery Address:</strong> {order.delivery_address}
                </p>
              </div>
              
              {order.status === 'pending' && (
                <button 
                  onClick={async () => {
                    try {
                      await orderService.cancelOrder(order.id);
                      // Refresh orders
                      setOrders(prevOrders => 
                        prevOrders.map(o => 
                          o.id === order.id ? { ...o, status: 'cancelled' } : o
                        )
                      );
                    } catch (err) {
                      console.error('Error cancelling order:', err);
                      alert('Failed to cancel order');
                    }
                  }}
                  className="cancel-button"
                >
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
```

## Featured Salads with Ingredients

This example shows how to display featured salads with their ingredients:

```tsx
import React from 'react';
import { saladService, ingredientService } from '../pb';

function FeaturedSalads() {
  const [salads, setSalads] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchSalads() {
      try {
        setLoading(true);
        // Get featured salads that are available
        const featuredSalads = await saladService.getSalads({ 
          featured: true,
          availableOnly: true
        });
        
        // For each salad, fetch its ingredients
        const saladsWithIngredients = await Promise.all(
          featuredSalads.map(async (salad) => {
            try {
              // Get the full ingredient objects for each salad
              const ingredients = await ingredientService.getIngredientsByIds(salad.ingredients);
              
              // Calculate the total price (this could be done on the server)
              const totalPrice = ingredients.reduce((sum, ingredient) => sum + ingredient.price, 0);
              
              return {
                ...salad,
                ingredientDetails: ingredients,
                calculatedPrice: totalPrice
              };
            } catch (err) {
              console.error(`Error fetching ingredients for salad ${salad.id}:`, err);
              return {
                ...salad,
                ingredientDetails: [],
                calculatedPrice: 0
              };
            }
          })
        );
        
        setSalads(saladsWithIngredients);
      } catch (err) {
        setError('Failed to load featured salads');
        console.error('Error fetching salads:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSalads();
  }, []);

  if (loading) {
    return <div>Loading featured salads...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (salads.length === 0) {
    return <div>No featured salads available right now.</div>;
  }

  return (
    <div>
      <h1>Featured Salads</h1>
      
      <div className="salad-cards">
        {salads.map(salad => (
          <div key={salad.id} className="salad-card">
            <img 
              src={salad.image} 
              alt={salad.name} 
              className="salad-image" 
            />
            
            <div className="salad-content">
              <h2>{salad.name}</h2>
              <p>{salad.description}</p>
              
              <div className="ingredients-list">
                <h3>Ingredients:</h3>
                <ul>
                  {salad.ingredientDetails.map(ingredient => (
                    <li key={ingredient.id}>
                      {ingredient.name} - ${ingredient.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="salad-price">
                <span>Total: ${salad.calculatedPrice.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={() => {
                  // Navigate to order page or add to cart
                  console.log('Order salad:', salad.id);
                }}
                className="order-button"
              >
                Order Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturedSalads;
```

These examples demonstrate how to combine multiple API services and hooks to build common features in your Salad App. The pattern remains consistent across different use cases:

1. Import the necessary hooks and services
2. Use hooks for data that needs React state management
3. Call service methods directly for one-off operations
4. Handle loading states and errors appropriately
5. Combine data from multiple sources when needed