export const locationService = {
  getCurrentPosition: async () => ({ latitude: 0, longitude: 0 }),
  watchPosition: (callback: Function) => {},
  stopWatching: () => {},
};