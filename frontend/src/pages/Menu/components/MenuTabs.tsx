import React from 'react';

interface MenuTabsProps {
  activeTab: 'premade' | 'custom';
  setActiveTab: (tab: 'premade' | 'custom') => void;
}

const MenuTabs: React.FC<MenuTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center py-4">
          <div className="inline-flex rounded-lg bg-teal-100 p-1 shadow-md">
            <button
              onClick={() => setActiveTab('premade')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'premade'
                  ? 'bg-white text-teal-700 shadow'
                  : 'text-teal-600 hover:bg-white/30'
              }`}
            >
              Signature Bowls
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'custom'
                  ? 'bg-white text-teal-700 shadow'
                  : 'text-teal-600 hover:bg-white/30'
              }`}
            >
              Build Your Own
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuTabs;
