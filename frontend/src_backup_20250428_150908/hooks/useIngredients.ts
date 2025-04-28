import { useState, useEffect } from 'react';
import { IngredientRecord, ingredientService } from '../pb';

export function useIngredients(category?: string) {
  const [ingredients, setIngredients] = useState<IngredientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let data;
        
        if (category) {
          data = await ingredientService.getByCategory(category);
        } else {
          data = await ingredientService.getAll();
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