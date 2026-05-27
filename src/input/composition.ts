import { useCallback, useState } from 'react';

export function useCompositionTracker() {
  const [isComposing, setIsComposing] = useState(false);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  return {
    isComposing,
    handleCompositionStart,
    handleCompositionEnd,
  };
}
