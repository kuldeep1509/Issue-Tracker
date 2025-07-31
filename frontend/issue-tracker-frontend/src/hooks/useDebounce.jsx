import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * The debounced value will only update after the specified delay.
 *
 * @param {any} value The value to debounce.
 * @param {number} delay The delay in milliseconds before the debounced value updates.
 * @returns {any} The debounced value.
 */
function useDebounce(value, delay) {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: clear the timeout if value changes before the delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run if value or delay changes

  return debouncedValue;
}

export default useDebounce;
