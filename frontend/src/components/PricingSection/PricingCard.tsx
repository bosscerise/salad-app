import { useState } from 'react';

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
}

interface PricingCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
  isDarkMode: boolean;
}

export default function PricingCard({ plan, isAnnual, isDarkMode }: PricingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const currentPrice = isAnnual 
    ? plan.annualPrice || Math.round(plan.price * 0.8) 
    : plan.price;
    
  const originalPrice = isAnnual ? plan.price : null;
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-6 md:p-8 rounded-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white shadow-lg'
      } ${
        plan.popular 
          ? isDarkMode 
            ? 'border-red-600 relative z-10 transform md:scale-105' 
            : 'border-green-500 relative z-10 transform md:scale-105' 
          : isHovered 
            ? 'transform scale-[1.02] md:scale-[1.01] z-10' 
            : ''
      } relative`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className={`absolute -top-4 right-0 left-0 mx-auto w-fit px-4 py-1 text-sm font-medium rounded-full shadow-lg ${
          isDarkMode 
            ? 'bg-red-600 text-white' 
            : 'bg-green-600 text-white'
        }`}>
          Most Popular
        </div>
      )}
      
      {/* Special badge (if not popular) */}
      {plan.badge && !plan.popular && (
        <div className={`absolute -top-3 -right-3 px-3 py-1 text-xs font-medium rounded-full shadow ${
          isDarkMode 
            ? 'bg-gray-700 text-gray-200' 
            : 'bg-green-100 text-green-700'
        }`}>
          {plan.badge}
        </div>
      )}

      {/* Plan name */}
      <h3 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        {plan.name}
      </h3>
      
      {/* Plan description */}
      <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {plan.description}
      </p>
      
      {/* Highlight feature */}
      {plan.highlight && (
        <div className={`mt-4 p-2 rounded-lg text-sm ${
          isDarkMode 
            ? 'bg-gray-700/50 text-white' 
            : 'bg-green-50 text-green-700'
        } flex items-center gap-2`}>
          <svg className={`w-4 h-4 flex-shrink-0 ${
            isDarkMode ? 'text-red-400' : 'text-green-500'
          }`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{plan.highlight}</span>
        </div>
      )}
      
      {/* Price */}
      <div className="mt-6 flex flex-col">
        <div className="flex items-baseline gap-2">
          {originalPrice && (
            <span className={`text-lg line-through ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              ${originalPrice}
            </span>
          )}
          <span className={`text-4xl md:text-5xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            ${currentPrice}
          </span>
          <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            /{plan.period}
          </span>
        </div>
        {isAnnual && <span className={`mt-1 text-xs ${isDarkMode ? 'text-red-400' : 'text-green-600'}`}>
          Save ${plan.price - (plan.annualPrice || Math.round(plan.price * 0.8))} per month
        </span>}
      </div>
      
      {/* Features list */}
      <ul className="mt-8 space-y-4">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <svg 
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                feature.included 
                  ? isDarkMode ? 'text-red-500' : 'text-green-500' 
                  : isDarkMode ? 'text-gray-600' : 'text-gray-300'
              }`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              {feature.included ? (
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
              )}
            </svg>
            <span className={`text-sm ${
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
      <a
        href="#signup"
        className={`mt-8 block text-center py-3 px-4 rounded-lg font-medium transition-all ${
          plan.popular 
            ? isDarkMode 
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20' 
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-900/20'
            : isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600' 
              : 'border border-green-600 text-green-700 hover:bg-green-50'
        } ${isHovered && !plan.popular ? 'transform scale-[1.02]' : ''}`}
      >
        {plan.callToAction || `Get Started with ${plan.name}`}
      </a>
      
      {/* No credit card note for free tier */}
      {plan.price === 0 && (
        <p className={`mt-4 text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No credit card required
        </p>
      )}
      
      {/* Refund policy note for paid tiers */}
      {plan.price > 0 && (
        <p className={`mt-4 text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          14-day money back guarantee
        </p>
      )}
    </div>
  );
}
