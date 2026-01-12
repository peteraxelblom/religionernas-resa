'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  xOffset: number;
  size: number;
  duration: number;
  delay: number;
  emoji: string;
}

const PARTICLE_EMOJIS = ['✡️', '✝️', '☪️', '📚', '✨', '🌟'];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    xOffset: Math.random() * 10 - 5,
    size: 0.6 + Math.random() * 0.8,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * 10,
    emoji: PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length],
  }));
}

interface ParticleBackgroundProps {
  particleCount?: number;
  className?: string;
}

export default function ParticleBackground({
  particleCount = 12,
  className = '',
}: ParticleBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  // Use lazy initialization for particles based on particleCount
  const [particles] = useState<Particle[]>(() => generateParticles(particleCount));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Standard Next.js hydration pattern
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            opacity: 0,
            scale: particle.size,
          }}
          animate={{
            y: [`${particle.y}vh`, `${particle.y - 30}vh`, `${particle.y}vh`],
            x: [
              `${particle.x}vw`,
              `${particle.x + particle.xOffset}vw`,
              `${particle.x}vw`,
            ],
            opacity: [0, 0.15, 0.1, 0.15, 0],
            rotate: [0, 10, -10, 5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute text-2xl"
          style={{ fontSize: `${particle.size * 1.5}rem` }}
        >
          {particle.emoji}
        </motion.div>
      ))}

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/20 via-transparent to-pink-50/20" />
    </div>
  );
}
