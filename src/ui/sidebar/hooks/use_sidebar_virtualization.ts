import { useState, useEffect, useRef } from 'react';
import { ITEM_HEIGHT, OVERSCAN } from '../utils/sidebar_utils';
import { VirtualRow } from '../logic/use_sidebar_logic';

export const useSidebarVirtualization = (flattenedVisibleNodes: VirtualRow[]) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollResetRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTopRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [flattenedVisibleNodes.length]);

  // Virtualization calculations
  const totalHeight = flattenedVisibleNodes.length * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    flattenedVisibleNodes.length - 1,
    Math.floor((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  );
  
  const visibleItems = flattenedVisibleNodes.slice(startIndex, endIndex + 1);

  return {
    containerRef,
    scrollResetRef,
    lastScrollTopRef,
    scrollTop,
    setScrollTop,
    containerHeight,
    totalHeight,
    startIndex,
    visibleItems
  };
};
