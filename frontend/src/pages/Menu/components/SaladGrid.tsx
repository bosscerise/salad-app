import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Salad } from '../types';
import SaladCard from './SaladCard';

interface SaladGridProps {
  salads: Salad[];
  favorites: number[];
  toggleFavorite: (id: number) => void;
  handleAddToCart: () => void;
}

const SaladGrid: React.FC<SaladGridProps> = ({ 
  salads, 
  favorites, 
  toggleFavorite, 
  handleAddToCart 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {salads.map((salad) => (
          <SaladCard
            key={salad.id}
            salad={salad}
            isFavorite={favorites.includes(salad.id)}
            onToggleFavorite={toggleFavorite}
            onAddToCart={handleAddToCart}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SaladGrid;
