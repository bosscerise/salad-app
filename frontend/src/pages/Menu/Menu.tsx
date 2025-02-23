import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet"

interface Salad {
  id: number;
  name: string;
  price: number;
  description: string;
  ingredients: string[];
  calories: number;
  image: string;
}

function Menu() {
  const [cartCount, setCartCount] = useState(0);
  const [activeTab, setActiveTab] = useState('pre-made');

  const preMadeSalads: Salad[] = [
    {
      id: 1,
      name: "Nonna's Caesar",
      price: 8.50,
      description: "Our signature Caesar with homemade croutons and a family-secret dressing recipe",
      ingredients: ["Romaine Lettuce", "Parmesan", "Croutons", "Caesar Dressing"],
      calories: 380,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80",
    },
    {
      id: 2,
      name: "Tropical Twist",
      price: 9.00,
      description: "A refreshing blend of sweet pineapple and succulent shrimp on a bed of mixed greens",
      ingredients: ["Mixed Greens", "Shrimp", "Pineapple", "Citrus Vinaigrette"],
      calories: 320,
      image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=200&q=80",
    },
    {
      id: 3,
      name: "Spicy Fiesta",
      price: 9.50,
      description: "A zesty Mexican-inspired salad with black beans, corn, and chipotle lime dressing",
      ingredients: ["Romaine Lettuce", "Black Beans", "Corn", "Chipotle Lime Dressing"],
      calories: 420,
      image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=200&q=80",
    },
  ];

  const addToCart = () => setCartCount(cartCount + 1);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-green-50 to-lime-50">
      {/* Hero Section */}
      <div className="relative py-12 mb-8 text-center bg-center bg-cover sm:py-24 sm:mb-12" 
           style={{
             backgroundImage: 'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1800&q=80")',
             height: '400px'
           }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative z-10 px-4">
          <h1 className="mb-4 font-serif text-4xl font-bold text-white sm:text-6xl animate-slide-up">
            Fresh & Vibrant Moments
          </h1>
          <p className="max-w-3xl mx-auto text-lg sm:text-2xl text-white/90 animate-fade-slide">
            More than just salads - we create daily moments of joy and wellness. Experience the perfect blend of taste and health.
          </p>
        </div>
      </div>

      <div className="container px-4 mx-auto">
        {/* Cart and Tabs */}
        <div className="flex justify-between items-center mb-8 animate-fade-slide">
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('pre-made')}
              className={`px-6 py-3 text-lg font-medium transition-colors ${
                activeTab === 'pre-made' 
                ? 'text-green-700 border-b-2 border-green-700' 
                : 'text-gray-500 hover:text-gray-700'
              }`}>
              Pre-made Salads
            </button>
            <button 
              onClick={() => setActiveTab('build')}
              className={`px-6 py-3 text-lg font-medium transition-colors ${
                activeTab === 'build' 
                ? 'text-green-700 border-b-2 border-green-700' 
                : 'text-gray-500 hover:text-gray-700'
              }`}>
              Build Your Own
            </button>
          </div>
          <button className="flex items-center gap-3 px-5 py-3 transition-all rounded-full bg-amber-100 hover:bg-amber-200 shadow-md">
            <span className="text-2xl">🛒</span>
            <span className="font-semibold text-amber-900">{cartCount}</span>
          </button>
        </div>

        {/* Salad Grid */}
        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
          {preMadeSalads.map((salad) => (
            <div key={salad.id} 
                 className="overflow-hidden transition-all bg-lime-50 border-0 shadow-xl rounded-3xl hover:shadow-2xl hover:-translate-y-2">
              <div className="relative">
                <img src={salad.image} alt={salad.name} 
                     className="object-cover w-full h-64 transition-transform duration-300 rounded-t-3xl hover:scale-110" />
                <div className="absolute px-4 py-2 text-lg rounded-full shadow-lg bg-white/90 backdrop-blur top-4 right-4">
                  <span className="font-semibold text-green-700">${salad.price.toFixed(2)}</span>
                </div>
              </div>
              <Sheet>
                <SheetTrigger>Open</SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Are you absolutely sure?</SheetTitle>
                    <SheetDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              <div className="p-6">
                <h3 className="mb-3 font-serif text-2xl font-bold text-gray-800">{salad.name}</h3>
                <p className="text-gray-600 mb-5 leading-relaxed">{salad.description}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {salad.ingredients.map((ingredient, i) => (
                    <span key={i} 
                          className="px-4 py-2 text-sm font-medium text-green-800 transition-colors rounded-full bg-green-50 hover:bg-green-100">
                      {ingredient}
                    </span>
                  ))}
                </div>
                <div className="flex items-center mb-5 text-gray-600">
                  <span className="mr-2 text-lg">🌱</span>
                  <span>{salad.calories} calories</span>
                </div>
                <button
                  onClick={addToCart}
                  className="w-full py-4 text-lg font-semibold text-white transition-all shadow-md rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg"
                >
                  Add to Cart ✨
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Menu;