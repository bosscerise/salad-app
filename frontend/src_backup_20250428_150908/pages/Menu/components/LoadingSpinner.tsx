import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Animated Spinners */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-20 h-20 border-4 border-transparent rounded-full border-t-emerald-500 border-r-emerald-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
        <motion.div
          className="w-16 h-16 border-4 border-transparent rounded-full border-t-emerald-400 border-r-emerald-400"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
        
        {/* Center Icon */}
        <div className="absolute text-3xl">🥗</div>
      </div>
      
      {/* Loading Text */}
      <motion.p 
        className="mt-6 text-xl font-medium text-emerald-700 dark:text-emerald-400"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        Loading fresh salads...
      </motion.p>
    </div>
  );
}
