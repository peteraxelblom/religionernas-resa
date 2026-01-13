'use client';

import { motion } from 'framer-motion';
import { avatars, Avatar } from '@/data/avatars';
import PlayerAvatar from './PlayerAvatar';

interface AvatarPickerProps {
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
  showLabels?: boolean;
  compact?: boolean;
}

export default function AvatarPicker({
  selectedAvatarId,
  onSelect,
  showLabels = true,
  compact = false,
}: AvatarPickerProps) {
  return (
    <div className={`grid ${compact ? 'grid-cols-6 gap-2' : 'grid-cols-3 gap-4'}`}>
      {avatars.map((avatar, index) => (
        <motion.button
          key={avatar.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(avatar.id)}
          className={`
            relative flex flex-col items-center p-3 rounded-xl
            transition-all duration-200
            ${
              selectedAvatarId === avatar.id
                ? 'bg-purple-100 border-2 border-purple-500 shadow-lg'
                : 'bg-gray-50 border-2 border-transparent hover:border-purple-300 hover:bg-purple-50'
            }
          `}
        >
          <PlayerAvatar
            avatarId={avatar.id}
            size={compact ? 'sm' : 'md'}
            showGlow={selectedAvatarId === avatar.id}
          />

          {showLabels && (
            <>
              <span className="mt-2 text-sm font-medium text-gray-800">
                {avatar.name}
              </span>
              {!compact && (
                <span className="text-xs text-gray-500 text-center mt-1">
                  {avatar.description}
                </span>
              )}
            </>
          )}

          {/* Selected indicator */}
          {selectedAvatarId === avatar.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-xs">✓</span>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

// Modal version for avatar selection
interface AvatarPickerModalProps {
  isOpen: boolean;
  currentAvatarId: string;
  onSelect: (avatarId: string) => void;
  onClose: () => void;
}

export function AvatarPickerModal({
  isOpen,
  currentAvatarId,
  onSelect,
  onClose,
}: AvatarPickerModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Välj din avatar
        </h2>

        <AvatarPicker
          selectedAvatarId={currentAvatarId}
          onSelect={(id) => {
            onSelect(id);
            onClose();
          }}
        />

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Avbryt
        </button>
      </motion.div>
    </motion.div>
  );
}
