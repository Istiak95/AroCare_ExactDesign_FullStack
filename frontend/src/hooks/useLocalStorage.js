import { useEffect, useState } from "react";

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;

      const parsed = JSON.parse(raw);
      if (Array.isArray(initialValue) && !Array.isArray(parsed)) {
        window.localStorage.removeItem(key);
        return initialValue;
      }
      return parsed;
    } catch (error) {
      console.warn(`AroCare reset invalid localStorage value: ${key}`, error);
      window.localStorage.removeItem(key);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`AroCare could not save localStorage value: ${key}`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
