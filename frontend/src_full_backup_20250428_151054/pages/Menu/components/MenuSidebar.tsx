// import React from 'react';
// import { motion } from 'framer-motion';
// import { RefreshCw, Trash2, Plus } from 'lucide-react';
// import { Category, IngredientCategory, SavedSalad, RecommendationType, SuggestedCombination } from '../types';

// interface MenuSidebarProps {
//   activeTab: 'premade' | 'custom';
//   selectedCategory: string;
//   setSelectedCategory: (category: string) => void;
//   selectedIngredientCategory: string;
//   setSelectedIngredientCategory: (category: string) => void;
//   menuCategories: Category[];
//   ingredientCategories: IngredientCategory[];
//   getIngredientCounts: (category: string) => number;
//   savedCustomSalads: SavedSalad[];
//   loadSavedSalad: (salad: SavedSalad) => void;
//   deleteSavedSalad: (id: string) => void;
//   showSuggestions: boolean;
//   setShowSuggestions: (show: boolean) => void;
//   recommendationType: RecommendationType;
//   setRecommendationType: (type: RecommendationType) => void;
//   suggestedCombinations: SuggestedCombination[];
//   applySuggestedCombination: (id: string) => void;
//   selectedCombination: string | null;
//   // getRecommendedIngredients: () => any[];
//   handleAddIngredient: (id: string) => void;
// }

// const MenuSidebar: React.FC<MenuSidebarProps> = ({
//   activeTab,
//   selectedCategory,
//   setSelectedCategory,
//   selectedIngredientCategory,
//   setSelectedIngredientCategory,
//   menuCategories,
//   ingredientCategories,
//   getIngredientCounts,
//   savedCustomSalads,
//   loadSavedSalad,
//   deleteSavedSalad,
//   showSuggestions,
//   setShowSuggestions,
//   recommendationType,
//   setRecommendationType,
//   suggestedCombinations,
//   applySuggestedCombination,
//   selectedCombination,
//   // getRecommendedIngredients,
//   handleAddIngredient
// }) => {
//   return (
//     <div className="hidden md:block md:w-64 lg:w-72 shrink-0">
//       <div className="sticky p-4 bg-white shadow-lg rounded-xl top-24">
//         {activeTab === 'premade' && (
//           <div className="space-y-2">
//             <h3 className="mb-3 font-medium text-gray-700">Categories</h3>
//             {menuCategories.map((category) => (
//               <motion.button
//                 key={category.id}
//                 onClick={() => setSelectedCategory(category.id)}
//                 whileHover={{ x: 3 }}
//                 whileTap={{ scale: 0.98 }}
//                 className={`flex items-center w-full px-3 py-2 rounded-lg ${
//                   selectedCategory === category.id
//                     ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
//                     : 'hover:bg-teal-50 text-gray-700 hover:text-teal-700'
//                 }`}
//               >
//                 <span className="mr-3 text-xl">{category.icon}</span>
//                 <span className="font-medium">{category.name}</span>
//               </motion.button>
//             ))}
//           </div>
//         )}
        
//         {activeTab === 'custom' && (
//           <div className="space-y-2">
//             <h3 className="mb-3 font-medium text-gray-700">Ingredient Categories</h3>
//             {ingredientCategories.map((category) => (
//               <motion.button
//                 key={category.id}
//                 onClick={() => setSelectedIngredientCategory(category.id)}
//                 whileHover={{ x: 3 }}
//                 whileTap={{ scale: 0.98 }}
//                 className={`flex items-center justify-between w-full px-3 py-2 rounded-lg ${
//                   selectedIngredientCategory === category.id
//                     ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
//                     : 'hover:bg-teal-50 text-gray-700 hover:text-teal-700'
//                 }`}
//               >
//                 <div className="flex items-center">
//                   <span className="mr-3 text-xl">{category.icon}</span>
//                   <span className="font-medium">{category.name}</span>
//                 </div>
//                 {getIngredientCounts(category.id) > 0 && (
//                   <span className={`text-xs py-1 px-2 rounded-full ${
//                     selectedIngredientCategory === category.id
//                       ? 'bg-white/20 text-white'
//                       : 'bg-teal-100 text-teal-800'
//                   }`}>
//                     {getIngredientCounts(category.id)}
//                   </span>
//                 )}
//               </motion.button>
//             ))}
            
//             {/* Saved Salads Section */}
//             {savedCustomSalads.length > 0 && (
//               <div className="pt-4 mt-6 border-t border-gray-200">
//                 <h3 className="mb-3 font-medium text-gray-700">My Saved Salads</h3>
//                 <div className="space-y-2">
//                   {savedCustomSalads.map((salad) => (
//                     <div 
//                       key={salad.id} 
//                       className="relative p-3 rounded-lg bg-teal-50 group"
//                     >
//                       <div className="pr-6 mb-1 font-medium text-teal-800 truncate">
//                         {salad.name}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {Object.keys(salad.ingredients).length} ingredients
//                       </div>
//                       <div className="absolute flex space-x-1 transition-opacity opacity-0 right-2 top-2 group-hover:opacity-100">
//                         <button 
//                           onClick={() => loadSavedSalad(salad)}
//                           className="p-1 text-teal-600 hover:text-teal-800"
//                         >
//                           <RefreshCw className="w-4 h-4" />
//                         </button>
//                         <button 
//                           onClick={() => deleteSavedSalad(salad.id)}
//                           className="p-1 text-red-500 hover:text-red-700"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
            
//             {/* Suggestions Section */}
//             <div className="pt-4 mt-6 border-t border-gray-200">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-medium text-gray-700">Recommendations</h3>
//                 <button
//                   onClick={() => setShowSuggestions(!showSuggestions)}
//                   className="text-xs text-teal-600 hover:text-teal-800"
//                 >
//                   {showSuggestions ? 'Hide' : 'Show'}
//                 </button>
//               </div>
              
//               {showSuggestions && (
//                 <div className="mt-3 space-y-3">
//                   <div className="flex space-x-2">
//                     <button
//                       onClick={() => setRecommendationType('balanced')}
//                       className={`text-xs px-2 py-1 rounded-full ${
//                         recommendationType === 'balanced'
//                           ? 'bg-teal-500 text-white'
//                           : 'bg-teal-100 text-teal-800'
//                       }`}
//                     >
//                       Balanced
//                     </button>
//                     <button
//                       onClick={() => setRecommendationType('protein')}
//                       className={`text-xs px-2 py-1 rounded-full ${
//                         recommendationType === 'protein'
//                           ? 'bg-teal-500 text-white'
//                           : 'bg-teal-100 text-teal-800'
//                       }`}
//                     >
//                       High Protein
//                     </button>
//                     <button
//                       onClick={() => setRecommendationType('low-cal')}
//                       className={`text-xs px-2 py-1 rounded-full ${
//                         recommendationType === 'low-cal'
//                           ? 'bg-teal-500 text-white'
//                           : 'bg-teal-100 text-teal-800'
//                       }`}
//                     >
//                       Low Calorie
//                     </button>
//                   </div>
                  
//                   <div className="grid grid-cols-1 gap-2">
//                     {getRecommendedIngredients().map(ingredient => (
//                       <div 
//                         key={ingredient.id}
//                         className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm"
//                       >
//                         <span className="text-sm">{ingredient.name}</span>
//                         <button
//                           onClick={() => handleAddIngredient(ingredient.id)}
//                           className="p-1 text-teal-700 bg-teal-100 rounded-full hover:bg-teal-200"
//                         >
//                           <Plus className="w-3 h-3" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
                  
//                   <div className="mt-3">
//                     <h4 className="mb-2 text-sm font-medium text-gray-700">Suggested Combinations</h4>
//                     <div className="space-y-2">
//                       {suggestedCombinations.map(combo => (
//                         <button
//                           key={combo.id}
//                           onClick={() => applySuggestedCombination(combo.id)}
//                           className={`block w-full text-left px-3 py-2 rounded-lg ${
//                             selectedCombination === combo.id
//                               ? 'bg-teal-500 text-white'
//                               : 'bg-teal-50 hover:bg-teal-100 text-gray-700'
//                           }`}
//                         >
//                           <div className="font-medium">{combo.name}</div>
//                           <div className="mt-1 text-xs truncate">
//                             {combo.base.length + combo.protein.length + combo.toppings.length + 
//                               combo.dressing.length + combo.extras.length} ingredients
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MenuSidebar;
