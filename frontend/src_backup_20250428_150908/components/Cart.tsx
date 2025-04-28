"use client"

import { useState } from "react"
import ReactConfetti from "react-confetti"
import { useCart } from "../contexts/CartContext"
import { Trash2, Plus, Minus } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Cart = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const { items, removeFromCart, updateQuantity, subtotal } = useCart()
  const navigate = useNavigate()

  const handlePlaceOrder = () => {
    setShowConfetti(true)
    setTimeout(() => {
      setShowConfetti(false)
      navigate("/cart")
    }, 3000)
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
          {items.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <ul className="mb-4 space-y-3">
                {items.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <div className="text-sm text-gray-500">${item.price.toFixed(2)} × {item.quantity}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 border rounded">
                          <button 
                            onClick={() => updateQuantity(item.id, item.type, Math.max(1, item.quantity - 1))}
                            className="p-1 text-gray-500 hover:bg-gray-100"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-2">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:bg-gray-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id, item.type)}
                          className="p-1 text-red-500 rounded hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between mb-4 font-bold">
                <span>Total:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="w-full px-4 py-2 text-white transition-colors bg-green-500 rounded-md hover:bg-green-600"
              >
                Go to Checkout
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Cart