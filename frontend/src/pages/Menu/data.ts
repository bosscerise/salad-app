import { Category, Ingredient, IngredientCategory, Salad, SuggestedCombination } from './types';

export const menuCategories: Category[] = [
  { id: 'featured', name: 'Featured', icon: '⭐' },
  { id: 'seasonal', name: 'Seasonal', icon: '🍂' },
  { id: 'protein', name: 'Protein Rich', icon: '💪' },
  { id: 'vegan', name: 'Vegan', icon: '🌱' },
  { id: 'light', name: 'Light & Fresh', icon: '🥬' },
  { id: 'signature', name: 'Signature', icon: '🏆' },
];

export const ingredientCategories: IngredientCategory[] = [
  { id: 'base', name: 'Base', icon: '🥬' },
  { id: 'protein', name: 'Protein', icon: '🍗' },
  { id: 'toppings', name: 'Toppings', icon: '🥕' },
  { id: 'dressing', name: 'Dressing', icon: '🧂' },
  { id: 'extras', name: 'Extras', icon: '🧀' },
];

export const ingredients: Ingredient[] = [
  // Bases
  { id: 'laitue', name: 'Laitue', category: 'base',emoji:'🧀', price: 2.99, calories: 15, protein: 1, carbs: 2, fats: 0 },
  { id: 'romaine', name: 'Romaine', category: 'base', price: 2.99, calories: 15, protein: 1, carbs: 2, fats: 0 },
  { id: 'rocket', name: 'Rocket', category: 'base', price: 3.49, calories: 25, protein: 2, carbs: 3, fats: 0 },
  { id: 'chou-vert', name: 'Chou Vert', category: 'base', price: 2.99, calories: 25, protein: 1, carbs: 5, fats: 0 },
  { id: 'chou-rouge', name: 'Chou Rouge', category: 'base', price: 2.99, calories: 25, protein: 1, carbs: 5, fats: 0 },
  { id: 'riz', name: 'Riz', category: 'base', price: 2.99, calories: 110, protein: 2, carbs: 23, fats: 1 },
  { id: 'penne', name: 'Penne Sans Gluten', category: 'base', price: 3.49, calories: 150, protein: 6, carbs: 32, fats: 1 },
  { id: 'fusilli', name: 'Fusilli Sans Gluten', category: 'base', price: 3.49, calories: 150, protein: 6, carbs: 32, fats: 1 },
  
  // Proteins
  { id: 'poulet', name: 'Poulet Grillé', category: 'protein', price: 4.99, calories: 150, protein: 25, carbs: 0, fats: 6 },
  { id: 'thon', name: 'Thon', category: 'protein', price: 5.99, calories: 140, protein: 24, carbs: 0, fats: 5 },
  { id: 'oeuf', name: 'Œuf Dur', category: 'protein', price: 1.99, calories: 70, protein: 6, carbs: 1, fats: 5 },
  
  // Toppings
  { id: 'tomate-cerise', name: 'Tomates Cerises', category: 'toppings', price: 0.99, calories: 25, protein: 1, carbs: 5, fats: 0 },
  { id: 'poivron', name: 'Poivron', category: 'toppings', price: 0.99, calories: 20, protein: 1, carbs: 4, fats: 0 },
  { id: 'oignon', name: 'Oignon', category: 'toppings', price: 0.79, calories: 10, protein: 0, carbs: 2, fats: 0 },
  { id: 'pomme-de-terre', name: 'Pomme de Terre', category: 'toppings', price: 1.29, calories: 90, protein: 2, carbs: 20, fats: 0 },
  { id: 'haricot-vert', name: 'Haricots Verts', category: 'toppings', price: 1.29, calories: 30, protein: 2, carbs: 6, fats: 0 },
  { id: 'carotte', name: 'Carotte', category: 'toppings', price: 0.99, calories: 30, protein: 1, carbs: 7, fats: 0 },
  { id: 'concombre', name: 'Concombre', category: 'toppings', price: 0.99, calories: 15, protein: 0, carbs: 3, fats: 0 },
  { id: 'avocat', name: 'Avocat', category: 'toppings', price: 1.99, calories: 80, protein: 1, carbs: 4, fats: 7 },
  { id: 'mais', name: 'Maïs', category: 'toppings', price: 0.99, calories: 80, protein: 2, carbs: 18, fats: 1 },
  
  // Dressings
  { id: 'huile-olive', name: 'Huile d\'Olive', category: 'dressing', price: 0.99, calories: 90, protein: 0, carbs: 0, fats: 10 },
  { id: 'vinaigre-balsamique', name: 'Vinaigre Balsamique', category: 'dressing', price: 0.99, calories: 30, protein: 0, carbs: 6, fats: 0 },
  { id: 'mayo', name: 'Mayonnaise', category: 'dressing', price: 0.99, calories: 100, protein: 0, carbs: 1, fats: 11 },
  { id: 'ketchup', name: 'Ketchup', category: 'dressing', price: 0.99, calories: 40, protein: 0, carbs: 10, fats: 0 },
  { id: 'moutarde', name: 'Moutarde', category: 'dressing', price: 0.99, calories: 30, protein: 1, carbs: 2, fats: 2 },
  { id: 'citron', name: 'Jus de Citron', category: 'dressing', price: 0.79, calories: 5, protein: 0, carbs: 1, fats: 0 },
  
  // Extras
  { id: 'fromage-rouge', name: 'Fromage Rouge', category: 'extras', price: 1.49, calories: 70, protein: 5, carbs: 0, fats: 6 },
  { id: 'gouda', name: 'Gouda', category: 'extras', price: 1.49, calories: 80, protein: 6, carbs: 0, fats: 6 },
  { id: 'gruyere', name: 'Gruyère', category: 'extras', price: 1.79, calories: 85, protein: 7, carbs: 0, fats: 6 },
  { id: 'camembert', name: 'Camembert', category: 'extras', price: 1.79, calories: 85, protein: 5, carbs: 0, fats: 7 },
  { id: 'greek', name: 'Fromage Grec', category: 'extras', price: 1.49, calories: 70, protein: 4, carbs: 1, fats: 6 },
  { id: 'noix', name: 'Noix', category: 'extras', price: 1.49, calories: 100, protein: 2, carbs: 2, fats: 10 },
  { id: 'anchois', name: 'Anchois', category: 'extras', price: 1.49, calories: 60, protein: 8, carbs: 0, fats: 3 },
  { id: 'capres', name: 'Câpres', category: 'extras', price: 1.29, calories: 25, protein: 1, carbs: 1, fats: 0 },
  { id: 'olive-noir', name: 'Olives Noires', category: 'extras', price: 1.29, calories: 45, protein: 0, carbs: 2, fats: 4 },
  { id: 'olive-violet', name: 'Olives Kalamata', category: 'extras', price: 1.49, calories: 45, protein: 0, carbs: 2, fats: 4 },
  { id: 'croutons', name: 'Croûtons', category: 'extras', price: 0.99, calories: 80, protein: 2, carbs: 12, fats: 3 },
];

export const salads: Salad[] = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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
    id: 9,
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

// Suggested salad combinations
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
    base: ['laitue', 'riz'],
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
    base: ['fusilli'],
    protein: ['poulet'],
    toppings: ['tomate-cerise', 'poivron', 'mais', 'haricot-vert'],
    dressing: ['mayo', 'moutarde'],
    extras: ['gouda', 'olive-noir']
  }
];
