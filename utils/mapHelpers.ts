export const updateMap = <K extends unknown, V extends unknown>(
  x: Map<K, V>,
  k: K,
  func: (v: V | undefined) => V,
  deleteIf?: (v: V) => boolean
): void => {
  const newV = func(x.get(k));
  if (deleteIf && deleteIf(newV)) {
    x.delete(k);
  } else {
    x.set(k, newV);
  }
};
