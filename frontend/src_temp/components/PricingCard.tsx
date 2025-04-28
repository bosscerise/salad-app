import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X, ArrowRight, Salad } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: number;
  annualPrice?: number;
  period: string;
  description: string;
  features: Array<{text: string, included: boolean}>;
  popular?: boolean;
  callToAction?: string;
  badge?: string;
  highlight?: string;
  icon?: 'basic' | 'premium' | 'family';
}

interface PricingCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
  isDarkMode: boolean;
  isActive: boolean;
  onClick: () => void;
  isInView?: boolean;
}

export default function PricingCard({ 
  plan, 
  isAnnual, 
  isDarkMode, 
  isActive, 
  onClick,
  isInView = true
}: PricingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const currentPrice = isAnnual 
    ? plan.annualPrice || Math.round(plan.price * 0.8) 
    : plan.price;
    
  const originalPrice = isAnnual ? plan.price : null;
  
  // Meal illustrations by plan tier
  const planIllustration = () => {
    switch(plan.icon) {
      case 'basic':
        return (
          <div className="relative w-16 h-16 mx-auto mb-2">
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🥗</span>
            <svg className={`absolute inset-0 ${isDarkMode ? 'text-red-900/30' : 'text-green-100'} animate-spin-slow`} viewBox="0 0 100 100">
              <path d="M50 10 A40 40 0 0 1 90 50 A40 40 0 0 1 50 90 A40 40 0 0 1 10 50 A40 40 0 0 1 50 10 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="3,8" />
            </svg>
          </div>
        );
      case 'premium':
        return (
          <div className="relative w-16 h-16 mx-auto mb-2">
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🥑</span>
            <span className="absolute inset-0 flex items-center justify-center mt-6 ml-8 text-xl">🥕</span>
            <svg className={`absolute inset-0 ${isDarkMode ? 'text-red-900/40' : 'text-green-200'} animate-spin-slow`} viewBox="0 0 100 100">
              <path d="M50 5 A45 45 0 0 1 95 50 A45 45 0 0 1 50 95 A45 45 0 0 1 5 50 A45 45 0 0 1 50 5 Z" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="1,6" />
            </svg>
          </div>
        );
      case 'family':
        return (
          <div className="relative w-16 h-16 mx-auto mb-2">
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🥙</span>
            <span className="absolute inset-0 flex items-center justify-center ml-6 text-xl mt-7">🍲</span>
            <span className="absolute inset-0 flex items-center justify-center mr-6 text-xl mt-7">🥗</span>
            <svg className={`absolute inset-0 ${isDarkMode ? 'text-red-900/50' : 'text-green-300'} animate-pulse-slow`} viewBox="0 0 100 100">
              <path d="M50 0 A50 50 0 0 1 100 50 A50 50 0 0 1 50 100 A50 50 0 0 1 0 50 A50 50 0 0 1 50 0 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="0.5,12" />
            </svg>
          </div>
        );
      default:
        return <Salad className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-red-400' : 'text-green-500'}`} />;
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isInView ? 1 : 0.4, 
        y: 0,
        scale: isActive ? 1 : 0.97
      }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-6 rounded-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/90 backdrop-blur border border-gray-700' 
          : 'bg-white backdrop-blur shadow-xl'
      } ${
        isActive
          ? isDarkMode 
            ? 'ring-2 ring-red-500 transform scale-[1.02]' 
            : 'ring-2 ring-green-500 transform scale-[1.02]'
          : isHovered 
            ? 'transform scale-[1.01] cursor-pointer' 
            : ''
      } relative`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className={`absolute -top-3 right-0 left-0 mx-auto w-fit px-4 py-1 text-sm font-medium rounded-full ${
          isDarkMode 
            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white' 
            : 'bg-gradient-to-r from-green-600 to-green-500 text-white'
        } shadow-lg`}>
          Most Popular
        </div>
      )}
      
      {/* Plan illustration */}
      {planIllustration()}
      
      {/* Plan name */}
      <h3 className={`text-xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        {plan.name}
      </h3>
      
      {/* Plan description */}
      <p className={`mt-2 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {plan.description}
      </p>
      
      {/* Price section */}
      <div className={`mt-4 py-3 px-4 rounded-lg text-center ${
        isDarkMode ? 'bg-gray-900/60' : 'bg-green-50'
      }`}>
        <div className="flex items-baseline justify-center gap-1">
          {originalPrice && (
            <span className={`text-sm line-through ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              ${originalPrice}
            </span>
          )}
          <span className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            ${currentPrice}
          </span>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            /{plan.period}
          </span>
        </div>
        {isAnnual && plan.price > 0 && (
          <span className={`mt-1 block text-xs ${isDarkMode ? 'text-red-400' : 'text-green-600'}`}>
            Save ${plan.price - (plan.annualPrice || Math.round(plan.price * 0.8))} per month
          </span>
        )}
      </div>
      
      {/* Highlight feature */}
      {plan.highlight && (
        <div className={`mt-4 p-2 rounded-lg text-xs ${
          isDarkMode 
            ? 'bg-gray-700/50 text-white' 
            : 'bg-green-50 text-green-700'
        } flex items-center gap-2`}>
          <CheckCircle className={`w-4 h-4 flex-shrink-0 ${
            isDarkMode ? 'text-red-400' : 'text-green-500'
          }`} />
          <span>{plan.highlight}</span>
        </div>
      )}
      
      {/* Top features - only show 3 on mobile to save space */}
      <ul className="mt-4 space-y-2">
        {plan.features.slice(0, 3).map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            {feature.included ? (
              <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                isDarkMode ? 'text-red-500' : 'text-green-500'
              }`} />
            ) : (
              <X className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-300'
              }`} />
            )}
            <span className={`text-xs ${
              feature.included 
                ? isDarkMode ? 'text-gray-200' : 'text-gray-700'
                : isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      
      {/* CTA button */}
      <button
        className={`mt-5 w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${
          plan.popular 
            ? isDarkMode 
              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600' 
              : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600'
            : isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600' 
              : 'border border-green-600 text-green-700 hover:bg-green-50'
        } ${(isActive || isHovered) ? 'shadow-lg' : ''}`}
      >
        <span>{plan.callToAction || `Choose ${plan.name}`}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
      
      {/* No credit card note for free tier */}
      {plan.price === 0 && (
        <p className={`mt-2 text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No credit card required
        </p>
      )}
    </motion.div>
  );
}
