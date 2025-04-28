import { pb } from './client';
import { BaseRecord, IngredientRecord, IngredientCategoryRecord } from './types';

/**
 * Get all ingredient categories
 */
export async function getIngredientCategories() {
  return pb.collection('ingredient_category').getFullList<IngredientCategoryRecord>({
    sort: 'order',
  });
}

/**
 * Get all ingredients (alias for getIngredients for consistency across services)
 */
export async function getAll() {
  return getIngredients();
}

/**
 * Get all ingredients, optionally filtered by category
 */
export async function getIngredients(categoryId?: string) {
  const filter = categoryId ? `category="${categoryId}"` : '';
  return pb.collection('ingredients').getFullList<IngredientRecord>({
    filter,
    sort: 'name',
    expand: 'category',
  });
}

/**
 * Get ingredients by category name
 */
export async function getByCategory(categoryName: string) {
  try {
    // First, find the category by name
    const categories = await pb.collection('ingredient_category').getFullList<IngredientCategoryRecord>({
      filter: `name~"${categoryName}"`,
    });
    
    if (categories.length === 0) {
      return []; // Category not found
    }
    
    // Use the first matching category
    return getIngredients(categories[0].id);
  } catch (error) {
    console.error(`Error getting ingredients by category ${categoryName}:`, error);
    return []; // Return empty array on error
  }
}

/**
 * Get ingredients by IDs
 */
export async function getIngredientsByIds(ids: string[]) {
  if (!ids.length) return [];
  
  const filter = ids.map(id => `id="${id}"`).join(' || ');
  return pb.collection('ingredients').getFullList<IngredientRecord>({
    filter,
    expand: 'category',
  });
}

/**
 * Get a single ingredient by ID
 */
export async function getIngredient(id: string) {
  return pb.collection('ingredients').getOne<IngredientRecord>(id, {
    expand: 'category',
  });
}

/**
 * Get a single ingredient by ID - alias for getIngredient
 */
export async function getById(id: string) {
  return getIngredient(id);
}

/**
 * Create a new ingredient
 */
export async function createIngredient(data: Omit<IngredientRecord, keyof BaseRecord>) {
  return pb.collection('ingredients').create<IngredientRecord>(data);
}

/**
 * Update an ingredient
 */
export async function updateIngredient(id: string, data: Partial<IngredientRecord>) {
  return pb.collection('ingredients').update<IngredientRecord>(id, data);
}

/**
 * Delete an ingredient
 */
export async function deleteIngredient(id: string) {
  return pb.collection('ingredients').delete(id);
}
