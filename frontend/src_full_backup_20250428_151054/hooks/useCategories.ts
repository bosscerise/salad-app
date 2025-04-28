import { useState, useEffect } from 'react';
import { IngredientCategoryRecord, categoryService } from '../pb';
import { getIconFromName } from '../utils/icon-utils';
import { IngredientCategoryWithIcon } from '../pb/types';

export function useCategories() {
  const [categories, setCategories] = useState<IngredientCategoryWithIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await categoryService.getAll();
        
        // Process categories to include icon components
        const processedCategories = data.map(category => ({
          id: category.id,
          name: category.name,
          order: category.order || 0,
          icon_name: category.icon_name || '',
          description: category.description,
          icon: getIconFromName(category.icon_name)
        }));
        
        setCategories(processedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { categories, loading, error };
}