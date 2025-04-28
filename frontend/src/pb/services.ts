import { pb } from './client';
import {
  Salad,
  Ingredient,
  Category,
  Order, 
  // CartItem,
  SaladsResponse,
  UserSaladsResponse,
  IngredientsResponse,
  IngredientCategoryResponse,
  OrdersResponse,
  convertToSalad,
  convertToIngredient,
  convertToCategory,
  convertToOrder
} from './types';

// Generic options interface for list queries
export interface ListOptions {
  filter?: string; 
  sort?: string;
  expand?: string;
  fields?: string;
  skipTotal?: boolean;
  page?: number;
  perPage?: number;
}

// Ingredient Service
export const ingredientService = {
  async getAll(): Promise<Ingredient[]> {
    const response = await pb.collection('ingredients').getFullList<IngredientsResponse>();
    return response.map(item => convertToIngredient(item));
  },
  
  async getById(id: string): Promise<Ingredient> {
    const response = await pb.collection('ingredients').getOne<IngredientsResponse>(id);
    return convertToIngredient(response);
  },
  
  async getByIds(ids: string[]): Promise<Ingredient[]> {
    if (ids.length === 0) return [];
    const filter = ids.map(id => `id="${id}"`).join(' || ');
    const response = await pb.collection('ingredients').getFullList<IngredientsResponse>({
      filter
    });
    return response.map(item => convertToIngredient(item));
  },
  
  async create(data: Partial<Ingredient>): Promise<Ingredient> {
    const response = await pb.collection('ingredients').create<IngredientsResponse>(data);
    return convertToIngredient(response);
  },
  
  async update(id: string, data: Partial<Ingredient>): Promise<Ingredient> {
    const response = await pb.collection('ingredients').update<IngredientsResponse>(id, data);
    return convertToIngredient(response);
  },
  
  async delete(id: string): Promise<boolean> {
    await pb.collection('ingredients').delete(id);
    return true;
  },

  async getWithFilter(options: ListOptions = {}): Promise<Ingredient[]> {
    const response = await pb.collection('ingredients').getFullList<IngredientsResponse>(options);
    return response.map(item => convertToIngredient(item));
  }
};

// Category Service
export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await pb.collection('ingredient_category').getFullList<IngredientCategoryResponse>();
    return response.map(item => convertToCategory(item));
  },
  
  async getById(id: string): Promise<Category> {
    const response = await pb.collection('ingredient_category').getOne<IngredientCategoryResponse>(id);
    return convertToCategory(response);
  },

  async create(data: Partial<Category>): Promise<Category> {
    const response = await pb.collection('ingredient_category').create<IngredientCategoryResponse>(data);
    return convertToCategory(response);
  },
  
  async update(id: string, data: Partial<Category>): Promise<Category> {
    const response = await pb.collection('ingredient_category').update<IngredientCategoryResponse>(id, data);
    return convertToCategory(response);
  },
  
  async delete(id: string): Promise<boolean> {
    await pb.collection('ingredient_category').delete(id);
    return true;
  }
};

// Salad Service
export const saladService = {
  async getAll(): Promise<Salad[]> {
    const response = await pb.collection('user_salads').getFullList<UserSaladsResponse>();
    return response.map(item => convertToSalad(item));
  },

  async getPremadeSalads(): Promise<SaladsResponse[]> {
    return pb.collection('salads').getFullList<SaladsResponse>();
  },
  
  async getById(id: string): Promise<Salad> {
    const response = await pb.collection('user_salads').getOne<UserSaladsResponse>(id);
    return convertToSalad(response);
  },
  
  async getSalad(id: string): Promise<SaladsResponse> {
    return pb.collection('salads').getOne<SaladsResponse>(id);
  },
  
  async getUserSalad(id: string): Promise<Salad> {
    const response = await pb.collection('user_salads').getOne<UserSaladsResponse>(id);
    return convertToSalad(response);
  },
  
  async create(data: Partial<Salad>): Promise<Salad> {
    const response = await pb.collection('user_salads').create<UserSaladsResponse>(data);
    return convertToSalad(response);
  },
  
  async update(id: string, data: Partial<Salad>): Promise<Salad> {
    const response = await pb.collection('user_salads').update<UserSaladsResponse>(id, data);
    return convertToSalad(response);
  },
  
  async delete(id: string): Promise<boolean> {
    await pb.collection('user_salads').delete(id);
    return true;
  },
  
  async toggleFavorite(id: string, favorite: boolean): Promise<Salad> {
    const response = await pb.collection('user_salads').update<UserSaladsResponse>(id, { 
      is_favorite: favorite 
    });
    return convertToSalad(response);
  },

  async getWithFilter(options: ListOptions = {}): Promise<Salad[]> {
    const response = await pb.collection('user_salads').getFullList<UserSaladsResponse>(options);
    return response.map(item => convertToSalad(item));
  },

  async getUserSalads(userId: string): Promise<Salad[]> {
    const response = await pb.collection('user_salads').getFullList<UserSaladsResponse>({
      filter: `user_id = "${userId}"`,
      sort: '-created'
    });
    return response.map(item => convertToSalad(item));
  },
};

// Order Service
export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await pb.collection('orders').getFullList<OrdersResponse>({
      sort: '-created',
      filter: pb.authStore?.model?.id ? `user_id = "${pb.authStore?.model?.id}"` : ''
    });
    return response.map(item => convertToOrder(item));
  },
  
  async getById(id: string): Promise<Order> {
    const response = await pb.collection('orders').getOne<OrdersResponse>(id);
    return convertToOrder(response);
  },
  
  async create(data: Partial<Order>): Promise<Order> {
    const response = await pb.collection('orders').create<OrdersResponse>(data);
    return convertToOrder(response);
  },
  
  async update(id: string, data: Partial<Order>): Promise<Order> {
    const response = await pb.collection('orders').update<OrdersResponse>(id, data);
    return convertToOrder(response);
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    const response = await pb.collection('orders').getFullList<OrdersResponse>({
      filter: `user_id = "${userId}"`,
      sort: '-created'
    });
    return response.map(item => convertToOrder(item));
  }
};

// Auth Service
export const authService = {
  async login(email: string, password: string) {
    return pb.collection('users').authWithPassword(email, password);
  },
  
  async register(email: string, password: string, passwordConfirm: string, userData: Record<string, unknown> = {}) {
    return pb.collection('users').create({
      email,
      password,
      passwordConfirm,
      ...userData
    });
  },
  
  async logout() {
    pb.authStore.clear();
  },
  
  async requestPasswordReset(email: string) {
    return pb.collection('users').requestPasswordReset(email);
  },
  
  isAuthenticated() {
    return pb.authStore.isValid;
  },
  
  getCurrentUser() {
    return pb.authStore.model;
  }
};

export { pb };