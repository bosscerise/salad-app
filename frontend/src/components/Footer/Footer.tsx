import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface FooterProps {
  navigation: { name: string; href: string }[];
}

export default function Footer({ navigation }: FooterProps) {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };
  
  // Simplified footer sections
  const footerSections = [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Our Story", href: "/story" },
        { name: "Careers", href: "/careers" }
      ]
    },
    {
      title: "Products",
      links: [
        { name: "Menu", href: "/menu" },
        { name: "Nutritional Info", href: "/nutrition" },
        { name: "Seasonal Specials", href: "/seasonal" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "FAQs", href: "/faqs" },
        { name: "Contact Us", href: "/contact" },
        { name: "Delivery Info", href: "/delivery" }
      ]
    }
  ];
  
  const socialLinks = [
    { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
    { name: "Twitter", href: "https://twitter.com", icon: "twitter" }
  ];
  
  return (
    <footer className={`border-t py-12 px-4 ${
      isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Main footer content - simplified grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 rounded-full ${
                isDarkMode ? 'bg-red-600' : 'bg-green-600'
              }`}>
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <span className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Fresh Box
              </span>
            </div>
            
            {/* Social links - simplified */}
            <div className="flex gap-2 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`p-2 rounded-full transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-green-600'
                  }`}
                  aria-label={social.name}
                >
                  {renderSocialIcon(social.icon)}
                </a>
              ))}
            </div>
          </div>
          
          {/* Navigation columns - simplified */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className={`text-sm font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'  
              }`}>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className={`text-sm hover:underline ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-red-400' 
                          : 'text-gray-600 hover:text-green-600'
                      }`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Newsletter - simplified */}
        <div className={`mt-8 pt-6 border-t ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className="max-w-md">
            <h3 className={`text-sm font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'  
            }`}>
              Join our newsletter
            </h3>
            {subscribed ? (
              <div className={`p-2 rounded-lg text-sm ${
                isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
              }`}>
                Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className={`p-2 rounded-lg flex-grow ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500' 
                      : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder:text-gray-500'
                  } focus:outline-none`}
                  required
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap font-medium ${
                    isDarkMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } transition-colors`}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* Bottom bar - simplified */}
        <div className={`mt-6 pt-4 border-t ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        } flex flex-col sm:flex-row justify-between items-center gap-3`}>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            © 2025 Fresh Box. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-xs ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-red-400' 
                    : 'text-gray-500 hover:text-green-600'
                } transition-colors`}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Simple social icon renderer
function renderSocialIcon(icon: string) {
  switch (icon) {
    case 'instagram':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
      );
    default:
      return null;
  }
}
