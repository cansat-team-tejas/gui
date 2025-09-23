/**
 * Helper utilities for XBee Store
 */

/**
 * Add item to beginning of array with bounded size
 */
export const boundedUnshift = <T>(
  array: T[],
  item: T,
  maxSize: number
): void => {
  array.unshift(item);
  if (array.length > maxSize) {
    array.splice(maxSize);
  }
};

/**
 * Compute exponential moving average data rate
 */
export const computeEmaDataRate = (
  currentRate: number,
  currentTime: Date,
  lastUpdate: Date | null,
  alpha: number = 0.1
): { rate: number; lastUpdate: Date } => {
  if (!lastUpdate) {
    return { rate: currentRate, lastUpdate: currentTime };
  }

  const timeDiff = (currentTime.getTime() - lastUpdate.getTime()) / 1000; // seconds
  const newRate =
    timeDiff > 0
      ? alpha * (1 / timeDiff) + (1 - alpha) * currentRate
      : currentRate;

  return { rate: newRate, lastUpdate: currentTime };
};

/**
 * Calculate next mission timing based on current data
 */
export const nextMissionTiming = (
  missionStartTime: Date | null,
  currentTime: Date
): { missionStartTime: Date; totalMissionTime: number } => {
  if (!missionStartTime) {
    return {
      missionStartTime: currentTime,
      totalMissionTime: 0,
    };
  }

  const totalTime = (currentTime.getTime() - missionStartTime.getTime()) / 1000; // seconds
  return {
    missionStartTime,
    totalMissionTime: totalTime,
  };
};
