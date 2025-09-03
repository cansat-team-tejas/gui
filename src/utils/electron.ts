// Utility functions for Electron integration

/**
 * Check if the app is running in Electron environment
 */
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

/**
 * Safely call Electron API with fallback for web environment
 */
export const safeElectronCall = async <T>(
  electronCall: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> => {
  if (isElectron()) {
    try {
      return await electronCall();
    } catch (error) {
      console.error('Electron API call failed:', error);
      return fallback;
    }
  }
  console.warn('Electron API not available, running in web mode');
  return fallback;
};

/**
 * Mock telemetry data for development
 */
export const generateMockTelemetry = () => ({
  altitude: Math.random() * 10000,
  speed: Math.random() * 100,
  temperature: Math.random() * 50 - 10,
  pressure: Math.random() * 1000 + 900,
  latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
  longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
  timestamp: Date.now(),
});
