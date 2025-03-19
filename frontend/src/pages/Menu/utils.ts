import { Ingredient } from './types';
import { ingredients } from './data';

export const calculateCustomNutrition = (
  customSaladIngredients: { [key: string]: number }
) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let totalPrice = 0;
  
  Object.entries(customSaladIngredients).forEach(([id, count]) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    if (ingredient) {
      totalCalories += ingredient.calories * count;
      totalProtein += ingredient.protein * count;
      totalCarbs += ingredient.carbs * count;
      totalFats += ingredient.fats * count;
      totalPrice += ingredient.price * count;
    }
  });
  
  return {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fats: totalFats,
    price: totalPrice
  };
};

export const getIngredientById = (id: string): Ingredient | undefined => {
  return ingredients.find(ing => ing.id === id);
};

export const getRecommendedIngredients = (type: 'balanced' | 'protein' | 'low-cal') => {
  // Different recommendations based on the selected type
  let recommendedIds: string[] = [];
  
  switch (type) {
    case 'protein':
      recommendedIds = ['grilled-chicken', 'eggs', 'salmon', 'seeds', 'quinoa'];
      break;
    case 'low-cal':
      recommendedIds = ['spinach', 'cucumbers', 'tomatoes', 'lemon-olive', 'mixed-greens'];
      break;
    case 'balanced':
    default:
      recommendedIds = ['romaine', 'grilled-chicken', 'avocado', 'balsamic', 'walnuts'];
  }
  
  return ingredients.filter(ing => recommendedIds.includes(ing.id));
};
