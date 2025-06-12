import { Category, Salad, SuggestedCombination } from './types';
import { pb } from '../../pb/pocketbase';
import { Ingredient, IngredientCategory as ApiIngredientCategory } from '../../pb/pocketbase';
pb.autoCancellation(false);


// Extend the imported IngredientCategory type to include emoji
interface IngredientCategory extends ApiIngredientCategory {
  emoji?: string;
  // Don't redefine icon_name as it's already in ApiIngredientCategory
}

export const ingredientCategories: IngredientCategory[] = [
  { id: 'base', name: 'Base', emoji: '🥬', order: 1, icon_name: 'salad'},
  { id: 'protein', name: 'Protein', emoji: '🍗', order: 2, icon_name: 'meat'},
  { id: 'toppings', name: 'Toppings', emoji: '🥕', order: 3, icon_name: 'vegetable'},
  { id: 'dressing', name: 'Dressing', emoji: '🫒', order: 4, icon_name: 'oil'},
  { id: 'extras', name: 'Extras', emoji: '🧀', order: 5, icon_name: 'cheese'}
];

// Static fallback ingredient data
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

// Function to load data from API with improved error handling
export async function loadDataFromAPI() {
  try {
    // Check if collections exist before trying to fetch
    const [ingredientsCollectionExists, categoriesCollectionExists] = await Promise.all([
      collectionExists('ingredients'),
      collectionExists('ingredient_category')
    ]);
    
    // Prepare promises based on collection existence
    let ingredientsPromise;
    let categoriesPromise;
    
    if (ingredientsCollectionExists) {
      ingredientsPromise = pb.collection('ingredients').getFullList<Ingredient>({
        sort: 'name',
        filter: 'available = true'
      }).catch(err => {
        console.error('Error fetching ingredients:', err);
        return fallbackIngredients;
      });
    } else {
      ingredientsPromise = Promise.resolve(fallbackIngredients);
    }
    
    if (categoriesCollectionExists) {
      categoriesPromise = pb.collection('ingredient_category').getFullList<IngredientCategory>({
        sort: 'order'
      }).catch(err => {
        console.error('Error fetching ingredient categories:', err);
        return ingredientCategories;
      });
    } else {
      categoriesPromise = Promise.resolve(ingredientCategories);
    }
    
    // Execute promises
    const [ingredientsData, categoriesData] = await Promise.all([
      ingredientsPromise,
      categoriesPromise
    ]);
    
    // Validate data
    const validIngredients = Array.isArray(ingredientsData) ? ingredientsData : fallbackIngredients;
    const validCategories = Array.isArray(categoriesData) ? categoriesData : ingredientCategories;
    
    return {
      ingredients: validIngredients,
      categories: validCategories
    };
  } catch (error) {
    console.error('Error loading data from API:', error);
    // Return fallback data
    return {
      ingredients: fallbackIngredients,
      categories: ingredientCategories
    };
  }
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
    name: "Salade Fusilli",
    description: "Pâtes sans gluten avec légumes croquants et vinaigrette balsamique",
    price: 13.99,
    image: "hero.jpeg",
    calories: 420,
    category: "signature",
    tags: ["gluten-free", "vegetarian"],
    ingredients: ["Fusilli Sans Gluten", "Tomates Cerises", "Poivron", "Maïs", "Concombre", "Gouda"],
    nutritionFacts: {
      protein: 15,
      carbs: 48,
      fats: 18
    }
  },
  {
    id: '3',
    name: "Verte Gourmande",
    description: "Mélange de verdure avec avocat et vinaigrette légère au citron",
    price: 14.99,
    image: "hero.jpeg",
    calories: 380,
    category: "vegan",
    tags: ["vegan", "detox"],
    ingredients: ["Rocket", "Laitue", "Avocat", "Concombre", "Haricots Verts", "Noix"],
    nutritionFacts: {
      protein: 10,
      carbs: 18,
      fats: 28
    }
  },
  {
    id: '4',
    name: "Salade du Chef",
    description: "Notre salade signature avec œuf, fromage et vinaigrette maison",
    price: 11.99,
    image: "hero.jpeg",
    calories: 420,
    category: "signature",
    tags: ["vegetarian", "chef-special"],
    ingredients: ["Laitue", "Œuf Dur", "Gruyère", "Tomates Cerises", "Carotte", "Croûtons"],
    nutritionFacts: {
      protein: 18,
      carbs: 20,
      fats: 25
    }
  },
  {
    id: '5',
    name: "Protéinée au Poulet",
    description: "Riche en protéines avec poulet grillé et œuf",
    price: 15.99,
    image: "hero.jpeg",
    calories: 520,
    category: "protein",
    tags: ["high-protein", "hearty"],
    ingredients: ["Romaine", "Poulet Grillé", "Œuf Dur", "Tomates Cerises", "Maïs", "Fromage Rouge"],
    nutritionFacts: {
      protein: 42,
      carbs: 18,
      fats: 24
    }
  },
  {
    id: '6',
    name: "Océane au Thon",
    description: "Salade fraîche au thon avec câpres et citron",
    price: 13.99,
    image: "hero.jpeg",
    calories: 360,
    category: "protein",
    tags: ["seafood", "light"],
    ingredients: ["Laitue", "Thon", "Câpres", "Oignon", "Tomates Cerises", "Olives Noires"],
    nutritionFacts: {
      protein: 28,
      carbs: 14,
      fats: 18
    }
  },
  {
    id: '7',
    name: "Complète aux Pommes de Terre",
    description: "Salade généreuse avec pommes de terre et fromage",
    price: 14.49,
    image: "hero.jpeg",
    calories: 460,
    category: "signature",
    tags: ["hearty", "vegetarian"],
    ingredients: ["Romaine", "Pomme de Terre", "Camembert", "Oignon", "Haricots Verts", "Noix"],
    nutritionFacts: {
      protein: 15,
      carbs: 40,
      fats: 22
    }
  },
  {
    id: '8',
    name: "Printanière",
    description: "Mélange coloré de légumes de saison avec vinaigrette légère",
    price: 13.99,
    image: "hero.jpeg",
    calories: 310,
    category: "seasonal",
    tags: ["vegan", "light"],
    ingredients: ["Chou Vert", "Carotte", "Concombre", "Poivron", "Maïs", "Avocat"],
    nutritionFacts: {
      protein: 8,
      carbs: 30,
      fats: 16
    }
  },
  {
    id: '9',
    name: "Caesar Moderne",
    description: "Notre version revisitée de la Caesar avec anchois et croûtons maison",
    price: 13.99,
    image: "hero.jpeg",
    calories: 390,
    category: "featured",
    tags: ["classic", "popular"],
    ingredients: ["Romaine", "Poulet Grillé", "Anchois", "Croûtons", "Parmesan", "Œuf Dur"],
    nutritionFacts: {
      protein: 32,
      carbs: 22,
      fats: 18
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
    id: 'protein-boost',
    name: 'Boost Protéiné',
    base: ['laitue'],
    protein: ['poulet', 'oeuf'],
    toppings: ['avocat', 'poivron', 'mais'],
    dressing: ['huile-olive', 'citron'],
    extras: ['gruyere']
  },
  {
    id: 'vegan-delight',
    name: 'Délice Végétal',
    base: ['chou-vert', 'rocket'],
    protein: [],
    toppings: ['tomate-cerise', 'avocat', 'carotte', 'concombre'],
    dressing: ['vinaigre-balsamique', 'huile-olive'],
    extras: ['noix']
  },
  {
    id: 'ocean-twist',
    name: 'Parfum d\'Océan',
    base: ['laitue', 'romaine'],
    protein: ['thon'],
    toppings: ['concombre', 'tomate-cerise', 'oignon'],
    dressing: ['citron', 'huile-olive'],
    extras: ['capres', 'olive-noir']
  },
  {
    id: 'pasta-salad',
    name: 'Salade de Pâtes',
    base: ['laitue'], // Removed 'fusilli' as it doesn't exist in ingredients
    protein: ['poulet'],
    toppings: ['tomate-cerise', 'poivron', 'mais', 'haricot-vert'],
    dressing: ['mayo', 'moutarde'],
    extras: ['gouda', 'olive-noir']
  }
];
