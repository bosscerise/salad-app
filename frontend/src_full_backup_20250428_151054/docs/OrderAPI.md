# Order API Documentation

## Service Layer - `orderService`

The order service provides methods to interact with customer orders in the PocketBase backend.

### Import

```typescript
import { orderService } from '../pb';
```

### Available Methods

#### Get User Orders

```typescript
const userOrders = await orderService.getUserOrders();
// OR for a specific user (admin function)
const userOrders = await orderService.getUserOrders(userId);
```

Returns all orders for the current user or a specified user, sorted by creation date (newest first).

**Parameters:**
- `userId` (optional): The ID of the user whose orders to fetch. If not provided, uses the currently authenticated user.

#### Get Order by ID

```typescript
const order = await orderService.getOrder(id);
// OR
const order = await orderService.getById(id);
```

Returns a single order by ID.

**Parameters:**
- `id`: The ID of the order to fetch

#### Create Order

```typescript
const newOrder = await orderService.createOrder({
  salad_id: 'SALAD_ID',
  quantity: 2,
  total_price: 19.98,
  delivery_address: '123 Main St',
  payment_method: 'credit_card',
  status: 'pending',
  user_id: 'USER_ID' // Optional, uses current user if not provided
});
```

Creates a new order.

**Parameters:**
- `data`: Object containing order properties

#### Update Order Status

```typescript
const updatedOrder = await orderService.updateOrderStatus(id, 'completed');
```

Updates the status of an existing order.

**Parameters:**
- `id`: The ID of the order to update
- `status`: The new status (e.g., 'pending', 'processing', 'completed', 'cancelled')

#### Cancel Order

```typescript
await orderService.cancelOrder(id);
```

Cancels an order by setting its status to 'cancelled'.

**Parameters:**
- `id`: The ID of the order to cancel

#### Get All Orders (Admin Only)

```typescript
const allOrders = await orderService.getAllOrders();
// OR filtered by status
const pendingOrders = await orderService.getAllOrders('pending');
```

Returns all orders, optionally filtered by status. This is typically an admin function.

**Parameters:**
- `status` (optional): The status to filter by

#### Update Order

```typescript
const updatedOrder = await orderService.updateOrder(id, {
  status: 'completed',
  delivery_address: '456 New Address St'
});
```

Updates an existing order with new data.

**Parameters:**
- `id`: The ID of the order to update
- `data`: Object containing the properties to update