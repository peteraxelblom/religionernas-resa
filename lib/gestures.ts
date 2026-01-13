/**
 * Gesture utilities for swipe and drag interactions
 * Uses @use-gesture/react for gesture detection
 */

// Swipe thresholds
export const SWIPE_THRESHOLD = 100; // px - minimum distance to trigger swipe
export const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity to trigger swipe

// Drag thresholds for multiple choice
export const DRAG_SNAP_DISTANCE = 50; // px - distance to snap to target
export const DRAG_CANCEL_VELOCITY = 0.5; // Velocity threshold to cancel drag

// Card rotation based on drag
export const MAX_ROTATION = 15; // degrees - max card tilt during drag
export const ROTATION_FACTOR = 0.1; // How much the card rotates per px of drag

/**
 * Calculate card rotation based on horizontal drag position
 */
export function calculateRotation(offsetX: number): number {
  const rotation = offsetX * ROTATION_FACTOR;
  return Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, rotation));
}

/**
 * Determine swipe direction based on velocity and offset
 * Returns 'left', 'right', or null if not a valid swipe
 */
export function getSwipeDirection(
  offsetX: number,
  velocityX: number
): 'left' | 'right' | null {
  const hasSwipeVelocity = Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD;
  const hasSwipeDistance = Math.abs(offsetX) > SWIPE_THRESHOLD;

  if (!hasSwipeVelocity && !hasSwipeDistance) {
    return null;
  }

  // Use velocity direction if fast enough, otherwise use offset direction
  if (hasSwipeVelocity) {
    return velocityX > 0 ? 'right' : 'left';
  }

  return offsetX > 0 ? 'right' : 'left';
}

/**
 * Get opacity for swipe indicator based on drag progress
 */
export function getSwipeIndicatorOpacity(offsetX: number): number {
  const progress = Math.abs(offsetX) / SWIPE_THRESHOLD;
  return Math.min(1, progress);
}

/**
 * Get color based on swipe direction (for true/false)
 * Right = Sant (green), Left = Falskt (red)
 */
export function getSwipeColor(direction: 'left' | 'right' | null): string {
  if (direction === 'right') return 'rgb(34, 197, 94)'; // green-500
  if (direction === 'left') return 'rgb(239, 68, 68)'; // red-500
  return 'transparent';
}

/**
 * Calculate spring animation config based on swipe velocity
 * Faster swipes = more dramatic exit animation
 */
export function getExitSpringConfig(velocity: number) {
  const speed = Math.abs(velocity);
  return {
    stiffness: 300 + speed * 100,
    damping: 30 - Math.min(10, speed * 5),
    mass: 1,
  };
}

/**
 * Get card exit position based on swipe direction
 */
export function getCardExitPosition(
  direction: 'left' | 'right',
  windowWidth: number
): { x: number; rotate: number } {
  const exitX = direction === 'right' ? windowWidth + 200 : -windowWidth - 200;
  const exitRotate = direction === 'right' ? 30 : -30;
  return { x: exitX, rotate: exitRotate };
}

/**
 * Device shake detection for hint activation
 */
let lastShakeTime = 0;
const SHAKE_THRESHOLD = 15;
const SHAKE_COOLDOWN = 1000; // ms

export function setupShakeDetection(onShake: () => void): () => void {
  if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
    return () => {};
  }

  const handleMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const { x, y, z } = acceleration;
    if (x === null || y === null || z === null) return;

    const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    if (totalAcceleration > SHAKE_THRESHOLD && now - lastShakeTime > SHAKE_COOLDOWN) {
      lastShakeTime = now;
      onShake();
    }
  };

  window.addEventListener('devicemotion', handleMotion);
  return () => window.removeEventListener('devicemotion', handleMotion);
}
