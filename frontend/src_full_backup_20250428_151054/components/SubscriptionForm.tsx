"use client"

import { useState } from "react"

const SubscriptionForm = () => {
  const [plan, setPlan] = useState<"weekly" | "monthly">("weekly")
  const [saladsPerCycle, setSaladsPerCycle] = useState(3)

  // Simple mock submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Subscription successful!
Plan: ${plan}
Salads per ${plan}: ${saladsPerCycle}`)
  }

  return (
    <div className="p-6 mt-8 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-semibold">Subscribe to Salad Shack</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Plan:</label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as "weekly" | "monthly")}
            className="w-full p-2 border rounded"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Salads per {plan}:</label>
          <input
            type="number"
            value={saladsPerCycle}
            onChange={(e) => setSaladsPerCycle(Number.parseInt(e.target.value))}
            min="1"
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Subscribe
        </button>
      </form>
    </div>
  )
}

export default SubscriptionForm