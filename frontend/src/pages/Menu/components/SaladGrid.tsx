import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { Salad } from '../../../services/api';
import { useCart } from '../../../contexts/CartContext';
import { useState } from 'react';
import SaladQuickView from './SaladQuickView';

interface SaladGridProps {
  salads: Salad[];
  onSaladClick?: (salad: Salad) => void;
}

export default function SaladGrid({ 
  salads, 
  onSaladClick
}: SaladGridProps) {
  const { addToCart } = useCart();
  const [selectedSalad, setSelectedSalad] = useState<Salad | null>(null);
  
  const handleAddToCart = (salad: Salad) => {
    addToCart({
      id: salad.id,
      type: 'premade',
      name: salad.name,
      price: salad.price,
      quantity: 1
    });
  };
  
  const handleViewDetails = (salad: Salad) => {
    setSelectedSalad(salad);
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <motion.div 
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" 
        variants={container}
        initial="hidden"
        animate="show"
      >
        {salads.map((salad) => (
          <motion.div
            key={salad.id}
            variants={item}
            whileHover={{ y: -10 }}
            className="overflow-hidden bg-white shadow-md cursor-pointer group rounded-3xl"
            onClick={() => onSaladClick && onSaladClick(salad)}
          >
            <div className="relative overflow-hidden h-60">
              <img
                src={salad.image}
                alt={salad.name}
                className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:opacity-100"></div>
              
              {/* Simple Price Tag */}
              <div className="absolute px-3 py-2 font-bold bg-white rounded-full shadow-lg top-4 right-4 text-emerald-700">
                ${salad.price}
              </div>
              
              {/* Action Buttons on Hover */}
              <div className="absolute left-0 right-0 flex justify-center gap-3 transition-transform duration-300 transform translate-y-10 opacity-0 bottom-4 group-hover:translate-y-0 group-hover:opacity-100">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-full shadow-md bg-white/90 text-emerald-700 hover:bg-white backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(salad);
                  }}
                  aria-label="View details"
                >
                  <Eye size={20} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="p-3 text-white rounded-full shadow-md bg-emerald-600/90 hover:bg-emerald-600 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(salad);
                  }}
                  aria-label="Add to cart"
                >
                  <ShoppingCart size={20} />
                </motion.button>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="mb-2 text-xl font-bold text-gray-800 transition-colors group-hover:text-emerald-600">
                {salad.name}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-2 min-h-[3rem]">
                {salad.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {salad.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span>{salad.calories} cal</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {selectedSalad && (
        <SaladQuickView
          salad={selectedSalad}
          onClose={() => setSelectedSalad(null)}
          onAddToCart={() => {
            handleAddToCart(selectedSalad);
            setSelectedSalad(null);
          }}
        />
      )}
    </>
  );
}
