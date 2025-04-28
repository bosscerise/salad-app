// src/components/OrderCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Package, CheckCircle, XCircle, Truck, RefreshCcw } from 'lucide-react';

interface OrderWithDetails {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created: string;
  total: number;
  delivery: boolean;
  formattedItems?: Array<{
    id: string;
    name: string;
    emoji: string;
    quantity: number;
    price: number;
    categoryName?: string;
  }>;
}

interface OrderCardProps {
  order: OrderWithDetails;
  onReorder: (order: OrderWithDetails) => void;
  showReorderButton?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onReorder, showReorderButton = true }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden bg-white rounded-lg shadow-md"
    >
      <div className="p-4 border-b border-gray-100 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-500">
                Order #{order.id.substring(0, 8)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </span>
              {order.delivery && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <Truck className="w-3 h-3 mr-1" />
                  Delivery
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(order.created).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded-full hover:bg-green-50"
            >
              {expanded ? 'Hide Details' : 'View Details'}
            </button>
            
            {showReorderButton && order.status === 'completed' && (
              <button 
                onClick={() => onReorder(order)}
                className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded-full hover:bg-green-700"
              >
                <RefreshCcw className="w-3 h-3 mr-1" />
                Reorder
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Expanded order details */}
      {expanded && (
        <div className="p-4 bg-gray-50 sm:p-6">
          <h3 className="mb-3 text-sm font-medium text-gray-500">Order Items</h3>
          <div className="mb-4 space-y-2">
            {order.formattedItems?.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2 text-xl">{item.emoji}</span>
                  <span>{item.name}</span>
                  {item.categoryName && (
                    <span className="ml-2 text-sm text-gray-500">({item.categoryName})</span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500">x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 mt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OrderCard;