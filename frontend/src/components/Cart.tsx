"use client"

import { useState } from "react"
import ReactConfetti from "react-confetti"

const Cart = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Hardcoded cart items
  const cart = [
    { id: 1, name: "Caesssar Salad", quantity: 2, price: 12.99 },
    { id: 2, name: "Greek Salad", quantity: 1, price: 10.99 },
    { id: 3, name: "Cobb Salad", quantity: 3, price: 14.99 }
  ]

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handlePlaceOrder = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  return (
    <div className="p-6 mt-8 bg-white rounded-lg shadow-md">
      {showConfetti && <ReactConfetti recycle={false} />}
      <h2 className="flex items-center justify-between mb-4 text-2xl font-semibold">
        Your Cart
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-sm text-blue-500 hover:text-blue-700">
          {isCollapsed ? "Expand" : "Collapse"}
        </button>
      </h2>
      {!isCollapsed && (
        <>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <ul className="mb-4">
                {cart.map((item) => (
                  <li key={item.id} className="flex items-center justify-between mb-2">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between mb-4 font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="w-full px-4 py-2 text-white transition-colors bg-green-500 rounded-md hover:bg-green-600"
              >
                Place Order
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Cart