import { pb } from './client';
import { BaseRecord, OrderRecord } from './types';

/**
 * Get all orders for the current user
 */
export async function getUserOrders(userId?: string) {
  // If no userId is provided, use the current authenticated user
  const currentUserId = userId || pb.authStore.model?.id;
  
  if (!currentUserId) {
    throw new Error('No user is authenticated');
  }
  
  return pb.collection('orders').getFullList<OrderRecord>({
    filter: `user_id="${currentUserId}"`,
    sort: '-created',
  });
}

/**
 * Get a single order by ID
 */
export async function getOrder(id: string) {
  return pb.collection('orders').getOne<OrderRecord>(id);
}

/**
 * Get a single order by ID - alias for getOrder
 */
export async function getById(id: string) {
  return getOrder(id);
}

/**
 * Get all orders - alias for getAll
 */
export async function getAll() {
  return getAllOrders();
}

/**
 * Create a new order
 */
export async function createOrder(data: Omit<OrderRecord, keyof BaseRecord>) {
  // If no user_id is provided, use the current authenticated user
  const orderData = {
    ...data,
    user_id: data.user_id || pb.authStore.model?.id,
  };
  
  if (!orderData.user_id) {
    throw new Error('No user is authenticated');
  }
  
  return pb.collection('orders').create<OrderRecord>(orderData);
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: string, status: OrderRecord['status']) {
  return pb.collection('orders').update<OrderRecord>(id, { status });
}

/**
 * Cancel an order
 */
export async function cancelOrder(id: string) {
  return updateOrderStatus(id, 'cancelled');
}

/**
 * Get all orders - admin only
 */
export async function getAllOrders(status?: OrderRecord['status']) {
  let filter = '';
  
  if (status) {
    filter = `status="${status}"`;
  }
  
  return pb.collection('orders').getFullList<OrderRecord>({
    filter,
    sort: '-created',
    expand: 'user_id',
  });
}

/**
 * Update order
 */
export async function updateOrder(id: string, data: Partial<OrderRecord>) {
  return pb.collection('orders').update<OrderRecord>(id, data);
}