import {useState, useEffect} from 'react';

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  },
) {
  // Default serializer for JSON
  const defaultSerializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  };

  const {serialize, deserialize} = serializer || defaultSerializer;

  // Initialize state from localStorage or default value
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return deserialize(item);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      if (state === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, serialize(state));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state, serialize]);

  return [state, setState] as const;
}

// Specialized hook for Set objects (since they don't serialize well with JSON)
export function usePersistentSet<T extends string>(
  key: string,
  defaultValue: Set<T> = new Set(),
) {
  return usePersistentState(key, defaultValue, {
    serialize: (set: Set<T>) => JSON.stringify(Array.from(set)),
    deserialize: (value: string) => new Set(JSON.parse(value)),
  });
}

// Hook for boolean values with better localStorage handling
export function usePersistentBoolean(
  key: string,
  defaultValue: boolean = false,
) {
  return usePersistentState(key, defaultValue, {
    serialize: (value: boolean) => value.toString(),
    deserialize: (value: string) => value === 'true',
  });
}
