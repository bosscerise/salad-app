import { pb } from './client';
import { BaseRecord, SubscriptionRecord } from './types';

/**
 * Get all subscriptions for the current user
 */
export async function getUserSubscriptions(userId?: string) {
  // If no userId is provided, use the current authenticated user
  const currentUserId = userId || pb.authStore.model?.id;
  
  if (!currentUserId) {
    throw new Error('No user is authenticated');
  }
  
  return pb.collection('subscriptions').getFullList<SubscriptionRecord>({
    filter: `user_id="${currentUserId}"`,
    sort: '-created',
  });
}

/**
 * Get a single subscription by ID
 */
export async function getSubscription(id: string) {
  return pb.collection('subscriptions').getOne<SubscriptionRecord>(id);
}

/**
 * Get a single subscription by ID - alias for getSubscription
 */
export async function getById(id: string) {
  return getSubscription(id);
}

/**
 * Get all subscriptions - alias for getAllSubscriptions
 */
export async function getAll() {
  return getAllSubscriptions();
}

/**
 * Create a new subscription
 */
export async function createSubscription(data: Omit<SubscriptionRecord, keyof BaseRecord>) {
  // If no user_id is provided, use the current authenticated user
  const subscriptionData = {
    ...data,
    user_id: data.user_id || pb.authStore.model?.id,
  };
  
  if (!subscriptionData.user_id) {
    throw new Error('No user is authenticated');
  }
  
  return pb.collection('subscriptions').create<SubscriptionRecord>(subscriptionData);
}

/**
 * Update a subscription
 */
export async function updateSubscription(id: string, data: Partial<SubscriptionRecord>) {
  return pb.collection('subscriptions').update<SubscriptionRecord>(id, data);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(id: string) {
  return pb.collection('subscriptions').update<SubscriptionRecord>(id, { 
    active: false,
    endDate: new Date().toISOString()
  });
}

/**
 * Get all active subscriptions - admin only
 */
export async function getAllSubscriptions(activeOnly: boolean = false) {
  const filter = activeOnly ? 'active=true' : '';
  
  return pb.collection('subscriptions').getFullList<SubscriptionRecord>({
    filter,
    sort: '-created',
    expand: 'user_id',
  });
}