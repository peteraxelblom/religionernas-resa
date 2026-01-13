'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Level } from '@/types/level';
import PlayerAvatar from './PlayerAvatar';

interface LevelNode {
  id: string;
  x: number;
  y: number;
  completed: boolean;
  religion: Level['religion'];
}

interface JourneyPathProps {
  levels: Level[];
  completedLevelIds: string[];
  currentLevelId?: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  avatarId?: string;
}

const religionColors: Record<Level['religion'], { primary: string; secondary: string }> = {
  shared: { primary: '#8b5cf6', secondary: '#a78bfa' }, // purple
  judaism: { primary: '#3b82f6', secondary: '#60a5fa' }, // blue
  christianity: { primary: '#f59e0b', secondary: '#fbbf24' }, // amber/orange
  islam: { primary: '#10b981', secondary: '#34d399' }, // emerald/green
};

export default function JourneyPath({
  levels,
  completedLevelIds,
  currentLevelId,
  containerRef,
  avatarId,
}: JourneyPathProps) {
  const [levelNodes, setLevelNodes] = useState<LevelNode[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Calculate positions of all level nodes
  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const nodes: LevelNode[] = [];

      levels.forEach((level) => {
        // Find the level card element by its ID
        const levelElement = containerRef.current?.querySelector(
          `[data-level-id="${level.id}"]`
        );

        if (levelElement) {
          const rect = levelElement.getBoundingClientRect();
          nodes.push({
            id: level.id,
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
            completed: completedLevelIds.includes(level.id),
            religion: level.religion,
          });
        }
      });

      setLevelNodes(nodes);
      setDimensions({
        width: containerRect.width,
        height: containerRect.height,
      });
    };

    // Initial calculation
    const timer = setTimeout(updatePositions, 100);

    // Recalculate on resize
    window.addEventListener('resize', updatePositions);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
    };
  }, [levels, completedLevelIds, containerRef]);

  // Generate path segments between consecutive levels in the same religion
  // This creates clean vertical connections instead of a spider web
  const pathSegments = useMemo(() => {
    const segments: {
      id: string;
      d: string;
      completed: boolean;
      religion: Level['religion'];
    }[] = [];

    // Group levels by religion and sort by order
    const religionGroups: Record<string, typeof levels> = {};
    levels.forEach((level) => {
      if (!religionGroups[level.religion]) {
        religionGroups[level.religion] = [];
      }
      religionGroups[level.religion].push(level);
    });

    // Only connect consecutive levels within each religion group
    Object.values(religionGroups).forEach((groupLevels) => {
      const sorted = [...groupLevels].sort((a, b) => a.order - b.order);

      for (let i = 0; i < sorted.length - 1; i++) {
        const fromLevel = sorted[i];
        const toLevel = sorted[i + 1];

        const fromNode = levelNodes.find((n) => n.id === fromLevel.id);
        const toNode = levelNodes.find((n) => n.id === toLevel.id);

        if (fromNode && toNode) {
          // Simple straight line (vertical connector)
          const d = `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;

          segments.push({
            id: `${fromLevel.id}-${toLevel.id}`,
            d,
            completed: fromNode.completed,
            religion: fromLevel.religion,
          });
        }
      }
    });

    return segments;
  }, [levels, levelNodes]);

  // Calculate total path length for animation
  const totalPathLength = useMemo(() => {
    return levelNodes.reduce((total, node, i) => {
      if (i === 0) return 0;
      const prev = levelNodes[i - 1];
      return total + Math.sqrt(
        Math.pow(node.x - prev.x, 2) + Math.pow(node.y - prev.y, 2)
      );
    }, 0);
  }, [levelNodes]);

  // Find current level node position for avatar overlay
  const currentNode = levelNodes.find((n) => n.id === currentLevelId);

  if (levelNodes.length === 0 || dimensions.width === 0) {
    return null;
  }

  return (
    <>
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      width={dimensions.width}
      height={dimensions.height}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Gradient definitions for each religion */}
        {Object.entries(religionColors).map(([religion, colors]) => (
          <linearGradient
            key={religion}
            id={`path-gradient-${religion}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
        ))}

        {/* Glow filter */}
        <filter id="path-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Draw path segments */}
      {pathSegments.map((segment) => (
        <g key={segment.id}>
          {/* Background path (dashed for incomplete) */}
          <motion.path
            d={segment.d}
            fill="none"
            stroke={segment.completed ? `url(#path-gradient-${segment.religion})` : '#d1d5db'}
            strokeWidth={segment.completed ? 4 : 2}
            strokeLinecap="round"
            strokeDasharray={segment.completed ? 'none' : '8 8'}
            opacity={segment.completed ? 1 : 0.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />

          {/* Glow effect for completed paths */}
          {segment.completed && (
            <motion.path
              d={segment.d}
              fill="none"
              stroke={`url(#path-gradient-${segment.religion})`}
              strokeWidth={8}
              strokeLinecap="round"
              opacity={0.3}
              filter="url(#path-glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          )}
        </g>
      ))}

      {/* Node indicators (small dots at level positions) - skip current level */}
      {levelNodes.map((node, index) => (
        node.id === currentLevelId ? null : (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={5}
            fill={
              node.completed
                ? religionColors[node.religion].primary
                : '#9ca3af'
            }
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.03 + 0.2 }}
          />
        )
      ))}
    </svg>

      {/* Player avatar at current level - displayed as DOM overlay for rich styling */}
      {currentNode && (
        <motion.div
          className="absolute z-20 pointer-events-none"
          style={{
            left: currentNode.x - 24,
            top: currentNode.y - 24,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
        >
          <PlayerAvatar
            avatarId={avatarId}
            size="lg"
            isAnimating={true}
            showGlow={true}
          />

          {/* "Du är här" label */}
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-xs font-bold text-purple-600 bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
              Du är här!
            </span>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
