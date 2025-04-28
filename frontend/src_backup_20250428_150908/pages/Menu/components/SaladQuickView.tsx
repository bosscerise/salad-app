// import { motion } from 'framer-motion';
// import { X, ShoppingCart, ArrowRight, PlusCircle, Plus, Minus } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { Salad, SaladIngredient } from '../types';
// import { useIngredients } from '../../../hooks/useIngredients';

// interface SaladQuickViewProps {
//   salad: Salad;
//   onClose: () => void;
//   onViewDetails: () => void;
//   onAddToCart: (salad: Salad, customIngredients?: SaladIngredient[]) => void;
// }

// export default function SaladQuickView({ 
//   salad, 
//   onClose, 
//   onViewDetails, 
//   onAddToCart
// }: SaladQuickViewProps) {
//   const [customIngredients, setCustomIngredients] = useState<SaladIngredient[]>([]);
//   const [isCustomizing, setIsCustomizing] = useState(false);
//   const { ingredients: allIngredients } = useIngredients();

//   // Initialize with the salad's original ingredients
//   useEffect(() => {
//     if (salad.ingredients) {
//       setCustomIngredients(
//         Array.isArray(salad.ingredients) 
//           ? [...salad.ingredients] 
//           : []
//       );
//     }
//   }, [salad]);

//   const handleQuantityChange = (ingredientId: string, change: number) => {
//     setCustomIngredients(prev => {
//       const existing = prev.find(item => item.id === ingredientId);
      
//       if (existing) {
//         // Update existing ingredient quantity, remove if zero
//         const newQuantity = Math.max(0, existing.quantity + change);
        
//         if (newQuantity === 0) {
//           return prev.filter(item => item.id !== ingredientId);
//         }
        
//         return prev.map(item => 
//           item.id === ingredientId ? { ...item, quantity: newQuantity } : item
//         );
//       } else if (change > 0) {
//         // Add new ingredient
//         return [...prev, { id: ingredientId, quantity: change }];
//       }
      
//       return prev;
//     });
//   };

//   // Get total price with customizations
//   const calculateCustomPrice = () => {
//     let basePrice = salad.price;
    
//     // Find original ingredients to calculate price difference
//     const originalQuantities = salad.ingredients.reduce((acc, ing) => {
//       acc[ing.id] = ing.quantity;
//       return acc;
//     }, {} as Record<string, number>);
    
//     // Calculate price adjustments for ingredient changes
//     customIngredients.forEach(ing => {
//       const ingredient = allIngredients.find(i => i.id === ing.id);
//       if (ingredient) {
//         const originalQty = originalQuantities[ing.id] || 0;
//         const qtyDiff = ing.quantity - originalQty;
        
//         // Only charge for added ingredients
//         if (qtyDiff > 0) {
//           basePrice += qtyDiff * ingredient.price;
//         }
//       }
//     });
    
//     return basePrice;
//   };

//   // Prevent clicks inside the modal from closing it
//   const handleContentClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//   };

//   const handleAddToCart = () => {
//     // Only consider it customized if we're in customization mode 
//     // AND there are actual differences from original ingredients
//     if (isCustomizing && areIngredientsCustomized(salad.ingredients, customIngredients)) {
//       onAddToCart(salad, customIngredients);
//     } else {
//       // Regular add to cart without customizations
//       onAddToCart(salad);
//     }
//     onClose();
//   };

//   const areIngredientsCustomized = (original: SaladIngredient[], custom: SaladIngredient[]): boolean => {
//     if (original.length !== custom.length) return true;
//     const originalMap = original.reduce((acc, ing) => {
//       acc[ing.id] = ing.quantity;
//       return acc;
//     }, {} as Record<string, number>);
//     return custom.some(ing => originalMap[ing.id] !== ing.quantity);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-2 overflow-y-auto sm:p-4 bg-black/60 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.9, opacity: 0 }}
//         transition={{ type: "spring", bounce: 0.3 }}
//         className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] my-4 sm:my-8"
//         onClick={handleContentClick}
//       >
//         <button
//           className="absolute z-10 p-2 text-white transition-colors rounded-full sm:p-3 bg-black/40 hover:bg-black/60 top-2 right-2 sm:top-4 sm:right-4"
//           onClick={onClose}
//           aria-label="Close"
//         >
//           <X size={18} className="sm:hidden" />
//           <X size={20} className="hidden sm:block" />
//         </button>
        
//         <div className="flex flex-col md:flex-row md:max-h-[80vh]">
//           {/* Image Section - Responsive height */}
//           <div className="relative md:w-1/2 lg:w-3/5">
//             <div className="h-48 xs:h-56 sm:h-72 md:h-full">
//               <img
//                 src={salad.image}
//                 alt={salad.name}
//                 className="object-cover w-full h-full"
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              
//               {/* Overlaid Content - Improved responsiveness */}
//               <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1 xs:p-4 sm:p-6 sm:space-y-2">
//                 <h2 className="mb-1 text-xl font-bold text-white xs:text-2xl sm:text-3xl sm:mb-4 line-clamp-2">{salad.name}</h2>
                
//                 <div className="flex flex-wrap gap-1.5 xs:gap-2 sm:gap-4">
//                   <div className="text-center backdrop-blur-sm bg-white/10 px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl flex-1">
//                     <p className="text-[10px] xs:text-xs sm:text-sm text-white/80">Calories</p>
//                     <p className="text-sm font-bold text-white xs:text-base sm:text-xl">{salad.calories}</p>
//                   </div>
//                   <div className="text-center backdrop-blur-sm bg-white/10 px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl flex-1">
//                     <p className="text-[10px] xs:text-xs sm:text-sm text-white/80">Protein</p>
//                     <p className="text-sm font-bold text-white xs:text-base sm:text-xl">{salad.nutritionFacts.protein}g</p>
//                   </div>
//                   <div className="text-center backdrop-blur-sm bg-white/10 px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl flex-1">
//                     <p className="text-[10px] xs:text-xs sm:text-sm text-white/80">Carbs</p>
//                     <p className="text-sm font-bold text-white xs:text-base sm:text-xl">{salad.nutritionFacts.carbs}g</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Content Section - Better scrolling behavior */}
//           <div className="p-4 xs:p-5 sm:p-8 md:w-1/2 lg:w-2/5 md:h-[60vh] lg:h-[70vh] md:overflow-y-auto">
//             <div className="space-y-3 sm:space-y-6">
//               <div>
//                 <h3 className="text-[10px] xs:text-xs sm:text-sm font-medium text-emerald-600 uppercase tracking-wider">The Experience</h3>
//                 <p className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm md:text-base">
//                   {salad.description}
//                 </p>
//               </div>
              
//               <div className="hidden xs:block">
//                 <h3 className="text-[10px] xs:text-xs sm:text-sm font-medium text-emerald-600 uppercase tracking-wider">What Makes It Special</h3>
//                 <ul className="mt-1 space-y-1 sm:mt-2 sm:space-y-2">
//                   <li className="flex items-start">
//                     <PlusCircle size={14} className="text-emerald-500 mt-0.5 mr-1.5 sm:mr-2 flex-shrink-0 hidden xs:block" />
//                     <span className="text-xs text-gray-600 sm:text-sm md:text-base">Fresh, locally-sourced ingredients</span>
//                   </li>
//                   <li className="flex items-start">
//                     <PlusCircle size={14} className="text-emerald-500 mt-0.5 mr-1.5 sm:mr-2 flex-shrink-0 hidden xs:block" />
//                     <span className="text-xs text-gray-600 sm:text-sm md:text-base">Perfect balance of flavors and textures</span>
//                   </li>
//                   <li className="flex items-start hidden sm:flex">
//                     <PlusCircle size={14} className="text-emerald-500 mt-0.5 mr-1.5 sm:mr-2 flex-shrink-0" />
//                     <span className="text-xs text-gray-600 sm:text-sm md:text-base">Chef-crafted recipe, refined for your enjoyment</span>
//                   </li>
//                 </ul>
//               </div>
              
//               <div>
//                 <h3 className="text-[10px] xs:text-xs sm:text-sm font-medium text-emerald-600 uppercase tracking-wider">Featured Ingredients</h3>
//                 <div className="flex flex-wrap gap-1 mt-1 sm:mt-2 sm:gap-2">
//                   {salad.ingredients.slice(0, 3).map((ingredient, index) => (
//                     <span key={index} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 rounded-full text-gray-800 text-[10px] xs:text-xs sm:text-sm">
//                       {ingredient.name}
//                     </span>
//                   ))}
//                   {salad.ingredients.length > 3 && (
//                     <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 rounded-full text-gray-500 text-[10px] xs:text-xs sm:text-sm">
//                       +{salad.ingredients.length - 3} more
//                     </span>
//                   )}
//                 </div>
//               </div>
              
//               <div className="pt-3 mt-3 border-t border-gray-200 sm:pt-4 sm:mt-4">
//                 <div className="flex items-center justify-between mb-3 sm:mb-4">
//                   <div className="text-xl font-bold xs:text-2xl sm:text-3xl text-emerald-600">${salad.price}</div>
//                 </div>
                
//                 <div className="flex gap-2 sm:gap-3">
//                   <motion.button
//                     whileHover={{ scale: 1.03 }}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={handleAddToCart}
//                     className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-xs text-white transition-colors rounded-lg sm:gap-2 bg-emerald-600 sm:py-3 sm:px-6 sm:rounded-xl hover:bg-emerald-700 xs:text-sm sm:text-base"
//                   >
//                     <ShoppingCart size={16} className="sm:hidden" />
//                     <ShoppingCart size={18} className="hidden sm:block" />
//                     <span>Add to Cart {isCustomizing && `• $${calculateCustomPrice().toFixed(2)}`}</span>
//                   </motion.button>
                  
//                   <motion.button
//                     whileHover={{ scale: 1.03 }}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={onViewDetails}
//                     className="flex items-center justify-center rounded-lg sm:rounded-xl border border-emerald-600 text-emerald-600 px-2.5 sm:px-4 hover:bg-emerald-50 transition-colors"
//                   >
//                     <ArrowRight size={16} className="sm:hidden" />
//                     <ArrowRight size={18} className="hidden sm:block" />
//                   </motion.button>
//                 </div>
//               </div>

//               {/* Customization Toggle */}
//               <div className="mt-4">
//                 <button
//                   onClick={() => setIsCustomizing(!isCustomizing)}
//                   className="text-sm text-emerald-600 hover:underline"
//                 >
//                   {isCustomizing ? "Cancel Customization" : "Customize Ingredients"}
//                 </button>
//               </div>

//               {/* Customization Panel */}
//               {isCustomizing && (
//                 <div className="p-4 mt-4 border border-gray-200 rounded-lg bg-gray-50">
//                   <h3 className="mb-3 font-medium">Adjust Ingredients</h3>
                  
//                   <div className="pr-1 space-y-3 overflow-y-auto max-h-60">
//                     {customIngredients.map(ing => {
//                       const ingredientDetails = allIngredients.find(i => i.id === ing.id);
//                       return (
//                         <div key={ing.id} className="flex items-center justify-between">
//                           <div className="flex items-center">
//                             <span className="mr-2 text-lg">{ingredientDetails?.emoji || '🥗'}</span>
//                             <span>{ingredientDetails?.name || ing.id}</span>
//                           </div>
//                           <div className="flex items-center">
//                             <button
//                               onClick={() => handleQuantityChange(ing.id, -1)}
//                               className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
//                             >
//                               <Minus size={14} />
//                             </button>
//                             <span className="w-8 text-center">{ing.quantity}</span>
//                             <button
//                               onClick={() => handleQuantityChange(ing.id, 1)}
//                               className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
//                             >
//                               <Plus size={14} />
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
                  
//                   {/* Add more ingredients section */}
//                   <div className="pt-4 mt-4 border-t border-gray-200">
//                     <h4 className="mb-2 text-sm font-medium">Add More Ingredients</h4>
//                     <div className="grid grid-cols-2 gap-2">
//                       {allIngredients
//                         .filter(ing => !customIngredients.some(i => i.id === ing.id))
//                         .map(ingredient => (
//                           <button
//                             key={ingredient.id}
//                             onClick={() => handleQuantityChange(ingredient.id, 1)}
//                             className="flex items-center p-2 text-left border rounded-md hover:bg-emerald-50"
//                           >
//                             <span className="mr-2">{ingredient.emoji || '🥗'}</span>
//                             <span className="text-sm">{ingredient.name}</span>
//                           </button>
//                         ))}
//                     </div>
//                   </div>
                  
//                   {/* Updated price */}
//                   <div className="flex justify-between pt-4 mt-4 font-medium border-t border-gray-200">
//                     <span>Updated Price:</span>
//                     <span>${calculateCustomPrice().toFixed(2)}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }
