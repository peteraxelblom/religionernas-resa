'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Level } from '@/types/level';

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

  // Generate path segments between connected levels
  const pathSegments = useMemo(() => {
    const segments: {
      id: string;
      d: string;
      completed: boolean;
      religion: Level['religion'];
    }[] = [];

    // Sort levels by order to ensure correct path
    const sortedLevels = [...levels].sort((a, b) => a.order - b.order);

    sortedLevels.forEach((level) => {
      if (!level.requiredLevel) return;

      const fromNode = levelNodes.find((n) => n.id === level.requiredLevel);
      const toNode = levelNodes.find((n) => n.id === level.id);

      if (fromNode && toNode) {
        // Create a curved path between nodes
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        const controlOffset = 20; // Curve amount

        // Determine curve direction based on relative position
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const perpX = -dy / Math.sqrt(dx * dx + dy * dy) * controlOffset;
        const perpY = dx / Math.sqrt(dx * dx + dy * dy) * controlOffset;

        const d = `M ${fromNode.x} ${fromNode.y} Q ${midX + perpX} ${midY + perpY} ${toNode.x} ${toNode.y}`;

        segments.push({
          id: `${level.requiredLevel}-${level.id}`,
          d,
          completed: fromNode.completed,
          religion: level.religion,
        });
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

  if (levelNodes.length === 0 || dimensions.width === 0) {
    return null;
  }

  return (
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

      {/* Node indicators (small dots at level positions) */}
      {levelNodes.map((node, index) => (
        <motion.circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={node.id === currentLevelId ? 8 : 5}
          fill={
            node.completed
              ? religionColors[node.religion].primary
              : node.id === currentLevelId
              ? '#8b5cf6'
              : '#9ca3af'
          }
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.03 + 0.2 }}
        />
      ))}

      {/* Current level pulse indicator */}
      {currentLevelId && levelNodes.find((n) => n.id === currentLevelId) && (
        <motion.circle
          cx={levelNodes.find((n) => n.id === currentLevelId)!.x}
          cy={levelNodes.find((n) => n.id === currentLevelId)!.y}
          r={15}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth={2}
          animate={{
            r: [15, 25, 15],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </svg>
  );
}
