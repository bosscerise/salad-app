"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "../contexts/CartContext"
import ReactConfetti from "react-confetti"

interface Salad {
  id: number
  name: string
  price: number
  ingredients: string[]
  calories: number
  image: string
  description: string
}

interface MenuGridProps {
  salads: Salad[]
}

const MenuGrid: React.FC<MenuGridProps> = ({ salads }) => {
  const { addToCart } = useCart()
  const [showConfetti, setShowConfetti] = useState(false)

  const handleAddToCart = (salad: Salad) => {
    addToCart({ id: salad.id, name: salad.name, price: salad.price, quantity: 1 })
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {showConfetti && <ReactConfetti recycle={false} />}
      {salads.map((salad) => (
        <div key={salad.id} className="p-6 bg-white rounded-lg shadow-md">
          <img
            src={salad.image || "/placeholder.svg"}
            alt={salad.name}
            className="object-cover w-full h-48 mb-4 rounded-md"
          />
          <h2 className="mb-2 text-xl font-semibold">{salad.name}</h2>
          <p className="mb-2 text-gray-600">{salad.description}</p>
          <p className="mb-2 font-bold">${salad.price.toFixed(2)}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {salad.ingredients.map((ingredient, index) => (
              <span key={index} className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                {ingredient}
              </span>
            ))}
          </div>
          <p className="mb-4 text-sm text-gray-500">{salad.calories} calories</p>
          <button
            onClick={() => handleAddToCart(salad)}
            className="px-4 py-2 text-white transition-colors bg-green-500 rounded-md hover:bg-green-600"
          >
            Add to Cart
          </button>
        </div>
      ))}
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Build Your Own</h2>
        <button
          onClick={() => alert("Custom salad builder coming soon!")}
          className="px-4 py-2 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Customize
        </button>
      </div>
    </div>
  )
}

export default MenuGrid

