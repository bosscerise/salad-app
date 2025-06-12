import pb from '../pb/pocketbase';

// Re-export pb for components that need it
export { pb };

// Set global PocketBase config
pb.autoCancellation(false);

// Exported types matching your PocketBase schema
export interface IngredientCategory {
  id: string;
  name: string;
  icon_name: string;
  order: number;
  description?: string;
  emoji?: string; // Added from Menu/data.ts
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

// Function to check if collection exists in PocketBase with better error handling
async function collectionExists(collectionName: string): Promise<boolean> {
  try {
    // Try to get a single record to check if collection exists
    await pb.collection(collectionName).getList(1, 1);
    return true;
  } catch (error) {
    // Check if the error is about missing collection
    if (error && typeof error === 'object' && 'status' in error) {
      if (error.status === 404 && 'message' in error && 
          typeof error.message === 'string' && 
          error.message.includes('Missing collection')) {
        return false;
      }
    }
    console.error(`Error checking collection ${collectionName}:`, error);
    // For other errors, assume collection might not exist to be safe
    return false;
  }
}

// Fallback data for when API is unavailable
export const fallbackIngredientCategories: IngredientCategory[] = [
  { id: 'base', name: 'Base', emoji: '🥬', order: 1, icon_name: 'salad'},
  { id: 'protein', name: 'Protein', emoji: '🍗', order: 2, icon_name: 'meat'},
  { id: 'toppings', name: 'Toppings', emoji: '🥕', order: 3, icon_name: 'vegetable'},
  { id: 'dressing', name: 'Dressing', emoji: '🫒', order: 4, icon_name: 'oil'},
  { id: 'extras', name: 'Extras', emoji: '🧀', order: 5, icon_name: 'cheese'}
];

export const fallbackIngredients: Ingredient[] = [
  // Bases
  { id: 'laitue', name: 'Laitue', category: 'base', emoji: '🥬', price: 2.99, calories: 15, protein: 1, carbs: 2, fats: 0, available: true },
  { id: 'romaine', name: 'Romaine', category: 'base', emoji: '🥬', price: 2.99, calories: 15, protein: 1, carbs: 2, fats: 0, available: true },
  { id: 'rocket', name: 'Rocket', category: 'base', emoji: '🥬', price: 3.49, calories: 25, protein: 2, carbs: 3, fats: 0, available: true },
  { id: 'chou-vert', name: 'Chou Vert', category: 'base', emoji: '🥬', price: 2.99, calories: 25, protein: 1, carbs: 5, fats: 0, available: true },
  
  // Proteins
  { id: 'poulet', name: 'Poulet Grillé', category: 'protein', emoji: '🍗', price: 4.99, calories: 150, protein: 25, carbs: 0, fats: 6, available: true },
  { id: 'thon', name: 'Thon', category: 'protein', emoji: '🐟', price: 5.99, calories: 140, protein: 24, carbs: 0, fats: 5, available: true },
  { id: 'oeuf', name: 'Œuf Dur', category: 'protein', emoji: '🥚', price: 1.99, calories: 70, protein: 6, carbs: 1, fats: 5, available: true },
  
  // Toppings
  { id: 'tomate-cerise', name: 'Tomates Cerises', category: 'toppings', emoji: '🍅', price: 0.99, calories: 25, protein: 1, carbs: 5, fats: 0, available: true },
  { id: 'poivron', name: 'Poivron', category: 'toppings', emoji: '🫑', price: 0.99, calories: 20, protein: 1, carbs: 4, fats: 0, available: true },
  { id: 'avocat', name: 'Avocat', category: 'toppings', emoji: '🥑', price: 1.99, calories: 80, protein: 1, carbs: 4, fats: 7, available: true },
  { id: 'concombre', name: 'Concombre', category: 'toppings', emoji: '🥒', price: 0.89, calories: 15, protein: 0, carbs: 3, fats: 0, available: true },
  { id: 'oignon', name: 'Oignon', category: 'toppings', emoji: '🧅', price: 0.79, calories: 30, protein: 1, carbs: 7, fats: 0, available: true },
  { id: 'mais', name: 'Maïs', category: 'toppings', emoji: '🌽', price: 0.89, calories: 85, protein: 3, carbs: 19, fats: 1, available: true },
  { id: 'carotte', name: 'Carotte', category: 'toppings', emoji: '🥕', price: 0.89, calories: 25, protein: 1, carbs: 6, fats: 0, available: true },
  { id: 'haricot-vert', name: 'Haricots Verts', category: 'toppings', emoji: '🫛', price: 1.29, calories: 35, protein: 2, carbs: 7, fats: 0, available: true },
  
  // Dressings
  { id: 'huile-olive', name: 'Huile d\'Olive', category: 'dressing', emoji: '🫒', price: 0.99, calories: 90, protein: 0, carbs: 0, fats: 10, available: true },
  { id: 'vinaigre-balsamique', name: 'Vinaigre Balsamique', category: 'dressing', emoji: '🧪', price: 0.99, calories: 30, protein: 0, carbs: 6, fats: 0, available: true },
  { id: 'citron', name: 'Jus de Citron', category: 'dressing', emoji: '🍋', price: 0.79, calories: 10, protein: 0, carbs: 3, fats: 0, available: true },
  { id: 'mayo', name: 'Mayonnaise', category: 'dressing', emoji: '🥄', price: 0.99, calories: 90, protein: 0, carbs: 1, fats: 10, available: true },
  { id: 'moutarde', name: 'Moutarde', category: 'dressing', emoji: '🧂', price: 0.79, calories: 15, protein: 1, carbs: 1, fats: 1, available: true },
  
  // Extras
  { id: 'fromage-rouge', name: 'Fromage Rouge', category: 'extras', emoji: '🧀', price: 1.49, calories: 70, protein: 5, carbs: 0, fats: 6, available: true },
  { id: 'noix', name: 'Noix', category: 'extras', emoji: '🌰', price: 1.49, calories: 100, protein: 2, carbs: 2, fats: 10, available: true },
  { id: 'gruyere', name: 'Gruyère', category: 'extras', emoji: '🧀', price: 1.69, calories: 110, protein: 8, carbs: 0, fats: 9, available: true },
  { id: 'olive-noir', name: 'Olives Noires', category: 'extras', emoji: '🫒', price: 1.29, calories: 45, protein: 0, carbs: 2, fats: 4, available: true },
  { id: 'olive-violet', name: 'Olives Kalamata', category: 'extras', emoji: '🫒', price: 1.49, calories: 40, protein: 0, carbs: 2, fats: 4, available: true },
  { id: 'capres', name: 'Câpres', category: 'extras', emoji: '🟢', price: 1.19, calories: 5, protein: 0, carbs: 1, fats: 0, available: true },
  { id: 'greek', name: 'Fromage Grec', category: 'extras', emoji: '🧀', price: 1.89, calories: 90, protein: 6, carbs: 1, fats: 6, available: true },
  { id: 'gouda', name: 'Gouda', category: 'extras', emoji: '🧀', price: 1.59, calories: 100, protein: 7, carbs: 1, fats: 8, available: true },
];

// Enhanced Ingredient API with fallback data
export const ingredientApi = {
  getAll: async (): Promise<Ingredient[]> => {
    try {
      const ingredientsCollectionExists = await collectionExists('ingredients');
      if (!ingredientsCollectionExists) {
        console.info('Ingredients collection not found, using fallback data');
        return fallbackIngredients;
      }
      
      return await pb.collection('ingredients').getFullList<Ingredient>({
        filter: 'available = true',
        sort: 'name',
      });
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      return fallbackIngredients; // Return fallback data
    }
  },
  
  getByCategory: async (categoryId: string): Promise<Ingredient[]> => {
    try {
      const ingredientsCollectionExists = await collectionExists('ingredients');
      if (!ingredientsCollectionExists) {
        return fallbackIngredients.filter(i => i.category === categoryId);
      }
      
      return await pb.collection('ingredients').getFullList<Ingredient>({
        filter: `category = "${categoryId}" && available = true`,
        sort: 'name',
      });
    } catch (error) {
      console.error('Error fetching ingredients by category:', error);
      return fallbackIngredients.filter(i => i.category === categoryId);
    }
  },
  
  getById: async (id: string): Promise<Ingredient | undefined> => {
    try {
      const ingredientsCollectionExists = await collectionExists('ingredients');
      if (!ingredientsCollectionExists) {
        return fallbackIngredients.find(i => i.id === id);
      }
      
      return await pb.collection('ingredients').getOne<Ingredient>(id);
    } catch (error) {
      console.error(`Error fetching ingredient by ID (${id}):`, error);
      return fallbackIngredients.find(i => i.id === id);
    }
  }
};

// Enhanced Category API with fallback data
export const categoryApi = {
  getAll: async (): Promise<IngredientCategory[]> => {
    try {
      const categoriesCollectionExists = await collectionExists('ingredient_category');
      if (!categoriesCollectionExists) {
        console.info('Categories collection not found, using fallback data');
        return fallbackIngredientCategories;
      }
      
      try {
        return await pb.collection('ingredient_category').getFullList<IngredientCategory>({
          sort: 'order',
        });
      } catch (_) {
        // If the singular form doesn't work, try plural
        return await pb.collection('ingredient_categories').getFullList<IngredientCategory>({
          sort: 'order',
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return fallbackIngredientCategories;
    }
  },
  
  getById: async (id: string): Promise<IngredientCategory | undefined> => {
    try {
      const categoriesCollectionExists = await collectionExists('ingredient_category');
      if (!categoriesCollectionExists) {
        return fallbackIngredientCategories.find(c => c.id === id);
      }
      
      try {
        return await pb.collection('ingredient_category').getOne<IngredientCategory>(id);
      } catch (_) {
        return await pb.collection('ingredient_categories').getOne<IngredientCategory>(id);
      }
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      return fallbackIngredientCategories.find(c => c.id === id) || 
        { id, name: 'Unknown', icon_name: 'HelpCircle', order: 999 };
    }
  }
};

// Function to load all menu data in one call
export async function loadMenuData() {
  try {
    const [ingredients, categories] = await Promise.all([
      ingredientApi.getAll(),
      categoryApi.getAll()
    ]);
    
    return {
      ingredients,
      categories
    };
  } catch (error) {
    console.error('Error loading menu data:', error);
    return {
      ingredients: fallbackIngredients,
      categories: fallbackIngredientCategories
    };
  }
}

// Order API
export const orderApi = {
  create: async (orderData: Omit<Order, 'id' | 'created' | 'updated'>): Promise<Order> => {
    try {
      // Format items properly for storage
      const formattedData: Record<string, string | number | boolean | Record<string, number>> = {
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
  
  subscribeToUpdates: (callback: (data: { action: string; record: Order }) => void) => {
    if (!pb.authStore.isValid) {
      console.warn('Cannot subscribe to orders: User not authenticated');
      return () => {}; // Return no-op unsubscribe function
    }
    
    // Get user ID from auth store
    const userId = pb.authStore.model?.id;
    
    // Subscribe to orders for this user
    try {
      // Add filter for the current user's orders
      const subscriptionPromise = pb.collection('orders').subscribe(`user_id="${userId}"`, callback);
      
      // Return a function that will unsubscribe when called
      return () => {
        subscriptionPromise.then(unsubscribe => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        }).catch(error => {
          console.error('Error in unsubscribe:', error);
        });
      };
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

// Exported salad menu data from Menu/data.ts
export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Salad {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  calories: number;
  category: string;
  tags: string[];
  ingredients: string[];
  nutritionFacts: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface SuggestedCombination {
  id: string;
  name: string;
  base: string[];
  protein: string[];
  toppings: string[];
  dressing: string[];
  extras: string[];
}

export const menuCategories: Category[] = [
  { id: 'featured', name: 'Featured', icon: '⭐' },
  { id: 'seasonal', name: 'Seasonal', icon: '🍂' },
  { id: 'protein', name: 'Protein Rich', icon: '💪' },
  { id: 'vegan', name: 'Vegan', icon: '🌱' },
  { id: 'light', name: 'Light & Fresh', icon: '🥬' },
  { id: 'signature', name: 'Signature', icon: '🏆' }
];

export const salads: Salad[] = [
  {
    id: '1',
    name: "Méditerranéenne",
    description: "Un mélange frais avec fromage grec, olives et notre vinaigrette signature",
    price: 12.99,
    image: "hero.jpeg",
    calories: 380,
    category: "featured",
    tags: ["vegetarian", "mediterranean"],
    ingredients: ["Romaine", "Fromage Grec", "Olives Kalamata", "Tomates Cerises", "Oignon", "Concombre"],
    nutritionFacts: {
      protein: 12,
      carbs: 15,
      fats: 22
    }
  },
  {
    id: '2',
    name: "Protéinée Énergisante",
    description: "Pour les amateurs de protéines, avec poulet grillé et œuf dur",
    price: 14.99,
    image: "hero.jpeg",
    calories: 450,
    category: "protein",
    tags: ["high-protein"],
    ingredients: ["Romaine", "Poulet Grillé", "Œuf Dur", "Avocat", "Tomates Cerises"],
    nutritionFacts: {
      protein: 30,
      carbs: 20,
      fats: 25
    }
  },
  {
    id: '3',
    name: "Vegan Delight",
    description: "Un mélange coloré et plein de saveurs, entièrement végétalien",
    price: 11.99,
    image: "hero.jpeg",
    calories: 350,
    category: "vegan",
    tags: ["vegan", "gluten-free"],
    ingredients: ["Romaine", "Avocat", "Tomates Cerises", "Poivron", "Concombre", "Carotte"],
    nutritionFacts: {
      protein: 8,
      carbs: 30,
      fats: 15
    }
  },
  {
    id: '4',
    name: "Légère et Croquante",
    description: "Idéale pour un déjeuner léger, avec une vinaigrette au citron",
    price: 10.99,
    image: "hero.jpeg",
    calories: 300,
    category: "light",
    tags: ["light"],
    ingredients: ["Romaine", "Concombre", "Radis", "Vinaigrette Citron"],
    nutritionFacts: {
      protein: 5,
      carbs: 10,
      fats: 10
    }
  },
  {
    id: '5',
    name: "César Classique",
    description: "Le grand classique avec une touche moderne, poulet, parmesan et croûtons",
    price: 13.99,
    image: "hero.jpeg",
    calories: 400,
    category: "signature",
    tags: ["classic"],
    ingredients: ["Romaine", "Poulet Grillé", "Parmesan", "Croûtons", "César Dressing"],
    nutritionFacts: {
      protein: 20,
      carbs: 25,
      fats: 20
    }
  },
  {
    id: '6',
    name: "Salade Niçoise",
    description: "Une salade riche en saveurs avec thon, œuf dur et olives",
    price: 14.99,
    image: "hero.jpeg",
    calories: 420,
    category: "featured",
    tags: ["mediterranean"],
    ingredients: ["Laitue", "Thon", "Œuf Dur", "Olives", "Tomates", "Haricots Verts"],
    nutritionFacts: {
      protein: 28,
      carbs: 20,
      fats: 24
    }
  },
  {
    id: '7',
    name: "Tex-Mex Fiesta",
    description: "Un mélange épicé avec du poulet, avocat, maïs et tortilla chips",
    price: 15.99,
    image: "hero.jpeg",
    calories: 480,
    category: "signature",
    tags: ["spicy", "high-protein"],
    ingredients: ["Romaine", "Poulet Grillé", "Avocat", "Maïs", "Chips de Tortilla"],
    nutritionFacts: {
      protein: 32,
      carbs: 50,
      fats: 18
    }
  },
  {
    id: '8',
    name: "Asiatique Croquante",
    description: "Avec poulet teriyaki, légumes croquants et vinaigrette sésame",
    price: 14.49,
    image: "hero.jpeg",
    calories: 410,
    category: "featured",
    tags: ["asian"],
    ingredients: ["Romaine", "Poulet Teriyaki", "Carottes Râpées", "Concombre", "Vinaigrette Sésame"],
    nutritionFacts: {
      protein: 25,
      carbs: 30,
      fats: 15
    }
  },
  {
    id: '9',
    name: "Greco-Romaine",
    description: "Un goût d'été avec tomates, concombre, olives et feta",
    price: 12.49,
    image: "hero.jpeg",
    calories: 360,
    category: "seasonal",
    tags: ["mediterranean", "vegetarian"],
    ingredients: ["Romaine", "Tomates", "Concombre", "Olives", "Feta"],
    nutritionFacts: {
      protein: 10,
      carbs: 15,
      fats: 20
    }
  },
  {
    id: '10',
    name: "Énergétique au Quinoa",
    description: "Quinoa, légumes frais et poulet grillé pour un maximum d'énergie",
    price: 13.49,
    image: "hero.jpeg",
    calories: 400,
    category: "protein",
    tags: ["high-protein"],
    ingredients: ["Quinoa", "Poulet Grillé", "Avocat", "Tomates Cerises", "Concombre"],
    nutritionFacts: {
      protein: 30,
      carbs: 40,
      fats: 10
    }
  }
];

// Suggested salad combinations with fixed ingredient IDs
export const suggestedCombinations: SuggestedCombination[] = [
  {
    id: 'mediterraneenne',
    name: 'Méditerranéenne',
    base: ['romaine', 'rocket'],
    protein: ['oeuf'],
    toppings: ['tomate-cerise', 'concombre', 'oignon'],
    dressing: ['huile-olive', 'citron'],
    extras: ['greek', 'olive-violet']
  },
  {
    id: 'protecinee',
    name: 'Protéinée Énergisante',
    base: ['romaine'],
    protein: ['poulet', 'oeuf'],
    toppings: ['avocat', 'tomate-cerise'],
    dressing: ['mayo'],
    extras: ['fromage-rouge']
  },
  {
    id: 'vegan-delight',
    name: 'Vegan Delight',
    base: ['laitue', 'roquette'],
    protein: [],
    toppings: ['tomate-cerise', 'poivron', 'concombre', 'carotte'],
    dressing: ['vinaigre-balsamique'],
    extras: []
  },
  {
    id: 'tex-mex-fiesta',
    name: 'Tex-Mex Fiesta',
    base: ['romaine'],
    protein: ['poulet'],
    toppings: ['avocat', 'mais'],
    dressing: ['huile-olive', 'vinaigre-balsamique'],
    extras: ['chips-tortilla']
  }
];

// Salad API
export const saladApi = {
  getAll: async (): Promise<Salad[]> => {
    try {
      const saladsCollectionExists = await collectionExists('salads');
      if (!saladsCollectionExists) {
        return salads;
      }
      
      return await pb.collection('salads').getFullList<Salad>();
    } catch (error) {
      console.error('Error fetching salads:', error);
      return salads;
    }
  },
  
  getById: async (id: string): Promise<Salad | undefined> => {
    try {
      const saladsCollectionExists = await collectionExists('salads');
      if (!saladsCollectionExists) {
        return salads.find(s => s.id === id);
      }
      
      return await pb.collection('salads').getOne<Salad>(id);
    } catch (error) {
      console.error(`Error fetching salad by ID (${id}):`, error);
      return salads.find(s => s.id === id);
    }
  },
  
  getByCategory: async (categoryId: string): Promise<Salad[]> => {
    try {
      const saladsCollectionExists = await collectionExists('salads');
      if (!saladsCollectionExists) {
        return salads.filter(s => s.category === categoryId);
      }
      
      return await pb.collection('salads').getFullList<Salad>({
        filter: `category = "${categoryId}"`,
      });
    } catch (error) {
      console.error('Error fetching salads by category:', error);
      return salads.filter(s => s.category === categoryId);
    }
  }
};