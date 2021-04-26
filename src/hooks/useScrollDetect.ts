import { throttle } from 'lodash';
import { useCallback, useMemo, useRef, useState } from 'react';

const useScrollDetect = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  const element = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (element.current) setIsScrolled(element.current.scrollTop > 0);
  }, []);

  const handleScrollThrottled = useMemo(() => throttle(handleScroll, 250), []);

  return {
    element,
    isScrolled,
    handleScroll: handleScrollThrottled,
  };
};

export default useScrollDetect;
