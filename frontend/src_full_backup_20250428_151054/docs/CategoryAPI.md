# Category API Documentation

## Service Layer - `categoryService`

The category service provides methods to interact with ingredient categories in the PocketBase backend.

### Import

```typescript
import { categoryService } from '../pb';
```

### Available Methods

#### Get All Categories

```typescript
const categories = await categoryService.getAll();
// OR
const categories = await categoryService.getCategories();
```

Returns all ingredient categories sorted by the `order` field.

#### Get Category by ID

```typescript
const category = await categoryService.getCategory(id);
// OR
const category = await categoryService.getById(id);
```

Returns a single category by ID.

**Parameters:**
- `id`: The ID of the category to fetch

#### Create Category

```typescript
const newCategory = await categoryService.createCategory({
  name: 'Vegetables',
  icon_name: 'Carrot',
  order: 1
});
```

Creates a new category.

**Parameters:**
- `data`: Object containing category properties

#### Update Category

```typescript
const updatedCategory = await categoryService.updateCategory(id, {
  name: 'Updated Vegetables',
  order: 2
});
```

Updates an existing category.

**Parameters:**
- `id`: The ID of the category to update
- `data`: Object containing the properties to update

#### Delete Category

```typescript
await categoryService.deleteCategory(id);
```

Deletes a category.

**Parameters:**
- `id`: The ID of the category to delete

## React Hook - `useCategories`

The `useCategories` hook provides React components with category data, along with loading and error states. It also enhances categories with React icon components based on the `icon_name` field.

### Import

```typescript
import { useCategories } from '../hooks/useCategories';
```

### Usage

```typescript
function CategoriesComponent() {
  const { categories, loading, error } = useCategories();
  
  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>
          <div>{category.icon}</div> {/* This is a React component */}
          <h3>{category.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

### Return Value

An object with the following properties:

- `categories`: Array of category objects, each enhanced with an `icon` property containing a React component
- `loading`: Boolean indicating if data is being loaded
- `error`: Error object or null if no error

### Note

The `useCategories` hook automatically converts the `icon_name` string from each category into a React icon component using the `getIconFromName` utility function.