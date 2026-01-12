'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NameInputModalProps {
  onSubmit: (name: string) => void;
}

export default function NameInputModal({ onSubmit }: NameInputModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Skriv ditt namn för att börja!');
      return;
    }

    if (trimmedName.length > 20) {
      setError('Namnet får max vara 20 tecken');
      return;
    }

    onSubmit(trimmedName);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="name-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-gradient-to-b from-purple-900/95 to-indigo-900/95 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          key="name-modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          {/* Welcome icon */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🌟
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            Välkommen!
          </h1>

          <p className="text-gray-600 mb-6">
            Börja din resa genom religionernas värld
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
                Vad heter du?
              </label>
              <input
                id="playerName"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Skriv ditt namn..."
                autoFocus
                autoComplete="off"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors"
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              Börja spela! 🚀
            </motion.button>
          </form>

          {/* Decorative elements */}
          <div className="mt-6 flex justify-center gap-2 text-2xl opacity-50">
            <span>✡️</span>
            <span>✝️</span>
            <span>☪️</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
