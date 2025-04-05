import { useState, useEffect } from 'react';
import { IngredientCategory } from '../services/api';
import { categoryApi } from '../services/api';
import { getIconFromName } from '../utils/icon-utils';

export function useCategories() {
  const [categories, setCategories] = useState<(IngredientCategory & { icon: React.ReactNode })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await categoryApi.getAll();
        
        // Process categories to include icon components
        const processedCategories = data.map(category => ({
          ...category,
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