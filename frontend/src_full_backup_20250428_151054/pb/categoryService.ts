// filepath: d:\shark\salad-app\frontend\src\pb\categoryService.ts
import { pb } from './client';
import { BaseRecord, IngredientCategoryRecord } from './types';

/**
 * Get all ingredient categories
 */
export async function getCategories() {
  return pb.collection('ingredient_category').getFullList<IngredientCategoryRecord>({
    sort: 'order',
  });
}

/**
 * Get all categories - alias for getCategories for consistency
 */
export async function getAll() {
  return getCategories();
}

/**
 * Get a single category by ID
 */
export async function getCategory(id: string) {
  return pb.collection('ingredient_category').getOne<IngredientCategoryRecord>(id);
}

/**
 * Get a category by ID - alias for getCategory
 */
export async function getById(id: string) {
  return getCategory(id);
}

/**
 * Create a new category
 */
export async function createCategory(data: Omit<IngredientCategoryRecord, keyof BaseRecord>) {
  return pb.collection('ingredient_category').create<IngredientCategoryRecord>(data);
}

/**
 * Update a category
 */
export async function updateCategory(id: string, data: Partial<IngredientCategoryRecord>) {
  return pb.collection('ingredient_category').update<IngredientCategoryRecord>(id, data);
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string) {
  return pb.collection('ingredient_category').delete(id);
}