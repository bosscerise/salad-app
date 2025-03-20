import { useState } from 'react';
import Header from '../../components/Header';
import HeroSection from '../../components/HeroSection/HeroSection';
import FeaturedSalads from '../../components/FeaturedSalads/FeaturedSalads';
import Testimonials from '../../components/Testimonials/Testimonials';
import PricingSection from '../../components/PricingSection/PricingSection';
import ContactSection from '../../components/ContactSection/ContactSection';
import Footer from '../../components/Footer/Footer';
import { navigation } from '../../data/navigation';

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // For authentication in the header component
  // const [isAuthenticated] = useState(false);
  // const [userName] = useState('John Doe');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addToCart = (_id: number) => {
    setCartCount(prevCount => prevCount + 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="min-h-screen text-gray-800 bg-gradient-to-br from-amber-50 via-lime-50 to-emerald-50">
      <Header 
        cartItems={cartCount}
      />
      <main>
        <HeroSection showConfetti={showConfetti} />
        <FeaturedSalads addToCart={addToCart} />
        <Testimonials />
        <PricingSection />
        <ContactSection />
      </main>
      <Footer navigation={navigation} />
    </div>
  );
}
