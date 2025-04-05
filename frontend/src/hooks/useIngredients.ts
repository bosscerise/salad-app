import { useState, useEffect } from 'react';
import { Ingredient, ingredientApi } from '../services/api';

export function useIngredients(category?: string) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let data;
        
        if (category) {
          data = await ingredientApi.getByCategory(category);
        } else {
          data = await ingredientApi.getAll();
        }
        
        setIngredients(data);
      } catch (err) {
        console.error('Error fetching ingredients:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch ingredients'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [category]);

  return { ingredients, loading, error };
}