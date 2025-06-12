import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ingredientApi, 
  categoryApi, 
  saladApi, 
  userSaladApi,
  orderApi,
  pb,
  loadMenuData,
  type Ingredient,
  type IngredientCategory,
  type UserSalad,
  type Order,
  type Salad
} from '../services/api';

// Ingredient queries
export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: ingredientApi.getAll,
    staleTime: 5 * 60 * 1000 // 5 minutes - ingredients don't change often
  });
};

export const useIngredientsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['ingredients', 'category', categoryId],
    queryFn: () => ingredientApi.getByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useIngredient = (id: string) => {
  return useQuery({
    queryKey: ['ingredients', id],
    queryFn: () => ingredientApi.getById(id),
    enabled: !!id
  });
};

// Category queries
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
    staleTime: 10 * 60 * 1000 // 10 minutes - categories rarely change
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoryApi.getById(id),
    enabled: !!id
  });
};

// Combined data query (like loadMenuData)
export const useMenuData = () => {
  const queryClient = useQueryClient();
  
  // Prefetch ingredients and categories separately
  React.useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['ingredients'],
      queryFn: ingredientApi.getAll,
    });
    
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: categoryApi.getAll,
    });
  }, [queryClient]);
  
  return useQuery({
    queryKey: ['menuData'],
    queryFn: loadMenuData,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Salad queries
export const useSalads = () => {
  return useQuery({
    queryKey: ['salads'],
    queryFn: saladApi.getAll,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useSaladsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['salads', 'category', categoryId],
    queryFn: () => saladApi.getByCategory(categoryId),
    enabled: !!categoryId,
  });
};

export const useSalad = (id: string) => {
  return useQuery({
    queryKey: ['salads', id],
    queryFn: () => saladApi.getById(id),
    enabled: !!id
  });
};

// User Salad queries with mutations
export const useUserSalads = () => {
  return useQuery({
    queryKey: ['userSalads'],
    queryFn: userSaladApi.getAll,
    // Only fetch if user is logged in
    enabled: !!pb.authStore.isValid
  });
};

export const useUserSalad = (id: string) => {
  return useQuery({
    queryKey: ['userSalads', id],
    queryFn: () => userSaladApi.getById(id),
    enabled: !!id && !!pb.authStore.isValid
  });
};

export const useCreateUserSalad = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (saladData: Omit<UserSalad, 'id' | 'created' | 'updated'>) => 
      userSaladApi.create(saladData),
    onSuccess: (newSalad) => {
      queryClient.invalidateQueries({ queryKey: ['userSalads'] });
      
      // Add the new salad directly to the cache
      queryClient.setQueryData(['userSalads', newSalad.id], newSalad);
    }
  });
};

export const useUpdateUserSalad = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserSalad> }) => 
      userSaladApi.update(id, data),
    onSuccess: (updatedSalad, variables) => {
      // Update the specific salad in the cache
      queryClient.setQueryData(['userSalads', variables.id], updatedSalad);
      
      // Update this salad in the list cache
      queryClient.setQueriesData({ queryKey: ['userSalads'] }, (oldData: UserSalad[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(salad => 
          salad.id === variables.id ? { ...salad, ...variables.data } : salad
        );
      });
    }
  });
};

export const useDeleteUserSalad = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => userSaladApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the salad from the cache immediately
      queryClient.removeQueries({ queryKey: ['userSalads', deletedId] });
      
      // Update the list cache to remove the deleted salad
      queryClient.setQueriesData({ queryKey: ['userSalads'] }, (oldData: UserSalad[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(salad => salad.id !== deletedId);
      });
    }
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) => 
      userSaladApi.toggleFavorite(id, isFavorite),
    // Implement optimistic updates
    onMutate: async ({ id, isFavorite }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['userSalads'] });
      await queryClient.cancelQueries({ queryKey: ['userSalads', id] });
      
      // Get the current salad from cache
      const previousSalad = queryClient.getQueryData<UserSalad>(['userSalads', id]);
      
      // Optimistically update the salad in the cache
      if (previousSalad) {
        queryClient.setQueryData(['userSalads', id], {
          ...previousSalad,
          is_favorite: isFavorite
        });
      }
      
      // Also update the salad in the list cache
      const previousSalads = queryClient.getQueryData<UserSalad[]>(['userSalads']);
      
      if (previousSalads) {
        queryClient.setQueryData(['userSalads'], 
          previousSalads.map(salad => 
            salad.id === id ? { ...salad, is_favorite: isFavorite } : salad
          )
        );
      }
      
      return { previousSalad, previousSalads };
    },
    // If the mutation fails, roll back to the previous value
    onError: (err, variables, context) => {
      if (context?.previousSalad) {
        queryClient.setQueryData(['userSalads', variables.id], context.previousSalad);
      }
      
      if (context?.previousSalads) {
        queryClient.setQueryData(['userSalads'], context.previousSalads);
      }
    }
  });
};

// Order queries with mutations
export const useOrders = (userId: string) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: () => orderApi.getByUserId(userId),
    enabled: !!userId && !!pb.authStore.isValid
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id
  });
};

// Prefetch orders based on user ID
export const prefetchOrders = (userId: string) => {
  const queryClient = useQueryClient();
  
  if (userId && pb.authStore.isValid) {
    return queryClient.prefetchQuery({
      queryKey: ['orders', userId],
      queryFn: () => orderApi.getByUserId(userId)
    });
  }
  
  return Promise.resolve();
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: Omit<Order, 'id' | 'created' | 'updated'>) => 
      orderApi.create(orderData),
    onSuccess: (data) => {
      const userId = data.user_id;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['orders', userId] });
      }
      
      // Add new order to the cache directly
      queryClient.setQueryData(['orders', data.id], data);
    }
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) => 
      orderApi.updateStatus(id, status),
    // Optimistic update for better UX
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orders', id] });
      
      // Get current order from cache
      const previousOrder = queryClient.getQueryData<Order>(['orders', id]);
      
      // Optimistically update the order status
      if (previousOrder) {
        queryClient.setQueryData(['orders', id], {
          ...previousOrder,
          status
        });
        
        // If the order is in a user's order list, update it there too
        if (previousOrder.user_id) {
          const previousOrders = queryClient.getQueryData<Order[]>(['orders', previousOrder.user_id]);
          
          if (previousOrders) {
            queryClient.setQueryData(['orders', previousOrder.user_id], 
              previousOrders.map(order => 
                order.id === id ? { ...order, status } : order
              )
            );
          }
        }
      }
      
      return { previousOrder };
    },
    onError: (err, variables, context) => {
      // Roll back to previous state on error
      if (context?.previousOrder) {
        queryClient.setQueryData(['orders', variables.id], context.previousOrder);
        
        if (context.previousOrder.user_id) {
          queryClient.invalidateQueries({ 
            queryKey: ['orders', context.previousOrder.user_id]
          });
        }
      }
    },
    onSuccess: (data) => {
      // On success, make sure the UI reflects the server state
      queryClient.setQueryData(['orders', data.id], data);
      
      if (data.user_id) {
        queryClient.invalidateQueries({ queryKey: ['orders', data.user_id] });
      }
    }
  });
};

// Subscription setup for real-time updates
export const useOrderSubscription = (userId: string) => {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!userId || !pb.authStore.isValid) return;

    const unsubscribe = orderApi.subscribeToUpdates((data) => {
      // When an order is updated, invalidate the relevant queries
      const record = data.record as Order;
      
      // For optimal UX, update the cache directly instead of just invalidating
      if (data.action === 'update') {
        queryClient.setQueryData(['orders', record.id], record);
        
        // Update the order in the user's order list without a full refetch
        queryClient.setQueriesData({ queryKey: ['orders', userId] }, (oldData: Order[] | undefined) => {
          if (!oldData) return [];
          return oldData.map(order => order.id === record.id ? record : order);
        });
      } else {
        // For other actions, invalidate to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['orders', userId] });
        queryClient.invalidateQueries({ queryKey: ['orders', record.id] });
      }
    });

    return () => {
      orderApi.unsubscribeFromUpdates(unsubscribe);
    };
  }, [userId, queryClient]);
};