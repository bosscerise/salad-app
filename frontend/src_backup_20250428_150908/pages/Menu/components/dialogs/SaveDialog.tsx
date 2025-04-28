import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { UserSaladRecord } from '../../../../pb/types';

interface SaveDialogProps {
  saladName: string;
  setSaladName: (name: string) => void;
  savedSalads: UserSaladRecord[];
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
}

const SaveDialog: React.FC<SaveDialogProps> = ({
  saladName,
  setSaladName,
  savedSalads,
  isSaving,
  onSave,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md p-6 bg-white rounded-xl dark:bg-gray-800"
      >
        <button 
          onClick={onClose}
          className="absolute p-1 text-gray-400 top-4 right-4 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        
        <h3 className="mb-4 text-xl font-bold dark:text-white">Save Your Salad</h3>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Salad Name
          </label>
          <input
            type="text"
            value={saladName}
            onChange={e => setSaladName(e.target.value)}
            placeholder={`Salad ${savedSalads.length + 1}`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            If left blank, we'll auto-name it for you.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Salad'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SaveDialog;
