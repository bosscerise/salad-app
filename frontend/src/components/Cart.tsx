"use client"

import { useState } from "react"
import ReactConfetti from "react-confetti"
import { useCart } from "../contexts/CartContext"
import { useCreateOrder } from "../hooks/useQueries"
import pb from "../pb/pocketbase"
import { Loader } from "lucide-react"

const Cart = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Use the CartContext to get cart items
  const { cart, removeFromCart, clearCart } = useCart()
  
  // Use TanStack Query mutation for creating orders
  const createOrderMutation = useCreateOrder()

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handlePlaceOrder = async () => {
    try {
      // Create order in the database using TanStack Query mutation
      const orderData = {
        user_id: pb.authStore.isValid ? pb.authStore.model?.id : undefined,
        items: JSON.stringify(cart.reduce((acc, item) => {
          acc[item.id] = item.quantity;
          return acc;
        }, {} as Record<string, number>)),
        total: total,
        status: 'pending' as const,
        delivery: false // Default to pickup
      };
      
      await createOrderMutation.mutateAsync(orderData);
      
      // Show success animation
      setShowConfetti(true)
      
      // Clear cart after successful order
      clearCart();
      
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (error) {
      console.error("Error placing order:", error);
      // You could add toast notification for errors here
    }
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
                    <div className="flex items-center gap-2">
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="px-2 text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between mb-4 font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={createOrderMutation.isPending}
                className="w-full px-4 py-2 text-white transition-colors bg-green-500 rounded-md hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Cart