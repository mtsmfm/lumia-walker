export const mergeMaps = <K extends unknown, V extends unknown>(
  xs: Map<K, V>[],
  func: (k: K, v1: V, v2: V) => V
): Map<K, V> => {
  return xs
    .flatMap((x) => [...x])
    .reduce((acc, [k, v]) => {
      if (acc.has(k)) {
        return acc.set(k, func(k, acc.get(k)!, v));
      } else {
        return acc.set(k, v);
      }
    }, new Map<K, V>());
};

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
