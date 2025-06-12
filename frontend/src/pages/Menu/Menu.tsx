import { useState } from 'react';
import SaladGrid from './components/SaladGrid';
import SaladBuilder from './components/SaladBuilder';
import MenuSidebar from './components/MenuSidebar';
import MenuTabs from './components/MenuTabs';
import { menuCategories } from '../../services/api';
import LoadingSpinner from './components/LoadingSpinner';
import { useMenuData, useSalads } from '../../hooks/useQueries';

function Menu() {
  const [activeTab, setActiveTab] = useState<'premade' | 'custom'>('premade');
  const [activeCategory, setActiveCategory] = useState<string>('featured');
  
  // Use TanStack Query to fetch data
  const { data: menuData, isLoading: isMenuDataLoading } = useMenuData();
  const { data: fetchedSalads = [], isLoading: isSaladsLoading } = useSalads();

  // Wait for data to load
  const isLoading = isMenuDataLoading || isSaladsLoading;

  // Filter salads by category
  const filteredSalads = fetchedSalads.filter(salad => 
    activeCategory === 'all' || salad.category === activeCategory
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile menu tabs at the top for small screens */}
      <div className="md:hidden mb-4">
        <MenuTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Sidebar with categories */}
      <div className="w-full md:w-64 bg-white shadow md:shadow-md p-4">
        <MenuSidebar 
          categories={menuCategories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 p-4">
        {/* Desktop menu tabs for larger screens */}
        <div className="hidden md:block mb-6">
          <MenuTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        {/* Show either premade salads or custom builder based on active tab */}
        <div className="mt-4">
          {activeTab === 'premade' ? (
            <SaladGrid salads={filteredSalads} />
          ) : (
            <SaladBuilder 
              ingredients={menuData?.ingredients || []} 
              categories={menuData?.categories || []} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Menu;