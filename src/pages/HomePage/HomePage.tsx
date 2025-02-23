"use client"

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
//ChevronDownIcon,
const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Products', href: '#products' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Contact', href: '#contact' },
]

const testimonials = [
  {
    name: 'Talia Taylor',
    role: 'Food Critic @ Taste Magazine',
    image: '/avatars/talia.jpg',
    quote: 'The freshest salads I’ve ever had delivered. Simply amazing!',
  },
  {
    name: 'Alex Chen',
    role: 'Fitness Coach',
    image: '/avatars/alex.jpg',
    quote: 'Perfect for my clients who need healthy meal options.',
  },
  {
    name: 'Sarah Martinez',
    role: 'Busy Professional',
    image: '/avatars/sarah.jpg',
    quote: 'Convenient, healthy, and delicious. What more could you ask for?',
  },
]

const pricingPlans = [
  {
    name: 'Basic',
    price: 29,
    period: 'week',
    features: ['3 salads per week', 'Free delivery', 'Weekly menu rotation'],
  },
  {
    name: 'Pro',
    price: 79,
    period: 'month',
    features: [
      '12 salads per month',
      'Free delivery',
      'Monthly menu rotation',
      'Custom ingredients',
      'Priority delivery'
    ],
    popular: true,
  },
  {
    name: 'Family',
    price: 149,
    period: 'month',
    features: [
      '20 salads per month',
      'Free delivery',
      'Monthly menu rotation',
      'Custom ingredients',
      'Priority delivery',
      'Family size portions',
      'Special dietary options'
    ],
  },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen max-w-max bg-gradient-to-br from-emerald-700 via-teal-800 to-cyan-950 text-white">
      {/* Mobile Navigation */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="fixed inset-0 bg-black/80" onClick={() => setMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-emerald-900 p-6 transform transition-transform duration-300 ease-in-out" 
             style={{ transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)' }}>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">Salad Shack</span>
            <button
              className="p-2 rounded-full bg-emerald-400 text-emerald-950 hover:bg-emerald-300 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="mt-8 space-y-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-2 px-4 rounded-lg hover:bg-emerald-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop Navigation */}
      

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-6 text-center overflow-hidden">
          <div className={`max-w-3xl mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-12'
          }`}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-slide-up">
              Fresh & Healthy
              <span className="block text-emerald-300 mt-2">Delivered Daily</span>
            </h1>
            <p className="mt-6 text-lg text-emerald-100 max-w-2xl mx-auto animate-fade-slide">
              Delicious, nutritious salads delivered right to your door.
            </p>
            <a
              href="menu"
              className="mt-8 inline-block px-8 py-3 bg-emerald-400 text-emerald-950 rounded-full 
                       hover:bg-emerald-300 transition-all duration-300 hover:scale-105 
                       font-semibold animate-scale-in"
            >
              Get Started
            </a>
            {/* Add Hero Image */}
            <div className="mt-12 relative max-w-4xl mx-auto animate-float">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent z-10" />
              <img
                src="/hero.jpeg"
                alt="Fresh gourmet salad with mixed greens and seasonal ingredients"
                className="w-full h-auto rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
        </div>
      </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto animate-slide-up">
            <span className="text-emerald-300 font-semibold">Testimonials</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">Loved by Health Enthusiasts</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3 stagger-delay">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="p-6 rounded-xl bg-emerald-900/50 backdrop-blur-sm 
                         hover:shadow-lg transition-all duration-300 
                         hover:-translate-y-1 animate-scale-in"
              >
                  <p className="text-emerald-100 italic">"{testimonial.quote}"</p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-800" />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-emerald-300">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-emerald-300 font-semibold">Pricing</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold">Choose Your Perfect Plan</h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-6 rounded-xl bg-emerald-900/50 backdrop-blur-sm transition-all ${
                    plan.popular ? 'ring-2 ring-emerald-400 scale-105' : 'ring-1 ring-emerald-800'
                  }`}
                >
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-emerald-300">/{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-emerald-100">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#"
                    className={`mt-6 block text-center py-2 px-4 rounded-full font-semibold ${
                      plan.popular 
                        ? 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300' 
                        : 'bg-emerald-800 hover:bg-emerald-700'
                    } transition-colors`}
                  >
                    Choose {plan.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold">Contact Us</h2>
            <p className="mt-2 text-emerald-100">Have questions? We'd love to hear from you.</p>
          </div>
          <form className="mt-12 max-w-xl mx-auto animate-fade-slide">
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  { id: 'first-name', label: 'First name', type: 'text' },
                  { id: 'last-name', label: 'Last name', type: 'text' },
                  { id: 'email', label: 'Email', type: 'email', colSpan: 'sm:col-span-2' },
                ].map((field) => (
                  <div key={field.id} className={field.colSpan}>
                    <label htmlFor={field.id} className="block text-sm font-medium">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      className="mt-2 w-full rounded-lg bg-emerald-900/50 border border-emerald-800 p-3 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-2 w-full rounded-lg bg-emerald-900/50 border border-emerald-800 p-3 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-8 w-full sm:w-auto px-8 py-3 bg-emerald-400 text-emerald-950 rounded-full hover:bg-emerald-300 transition-colors font-semibold"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-800/20 py-12 px-6 animate-fade-slide">
        <div className="max-w-7xl mx-auto flex flex-col md:systemflex-row items-center justify-between gap-8">
          <p className="text-emerald-200 text-sm">© 2025 Salad Shark. All rights reserved.</p>
          <nav className="flex gap-6">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-emerald-200 hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}