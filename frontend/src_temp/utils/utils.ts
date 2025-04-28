/**
 * Helper function to get menu category name from category ID
 */
export function menuCategoryFromId(id: string): string {
  const categoryMap: Record<string, string> = {
    'featured': 'Featured',
    'seasonal': 'Seasonal',
    'protein': 'Protein Rich',
    'vegan': 'Vegan',
    'light': 'Light & Fresh',
    'signature': 'Signature'
  };
  
  return categoryMap[id] || 'Salad';
}

/**
 * Ingredient interface for type safety
 */
interface Ingredient {
  id?: string;
  quantity?: number;
}

/**
 * Function to check if ingredients have been customized
 */
export function areIngredientsCustomized(originalIngredients: (string | Ingredient)[], customizedIngredients: Ingredient[]): boolean {
  try {
    // Different lengths means different ingredients
    if (!originalIngredients || !customizedIngredients || 
        originalIngredients.length !== customizedIngredients.length) {
      return true;
    }
    
    // Create maps of ingredient IDs to quantities for comparison
    const originalMap = new Map();
    
    // Process original ingredients which can be strings or objects
    for (const ing of originalIngredients) {
      if (typeof ing === 'string') {
        originalMap.set(ing, 1); // Default quantity for string ingredients
      } else if (typeof ing === 'object' && ing !== null) {
        const id = ing.id || '';
        const qty = ing.quantity || 1;
        originalMap.set(id, qty);
      }
    }
    
    // Process customized ingredients
    for (const customIng of customizedIngredients) {
      // Skip invalid ingredients
      if (!customIng || !customIng.id) continue;
      
      const originalQty = originalMap.get(customIng.id) || 0;
      
      // If quantities differ, it's customized
      if (customIng.quantity !== originalQty) {
        return true;
      }
      
      // Remove from map to track processed ingredients
      originalMap.delete(customIng.id);
    }
    
    // If there are remaining ingredients in originalMap, it's customized
    return originalMap.size > 0;
  } catch (error) {
    console.error('Error in areIngredientsCustomized:', error);
    return true; // Default to true on error
  }
}
