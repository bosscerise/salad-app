import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, Heart, Loader2, Tag, Calendar } from 'lucide-react';
import { SaladRecord } from '../../../pb/types';
import { useInView } from 'react-intersection-observer';

interface SaladGridProps {
  salads: SaladRecord[];
  handleAddToCart: (salad: SaladRecord) => void;
  onSaladClick?: (salad: SaladRecord) => void;
  onViewDetails?: (salad: SaladRecord) => void;
}

// Memoized SaladCard component for better performance
const SaladCard = memo(({ 
  salad,
  onAddToCart,
  onView,
  onClick,
  delay = 0
}: { 
  salad: SaladRecord;
  onAddToCart: () => void;
  onView: () => void;
  onClick: () => void;
  delay?: number;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const placeholderColor = useRef(getRandomColorFromPalette());
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setImageError(true);
  }, []);

  // Function to get a random pastel color for the placeholder
  function getRandomColorFromPalette() {
    const colors = [
      'bg-emerald-100 dark:bg-emerald-900/40', 
      'bg-green-100 dark:bg-green-900/40', 
      'bg-teal-100 dark:bg-teal-900/40'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.6,
            delay: delay * 0.1,
            ease: [0.25, 0.1, 0.25, 1.0]
          } 
        }
      }}
      initial="hidden"
      animate={controls}
      whileHover={{ y: -8 }}
      className="h-full overflow-hidden bg-white shadow-md rounded-3xl relative group dark:bg-gray-800 dark:border dark:border-gray-700 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative overflow-hidden h-56 sm:h-64 cursor-pointer"
        onClick={onClick}
      >
        {/* Image loading skeleton */}
        {isLoading && (
          <div className={`absolute inset-0 flex items-center justify-center ${placeholderColor.current}`}>
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin opacity-70" />
          </div>
        )}

        {/* Image or fallback */}
        <img
          src={imageError ? '/images/default-salad.jpg' : salad.image}
          alt={salad.name}
          className={`object-cover w-full h-full transition-all duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'} ${isHovered ? 'scale-110' : 'scale-100'}`}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Gradient overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-90' : 'opacity-0'}`}
        />

        {/* Price tag */}
        <div className="absolute px-3 py-2 font-bold text-white rounded-full shadow-lg bg-emerald-600 top-4 right-4 z-10">
          ${salad.price.toFixed(2)}
        </div>

        {/* Season or special tag */}
        {salad.tags && salad.tags.includes('seasonal') && (
          <div className="absolute px-3 py-1 text-xs font-semibold bg-amber-500 text-white rounded-r-full top-16 left-0 flex items-center shadow-md">
            <Calendar size={12} className="mr-1" />
            Seasonal
          </div>
        )}

        {/* Action Buttons - Appear on hover */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 right-0 flex justify-center gap-3 bottom-4"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 rounded-full shadow-lg bg-white/95 text-emerald-700 hover:bg-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            aria-label="View details"
          >
            <Eye size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 text-white rounded-full shadow-lg bg-emerald-600/95 hover:bg-emerald-600 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            aria-label="Add to cart"
          >
            <ShoppingCart size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 rounded-full shadow-lg bg-white/95 text-rose-600 hover:bg-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite toggle
            }}
            aria-label="Add to favorites"
          >
            <Heart size={20} />
          </motion.button>
        </motion.div>
      </div>
      
      <div className="flex flex-col flex-1 p-5">
        <h3 className="mb-2 text-xl font-bold text-gray-800 line-clamp-1 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
          {salad.name}
        </h3>
        
        <p className="mb-4 text-gray-600 line-clamp-2 min-h-[3rem] dark:text-gray-300">
          {salad.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {salad.tags && salad.tags.slice(0, 2).map(tag => (
              <span 
                key={tag} 
                className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center"
              >
                <Tag size={10} className="mr-1" />
                {tag}
              </span>
            ))}
          </div>
          
          {/* Nutrition info */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{salad.calories} cal</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

SaladCard.displayName = 'SaladCard';

export default function SaladGrid({ 
  salads, 
  handleAddToCart,
  onSaladClick,
  onViewDetails
}: SaladGridProps) {
  // Use a staggered animation for the grid
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {salads.map((salad, index) => (
          <SaladCard 
            key={salad.id} 
            salad={salad} 
            delay={index}
            onAddToCart={() => handleAddToCart(salad)}
            onView={() => onViewDetails && onViewDetails(salad)}
            onClick={() => onSaladClick && onSaladClick(salad)}
          />
        ))}
      </AnimatePresence>
      
      {/* Empty state */}
      {salads.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full p-16 text-center bg-gray-50 rounded-2xl dark:bg-gray-800"
        >
          <div className="mb-4 text-6xl">🥗</div>
          <h3 className="mb-2 text-xl font-medium text-gray-700 dark:text-gray-200">No salads available</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back later for our delicious options!
          </p>
        </motion.div>
      )}
    </div>
  );
}
