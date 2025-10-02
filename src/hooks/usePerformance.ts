import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { SYSTEM_CONFIG } from '../config/system';

// Hook para debounce de inputs
export const useDebounce = <T>(value: T, delay: number = SYSTEM_CONFIG.PERFORMANCE.DEBOUNCE_DELAY): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para cache de cálculos
export const useCache = <T>(key: string, factory: () => T, ttl: number = SYSTEM_CONFIG.PERFORMANCE.CACHE.TTL_MS): T => {
  const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());
  
  return useCallback(() => {
    const now = Date.now();
    const cached = cacheRef.current.get(key);
    
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value;
    }
    
    const value = factory();
    cacheRef.current.set(key, { value, timestamp: now });
    
    return value;
  }, [key, factory, ttl])();
};

// Hook para lazy loading
export const useLazyLoad = (threshold: number = SYSTEM_CONFIG.PERFORMANCE.LAZY_LOADING.THRESHOLD) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { elementRef, isVisible };
};

// Hook para otimização de re-renders
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

// Hook para memoização de valores calculados
export const useMemoizedValue = <T>(value: T, deps: React.DependencyList): T => {
  return useMemo(() => value, deps);
};

// Hook para controle de performance
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      setMetrics(prev => ({
        renderCount: renderCount.current,
        lastRenderTime: renderTime,
        averageRenderTime: (prev.averageRenderTime + renderTime) / 2
      }));
    };
  });

  return metrics;
};

// Hook para otimização de listas
export const useVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    totalHeight: items.length * itemHeight
  };
};

// Hook para otimização de formulários
export const useFormOptimization = () => {
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const markDirty = useCallback(() => setIsDirty(true), []);
  const markClean = useCallback(() => setIsDirty(false), []);
  
  const validateField = useCallback((field: string, value: any, rules: any) => {
    // Implementar validação baseada nas regras
    const errors: string[] = [];
    
    if (rules.required && !value) {
      errors.push('Campo obrigatório');
    }
    
    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(`Mínimo de ${rules.minLength} caracteres`);
    }
    
    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors.push(`Máximo de ${rules.maxLength} caracteres`);
    }
    
    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push('Formato inválido');
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: errors[0] || ''
    }));
    
    return errors.length === 0;
  }, []);
  
  return {
    isDirty,
    markDirty,
    markClean,
    validationErrors,
    validateField,
    hasErrors: Object.values(validationErrors).some(error => error !== '')
  };
};

// Hook para otimização de impressão
export const usePrintOptimization = () => {
  const [printQueue, setPrintQueue] = useState<Array<{ id: string; type: 'full' | 'reduced'; data: any }>>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const addToPrintQueue = useCallback((type: 'full' | 'reduced', data: any) => {
    const id = `${type}-${Date.now()}`;
    setPrintQueue(prev => [...prev, { id, type, data }]);
    return id;
  }, []);
  
  const processPrintQueue = useCallback(async () => {
    if (isPrinting || printQueue.length === 0) return;
    
    setIsPrinting(true);
    
    try {
      for (const item of printQueue) {
        // Processar impressão
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setPrintQueue([]);
    } finally {
      setIsPrinting(false);
    }
  }, [isPrinting, printQueue]);
  
  useEffect(() => {
    if (printQueue.length > 0 && !isPrinting) {
      processPrintQueue();
    }
  }, [printQueue, isPrinting, processPrintQueue]);
  
  return {
    addToPrintQueue,
    printQueue,
    isPrinting,
    queueLength: printQueue.length
  };
};
