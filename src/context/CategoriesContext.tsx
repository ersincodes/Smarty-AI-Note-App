"use client";

import { Category } from "@prisma/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type CategoriesContextType = {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refreshCategories: () => Promise<void>;
};

const CategoriesContext = createContext<CategoriesContextType | undefined>(
  undefined,
);

// Set cache expiration time to 5 minutes
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000;

export function CategoriesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  const fetchCategories = useCallback(
    async (force = false) => {
      // Skip if already fetching
      if (isFetchingRef.current) return;

      const now = Date.now();
      // If data is fresh and not forced, don't refetch
      if (
        !force &&
        categories.length > 0 &&
        now - lastFetchTimeRef.current < CACHE_EXPIRATION_TIME
      ) {
        return;
      }

      try {
        isFetchingRef.current = true;
        setLoading(true);
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }
        const data = await response.json();
        setCategories(data.categories);
        lastFetchTimeRef.current = Date.now();
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch categories"),
        );
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [categories.length],
  );

  useEffect(() => {
    fetchCategories();
    // We exclude fetchCategories from the dependency array to avoid re-fetching due to itself changing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCategories = useCallback(async () => {
    await fetchCategories(true);
  }, [fetchCategories]);

  return (
    <CategoriesContext.Provider
      value={{ categories, loading, error, refreshCategories }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}
