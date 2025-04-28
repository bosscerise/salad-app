import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Category, IngredientCategory } from '../types';

interface MobileMenuProps {
  mobileMenuOpen: boolean;
  activeTab: 'premade' | 'custom';
  setActiveTab: (tab: 'premade' | 'custom') => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedIngredientCategory: string;
  setSelectedIngredientCategory: (category: string) => void;
  menuCategories: Category[];
  ingredientCategories: IngredientCategory[];
  getIngredientCounts: (category: string) => number;
  setMobileMenuOpen: (open: boolean) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  mobileMenuOpen,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  selectedIngredientCategory,
  setSelectedIngredientCategory,
  menuCategories,
  ingredientCategories,
  getIngredientCounts,
  setMobileMenuOpen
}) => {
  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white/95 backdrop-blur-lg shadow-lg overflow-hidden z-40"
        >
          <div className="px-4 py-4">
            <div className="flex mb-4 border-b border-gray-200 pb-2">
              <button
                onClick={() => {
                  setActiveTab('premade')
                  setMobileMenuOpen(false)
                }}
                className={`flex-1 py-2 px-3 rounded-lg ${
                  activeTab === 'premade'
                    ? 'bg-teal-500 text-white font-medium'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Signature Bowls
              </button>
              <button
                onClick={() => {
                  setActiveTab('custom')
                  setMobileMenuOpen(false)
                }}
                className={`flex-1 py-2 px-3 rounded-lg ml-2 ${
                  activeTab === 'custom'
                    ? 'bg-teal-500 text-white font-medium'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Build Your Own
              </button>
            </div>

            {activeTab === 'premade' && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 mb-2">Categories</h3>
                {menuCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                        : 'bg-white hover:bg-teal-50 text-gray-700 hover:text-teal-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                ))}
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 mb-2">Ingredient Categories</h3>
                {ingredientCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => {
                      setSelectedIngredientCategory(category.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg ${
                      selectedIngredientCategory === category.id
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                        : 'bg-white hover:bg-teal-50 text-gray-700 hover:text-teal-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-white/20 text-xs py-1 px-2 rounded-full mr-2">
                        {getIngredientCounts(category.id)}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
