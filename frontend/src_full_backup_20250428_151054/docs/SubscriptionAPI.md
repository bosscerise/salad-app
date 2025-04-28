# Subscription API Documentation

## Service Layer - `subscriptionService`

The subscription service provides methods to interact with subscription data in the PocketBase backend.

### Import

```typescript
import { subscriptionService } from '../pb';
```

### Available Methods

#### Get User Subscriptions

```typescript
const userSubscriptions = await subscriptionService.getUserSubscriptions();
// OR for a specific user (admin function)
const userSubscriptions = await subscriptionService.getUserSubscriptions(userId);
```

Returns all subscriptions for the current user or a specified user, sorted by creation date (newest first).

**Parameters:**
- `userId` (optional): The ID of the user whose subscriptions to fetch. If not provided, uses the currently authenticated user.

#### Get Subscription by ID

```typescript
const subscription = await subscriptionService.getSubscription(id);
// OR
const subscription = await subscriptionService.getById(id);
```

Returns a single subscription by ID.

**Parameters:**
- `id`: The ID of the subscription to fetch

#### Create Subscription

```typescript
const newSubscription = await subscriptionService.createSubscription({
  plan: 'weekly',
  frequency: 2, // 2 times per week
  salad_ids: ['SALAD_ID1', 'SALAD_ID2'],
  active: true,
  startDate: '2025-04-15T00:00:00.000Z',
  endDate: '2025-10-15T00:00:00.000Z',
  delivery_address: '123 Main St',
  payment_method: 'credit_card',
  user_id: 'USER_ID' // Optional, uses current user if not provided
});
```

Creates a new subscription.

**Parameters:**
- `data`: Object containing subscription properties

#### Update Subscription

```typescript
const updatedSubscription = await subscriptionService.updateSubscription(id, {
  frequency: 3,
  delivery_address: '456 New Address St'
});
```

Updates an existing subscription with new data.

**Parameters:**
- `id`: The ID of the subscription to update
- `data`: Object containing the properties to update

#### Cancel Subscription

```typescript
await subscriptionService.cancelSubscription(id);
```

Cancels a subscription by setting its `active` property to `false` and setting the `endDate` to the current date.

**Parameters:**
- `id`: The ID of the subscription to cancel

#### Get All Subscriptions (Admin Only)

```typescript
const allSubscriptions = await subscriptionService.getAllSubscriptions();
// OR only active subscriptions
const activeSubscriptions = await subscriptionService.getAllSubscriptions(true);
```

Returns all subscriptions, optionally filtered to active subscriptions only. This is typically an admin function.

**Parameters:**
- `activeOnly` (optional): Boolean indicating whether to return only active subscriptions