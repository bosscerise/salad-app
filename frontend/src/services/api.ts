import pb from '../pb/pocketbase';

// Re-export pb for components that need it
export { pb };

// Exported types matching your PocketBase schema
export interface IngredientCategory {
  id: string;
  name: string;
  icon_name: string;
  order: number;
  description?: string;
  created?: string;
  updated?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string; // Relation ID to ingredient_category
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  emoji: string;
  available: boolean;
  created?: string;
  updated?: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: Record<string, number> | string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  delivery: boolean;
  created?: string;
  updated?: string;
}

export interface UserSalad {
  id: string;
  user_id: string;
  name: string;
  ingredients: Record<string, number>; // ingredient_id -> quantity
  total_price: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  is_favorite: boolean;
  created?: string;
  updated?: string;
}

// Ingredient API
export const ingredientApi = {
  getAll: async (): Promise<Ingredient[]> => {
    try {
      return await pb.collection('ingredients').getFullList<Ingredient>({
        filter: 'available = true',
        sort: 'name',
      });
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      return []; // Return empty array as fallback
    }
  },
  
  getByCategory: async (categoryId: string): Promise<Ingredient[]> => {
    try {
      return await pb.collection('ingredients').getFullList<Ingredient>({
        filter: `category = "${categoryId}" && available = true`,
        sort: 'name',
      });
    } catch (error) {
      console.error('Error fetching ingredients by category:', error);
      return []; // Return empty array as fallback
    }
  },
  
  getById: async (id: string): Promise<Ingredient> => {
    try {
      return await pb.collection('ingredients').getOne<Ingredient>(id);
    } catch (error) {
      console.error(`Error fetching ingredient by ID (${id}):`, error);
      throw error; // Rethrow to allow calling code to handle the error
    }
  }
};

// Category API - note we're updating the collection name to match what's in your PocketBase
export const categoryApi = {
  getAll: async (): Promise<IngredientCategory[]> => {
    try {
      // Try with different collection names until one works
      try {
        return await pb.collection('ingredient_category').getFullList<IngredientCategory>({
          sort: 'order',
        });
      } catch (err) {
        // If the singular form doesn't work, try plural
        return await pb.collection('ingredient_categories').getFullList<IngredientCategory>({
          sort: 'order',
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // Return fallback categories if API fails
      return [
        { id: 'base', name: 'Base', icon_name: 'Salad', order: 1 },
        { id: 'protein', name: 'Protein', icon_name: 'Beef', order: 2 },
        { id: 'toppings', name: 'Toppings', icon_name: 'Cherry', order: 3 },
        { id: 'dressing', name: 'Dressing', icon_name: 'Droplets', order: 4 },
        { id: 'extras', name: 'Extras', icon_name: 'Plus', order: 5 }
      ];
    }
  },
  
  getById: async (id: string): Promise<IngredientCategory> => {
    try {
      try {
        return await pb.collection('ingredient_category').getOne<IngredientCategory>(id);
      } catch (err) {
        return await pb.collection('ingredient_categories').getOne<IngredientCategory>(id);
      }
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      // Return a fallback category
      return { id, name: 'Unknown', icon_name: 'HelpCircle', order: 999 };
    }
  }
};

// Order API
export const orderApi = {
  create: async (orderData: Omit<Order, 'id' | 'created' | 'updated'>): Promise<Order> => {
    try {
      // Format items properly for storage
      const formattedData = {
        ...orderData,
        items: typeof orderData.items === 'object' 
          ? JSON.stringify(orderData.items) 
          : orderData.items
      };
      
      // Don't send user_id if user is not logged in
      if (!pb.authStore.isValid && formattedData.user_id) {
        delete formattedData.user_id;
      }
      
      return await pb.collection('orders').create<Order>(formattedData);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error; // Re-throw to allow component to handle
    }
  },
  
  getByUserId: async (userId: string): Promise<Order[]> => {
    try {
      return await pb.collection('orders').getFullList<Order>({
        filter: `user_id = "${userId}"`,
        sort: '-created',
      });
    } catch (error) {
      console.error('Error fetching orders by user ID:', error);
      return []; // Return empty array as fallback
    }
  },
  
  getById: async (id: string): Promise<Order> => {
    try {
      return await pb.collection('orders').getOne<Order>(id);
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error; // Re-throw as we need a valid order
    }
  },
  
  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    try {
      return await pb.collection('orders').update<Order>(id, { status });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error; // Re-throw to allow component to handle
    }
  },
  
  subscribeToUpdates: (callback: (data: any) => void): () => void => {
    if (!pb.authStore.isValid) {
      console.warn('Cannot subscribe to orders: User not authenticated');
      return () => {}; // Return no-op unsubscribe function
    }
    
    // Get user ID from auth store
    const userId = pb.authStore.model?.id;
    
    // Subscribe to orders for this user
    try {
      // Add filter for the current user's orders
      return pb.collection('orders').subscribe(`user_id="${userId}"`, callback);
    } catch (error) {
      console.error('Error subscribing to order updates:', error);
      return () => {}; // Return no-op unsubscribe function
    }
  },
  
  unsubscribeFromUpdates: (unsubscribeFunc: () => void) => {
    if (typeof unsubscribeFunc === 'function') {
      unsubscribeFunc();
    }
  }
};

// User Salad API
export const userSaladApi = {
  getAll: async (): Promise<UserSalad[]> => {
    if (!pb.authStore.isValid) return [];
    
    return await pb.collection('user_salads').getFullList<UserSalad>({
      filter: `user_id = "${pb.authStore.model?.id}"`,
      sort: '-created',
    });
  },
  
  getById: async (id: string): Promise<UserSalad> => {
    return await pb.collection('user_salads').getOne<UserSalad>(id);
  },
  
  create: async (saladData: Omit<UserSalad, 'id' | 'created' | 'updated'>): Promise<UserSalad> => {
    return await pb.collection('user_salads').create<UserSalad>(saladData);
  },
  
  update: async (id: string, saladData: Partial<UserSalad>): Promise<UserSalad> => {
    return await pb.collection('user_salads').update<UserSalad>(id, saladData);
  },
  
  delete: async (id: string): Promise<boolean> => {
    await pb.collection('user_salads').delete(id);
    return true;
  },
  
  toggleFavorite: async (id: string, isFavorite: boolean): Promise<UserSalad> => {
    return await pb.collection('user_salads').update<UserSalad>(id, { is_favorite: isFavorite });
  }
};