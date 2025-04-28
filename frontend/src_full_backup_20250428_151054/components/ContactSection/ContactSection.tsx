import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

export default function ContactSection() {
  const { isDarkMode } = useTheme();
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      
      // Reset after showing success message
      setTimeout(() => {
        setSubmitted(false);
        setFormState({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: 'General Inquiry',
          message: '',
        });
      }, 5000);
    }, 1500);
  };

  return (
    <section 
      id="contact" 
      className={`py-20 px-6 relative overflow-hidden ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-white to-green-50 text-gray-900'
      }`}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Background decorative elements */}
        <div 
          className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode ? 'bg-red-900/10' : 'bg-green-600/10'
          }`}
        ></div>
        <div 
          className={`absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode ? 'bg-red-900/10' : 'bg-green-600/10'
          }`}
        ></div>
        
        {/* Food illustrations */}
        <div className="hidden md:block absolute top-20 -left-6 text-5xl transform rotate-12 opacity-10">🥗</div>
        <div className="hidden md:block absolute bottom-20 -right-6 text-5xl transform -rotate-12 opacity-10">🥑</div>
        <div className="hidden md:block absolute top-40 right-20 text-4xl opacity-10">🥬</div>
        
        {/* Subtle pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(${isDarkMode ? '#ffffff22' : '#00000011'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
            isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-green-100 text-green-700'
          }`}>
            Get In Touch
          </span>
          <h2 className={`mt-4 text-4xl md:text-5xl font-bold tracking-tight ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <span className={isDarkMode ? 'text-red-400' : 'text-green-600'}>We're Here</span> For You
          </h2>
          <p className={`mt-4 text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Questions, feedback, or just want to say hello? We'd love to hear from you!
          </p>
        </div>

        {/* Main content area */}
        <div className="grid md:grid-cols-5 gap-10 items-start">
          {/* Contact info sidebar */}
          <div className="md:col-span-2 space-y-8">
            {/* Contact methods */}
            <div className={`p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-md'
            }`}>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Contact Information
              </h3>
              
              <div className="mt-6 space-y-5">
                {/* Email */}
                <a 
                  href="mailto:hello@saladshark.com" 
                  className={`flex items-start gap-4 group ${
                    isDarkMode ? 'hover:text-red-400' : 'hover:text-green-600'
                  } transition-colors`}
                >
                  <div className={`p-3 rounded-full ${
                    isDarkMode ? 'bg-gray-700' : 'bg-green-50'
                  }`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-green-600'}`} 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email</div>
                    <div className="group-hover:underline">hello@saladshark.com</div>
                  </div>
                </a>

                {/* Phone */}
                <a 
                  href="tel:+1234567890" 
                  className={`flex items-start gap-4 group ${
                    isDarkMode ? 'hover:text-red-400' : 'hover:text-green-600'
                  } transition-colors`}
                >
                  <div className={`p-3 rounded-full ${
                    isDarkMode ? 'bg-gray-700' : 'bg-green-50'
                  }`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-green-600'}`} 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Phone</div>
                    <div className="group-hover:underline">(123) 456-7890</div>
                  </div>
                </a>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    isDarkMode ? 'bg-gray-700' : 'bg-green-50'
                  }`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-green-600'}`} 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Address</div>
                    <div>123 Fresh Ave., Suite 400<br />San Francisco, CA 94107</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business hours */}
            <div className={`p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-md'
            }`}>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Business Hours
              </h3>
              
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Monday - Friday</span>
                  <span className="font-medium">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Saturday</span>
                  <span className="font-medium">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Sunday</span>
                  <span className="font-medium">10:00 AM - 6:00 PM</span>
                </div>
              </div>
              
              <div className={`mt-6 p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-green-50'
              }`}>
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-green-600'}`} 
                    fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
                      clipRule="evenodd" />
                  </svg>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    We respond within 24 hours
                  </span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className={`p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-md'
            }`}>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Connect With Us
              </h3>
              
              <div className="mt-4 flex gap-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((platform) => (
                  <a
                    key={platform}
                    href={`https://${platform}.com/saladshark`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-full ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } transition-colors`}
                  >
                    <span className="sr-only">{platform}</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      {platform === 'facebook' && (
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      )}
                      {platform === 'twitter' && (
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      )}
                      {platform === 'instagram' && (
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      )}
                      {platform === 'linkedin' && (
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      )}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className={`md:col-span-3 p-8 rounded-2xl ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
          }`}>
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                <div className={`p-4 rounded-full ${
                  isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <svg className={`w-12 h-12 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className={`mt-4 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Message Sent!
                </h3>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Thank you for reaching out. We'll get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className={`text-xl md:text-2xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Send us a message
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first-name" className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      First name
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      name="firstName"
                      value={formState.firstName}
                      onChange={handleChange}
                      required
                      className={`mt-2 w-full rounded-lg p-3 focus:outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500'
                          : 'bg-white border border-gray-300 focus:ring-2 focus:ring-green-500/50 focus:border-green-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Last name
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      name="lastName"
                      value={formState.lastName}
                      onChange={handleChange}
                      required
                      className={`mt-2 w-full rounded-lg p-3 focus:outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500'
                          : 'bg-white border border-gray-300 focus:ring-2 focus:ring-green-500/50 focus:border-green-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      required
                      className={`mt-2 w-full rounded-lg p-3 focus:outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500'
                          : 'bg-white border border-gray-300 focus:ring-2 focus:ring-green-500/50 focus:border-green-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className={`mt-2 w-full rounded-lg p-3 focus:outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500'
                          : 'bg-white border border-gray-300 focus:ring-2 focus:ring-green-500/50 focus:border-green-500'
                      }`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="subject" className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formState.subject}
                      onChange={handleChange}
                      className={`mt-2 w-full rounded-lg p-3 focus:outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500'
                          : 'bg-white border border-gray-300 focus:ring-2 focus:ring-green-500/50 focus:border-green-500'
                      }`}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Career">Career Opportunity</option>
                      <option value="Support">Customer Support</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formState.message}
                      onChange={handleChange}
                      required
                      placeholder="How can we help you?"
                      className={`mt-2 w-full rounded-lg p-3 focus:outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500'
                          : 'bg-white border border-gray-300 focus:ring-2 focus:ring-green-500/50 focus:border-green-500'
                      } resize-none`}
                    />
                  </div>
                </div>

                {/* Privacy notice and submit button */}
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    By submitting this form, you agree to our{' '}
                    <a 
                      href="/privacy" 
                      className={`${
                        isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-green-600 hover:text-green-700'
                      } underline`}
                    >
                      Privacy Policy
                    </a>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3.5 rounded-lg font-medium relative overflow-hidden transition-all ${
                      isDarkMode 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    } shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
