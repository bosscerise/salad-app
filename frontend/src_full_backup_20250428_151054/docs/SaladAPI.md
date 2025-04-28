# Salad API Documentation

## Service Layer - `saladService`

The salad service provides methods to interact with premade salads and user-created custom salads in the PocketBase backend.

### Import

```typescript
import { saladService } from '../pb';
```

### Available Methods for Premade Salads

#### Get All Salads

```typescript
const salads = await saladService.getAll();
// OR with filtering options
const featuredSalads = await saladService.getSalads({ featured: true });
const availableSalads = await saladService.getSalads({ availableOnly: true });
```

Returns all premade salads, optionally filtered by featured status or availability.

**Parameters:**
- `options` (optional): Object with filtering options
  - `featured`: Boolean to filter for featured salads
  - `availableOnly`: Boolean to filter for available salads

#### Get Salad by ID

```typescript
const salad = await saladService.getSalad(id);
```

Returns a single premade salad by ID.

**Parameters:**
- `id`: The ID of the salad to fetch

#### Get Salad (User or Premade) by ID

```typescript
const salad = await saladService.getById(id);
```

Tries to fetch a salad from both user_salads and premade salads collections.

**Parameters:**
- `id`: The ID of the salad to fetch

#### Create Premade Salad

```typescript
const newSalad = await saladService.createSalad({
  name: 'Classic Caesar',
  description: 'Traditional caesar salad',
  ingredients: ['id1', 'id2', 'id3'],
  price: 9.99,
  image: 'caesar.jpg',
  featured: true,
  available: true
});
```

Creates a new premade salad.

**Parameters:**
- `data`: Object containing salad properties

#### Update Premade Salad

```typescript
const updatedSalad = await saladService.updateSalad(id, {
  name: 'Updated Caesar',
  price: 10.99
});
```

Updates an existing premade salad.

**Parameters:**
- `id`: The ID of the salad to update
- `data`: Object containing the properties to update

#### Delete Premade Salad

```typescript
await saladService.deleteSalad(id);
```

Deletes a premade salad.

**Parameters:**
- `id`: The ID of the salad to delete

### Available Methods for User Salads

#### Get User Salads

```typescript
const userSalads = await saladService.getUserSalads();
// OR for a specific user
const userSalads = await saladService.getUserSalads(userId);
```

Returns all salads created by the current user or a specified user.

**Parameters:**
- `userId` (optional): The ID of the user whose salads to fetch. If not provided, uses the currently authenticated user.

#### Get User Salad by ID

```typescript
const userSalad = await saladService.getUserSalad(id);
```

Returns a single user-created salad by ID.

**Parameters:**
- `id`: The ID of the user salad to fetch

#### Save User Salad

```typescript
const newUserSalad = await saladService.saveUserSalad({
  name: 'My Custom Salad',
  ingredients: ['id1', 'id2', 'id3'],
  user_id: 'USER_ID', // Optional, uses current user if not provided
  is_favorite: false
});
// OR using the alias
const newUserSalad = await saladService.create({
  name: 'My Custom Salad',
  ingredients: ['id1', 'id2', 'id3']
});
```

Saves a custom user-created salad.

**Parameters:**
- `data`: Object containing user salad properties

#### Update User Salad

```typescript
const updatedUserSalad = await saladService.updateUserSalad(id, {
  name: 'Updated Custom Salad',
  ingredients: ['id1', 'id2', 'id4']
});
```

Updates an existing user-created salad.

**Parameters:**
- `id`: The ID of the user salad to update
- `data`: Object containing the properties to update

#### Delete User Salad

```typescript
await saladService.deleteUserSalad(id);
// OR using the alias
await saladService.delete_salad(id);
```

Deletes a user-created salad.

**Parameters:**
- `id`: The ID of the user salad to delete

#### Toggle Favorite Status

```typescript
await saladService.toggleFavorite(id, true); // Mark as favorite
await saladService.toggleFavorite(id, false); // Unmark as favorite
```

Toggles the favorite status of a user salad.

**Parameters:**
- `id`: The ID of the user salad
- `isFavorite`: Boolean indicating whether the salad should be marked as a favorite