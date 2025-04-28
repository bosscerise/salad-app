export const pricingPlans = [
  {
    name: "Starter",
    price: 0,
    period: "week",
    description: "Try us out with a complimentary salad to see if we're right for you.",
    highlight: "Perfect for first-time customers",
    features: [
      { text: "1 free salad", included: true },
      { text: "Access to standard menu", included: true },
      { text: "Online ordering", included: true },
      { text: "Schedule flexibility", included: false },
      { text: "Nutrition coaching", included: false },
      { text: "Customization options", included: false },
      { text: "Priority delivery", included: false }
    ],
    badge: "Free Trial",
    callToAction: "Try For Free"
  },
  {
    name: "Wellness",
    price: 49,
    annualPrice: 39,
    period: "month",
    description: "Our most popular plan for health-conscious individuals.",
    highlight: "Great for busy professionals",
    features: [
      { text: "12 salads per month (3/week)", included: true },
      { text: "Full menu access", included: true },
      { text: "Customization options", included: true },
      { text: "Schedule flexibility", included: true },
      { text: "Basic nutrition info", included: true },
      { text: "Premium ingredients", included: false },
      { text: "Priority delivery", included: false }
    ],
    popular: true,
    callToAction: "Get Started"
  },
  {
    name: "Premium",
    price: 79,
    annualPrice: 63,
    period: "month",
    description: "The ultimate salad experience with exclusive benefits.",
    highlight: "Best value for salad enthusiasts",
    features: [
      { text: "20 salads per month (5/week)", included: true },
      { text: "Extended premium menu", included: true },
      { text: "Advanced customization", included: true },
      { text: "Flexible schedule changes", included: true },
      { text: "Detailed nutrition analysis", included: true },
      { text: "Premium ingredients", included: true },
      { text: "Priority delivery windows", included: true }
    ],
    badge: "Best Value",
    callToAction: "Go Premium"
  }
];
