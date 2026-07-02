export const resetters = new Set<() => void>();

export const resetAllStores = () => {
  resetters.forEach((reset) => reset());
};
