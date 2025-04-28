import { pb } from './client';
import { BaseRecord, SaladRecord, UserSaladRecord } from './types';

/**
 * Get all salads (alias for getSalads for consistency)
 */
export async function getAll() {
  return getSalads();
}

/**
 * Get all salads, with optional filtering for featured or available only
 */
export async function getSalads({ featured, availableOnly }: { 
  featured?: boolean; 
  availableOnly?: boolean;
} = {}) {
  let filter = '';

  if (featured) {
    filter += 'featured=true';
  }
  
  if (availableOnly) {
    filter += filter ? ' && available=true' : 'available=true';
  }

  return pb.collection('salads').getFullList<SaladRecord>({
    filter,
    sort: 'name',
  });
}

/**
 * Get a single salad by ID
 */
export async function getSalad(id: string) {
  return pb.collection('salads').getOne<SaladRecord>(id);
}

/**
 * Get a single salad by ID - alias for getSalad that tries both collections
 */
export async function getById(id: string) {
  // First try user_salads collection
  try {
    return await getUserSalad(id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // If not found in user_salads, try the regular salads collection
    return await getSalad(id);
  }
}

/**
 * Create a new salad
 */
export async function createSalad(data: Omit<SaladRecord, keyof BaseRecord>) {
  return pb.collection('salads').create<SaladRecord>(data);
}

/**
 * Update a salad
 */
export async function updateSalad(id: string, data: Partial<SaladRecord>) {
  return pb.collection('salads').update<SaladRecord>(id, data);
}

/**
 * Delete a salad
 */
export async function deleteSalad(id: string) {
  return pb.collection('salads').delete(id);
}

/**
 * Get all user saved salads for the current user
 */
export async function getUserSalads(userId?: string) {
  // If no userId is provided, use the current authenticated user
  const currentUserId = userId || pb.authStore.model?.id;
  
  if (!currentUserId) {
    throw new Error('No user is authenticated');
  }
  
  return pb.collection('user_salads').getFullList<UserSaladRecord>({
    filter: `user_id="${currentUserId}"`, // Fixed field name to user_id
    sort: '-created',
  });
}

/**
 * Get a single user salad by ID
 */
export async function getUserSalad(id: string) {
  return pb.collection('user_salads').getOne<UserSaladRecord>(id);
}

/**
 * Save a custom user salad
 */
export async function saveUserSalad(data: Omit<UserSaladRecord, 'id' | 'created' | 'updated'>) {
  // If no user_id is provided, use the current authenticated user
  const userData = {
    ...data,
    user_id: data.user_id || pb.authStore.model?.id,
  };
  
  if (!userData.user_id) {
    throw new Error('No user is authenticated');
  }
  
  return pb.collection('user_salads').create<UserSaladRecord>(userData);
}

/**
 * Update a user salad
 */
export async function updateUserSalad(id: string, data: Partial<UserSaladRecord>) {
  return pb.collection('user_salads').update<UserSaladRecord>(id, data);
}

/**
 * Delete a user salad
 */
export async function deleteUserSalad(id: string) {
  return pb.collection('user_salads').delete(id);
}

/**
 * Create a user salad (alias for saveUserSalad)
 */
export async function create(data: Omit<UserSaladRecord, 'id' | 'created' | 'updated'>) {
  return saveUserSalad(data);
}

/**
 * Toggle favorite status for a user salad
 */
export async function toggleFavorite(id: string, isFavorite: boolean) {
  return pb.collection('user_salads').update<UserSaladRecord>(id, {
    is_favorite: isFavorite
  });
}

/**
 * Delete a user salad (alias for deleteUserSalad)
 */
export async function delete_salad(id: string) {
  return deleteUserSalad(id);
}