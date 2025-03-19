import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { pricingPlans } from '../../data/pricingPlans';
import PricingCard from './PricingCard';

export default function PricingSection() {
  const { isDarkMode } = useTheme();
  const [isAnnual, setIsAnnual] = useState(true);
  const [showFaq, setShowFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Can I change my plan later?",
      answer: "Absolutely! You can upgrade, downgrade, or cancel your subscription at any time through your account settings."
    },
    {
      question: "Is there a minimum commitment?",
      answer: "No long-term contracts here - our plans are month-to-month or annual with the flexibility to cancel anytime."
    },
    {
      question: "What if I'm not satisfied with my meals?",
      answer: "We offer a 100% satisfaction guarantee. If you're not happy with any meal, we'll credit your account or replace it on your next delivery."
    },
    {
      question: "Are there any hidden fees?",
      answer: "Never. The price you see is the price you pay - delivery is included and there are no surprise charges."
    }
  ];

  return (
    <section 
      id="pricing" 
      className={`py-20 px-6 relative overflow-hidden ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-green-50 to-green-100'
      }`}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
          isDarkMode ? 'bg-red-900/5' : 'bg-green-600/5'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
          isDarkMode ? 'bg-red-900/10' : 'bg-green-600/10'
        }`}></div>

        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(${isDarkMode ? '#ffffff22' : '#00000011'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>

        {/* Floating salad icons */}
        <div className="hidden md:block absolute top-20 left-10 text-4xl animate-float-slow">🥗</div>
        <div className="hidden md:block absolute bottom-20 right-10 text-3xl animate-float-slow animation-delay-2000">🥑</div>
        <div className="hidden md:block absolute top-40 right-20 text-2xl animate-float-slow animation-delay-1000">🥬</div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-green-100 text-green-700'
            }`}>
              Simple Pricing
            </span>
          </div>
          <h2 className={`mt-4 text-4xl md:text-5xl font-bold tracking-tight ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <span className={isDarkMode ? 'text-red-400' : 'text-green-600'}>Fuel</span> Your Healthy Lifestyle
          </h2>
          <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Fresh, delicious salads delivered right to your door. Choose the plan that fits your needs.
          </p>
          
          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm ${
              isAnnual 
                ? (isDarkMode ? 'text-gray-400' : 'text-gray-500') 
                : (isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium')
            }`}>
              Monthly
            </span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                isAnnual 
                  ? (isDarkMode ? 'bg-red-600' : 'bg-green-600') 
                  : (isDarkMode ? 'bg-gray-700' : 'bg-gray-300')
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm ${
              !isAnnual 
                ? (isDarkMode ? 'text-gray-400' : 'text-gray-500') 
                : (isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium')
            }`}>
              Annual <span className={`px-1.5 py-0.5 text-xs rounded ${
                isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-green-100 text-green-700'
              }`}>Save 20%</span>
            </span>
          </div>

          {/* Money back guarantee badge */}
          <div className={`mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            <svg className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              14-Day Money Back Guarantee
            </span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard 
              key={plan.name} 
              plan={plan} 
              isAnnual={isAnnual} 
              isDarkMode={isDarkMode} 
            />
          ))}
        </div>

        {/* Enterprise option */}
        <div className={`mt-12 p-6 rounded-xl ${
          isDarkMode 
            ? 'bg-gray-800/80 border border-gray-700' 
            : 'bg-white shadow-lg'
        } flex flex-col md:flex-row items-center justify-between gap-6`}>
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Need a custom plan for your office?
            </h3>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              We offer special corporate programs with volume discounts and flexible delivery options.
            </p>
          </div>
          <a 
            href="/contact" 
            className={`whitespace-nowrap px-6 py-3 rounded-lg font-medium ${
              isDarkMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            } transition-colors shadow-sm`}
          >
            Contact Sales
          </a>
        </div>

        {/* Customer stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { number: '10k+', label: 'Happy Customers' },
            { number: '97%', label: 'Satisfaction Rate' },
            { number: '22k+', label: 'Meals Delivered' },
            { number: '40+', label: 'Cities Served' }
          ].map((stat, idx) => (
            <div 
              key={idx}
              className={`text-center p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80 shadow-sm'
              }`}
            >
              <div className={`text-2xl md:text-3xl font-bold ${
                isDarkMode ? 'text-red-400' : 'text-green-600'
              }`}>
                {stat.number}
              </div>
              <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className={`text-2xl font-bold text-center mb-8 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className={`rounded-lg overflow-hidden ${
                  isDarkMode 
                    ? 'bg-gray-800/80 border border-gray-700' 
                    : 'bg-white shadow-sm'
                }`}
              >
                <button
                  onClick={() => setShowFaq(showFaq === idx ? null : idx)}
                  className={`w-full flex items-center justify-between p-4 text-left ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  } font-medium`}
                >
                  {faq.question}
                  <svg 
                    className={`w-5 h-5 transition-transform ${
                      showFaq === idx ? 'transform rotate-180' : ''
                    } ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showFaq === idx && (
                  <div className={`px-4 pb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Still have questions? We're here to help.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <a 
              href="/faq" 
              className={`px-5 py-2 rounded-lg text-sm font-medium ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-800 hover:bg-gray-50 shadow-sm'
              } transition-colors`}
            >
              Read Full FAQ
            </a>
            <a 
              href="/contact" 
              className={`px-5 py-2 rounded-lg text-sm font-medium ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-800 hover:bg-gray-50 shadow-sm'
              } transition-colors`}
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
