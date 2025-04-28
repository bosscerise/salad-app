# Ingredient API Documentation

## Service Layer - `ingredientService`

The ingredient service provides methods to interact with ingredient data in the PocketBase backend.

### Import

```typescript
import { ingredientService } from '../pb';
```

### Available Methods

#### Get All Ingredients

```typescript
const ingredients = await ingredientService.getAll();
```

Returns all ingredients sorted by name, with their category information expanded.

#### Get Ingredients by Category ID

```typescript
const ingredients = await ingredientService.getIngredients(categoryId);
```

Returns all ingredients in a specific category, sorted by name.

**Parameters:**
- `categoryId` (optional): The ID of the category to filter by

#### Get Ingredients by Category Name

```typescript
const ingredients = await ingredientService.getByCategory(categoryName);
```

Returns all ingredients in a category with a matching name.

**Parameters:**
- `categoryName`: The name of the category to filter by

#### Get Ingredients by IDs

```typescript
const ingredients = await ingredientService.getIngredientsByIds([id1, id2, id3]);
```

Returns ingredients matching the provided IDs.

**Parameters:**
- `ids`: Array of ingredient IDs to fetch

#### Get Single Ingredient

```typescript
const ingredient = await ingredientService.getIngredient(id);
// OR
const ingredient = await ingredientService.getById(id);
```

Returns a single ingredient by ID with its category information expanded.

**Parameters:**
- `id`: The ID of the ingredient to fetch

#### Create Ingredient

```typescript
const newIngredient = await ingredientService.createIngredient({
  name: 'Lettuce',
  description: 'Fresh lettuce',
  price: 1.99,
  category: 'CATEGORY_ID',
  image: 'lettuce.jpg'
});
```

Creates a new ingredient.

**Parameters:**
- `data`: Object containing ingredient properties

#### Update Ingredient

```typescript
const updatedIngredient = await ingredientService.updateIngredient(id, {
  name: 'Updated Lettuce',
  price: 2.49
});
```

Updates an existing ingredient.

**Parameters:**
- `id`: The ID of the ingredient to update
- `data`: Object containing the properties to update

#### Delete Ingredient

```typescript
await ingredientService.deleteIngredient(id);
```

Deletes an ingredient.

**Parameters:**
- `id`: The ID of the ingredient to delete

#### Get Ingredient Categories

```typescript
const categories = await ingredientService.getIngredientCategories();
```

Returns all ingredient categories sorted by the `order` field.

## React Hook - `useIngredients`

The `useIngredients` hook provides React components with ingredient data, along with loading and error states.

### Import

```typescript
import { useIngredients } from '../hooks/useIngredients';
```

### Usage

```typescript
function IngredientsComponent() {
  // Get all ingredients
  const { ingredients, loading, error } = useIngredients();
  
  // OR get ingredients in a specific category
  const { ingredients, loading, error } = useIngredients('Vegetables');
  
  if (loading) return <div>Loading ingredients...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {ingredients.map(ingredient => (
        <div key={ingredient.id}>
          <h3>{ingredient.name}</h3>
          <p>{ingredient.description}</p>
          <p>${ingredient.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Parameters

- `category` (optional): The name of the category to filter ingredients by

### Return Value

An object with the following properties:

- `ingredients`: Array of ingredient objects
- `loading`: Boolean indicating if data is being loaded
- `error`: Error object or null if no error