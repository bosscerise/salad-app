# Salad App API Documentation

## Overview

The Salad App uses a layered API architecture with PocketBase as the backend:

1. **PocketBase Client Layer** - Connection to PocketBase backend
2. **Service Layer** - CRUD operations for each entity type
3. **React Hooks Layer** - React-friendly data access and state management

## Directory Structure

```
/src/pb/
  - client.ts             # PocketBase instance setup
  - types.ts              # TypeScript type definitions
  - index.ts              # Central export point for all services
  - categoryService.ts    # Category CRUD operations
  - ingredientService.ts  # Ingredient CRUD operations
  - orderService.ts       # Order CRUD operations
  - saladService.ts       # Salad CRUD operations
  - subscriptionService.ts # Subscription CRUD operations

/src/hooks/
  - useAuth.tsx           # Authentication hook
  - useCategories.ts      # Categories data hook
  - useIngredients.ts     # Ingredients data hook
  - usePocketBaseStatus.ts # Backend connection status
  - useRegisterUser.ts    # User registration
  - useSalads.ts          # Salads data hook
  - useTheme.ts           # Theme management
  - useToast.tsx          # Toast notifications
```

## How to Use

### 1. Service Layer

The service layer provides direct access to the PocketBase API. Import specific services:

```typescript
import { ingredientService } from '../pb';

// Use service methods
const ingredients = await ingredientService.getAll();
```

### 2. React Hooks Layer

The hooks layer provides React-friendly data access with loading and error states:

```typescript
import { useIngredients } from '../hooks/useIngredients';

function MyComponent() {
  const { ingredients, loading, error } = useIngredients();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {ingredients.map(ingredient => (
        <div key={ingredient.id}>{ingredient.name}</div>
      ))}
    </div>
  );
}
```

## Available Services and Hooks

See the individual documentation files for each service and hook:

- [Category Service & Hook](./CategoryAPI.md)
- [Ingredient Service & Hook](./IngredientAPI.md)
- [Order Service & Hook](./OrderAPI.md)
- [Salad Service & Hook](./SaladAPI.md)
- [Subscription Service & Hook](./SubscriptionAPI.md)
- [Authentication](./AuthAPI.md)