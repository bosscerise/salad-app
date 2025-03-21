export interface Salad {
  id: number;
  name: string; 
  tagline: string;
  price: number;
  image: string;
  description: string;
  ingredients: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
  badges?: string[];
  allergens?: string[];
  bestWithDressing?: string;
  preparationTime?: string;
}

export const featuredSalads: Salad[] = [
  {
    id: 1,
    name: "Nonna's Caesar",
    tagline: "A classic reimagined",
    price: 8.50,
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80",
    description: "Our signature Caesar salad with house-made dressing, crafted from an old family recipe. Crisp romaine hearts, shaved parmesan, and artisanal sourdough croutons create the perfect balance of creamy, crunchy, and savory flavors.",
    ingredients: ["Romaine Lettuce", "Parmesan Cheese", "Sourdough Croutons", "House Caesar Dressing", "Lemon Zest", "Fresh Cracked Pepper"],
    nutritionalInfo: {
      calories: 320,
      protein: 12,
      carbs: 18,
      fat: 22
    },
    tags: ["Vegetarian", "High Protein", "Staff Favorite"],
    badges: ["Bestseller", "Locally Sourced"],
    allergens: ["Dairy", "Gluten", "Eggs"],
    bestWithDressing: "Classic Caesar",
    preparationTime: "3 mins"
  },
  {
    id: 2,
    name: "Tropical Twist",
    tagline: "A vacation in every bite",
    price: 9.00,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
    description: "Transport yourself to an island paradise with this vibrant blend of juicy mango, creamy avocado, and crunchy jicama. Tossed with baby spinach and drizzled with our honey-lime vinaigrette for a refreshing escape from the ordinary.",
    ingredients: ["Baby Spinach", "Fresh Mango", "Avocado", "Jicama", "Red Bell Pepper", "Toasted Coconut", "Honey-Lime Vinaigrette"],
    nutritionalInfo: {
      calories: 290,
      protein: 5,
      carbs: 32,
      fat: 18
    },
    tags: ["Vegan", "Gluten-Free", "Antioxidant-Rich"],
    badges: ["New", "Seasonal"],
    allergens: ["Tree Nuts"],
    bestWithDressing: "Honey-Lime Vinaigrette",
    preparationTime: "4 mins"
  },
  {
    id: 3,
    name: "Spicy Fiesta",
    tagline: "Bold flavors that dance",
    price: 9.50,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80",
    description: "Ignite your taste buds with this zesty Southwestern-inspired salad. Black beans, roasted corn, and cherry tomatoes sit atop a bed of crisp romaine, finished with avocado, tortilla strips, and our smoky chipotle-lime dressing.",
    ingredients: ["Romaine Lettuce", "Black Beans", "Fire-Roasted Corn", "Cherry Tomatoes", "Red Onion", "Avocado", "Tortilla Strips", "Chipotle-Lime Dressing"],
    nutritionalInfo: {
      calories: 380,
      protein: 14,
      carbs: 42,
      fat: 19
    },
    tags: ["Vegetarian", "Protein-Rich", "Spicy"],
    badges: ["Customer Favorite", "High Fiber"],
    allergens: ["Corn"],
    bestWithDressing: "Chipotle-Lime",
    preparationTime: "5 mins"
  }
  // ,
  // {
  //   id: 4,
  //   name: "Green Goddess",
  //   tagline: "Nourishment in every leaf",
  //   price: 10.50,
  //   image: "https://images.unsplash.com/photo-1604497181015-76590d828449?w=400&q=80",
  //   description: "A nutrient powerhouse featuring kale, spinach, and arugula tossed with quinoa, avocado, cucumber, and broccoli florets. Dressed with our creamy herb-packed Green Goddess dressing for a revitalizing meal that's as delicious as it is nutritious.",
  //   ingredients: ["Kale", "Baby Spinach", "Arugula", "Quinoa", "Avocado", "Cucumber", "Broccoli", "Sunflower Seeds", "Green Goddess Dressing"],
  //   nutritionalInfo: {
  //     calories: 340,
  //     protein: 10,
  //     carbs: 28,
  //     fat: 24
  //   },
  //   tags: ["Superfood", "Gluten-Free", "Vegan-Optional"],
  //   badges: ["Nutrient Dense", "Energy Boost"],
  //   allergens: ["Seeds"],
  //   bestWithDressing: "Green Goddess",
  //   preparationTime: "4 mins"
  // },
  // {
  //   id: 5,
  //   name: "Mediterranean Bliss",
  //   tagline: "The essence of coastal living",
  //   price: 9.75,
  //   image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80",
  //   description: "Embrace the Mediterranean lifestyle with this colorful salad of cherry tomatoes, cucumber, kalamata olives, and feta cheese. Served with red onion, bell peppers, and our oregano-infused olive oil dressing for an authentic taste of the Mediterranean coast.",
  //   ingredients: ["Mixed Greens", "Cherry Tomatoes", "Cucumber", "Kalamata Olives", "Feta Cheese", "Red Onion", "Bell Pepper", "Oregano Vinaigrette"],
  //   nutritionalInfo: {
  //     calories: 310,
  //     protein: 9,
  //     carbs: 16,
  //     fat: 25
  //   },
  //   tags: ["Vegetarian", "Mediterranean Diet", "Heart Healthy"],
  //   badges: ["Authentic Recipe", "Heart Healthy"],
  //   allergens: ["Dairy"],
  //   bestWithDressing: "Oregano Vinaigrette",
  //   preparationTime: "3 mins"
  // },
  // {
  //   id: 6,
  //   name: "Harvest Bowl",
  //   tagline: "Seasonal bounty in a bowl",
  //   price: 11.00,
  //   image: "https://images.unsplash.com/photo-1511357840105-748c95f0a7c9?w=400&q=80",
  //   description: "Celebrate the flavors of the season with roasted sweet potatoes, Brussels sprouts, and wild rice, topped with dried cranberries and maple-glazed walnuts. Our apple cider vinaigrette brings this hearty, satisfying bowl together.",
  //   ingredients: ["Mixed Greens", "Roasted Sweet Potato", "Brussels Sprouts", "Wild Rice", "Dried Cranberries", "Maple-Glazed Walnuts", "Apple Cider Vinaigrette"],
  //   nutritionalInfo: {
  //     calories: 420,
  //     protein: 8,
  //     carbs: 56,
  //     fat: 22
  //   },
  //   tags: ["Vegan", "Whole Grain", "Seasonal"],
  //   badges: ["Autumn Special", "Filling"],
  //   allergens: ["Tree Nuts"],
  //   bestWithDressing: "Apple Cider Vinaigrette",
  //   preparationTime: "5 mins"
  // }
];
