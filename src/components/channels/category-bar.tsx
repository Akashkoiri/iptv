"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RawApiCategory {
  id: string;
  name: string;
  description?: string;
}

const ALL_CATEGORY: CategoryItem = {
  id: "all",
  name: "All Channels",
  description: "Explore all live broadcast streams across all genres",
};

const CATEGORIES_API_URL = "https://iptv-org.github.io/api/categories.json";

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  initialCategories?: CategoryItem[];
}

export function CategoryBar({
  selectedCategory,
  onSelectCategory,
  initialCategories,
}: CategoryBarProps) {
  const [fetchedCategories, setFetchedCategories] = useState<CategoryItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Derive categories from initialCategories prop if available, or dynamically fetched list
  const categories = useMemo(() => {
    const rawList =
      initialCategories && initialCategories.length > 0
        ? initialCategories
        : fetchedCategories;

    const hasAll = rawList.some((c) => c.id.toLowerCase() === "all");
    return hasAll ? rawList : [ALL_CATEGORY, ...rawList];
  }, [initialCategories, fetchedCategories]);

  // Fetch categories dynamically from API if not supplied via initialCategories
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      return;
    }

    let isMounted = true;

    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        let items: RawApiCategory[] = [];
        try {
          // Fetch from local API route first which returns active categories with counts
          const localRes = await fetch("/api/categories");
          if (localRes.ok) {
            items = await localRes.json();
          } else {
            throw new Error(`Status ${localRes.status}`);
          }
        } catch {
          // Fallback to official IPTV-org API
          const res = await fetch(CATEGORIES_API_URL);
          if (res.ok) {
            items = await res.json();
          }
        }

        if (!isMounted || !items || items.length === 0) return;

        // Format categories
        const formatted: CategoryItem[] = items
          .filter((cat) => cat.id.toLowerCase() !== "all")
          .map((cat) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
          }));

        setFetchedCategories(formatted);
      } catch (err) {
        console.error("Failed to fetch categories from API:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [initialCategories]);

  // Check scroll bounds
  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollability, { passive: true });
    window.addEventListener("resize", checkScrollability);

    return () => {
      el.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [checkScrollability, categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full group py-2">
      {/* Left Edge Gradient Fade */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#090a10] via-[#090a10]/80 to-transparent z-10" />
      )}

      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-white/[0.12] shadow-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}

      {/* Horizontal Category Pill List */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar scroll-smooth px-1"
      >
        {categories.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.id.toLowerCase();
          const isAdult = cat.id.toLowerCase() === "xxx";

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              title={cat.description || cat.name}
              className={`shrink-0 flex items-center rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                isSelected
                  ? isAdult
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold shadow-md shadow-rose-600/30 scale-102"
                    : "bg-white text-zinc-950 font-semibold shadow-sm shadow-white/10 scale-102"
                  : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-100 border border-white/[0.07] hover:border-white/[0.14]"
              }`}
            >
              <span>{cat.name}</span>
              {isAdult && (
                <span className="ml-1.5 rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                  18+
                </span>
              )}
            </button>
          );
        })}

        {isLoading && categories.length <= 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 shrink-0">
            <Loader2 className="size-3 animate-spin text-rose-500" />
            <span>Loading genres...</span>
          </div>
        )}
      </div>

      {/* Right Edge Gradient Fade */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#090a10] via-[#090a10]/80 to-transparent z-10" />
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-white/[0.12] shadow-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}
