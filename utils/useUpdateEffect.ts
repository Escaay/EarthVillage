import React, { useEffect, useRef } from 'react';
const useUpdateEffect = (
  effect: React.EffectCallback,
  deps: React.DependencyList,
) => {
  let isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    return effect();
  }, deps);
};
export default useUpdateEffect;
