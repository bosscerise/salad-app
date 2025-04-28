import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import hama from '../../assets/images/hama.jpg';

const RewardsPage: React.FC = () => {
  const [prankMode, setPrankMode] = useState(false);
  const { isDarkMode } = useTheme();

  const togglePrank = () => {
    setPrankMode(!prankMode);
  };

  return (
    <div className={`min-h-screen py-12 px-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-emerald-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto">
        {/* Header and toggle */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold">
            {prankMode ? "lyooomaa fifa hada 🦈 yakhsseerrrr" : "Rewards Program ✨"}
          </h1>
          
          <div className="inline-flex items-center">
            <span className="mr-3 text-sm">Normal</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={prankMode} 
                onChange={togglePrank} 
                className="sr-only peer"
              />
              <div className={`w-11 h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:${prankMode ? 'bg-pink-600' : 'bg-emerald-600'}`}></div>
            </label>
            <span className="ml-3 text-sm">Prank</span>
          </div>
        </div>
        
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`p-6 rounded-xl shadow-lg ${
            isDarkMode 
              ? 'bg-gray-800' 
              : prankMode 
                ? 'bg-pink-50' 
                : 'bg-white'
          }`}
        >
          {prankMode ? (
            <PrankContent isDarkMode={isDarkMode} />
          ) : (
            <NormalContent isDarkMode={isDarkMode} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Normal content with image
const NormalContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <div>
    <div className="mb-6 text-center">
      <h2 className="mb-2 text-2xl font-bold">Earn Points With Every Order</h2>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Collect rewards and get special perks!</p>
    </div>
    
    <div className="mb-6">
      <img 
        src="https://images.unsplash.com/photo-1589758438368-0ad531db3366?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80" 
        alt="Rewards Program" 
        className="w-full h-auto rounded-lg shadow-md"
      />
      <p className={`mt-3 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Our tiered rewards program offers amazing benefits
      </p>
    </div>
    
    <button className="w-full py-3 font-medium text-white rounded-lg bg-emerald-600">
      Sign Up For Rewards
    </button>
  </div>
);

// Prank content with shark image
const PrankContent = ({ isDarkMode }: { isDarkMode: boolean }) => {
  // Moving button effect
  const [buttonStyle, setButtonStyle] = useState({});
  
  const moveButton = () => {
    setButtonStyle({
      position: 'relative',
      left: `${Math.floor(Math.random() * 200) - 100}px`,
      top: `${Math.floor(Math.random() * 60) - 30}px`,
    });
  };
  
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl font-bold">
          "Rewards" Program <span className="text-pink-500">*wink*</span>
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>liverpool 6 - 8 atletic bilbao</p>
      </div>
      
      <div className="mb-6">
        <img 
          src={hama} 
          alt="Shark Attack Rewards" 
          className="w-full h-auto rounded-lg shadow-md"
        />
        <p className={`mt-3 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Our rewards program has real bite! Literally...
        </p>
      </div>
      
      <button 
        className="w-full py-3 font-medium text-white transition-all duration-300 bg-pink-500 rounded-lg"
        style={buttonStyle}
        onMouseEnter={moveButton}
      >
        Sign Up (Button Runs Away)
      </button>
      
      <p className={`mt-4 text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        * All rewards may involve sharks. Swim at your own risk.
      </p>
    </div>
  );
};

export default RewardsPage;