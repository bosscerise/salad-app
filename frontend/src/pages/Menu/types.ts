export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface NutritionFacts {
  protein: number;
  carbs: number;
  fats: number;
}

export interface Salad {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  calories: number;
  category: string;
  tags: string[];
  ingredients: string[];
  nutritionFacts: NutritionFacts;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  price: number;
  calories: number;
  image?: string;
  protein: number;
  carbs: number;
  fats: number;
}

export interface IngredientCategory {
  id: string;
  name: string;
  icon: string;
}

export interface CustomSalad {
  ingredients: { [key: string]: number };
  name: string;
}

export interface SavedSalad {
  id: string;
  name: string;
  ingredients: { [key: string]: number };
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



export type RecommendationType = 'balanced' | 'protein' | 'low-cal';
