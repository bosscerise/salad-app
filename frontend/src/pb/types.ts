/// <reference path="../../../backend/pb/pb_data/types.d.ts" />
import { 
  UserSaladsRecord, 
  UserSaladsResponse, 
  IngredientsRecord, 
  IngredientsResponse,
  IngredientCategoryRecord, 
  IngredientCategoryResponse, 
  OrdersRecord, 
  OrdersResponse,
  SaladsRecord,
  SaladsResponse,
  OrdersStatusOptions,
  UsersRecord,
  UsersResponse
} from '../../pocketbase-types';

// Re-export types from pocketbase-types
export type { 
  UserSaladsRecord, 
  UserSaladsResponse, 
  IngredientsRecord, 
  IngredientsResponse,
  IngredientCategoryRecord, 
  IngredientCategoryResponse, 
  OrdersRecord, 
  OrdersResponse,
  SaladsRecord,
  SaladsResponse,
  OrdersStatusOptions,
  UsersRecord,
  UsersResponse
};

// Define the CartItem type for use throughout the application
export interface CartItem {
  id: string;
  type: 'ingredient' | 'saved-salad' | 'premade';
  quantity: number;
  name: string;
  price: number;
  details?: any;
  customizations?: Record<string, any> | Array<{id: string; quantity: number}>;
  ingredients?: Record<string, number>;
  customized?: boolean;
  originalSaladId?: string;
}

// Define common application types that map to PocketBase records
export interface Salad {
  id: string;
  name: string;
  description?: string;
  total_price: number;
  ingredients: Record<string, number>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  is_favorite: boolean;
  user?: string;
  user_id?: string;
  created?: string;
  updated?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  emoji?: string;
  available?: boolean;
  created?: string;
  updated?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  emoji?: string;
  order?: number;
  created?: string;
  updated?: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: Record<string, number>;
  items_detail?: Array<CartItem>;
  total: number;
  status: OrdersStatusOptions;
  delivery: boolean;
  created?: string;
  updated?: string;
}

export interface User extends UsersRecord {
  avatar?: string;
  name?: string;
  points?: number;
}

// Helper functions to convert between PocketBase responses and app types
export function convertToSalad(response: UserSaladsResponse): Salad {
  return {
    id: response.id,
    name: response.name || '',
    description: response.description,
    total_price: response.total_price || 0,
    ingredients: (response.ingredients as Record<string, number>) || {},
    total_calories: response.total_calories || 0,
    total_protein: response.total_protein || 0,
    total_carbs: response.total_carbs || 0,
    total_fats: response.total_fats || 0,
    is_favorite: Boolean(response.is_favorite),
    user: response.user_id,
    created: response.created,
    updated: response.updated
  };
}

export function convertToIngredient(response: IngredientsResponse): Ingredient {
  return {
    id: response.id,
    name: response.name || '',
    category: response.category || '',
    price: response.price || 0,
    calories: response.calories || 0,
    protein: response.protein || 0,
    carbs: response.carbs || 0,
    fats: response.fats || 0,
    emoji: response.emoji || '🥗',
    available: response.available,
    created: response.created,
    updated: response.updated
  };
}

export function convertToCategory(response: IngredientCategoryResponse): Category {
  return {
    id: response.id,
    name: response.name || '',
    description: response.description,
    icon_name: response.icon_name,
    order: response.order,
    created: response.created,
    updated: response.updated
  };
}

export function convertToOrder(response: OrdersResponse): Order {
  return {
    id: response.id,
    user_id: response.user_id || '',
    items: response.items as Record<string, number> || {},
    items_detail: response.items_detail as Array<CartItem> || [],
    total: response.total || 0,
    status: response.status || OrdersStatusOptions.pending,
    delivery: Boolean(response.delivery),
    created: response.created,
    updated: response.updated
  };
}

// Utility type for RecordId
export type RecordIdString = string;

// Utility conversion functions
export function safelyParseJSON<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return fallback;
  }
}

// Utility function to ensure string values
export function ensureString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
}

// Utility function to ensure numeric values
export function ensureNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

// Type guard for checking if object has required CartItem properties
export function isCartItem(obj: unknown): obj is CartItem {
  if (!obj || typeof obj !== 'object') return false;
  const item = obj as Partial<CartItem>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number' &&
    (item.type === 'ingredient' || item.type === 'saved-salad' || item.type === 'premade')
  );
}

// Type guard for checking if object has required Salad properties
export function isSalad(obj: unknown): obj is Salad {
  if (!obj || typeof obj !== 'object') return false;
  const salad = obj as Partial<Salad>;
  return (
    typeof salad.id === 'string' &&
    typeof salad.name === 'string' &&
    typeof salad.total_price === 'number' &&
    typeof salad.ingredients === 'object'
  );
}